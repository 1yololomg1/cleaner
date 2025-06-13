import React, { useState } from 'react';
import { Target, Zap, Shield, ChevronDown, ChevronUp, Info, Settings, ArrowRight } from 'lucide-react';

interface Algorithm {
  id: string;
  name: string;
  description: string;
  parameters: AlgorithmParameter[];
  enabled: boolean;
  category: 'basic' | 'advanced' | 'validation';
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'select' | 'boolean';
  value: any;
  min?: number;
  max?: number;
  options?: string[];
  description: string;
}

interface AlgorithmGroupsProps {
  onAlgorithmsChanged: (algorithms: Algorithm[]) => void;
  onProceedToProcess?: () => void;
}

export const AlgorithmGroups: React.FC<AlgorithmGroupsProps> = ({ onAlgorithmsChanged, onProceedToProcess }) => {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['basic']);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([
    // Basic Cleaning Suite
    {
      id: 'despike',
      name: 'Despiking',
      description: 'Removes extreme outliers (>3σ from mean). Adjust threshold: 2σ (aggressive) to 4σ (conservative). Preserves geological features.',
      category: 'basic',
      enabled: true,
      parameters: [
        { name: 'threshold', type: 'number', value: 3, min: 2, max: 5, description: 'Standard deviation threshold' },
        { name: 'windowSize', type: 'number', value: 11, min: 5, max: 21, description: 'Moving window size' }
      ]
    },
    {
      id: 'smooth',
      name: 'Smoothing',
      description: 'Reduces random noise. Window size: 3-5 points (tight) to 15-21 points (smooth). Savitzky-Golay preserves peaks.',
      category: 'basic',
      enabled: true,
      parameters: [
        { name: 'method', type: 'select', value: 'savgol', options: ['savgol', 'gaussian', 'median'], description: 'Smoothing method' },
        { name: 'windowSize', type: 'number', value: 7, min: 3, max: 21, description: 'Smoothing window size' },
        { name: 'polyOrder', type: 'number', value: 3, min: 1, max: 5, description: 'Polynomial order (Savitzky-Golay)' }
      ]
    },
    {
      id: 'gapfill',
      name: 'Gap Filling',
      description: 'Interpolates missing data. Linear (simple trends) vs Spline (complex curves). Max gap: 5-50 points.',
      category: 'basic',
      enabled: true,
      parameters: [
        { name: 'method', type: 'select', value: 'linear', options: ['linear', 'spline', 'polynomial'], description: 'Interpolation method' },
        { name: 'maxGap', type: 'number', value: 10, min: 5, max: 50, description: 'Maximum gap size to fill' }
      ]
    },
    // Advanced Conditioning
    {
      id: 'envCorrection',
      name: 'Environmental Correction',
      description: 'Corrects for temperature/pressure effects. Mud weight: 8.5-18 ppg. Temperature gradient: 1-3°F/100ft.',
      category: 'advanced',
      enabled: false,
      parameters: [
        { name: 'mudWeight', type: 'number', value: 10, min: 8.5, max: 18, description: 'Mud weight (ppg)' },
        { name: 'tempGradient', type: 'number', value: 2, min: 1, max: 3, description: 'Temperature gradient (°F/100ft)' },
        { name: 'surfaceTemp', type: 'number', value: 70, min: 50, max: 90, description: 'Surface temperature (°F)' }
      ]
    },
    {
      id: 'depthAlign',
      name: 'Depth Registration',
      description: 'Aligns curves to consistent depth reference. Shift tolerance: ±0.5-5.0 feet.',
      category: 'advanced',
      enabled: false,
      parameters: [
        { name: 'referenceLog', type: 'select', value: 'GR', options: ['GR', 'SP', 'CAL'], description: 'Reference log for alignment' },
        { name: 'maxShift', type: 'number', value: 2, min: 0.5, max: 5, description: 'Maximum shift tolerance (ft)' },
        { name: 'correlationWindow', type: 'number', value: 50, min: 20, max: 100, description: 'Correlation window size' }
      ]
    },
    {
      id: 'noiseReduction',
      name: 'Noise Reduction',
      description: 'Gaussian filtering removes high-frequency noise. Sigma: 0.5 (subtle) to 2.0 (aggressive).',
      category: 'advanced',
      enabled: false,
      parameters: [
        { name: 'sigma', type: 'number', value: 1, min: 0.5, max: 2, description: 'Gaussian filter sigma' },
        { name: 'truncate', type: 'number', value: 4, min: 2, max: 8, description: 'Filter truncation' }
      ]
    },
    // Quality Validation
    {
      id: 'rangeValidation',
      name: 'Range Validation',
      description: 'Checks realistic values. GR: 0-300 API, Density: 1.5-3.0 g/cc, Porosity: 0-50%.',
      category: 'validation',
      enabled: true,
      parameters: [
        { name: 'strictMode', type: 'boolean', value: false, description: 'Use strict industry bounds' },
        { name: 'autoFlag', type: 'boolean', value: true, description: 'Automatically flag out-of-range values' }
      ]
    },
    {
      id: 'geoConsistency',
      name: 'Geological Consistency',
      description: 'Validates rock physics relationships. Vp/Vs: 1.4-2.2, Poisson\'s ratio: 0.1-0.45.',
      category: 'validation',
      enabled: true,
      parameters: [
        { name: 'vpVsMin', type: 'number', value: 1.4, min: 1.2, max: 1.6, description: 'Minimum Vp/Vs ratio' },
        { name: 'vpVsMax', type: 'number', value: 2.2, min: 2.0, max: 2.5, description: 'Maximum Vp/Vs ratio' },
        { name: 'poissonMin', type: 'number', value: 0.1, min: 0.05, max: 0.15, description: 'Minimum Poisson ratio' },
        { name: 'poissonMax', type: 'number', value: 0.45, min: 0.4, max: 0.5, description: 'Maximum Poisson ratio' }
      ]
    }
  ]);

  // Initialize algorithms on mount
  React.useEffect(() => {
    onAlgorithmsChanged(algorithms);
  }, []);
  const toggleGroup = (group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const toggleAlgorithm = (algorithmId: string) => {
    const updated = algorithms.map(alg =>
      alg.id === algorithmId ? { ...alg, enabled: !alg.enabled } : alg
    );
    setAlgorithms(updated);
    onAlgorithmsChanged(updated);
  };

  const updateParameter = (algorithmId: string, paramName: string, value: any) => {
    const updated = algorithms.map(alg =>
      alg.id === algorithmId
        ? {
            ...alg,
            parameters: alg.parameters.map(param =>
              param.name === paramName ? { ...param, value } : param
            )
          }
        : alg
    );
    setAlgorithms(updated);
    onAlgorithmsChanged(updated);
  };

  const getGroupIcon = (category: string) => {
    switch (category) {
      case 'basic': return Target;
      case 'advanced': return Zap;
      case 'validation': return Shield;
      default: return Settings;
    }
  };

  const getGroupColor = (category: string) => {
    switch (category) {
      case 'basic': return 'text-green-600 bg-green-50 border-green-200';
      case 'advanced': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'validation': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const groups = [
    { id: 'basic', name: 'Basic Cleaning Suite', subtitle: 'Recommended together' },
    { id: 'advanced', name: 'Advanced Conditioning', subtitle: 'For complex data' },
    { id: 'validation', name: 'Quality Validation', subtitle: 'Always recommended' }
  ];

  const hasEnabledAlgorithms = algorithms.some(alg => alg.enabled);

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Processing Guidelines</h3>
            <p className="mt-1 text-sm text-blue-700">
              Start with Basic Cleaning for most wells. Add Advanced Conditioning for complex datasets.
              Quality Validation is always recommended to ensure data integrity.
            </p>
          </div>
        </div>
      </div>

      {groups.map(group => {
        const GroupIcon = getGroupIcon(group.id);
        const isExpanded = expandedGroups.includes(group.id);
        const groupAlgorithms = algorithms.filter(alg => alg.category === group.id);
        const enabledCount = groupAlgorithms.filter(alg => alg.enabled).length;

        return (
          <div key={group.id} className={`border rounded-lg ${getGroupColor(group.id)}`}>
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-opacity-80 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <GroupIcon className="h-5 w-5" />
                <div>
                  <h3 className="font-medium">{group.name}</h3>
                  <p className="text-xs opacity-75">{group.subtitle}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                  {enabledCount}/{groupAlgorithms.length} enabled
                </span>
              </div>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {groupAlgorithms.map(algorithm => (
                  <div key={algorithm.id} className="bg-white bg-opacity-70 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={algorithm.enabled}
                            onChange={() => toggleAlgorithm(algorithm.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <h4 className="font-medium text-gray-900">{algorithm.name}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{algorithm.description}</p>
                      </div>
                    </div>

                    {algorithm.enabled && (
                      <div className="space-y-3 pt-3 border-t border-gray-200">
                        {algorithm.parameters.map(param => (
                          <div key={param.name} className="grid grid-cols-3 gap-3 items-center">
                            <label className="text-sm font-medium text-gray-700 capitalize">
                              {param.name.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <div className="col-span-2">
                              {param.type === 'number' && (
                                <input
                                  type="number"
                                  value={param.value}
                                  min={param.min}
                                  max={param.max}
                                  step={param.max && param.max <= 10 ? 0.1 : 1}
                                  onChange={(e) => updateParameter(algorithm.id, param.name, parseFloat(e.target.value))}
                                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              )}
                              {param.type === 'select' && (
                                <select
                                  value={param.value}
                                  onChange={(e) => updateParameter(algorithm.id, param.name, e.target.value)}
                                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                  {param.options?.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              )}
                              {param.type === 'boolean' && (
                                <input
                                  type="checkbox"
                                  checked={param.value}
                                  onChange={(e) => updateParameter(algorithm.id, param.name, e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                              )}
                              <p className="text-xs text-gray-500 mt-1">{param.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Process Button */}
      {hasEnabledAlgorithms && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Process</h3>
              <p className="text-sm text-gray-600">
                You have {algorithms.filter(alg => alg.enabled).length} algorithms configured. 
                Proceed to apply them to your well data.
              </p>
            </div>
            <button
              onClick={onProceedToProcess}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <span className="mr-2">Process Data</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};