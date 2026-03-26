import React, { useState } from 'react';
import { useGetDashboardStatsQuery } from '../../redux/features/stats/statsApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MdTrendingUp, MdShoppingCart, MdInventory, MdCancel } from 'react-icons/md';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SalesIntelligence = () => {
    const [range, setRange] = useState('Month');
    const { data: stats, isLoading, error } = useGetDashboardStatsQuery(range, {
        pollingInterval: 300000 // Poll every 5 minutes
    });

    if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50 text-gray-500 animate-pulse font-medium">Loading Business Intelligence...</div>;
    if (error) return (
        <div className="p-8 max-w-lg mx-auto mt-20 bg-red-50 border border-red-200 rounded-2xl text-center">
            <MdCancel className="text-4xl text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-800 mb-2">Operational Insight Error</h2>
            <p className="text-red-600">Failed to aggregate real-time data from MongoDB. Please check server connectivity.</p>
        </div>
    );

    const { cards, salesPerformance, topBooks, regionStats, cancellationStats } = stats;

    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sales Intelligence & Operations</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Aggregating real-time business insights from MongoDB</p>
                </div>
                <div className="flex bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm ring-1 ring-black/5">
                    {['Day', 'Week', 'Month', 'Year'].map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all transform active:scale-95 ${
                                range === r ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Top Row: Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                <ValueCard 
                    title="Today's Revenue" 
                    value={`$${Number(cards.todayRevenue).toLocaleString()}`} 
                    icon={<MdTrendingUp className="text-3xl text-blue-600" />}
                    color="blue"
                />
                <ValueCard 
                    title="Total Orders" 
                    value={cards.totalOrders} 
                    icon={<MdShoppingCart className="text-3xl text-emerald-600" />}
                    color="emerald"
                />
                <ValueCard 
                    title="Active Reserved Units" 
                    value={cards.activeReservedUnits} 
                    icon={<MdInventory className="text-3xl text-amber-600" />}
                    color="amber"
                />
                <ValueCard 
                    title="Cancellation Rate" 
                    value={`${cards.cancellationRate}%`} 
                    icon={<MdCancel className="text-3xl text-rose-600" />}
                    color="rose"
                />
            </div>

            {/* Middle Row: Sales Chart & Geographic Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-extrabold text-gray-800">Sales Performance</h3>
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Revenue (USD)</span>
                    </div>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} tickFormatter={(value) => `$${value}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-extrabold text-gray-800 mb-8">Most Active Regions</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={regionStats}
                                    dataKey="count"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={8}
                                    stroke="none"
                                >
                                    {regionStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px', fontWeight: 'bold' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top Books & Cancel Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-extrabold text-gray-800 mb-8">Top 5 Trending Books</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topBooks} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="title" 
                                    type="category" 
                                    width={140} 
                                    tick={{fontSize: 10, fontWeight: 700, fill: '#475569'}} 
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => val.length > 20 ? `${val.substring(0, 18)}...` : val}
                                />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', shadow: 'none', borderLeft: '4px solid #3b82f6' }}
                                />
                                <Bar dataKey="totalUnits" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={24} animationDuration={2500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col">
                    <h3 className="text-xl font-extrabold text-gray-800 mb-8">Cancellation Reason Matrix</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={cancellationStats}
                                    dataKey="count"
                                    nameKey="_id"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    stroke="white"
                                    strokeWidth={2}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                >
                                    {cancellationStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ValueCard = ({ title, value, icon, trend, color }) => {
    const colorClasses = {
        blue: "bg-blue-50 border-blue-100",
        emerald: "bg-emerald-50 border-emerald-100",
        amber: "bg-amber-50 border-amber-100",
        rose: "bg-rose-50 border-rose-100"
    };

    return (
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <div>
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h4 className="text-3xl font-black text-gray-900 leading-none">{value}</h4>
                {trend && <p className="text-xs text-green-500 mt-2 font-bold tracking-tight">{trend}</p>}
            </div>
            <div className={`p-4 rounded-2xl border ${colorClasses[color]}`}>
                {icon}
            </div>
        </div>
    );
};

export default SalesIntelligence;
