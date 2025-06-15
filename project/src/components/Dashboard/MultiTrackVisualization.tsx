import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Settings, ZoomIn, ZoomOut, RotateCcw, Maximize2, BarChart3, LineChart, ScatterChart as Scatter3D, Activity, TrendingUp, Grid3X3, Layers, RefreshCw, Trash2 } from 'lucide-react';
import { useAppStore } from '../../store';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

type VisualizationType = 'multi-track' | 'line-chart' | 'scatter-plot' | 'histogram' | 'crossplot' | 'radar-chart' | 'area-chart' | 'correlation-matrix';

export const MultiTrackVisualization: React.FC = () => {
  const { activeFile, files, visualizationSettings, updateVisualizationSettings, toggleCurveVisibility, setActiveFile } = useAppStore();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('multi-track');
  const [selectedCurves, setSelectedCurves] = useState<string[]>(['GR', 'NPHI', 'RHOB']);
  const [selectedWells, setSelectedWells] = useState<string[]>([]);
  const [depthRange, setDepthRange] = useState<[number, number] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initialize selected wells and depth range when activeFile changes
  useEffect(() => {
    if (activeFile) {
      setSelectedWells([activeFile.id]);
      const fileDepthRange: [number, number] = [
        Math.min(...activeFile.data.map(d => d.depth)),
        Math.max(...activeFile.data.map(d => d.depth))
      ];
      setDepthRange(fileDepthRange);
    }
  }, [activeFile]);

  if (!activeFile) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700 h-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-slate-700 rounded-full">
            <Maximize2 className="h-12 w-12 text-slate-500" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-300 mb-2">Advanced Visualization Suite</h3>
            <p className="text-slate-500">Select a LAS file to access 8+ visualization types with multi-well support</p>
          </div>
        </div>
      </div>
    );
  }

  const { curves, data } = activeFile;
  const visibleCurves = curves.filter(c => c.visible && c.dataType === 'log');
  
  // Get data from selected wells
  const getMultiWellData = () => {
    const wellData: any[] = [];
    
    selectedWells.forEach(wellId => {
      const well = files.find(f => f.id === wellId);
      if (well) {
        well.data.forEach(point => {
          if (!depthRange || (point.depth >= depthRange[0] && point.depth <= depthRange[1])) {
            wellData.push({
              ...point,
              wellId: well.id,
              wellName: well.header.well
            });
          }
        });
      }
    });
    
    return wellData;
  };

  const multiWellData = getMultiWellData();
  
  // Group curves by track for multi-track view
  const trackCurves = visualizationSettings.tracks.map(track => ({
    ...track,
    curves: visibleCurves.filter(curve => curve.track === track.id)
  }));

  const currentDepthRange = depthRange || [
    Math.min(...data.map(d => d.depth)),
    Math.max(...data.map(d => d.depth))
  ];

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel * 1.5, 10);
    setZoomLevel(newZoom);
    
    if (depthRange) {
      const center = (depthRange[1] + depthRange[0]) / 2;
      const range = (depthRange[1] - depthRange[0]) / 1.5;
      setDepthRange([center - range/2, center + range/2]);
    }
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.5, 0.1);
    setZoomLevel(newZoom);
    
    if (depthRange && activeFile) {
      const center = (depthRange[1] + depthRange[0]) / 2;
      const range = (depthRange[1] - depthRange[0]) * 1.5;
      const fullRange = Math.max(...activeFile.data.map(d => d.depth)) - Math.min(...activeFile.data.map(d => d.depth));
      const newRange = Math.min(range, fullRange);
      setDepthRange([center - newRange/2, center + newRange/2]);
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset(0);
    if (activeFile) {
      setDepthRange([
        Math.min(...activeFile.data.map(d => d.depth)),
        Math.max(...activeFile.data.map(d => d.depth))
      ]);
    }
  };

  const handleResetVisualization = () => {
    setVisualizationType('multi-track');
    setSelectedCurves(['GR', 'NPHI', 'RHOB']);
    setZoomLevel(1);
    setPanOffset(0);
    if (activeFile) {
      setDepthRange([
        Math.min(...activeFile.data.map(d => d.depth)),
        Math.max(...activeFile.data.map(d => d.depth))
      ]);
    }
    console.log('Visualization reset to defaults');
  };

  const handleResetAll = () => {
    // Reset everything including file selection
    setActiveFile(null);
    setSelectedWells([]);
    setVisualizationType('multi-track');
    setSelectedCurves(['GR', 'NPHI', 'RHOB']);
    setZoomLevel(1);
    setPanOffset(0);
    setDepthRange(null);
    console.log('Complete reset performed');
  };

  const visualizationTypes = [
    { id: 'multi-track', name: 'Multi-Track', icon: Layers, description: 'Professional well log display' },
    { id: 'line-chart', name: 'Line Chart', icon: LineChart, description: 'Time series visualization' },
    { id: 'scatter-plot', name: 'Scatter Plot', icon: Scatter3D, description: 'Cross-plot analysis' },
    { id: 'histogram', name: 'Histogram', icon: BarChart3, description: 'Data distribution' },
    { id: 'crossplot', name: 'Crossplot Matrix', icon: Grid3X3, description: 'Multi-curve correlation' },
    { id: 'radar-chart', name: 'Radar Chart', icon: Activity, description: 'Multi-dimensional view' },
    { id: 'area-chart', name: 'Area Chart', icon: TrendingUp, description: 'Filled curves' },
    { id: 'correlation-matrix', name: 'Correlation', icon: Grid3X3, description: 'Statistical correlation' }
  ];

  const renderVisualization = () => {
    const chartData = multiWellData.map(d => ({
      depth: d.depth,
      wellName: d.wellName,
      ...selectedCurves.reduce((acc, curve) => {
        acc[curve] = d[curve];
        return acc;
      }, {} as any)
    }));

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    const wellColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];

    switch (visualizationType) {
      case 'multi-track':
        return renderMultiTrackView();
      
      case 'line-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="depth" 
                stroke="#9CA3AF"
                label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9CA3AF" />
              {selectedWells.length > 1 ? (
                // Multi-well display
                selectedWells.map((wellId, wellIndex) => 
                  selectedCurves.map((curve, curveIndex) => (
                    <Line
                      key={`${wellId}-${curve}`}
                      type="monotone"
                      dataKey={curve}
                      stroke={wellColors[wellIndex % wellColors.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls={false}
                      strokeDasharray={curveIndex > 0 ? "5,5" : "0"}
                      data={chartData.filter(d => d.wellName === files.find(f => f.id === wellId)?.header.well)}
                    />
                  ))
                )
              ) : (
                // Single well display
                selectedCurves.map((curve, index) => (
                  <Line
                    key={curve}
                    type="monotone"
                    dataKey={curve}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    connectNulls={false}
                  />
                ))
              )}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      
      case 'scatter-plot':
        if (selectedCurves.length < 2) {
          return (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>Select at least 2 curves for scatter plot</p>
            </div>
          );
        }
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey={selectedCurves[0]} 
                stroke="#9CA3AF"
                label={{ value: selectedCurves[0], position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey={selectedCurves[1]}
                stroke="#9CA3AF"
                label={{ value: selectedCurves[1], angle: -90, position: 'insideLeft' }}
              />
              {selectedWells.length > 1 ? (
                selectedWells.map((wellId, index) => (
                  <Scatter 
                    key={wellId}
                    dataKey={selectedCurves[1]} 
                    fill={wellColors[index % wellColors.length]}
                    fillOpacity={0.6}
                    data={chartData.filter(d => d.wellName === files.find(f => f.id === wellId)?.header.well)}
                  />
                ))
              ) : (
                <Scatter 
                  dataKey={selectedCurves[1]} 
                  fill={colors[0]}
                  fillOpacity={0.6}
                />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'histogram':
        const histogramData = selectedCurves.map(curve => {
          const values = multiWellData.map(d => d[curve]).filter(v => v !== null && v !== undefined);
          const bins = 20;
          const min = Math.min(...values);
          const max = Math.max(...values);
          const binSize = (max - min) / bins;
          
          const histogram = Array.from({ length: bins }, (_, i) => {
            const binStart = min + i * binSize;
            const binEnd = binStart + binSize;
            const count = values.filter(v => v >= binStart && v < binEnd).length;
            return {
              bin: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
              count,
              curve
            };
          });
          
          return { curve, data: histogram };
        });

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full p-4">
            {histogramData.map((hist, index) => (
              <div key={hist.curve} className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">{hist.curve} Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hist.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="bin" stroke="#9CA3AF" fontSize={10} />
                    <YAxis stroke="#9CA3AF" />
                    <Bar dataKey="count" fill={colors[index % colors.length]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        );
      
      case 'crossplot':
        if (selectedCurves.length < 3) {
          return (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>Select at least 3 curves for crossplot matrix</p>
            </div>
          );
        }
        
        return (
          <div className="grid grid-cols-3 gap-2 h-full p-4">
            {selectedCurves.map((curveX, i) =>
              selectedCurves.map((curveY, j) => {
                if (i >= j) return <div key={`${i}-${j}`} className="bg-slate-700/20 rounded"></div>;
                
                return (
                  <div key={`${i}-${j}`} className="bg-slate-700/30 rounded-lg p-2">
                    <div className="text-xs text-slate-400 mb-1">{curveY} vs {curveX}</div>
                    <ResponsiveContainer width="100%" height={120}>
                      <ScatterChart data={chartData}>
                        <XAxis dataKey={curveX} hide />
                        <YAxis dataKey={curveY} hide />
                        <Scatter dataKey={curveY} fill={colors[i % colors.length]} fillOpacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                );
              })
            )}
          </div>
        );
      
      case 'radar-chart':
        const radarData = multiWellData.slice(0, 10).map((d, index) => {
          const point: any = { depth: d.depth, wellName: d.wellName };
          selectedCurves.forEach(curve => {
            // Normalize values to 0-100 scale for radar chart
            const values = multiWellData.map(item => item[curve]).filter(v => v !== null && v !== undefined);
            const min = Math.min(...values);
            const max = Math.max(...values);
            point[curve] = ((d[curve] - min) / (max - min)) * 100;
          });
          return point;
        });

        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="depth" stroke="#9CA3AF" />
              <PolarRadiusAxis stroke="#9CA3AF" />
              {selectedCurves.map((curve, index) => (
                <Radar
                  key={curve}
                  name={curve}
                  dataKey={curve}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.1}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'area-chart':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="depth" 
                stroke="#9CA3AF"
                label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis stroke="#9CA3AF" />
              {selectedCurves.map((curve, index) => (
                <Area
                  key={curve}
                  type="monotone"
                  dataKey={curve}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'correlation-matrix':
        const correlationMatrix = calculateCorrelationMatrix(multiWellData, selectedCurves);
        
        return (
          <div className="p-4 h-full overflow-auto">
            <h4 className="text-white font-medium mb-4">Correlation Matrix</h4>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${selectedCurves.length + 1}, 1fr)` }}>
              <div></div>
              {selectedCurves.map(curve => (
                <div key={curve} className="text-xs text-slate-300 text-center p-2 font-medium">
                  {curve}
                </div>
              ))}
              {selectedCurves.map(curveY => (
                <React.Fragment key={curveY}>
                  <div className="text-xs text-slate-300 p-2 font-medium">{curveY}</div>
                  {selectedCurves.map(curveX => {
                    const correlation = correlationMatrix[curveY]?.[curveX] || 0;
                    const intensity = Math.abs(correlation);
                    const color = correlation > 0 ? 'bg-blue-500' : 'bg-red-500';
                    
                    return (
                      <div
                        key={`${curveY}-${curveX}`}
                        className={`${color} rounded text-white text-xs text-center p-2 font-medium`}
                        style={{ opacity: intensity }}
                      >
                        {correlation.toFixed(2)}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      
      default:
        return renderMultiTrackView();
    }
  };

  const renderMultiTrackView = () => (
    <div className="flex overflow-x-auto h-full">
      {/* Depth Track */}
      <div className="flex-shrink-0 w-20 bg-slate-900 border-r border-slate-600">
        <div className="h-8 bg-slate-800 border-b border-slate-600 flex items-center justify-center">
          <span className="text-xs font-medium text-slate-300">DEPTH</span>
        </div>
        <div className="h-full relative">
          <svg width="100%" height="100%" className="absolute inset-0">
            {Array.from({ length: 10 }, (_, i) => {
              const depth = currentDepthRange[0] + (currentDepthRange[1] - currentDepthRange[0]) * (i / 9);
              const y = (i / 9) * 100;
              return (
                <g key={i}>
                  <line
                    x1="60"
                    y1={`${y}%`}
                    x2="80"
                    y2={`${y}%`}
                    stroke="#475569"
                    strokeWidth="1"
                  />
                  <text
                    x="55"
                    y={`${y}%`}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="text-xs fill-slate-400"
                  >
                    {depth.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Data Tracks */}
      {trackCurves.map((track) => (
        <div key={track.id} className="flex-shrink-0 border-r border-slate-600" style={{ width: track.width }}>
          <div className="h-8 bg-slate-800 border-b border-slate-600 px-2 flex items-center justify-center">
            <span className="text-xs font-medium text-slate-300 truncate">{track.name}</span>
          </div>
          
          <div className="h-full relative" style={{ backgroundColor: track.backgroundColor }}>
            <svg width="100%" height="100%" className="absolute inset-0">
              {track.gridLines && (
                <g>
                  {Array.from({ length: 5 }, (_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={`${(i / 4) * 100}%`}
                      x2="100%"
                      y2={`${(i / 4) * 100}%`}
                      stroke="#374151"
                      strokeWidth="0.5"
                      opacity="0.5"
                    />
                  ))}
                  {Array.from({ length: 4 }, (_, i) => (
                    <line
                      key={i}
                      x1={`${((i + 1) / 5) * 100}%`}
                      y1="0"
                      x2={`${((i + 1) / 5) * 100}%`}
                      y2="100%"
                      stroke="#374151"
                      strokeWidth="0.5"
                      opacity="0.3"
                    />
                  ))}
                </g>
              )}

              {track.curves.map((curve) => {
                const curveData = multiWellData.map(d => ({
                  depth: d.depth,
                  value: d[curve.mnemonic],
                  wellId: d.wellId
                })).filter(d => d.value !== null && d.value !== undefined);

                if (curveData.length === 0) return null;

                const values = curveData.map(d => d.value);
                const minVal = curve.minValue ?? Math.min(...values);
                const maxVal = curve.maxValue ?? Math.max(...values);

                // Group by well for multi-well display
                const wellGroups = selectedWells.map(wellId => ({
                  wellId,
                  data: curveData.filter(d => d.wellId === wellId)
                }));

                return wellGroups.map((wellGroup, wellIndex) => {
                  if (wellGroup.data.length === 0) return null;

                  const pathData = wellGroup.data.map((point, i) => {
                    const x = track.scale === 'logarithmic' 
                      ? (Math.log10(point.value) - Math.log10(minVal)) / (Math.log10(maxVal) - Math.log10(minVal)) * 100
                      : ((point.value - minVal) / (maxVal - minVal)) * 100;
                    const y = ((point.depth - currentDepthRange[0]) / (currentDepthRange[1] - currentDepthRange[0])) * 100;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ');

                  const wellColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];
                  const strokeColor = selectedWells.length > 1 
                    ? wellColors[wellIndex % wellColors.length] 
                    : curve.color;

                  return (
                    <path
                      key={`${curve.mnemonic}-${wellGroup.wellId}`}
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="2"
                      opacity="0.9"
                      strokeDasharray={wellIndex > 0 ? "5,5" : "0"}
                    />
                  );
                });
              })}
            </svg>

            <div className="absolute bottom-1 left-1 right-1 flex justify-between text-xs text-slate-400">
              {track.curves.length > 0 && (
                <>
                  <span>{track.curves[0].minValue?.toFixed(1) ?? '0'}</span>
                  <span>{track.curves[0].maxValue?.toFixed(1) ?? '100'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const calculateCorrelationMatrix = (data: any[], curves: string[]) => {
    const matrix: Record<string, Record<string, number>> = {};
    
    curves.forEach(curveY => {
      matrix[curveY] = {};
      curves.forEach(curveX => {
        const valuesX = data.map(d => d[curveX]).filter(v => v !== null && v !== undefined);
        const valuesY = data.map(d => d[curveY]).filter(v => v !== null && v !== undefined);
        
        if (valuesX.length === 0 || valuesY.length === 0) {
          matrix[curveY][curveX] = 0;
          return;
        }
        
        const meanX = valuesX.reduce((a, b) => a + b, 0) / valuesX.length;
        const meanY = valuesY.reduce((a, b) => a + b, 0) / valuesY.length;
        
        let numerator = 0;
        let denomX = 0;
        let denomY = 0;
        
        for (let i = 0; i < Math.min(valuesX.length, valuesY.length); i++) {
          const diffX = valuesX[i] - meanX;
          const diffY = valuesY[i] - meanY;
          numerator += diffX * diffY;
          denomX += diffX * diffX;
          denomY += diffY * diffY;
        }
        
        const correlation = numerator / Math.sqrt(denomX * denomY);
        matrix[curveY][curveX] = isNaN(correlation) ? 0 : correlation;
      });
    });
    
    return matrix;
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Advanced Visualization Suite</h3>
            <p className="text-sm text-slate-400">
              {selectedWells.length > 1 ? `${selectedWells.length} wells selected` : activeFile.header.well} • 
              {currentDepthRange[0].toFixed(1)}m - {currentDepthRange[1].toFixed(1)}m
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomIn}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetVisualization}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Visualization"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetAll}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Reset Everything"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Multi-Well Selection */}
        {files.length > 1 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Well Selection (Multi-Well Analysis)</h4>
            <div className="flex flex-wrap gap-2">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    setSelectedWells(prev => 
                      prev.includes(file.id)
                        ? prev.filter(id => id !== file.id)
                        : prev.length < 4 ? [...prev, file.id] : prev // Limit to 4 wells
                    );
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    selectedWells.includes(file.id)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  disabled={!selectedWells.includes(file.id) && selectedWells.length >= 4}
                >
                  <span>{file.header.well}</span>
                  {file.processed && <span className="text-xs opacity-70">✓</span>}
                </button>
              ))}
            </div>
            {selectedWells.length >= 4 && (
              <p className="text-xs text-yellow-400 mt-1">Maximum 4 wells can be compared simultaneously</p>
            )}
          </div>
        )}

        {/* Visualization Type Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {visualizationTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setVisualizationType(type.id as VisualizationType)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  visualizationType === type.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                title={type.description}
              >
                <Icon className="h-3 w-3" />
                <span>{type.name}</span>
              </button>
            );
          })}
        </div>

        {/* Curve Selection for non-multi-track views */}
        {visualizationType !== 'multi-track' && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-white mb-2">Select Curves for Analysis</h4>
            <div className="flex flex-wrap gap-2">
              {curves.filter(c => c.dataType === 'log').map((curve) => (
                <button
                  key={curve.mnemonic}
                  onClick={() => {
                    setSelectedCurves(prev => 
                      prev.includes(curve.mnemonic)
                        ? prev.filter(c => c !== curve.mnemonic)
                        : [...prev, curve.mnemonic]
                    );
                  }}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    selectedCurves.includes(curve.mnemonic)
                      ? 'text-white shadow-lg'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                  style={{
                    backgroundColor: selectedCurves.includes(curve.mnemonic) ? curve.color : undefined,
                    boxShadow: selectedCurves.includes(curve.mnemonic) ? `0 0 20px ${curve.color}40` : undefined
                  }}
                >
                  <span>{curve.mnemonic}</span>
                  <span className="text-xs opacity-70">({curve.unit})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Multi-track curve controls */}
        {visualizationType === 'multi-track' && (
          <div>
            <h4 className="text-sm font-medium text-white mb-2">Curve Visibility</h4>
            <div className="flex flex-wrap gap-2">
              {curves.filter(c => c.dataType === 'log').map((curve) => (
                <button
                  key={curve.mnemonic}
                  onClick={() => toggleCurveVisibility(curve.mnemonic)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    curve.visible
                      ? 'text-white shadow-lg'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  }`}
                  style={{
                    backgroundColor: curve.visible ? curve.color : undefined,
                    boxShadow: curve.visible ? `0 0 20px ${curve.color}40` : undefined
                  }}
                >
                  {curve.visible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  <span>{curve.mnemonic}</span>
                  <span className="text-xs opacity-70">({curve.unit})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visualization Content */}
      <div className="flex-1 overflow-hidden">
        {renderVisualization()}
      </div>

      {/* Statistics Footer */}
      <div className="p-4 border-t border-slate-700 bg-slate-700/20 flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(visualizationType === 'multi-track' ? 
            trackCurves.filter(track => track.curves.length > 0) :
            selectedCurves.slice(0, 5)
          ).map((item, index) => {
            const curveName = typeof item === 'string' ? item : item.curves[0]?.mnemonic;
            if (!curveName) return null;
            
            const values = multiWellData.map(d => d[curveName]).filter(v => v !== null && v !== undefined);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            const min = Math.min(...values);
            const max = Math.max(...values);
            const curve = curves.find(c => c.mnemonic === curveName);
            
            return (
              <div key={curveName} className="bg-slate-700/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: curve?.color || '#64748b' }}
                  />
                  <span>{curveName}</span>
                  {selectedWells.length > 1 && (
                    <span className="text-xs text-slate-400">({selectedWells.length} wells)</span>
                  )}
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Avg:</span>
                    <span className="font-medium">{avg.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Range:</span>
                    <span>{min.toFixed(1)} - {max.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};