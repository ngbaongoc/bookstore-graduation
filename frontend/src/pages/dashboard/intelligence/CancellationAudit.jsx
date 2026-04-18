import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList, Legend } from 'recharts';
import { getSegmentColor } from '../../../utils/chartColors';

const COLORS = ['#f43f5e', '#f97316', '#eab308', '#0ea5e9', '#64748b'];

const CancellationAudit = ({ data }) => {
    const { cancellationReasons, cancellationBySegment, ghostedBooks } = data;

    // Filter top 10 ghosted books to fit the UI table
    const topGhosted = ghostedBooks.slice(0, 5);

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full font-sans transition-shadow hover:shadow-md">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-1">Cancellation & Risk Audit</h2>
                <p className="text-xs text-slate-500">Diagnosing abandoned checkouts and refunds.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="h-64 border border-slate-50 rounded-xl bg-slate-50/50 p-4 flex flex-col items-center">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">By Reason</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <Pie
                                data={cancellationReasons}
                                dataKey="count"
                                nameKey="_id"
                                cx="50%"
                                cy="50%"
                                innerRadius={35}
                                outerRadius={50}
                                label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            >
                                {cancellationReasons.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontFamily: 'inherit', borderRadius: '8px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'inherit', fontWeight: '500', color: '#64748b' }} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="h-64 border border-slate-50 rounded-xl bg-slate-50/50 p-4 flex flex-col items-center">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">By Segment</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cancellationBySegment} margin={{ top: 25, right: 10, left: -25, bottom: 45 }}>
                            <XAxis 
                                dataKey="_id" 
                                tick={{ fontSize: 9, fontFamily: 'inherit', fill: '#64748b', fontWeight: 500 }} 
                                angle={-45} 
                                textAnchor="end" 
                                interval={0} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis 
                                allowDecimals={false} 
                                tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#94a3b8' }} 
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{fill: '#e2e8f0'}} contentStyle={{ fontFamily: 'inherit', borderRadius: '8px', fontSize: '11px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={25}>
                                <LabelList dataKey="count" position="top" fontSize={10} fill="#64748b" fontWeight="800" fontFamily="monospace" />
                                {cancellationBySegment.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={getSegmentColor(entry._id)} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Ghosted Books Table */}
            <div className="flex-grow">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">👻 Most Ghosted Books</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-100 shadow-sm">
                    <table className="min-w-full text-left text-sm text-slate-600 bg-white" style={{ tableLayout: 'fixed' }}>
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 text-xs">
                            <tr>
                                <th className="px-4 py-3 w-1/4">Book Title</th>
                                <th className="px-4 py-3 w-1/12 text-center">Lost</th>
                                <th className="px-4 py-3 w-[28%]">Primary Canceler</th>
                                <th className="px-4 py-3 w-1/5">Reason</th>
                                <th className="px-4 py-3 w-1/5">Order ID(s)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {topGhosted.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-slate-400 text-xs font-medium">No cancellations recorded!</td>
                                </tr>
                            ) : (
                                topGhosted.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-slate-700 truncate">{item.title}</td>
                                        <td className="px-4 py-3 text-red-500 font-bold text-center font-mono">{item.cancelCount}</td>
                                        <td className="px-4 py-3">
                                            <span 
                                                className="inline-flex items-center px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full" 
                                                style={{
                                                    backgroundColor: `${getSegmentColor(item.segment)}15`, // extremely low opacity for soft pastel bg
                                                    color: getSegmentColor(item.segment),
                                                    border: `1px solid ${getSegmentColor(item.segment)}30`
                                                }}
                                            >
                                                {item.segment}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs truncate text-slate-500 font-medium">{item.reason}</td>
                                        <td className="px-4 py-3 text-[10px] truncate font-mono text-slate-400 font-bold uppercase tracking-wider">
                                            {item.orderIds ? item.orderIds.map(id => id.toString().slice(-6)).join(', ') : "Pending..."}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CancellationAudit;
