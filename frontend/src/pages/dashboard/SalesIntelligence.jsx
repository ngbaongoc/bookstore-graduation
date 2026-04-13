import React, { useState, useRef, useEffect } from 'react';
import { useGetDashboardStatsQuery } from '../../redux/features/stats/statsApi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { MdTrendingUp, MdShoppingCart, MdCancel, MdCalendarToday, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { DayPicker } from 'react-day-picker';
import { format, subMonths, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';
import formatCurrency from '../../utils/formatCurrency';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const SalesIntelligence = () => {
    const [range, setRange] = useState('Month');
    const [selectedRange, setSelectedRange] = useState({ from: undefined, to: undefined });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
    const [showCalendar, setShowCalendar] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const calendarRef = useRef(null);
    const yearPickerRef = useRef(null);
    const monthPickerRef = useRef(null);

    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

    // Generate list of years from 2023 to current year
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i);

    // Build date range for a specific month
    const getMonthBounds = (year, month) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999); // Last day of month
        return { start, end };
    };

    const rangeParams = {
        range,
        startDate: range === 'Year'
            ? `${selectedYear}-01-01`
            : range === 'Month'
                ? format(getMonthBounds(selectedYear, selectedMonth).start, 'yyyy-MM-dd')
                : (selectedRange.from ? format(selectedRange.from, 'yyyy-MM-dd') : undefined),
        endDate: range === 'Year'
            ? `${selectedYear}-12-31`
            : range === 'Month'
                ? format(getMonthBounds(selectedYear, selectedMonth).end, 'yyyy-MM-dd')
                : (selectedRange.to ? format(selectedRange.to, 'yyyy-MM-dd') : undefined),
    };

    const { data: stats, isLoading, error } = useGetDashboardStatsQuery(rangeParams, {
        pollingInterval: 300000 // Poll every 5 minutes
    });

    // Close pickers when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) setShowCalendar(false);
            if (yearPickerRef.current && !yearPickerRef.current.contains(event.target)) setShowYearPicker(false);
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) setShowMonthPicker(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleRangeSelect = (newRange) => {
        setRange(newRange);
        setSelectedRange({ from: undefined, to: undefined });
        if (newRange === 'Year') {
            setShowCalendar(false); setShowMonthPicker(false); setShowYearPicker(true);
        } else if (newRange === 'Month') {
            setShowCalendar(false); setShowYearPicker(false); setShowMonthPicker(true);
        } else {
            setShowCalendar(false); setShowYearPicker(false); setShowMonthPicker(false);
        }
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setRange('Year');
        setShowYearPicker(false);
    };

    const handleMonthSelect = (monthIndex) => {
        setSelectedMonth(monthIndex);
        setRange('Month');
        setShowMonthPicker(false);
    };

    const handleCalendarSelect = (rangeSelection) => {
        if (!rangeSelection) return;
        
        setSelectedRange(rangeSelection);
        
        // If it's a single day or a complete range, we set to 'Custom'
        if (rangeSelection.from) {
            setRange('Custom');
        }
        
        // Auto-close if it's a range selection and both are picked
        if (rangeSelection.from && rangeSelection.to && !isSameDay(rangeSelection.from, rangeSelection.to)) {
             // Let user see the selection for a moment
             // setShowCalendar(false); 
        }
    };

    const getRangeDisplay = () => {
        if (range === 'Year') return `${selectedYear}`;
        if (range === 'Month') return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
        if (range === 'Custom' && selectedRange.from) {
            if (selectedRange.to && !isSameDay(selectedRange.from, selectedRange.to)) {
                return `${format(selectedRange.from, 'MMM d')} - ${format(selectedRange.to, 'MMM d, yyyy')}`;
            }
            return format(selectedRange.from, 'MMMM d, yyyy');
        }
        return range;
    };

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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                        Sales Intelligence & Operations
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{getRangeDisplay()}</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Aggregating real-time business insights from MongoDB</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-gray-200 rounded-xl p-1.5 shadow-sm ring-1 ring-black/5 relative">

                        {/* Month Picker */}
                        <div className="relative" ref={monthPickerRef}>
                            <button
                                onClick={() => { setRange('Month'); setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); setShowCalendar(false); }}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all transform active:scale-95 ${
                                    range === 'Month' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {range === 'Month' ? MONTH_NAMES[selectedMonth].slice(0,3) : 'Month'}
                            </button>

                            {showMonthPicker && (
                                <div className="absolute left-0 top-full mt-2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 p-3 w-48">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-1">Select Month</p>
                                    <div className="grid grid-cols-3 gap-1">
                                        {MONTH_NAMES.map((name, i) => (
                                            <button
                                                key={name}
                                                onClick={() => handleMonthSelect(i)}
                                                className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                    selectedMonth === i && range === 'Month'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {name.slice(0, 3)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Year Picker */}
                        <div className="relative" ref={yearPickerRef}>
                            <button
                                onClick={() => { setRange('Year'); setShowYearPicker(!showYearPicker); setShowMonthPicker(false); setShowCalendar(false); }}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all transform active:scale-95 ${
                                    range === 'Year' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {range === 'Year' ? selectedYear : 'Year'}
                            </button>

                            {showYearPicker && (
                                <div className="absolute right-0 top-full mt-2 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 p-3 min-w-[120px]">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 px-1">Select Year</p>
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => handleYearSelect(year)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                                                selectedYear === year && range === 'Year'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Calendar Toggle */}
                    <div className="relative" ref={calendarRef}>
                        <button
                            onClick={() => setShowCalendar(!showCalendar)}
                            className={`p-3 rounded-xl border transition-all flex items-center gap-2 font-bold text-sm ${
                                range === 'Custom' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 shadow-sm'
                            }`}
                        >
                            <MdCalendarToday className="text-lg" />
                            <span className="hidden sm:inline">Calendar</span>
                        </button>

                        {showCalendar && (
                            <div className="absolute right-0 mt-3 z-50 bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 animate-in fade-in zoom-in duration-200 origin-top-right">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <h4 className="font-bold text-gray-800">Select Date Range</h4>
                                    <button 
                                        onClick={() => handleRangeSelect('Month')}
                                        className="text-[10px] uppercase font-bold text-blue-600 hover:underline"
                                    >
                                        Reset to Month
                                    </button>
                                </div>
                                <DayPicker
                                    mode="range"
                                    selected={selectedRange}
                                    onSelect={handleCalendarSelect}
                                    defaultMonth={new Date(selectedYear, selectedMonth, 1)}
                                    footer={
                                        selectedRange?.from ? (
                                            <p className="text-[11px] text-gray-500 mt-4 px-2 font-medium">
                                                {selectedRange.to ? `${format(selectedRange.from, 'PP')} - ${format(selectedRange.to, 'PP')}` : format(selectedRange.from, 'PP')}
                                            </p>
                                        ) : (
                                            <p className="text-[11px] text-gray-500 mt-4 px-2 font-medium">Please pick the first day.</p>
                                        )
                                    }
                                    styles={{
                                        caption: { color: '#1e293b' },
                                        head_cell: { color: '#64748b', fontSize: '12px' }
                                    }}
                                    className="border-none"
                                />
                                <div className="flex gap-2 mt-4 px-2 pb-2">
                                    <button 
                                        disabled={!selectedRange?.from}
                                        onClick={() => setShowCalendar(false)}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Top Row: Value Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                <ValueCard 
                    title={`${range === 'Custom' ? 'Period' : range === 'Day' ? "Today's" : range + "'s"} Revenue`} 
                    value={formatCurrency(cards.todayRevenue)} 
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
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-widest">Revenue (VND)</span>
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
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} tickFormatter={(value) => value.toLocaleString('vi-VN')} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    cursor={{ stroke: '#2563eb', strokeWidth: 1 }}
                                    formatter={(value) => [formatCurrency(value), "Revenue"]}
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
