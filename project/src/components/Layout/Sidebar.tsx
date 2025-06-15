import React from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertTriangle, Clock, Layers } from 'lucide-react';
import { useAppStore } from '../../store';

export const Sidebar: React.FC = () => {
  const { files, activeFile, setActiveFile, removeFile } = useAppStore();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQualityColor = (score?: number) => {
    if (!score) return 'text-slate-400';
    if (score >= 90) return 'text-emerald-400';
    if (score >= 75) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getQualityGrade = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  return (
    <div className="w-96 bg-slate-800 border-r border-slate-700 flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex items-center space-x-2 mb-4">
          <Layers className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Well Files</h2>
        </div>
        <FileUploadZone />
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {files.length === 0 ? (
          <div className="p-6 text-center text-slate-400">
            <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No LAS Files</p>
            <p className="text-sm">Upload LAS files to begin processing</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  activeFile?.id === file.id
                    ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-700/50 hover:bg-slate-700 border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => setActiveFile(file)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate mb-1">
                      {file.name}
                    </h3>
                    <div className="flex items-center space-x-3 text-xs text-slate-400">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.curves.length} curves</span>
                      <span>•</span>
                      <span>LAS {file.version}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-slate-400 hover:text-red-400 p-1 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {file.processed ? (
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Processed</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-400">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-xs font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                  
                  {file.qcResults && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Quality:</span>
                      <span className={`text-xs font-bold ${getQualityColor(file.qcResults.overallQualityScore)}`}>
                        {getQualityGrade(file.qcResults.overallQualityScore)}
                      </span>
                    </div>
                  )}
                </div>
                
                {file.qcResults && file.qcResults.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-600">
                    <div className="flex items-center text-xs text-slate-400">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>{file.qcResults.recommendations.length} recommendations</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FileUploadZone: React.FC = () => {
  const { addFile } = useAppStore();

  const getCurveTypeAndTrack = (mnemonic: string) => {
    const upperMnemonic = mnemonic.toUpperCase();
    
    // Gamma Ray and SP
    if (['GR', 'CGR', 'SGR', 'SP'].includes(upperMnemonic)) {
      return { 
        curveType: upperMnemonic === 'SP' ? 'sp' : 'gamma_ray', 
        track: 1,
        color: upperMnemonic === 'GR' ? '#22c55e' : upperMnemonic === 'SP' ? '#8b5cf6' : '#16a34a'
      };
    }
    
    // Resistivity
    if (['RT', 'RXO', 'MSFL', 'LLS', 'LLD', 'ILD', 'SFL'].includes(upperMnemonic)) {
      return { curveType: 'resistivity', track: 2, color: '#ef4444' };
    }
    
    // Porosity
    if (['NPHI', 'RHOB', 'PEF', 'DT', 'DPHI'].includes(upperMnemonic)) {
      return { 
        curveType: 'porosity', 
        track: 3,
        color: upperMnemonic === 'NPHI' ? '#3b82f6' : upperMnemonic === 'RHOB' ? '#f59e0b' : '#8b5cf6'
      };
    }
    
    // Caliper and Drilling
    if (['CALI', 'BS', 'ROP', 'WOB', 'HKLA'].includes(upperMnemonic)) {
      return { curveType: 'caliper', track: 4, color: '#06b6d4' };
    }
    
    // Default to custom
    return { curveType: 'custom', track: 5, color: '#64748b' };
  };

  const handleFileUpload = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.name.toLowerCase().endsWith('.las')) {
        // Enhanced mock file parsing with realistic petrophysical data
        const mockCurves = [
          { mnemonic: 'DEPT', unit: 'M', description: 'Depth', dataType: 'depth' as const },
          { mnemonic: 'GR', unit: 'API', description: 'Gamma Ray', dataType: 'log' as const },
          { mnemonic: 'SP', unit: 'MV', description: 'Spontaneous Potential', dataType: 'log' as const },
          { mnemonic: 'RT', unit: 'OHMM', description: 'True Resistivity', dataType: 'log' as const },
          { mnemonic: 'NPHI', unit: 'V/V', description: 'Neutron Porosity', dataType: 'log' as const },
          { mnemonic: 'RHOB', unit: 'G/C3', description: 'Bulk Density', dataType: 'log' as const },
          { mnemonic: 'PEF', unit: 'B/E', description: 'Photoelectric Factor', dataType: 'log' as const },
          { mnemonic: 'CALI', unit: 'IN', description: 'Caliper', dataType: 'log' as const }
        ].map(curve => {
          const typeInfo = getCurveTypeAndTrack(curve.mnemonic);
          return {
            ...curve,
            curveType: typeInfo.curveType,
            track: typeInfo.track,
            color: typeInfo.color,
            scale: typeInfo.curveType === 'resistivity' ? 'logarithmic' as const : 'linear' as const,
            visible: true
          };
        });

        // Generate realistic petrophysical data
        const dataPoints = Array.from({ length: 200 }, (_, i) => {
          const depth = 1000 + i * 0.5;
          const baseGR = 60 + Math.sin(depth / 100) * 30 + Math.random() * 20;
          const basePorosity = 0.15 + Math.sin(depth / 150) * 0.1 + Math.random() * 0.05;
          
          return {
            depth,
            GR: Math.max(0, baseGR),
            SP: -20 + Math.sin(depth / 80) * 15 + Math.random() * 10,
            RT: Math.exp(2 + Math.sin(depth / 120) * 2 + Math.random() * 0.5),
            NPHI: Math.max(0, Math.min(1, basePorosity)),
            RHOB: 2.65 - basePorosity * 0.8 + Math.random() * 0.1,
            PEF: 2.8 + Math.random() * 0.4,
            CALI: 8.5 + Math.random() * 1.5
          };
        });

        const mockFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          uploadedAt: new Date(),
          processed: false,
          version: '2.0',
          header: {
            version: '2.0',
            wrap: false,
            startDepth: 1000,
            stopDepth: 1100,
            step: 0.5,
            nullValue: -999.25,
            company: 'POLISH Petrophysics',
            well: file.name.replace('.las', ''),
            field: 'Demo Field',
            location: 'Offshore',
            date: new Date().toISOString().split('T')[0],
            uwi: '12345678901234567890',
            serviceCompany: 'Advanced Logging Services',
            logDate: new Date().toISOString().split('T')[0],
            elevation: 125
          },
          curves: mockCurves,
          data: dataPoints
        };
        
        addFile(mockFile);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <div
      className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-slate-700/20 transition-all duration-200"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Upload className="h-10 w-10 mx-auto mb-3 text-slate-400" />
      <p className="text-sm text-slate-300 mb-2 font-medium">Drop LAS files here</p>
      <p className="text-xs text-slate-500 mb-4">Supports LAS v1.2, v2.0, v3.0</p>
      <label className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm cursor-pointer transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
        Browse Files
        <input
          type="file"
          multiple
          accept=".las,.LAS"
          onChange={handleFileInput}
          className="hidden"
        />
      </label>
    </div>
  );
};