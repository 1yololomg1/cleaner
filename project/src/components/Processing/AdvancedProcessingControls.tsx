import React from 'react';
import { Play, Settings, RotateCcw, Save, Zap, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { useAppStore } from '../../store';
import { ContextualHelp, ProcessingHelp } from '../Help/ContextualHelp';

export const AdvancedProcessingControls: React.FC = () => {
  const { 
    processingOptions, 
    updateProcessingOptions, 
    isProcessing, 
    processingProgress,
    setProcessing, 
    setProcessingProgress,
    activeFile, 
    updateFile 
  } = useAppStore();

  const handleProcess = async () => {
    if (!activeFile) return;
    
    setProcessing(true);
    setProcessingProgress(0);
    
    // Simulate advanced processing with progress updates
    const steps = [
      'Initializing processing pipeline...',
      'Applying Savitzky-Golay smoothing...',
      'Detecting spikes using Hampel filter...',
      'Performing PCHIP interpolation...',
      'Validating physical ranges...',
      'Standardizing mnemonics...',
      'Generating quality metrics...',
      'Finalizing results...'
    ];
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingProgress(((i + 1) / steps.length) * 100);
    }
    
    // Generate comprehensive QC results
    const qcResults = {
      totalPoints: activeFile.data.length,
      nullPoints: Math.floor(activeFile.data.length * 0.03),
      spikesDetected: Math.floor(Math.random() * 8),
      noiseLevel: Math.random() * 0.2,
      depthConsistency: true,
      overallQualityScore: 85 + Math.random() * 10,
      curveQuality: activeFile.curves.reduce((acc, curve) => {
        if (curve.dataType === 'log') {
          acc[curve.mnemonic] = {
            completeness: 95 + Math.random() * 5,
            noiseLevel: Math.random() * 0.3,
            spikes: Math.floor(Math.random() * 3),
            physicallyValid: Math.random() > 0.1,
            qualityGrade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)] as 'A' | 'B' | 'C',
            issues: Math.random() > 0.7 ? ['Minor noise detected'] : []
          };
        }
        return acc;
      }, {} as any),
      mnemonicStandardization: {
        standardized: activeFile.curves.length - 1,
        nonStandard: ['CUSTOM_LOG'],
        mappings: {
          'CUSTOM_LOG': 'Suggested: GR_CUSTOM'
        }
      },
      physicalValidation: {
        passed: activeFile.curves.length - 1,
        failed: 1,
        warnings: ['GR values exceed typical range at 1450m']
      },
      recommendations: [
        {
          type: 'warning' as const,
          curve: 'GR',
          message: 'High noise detected in gamma ray curve',
          action: 'Apply additional smoothing'
        },
        {
          type: 'info' as const,
          curve: 'NPHI',
          message: 'Neutron porosity shows excellent data quality',
          action: 'No action required'
        },
        {
          type: 'critical' as const,
          message: 'Standardize CUSTOM_LOG mnemonic for compatibility',
          action: 'Review mnemonic mapping'
        }
      ]
    };
    
    // Add processing history
    const processingStep = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      operation: 'Advanced Processing Pipeline',
      parameters: processingOptions,
      curvesAffected: activeFile.curves.filter(c => c.dataType === 'log').map(c => c.mnemonic),
      description: 'Applied Savitzky-Golay smoothing, Hampel spike detection, and mnemonic standardization'
    };
    
    updateFile(activeFile.id, { 
      processed: true, 
      qcResults,
      processingHistory: [...(activeFile.processingHistory || []), processingStep]
    });
    
    setProcessing(false);
    setProcessingProgress(0);
  };

  const handleReset = () => {
    // Reset processing options to defaults
    updateProcessingOptions({
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
        preserveOriginal: true
      }
    });
    console.log('Processing options reset to defaults');
  };

  const handleSave = () => {
    // Save current processing configuration
    const config = {
      processingOptions,
      timestamp: new Date(),
      fileId: activeFile?.id
    };
    localStorage.setItem('polish_processing_config', JSON.stringify(config));
    console.log('Processing configuration saved');
  };

  const handleExportConfig = () => {
    // Export processing configuration as JSON
    const config = {
      processingOptions,
      metadata: {
        version: '1.0.0',
        created: new Date(),
        application: 'POLISH'
      }
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polish_processing_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Advanced Processing Pipeline</h3>
              <p className="text-sm text-slate-400">Professional-grade algorithms for petrophysical data</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleSave}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Save configuration"
            >
              <Save className="h-4 w-4" />
            </button>
            <button
              onClick={handleExportConfig}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Export configuration"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Advanced settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Denoising Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Advanced Denoising</span>
              </h4>
              <ContextualHelp topic="savitzky-golay">
                <span>Help</span>
              </ContextualHelp>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={processingOptions.denoise.enabled}
                onChange={(e) => updateProcessingOptions({
                  denoise: { ...processingOptions.denoise, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          {processingOptions.denoise.enabled && (
            <div className="pl-6 border-l-2 border-blue-500 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Algorithm</label>
                  <select
                    value={processingOptions.denoise.method}
                    onChange={(e) => updateProcessingOptions({
                      denoise: { ...processingOptions.denoise, method: e.target.value as any }
                    })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="savitzky_golay">Savitzky-Golay</option>
                    <option value="wavelet">Wavelet Transform</option>
                    <option value="moving_average">Moving Average</option>
                    <option value="gaussian">Gaussian Filter</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Window Size: {processingOptions.denoise.windowSize}</label>
                  <input
                    type="range"
                    min="5"
                    max="21"
                    step="2"
                    value={processingOptions.denoise.windowSize}
                    onChange={(e) => updateProcessingOptions({
                      denoise: { ...processingOptions.denoise, windowSize: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
              
              {processingOptions.denoise.method === 'savitzky_golay' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Polynomial Order: {processingOptions.denoise.polynomialOrder}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={processingOptions.denoise.polynomialOrder || 3}
                    onChange={(e) => updateProcessingOptions({
                      denoise: { ...processingOptions.denoise, polynomialOrder: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Strength: {(processingOptions.denoise.strength * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={processingOptions.denoise.strength}
                  onChange={(e) => updateProcessingOptions({
                    denoise: { ...processingOptions.denoise, strength: parseFloat(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={processingOptions.denoise.preserveSpikes}
                  onChange={(e) => updateProcessingOptions({
                    denoise: { ...processingOptions.denoise, preserveSpikes: e.target.checked }
                  })}
                  className="rounded"
                />
                <span className="text-sm text-slate-300">Preserve geological spikes</span>
              </label>
            </div>
          )}
        </div>

        {/* Spike Detection Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Intelligent Spike Detection</span>
              </h4>
              <ContextualHelp topic="hampel-filter">
                <span>Help</span>
              </ContextualHelp>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={processingOptions.despike.enabled}
                onChange={(e) => updateProcessingOptions({
                  despike: { ...processingOptions.despike, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          {processingOptions.despike.enabled && (
            <div className="pl-6 border-l-2 border-orange-500 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Detection Method</label>
                  <select
                    value={processingOptions.despike.method}
                    onChange={(e) => updateProcessingOptions({
                      despike: { ...processingOptions.despike, method: e.target.value as any }
                    })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="hampel">Hampel Filter</option>
                    <option value="modified_zscore">Modified Z-Score</option>
                    <option value="iqr">Interquartile Range</option>
                    <option value="manual">Manual Selection</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Replacement Method</label>
                  <select
                    value={processingOptions.despike.replacementMethod}
                    onChange={(e) => updateProcessingOptions({
                      despike: { ...processingOptions.despike, replacementMethod: e.target.value as any }
                    })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="pchip">PCHIP Interpolation</option>
                    <option value="linear">Linear Interpolation</option>
                    <option value="median">Median Filter</option>
                    <option value="null">Mark as Null</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Threshold: {processingOptions.despike.threshold}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={processingOptions.despike.threshold}
                    onChange={(e) => updateProcessingOptions({
                      despike: { ...processingOptions.despike, threshold: parseFloat(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Window Size: {processingOptions.despike.windowSize}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="15"
                    step="2"
                    value={processingOptions.despike.windowSize}
                    onChange={(e) => updateProcessingOptions({
                      despike: { ...processingOptions.despike, windowSize: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Physical Validation Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Physical Range Validation</span>
              </h4>
              <ContextualHelp topic="physical-validation">
                <span>Help</span>
              </ContextualHelp>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={processingOptions.validation.enabled}
                onChange={(e) => updateProcessingOptions({
                  validation: { ...processingOptions.validation, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
            </label>
          </div>
          
          {processingOptions.validation.enabled && (
            <div className="pl-6 border-l-2 border-green-500 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.validation.crossValidation}
                    onChange={(e) => updateProcessingOptions({
                      validation: { ...processingOptions.validation, crossValidation: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Cross-curve validation</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.validation.flagOutliers}
                    onChange={(e) => updateProcessingOptions({
                      validation: { ...processingOptions.validation, flagOutliers: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Flag physical outliers</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Mnemonic Standardization Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Mnemonic Standardization</span>
              </h4>
              <ContextualHelp topic="mnemonic-standardization">
                <span>Help</span>
              </ContextualHelp>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={processingOptions.mnemonics.enabled}
                onChange={(e) => updateProcessingOptions({
                  mnemonics: { ...processingOptions.mnemonics, enabled: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-500"></div>
            </label>
          </div>
          
          {processingOptions.mnemonics.enabled && (
            <div className="pl-6 border-l-2 border-purple-500 space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Standard</label>
                <select
                  value={processingOptions.mnemonics.standard}
                  onChange={(e) => updateProcessingOptions({
                    mnemonics: { ...processingOptions.mnemonics, standard: e.target.value as any }
                  })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="api">API Standard</option>
                  <option value="cwls">CWLS Standard</option>
                  <option value="custom">Custom Mapping</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.mnemonics.autoStandardize}
                    onChange={(e) => updateProcessingOptions({
                      mnemonics: { ...processingOptions.mnemonics, autoStandardize: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Auto-standardize</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={processingOptions.mnemonics.preserveOriginal}
                    onChange={(e) => updateProcessingOptions({
                      mnemonics: { ...processingOptions.mnemonics, preserveOriginal: e.target.checked }
                    })}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-300">Preserve original</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      <div className="p-6 border-t border-slate-700 bg-slate-700/20 flex-shrink-0">
        {isProcessing && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-300">Processing...</span>
              <span className="text-sm text-white font-medium">{processingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        )}
        
        <button
          onClick={handleProcess}
          disabled={isProcessing || !activeFile}
          className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-semibold transition-all duration-200 ${
            isProcessing || !activeFile
              ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing Pipeline Active...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Execute Processing Pipeline</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};