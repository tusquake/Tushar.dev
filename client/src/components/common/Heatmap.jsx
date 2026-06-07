import { useMemo, useState, useRef, useEffect } from 'react';

const Heatmap = ({ activities = [] }) => {
    const [filterType, setFilterType] = useState('all');
    const [tooltip, setTooltip] = useState(null);
    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(13);

    // Recalculate cell size on resize so grid fills full width
    useEffect(() => {
        const calc = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            const DAY_LABEL_WIDTH = 32;
            const GAP = 3;
            const totalWeeks = Math.ceil(365 / 7) + 2;
            const available = containerWidth - DAY_LABEL_WIDTH - (totalWeeks - 1) * GAP;
            const size = Math.max(10, Math.floor(available / totalWeeks));
            setCellSize(Math.min(size, 16));
        };
        calc();
        const ro = new ResizeObserver(calc);
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Filter activities based on selected type
    const filteredActivities = useMemo(() => {
        if (filterType === 'dsa') return activities.filter(a => a.activityType === 'DSA_SOLVED');
        if (filterType === 'topic') return activities.filter(a => a.activityType === 'TOPIC_COMPLETED');
        return activities;
    }, [activities, filterType]);

    // Map of YYYY-MM-DD -> list of activities
    const activityMap = useMemo(() => {
        const map = {};
        filteredActivities.forEach(act => {
            const dateStr = new Date(act.date).toISOString().split('T')[0];
            if (!map[dateStr]) map[dateStr] = [];
            map[dateStr].push(act);
        });
        return map;
    }, [filteredActivities]);

    // Calculate streaks and stats
    const stats = useMemo(() => {
        const allDates = Object.keys(activityMap).sort();
        if (allDates.length === 0) return { total: 0, activeDays: 0, currentStreak: 0, longestStreak: 0 };

        let longestStreak = 0, runningStreak = 0;
        let prevDate = null;
        const activeDatesSet = new Set(allDates);

        allDates.forEach(dateStr => {
            const currentDate = new Date(dateStr);
            if (prevDate) {
                const diffDays = Math.ceil(Math.abs(currentDate - prevDate) / 86400000);
                runningStreak = diffDays === 1 ? runningStreak + 1 : 1;
            } else {
                runningStreak = 1;
            }
            if (runningStreak > longestStreak) longestStreak = runningStreak;
            prevDate = currentDate;
        });

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let currentStreak = 0;
        let streakDate = activeDatesSet.has(todayStr) ? today : (activeDatesSet.has(yesterdayStr) ? yesterday : null);
        if (streakDate) {
            let checkStr = streakDate.toISOString().split('T')[0];
            while (activeDatesSet.has(checkStr)) {
                currentStreak++;
                streakDate.setDate(streakDate.getDate() - 1);
                checkStr = streakDate.toISOString().split('T')[0];
            }
        }

        return {
            total: filteredActivities.length,
            activeDays: activeDatesSet.size,
            currentStreak,
            longestStreak: Math.max(longestStreak, currentStreak)
        };
    }, [activityMap, filteredActivities]);

    // Generate days for full year grid
    const daysData = useMemo(() => {
        const list = [];
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - 364);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // align to Sunday

        const curr = new Date(startDate);
        while (curr <= today || list.length % 7 !== 0) {
            const dateStr = curr.toISOString().split('T')[0];
            const dayActs = activityMap[dateStr] || [];
            list.push({ date: new Date(curr), dateStr, activities: dayActs, count: dayActs.length });
            curr.setDate(curr.getDate() + 1);
        }
        return list;
    }, [activityMap]);

    // Weeks column data
    const weeks = useMemo(() => {
        const w = [];
        for (let i = 0; i < daysData.length; i += 7) w.push(daysData.slice(i, i + 7));
        return w;
    }, [daysData]);

    // Month labels (one per month change)
    const monthLabels = useMemo(() => {
        const labels = [];
        let prevMonth = -1;
        weeks.forEach((week, wi) => {
            const month = week[0].date.getMonth();
            if (month !== prevMonth) {
                labels.push({ label: week[0].date.toLocaleString('default', { month: 'short' }).toUpperCase(), weekIndex: wi });
                prevMonth = month;
            }
        });
        return labels;
    }, [weeks]);

    const getColorClass = (count) => {
        if (count === 0) return 'bg-dark-150 dark:bg-dark-800/60';
        if (count === 1) return 'bg-emerald-200 dark:bg-emerald-950/70';
        if (count === 2) return 'bg-emerald-400 dark:bg-emerald-800';
        if (count === 3) return 'bg-emerald-500 dark:bg-emerald-600';
        return 'bg-emerald-600 dark:bg-emerald-400';
    };

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const gap = 3;

    return (
        <div className="bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-2xl p-6 shadow-sm mb-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-5 border-b border-dark-100 dark:border-dark-800/60">
                <div>
                    <h2 className="text-lg font-bold text-dark-900 dark:text-white font-display flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Activity Heatmap
                    </h2>
                    <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">Your daily practice consistency over the past year</p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-dark-100 dark:bg-dark-850 border border-dark-200/50 dark:border-dark-800 rounded-xl self-start sm:self-auto">
                    {[['all', 'All'], ['dsa', 'DSA Solved'], ['topic', 'Topics']].map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setFilterType(val)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 ${filterType === val
                                ? 'bg-white dark:bg-dark-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                : 'text-dark-500 dark:text-dark-400 hover:text-dark-800 dark:hover:text-dark-200'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { icon: '✅', label: 'Total Done', value: stats.total, color: 'text-primary-500', bg: 'bg-primary-500/10' },
                    { icon: '📅', label: 'Active Days', value: stats.activeDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                    { icon: '🔥', label: 'Current Streak', value: `${stats.currentStreak}d`, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                    { icon: '🏆', label: 'Longest Streak', value: `${stats.longestStreak}d`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                ].map(({ icon, label, value, color, bg }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-dark-50/50 dark:bg-dark-950/30 border border-dark-200/30 dark:border-dark-800/30">
                        <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center text-base`}>{icon}</div>
                        <div>
                            <div className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">{label}</div>
                            <div className={`text-lg font-extrabold font-mono leading-tight ${color}`}>{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Heatmap Grid — fills full width */}
            <div ref={containerRef} className="w-full select-none">
                {/* Month labels row */}
                <div className="flex mb-1 pl-8" style={{ gap: `${gap}px` }}>
                    {weeks.map((_, wi) => {
                        const ml = monthLabels.find(m => m.weekIndex === wi);
                        return (
                            <div
                                key={wi}
                                style={{ width: `${cellSize}px`, flexShrink: 0 }}
                                className="text-[9px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wide overflow-visible whitespace-nowrap"
                            >
                                {ml ? ml.label : ''}
                            </div>
                        );
                    })}
                </div>

                {/* Day labels + grid */}
                <div className="flex" style={{ gap: `${gap}px` }}>
                    {/* Day-of-week labels */}
                    <div className="flex flex-col" style={{ gap: `${gap}px`, width: '28px', flexShrink: 0 }}>
                        {DAYS.map((d, i) => (
                            <div
                                key={d}
                                style={{ height: `${cellSize}px`, lineHeight: `${cellSize}px` }}
                                className="text-[9px] font-bold text-dark-400 dark:text-dark-500 text-right pr-1"
                            >
                                {i % 2 === 1 ? d.slice(0, 3) : ''}
                            </div>
                        ))}
                    </div>

                    {/* Weeks */}
                    <div className="flex flex-1" style={{ gap: `${gap}px` }}>
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex flex-col" style={{ gap: `${gap}px`, flex: 1 }}>
                                {week.map((day) => {
                                    const formattedDate = day.date.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
                                    const tipText = day.count > 0
                                        ? `${day.count} activit${day.count > 1 ? 'ies' : 'y'} on ${formattedDate}`
                                        : `No activity on ${formattedDate}`;

                                    return (
                                        <div
                                            key={day.dateStr}
                                            title={tipText}
                                            onMouseEnter={e => setTooltip({ text: tipText, x: e.clientX, y: e.clientY })}
                                            onMouseLeave={() => setTooltip(null)}
                                            style={{ height: `${cellSize}px`, borderRadius: `${Math.max(2, cellSize * 0.2)}px` }}
                                            className={`w-full transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-emerald-500/60 hover:scale-110 ${getColorClass(day.count)}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-100 dark:border-dark-800/40">
                <span className="text-[10px] text-dark-400 dark:text-dark-500 font-medium">Hover tiles to see activity details</span>
                <div className="flex items-center gap-1.5 text-[10px] text-dark-400 dark:text-dark-500 font-semibold">
                    <span>Less</span>
                    {['bg-dark-150 dark:bg-dark-800/60', 'bg-emerald-200 dark:bg-emerald-950/70', 'bg-emerald-400 dark:bg-emerald-800', 'bg-emerald-500 dark:bg-emerald-600', 'bg-emerald-600 dark:bg-emerald-400'].map((cls, i) => (
                        <div key={i} style={{ width: 11, height: 11, borderRadius: 2 }} className={cls} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Floating tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none px-2.5 py-1.5 rounded-lg bg-dark-900 dark:bg-dark-800 text-white text-[11px] font-medium shadow-xl border border-dark-700/50 whitespace-pre-line max-w-[220px]"
                    style={{ left: tooltip.x + 12, top: tooltip.y - 36 }}
                >
                    {tooltip.text}
                </div>
            )}
        </div>
    );
};

export default Heatmap;
