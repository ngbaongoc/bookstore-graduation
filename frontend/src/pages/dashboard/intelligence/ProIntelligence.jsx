import React, { useState } from 'react';
import { FiAlertTriangle, FiClock, FiTrendingUp, FiTrendingDown, FiDownload, FiUsers } from 'react-icons/fi';

const ProIntelligence = ({ data }) => {
    const { goldenWindow, churnWarningEmails, inventoryHealth } = data;
    const [viewEmails, setViewEmails] = useState(false);

    // Churn Risk Assessment
    const totalRisks = churnWarningEmails?.length || 0;
    const churnUrgency = totalRisks > 10 ? 'High' : totalRisks > 0 ? 'Medium' : 'Low';

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," + 
            "Username,Email,Phone\n" + 
            churnWarningEmails.map(u => `${u.username},${u.email},${u.phone}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "at_risk_customers.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
            
            {/* Churn Warning System */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-400" />
                <div className="absolute top-4 right-4 text-orange-100 text-6xl pointer-events-none select-none">
                    <FiAlertTriangle />
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                    <FiAlertTriangle className="text-orange-500" />
                    <h3 className="text-slate-800 font-bold text-lg">Churn Warning System</h3>
                </div>
                <p className="text-slate-500 text-xs mb-6">Users categorized as 'At Risk'.</p>
                
                <div className="flex flex-col gap-6 flex-grow justify-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                                className={`h-full ${totalRisks > 10 ? 'bg-red-500' : 'bg-orange-500'} transition-all duration-1000`} 
                                style={{ width: `${Math.min(totalRisks * 5, 100)}%` }} 
                            />
                        </div>
                        <span className="font-black text-slate-800 text-2xl tabular-nums">{totalRisks} <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">User{totalRisks !== 1 ? 's' : ''}</span></span>
                    </div>

                    <div className="flex gap-3 mt-auto">
                        <button 
                            onClick={() => setViewEmails(!viewEmails)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            disabled={totalRisks === 0}
                        >
                            <FiUsers />
                            {viewEmails ? 'Hide Hub' : 'Contact Hub'}
                        </button>
                        {totalRisks > 0 && (
                            <button 
                                onClick={handleExport}
                                className="border-2 border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-2"
                            >
                                <FiDownload />
                                Export
                            </button>
                        )}
                    </div>
                </div>

                {viewEmails && totalRisks > 0 && (
                    <div className="mt-4 max-h-32 overflow-y-auto text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 relative z-10 font-mono">
                        {churnWarningEmails.map((u, i) => (
                            <div key={i} className="flex justify-between border-b border-slate-200 py-1.5 last:border-0 last:pb-0">
                                <b className="text-slate-700 font-sans">{u.username}</b> <span className="text-slate-500">{u.email}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* The Golden Window */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col transition-shadow hover:shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-500" />
                <div className="absolute -bottom-4 -right-4 text-indigo-50 text-8xl pointer-events-none select-none">
                    <FiClock />
                </div>

                <div className="flex items-center gap-2 mb-1 relative z-10">
                    <FiClock className="text-indigo-600" />
                    <h3 className="text-slate-800 font-bold text-lg">The Golden Window</h3>
                </div>
                <p className="text-slate-500 text-xs mb-6 relative z-10">Avg delay between 1st & 2nd purchase.</p>
                
                <div className="flex flex-col items-center justify-center mt-2 relative z-10 flex-grow">
                    <span className="text-6xl font-black text-indigo-600 mb-2 tabular-nums tracking-tighter">{goldenWindow}</span>
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Days</span>
                </div>
                
                <p className="text-[11px] text-slate-500 mt-6 text-center leading-relaxed font-medium relative z-10">
                    Trigger automated drip-campaigns perfectly around day <span className="text-indigo-600 font-bold tabular-nums">{goldenWindow}</span> to capture returning phenomenons.
                </p>
            </div>

            {/* Inventory Predictor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col relative overflow-hidden transition-shadow hover:shadow-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
                
                <div className="flex items-center gap-2 mb-1">
                    <FiTrendingUp className="text-emerald-500" />
                    <h3 className="text-slate-800 font-bold text-lg">Inventory Predictor</h3>
                </div>
                <p className="text-slate-500 text-xs mb-5">Stock health mapped to recent momentum.</p>

                <div className="flex-1 flex flex-col gap-4 relative z-10">
                    {/* Heroes Container */}
                    <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex-1 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                            <span className="flex items-center gap-1"><FiTrendingUp className="text-emerald-500 text-sm" /> Heroes (Restock)</span>
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full tabular-nums">{inventoryHealth.heroes.length}</span>
                        </div>
                        <ul className="text-xs text-slate-700 space-y-2 flex-grow">
                            {inventoryHealth.heroes.slice(0,2).map((h, i) => (
                                <li key={i} className="flex justify-between items-center border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                                    <span className="font-semibold truncate max-w-[150px]">{h.title}</span> 
                                    <span className="text-[10px] text-slate-400 font-mono">Stock: {h.stock}</span>
                                </li>
                            ))}
                            {inventoryHealth.heroes.length > 2 && <li className="text-slate-400 text-[10px] italic pt-1">+ {inventoryHealth.heroes.length - 2} more...</li>}
                        </ul>
                    </div>

                    {/* Deadwood Container */}
                    <div className="bg-white border border-slate-100 shadow-sm p-4 rounded-xl flex-1 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                            <span className="flex items-center gap-1"><FiTrendingDown className="text-slate-400 text-sm" /> Deadwood (Discount)</span>
                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full tabular-nums">{inventoryHealth.deadwood.length}</span>
                        </div>
                        <ul className="text-xs text-slate-600 space-y-2 flex-grow">
                            {inventoryHealth.deadwood.slice(0,2).map((h, i) => (
                                <li key={i} className="flex justify-between items-center border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                                    <span className="font-medium truncate max-w-[150px]">{h.title}</span> 
                                    <span className="text-[10px] text-slate-400 font-mono">Stock: {h.stock}</span>
                                </li>
                            ))}
                            {inventoryHealth.deadwood.length > 2 && <li className="text-slate-400 text-[10px] italic pt-1">+ {inventoryHealth.deadwood.length - 2} more...</li>}
                        </ul>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProIntelligence;
