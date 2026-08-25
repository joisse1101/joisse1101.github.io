import { useEffect, useState } from "react";
import { getDatesInRange, getDaysBetween, getLocalDateKey, getMostRecentFirstDay } from "@/utils/dates";
import { getStatusColor, interpolateColors } from "@/utils/colours";
import { getStorageItem } from "@/utils/storage";

export type GoalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';
export type GoalType = 'normal' | 'stretch'

export type GoalState = {
    number: number;
    title: string;
    subtitle: string;
    color: string;
    state: GoalStatus;
    type: GoalType;
};

export type GoalTrackerState = {
    goalTitle: string;
    startDate: Date;
    endDate: Date;
    expectedProgressPerDay: number;
    goalTargets: number[];
    overloadDays: number[]; // Optional property for overload days
    firstDayOfWeek: number;
    units: string;
};

const STORAGE_KEY_PREFIXES = {
    TRACKER_STATE: 'goal_tracker_state',
    PROGRESS_ON_DATES: 'goal_tracker_progress_on_dates',
    CURRENT_WEEK: 'goal_tracker_current_week',
};

function getStorageKeys(id: string) {
    return {
        TRACKER_STATE: `${STORAGE_KEY_PREFIXES.TRACKER_STATE}_${id}`,
        PROGRESS_ON_DATES: `${STORAGE_KEY_PREFIXES.PROGRESS_ON_DATES}_${id}`,
        CURRENT_WEEK: `${STORAGE_KEY_PREFIXES.CURRENT_WEEK}_${id}`,
    };
}

export function getGoalTitleFromStorage(id: string): string {
    const trackerStateKey = `${STORAGE_KEY_PREFIXES.TRACKER_STATE}_${id}`;
    const storedState = localStorage.getItem(trackerStateKey);
    if (storedState) {
        try {
            const parsedState = JSON.parse(storedState);
            return parsedState.goalTitle || 'Your Goal';
        } catch {
            return 'Your Goal';
        }
    }
    return 'Your Goal';
}

export function useGoalTitle(id: string): string {
    const [title, setTitle] = useState<string>(() => getGoalTitleFromStorage(id));

    useEffect(() => {
        const handleTitleUpdate = (e: CustomEvent<{ id: string; title: string }>) => {
            // Only update if the event matches this specific tab ID
            if (e.detail?.id === id) {
                setTitle(e.detail.title);
            }
        };

        window.addEventListener('goal_title_changed', handleTitleUpdate as EventListener);
        return () => {
            window.removeEventListener('goal_title_changed', handleTitleUpdate as EventListener);
        };
    }, [id]);

    return title;
}

export function deleteGoalStorage(id: string) {
    const STORAGE_KEYS = getStorageKeys(id);
    localStorage.removeItem(STORAGE_KEYS.TRACKER_STATE);
    localStorage.removeItem(STORAGE_KEYS.PROGRESS_ON_DATES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK);
}

