import { Curve } from '../types/wellLog';

export class RockPhysicsValidator {
  public static validateDepthIntegrity(depths: number[]): {
    issues: string[];
    passed: boolean;
  } {
    const issues: string[] = [];
    
    // Check for negative depths
    const negativeDepths = depths.filter(d => d < 0);
    if (negativeDepths.length > 0) {
      issues.push(`Found ${negativeDepths.length} negative depth values`);
    }
    
    // Check monotonic increasing
    let nonMonotonic = 0;
    for (let i = 1; i < depths.length; i++) {
      if (depths[i] < depths[i - 1]) {
        nonMonotonic++;
      }
    }
    if (nonMonotonic > 0) {
      issues.push(`Found ${nonMonotonic} non-monotonic depth points`);
    }
    
    // Check for large gaps
    let largeGaps = 0;
    const maxGap = Math.max(...depths) / 100; // 1% of total depth range
    for (let i = 1; i < depths.length; i++) {
      if (depths[i] - depths[i - 1] > maxGap) {
        largeGaps++;
      }
    }
    if (largeGaps > 0) {
      issues.push(`Found ${largeGaps} large depth gaps (>${maxGap.toFixed(1)} units)`);
    }
    
    return {
      issues,
      passed: issues.length === 0
    };
  }

  public static validateGammaRay(values: number[]): {
    issues: string[];
    passed: boolean;
  } {
    const issues: string[] = [];
    const validValues = values.filter(v => !isNaN(v) && v !== -999.25);
    
    if (validValues.length === 0) {
      issues.push('No valid gamma ray values found');
      return { issues, passed: false };
    }
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    
    if (min < 0) {
      issues.push(`Negative gamma ray values found (min: ${min.toFixed(2)})`);
    }
    
    if (max > 500) {
      issues.push(`Extremely high gamma ray values found (max: ${max.toFixed(2)} API)`);
    }
    
    return {
      issues,
      passed: issues.length === 0
    };
  }

  public static validateDensity(values: number[]): {
    issues: string[];
    passed: boolean;
  } {
    const issues: string[] = [];
    const validValues = values.filter(v => !isNaN(v) && v !== -999.25);
    
    if (validValues.length === 0) {
      issues.push('No valid density values found');
      return { issues, passed: false };
    }
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    
    if (min < 1.0) {
      issues.push(`Unrealistic low density values (min: ${min.toFixed(2)} g/cc)`);
    }
    
    if (max > 4.0) {
      issues.push(`Extremely high density values (max: ${max.toFixed(2)} g/cc)`);
    }
    
    // Check for Gardner's equation validation if porosity is available
    return {
      issues,
      passed: issues.length === 0
    };
  }

  public static validateNeutron(values: number[]): {
    issues: string[];
    passed: boolean;
  } {
    const issues: string[] = [];
    const validValues = values.filter(v => !isNaN(v) && v !== -999.25);
    
    if (validValues.length === 0) {
      issues.push('No valid neutron values found');
      return { issues, passed: false };
    }
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    
    if (min < -0.1) {
      issues.push(`Negative neutron porosity values (min: ${min.toFixed(3)})`);
    }
    
    if (max > 1.0) {
      issues.push(`Neutron porosity > 100% (max: ${(max * 100).toFixed(1)}%)`);
    }
    
    return {
      issues,
      passed: issues.length === 0
    };
  }

  public static validateResistivity(values: number[]): {
    issues: string[];
    passed: boolean;
  } {
    const issues: string[] = [];
    const validValues = values.filter(v => !isNaN(v) && v !== -999.25 && v > 0);
    
    if (validValues.length === 0) {
      issues.push('No valid resistivity values found');
      return { issues, passed: false };
    }
    
    const min = Math.min(...validValues);
    const max = Math.max(...validValues);
    
    if (min < 0.1) {
      issues.push(`Very low resistivity values (min: ${min.toFixed(2)} ohm-m)`);
    }
    
    if (max > 10000) {
      issues.push(`Extremely high resistivity values (max: ${max.toFixed(0)} ohm-m)`);
    }
    
    return {
      issues,
      passed: issues.length === 0
    };
  }

  public static validateCurveConsistency(curves: Curve[], data: number[][]): {
    issues: string[];
    passed: boolean;
  } {
    const issues: string[] = [];
    
    // Find density and neutron curves for consistency check
    const densityIdx = curves.findIndex(c => 
      ['RHOB', 'RHOZ', 'DEN'].includes(c.standardizedMnemonic || c.mnemonic));
    const neutronIdx = curves.findIndex(c => 
      ['NPHI', 'TNPH', 'NEU'].includes(c.standardizedMnemonic || c.mnemonic));
    
    if (densityIdx >= 0 && neutronIdx >= 0) {
      let inconsistentPoints = 0;
      for (let i = 0; i < data.length; i++) {
        const density = data[i][densityIdx];
        const neutron = data[i][neutronIdx];
        
        if (!isNaN(density) && !isNaN(neutron) && 
            density !== -999.25 && neutron !== -999.25) {
          // High density should correlate with low neutron (in tight rocks)
          if (density > 2.6 && neutron > 0.25) {
            inconsistentPoints++;
          }
        }
      }
      
      if (inconsistentPoints > data.length * 0.1) {
        issues.push(`${inconsistentPoints} points show density-neutron inconsistency`);
      }
    }
    
    return {
      issues,
      passed: issues.length === 0
    };
  }

  public static getValidationBounds(curveType: string): {
    min: number;
    max: number;
    typical: { min: number; max: number };
  } {
    const bounds = {
      'GR': { min: 0, max: 300, typical: { min: 20, max: 150 } },
      'RT': { min: 0.1, max: 10000, typical: { min: 0.5, max: 1000 } },
      'RHOB': { min: 1.0, max: 4.0, typical: { min: 1.8, max: 2.8 } },
      'NPHI': { min: -0.1, max: 0.8, typical: { min: 0.05, max: 0.4 } },
      'PE': { min: 0, max: 10, typical: { min: 1.5, max: 5.0 } },
      'SP': { min: -200, max: 200, typical: { min: -100, max: 50 } },
      'CAL': { min: 4, max: 20, typical: { min: 6, max: 12 } },
      'DT': { min: 40, max: 200, typical: { min: 55, max: 140 } }
    };
    
    return bounds[curveType] || { min: -Infinity, max: Infinity, typical: { min: 0, max: 100 } };
  }
}