import { useMemo, useState } from 'react';

const Heatmap = ({ activities = [] }) => {
    const [filterType, setFilterType] = useState('all');

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

    // Calculate user streaks and stats
    const stats = useMemo(() => {
        const allDates = Object.keys(activityMap).sort();
        if (allDates.length === 0) {
            return { total: 0, activeDays: 0, currentStreak: 0, longestStreak: 0 };
        }

        let longestStreak = 0;
        let currentStreak = 0;
        let runningStreak = 0;
        let prevDate = null;
        const activeDatesSet = new Set(allDates);

        // Find longest streak
        allDates.forEach((dateStr) => {
            const currentDate = new Date(dateStr);
            if (prevDate) {
                const diffTime = Math.abs(currentDate - prevDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    runningStreak++;
                } else if (diffDays > 1) {
                    runningStreak = 1;
                }
            } else {
                runningStreak = 1;
            }
            if (runningStreak > longestStreak) {
                longestStreak = runningStreak;
            }
            prevDate = currentDate;
        });

        // Current streak counting backwards from today or yesterday
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let streakDate = activeDatesSet.has(todayStr) 
            ? today 
            : (activeDatesSet.has(yesterdayStr) ? yesterday : null);

        if (streakDate) {
            currentStreak = 0;
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

    // Generate days for 1 year heatmap grid
    const daysData = useMemo(() => {
        const list = [];
        const today = new Date();
        const totalDays = 365;
        
        // Find starting Sunday 365 days ago
        const startDate = new Date();
        startDate.setDate(today.getDate() - totalDays + 1);
        const startDayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - startDayOfWeek);

        const curr = new Date(startDate);
        // Fill up to today and make sure it has full columns of 7
        while (curr <= today || list.length % 7 !== 0) {
            const dateStr = curr.toISOString().split('T')[0];
            const dayActs = activityMap[dateStr] || [];
            
            list.push({
                date: new Date(curr),
                dateStr,
                activities: dayActs,
                count: dayActs.length
            });
            curr.setDate(curr.getDate() + 1);
        }
        return list;
    }, [activityMap]);

    // Color code depending on amount of daily completions
    const getColorClass = (count) => {
        if (count === 0) return 'bg-dark-150 dark:bg-dark-850/80 border border-dark-200/10 dark:border-dark-800/30';
        if (count === 1) return 'bg-primary-100 dark:bg-primary-950/40 border border-primary-250/20 dark:border-primary-900/30';
        if (count === 2) return 'bg-primary-300 dark:bg-primary-800/60 border border-primary-400/20 dark:border-primary-800/40';
        if (count === 3) return 'bg-primary-500 dark:bg-primary-600 border border-primary-600/30 dark:border-primary-500/50';
        return 'bg-primary-700 dark:bg-primary-400 border border-primary-850/30 dark:border-primary-350/50';
    };

    // Construct months layout headers
    const monthLabels = useMemo(() => {
        const labels = [];
        let prevMonth = -1;
        daysData.forEach((day, index) => {
            if (index % 7 === 0) {
                const month = day.date.getMonth();
                if (month !== prevMonth) {
                    const label = day.date.toLocaleString('default', { month: 'short' });
                    labels.push({ label, index: Math.floor(index / 7) });
                    prevMonth = month;
                }
            }
        });
        return labels;
    }, [daysData]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white dark:bg-dark-900 border border-dark-200/50 dark:border-dark-800 rounded-2xl p-6 shadow-sm mb-8 relative overflow-hidden">
            {/* Header section with Filter controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-dark-100 dark:border-dark-800/60">
                <div>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white font-display flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Activity Progress Heatmap
                    </h2>
                    <p className="text-xs text-dark-450 dark:text-dark-500 mt-0.5">Visualize your daily practice consistency in real time.</p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-dark-50 dark:bg-dark-950/40 border border-dark-200/50 dark:border-dark-800/50 rounded-xl self-start md:self-auto">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${filterType === 'all'
                            ? 'bg-white dark:bg-dark-850 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterType('dsa')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${filterType === 'dsa'
                            ? 'bg-white dark:bg-dark-850 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'}`}
                    >
                        DSA Solved
                    </button>
                    <button
                        onClick={() => setFilterType('topic')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${filterType === 'topic'
                            ? 'bg-white dark:bg-dark-850 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-dark-500 hover:text-dark-700 dark:hover:text-dark-350'}`}
                    >
                        Topics Completed
                    </button>
                </div>
            </div>

            {/* Streak & KPI stats bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-dark-50/50 dark:bg-dark-950/20 border border-dark-200/30 dark:border-dark-800/30 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/10 dark:bg-primary-500/5 flex items-center justify-center text-primary-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase block">Total Done</span>
                        <span className="text-base font-extrabold text-dark-900 dark:text-white font-mono leading-tight">{stats.total}</span>
                    </div>
                </div>

                <div className="p-3 bg-dark-50/50 dark:bg-dark-950/20 border border-dark-200/30 dark:border-dark-800/30 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center text-emerald-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase block">Active Days</span>
                        <span className="text-base font-extrabold text-dark-900 dark:text-white font-mono leading-tight">{stats.activeDays}</span>
                    </div>
                </div>

                <div className="p-3 bg-dark-50/50 dark:bg-dark-950/20 border border-dark-200/30 dark:border-dark-800/30 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 dark:bg-rose-500/5 flex items-center justify-center text-rose-500 animate-pulse">
                        🔥
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase block">Current Streak</span>
                        <span className="text-base font-extrabold text-dark-900 dark:text-white font-mono leading-tight">{stats.currentStreak} days</span>
                    </div>
                </div>

                <div className="p-3 bg-dark-50/50 dark:bg-dark-950/20 border border-dark-200/30 dark:border-dark-800/30 rounded-xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 dark:bg-amber-500/5 flex items-center justify-center text-amber-500">
                        🏆
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-dark-450 dark:text-dark-500 tracking-wider uppercase block">Longest Streak</span>
                        <span className="text-base font-extrabold text-dark-900 dark:text-white font-mono leading-tight">{stats.longestStreak} days</span>
                    </div>
                </div>
            </div>

            {/* Heatmap Grid Calendar */}
            <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <div className="min-w-[760px] flex flex-col">
                    {/* Month Label Headers */}
                    <div className="relative h-5 mb-1 text-[10px] font-bold text-dark-400 dark:text-dark-500 uppercase tracking-wide">
                        {monthLabels.map(({ label, index }, i) => (
                            <span
                                key={`${label}-${i}`}
                                className="absolute"
                                style={{ left: `${index * 13 + 30}px` }}
                            >
                                {label}
                            </span>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {/* Day Labels Column */}
                        <div className="grid grid-rows-7 gap-[3px] text-[9px] font-bold text-dark-400 dark:text-dark-500 pt-[2px] w-6">
                            {weekDays.map((day, i) => (
                                <span key={day} className="h-[10px] leading-[10px]">
                                    {i % 2 === 1 ? day : ''}
                                </span>
                            ))}
                        </div>

                        {/* Flat Grid cells mapped with column flow */}
                        <div className="grid grid-flow-col grid-rows-7 gap-[3px] auto-cols-max">
                            {daysData.map((day) => {
                                const formattedDate = day.date.toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                });
                                const tooltipText = day.count > 0
                                    ? `${day.count} active progress item${day.count > 1 ? 's' : ''} on ${formattedDate}:\n${day.activities.map(a => `• ${a.detail || a.activityType}`).join('\n')}`
                                    : `No completed items on ${formattedDate}`;

                                return (
                                    <div
                                        key={day.dateStr}
                                        title={tooltipText}
                                        className={`w-[10px] h-[10px] rounded-[2px] transition-colors duration-250 hover:ring-1 hover:ring-primary-500 cursor-help ${getColorClass(day.count)}`}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Heatmap Legend */}
            <div className="flex items-center justify-between text-[10px] font-semibold text-dark-400 dark:text-dark-500 mt-4 pt-3 border-t border-dark-100 dark:border-dark-800/40">
                <span>Hover over tiles to view completion logs</span>
                <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-dark-150 dark:bg-dark-850/80 border border-dark-200/10 dark:border-dark-800/30" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-primary-100 dark:bg-primary-950/40" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-primary-300 dark:bg-primary-800/60" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-primary-500 dark:bg-primary-600" />
                    <div className="w-[10px] h-[10px] rounded-[2px] bg-primary-700 dark:bg-primary-400" />
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