export const useGoalTracker = (id: string) => {
    const STORAGE_KEYS = getStorageKeys(id);
    const [goalTrackerState, setGoalTrackerState] = useState<GoalTrackerState>(getStorageItem(STORAGE_KEYS.TRACKER_STATE, {
        goalTitle: 'Your Goal',
        startDate: new Date(Date.now()), // Default to today
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Default to one week later
        expectedProgressPerDay: 5,
        goalTargets: [1, 5, 30, 100, 200, 300, 500, 750],
        overloadDays: [0, 6], // Default to Sunday and Saturday
        firstDayOfWeek: 0, // Default to Sunday
        units: 'km',
    }));
    const [progressOnDates, setProgressOnDates] = useState<Record<string, string>>(getStorageItem(STORAGE_KEYS.PROGRESS_ON_DATES, {}));
    const [currWeek, setCurrWeek] = useState<number>(getStorageItem(STORAGE_KEYS.CURRENT_WEEK, 1));

    const firstDayOfTracker = getMostRecentFirstDay(goalTrackerState.startDate, goalTrackerState.firstDayOfWeek);

    const currWeekState = {
        startDate: new Date(firstDayOfTracker.getTime() + (currWeek - 1) * 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(firstDayOfTracker.getTime() + (currWeek - 1) * 7 * 24 * 60 * 60 * 1000 + 6 * 24 * 60 * 60 * 1000),
        week: currWeek
    }

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TRACKER_STATE, JSON.stringify(goalTrackerState));
    }, [goalTrackerState]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK, JSON.stringify(currWeek));
    }, [currWeek]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_ON_DATES, JSON.stringify(progressOnDates));
    }, [progressOnDates]);


    const weeksInTracker = Math.ceil((getDaysBetween(firstDayOfTracker, goalTrackerState.endDate) + 1) / 7);
    const datesInWeek = getDatesInRange(currWeekState.startDate, currWeekState.endDate);
    const daysInTracker = getDaysBetween(goalTrackerState.startDate, goalTrackerState.endDate) + 1;

    const overloadDatesLeft = getDatesInRange(goalTrackerState.startDate, goalTrackerState.endDate).filter((date) => {
        const day = date.getDay();
        return goalTrackerState.overloadDays.includes(day) && !hasProgressForDate(date);
    });
    const nonOverloadDatesLeft = getDatesInRange(goalTrackerState.startDate, goalTrackerState.endDate).filter((date) => {
        const day = date.getDay();
        return !goalTrackerState.overloadDays.includes(day) && !hasProgressForDate(date);
    });

    const goalTargets: number[] = goalTrackerState.goalTargets;

    const currentProgress = Object.entries(progressOnDates).reduce((sum, [date, progress]) => dateIsTracked(date) ? sum + (parseFloat(progress) || 0) : sum, 0);
    const progressLeft = goalTargets[goalTargets.length - 1] - currentProgress;
    const overloadTarget = (progressLeft - nonOverloadDatesLeft.length * goalTrackerState.expectedProgressPerDay) / overloadDatesLeft.length;
    const targetOverloadProgress =
        parseFloat((overloadDatesLeft.length == 0 || progressLeft <= 0 || overloadTarget < goalTrackerState.expectedProgressPerDay ? goalTrackerState.expectedProgressPerDay :
            overloadTarget).toFixed(2));

    const goalType = goalTargets.map((number) => number <= goalTrackerState.expectedProgressPerDay * daysInTracker ? 'normal' : 'stretch');
    const numNormalGoals = goalTargets.filter((number) => number <= goalTrackerState.expectedProgressPerDay * daysInTracker).length;

    const goalColors = [
        ...interpolateColors(getStatusColor('danger'), getStatusColor('warning'), Math.floor(numNormalGoals / 2) - 2),
        ...interpolateColors(getStatusColor('warning'), getStatusColor('success'), numNormalGoals - Math.floor(numNormalGoals / 2) - 1).slice(1),
        ...interpolateColors(getStatusColor('success'), getStatusColor('stretch'), goalTargets.length - numNormalGoals - 1).slice(1)
    ];
    const activeGoalIdx = goalTargets.findIndex((goal) => goal > currentProgress);
    const goals: GoalState[] = goalTargets.map((number, idx) => ({
        number,
        title: `${number} km`,
        subtitle: goalType[idx] === 'stretch' ? 'Stretch' : '',
        color: goalColors[idx],
        state: activeGoalIdx == -1 ? 'COMPLETED' : idx == activeGoalIdx ? 'ACTIVE' : idx < activeGoalIdx ? 'COMPLETED' : 'PENDING',
        type: goalType[idx]
    }));

    function dateIsTracked(dateKey: string): boolean {
        const date = new Date(dateKey);
        return date >= goalTrackerState.startDate && date <= goalTrackerState.endDate;
    }

    function incrementWeek(increment: number) {
        setCurrWeek((prevWeek) => {
            const newWeek = prevWeek + increment;
            if (newWeek < 1) return prevWeek;
            if (newWeek > weeksInTracker) return prevWeek;
            return newWeek;
        });
    };

    function getProgressForDate(date: Date): string {
        const dateKey = getLocalDateKey(date);
        return progressOnDates[dateKey] || '';
    }

    function hasProgressForDate(date: Date): boolean {
        const dateKey = getLocalDateKey(date);
        const progress = Number(progressOnDates[dateKey]);
        return !!progress && !isNaN(progress) && progress > 0;
    }

    function setProgressForDate(date: Date, progress: string) {
        const dateKey = getLocalDateKey(date);
        setProgressOnDates((prev) => {
            const newProgressOnDates = { ...prev };
            if (progress === '') {
                delete newProgressOnDates[dateKey];
            } else {
                newProgressOnDates[dateKey] = progress;
            }
            return newProgressOnDates;
        });
    }

    function updateGoalTitle(title: string) {
        setGoalTrackerState((prev) => ({ ...prev, goalTitle: title }));
        window.dispatchEvent(
            new CustomEvent('goal_title_changed', {
                detail: { id: id, title: title || 'Your Goal' },
            })
        );
    }

    function updateProgressPerDay(val: number) {
        setGoalTrackerState((prev) => ({ ...prev, expectedProgressPerDay: val }));
    };

    function updateDateRange(start: Date, end: Date) {
        setGoalTrackerState((prev) => ({ ...prev, startDate: start, endDate: end }));
    };

    function updateTargets(targets: number[]) {
        setGoalTrackerState((prev) => ({ ...prev, goalTargets: targets }));
    };

    function updateOverloadDays(overloadDays: number[]) {
        setGoalTrackerState((prev) => ({ ...prev, overloadDays }));
    }

    function updateFirstDayOfWeek(firstDayOfWeek: number) {
        setGoalTrackerState((prev) => ({ ...prev, firstDayOfWeek }));
    }

    function updateUnits(units: string) {
        setGoalTrackerState((prev) => ({ ...prev, units }));
    }

    function updateGoalTrackerState(updates: Partial<GoalTrackerState>) {
        if (updates.goalTitle !== undefined) {
            updateGoalTitle(updates.goalTitle);
        }
        if (updates.expectedProgressPerDay !== undefined) {
            updateProgressPerDay(updates.expectedProgressPerDay);
        }
        if (updates.startDate !== undefined && updates.endDate !== undefined) {
            updateDateRange(updates.startDate, updates.endDate);
        }
        if (updates.goalTargets !== undefined) {
            updateTargets(updates.goalTargets.sort((a, b) => a - b));
        }
        if (updates.overloadDays !== undefined) {
            updateOverloadDays(updates.overloadDays);
        }
        if (updates.firstDayOfWeek !== undefined) {
            updateFirstDayOfWeek(updates.firstDayOfWeek);
        }
        if (updates.units !== undefined) {
            updateUnits(updates.units);
        }
    }

    useEffect(() => {
        if (currWeek > weeksInTracker) {
            setCurrWeek(weeksInTracker);
        }
        if (currWeek < 1) {
            setCurrWeek(1);
        }
    }, [weeksInTracker])

    return { currWeekState, incrementWeek, weeksInTracker, datesInWeek, goals, getProgressForDate, setProgressForDate, goalTrackerState, updateGoalTrackerState, overloadDatesLeft, targetOverloadProgress, updateGoalTitle };
};