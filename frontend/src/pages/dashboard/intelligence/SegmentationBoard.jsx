import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList, Legend } from 'recharts';
import { setActiveSegment } from '../../../redux/features/intelligence/intelligenceSlice';
import { getSegmentColor } from '../../../utils/chartColors';

const SegmentationBoard = ({ data }) => {
    const dispatch = useDispatch();
    const activeSegment = useSelector((state) => state.intelligence.activeSegment);

    const { segmentDistribution, topBooksBySegment } = data;

    // KPI: Current segment revenue
    let selectedRevenue = 0;
    if (activeSegment === 'All') {
        selectedRevenue = segmentDistribution.reduce((acc, curr) => acc + curr.revenue, 0);
    } else {
        const found = segmentDistribution.find(s => s._id === activeSegment);
        selectedRevenue = found ? found.revenue : 0;
    }

    // Filter bar chart depending on pie segment selection
    const filteredBooks = activeSegment === 'All' 
        ? topBooksBySegment 
        : topBooksBySegment.filter(b => b.segment === activeSegment);

    // Aggregate books across segments if 'All' is selected
    let displayBooks = [];
    if (activeSegment === 'All') {
        const bookMap = {};
        filteredBooks.forEach(b => {
            if (!bookMap[b.title]) bookMap[b.title] = 0;
            bookMap[b.title] += b.totalUnits;
        });
        displayBooks = Object.keys(bookMap).map(title => ({ title, totalUnits: bookMap[title] }));
        displayBooks.sort((a, b) => b.totalUnits - a.totalUnits);
    } else {
        displayBooks = [...filteredBooks].sort((a, b) => b.totalUnits - a.totalUnits);
    }
    
    // Take Top 5 for visual fidelity (matching RegionalBoard)
    const chartBooks = displayBooks.slice(0, 5);

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col font-sans transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Segment Profile</h2>
                    <p className="text-xs text-slate-500">Interactive demographic footprint.</p>
                </div>
            </div>

            <div className="flex-grow flex flex-col gap-6 w-full">
                {/* Demographic Pie with KPI Hero */}
                <div className="h-72 w-full cursor-pointer relative flex justify-center items-center">
                    {/* KPI Hero Centered Element */}
                    <div className="absolute top-0 left-0 w-[70%] h-full flex flex-col items-center justify-center pointer-events-none pb-2 text-center z-10 pl-[4%]">
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">
                            {activeSegment === 'All' ? 'ALL REVENUE' : activeSegment}
                        </p>
                        <p className="text-[16px] font-black text-slate-800 font-mono tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedRevenue)}
                        </p>
                        {activeSegment !== 'All' && (
                            <button onClick={(e) => { e.stopPropagation(); dispatch(setActiveSegment('All')); }} className="mt-1 pointer-events-auto px-3 py-0.5 bg-slate-100 text-slate-500 hover:text-slate-700 rounded-full text-[10px] font-bold transition-colors shadow-sm">Reset Filter</button>
                        )}
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 30, bottom: 30, left: 65 }}>
                            <Pie
                                data={segmentDistribution}
                                dataKey="count"
                                nameKey="_id"
                                cx="38.5%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                paddingAngle={2}
                                onClick={(entry) => dispatch(setActiveSegment(entry._id))}
                                stroke="none"
                                label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                                {segmentDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getSegmentColor(entry._id)} />
                                ))}
                            </Pie>
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ fontFamily: 'inherit', borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend 
                                layout="vertical" 
                                align="right" 
                                verticalAlign="middle" 
                                wrapperStyle={{ fontSize: '10px', fontFamily: 'inherit', fontWeight: 'bold', color: '#64748b' }} 
                                iconType="circle" 
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Books Bar */}
                <div className="h-56 border-t border-slate-100 pt-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                        Top Books for {activeSegment === 'All' ? 'Everyone' : activeSegment}
                    </h3>
                    {chartBooks.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-300 text-xs font-medium">No books mapped to this demographic.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartBooks} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: -10 }}>
                                <XAxis type="number" tick={{fontSize: 10, fontFamily: 'monospace', fill: '#94a3b8'}} axisLine={false} tickLine={false} stroke="#e2e8f0" />
                                <YAxis 
                                    type="category" 
                                    dataKey="title" 
                                    width={110} 
                                    tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#334155', fontWeight: '500' }} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ fontFamily: 'inherit', borderRadius: '8px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="totalUnits" fill={activeSegment === 'All' ? '#14b8a6' : getSegmentColor(activeSegment)} radius={[0, 4, 4, 0]} barSize={20}>
                                    <LabelList dataKey="totalUnits" position="right" fontSize={10} fill="#64748b" fontWeight="800" fontFamily="monospace" />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SegmentationBoard;
