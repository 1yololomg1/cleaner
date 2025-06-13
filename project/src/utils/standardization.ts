export class MnemonicStandardizer {
  private static readonly MNEMONIC_DATABASE = {
    'GR': ['GR', 'SGR', 'CGR', 'GAMMA', 'GAPI', 'GRD', 'GRS'],
    'RT': ['RT', 'ILD', 'MSFL', 'RES', 'RESIST', 'AT90', 'AT10'],
    'RHOB': ['RHOB', 'RHOZ', 'DEN', 'DENSITY', 'DENB', 'DENC'],
    'NPHI': ['NPHI', 'TNPH', 'NEU', 'NEUTRON', 'PHIN', 'PHIT'],
    'PE': ['PE', 'PEF', 'PHOTOELEC', 'PHOTO', 'PEA'],
    'SP': ['SP', 'SELFPOT', 'SPR', 'SPS'],
    'CAL': ['CAL', 'CALI', 'CALIPER', 'DCAL', 'HCAL'],
    'DT': ['DT', 'AC', 'SONIC', 'DTCO', 'DTC', 'TRANSIT'],
    'BS': ['BS', 'BIT', 'BITSIZE', 'DRILL'],
    'TEMP': ['TEMP', 'TEMPERATURE', 'BHT', 'BHTV']
  };

  private static readonly SERVICE_COMPANIES = {
    'SLB': ['Schlumberger', 'SLB', 'SCHLUMBERGER'],
    'HAL': ['Halliburton', 'HAL', 'HALIBURTON'],
    'BHI': ['Baker Hughes', 'BHI', 'BAKER', 'HUGHES'],
    'WFT': ['Weatherford', 'WFT', 'WEATH'],
    'NOV': ['National Oilwell', 'NOV', 'VARCO']
  };

  public static standardizeMnemonic(mnemonic: string, company?: string): {
    standardized: string;
    confidence: number;
    category: string;
  } {
    const cleanMnemonic = mnemonic.toUpperCase().trim();
    
    for (const [standard, variants] of Object.entries(this.MNEMONIC_DATABASE)) {
      const match = variants.find(variant => 
        cleanMnemonic === variant || 
        cleanMnemonic.includes(variant) ||
        variant.includes(cleanMnemonic)
      );
      
      if (match) {
        const confidence = cleanMnemonic === match ? 100 : 
                          cleanMnemonic === standard ? 95 : 85;
        
        return {
          standardized: standard,
          confidence,
          category: this.getCurveCategory(standard)
        };
      }
    }

    return {
      standardized: mnemonic,
      confidence: 0,
      category: 'UNKNOWN'
    };
  }

  private static getCurveCategory(mnemonic: string): string {
    const categories = {
      'GR': 'Gamma Ray',
      'RT': 'Resistivity',
      'RHOB': 'Density',
      'NPHI': 'Neutron',
      'PE': 'Photoelectric',
      'SP': 'Spontaneous Potential',
      'CAL': 'Caliper',
      'DT': 'Acoustic',
      'BS': 'Bit Size',
      'TEMP': 'Temperature'
    };
    return categories[mnemonic] || 'Other';
  }
}

export class UnitConverter {
  private static readonly CONVERSIONS = {
    // Gamma Ray
    'API': { 'CPS': 1.0, 'GAPI': 1.0, 'API': 1.0 },
    'CPS': { 'API': 1.0, 'GAPI': 1.0, 'CPS': 1.0 },
    'GAPI': { 'API': 1.0, 'CPS': 1.0, 'GAPI': 1.0 },
    
    // Resistivity
    'OHMM': { 'OHMFT': 3.28084, 'OHMM': 1.0 },
    'OHMFT': { 'OHMM': 0.3048, 'OHMFT': 1.0 },
    
    // Density
    'G/CC': { 'KG/M3': 1000.0, 'G/CM3': 1.0, 'G/CC': 1.0 },
    'KG/M3': { 'G/CC': 0.001, 'G/CM3': 0.001, 'KG/M3': 1.0 },
    'G/CM3': { 'G/CC': 1.0, 'KG/M3': 1000.0, 'G/CM3': 1.0 },
    
    // Depth
    'FT': { 'M': 0.3048, 'FT': 1.0 },
    'M': { 'FT': 3.28084, 'M': 1.0 },
    
    // Acoustic
    'US/FT': { 'US/M': 3.28084, 'MS/M': 0.003048, 'US/FT': 1.0 },
    'US/M': { 'US/FT': 0.3048, 'MS/M': 0.001, 'US/M': 1.0 },
    
    // Porosity
    'FRAC': { 'PERCENT': 100.0, 'FRAC': 1.0, 'V/V': 1.0 },
    'PERCENT': { 'FRAC': 0.01, 'PERCENT': 1.0, 'V/V': 0.01 },
    'V/V': { 'FRAC': 1.0, 'PERCENT': 100.0, 'V/V': 1.0 }
  };

  public static convertUnit(value: number, fromUnit: string, toUnit: string): {
    value: number;
    factor: number;
    formula: string;
  } {
    const from = fromUnit.toUpperCase();
    const to = toUnit.toUpperCase();
    
    if (from === to) {
      return { value, factor: 1.0, formula: `${from} = ${to}` };
    }

    const conversion = this.CONVERSIONS[from]?.[to];
    if (conversion) {
      return {
        value: value * conversion,
        factor: conversion,
        formula: `${from} × ${conversion} = ${to}`
      };
    }

    // Return original value if no conversion found
    return {
      value,
      factor: 1.0,
      formula: `No conversion available: ${from} to ${to}`
    };
  }

  public static getStandardUnit(curveType: string): string {
    const standards = {
      'GR': 'API',
      'RT': 'OHMM',
      'RHOB': 'G/CC',
      'NPHI': 'FRAC',
      'PE': 'BARNS/E',
      'SP': 'MV',
      'CAL': 'IN',
      'DT': 'US/FT',
      'DEPTH': 'FT'
    };
    return standards[curveType] || '';
  }
}