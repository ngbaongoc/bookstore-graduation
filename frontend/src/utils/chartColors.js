export const SEGMENT_COLORS = {
    "Champions": "#4f46e5", // indigo-600
    "Loyal Customers": "#6366f1", // indigo-500
    "Potential Loyalist": "#818cf8", // indigo-400
    "New Customers": "#06b6d4", // cyan-500
    "Promising": "#22d3ee", // cyan-400
    "Needs Attention": "#fbbf24", // amber-400
    "About to Sleep": "#f59e0b", // amber-500
    "At Risk": "#fb7185", // rose-400
    "Can't Lose Them": "#f43f5e", // rose-500
    "Hibernating": "#94a3b8", // slate-400
    "Lost": "#64748b", // slate-500
    "Unknown": "#cbd5e1"
};

export const getSegmentColor = (segment) => SEGMENT_COLORS[segment] || "#cbd5e1";
