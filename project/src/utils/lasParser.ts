import { LASFile, Curve, Parameter, WellInfo } from '../types/wellLog';

export class LASParser {
  public static async parseLASFile(file: File): Promise<LASFile> {
    const content = await file.text();
    const lines = content.split('\n').map(line => line.trim());
    
    let currentSection = '';
    const well: Partial<WellInfo> = {};
    const curves: Curve[] = [];
    const parameters: Parameter[] = [];
    const other: string[] = [];
    const data: number[][] = [];
    
    let version = '2.0';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('~')) {
        currentSection = line.substring(1).charAt(0).toUpperCase();
        continue;
      }
      
      if (line.startsWith('#') || line === '') continue;
      
      switch (currentSection) {
        case 'V':
          if (line.includes('VERS')) {
            version = this.extractValue(line);
          }
          break;
          
        case 'W':
          this.parseWellSection(line, well);
          break;
          
        case 'C':
          const curve = this.parseCurveSection(line);
          if (curve) curves.push(curve);
          break;
          
        case 'P':
          const param = this.parseParameterSection(line);
          if (param) parameters.push(param);
          break;
          
        case 'O':
          if (line.trim()) other.push(line);
          break;
          
        case 'A':
          const dataRow = this.parseDataRow(line, curves.length);
          if (dataRow.length > 0) data.push(dataRow);
          break;
      }
    }
    
    return {
      id: crypto.randomUUID(),
      name: file.name,
      version,
      well: well as WellInfo,
      curves,
      parameters,
      other,
      data
    };
  }
  
  private static extractValue(line: string): string {
    const match = line.match(/\.([^:]+):/);
    return match ? match[1].trim() : '';
  }
  
  private static parseWellSection(line: string, well: Partial<WellInfo>): void {
    const parts = line.split('.');
    if (parts.length < 2) return;
    
    const mnemonic = parts[0].trim();
    const rest = parts[1];
    const colonIndex = rest.indexOf(':');
    
    if (colonIndex === -1) return;
    
    const value = rest.substring(0, colonIndex).trim();
    
    switch (mnemonic) {
      case 'WELL':
        well.wellName = value;
        break;
      case 'COMP':
        well.company = value;
        break;
      case 'FLD':
        well.field = value;
        break;
      case 'LOC':
        well.location = value;
        break;
      case 'PROV':
        well.province = value;
        break;
      case 'CNTY':
        well.country = value;
        break;
      case 'SRVC':
        well.serviceCompany = value;
        break;
      case 'DATE':
        well.date = value;
        break;
      case 'UWI':
        well.uwi = value;
        break;
      case 'API':
        well.api = value;
        break;
    }
  }
  
  private static parseCurveSection(line: string): Curve | null {
    const parts = line.split('.');
    if (parts.length < 2) return null;
    
    const mnemonic = parts[0].trim();
    const rest = parts[1];
    const colonIndex = rest.indexOf(':');
    
    if (colonIndex === -1) return null;
    
    const unitPart = rest.substring(0, colonIndex).trim();
    const description = rest.substring(colonIndex + 1).trim();
    
    return {
      mnemonic,
      unit: unitPart,
      description
    };
  }
  
  private static parseParameterSection(line: string): Parameter | null {
    const parts = line.split('.');
    if (parts.length < 2) return null;
    
    const mnemonic = parts[0].trim();
    const rest = parts[1];
    const colonIndex = rest.indexOf(':');
    
    if (colonIndex === -1) return null;
    
    const valuePart = rest.substring(0, colonIndex).trim();
    const description = rest.substring(colonIndex + 1).trim();
    
    // Try to parse as number
    const numValue = parseFloat(valuePart);
    const value = isNaN(numValue) ? valuePart : numValue;
    
    return {
      mnemonic,
      unit: '',
      value,
      description
    };
  }
  
  private static parseDataRow(line: string, expectedColumns: number): number[] {
    const values = line.trim().split(/\s+/);
    const numericValues: number[] = [];
    
    for (let i = 0; i < Math.min(values.length, expectedColumns); i++) {
      const rawValue = values[i];
      let val = parseFloat(rawValue);
      
      // Handle common null values in LAS files - keep them as valid numbers for now
      // We'll filter them out in the visualization component
      if (isNaN(val)) {
        // Only set to NaN if it's truly not a number
        val = NaN;
      } else if (rawValue === '-999.25' || rawValue === '-999' || rawValue === 'NULL') {
        // Mark null values but keep them as numbers for easier filtering
        val = -999.25;
      }
      
      numericValues.push(val);
    }
    
    return numericValues;
  }
  
  public static exportLAS(lasFile: LASFile): string {
    let output = '';
    
    // Version section
    output += '~Version Information\n';
    output += `VERS.                          ${lasFile.version}: CWLS log ASCII Standard\n`;
    output += 'WRAP.                          NO: One line per depth step\n';
    output += '\n';
    
    // Well section
    output += '~Well Information\n';
    output += `WELL.                          ${lasFile.well.wellName || 'UNKNOWN'}: Well Name\n`;
    output += `COMP.                          ${lasFile.well.company || 'UNKNOWN'}: Company\n`;
    output += `FLD.                           ${lasFile.well.field || 'UNKNOWN'}: Field\n`;
    output += `LOC.                           ${lasFile.well.location || 'UNKNOWN'}: Location\n`;
    output += `SRVC.                          ${lasFile.well.serviceCompany || 'UNKNOWN'}: Service Company\n`;
    output += `DATE.                          ${lasFile.well.date || new Date().toISOString().split('T')[0]}: Date\n`;
    output += '\n';
    
    // Curve section
    output += '~Curve Information\n';
    lasFile.curves.forEach(curve => {
      const mnemonic = curve.standardizedMnemonic || curve.mnemonic;
      const unit = curve.standardizedUnit || curve.unit;
      output += `${mnemonic.padEnd(30)} ${unit.padEnd(20)}: ${curve.description}\n`;
    });
    output += '\n';
    
    // Parameters section
    if (lasFile.parameters.length > 0) {
      output += '~Parameter Information\n';
      lasFile.parameters.forEach(param => {
        output += `${param.mnemonic.padEnd(30)} ${param.unit.padEnd(20)}: ${param.description}\n`;
      });
      output += '\n';
    }
    
    // Other section
    if (lasFile.other.length > 0) {
      output += '~Other Information\n';
      lasFile.other.forEach(line => {
        output += line + '\n';
      });
      output += '\n';
    }
    
    // Data section
    output += '~ASCII Log Data\n';
    lasFile.data.forEach(row => {
      output += row.map(val => val.toFixed(4).padStart(12)).join(' ') + '\n';
    });
    
    return output;
  }
}