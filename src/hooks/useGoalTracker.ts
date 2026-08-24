import { useEffect, useState } from "react";
import { getDatesInRange, getDaysBetween, getLocalDateKey } from "@/utils/dates";
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
};

const STORAGE_KEY_PREFIXES = {
    TRACKER_STATE: 'goal_tracker_state',
    PROGRESS_ON_DATES: 'goal_tracker_progress_on_dates',
    CURRENT_WEEK_STATE: 'goal_tracker_current_week_state',
};

function getStorageKeys(id: string) {
    return {
        TRACKER_STATE: `${STORAGE_KEY_PREFIXES.TRACKER_STATE}_${id}`,
        PROGRESS_ON_DATES: `${STORAGE_KEY_PREFIXES.PROGRESS_ON_DATES}_${id}`,
        CURRENT_WEEK_STATE: `${STORAGE_KEY_PREFIXES.CURRENT_WEEK_STATE}_${id}`,
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
    localStorage.removeItem(STORAGE_KEYS.CURRENT_WEEK_STATE);
}

export const useGoalTracker = (id: string) => {
    const STORAGE_KEYS = getStorageKeys(id);
    const [goalTrackerState, setGoalTrackerState] = useState<GoalTrackerState>(getStorageItem(STORAGE_KEYS.TRACKER_STATE, {
        goalTitle: 'Your Goal',
        startDate: new Date(2026, 7, 21),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Default to one week later
        expectedProgressPerDay: 5,
        goalTargets: [1, 5, 30, 100, 200, 300, 500, 750],
        overloadDays: [0, 6], // Default to Sunday and Saturday
    }));
    const [progressOnDates, setProgressOnDates] = useState<Record<string, string>>(getStorageItem(STORAGE_KEYS.PROGRESS_ON_DATES, {}));
    const [currWeek, setCurrWeek] = useState<number>(1);

    const currWeekState = {
        startDate: new Date(goalTrackerState.startDate.getTime() + (currWeek - 1) * 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(goalTrackerState.startDate.getTime() + (currWeek - 1) * 7 * 24 * 60 * 60 * 1000 + 6 * 24 * 60 * 60 * 1000),
        week: currWeek
    }

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.TRACKER_STATE, JSON.stringify(goalTrackerState));
    }, [goalTrackerState]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.CURRENT_WEEK_STATE, JSON.stringify(currWeekState));
    }, [currWeekState]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.PROGRESS_ON_DATES, JSON.stringify(progressOnDates));
    }, [progressOnDates]);

    const weeksInTracker = Math.ceil(getDaysBetween(goalTrackerState.startDate, goalTrackerState.endDate) / 7);
    const datesInWeek = getDatesInRange(currWeekState.startDate, currWeekState.endDate);
    const daysInTracker = getDaysBetween(goalTrackerState.startDate, goalTrackerState.endDate) + 1;
    const daysTracked = Object.entries(progressOnDates).reduce((count, [date, _]) => dateIsTracked(date) ? count + 1 : count, 0);
    const weekendDates = datesInWeek.filter((date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
    });
    const weekdaysDates = datesInWeek.filter((date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
    });
    const weekendsLeft = weekendDates.filter((date) => {
        const dateKey = getLocalDateKey(date);
        return !progressOnDates[dateKey];
    });
    const weekdaysLeft = weekdaysDates.filter((date) => {
        const dateKey = getLocalDateKey(date);
        return !progressOnDates[dateKey];
    });


    const goalTargets: number[] = goalTrackerState.goalTargets;

    const currentProgress = Object.entries(progressOnDates).reduce((sum, [date, progress]) => dateIsTracked(date) ? sum + (parseFloat(progress) || 0) : sum, 0);
    const currentProgressInWeek = datesInWeek.reduce((sum, date) => sum + (parseFloat(getProgressForDate(date)) || 0), 0);
    const targetProgressPerDay = parseFloat((goalTargets[goalTargets.length - 1] / ((daysInTracker - daysTracked) || 1)).toFixed(2));
    const targetProgressPerWeek = parseFloat((targetProgressPerDay * 7).toFixed(2));
    const targetWeekendProgress = parseFloat((weekendsLeft.length == 0 ? 0 :
        (targetProgressPerWeek - currentProgressInWeek - (weekdaysLeft.length * goalTrackerState.expectedProgressPerDay)) / weekendsLeft.length).toFixed(2));

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

    function updateGoalTrackerState(title: string, progressPerDay: number, start: Date, end: Date, targets: number[], overloadDays: number[]) {
        updateGoalTitle(title);
        updateProgressPerDay(progressPerDay);
        updateDateRange(start, end);
        updateTargets(targets.sort((a, b) => a - b));
        updateOverloadDays(overloadDays);
    }

    return { currWeekState, incrementWeek, weeksInTracker, datesInWeek, goals, getProgressForDate, setProgressForDate, goalTrackerState, updateGoalTrackerState, targetProgressPerDay, weekendDates, targetWeekendProgress, updateGoalTitle };
};