import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { ALL_QUESTIONS } from '../../data/dsaQuestions';

// Build a fast gid -> question name lookup once (questions use `n` field)
const GID_TO_TITLE = {};
ALL_QUESTIONS.forEach(q => { GID_TO_TITLE[String(q.gid)] = q.n; });

const Heatmap = ({ activities = [] }) => {
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState('year'); // 'year' or 'month'
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDateStr, setSelectedDateStr] = useState(null);
    const [tooltip, setTooltip] = useState(null); // { day, x, y }
    const containerRef = useRef(null);
    const [cellSize, setCellSize] = useState(13);

    // Recalculate cell size on resize so grid fills full width in Year view
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

    // Generate days for full year grid (Year View)
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

    // Weeks column data (Year View)
    const weeks = useMemo(() => {
        const w = [];
        for (let i = 0; i < daysData.length; i += 7) w.push(daysData.slice(i, i + 7));
        return w;
    }, [daysData]);

    // Month labels (Year View)
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

    // Generate days of currently selected month (Month View)
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const startDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        const list = [];
        
        // Padding for previous month days at start of grid
        for (let i = 0; i < startDayOfWeek; i++) {
            list.push({ padding: true, dateStr: `pad-${i}` });
        }
        
        // Month days
        for (let dNum = 1; dNum <= totalDays; dNum++) {
            const date = new Date(year, month, dNum);
            const dateStr = date.toISOString().split('T')[0];
            const dayActs = activityMap[dateStr] || [];
            list.push({
                date,
                dateStr,
                dayNum: dNum,
                activities: dayActs,
                count: dayActs.length,
                padding: false
            });
        }
        
        return list;
    }, [currentMonth, activityMap]);

    const getColorClass = (count) => {
        if (count === 0) return 'bg-dark-150 dark:bg-dark-800/60';
        if (count === 1) return 'bg-emerald-200 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300';
        if (count === 2) return 'bg-emerald-400 dark:bg-emerald-800 text-white';
        if (count === 3) return 'bg-emerald-500 dark:bg-emerald-600 text-white';
        return 'bg-emerald-600 dark:bg-emerald-400 text-white';
    };

    // Absolute tooltip position — calculated relative to containerRef
    const handleMouseEnter = useCallback((e, day) => {
        if (day.padding) return;
        const cellRect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        
        const x = cellRect.left - containerRect.left + cellRect.width / 2;
        const y = cellRect.top - containerRect.top;
        
        setTooltip({ day, x, y });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setTooltip(null);
    }, []);

    // Month navigations
    const handlePrevMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setSelectedDateStr(null);
    };

    const handleNextMonth = () => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setSelectedDateStr(null);
    };

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const gap = 3;

    // Selected day details in Monthly View
    const selectedDayData = useMemo(() => {
        if (!selectedDateStr) return null;
        return activityMap[selectedDateStr] || [];
    }, [selectedDateStr, activityMap]);

    return (
        <div ref={containerRef} className="bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-2xl p-6 shadow-sm mb-8 w-full relative">
            
            {/* Header / Controls */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-5 pb-5 border-b border-dark-100 dark:border-dark-800/60">
                <div>
                    <h2 className="text-lg font-bold text-dark-900 dark:text-white font-display flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Activity Heatmap
                    </h2>
                    <p className="text-xs text-dark-400 dark:text-dark-500 mt-0.5">Your daily practice consistency over the past year</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* View mode toggle */}
                    <div className="flex items-center gap-1 p-1 bg-dark-100 dark:bg-dark-850 border border-dark-200/50 dark:border-dark-800 rounded-xl">
                        {[
                            { mode: 'year', label: 'Year Grid' },
                            { mode: 'month', label: 'Month Calendar' }
                        ].map(({ mode, label }) => (
                            <button
                                key={mode}
                                onClick={() => { setViewMode(mode); setTooltip(null); }}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all duration-200 ${viewMode === mode
                                    ? 'bg-white dark:bg-dark-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                                    : 'text-dark-500 dark:text-dark-400 hover:text-dark-800 dark:hover:text-dark-200'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Filter buttons */}
                    <div className="flex items-center gap-1 p-1 bg-dark-100 dark:bg-dark-850 border border-dark-200/50 dark:border-dark-800 rounded-xl">
                        {[
                            ['all', 'All'],
                            ['dsa', 'DSA Solved'],
                            ['topic', 'Topics']
                        ].map(([val, label]) => (
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
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    {
                        svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                        label: 'Total Done', value: stats.total, color: 'text-primary-500', bg: 'bg-primary-500/10'
                    },
                    {
                        svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
                        label: 'Active Days', value: stats.activeDays, color: 'text-emerald-500', bg: 'bg-emerald-500/10'
                    },
                    {
                        svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
                        label: 'Current Streak', value: `${stats.currentStreak}d`, color: 'text-rose-500', bg: 'bg-rose-500/10'
                    },
                    {
                        svg: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
                        label: 'Longest Streak', value: `${stats.longestStreak}d`, color: 'text-amber-500', bg: 'bg-amber-500/10'
                    },
                ].map(({ svg, label, value, color, bg }) => (
                    <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-dark-50/50 dark:bg-dark-950/30 border border-dark-200/30 dark:border-dark-800/30">
                        <div className={`w-9 h-9 rounded-lg ${bg} ${color} flex items-center justify-center flex-shrink-0`}>{svg}</div>
                        <div>
                            <div className="text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wider">{label}</div>
                            <div className={`text-lg font-extrabold font-mono leading-tight ${color}`}>{value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View Mode: Year Grid */}
            {viewMode === 'year' && (
                <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                    <div className="min-w-[760px] select-none">
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

                            {/* Weeks columns */}
                            <div className="flex flex-1" style={{ gap: `${gap}px` }}>
                                {weeks.map((week, wi) => (
                                    <div key={wi} className="flex flex-col" style={{ gap: `${gap}px`, flex: 1 }}>
                                        {week.map((day) => (
                                            <div
                                                key={day.dateStr}
                                                onMouseEnter={(e) => handleMouseEnter(e, day)}
                                                onMouseLeave={handleMouseLeave}
                                                style={{ height: `${cellSize}px`, borderRadius: `${Math.max(2, cellSize * 0.2)}px` }}
                                                className={`w-full transition-all duration-150 cursor-pointer hover:ring-2 hover:ring-emerald-500/60 hover:scale-110 ${getColorClass(day.count)}`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* View Mode: Month Calendar */}
            {viewMode === 'month' && (
                <div className="w-full space-y-4">
                    {/* Monthly Navigator */}
                    <div className="flex items-center justify-between bg-dark-50 dark:bg-dark-950/40 p-3 rounded-xl border border-dark-200/50 dark:border-dark-800">
                        <button
                            onClick={handlePrevMonth}
                            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-600 dark:text-dark-400 cursor-pointer transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <h3 className="text-sm font-extrabold text-dark-800 dark:text-white uppercase tracking-wider font-mono">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                            onClick={handleNextMonth}
                            className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-800 text-dark-600 dark:text-dark-400 cursor-pointer transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {/* Day headers */}
                        {DAYS.map(day => (
                            <div key={day} className="text-center text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase py-1">
                                {day}
                            </div>
                        ))}

                        {/* Calendar cells */}
                        {calendarDays.map((day) => {
                            if (day.padding) {
                                return (
                                    <div
                                        key={day.dateStr}
                                        className="h-10 sm:h-12 bg-transparent border border-transparent rounded-lg opacity-25"
                                    />
                                );
                            }

                            const isSelected = selectedDateStr === day.dateStr;

                            return (
                                <button
                                    key={day.dateStr}
                                    onMouseEnter={(e) => handleMouseEnter(e, day)}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={() => setSelectedDateStr(isSelected ? null : day.dateStr)}
                                    className={`h-10 sm:h-12 flex flex-col justify-between p-1 rounded-lg transition-all duration-150 relative cursor-pointer outline-none ${
                                        isSelected 
                                            ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white dark:ring-offset-dark-900 scale-[1.03]' 
                                            : 'hover:ring-1 hover:ring-emerald-500/50'
                                    } ${getColorClass(day.count)}`}
                                >
                                    <span className="text-[10px] font-bold self-start">{day.dayNum}</span>
                                    {day.count > 0 && (
                                        <span className="text-[9px] font-extrabold self-end bg-black/20 dark:bg-white/10 px-1 rounded-full text-white">
                                            {day.count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Day Details Panel */}
                    {selectedDateStr && (
                        <div className="mt-4 p-4 rounded-xl border border-dark-200 dark:border-dark-800 bg-dark-50/50 dark:bg-dark-950/20 animate-fade-in">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-dark-800 dark:text-white uppercase tracking-wider">
                                    Activities on {new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </h4>
                                <button
                                    onClick={() => setSelectedDateStr(null)}
                                    className="text-[10px] font-bold text-dark-450 hover:text-dark-600 dark:hover:text-dark-200 cursor-pointer"
                                >
                                    Clear Selection
                                </button>
                            </div>
                            
                            {selectedDayData.length === 0 ? (
                                <p className="text-xs text-dark-400 dark:text-dark-500 italic">No tasks or DSA questions completed on this day.</p>
                            ) : (
                                <div className="space-y-4">
                                    {/* DSA Solved list */}
                                    {selectedDayData.filter(a => a.activityType === 'DSA_SOLVED').length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-500">
                                                    DSA Solved ({selectedDayData.filter(a => a.activityType === 'DSA_SOLVED').length})
                                                </span>
                                            </div>
                                            <ul className="space-y-1.5 pl-1">
                                                {selectedDayData.filter(a => a.activityType === 'DSA_SOLVED').map((act, i) => {
                                                    const title = GID_TO_TITLE[String(act.referenceId)];
                                                    return (
                                                        <li key={i} className="flex items-center gap-2 text-xs text-dark-700 dark:text-dark-300">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                                                            <span className="font-semibold">{title || act.detail || `Question #${act.referenceId}`}</span>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Topics list */}
                                    {selectedDayData.filter(a => a.activityType === 'TOPIC_COMPLETED').length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-1.5 mb-1.5">
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500">
                                                    Topics Completed ({selectedDayData.filter(a => a.activityType === 'TOPIC_COMPLETED').length})
                                                </span>
                                            </div>
                                            <ul className="space-y-1.5 pl-1">
                                                {selectedDayData.filter(a => a.activityType === 'TOPIC_COMPLETED').map((act, i) => (
                                                    <li key={i} className="flex items-center gap-2 text-xs text-dark-700 dark:text-dark-300">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                                                        <span className="font-semibold">{act.detail || 'Roadmap topic completed'}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Legend & Details Prompt */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-dark-100 dark:border-dark-800/40">
                <span className="text-[10px] text-dark-400 dark:text-dark-500 font-medium">
                    {viewMode === 'month' ? 'Click tiles to pin activities list below. Hover to preview.' : 'Hover tiles to see activity details.'}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] text-dark-400 dark:text-dark-500 font-semibold">
                    <span>Less</span>
                    {['bg-dark-150 dark:bg-dark-800/60', 'bg-emerald-200 dark:bg-emerald-950/70', 'bg-emerald-400 dark:bg-emerald-800', 'bg-emerald-500 dark:bg-emerald-600', 'bg-emerald-600 dark:bg-emerald-400'].map((cls, i) => (
                        <div key={i} style={{ width: 11, height: 11, borderRadius: 2 }} className={cls} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            {/* Rich Tooltip (absolute relative to outer containerRef) */}
            {tooltip && (
                <RichTooltip
                    day={tooltip.day}
                    x={tooltip.x}
                    y={tooltip.y}
                    containerWidth={containerRef.current ? containerRef.current.clientWidth : 800}
                    dsaSolved={tooltip.day.activities.filter(a => a.activityType === 'DSA_SOLVED')}
                    topicsCompleted={tooltip.day.activities.filter(a => a.activityType === 'TOPIC_COMPLETED')}
                />
            )}
        </div>
    );
};

// ─── Rich Tooltip Panel (Absolute Positioning relative to parent wrapper) ──────
const RichTooltip = ({ day, x, y, containerWidth, dsaSolved, topicsCompleted }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({ left: x, top: y - 8, transform: 'translate(-50%, -100%)', arrowSide: 'bottom' });

    useEffect(() => {
        if (!ref.current) return;
        const { width, height } = ref.current.getBoundingClientRect();

        let left = x - width / 2;
        let top = y - height - 10;
        let arrowSide = 'bottom'; // arrow points down toward tile

        // Flip below if not enough room above
        if (top < 0) {
            top = y + 24;
            arrowSide = 'top';
        }
        // Clamp horizontal boundaries
        if (left < 4) left = 4;
        if (left + width > containerWidth - 4) left = containerWidth - width - 4;

        setPos({ left, top, arrowSide });
    }, [x, y, containerWidth]);

    const formattedDate = day.date.toLocaleDateString(undefined, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const MAX_VISIBLE = 6;

    return (
        <div
            ref={ref}
            className="absolute z-[9999] pointer-events-none transition-all duration-75"
            style={{ left: pos.left, top: pos.top }}
        >
            <div className="w-64 rounded-xl border border-dark-700/60 bg-dark-950 shadow-2xl overflow-hidden text-left">
                {/* Header */}
                <div className={`px-3 py-2.5 border-b border-dark-800 ${day.count > 0 ? 'bg-emerald-500/10' : 'bg-dark-900'}`}>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-dark-400 mb-0.5">
                        {day.count > 0 ? 'Active Day' : 'No Activity'}
                    </div>
                    <div className="text-xs font-semibold text-white leading-snug">{formattedDate}</div>
                    {day.count > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {day.count} {day.count === 1 ? 'activity' : 'activities'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Body */}
                {day.count === 0 ? (
                    <div className="px-3 py-3 text-[11px] text-dark-500 italic">Rest day — no activities logged.</div>
                ) : (
                    <div className="px-3 py-2.5 space-y-3 max-h-56 overflow-y-auto">
                        {/* DSA Solved */}
                        {dsaSolved.length > 0 && (
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <svg className="w-3 h-3 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary-400">
                                        DSA Solved ({dsaSolved.length})
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {dsaSolved.slice(0, MAX_VISIBLE).map((act, i) => {
                                        const title = GID_TO_TITLE[String(act.referenceId)];
                                        return (
                                            <div key={i} className="flex items-start gap-1.5 text-left">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
                                                <span className="text-[11px] text-dark-200 leading-snug font-medium">
                                                    {title || act.detail || `Question #${act.referenceId}`}
                                                </span>
                                            </div>
                                        );
                                    })}
                                    {dsaSolved.length > MAX_VISIBLE && (
                                        <div className="text-[10px] text-dark-500 pl-3 italic">
                                            +{dsaSolved.length - MAX_VISIBLE} more...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Topics Completed */}
                        {topicsCompleted.length > 0 && (
                            <div>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                                        Topics ({topicsCompleted.length})
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    {topicsCompleted.slice(0, MAX_VISIBLE).map((act, i) => (
                                        <div key={i} className="flex items-start gap-1.5 text-left">
                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                                            <span className="text-[11px] text-dark-200 leading-snug font-medium">
                                                {act.detail || 'Roadmap topic completed'}
                                            </span>
                                        </div>
                                    ))}
                                    {topicsCompleted.length > MAX_VISIBLE && (
                                        <div className="text-[10px] text-dark-500 pl-3 italic">
                                            +{topicsCompleted.length - MAX_VISIBLE} more...
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Tooltip Arrow */}
            {pos.arrowSide === 'bottom' && (
                <div className="flex justify-center -mt-[1px]">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-dark-950" />
                </div>
            )}
            {pos.arrowSide === 'top' && (
                <div className="flex justify-center order-first -mb-[1px]">
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-dark-950" />
                </div>
            )}
        </div>
    );
};

export default Heatmap;
