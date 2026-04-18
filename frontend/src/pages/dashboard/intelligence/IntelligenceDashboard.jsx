import React, { useState, useRef, useEffect } from 'react';
import { useGetAdvancedIntelligenceQuery } from '../../../redux/features/intelligence/intelligenceApi';
import SegmentationBoard from './SegmentationBoard';
import RegionalBoard from './RegionalBoard';
import CancellationAudit from './CancellationAudit';
import ProIntelligence from './ProIntelligence';
import { MdCalendarToday } from 'react-icons/md';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

const IntelligenceDashboard = () => {
    const [range, setRange] = useState('Month');
    const [selectedRange, setSelectedRange] = useState({ from: undefined, to: undefined });
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [showCalendar, setShowCalendar] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    
    const calendarRef = useRef(null);
    const yearPickerRef = useRef(null);
    const monthPickerRef = useRef(null);

    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const currentYear = new Date().getFullYear();
    const availableYears = Array.from({ length: currentYear - 2022 }, (_, i) => 2023 + i);

    const getMonthBounds = (year, month) => {
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
        return { start, end };
    };

    const rangeParams = {
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
        if (newRange === 'Year') { setShowCalendar(false); setShowMonthPicker(false); setShowYearPicker(true); }
        else if (newRange === 'Month') { setShowCalendar(false); setShowYearPicker(false); setShowMonthPicker(true); }
        else { setShowCalendar(false); setShowYearPicker(false); setShowMonthPicker(false); }
    };

    const handleYearSelect = (year) => { setSelectedYear(year); setRange('Year'); setShowYearPicker(false); };
    const handleMonthSelect = (monthIndex) => { setSelectedMonth(monthIndex); setRange('Month'); setShowMonthPicker(false); };
    const handleCalendarSelect = (rangeSelection) => {
        if (!rangeSelection) return;
        setSelectedRange(rangeSelection);
        if (rangeSelection.from) setRange('Custom');
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

    const { data: intelligenceData, isLoading, error } = useGetAdvancedIntelligenceQuery(rangeParams);

    if (isLoading) return (
        <div className="flex h-[80vh] items-center justify-center bg-gray-50/50 backdrop-blur-md">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-8 mt-12 max-w-2xl mx-auto text-red-500 bg-red-50 rounded-2xl shadow-sm border border-red-100 flex flex-col items-center">
            <h2 className="text-xl font-bold mb-2">Operational Insight Error</h2>
            <p>Failed to load advanced intelligence. Ensure backend is running.</p>
        </div>
    );

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
            {/* Header Area with Filter */}
            <div className="relative z-50 mb-8 p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-sm border border-white flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                        Sales Intelligence
                        <span className="text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{getRangeDisplay()}</span>
                    </h1>
                    <p className="text-slate-600 mt-2 text-sm font-semibold tracking-wide">Aggregating real-time business insights from MongoDB</p>
                </div>

                <div className="flex items-center gap-3 z-50">
                    <div className="flex bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                        {/* Month Picker */}
                        <div className="relative" ref={monthPickerRef}>
                            <button
                                onClick={() => { setRange('Month'); setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); setShowCalendar(false); }}
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                                    range === 'Month' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {range === 'Month' ? MONTH_NAMES[selectedMonth].slice(0,3) : 'Month'}
                            </button>
                            {showMonthPicker && (
                                <div className="absolute left-0 top-full mt-2 z-[100] bg-white shadow-2xl rounded-2xl border border-slate-100 p-3 w-48">
                                    <div className="grid grid-cols-3 gap-1">
                                        {MONTH_NAMES.map((name, i) => (
                                            <button
                                                key={name}
                                                onClick={() => handleMonthSelect(i)}
                                                className={`py-1.5 rounded-lg text-xs font-bold ${
                                                    selectedMonth === i && range === 'Month' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
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
                                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                                    range === 'Year' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                            >
                                {range === 'Year' ? selectedYear : 'Year'}
                            </button>
                            {showYearPicker && (
                                <div className="absolute right-0 top-full mt-2 z-[100] bg-white shadow-2xl rounded-2xl border border-slate-100 p-3 w-32">
                                    {availableYears.map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => handleYearSelect(year)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${
                                                selectedYear === year && range === 'Year' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
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
                            className={`p-3 rounded-xl border flex items-center gap-2 font-bold text-sm ${
                                range === 'Custom' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm'
                            }`}
                        >
                            <MdCalendarToday className="text-lg" />
                            <span className="hidden sm:inline">Calendar</span>
                        </button>

                        {showCalendar && (
                            <div className="absolute right-0 top-full mt-2 z-[100] bg-white shadow-2xl rounded-2xl border border-slate-100 p-4 w-auto">
                                <DayPicker
                                    mode="range"
                                    selected={selectedRange}
                                    onSelect={handleCalendarSelect}
                                    defaultMonth={new Date(selectedYear, selectedMonth, 1)}
                                    styles={{ head_cell: { color: '#64748b' } }}
                                    className="border-none"
                                />
                                <div className="mt-4 pt-4 border-t border-slate-100 mb-1">
                                    <button 
                                        disabled={!selectedRange?.from}
                                        onClick={() => setShowCalendar(false)}
                                        className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Pro Intelligence Modules */}
            <div className="mb-8 relative z-0">
                <ProIntelligence data={intelligenceData} />
            </div>

            {/* Primary Boards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8 relative z-0">
                <div className="xl:col-span-2">
                    <SegmentationBoard data={intelligenceData} />
                </div>
                
                <div className="xl:col-span-1">
                    <RegionalBoard data={intelligenceData} />
                </div>
                
                <div className="xl:col-span-1">
                    <CancellationAudit data={intelligenceData} />
                </div>
            </div>
        </div>
    );
};

export default IntelligenceDashboard;
