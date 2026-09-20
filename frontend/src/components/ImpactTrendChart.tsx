import React, { useState } from 'react';

interface ImpactTrendChartProps {
  onExportReport?: () => void;
  affectedTotal?: number;
}

export const ImpactTrendChart: React.FC<ImpactTrendChartProps> = ({
  onExportReport,
  affectedTotal = 0,
}) => {
  const [selectedInterval, setSelectedInterval] = useState<'12M' | '6M' | '30D' | '7D'>('12M');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Realistic student compliance trend data
  const allData = {
    '12M': [
      { name: 'Jan', affected: 18, atRisk: 22, compliant: 60 },
      { name: 'Feb', affected: 21, atRisk: 20, compliant: 59 },
      { name: 'Mar', affected: 25, atRisk: 25, compliant: 50 },
      { name: 'Apr', affected: 30, atRisk: 28, compliant: 42 },
      { name: 'May', affected: 27, atRisk: 30, compliant: 43 },
      { name: 'Jun', affected: 22, atRisk: 25, compliant: 53 },
      { name: 'Jul', affected: 35, atRisk: 30, compliant: 35 },
      { name: 'Aug', affected: 31, atRisk: 28, compliant: 41 },
      { name: 'Sep', affected: affectedTotal || 34, atRisk: 36, compliant: 58, active: true },
      { name: 'Oct', affected: 28, atRisk: 30, compliant: 42 },
      { name: 'Nov', affected: 32, atRisk: 35, compliant: 33 },
      { name: 'Dec', affected: 29, atRisk: 28, compliant: 43 },
    ],
    '6M': [
      { name: 'Jul', affected: 35, atRisk: 30, compliant: 35 },
      { name: 'Aug', affected: 31, atRisk: 28, compliant: 41 },
      { name: 'Sep', affected: affectedTotal || 34, atRisk: 36, compliant: 58, active: true },
      { name: 'Oct', affected: 28, atRisk: 30, compliant: 42 },
      { name: 'Nov', affected: 32, atRisk: 35, compliant: 33 },
      { name: 'Dec', affected: 29, atRisk: 28, compliant: 43 },
    ],
    '30D': [
      { name: 'W1', affected: 28, atRisk: 32, compliant: 40 },
      { name: 'W2', affected: 31, atRisk: 34, compliant: 35 },
      { name: 'W3', affected: 33, atRisk: 35, compliant: 32, active: true },
      { name: 'W4', affected: affectedTotal || 34, atRisk: 36, compliant: 30 },
    ],
    '7D': [
      { name: 'Mon', affected: 32, atRisk: 35, compliant: 33 },
      { name: 'Tue', affected: 33, atRisk: 35, compliant: 32 },
      { name: 'Wed', affected: 33, atRisk: 36, compliant: 31, active: true },
      { name: 'Thu', affected: affectedTotal || 34, atRisk: 36, compliant: 30 },
      { name: 'Fri', affected: 33, atRisk: 35, compliant: 32 },
      { name: 'Sat', affected: 34, atRisk: 36, compliant: 30 },
      { name: 'Sun', affected: 34, atRisk: 36, compliant: 30 },
    ],
  };

  const data = allData[selectedInterval];
  const maxVal = Math.max(...data.map((d) => d.affected + d.atRisk + d.compliant));
  const activeItem = data.find((d) => d.active) || data[data.length - 1];

  return (
    <div className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Cohort Trends Over Time</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Historical breakdown of students meeting or falling behind policy criteria</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
              <span className="text-xs text-slate-600 font-medium">Needs Attention</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-400"></span>
              <span className="text-xs text-slate-600 font-medium">Borderline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3B4F7A]"></span>
              <span className="text-xs text-slate-600 font-medium">Good Standing</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Time interval selector */}
          <div className="inline-flex bg-slate-100 rounded p-0.5">
            {(['12M', '6M', '30D', '7D'] as const).map((interval) => (
              <button
                key={interval}
                onClick={() => setSelectedInterval(interval)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  selectedInterval === interval
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {interval}
              </button>
            ))}
          </div>
          <button
            onClick={onExportReport}
            className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
            title="Export data"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-36 flex flex-col justify-between text-[10px] text-slate-300 font-medium w-8">
          <span>100</span>
          <span>75</span>
          <span>50</span>
          <span>25</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="ml-9 h-36 flex items-end gap-1 border-b border-slate-100">
          {data.map((d, idx) => {
            const total = d.affected + d.atRisk + d.compliant;
            const affH = (d.affected / maxVal) * 100;
            const riskH = (d.atRisk / maxVal) * 100;
            const compH = (d.compliant / maxVal) * 100;
            const isHovered = hoveredIdx === idx;
            const isActive = d.active;

            return (
              <div
                key={d.name}
                className="flex-1 flex flex-col items-center gap-0.5 cursor-pointer group"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] rounded px-2 py-1.5 whitespace-nowrap shadow-lg z-20 pointer-events-none">
                    <div className="font-bold mb-0.5">{d.name}: {total} students</div>
                    <div className="flex gap-2">
                      <span className="text-red-300">❌ {d.affected}</span>
                      <span className="text-amber-300">⚠ {d.atRisk}</span>
                      <span className="text-blue-300">✓ {d.compliant}</span>
                    </div>
                  </div>
                )}

                {/* Stacked bar */}
                <div
                  className={`w-full max-w-[28px] flex flex-col justify-end overflow-hidden rounded-t transition-all ${
                    isActive ? 'ring-1 ring-[#3B4F7A]/30' : ''
                  }`}
                  style={{ height: '144px' }}
                >
                  <div style={{ height: `${compH}%` }} className={`w-full transition-all ${isActive || isHovered ? 'bg-[#3B4F7A]' : 'bg-[#3B4F7A]/60'}`} />
                  <div style={{ height: `${riskH}%` }} className={`w-full transition-all ${isActive || isHovered ? 'bg-amber-400' : 'bg-amber-300/60'}`} />
                  <div style={{ height: `${affH}%` }} className={`w-full transition-all ${isActive || isHovered ? 'bg-red-500' : 'bg-red-400/60'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="ml-9 flex gap-1 mt-1">
          {data.map((d) => (
            <div key={d.name} className="flex-1 text-center">

              <span className={`text-[10px] font-medium ${d.active ? 'text-[#3B4F7A] font-bold' : 'text-slate-400'}`}>
                {d.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom summary */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Current period: <strong className="text-slate-800">{activeItem.name}</strong></span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          <strong className="text-red-700">{activeItem.affected}</strong> non-compliant of {activeItem.affected + activeItem.atRisk + activeItem.compliant} evaluated
        </span>
      </div>
    </div>
  );
};
