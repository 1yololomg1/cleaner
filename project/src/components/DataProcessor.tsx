import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle, Activity, Download } from 'lucide-react';
import { LASFile, ProcessingStep, ValidationResult } from '../types/wellLog';
import { MnemonicStandardizer, UnitConverter } from '../utils/standardization';
import { RockPhysicsValidator } from '../utils/rockPhysics';

interface DataProcessorProps {
  files: LASFile[];
  algorithms: any[];
  onProcessingComplete: (processedFiles: LASFile[]) => void;
}

export const DataProcessor: React.FC<DataProcessorProps> = ({ 
  files, 
  algorithms, 
  onProcessingComplete 
}) => {
  const [processing, setProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<LASFile[]>([]);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (files.length > 0 && !processing) {
      standardizeFiles();
    }
  }, [files]);

  const standardizeFiles = async () => {
    const standardized = files.map(file => {
      const standardizedCurves = file.curves.map(curve => {
        const mnemonicResult = MnemonicStandardizer.standardizeMnemonic(
          curve.mnemonic,
          file.well.serviceCompany
        );
        
        const standardUnit = UnitConverter.getStandardUnit(mnemonicResult.standardized);
        let standardizedUnit = curve.unit;
        let conversionFactor = 1;
        
        if (standardUnit && curve.unit !== standardUnit) {
          const conversion = UnitConverter.convertUnit(1, curve.unit, standardUnit);
          standardizedUnit = standardUnit;
          conversionFactor = conversion.factor;
        }

        return {
          ...curve,
          standardizedMnemonic: mnemonicResult.standardized,
          standardizedUnit,
          confidenceScore: mnemonicResult.confidence,
          serviceCompany: file.well.serviceCompany
        };
      });

      return {
        ...file,
        curves: standardizedCurves
      };
    });

    setProcessedFiles(standardized);
    validateFiles(standardized);
  };

  const validateFiles = (files: LASFile[]) => {
    const results: ValidationResult[] = [];

    files.forEach(file => {
      // Validate depth integrity
      const depths = file.data.map(row => row[0]);
      const depthValidation = RockPhysicsValidator.validateDepthIntegrity(depths);
      
      if (!depthValidation.passed) {
        results.push({
          curve: 'DEPTH',
          issues: depthValidation.issues.map(issue => ({
            type: 'error' as const,
            message: issue,
            severity: 3,
            autoFixable: false
          })),
          passed: false,
          score: 0
        });
      }

      // Validate individual curves
      file.curves.forEach((curve, index) => {
        const values = file.data.map(row => row[index]);
        let validation: { issues: string[]; passed: boolean } = { issues: [], passed: true };

        const standardMnemonic = curve.standardizedMnemonic || curve.mnemonic;
        
        switch (standardMnemonic) {
          case 'GR':
            validation = RockPhysicsValidator.validateGammaRay(values);
            break;
          case 'RHOB':
            validation = RockPhysicsValidator.validateDensity(values);
            break;
          case 'NPHI':
            validation = RockPhysicsValidator.validateNeutron(values);
            break;
          case 'RT':
            validation = RockPhysicsValidator.validateResistivity(values);
            break;
        }

        if (!validation.passed) {
          results.push({
            curve: curve.mnemonic,
            issues: validation.issues.map(issue => ({
              type: issue.includes('Extremely') ? 'error' as const : 'warning' as const,
              message: issue,
              severity: issue.includes('Extremely') ? 3 : 2,
              autoFixable: true
            })),
            passed: false,
            score: validation.passed ? 100 : 60
          });
        }
      });

      // Cross-curve validation
      const consistencyValidation = RockPhysicsValidator.validateCurveConsistency(
        file.curves, 
        file.data
      );
      
      if (!consistencyValidation.passed) {
        results.push({
          curve: 'CONSISTENCY',
          issues: consistencyValidation.issues.map(issue => ({
            type: 'warning' as const,
            message: issue,
            severity: 2,
            autoFixable: false
          })),
          passed: false,
          score: 70
        });
      }
    });

    setValidationResults(results);
  };

  const startProcessing = async () => {
    setProcessing(true);
    setProgress(0);
    setCurrentStep(0);
    setProcessingSteps([]);

    const enabledAlgorithms = algorithms.filter(alg => alg.enabled);
    const totalSteps = enabledAlgorithms.length * files.length;
    let currentStepIndex = 0;

    for (const file of processedFiles) {
      for (const algorithm of enabledAlgorithms) {
        const step: ProcessingStep = {
          id: crypto.randomUUID(),
          name: `${algorithm.name} - ${file.name}`,
          algorithm: algorithm.id,
          parameters: algorithm.parameters.reduce((acc: any, param: any) => {
            acc[param.name] = param.value;
            return acc;
          }, {}),
          applied: false,
          timestamp: new Date(),
          confidenceScore: 85 + Math.random() * 15 // Mock confidence score
        };

        setProcessingSteps(prev => [...prev, step]);
        setCurrentStep(currentStepIndex);

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

        // Mark step as complete
        setProcessingSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, applied: true } : s
        ));

        currentStepIndex++;
        setProgress((currentStepIndex / totalSteps) * 100);
      }
    }

    setProcessing(false);
    onProcessingComplete(processedFiles);
  };

  const resetProcessing = () => {
    setProcessingSteps([]);
    setProgress(0);
    setCurrentStep(0);
    standardizeFiles();
  };

  const getOverallScore = () => {
    if (validationResults.length === 0) return 100;
    const avgScore = validationResults.reduce((sum, result) => sum + result.score, 0) / validationResults.length;
    return Math.round(avgScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Processing Control */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Data Processing Pipeline</h2>
            <p className="text-sm text-gray-500 mt-1">
              {files.length} files loaded • {algorithms.filter(a => a.enabled).length} algorithms enabled
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetProcessing}
              disabled={processing}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            <button
              onClick={startProcessing}
              disabled={processing || algorithms.filter(a => a.enabled).length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {processing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{processing ? 'Processing...' : 'Start Processing'}</span>
            </button>
          </div>
        </div>

        {progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Standardization Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mnemonic & Unit Standardization</h3>
        <div className="space-y-4">
          {processedFiles.map(file => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{file.name}</h4>
                <span className="text-sm text-gray-500">
                  {file.curves.length} curves processed
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {file.curves.map(curve => (
                  <div
                    key={curve.mnemonic}
                    className={`p-3 border rounded ${
                      curve.confidenceScore && curve.confidenceScore > 80
                        ? 'border-green-200 bg-green-50'
                        : curve.confidenceScore && curve.confidenceScore > 50
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-medium text-gray-900">
                        {curve.mnemonic} → {curve.standardizedMnemonic || curve.mnemonic}
                      </div>
                      {curve.confidenceScore && (
                        <span className="text-xs px-2 py-1 bg-white rounded">
                          {curve.confidenceScore}%
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600">
                      {curve.unit} → {curve.standardizedUnit || curve.unit}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validation Results */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quality Validation</h3>
          <div className={`px-3 py-1 border rounded-lg text-sm font-medium ${getScoreColor(getOverallScore())}`}>
            Overall Score: {getOverallScore()}%
          </div>
        </div>

        {validationResults.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p className="text-lg font-medium text-green-700">All validation checks passed!</p>
            <p className="text-sm">Your data meets industry standards.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {validationResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{result.curve}</span>
                  </div>
                  <span className={`text-sm px-2 py-1 rounded ${getScoreColor(result.score)}`}>
                    Score: {result.score}%
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-gray-600">
                  {result.issues.map((issue, issueIndex) => (
                    <li key={issueIndex} className="flex items-start space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full mt-1.5 ${
                        issue.type === 'error' ? 'bg-red-500' : 
                        issue.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <span>{issue.message}</span>
                      {issue.autoFixable && (
                        <span className="text-xs text-green-600">(Auto-fixable)</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processing Steps */}
      {processingSteps.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Processing History</h3>
          <div className="space-y-2">
            {processingSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  step.applied
                    ? 'bg-green-50 border border-green-200'
                    : index === currentStep && processing
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                {step.applied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : index === currentStep && processing ? (
                  <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{step.name}</div>
                  <div className="text-xs text-gray-500">
                    {Object.entries(step.parameters).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join(', ')}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {step.confidenceScore}% confidence
                </div>
                {step.applied && (
                  <div className="text-xs text-green-600">
                    {step.timestamp.toLocaleTimeString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Options */}
      {processedFiles.length > 0 && !processing && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Export Processed Data</h3>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download LAS Files</span>
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export Processing Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};