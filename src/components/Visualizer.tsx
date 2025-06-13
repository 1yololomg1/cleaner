import React, { useState, useMemo } from 'react';
import { BarChart3, LineChart, ScatterChart as Scatter3D, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import { LASFile, PlotType } from '../types/wellLog';

interface VisualizerProps {
  files: LASFile[];
  selectedFile?: LASFile;
  onFileSelect: (file: LASFile) => void;
}

const PLOT_TYPES: { type: PlotType; name: string; category: string; icon: React.ReactNode }[] = [
  // Relational
  { type: 'scatterplot', name: 'Scatter Plot', category: 'Relational', icon: <Scatter3D className="h-4 w-4" /> },
  { type: 'lineplot', name: 'Line Plot', category: 'Relational', icon: <LineChart className="h-4 w-4" /> },
  { type: 'relplot', name: 'Relational Plot', category: 'Relational', icon: <TrendingUp className="h-4 w-4" /> },
  
  // Categorical
  { type: 'barplot', name: 'Bar Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'boxplot', name: 'Box Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'violinplot', name: 'Violin Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'stripplot', name: 'Strip Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'swarmplot', name: 'Swarm Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'pointplot', name: 'Point Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'catplot', name: 'Categorical Plot', category: 'Categorical', icon: <BarChart3 className="h-4 w-4" /> },
  
  // Distribution
  { type: 'histplot', name: 'Histogram', category: 'Distribution', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'kdeplot', name: 'KDE Plot', category: 'Distribution', icon: <LineChart className="h-4 w-4" /> },
  { type: 'ecdfplot', name: 'ECDF Plot', category: 'Distribution', icon: <LineChart className="h-4 w-4" /> },
  { type: 'rugplot', name: 'Rug Plot', category: 'Distribution', icon: <LineChart className="h-4 w-4" /> },
  { type: 'displot', name: 'Distribution Plot', category: 'Distribution', icon: <BarChart3 className="h-4 w-4" /> },
  
  // Regression
  { type: 'regplot', name: 'Regression Plot', category: 'Regression', icon: <TrendingUp className="h-4 w-4" /> },
  { type: 'lmplot', name: 'Linear Model Plot', category: 'Regression', icon: <TrendingUp className="h-4 w-4" /> },
  { type: 'residplot', name: 'Residual Plot', category: 'Regression', icon: <TrendingUp className="h-4 w-4" /> },
  
  // Matrix
  { type: 'heatmap', name: 'Heatmap', category: 'Matrix', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'clustermap', name: 'Cluster Map', category: 'Matrix', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'correlation', name: 'Correlation Matrix', category: 'Matrix', icon: <BarChart3 className="h-4 w-4" /> },
  
  // Multi-plot
  { type: 'pairplot', name: 'Pair Plot', category: 'Multi-plot', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'jointplot', name: 'Joint Plot', category: 'Multi-plot', icon: <BarChart3 className="h-4 w-4" /> },
  
  // Specialized
  { type: 'boxenplot', name: 'Boxen Plot', category: 'Specialized', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'countplot', name: 'Count Plot', category: 'Specialized', icon: <BarChart3 className="h-4 w-4" /> },
  { type: 'scatter2d', name: '2D Scatter', category: 'Specialized', icon: <Scatter3D className="h-4 w-4" /> },
  { type: 'scatter3d', name: '3D Scatter', category: 'Specialized', icon: <Scatter3D className="h-4 w-4" /> },
  { type: 'contour', name: 'Contour Plot', category: 'Specialized', icon: <LineChart className="h-4 w-4" /> },
  { type: 'polar', name: 'Polar Plot', category: 'Specialized', icon: <LineChart className="h-4 w-4" /> },
];

export const Visualizer: React.FC<VisualizerProps> = ({ files, selectedFile, onFileSelect }) => {
  const [selectedPlotType, setSelectedPlotType] = useState<PlotType>('lineplot');
  const [selectedCurves, setSelectedCurves] = useState<string[]>([]);
  const [plotConfig, setPlotConfig] = useState({
    showGrid: true,
    showLegend: true,
    theme: 'light',
    colorPalette: 'viridis'
  });

  const plotCategories = useMemo(() => {
    const categories: Record<string, typeof PLOT_TYPES> = {};
    PLOT_TYPES.forEach(plot => {
      if (!categories[plot.category]) {
        categories[plot.category] = [];
      }
      categories[plot.category].push(plot);
    });
    return categories;
  }, []);

  const availableCurves = useMemo(() => {
    return selectedFile?.curves || [];
  }, [selectedFile]);

  const toggleCurve = (curve: string) => {
    setSelectedCurves(prev =>
      prev.includes(curve)
        ? prev.filter(c => c !== curve)
        : [...prev, curve]
    );
  };

  const generateVisualization = () => {
    if (!selectedFile || selectedCurves.length === 0) return null;

    // Mock visualization data for demo
    const mockData = selectedFile.data.slice(0, 100).map((row, index) => {
      const point: any = { depth: row[0] };
      selectedCurves.forEach((curve, curveIndex) => {
        const curveIndex2 = selectedFile.curves.findIndex(c => c.mnemonic === curve);
        point[curve] = row[curveIndex2] || 0;
      });
      return point;
    });

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {PLOT_TYPES.find(p => p.type === selectedPlotType)?.name}
          </h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <Download className="h-4 w-4 inline mr-1" />
              Export
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
              <Eye className="h-4 w-4 inline mr-1" />
              Full Screen
            </button>
          </div>
        </div>

        {/* Mock visualization area */}
        <div className="h-96 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Interactive Visualization</p>
            <p className="text-sm">
              {selectedFile.name} • {selectedCurves.length} curves • {mockData.length} data points
            </p>
            <p className="text-xs mt-2 opacity-75">
              Showing: {selectedCurves.join(', ')}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-900">Data Points</div>
            <div className="text-blue-700">{mockData.length.toLocaleString()}</div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-900">Curves</div>
            <div className="text-green-700">{selectedCurves.length}</div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-900">Depth Range</div>
            <div className="text-purple-700">
              {Math.min(...mockData.map(d => d.depth)).toFixed(0)} - {Math.max(...mockData.map(d => d.depth)).toFixed(0)} ft
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="font-medium text-orange-900">Quality</div>
            <div className="text-orange-700">95% Valid</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* File Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-3">Select Well Data</h2>
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
              <div className="text-sm text-gray-500 mt-1">
                {file.curves.length} curves • {file.data.length} samples
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {file.well.wellName || 'Unknown Well'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedFile && (
        <>
          {/* Plot Type Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Visualization Type</h2>
            <div className="space-y-4">
              {Object.entries(plotCategories).map(([category, plots]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">{category}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {plots.map(plot => (
                      <button
                        key={plot.type}
                        onClick={() => setSelectedPlotType(plot.type)}
                        className={`p-2 border rounded text-sm transition-colors ${
                          selectedPlotType === plot.type
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {plot.icon}
                          <span className="truncate">{plot.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Curve Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Select Curves</h2>
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {curve.standardizedMnemonic || curve.mnemonic}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {curve.standardizedUnit || curve.unit}
                    </div>
                    {curve.confidenceScore && (
                      <div className="text-xs text-blue-600">
                        {curve.confidenceScore}% confidence
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Plot Configuration */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3">Plot Settings</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={plotConfig.showGrid}
                  onChange={(e) => setPlotConfig(prev => ({ ...prev, showGrid: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show Grid</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={plotConfig.showLegend}
                  onChange={(e) => setPlotConfig(prev => ({ ...prev, showLegend: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Show Legend</span>
              </label>
              <select
                value={plotConfig.theme}
                onChange={(e) => setPlotConfig(prev => ({ ...prev, theme: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Light Theme</option>
                <option value="dark">Dark Theme</option>
                <option value="minimal">Minimal</option>
              </select>
              <select
                value={plotConfig.colorPalette}
                onChange={(e) => setPlotConfig(prev => ({ ...prev, colorPalette: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
                <option value="blues">Blues</option>
                <option value="reds">Reds</option>
                <option value="spectral">Spectral</option>
              </select>
            </div>
          </div>

          {/* Visualization */}
          {generateVisualization()}
        </>
      )}
    </div>
  );
};