import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { Eye, EyeOff, Zap, Filter } from 'lucide-react';
import { useAppStore } from '../../store';

export const DataVisualization: React.FC = () => {
  const { activeFile } = useAppStore();
  const [visibleCurves, setVisibleCurves] = useState<Set<string>>(new Set(['GR', 'NPHI', 'RHOB']));
  const [zoomRange, setZoomRange] = useState<[number, number] | null>(null);

  if (!activeFile) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 text-center">
        <Zap className="h-12 w-12 mx-auto mb-4 text-slate-600" />
        <h3 className="text-lg font-medium text-slate-400 mb-2">No Data to Display</h3>
        <p className="text-slate-500">Select a file to view well log data</p>
      </div>
    );
  }

  const { curves, data } = activeFile;
  const logCurves = curves.filter(c => c.dataType === 'log');

  const toggleCurveVisibility = (mnemonic: string) => {
    const newVisible = new Set(visibleCurves);
    if (newVisible.has(mnemonic)) {
      newVisible.delete(mnemonic);
    } else {
      newVisible.add(mnemonic);
    }
    setVisibleCurves(newVisible);
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Well Log Data</h3>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-sm text-slate-400">Filters</span>
        </div>
      </div>
      
      {/* Curve Controls */}
      <div className="mb-4 p-3 bg-slate-700 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Visible Curves</h4>
        <div className="flex flex-wrap gap-2">
          {logCurves.map((curve, index) => (
            <button
              key={curve.mnemonic}
              onClick={() => toggleCurveVisibility(curve.mnemonic)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                visibleCurves.has(curve.mnemonic)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
              }`}
            >
              {visibleCurves.has(curve.mnemonic) ? (
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

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="depth" 
              stroke="#9CA3AF"
              fontSize={12}
              label={{ value: 'Depth (m)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
            />
            
            {Array.from(visibleCurves).map((mnemonic, index) => (
              <Line
                key={mnemonic}
                type="monotone"
                dataKey={mnemonic}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            ))}
            
            <Brush
              dataKey="depth"
              height={30}
              stroke="#3B82F6"
              fill="#1E293B"
              onChange={(range) => {
                if (range && range.startIndex !== undefined && range.endIndex !== undefined) {
                  setZoomRange([range.startIndex, range.endIndex]);
                }
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from(visibleCurves).map((mnemonic, index) => {
          const values = data.map(d => d[mnemonic]).filter(v => v !== null && v !== undefined);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;
          
          return (
            <div key={mnemonic} className="bg-slate-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm font-medium text-white">{mnemonic}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Min:</span>
                  <span className="text-white">{min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span className="text-white">{max.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg:</span>
                  <span className="text-white">{avg.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};