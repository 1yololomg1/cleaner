import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';
import { LASFile } from '../types/wellLog';
import { Download, Eye, Settings, BarChart3 } from 'lucide-react';

interface SimpleVisualizerProps {
  files: LASFile[];
  selectedFile?: LASFile;
  onFileSelect: (file: LASFile) => void;
}

export const SimpleVisualizer: React.FC<SimpleVisualizerProps> = ({ 
  files, 
  selectedFile, 
  onFileSelect 
}) => {
  const [plotType, setPlotType] = useState<'line' | 'scatter' | 'bar'>('line');
  const [selectedCurves, setSelectedCurves] = useState<string[]>([]);
  const [depthRange, setDepthRange] = useState<{ min: number; max: number } | null>(null);

  // Auto-select first file if none selected
  React.useEffect(() => {
    if (files.length > 0 && !selectedFile) {
      onFileSelect(files[0]);
    }
  }, [files, selectedFile, onFileSelect]);

  // Auto-select first few curves when file changes
  React.useEffect(() => {
    if (selectedFile && selectedCurves.length === 0) {
      const availableCurves = selectedFile.curves.slice(1, 4); // Skip depth, take first 3 curves
      setSelectedCurves(availableCurves.map(c => c.mnemonic));
      console.log('Auto-selected curves:', availableCurves.map(c => c.mnemonic));
    }
  }, [selectedFile]);

  const chartData = useMemo(() => {
    if (!selectedFile || selectedCurves.length === 0) {
      console.log('No data: selectedFile or selectedCurves missing');
      return [];
    }

    console.log('🔍 Processing chart data:', {
      selectedFile: selectedFile.name,
      selectedCurves,
      dataLength: selectedFile.data.length,
      curvesLength: selectedFile.curves.length
    });

    const depthIndex = 0; // First column is depth
    const curveIndices = selectedCurves.map(curve => 
      selectedFile.curves.findIndex(c => c.mnemonic === curve)
    ).filter(index => index !== -1);

    console.log('📊 Curve indices:', curveIndices);

    // Process data with better validation
    const processedData = selectedFile.data.slice(0, 500).map((row, index) => {
      const depth = row[depthIndex];
      
      // Validate depth
      if (typeof depth !== 'number' || isNaN(depth) || depth === -999.25 || depth === -999) {
        return null;
      }

      const point: any = { 
        depth: parseFloat(depth.toFixed(2)),
        index 
      };
      
      let hasValidData = false;
      selectedCurves.forEach((curve, i) => {
        const curveIndex = curveIndices[i];
        if (curveIndex !== -1 && curveIndex < row.length) {
          const value = row[curveIndex];
          // More permissive validation
          if (typeof value === 'number' && 
              !isNaN(value) && 
              value !== -999.25 && 
              value !== -999 &&
              Math.abs(value) < 1e6) {
            point[curve] = parseFloat(value.toFixed(4));
            hasValidData = true;
          }
        }
      });
      
      return hasValidData ? point : null;
    }).filter(point => point !== null);

    console.log('✅ Processed data:', {
      totalPoints: processedData.length,
      sampleData: processedData.slice(0, 3),
      selectedCurves,
      depthRange: processedData.length > 0 ? {
        min: Math.min(...processedData.map(d => d.depth)),
        max: Math.max(...processedData.map(d => d.depth))
      } : null
    });

    // Apply depth range filter if set
    let finalData = processedData;
    if (depthRange && depthRange.min !== null && depthRange.max !== null) {
      finalData = processedData.filter(point => 
        point.depth >= depthRange.min && point.depth <= depthRange.max
      );
      console.log('📏 Applied depth filter:', finalData.length, 'points remaining');
    }

    return finalData;
  }, [selectedFile, selectedCurves, depthRange]);

  const availableCurves = selectedFile?.curves.slice(1) || []; // Skip depth curve

  const toggleCurve = (curve: string) => {
    setSelectedCurves(prev => {
      if (prev.includes(curve)) {
        return prev.filter(c => c !== curve);
      } else if (prev.length < 5) { // Limit to 5 curves for readability
        return [...prev, curve];
      }
      return prev;
    });
  };

  const getRandomColor = (index: number) => {
    const colors = ['#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed', '#db2777'];
    return colors[index % colors.length];
  };

  const renderChart = () => {
    console.log('🎨 Rendering chart with data length:', chartData.length);
    
    if (chartData.length === 0) {
      return (
        <div className="h-96 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No Valid Data Found</p>
            <p className="text-sm">
              {selectedCurves.length === 0 
                ? 'Select curves from the panel below to visualize data' 
                : `Selected curves (${selectedCurves.join(', ')}) contain no valid data points`
              }
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Check for null values (-999.25) or invalid data in your LAS file
            </p>
          </div>
        </div>
      );
    }

    // Force re-render by adding key
    const chartKey = `${plotType}-${selectedCurves.join('-')}-${chartData.length}`;

    switch (plotType) {
      case 'scatter':
        return (
          <div key={chartKey} className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="depth" 
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(value) => `Depth: ${value} ft`}
                />
                <Legend />
                {selectedCurves.map((curve, index) => (
                  <Scatter
                    key={`${curve}-${index}`}
                    name={curve}
                    dataKey={curve}
                    fill={getRandomColor(index)}
                  />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        );

      case 'bar':
        return (
          <div key={chartKey} className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.slice(0, 50)} // Limit bars for readability
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="depth"
                  label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(value) => `Depth: ${value} ft`}
                />
                <Legend />
                {selectedCurves.map((curve, index) => (
                  <Bar
                    key={`${curve}-${index}`}
                    dataKey={curve}
                    fill={getRandomColor(index)}
                    name={curve}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      default: // line
        return (
          <div key={chartKey} className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="depth"
                  type="number"
                  domain={['dataMin', 'dataMax']}
                  label={{ value: 'Depth (ft)', position: 'insideBottom', offset: -10 }}
                />
                <YAxis 
                  label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value, name) => [value, name]}
                  labelFormatter={(value) => `Depth: ${value} ft`}
                />
                <Legend />
                {selectedCurves.map((curve, index) => (
                  <Line
                    key={`${curve}-${index}`}
                    type="monotone"
                    dataKey={curve}
                    stroke={getRandomColor(index)}
                    strokeWidth={2}
                    dot={false}
                    name={curve}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* File Selection */}
      {files.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Select Well</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map(file => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  selectedFile?.id === file.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-500">
                  {file.curves.length} curves • {file.data.length} samples
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedFile && (
        <>
          {/* Chart Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Visualization Controls</h3>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center space-x-1">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plot Type</label>
                <select
                  value={plotType}
                  onChange={(e) => setPlotType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="line">Line Chart</option>
                  <option value="scatter">Scatter Plot</option>
                  <option value="bar">Bar Chart</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Min Depth</label>
                <input
                  type="number"
                  placeholder="Auto"
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    setDepthRange(prev => ({ min: value || 0, max: prev?.max || 0 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Depth</label>
                <input
                  type="number"
                  placeholder="Auto"
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : null;
                    setDepthRange(prev => ({ min: prev?.min || 0, max: value || 0 }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedFile.name} - {plotType.charAt(0).toUpperCase() + plotType.slice(1)} Chart
              </h3>
              <div className="text-sm text-gray-500">
                {chartData.length} data points • {selectedCurves.length} curves
              </div>
            </div>
            
            {renderChart()}

            {chartData.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-medium text-blue-900">Data Points</div>
                  <div className="text-blue-700">{chartData.length.toLocaleString()}</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-medium text-green-900">Curves</div>
                  <div className="text-green-700">{selectedCurves.length}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-medium text-purple-900">Depth Range</div>
                  <div className="text-purple-700">
                    {Math.min(...chartData.map(d => d.depth)).toFixed(0)} - {Math.max(...chartData.map(d => d.depth)).toFixed(0)} ft
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="font-medium text-orange-900">Quality</div>
                  <div className="text-orange-700">
                    {Math.round((chartData.length / selectedFile.data.length) * 100)}% Valid
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Curve Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Select Curves ({selectedCurves.length}/5)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableCurves.map(curve => (
                <label
                  key={curve.mnemonic}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCurves.includes(curve.mnemonic)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCurves.includes(curve.mnemonic)}
                    onChange={() => toggleCurve(curve.mnemonic)}
                    disabled={!selectedCurves.includes(curve.mnemonic) && selectedCurves.length >= 5}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {curve.standardizedMnemonic || curve.mnemonic}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {curve.standardizedUnit || curve.unit}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};