import React from 'react';
import { Play, Settings, RotateCcw, Save } from 'lucide-react';
import { useAppStore } from '../../store';

export const ProcessingControls: React.FC = () => {
  const { processingOptions, updateProcessingOptions, isProcessing, setProcessing, activeFile, updateFile } = useAppStore();

  const handleProcess = async () => {
    if (!activeFile) return;
    
    setProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock processing results
    const qcResults = {
      totalPoints: activeFile.data.length,
      nullPoints: Math.floor(activeFile.data.length * 0.05),
      spikesDetected: Math.floor(Math.random() * 10),
      noiseLevel: Math.random() * 0.3,
      depthConsistency: true,
      mnemonicStandardization: {
        standardized: activeFile.curves.length - 1,
        nonStandard: ['CUSTOM_LOG']
      },
      recommendations: [
        'Apply noise reduction to GR curve',
        'Review spike at depth 1450m',
        'Standardize CUSTOM_LOG mnemonic'
      ]
    };
    
    updateFile(activeFile.id, { 
      processed: true, 
      qcResults 
    });
    
    setProcessing(false);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Processing Controls</h3>
        <div className="flex space-x-2">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Denoising */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Denoising</h4>
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
          <div className="space-y-4 pl-4 border-l-2 border-blue-600">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Method</label>
              <select
                value={processingOptions.denoise.method}
                onChange={(e) => updateProcessingOptions({
                  denoise: { ...processingOptions.denoise, method: e.target.value as any }
                })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="moving_average">Moving Average</option>
                <option value="gaussian">Gaussian Filter</option>
                <option value="median">Median Filter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Window Size: {processingOptions.denoise.windowSize}
              </label>
              <input
                type="range"
                min="3"
                max="21"
                step="2"
                value={processingOptions.denoise.windowSize}
                onChange={(e) => updateProcessingOptions({
                  denoise: { ...processingOptions.denoise, windowSize: parseInt(e.target.value) }
                })}
                className="w-full"
              />
            </div>
            
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
          </div>
        )}
      </div>

      {/* Despiking */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Spike Removal</h4>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={processingOptions.despike.enabled}
              onChange={(e) => updateProcessingOptions({
                despike: { ...processingOptions.despike, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {processingOptions.despike.enabled && (
          <div className="space-y-4 pl-4 border-l-2 border-orange-500">
            <div>
              <label className="block text-sm text-slate-300 mb-2">Detection Method</label>
              <select
                value={processingOptions.despike.method}
                onChange={(e) => updateProcessingOptions({
                  despike: { ...processingOptions.despike, method: e.target.value as any }
                })}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="zscore">Z-Score</option>
                <option value="iqr">Interquartile Range</option>
                <option value="manual">Manual Selection</option>
              </select>
            </div>
            
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
          </div>
        )}
      </div>

      {/* Mnemonic Standardization */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-white">Mnemonic Standardization</h4>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={processingOptions.mnemonics.enabled}
              onChange={(e) => updateProcessingOptions({
                mnemonics: { ...processingOptions.mnemonics, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {processingOptions.mnemonics.enabled && (
          <div className="pl-4 border-l-2 border-green-500">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={processingOptions.mnemonics.autoStandardize}
                onChange={(e) => updateProcessingOptions({
                  mnemonics: { ...processingOptions.mnemonics, autoStandardize: e.target.checked }
                })}
                className="rounded"
              />
              <span className="text-sm text-slate-300">Auto-standardize common mnemonics</span>
            </label>
          </div>
        )}
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={isProcessing || !activeFile}
        className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
          isProcessing || !activeFile
            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
        }`}
      >
        {isProcessing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            <span>Process File</span>
          </>
        )}
      </button>
    </div>
  );
};