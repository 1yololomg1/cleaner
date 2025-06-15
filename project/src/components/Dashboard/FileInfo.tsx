import React from 'react';
import { Calendar, MapPin, Building, Database, Layers, Clock, User, Download, Lock } from 'lucide-react';
import { useAppStore } from '../../store';

export const FileInfo: React.FC = () => {
  const { activeFile, setShowExportModal } = useAppStore();

  if (!activeFile) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-slate-700 rounded-full">
            <Database className="h-12 w-12 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Well Information</h3>
            <p className="text-slate-500">Select a LAS file to view detailed well information</p>
          </div>
        </div>
      </div>
    );
  }

  const { header, curves, data } = activeFile;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Well Information</h3>
              <p className="text-sm text-slate-400">LAS File Details & Metadata</p>
            </div>
          </div>
          
          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Download className="h-4 w-4" />
            <span className="text-sm">Export LAS</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Export Status Banner */}
        {activeFile.processed && (
          <div className="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 rounded-xl p-4 border border-amber-700/30">
            <div className="flex items-center space-x-3">
              <Lock className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-white">Ready for Premium Export</p>
                <p className="text-xs text-slate-400">
                  File processed successfully • Quality Score: {activeFile.qcResults?.overallQualityScore.toFixed(1) || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Well Identity */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-slate-400 mt-1" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Company</p>
                <p className="text-sm font-medium text-white">{header.company}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-1" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Well / Field</p>
                <p className="text-sm font-medium text-white">{header.well}</p>
                <p className="text-xs text-slate-400">{header.field}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-slate-400 mt-1" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Log Date</p>
                <p className="text-sm font-medium text-white">{header.logDate || header.date}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-slate-400 mt-1" />
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Service Company</p>
                <p className="text-sm font-medium text-white">{header.serviceCompany || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="border-t border-slate-700 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Unique Well Identifier</p>
              <p className="text-sm font-mono text-white bg-slate-700/50 px-3 py-2 rounded border border-slate-600">
                {header.uwi}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">LAS Version</p>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-medium rounded">
                  v{header.version}
                </span>
                <span className="text-xs text-slate-400">
                  {header.wrap ? 'Wrapped' : 'Unwrapped'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Depth Information */}
        <div className="border-t border-slate-700 pt-6">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Depth Range & Sampling</span>
          </h4>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Start Depth</p>
              <p className="text-lg font-bold text-white">{header.startDepth}</p>
              <p className="text-xs text-slate-500">meters</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Stop Depth</p>
              <p className="text-lg font-bold text-white">{header.stopDepth}</p>
              <p className="text-xs text-slate-500">meters</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Step Size</p>
              <p className="text-lg font-bold text-white">{header.step}</p>
              <p className="text-xs text-slate-500">meters</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
              <p className="text-xs text-slate-400 mb-1">Total Points</p>
              <p className="text-lg font-bold text-white">{data.length.toLocaleString()}</p>
              <p className="text-xs text-slate-500">measurements</p>
            </div>
          </div>
        </div>
        
        {/* Curve Inventory */}
        <div className="border-t border-slate-700 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Database className="h-4 w-4 text-green-400" />
              <span>Curve Inventory ({curves.length})</span>
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Last updated: {activeFile.uploadedAt.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {curves.map((curve, index) => (
              <div key={index} className="flex items-center justify-between py-3 px-4 bg-slate-700/30 rounded-lg border border-slate-600 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: curve.color }}
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-white">{curve.mnemonic}</span>
                      <span className="text-xs text-slate-400">({curve.unit})</span>
                      {curve.standardMnemonic && curve.standardMnemonic !== curve.mnemonic && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/30">
                          → {curve.standardMnemonic}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{curve.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Track {curve.track}</p>
                    <p className="text-xs text-slate-500 capitalize">{curve.scale}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    curve.curveType === 'gamma_ray' ? 'bg-green-600/20 text-green-400' :
                    curve.curveType === 'resistivity' ? 'bg-red-600/20 text-red-400' :
                    curve.curveType === 'porosity' ? 'bg-blue-600/20 text-blue-400' :
                    curve.curveType === 'caliper' ? 'bg-cyan-600/20 text-cyan-400' :
                    curve.curveType === 'sp' ? 'bg-purple-600/20 text-purple-400' :
                    'bg-slate-600/20 text-slate-400'
                  }`}>
                    {curve.curveType.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Status */}
        {activeFile.processingHistory && activeFile.processingHistory.length > 0 && (
          <div className="border-t border-slate-700 pt-6">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Processing History</span>
            </h4>
            <div className="space-y-2">
              {activeFile.processingHistory.slice(-3).map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{step.operation}</p>
                    <p className="text-xs text-slate-400">{step.timestamp.toLocaleString()}</p>
                  </div>
                  <span className="text-xs text-slate-500">
                    {step.curvesAffected.length} curves
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};