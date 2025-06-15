import React, { useState } from 'react';
import { X, Download, Lock, Star, FileText, CreditCard, CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store';

export const ExportModal: React.FC = () => {
  const { showExportModal, setShowExportModal, activeFile, setShowPaymentModal, user } = useAppStore();
  const [selectedFormat, setSelectedFormat] = useState<'las' | 'pdf'>('las');

  if (!showExportModal || !activeFile) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getQualityGrade = (score?: number) => {
    if (!score) return 'N/A';
    if (score >= 90) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const handleExport = () => {
    if (!user) {
      setShowExportModal(false);
      setShowPaymentModal(true);
      return;
    }
    
    // Simulate export process
    console.log('Exporting file:', activeFile.name, 'as', selectedFormat);
    setShowExportModal(false);
  };

  // New pricing structure
  const getExportPrice = () => {
    if (selectedFormat === 'las') {
      return 400; // $400 for LAS file with report
    } else {
      return 125; // $125 for PDF report only
    }
  };

  const exportPrice = getExportPrice();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Premium Export with Processing Certificate</h3>
                <p className="text-sm text-slate-400">Professional-grade export with comprehensive documentation</p>
              </div>
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* File Preview */}
          <div className="relative bg-slate-700/30 rounded-xl p-6 border border-slate-600">
            {/* Watermark Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-6xl font-bold text-slate-600/20 transform -rotate-12 select-none">
                POLISH
              </div>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{activeFile.name}</h4>
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">Premium Export Required</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">File Size</p>
                  <p className="text-sm font-semibold text-white">{formatFileSize(activeFile.size)}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Quality Score</p>
                  <p className="text-sm font-semibold text-white">
                    {activeFile.qcResults?.overallQualityScore.toFixed(1) || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Grade</p>
                  <p className="text-sm font-semibold text-white">
                    {getQualityGrade(activeFile.qcResults?.overallQualityScore)}
                  </p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-slate-400 mb-1">Curves</p>
                  <p className="text-sm font-semibold text-white">{activeFile.curves.length}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Processed with POLISH algorithms</span>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Export Format</h4>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedFormat('las')}
                className={`p-4 rounded-xl border transition-all ${
                  selectedFormat === 'las'
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">Cleaned LAS File + Report</p>
                    <p className="text-xs text-slate-400">Industry standard format with documentation</p>
                    <p className="text-sm font-bold text-green-400 mt-1">${exportPrice}</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedFormat('pdf')}
                className={`p-4 rounded-xl border transition-all ${
                  selectedFormat === 'pdf'
                    ? 'border-blue-500 bg-blue-900/20 text-white'
                    : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-medium">QC Report Only (PDF)</p>
                    <p className="text-xs text-slate-400">Comprehensive analysis report</p>
                    <p className="text-sm font-bold text-green-400 mt-1">${exportPrice}</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Volume Pricing Information */}
          <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-700/30">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Volume Pricing Available</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-white font-bold">$400</p>
                <p className="text-slate-300">LAS + Report</p>
                <p className="text-xs text-slate-400">1-49 files</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold">$350</p>
                <p className="text-slate-300">LAS + Report</p>
                <p className="text-xs text-slate-400">50+ files</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold">$300</p>
                <p className="text-slate-300">LAS + Report</p>
                <p className="text-xs text-slate-400">100+ files</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              <strong>All bulk pricing includes both cleaned LAS file AND comprehensive report</strong>
            </p>
            <p className="text-xs text-slate-400 text-center">
              Contact sales for enterprise pricing on large volumes
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl p-4 border border-purple-700/30">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <h4 className="text-sm font-semibold text-white">Premium Export Includes</h4>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Fully processed and cleaned LAS file</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Processing certificate with unique ID and digital signature</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Comprehensive quality control metrics and validation report</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Standardized mnemonics and units (API/CWLS compliant)</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Complete processing audit trail and parameter documentation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Professional PDF report with visualizations and recommendations</span>
              </li>
            </ul>
          </div>

          {/* Value Proposition */}
          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
            <h4 className="text-sm font-semibold text-white mb-2">Why Choose POLISH Premium Export?</h4>
            <p className="text-sm text-slate-300 mb-3">
              Our premium export ensures your data meets the highest industry standards for downstream analysis, 
              with full documentation and traceability for regulatory compliance.
            </p>
            <div className="text-xs text-slate-400">
              ✓ Process Free → Pay to Export • ✓ No Subscription Required • ✓ Instant Download
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              <p>Total: <span className="text-white font-bold text-lg">${exportPrice}</span></p>
              <p className="text-xs">One-time payment • Instant download</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <CreditCard className="h-4 w-4" />
                <span>Purchase Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};