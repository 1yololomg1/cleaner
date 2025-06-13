export interface LASFile {
  id: string;
  name: string;
  version: string;
  well: WellInfo;
  curves: Curve[];
  data: number[][];
  parameters: Parameter[];
  other: string[];
}

export interface WellInfo {
  wellName: string;
  company: string;
  field: string;
  location: string;
  province: string;
  country: string;
  serviceCompany: string;
  date: string;
  uwi: string;
  api: string;
}

export interface Curve {
  mnemonic: string;
  unit: string;
  description: string;
  standardizedMnemonic?: string;
  standardizedUnit?: string;
  confidenceScore?: number;
  serviceCompany?: string;
}

export interface Parameter {
  mnemonic: string;
  unit: string;
  value: string | number;
  description: string;
}

export interface ProcessingStep {
  id: string;
  name: string;
  algorithm: string;
  parameters: Record<string, any>;
  applied: boolean;
  timestamp: Date;
  confidenceScore: number;
}

export interface ValidationResult {
  curve: string;
  issues: ValidationIssue[];
  passed: boolean;
  score: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  severity: number;
  autoFixable: boolean;
}

export interface ProcessingReport {
  wellId: string;
  wellName: string;
  processingSteps: ProcessingStep[];
  validationResults: ValidationResult[];
  beforeStats: CurveStatistics[];
  afterStats: CurveStatistics[];
  mnemonicMappings: MnemonicMapping[];
  unitConversions: UnitConversion[];
  overallScore: number;
  timestamp: Date;
}

export interface CurveStatistics {
  curve: string;
  count: number;
  min: number;
  max: number;
  mean: number;
  std: number;
  nullCount: number;
  outlierCount: number;
}

export interface MnemonicMapping {
  original: string;
  standardized: string;
  confidence: number;
  serviceCompany: string;
  category: string;
}

export interface UnitConversion {
  curve: string;
  fromUnit: string;
  toUnit: string;
  conversionFactor: number;
  formula: string;
}

export type PlotType = 
  | 'scatterplot' | 'lineplot' | 'relplot' | 'barplot' | 'boxplot' 
  | 'violinplot' | 'stripplot' | 'swarmplot' | 'pointplot' | 'catplot'
  | 'histplot' | 'kdeplot' | 'ecdfplot' | 'rugplot' | 'displot'
  | 'regplot' | 'lmplot' | 'residplot' | 'heatmap' | 'clustermap'
  | 'correlation' | 'pairplot' | 'jointplot' | 'boxenplot' | 'countplot'
  | 'scatter2d' | 'scatter3d' | 'contour' | 'polar';