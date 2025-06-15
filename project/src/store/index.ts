import { create } from 'zustand';
import { LASFile, ProcessingOptions, VisualizationSettings, TrackConfiguration, User, ExportOptions, ConversionJob } from '../types';

interface AppState {
  files: LASFile[];
  activeFile: LASFile | null;
  processingOptions: ProcessingOptions;
  visualizationSettings: VisualizationSettings;
  isProcessing: boolean;
  processingProgress: number;
  selectedCurves: string[];
  user: User | null;
  showAuthModal: boolean;
  showPaymentModal: boolean;
  showExportModal: boolean;
  showFormatConverter: boolean;
  showHelpModal: boolean;
  conversionJobs: ConversionJob[];
  exportPreview: any;
  
  // Actions
  addFile: (file: LASFile) => void;
  removeFile: (id: string) => void;
  setActiveFile: (file: LASFile | null) => void;
  updateProcessingOptions: (options: Partial<ProcessingOptions>) => void;
  updateVisualizationSettings: (settings: Partial<VisualizationSettings>) => void;
  setProcessing: (status: boolean) => void;
  setProcessingProgress: (progress: number) => void;
  updateFile: (id: string, updates: Partial<LASFile>) => void;
  toggleCurveVisibility: (mnemonic: string) => void;
  updateTrackConfiguration: (trackId: number, config: Partial<TrackConfiguration>) => void;
  setSelectedCurves: (curves: string[]) => void;
  setUser: (user: User | null) => void;
  setShowAuthModal: (show: boolean) => void;
  setShowPaymentModal: (show: boolean) => void;
  setShowExportModal: (show: boolean) => void;
  setShowFormatConverter: (show: boolean) => void;
  setShowHelpModal: (show: boolean) => void;
  addConversionJob: (job: ConversionJob) => void;
  updateConversionJob: (id: string, updates: Partial<ConversionJob>) => void;
  setExportPreview: (preview: any) => void;
}

const defaultTracks: TrackConfiguration[] = [
  {
    id: 1,
    name: 'Natural Radioactivity',
    width: 120,
    curves: ['GR', 'SP', 'CGR'],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 2,
    name: 'Resistivity',
    width: 140,
    curves: ['RT', 'RXO', 'MSFL', 'LLS', 'LLD'],
    scale: 'logarithmic',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 3,
    name: 'Porosity',
    width: 140,
    curves: ['NPHI', 'RHOB', 'PEF', 'DT'],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 4,
    name: 'Caliper & Drilling',
    width: 120,
    curves: ['CALI', 'BS', 'ROP', 'WOB'],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  },
  {
    id: 5,
    name: 'Custom',
    width: 120,
    curves: [],
    scale: 'linear',
    gridLines: true,
    backgroundColor: '#1e293b'
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  files: [],
  activeFile: null,
  isProcessing: false,
  processingProgress: 0,
  selectedCurves: [],
  user: null,
  showAuthModal: false,
  showPaymentModal: false,
  showExportModal: false,
  showFormatConverter: false,
  showHelpModal: false,
  conversionJobs: [],
  exportPreview: null,
  
  visualizationSettings: {
    tracks: defaultTracks,
    depthRange: [0, 3000],
    showGrid: true,
    showDepthLabels: true,
    curveThickness: 2,
    backgroundColor: '#0f172a',
    syncZoom: true
  },
  
  processingOptions: {
    denoise: {
      enabled: true,
      method: 'savitzky_golay',
      windowSize: 11,
      polynomialOrder: 3,
      strength: 0.7,
      preserveSpikes: false
    },
    despike: {
      enabled: true,
      method: 'hampel',
      threshold: 3,
      windowSize: 7,
      replacementMethod: 'pchip'
    },
    validation: {
      enabled: true,
      physicalRanges: {
        'GR': { min: 0, max: 300 },
        'NPHI': { min: -0.15, max: 1.0 },
        'RHOB': { min: 1.0, max: 3.5 },
        'RT': { min: 0.1, max: 10000 },
        'CALI': { min: 4, max: 20 }
      },
      crossValidation: true,
      flagOutliers: true
    },
    mnemonics: {
      enabled: true,
      standard: 'api',
      autoStandardize: true,
      customMappings: {},
      preserveOriginal: true
    },
    depthAlignment: {
      enabled: true,
      referenceDepth: 0,
      shiftTolerance: 0.5,
      autoCorrect: false
    }
  },

  addFile: (file) => set((state) => ({ 
    files: [...state.files, file],
    activeFile: state.activeFile || file
  })),
  
  removeFile: (id) => set((state) => ({
    files: state.files.filter(f => f.id !== id),
    activeFile: state.activeFile?.id === id ? null : state.activeFile
  })),
  
  setActiveFile: (file) => set({ activeFile: file }),
  
  updateProcessingOptions: (options) => set((state) => ({
    processingOptions: { ...state.processingOptions, ...options }
  })),
  
  updateVisualizationSettings: (settings) => set((state) => ({
    visualizationSettings: { ...state.visualizationSettings, ...settings }
  })),
  
  setProcessing: (status) => set({ isProcessing: status }),
  
  setProcessingProgress: (progress) => set({ processingProgress: progress }),
  
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map(f => f.id === id ? { ...f, ...updates } : f),
    activeFile: state.activeFile?.id === id ? { ...state.activeFile, ...updates } : state.activeFile
  })),
  
  toggleCurveVisibility: (mnemonic) => set((state) => {
    if (!state.activeFile) return state;
    
    const updatedCurves = state.activeFile.curves.map(curve =>
      curve.mnemonic === mnemonic ? { ...curve, visible: !curve.visible } : curve
    );
    
    const updatedFile = { ...state.activeFile, curves: updatedCurves };
    
    return {
      files: state.files.map(f => f.id === updatedFile.id ? updatedFile : f),
      activeFile: updatedFile
    };
  }),
  
  updateTrackConfiguration: (trackId, config) => set((state) => ({
    visualizationSettings: {
      ...state.visualizationSettings,
      tracks: state.visualizationSettings.tracks.map(track =>
        track.id === trackId ? { ...track, ...config } : track
      )
    }
  })),
  
  setSelectedCurves: (curves) => set({ selectedCurves: curves }),
  
  setUser: (user) => set({ user }),
  
  setShowAuthModal: (show) => set({ showAuthModal: show }),
  
  setShowPaymentModal: (show) => set({ showPaymentModal: show }),
  
  setShowExportModal: (show) => set({ showExportModal: show }),
  
  setShowFormatConverter: (show) => set({ showFormatConverter: show }),
  
  setShowHelpModal: (show) => set({ showHelpModal: show }),
  
  addConversionJob: (job) => set((state) => ({
    conversionJobs: [...state.conversionJobs, job]
  })),
  
  updateConversionJob: (id, updates) => set((state) => ({
    conversionJobs: state.conversionJobs.map(job =>
      job.id === id ? { ...job, ...updates } : job
    )
  })),
  
  setExportPreview: (preview) => set({ exportPreview: preview })
}));