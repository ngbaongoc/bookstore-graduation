import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Legend } from 'recharts';
import { setActiveRegion } from '../../../redux/features/intelligence/intelligenceSlice';

const RegionalBoard = ({ data }) => {
    const dispatch = useDispatch();
    const activeRegion = useSelector((state) => state.intelligence.activeRegion);

    const { regionalPerformance, topBooksByRegion } = data;

    const DASHBOARD_PALETTE = [
        // Primary Blues (Top Performers)
        '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', 
        // Emerald/Greens (Healthy Growth)
        '#065f46', '#059669', '#10b981', '#34d399', '#6ee7b7',
        // Indigos/Violets (Secondary Segments)
        '#3730a3', '#4f46e5', '#6366f1', '#818cf8', '#a5b4fc',
        // Ambers/Oranges (Attention Needed)
        '#92400e', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d',
        // Slate/Greys (Low Volume/Others)
        '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1',
        // Rose/Pinks (Churn/Risk)
        '#9f1239', '#e11d48', '#f43f5e', '#fb7185', '#fda4af',
        // Cyans (New Markets)
        '#0891b2', '#06b6d4', '#22d3ee'
    ];

    // Compute Total Revenue to filter < 3% into "Others"
    const totalRegionRevenue = useMemo(() => regionalPerformance.reduce((acc, curr) => acc + curr.revenue, 0), [regionalPerformance]);
    
    const formattedRegionalData = useMemo(() => {
        let othersRevenue = 0;
        let othersAovSum = 0;
        let othersCount = 0;
        const cleaned = [];

        regionalPerformance.forEach((region) => {
            if (!region.city || region.city === 'revenue') return; // Strip out anomalies

            if ((region.revenue / totalRegionRevenue) < 0.03) {
                othersRevenue += region.revenue;
                othersAovSum += region.aov;
                othersCount += 1;
            } else {
                cleaned.push({ ...region });
            }
        });

        if (othersCount > 0) {
            cleaned.push({
                city: 'Others',
                revenue: othersRevenue,
                aov: othersAovSum / othersCount
            });
        }
        
        // Sort specifically by revenue descending
        return cleaned.sort((a, b) => b.revenue - a.revenue);
    }, [regionalPerformance, totalRegionRevenue]);


    const filteredBooks = activeRegion === 'All'
        ? topBooksByRegion
        : topBooksByRegion.filter(b => b.city === activeRegion);

    let displayBooks = [];
    if (activeRegion === 'All') {
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

    const chartBooks = displayBooks.slice(0, 5);

    // Calculate Dynamic KPI
    const selectedRegionData = formattedRegionalData.find(r => r.city === activeRegion);
    const avgOrderValue = selectedRegionData ? selectedRegionData.aov : 
                          (formattedRegionalData.reduce((acc, curr) => acc + curr.aov, 0) / (formattedRegionalData.length || 1));

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col font-sans transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">Regional Intelligence</h2>
                    <p className="text-xs text-slate-500">Geographic footprint mapping.</p>
                </div>
                {activeRegion !== 'All' && (
                    <button onClick={() => dispatch(setActiveRegion('All'))} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors">
                        Clear Filter: {activeRegion}
                    </button>
                )}
            </div>

            <div className="flex-grow flex flex-col gap-6 w-full">
                {/* Geographic Heatmap/Pie with KPI Hero */}
                <div className="h-72 w-full cursor-pointer relative flex justify-center items-center">
                    {/* KPI Hero Centered Element */}
                    <div className="absolute top-0 left-0 w-[70%] h-full flex flex-col items-center justify-center pointer-events-none pb-2 text-center">
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-0.5">Average Order</p>
                        <p className="text-[16px] font-black text-slate-800 font-mono tracking-tighter">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(avgOrderValue)}
                        </p>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 20, right: 30, bottom: 30, left: 65 }}>
                            <Pie
                                data={formattedRegionalData}
                                dataKey="revenue"
                                nameKey="city"
                                cx="35%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={95}
                                onClick={(entry) => dispatch(setActiveRegion(entry.city === 'Others' ? 'All' : entry.city))}
                                label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                                {formattedRegionalData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={DASHBOARD_PALETTE[index % DASHBOARD_PALETTE.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)} contentStyle={{ fontFamily: 'inherit', borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
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

                {/* Local Bestsellers Bar */}
                <div className="h-56 border-t border-slate-100 pt-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Local Bestsellers</h3>
                    {chartBooks.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-300 text-xs font-medium">No sales mapped to region.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartBooks} layout="vertical" margin={{ top: 0, right: 30, bottom: 0, left: -10 }}>
                                <XAxis type="number" tick={{fontSize: 10, fontFamily: 'monospace', fill: '#94a3b8'}} axisLine={false} tickLine={false} stroke="#e2e8f0" />
                                <YAxis type="category" dataKey="title" width={110} tick={{ fontSize: 11, fontFamily: 'inherit', fill: '#334155', fontWeight: '500' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ fontFamily: 'inherit', borderRadius: '8px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="totalUnits" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
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

export default RegionalBoard;
