import type { WeekState } from "@components/WeekSelector";
import { useEffect, useState } from "react";
import { getDatesInRange, getLocalDateKey } from "@/utils/dates";
import { getStatusColor, interpolateColors } from "@/utils/colours";
import { getStorageItem } from "@/utils/storage";

export type GoalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export type GoalState = {
    number: number;
    title: string;
    subtitle: string;
    color: string;
    state: GoalStatus;
};

export type GoalTrackerState = {
    startDate: Date;
    endDate: Date;
    expectedProgressPerDay: number;
    goalTargets: number[];
};

const STORAGE_KEYS = {
    TRACKER_STATE: 'goal_tracker_state',
    PROGRESS_ON_DATES: 'goal_tracker_progress_on_dates',
    CURRENT_WEEK_STATE: 'goal_tracker_current_week_state',
};

export const useGoalTracker = () => {
    const [goalTrackerState, setGoalTrackerState] = useState<GoalTrackerState>(getStorageItem(STORAGE_KEYS.TRACKER_STATE, {
        startDate: new Date(2026, 7, 21),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Default to one week later
        expectedProgressPerDay: 5,
        goalTargets: [1, 5, 30, 100, 200, 300, 500, 750],
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

    const datesInWeek = getDatesInRange(currWeekState.startDate, currWeekState.endDate);
    const goalTargets: number[] = goalTrackerState.goalTargets;
    const goalColors = [
        ...interpolateColors(getStatusColor('danger'), getStatusColor('warning'), goalTargets.length / 2 - 2),
        ...interpolateColors(getStatusColor('warning'), getStatusColor('success'), goalTargets.length / 2 - 1).slice(1)
    ];
    const currentProgress = datesInWeek.reduce((sum, date) => sum + (parseFloat(getProgressForDate(date)) || 0), 0);
    const activeGoalIdx = goalTargets.findIndex((goal) => goal > currentProgress);
    const goals: GoalState[] = goalTargets.map((number, idx) => ({
        number,
        title: `${number} km`,
        subtitle: `Subtitle ${number}`,
        color: goalColors[idx],
        state: idx == activeGoalIdx ? 'ACTIVE' : idx < activeGoalIdx ? 'COMPLETED' : 'PENDING'
    }));

    function incrementWeek(increment: number) {
        setCurrWeek((prevWeek) => {
            const newWeek = prevWeek + increment;
            if (newWeek < 1) return prevWeek;
            return newWeek;
        });
    };

    function getProgressForDate(date: Date): string {
        const dateKey = getLocalDateKey(date);
        return progressOnDates[dateKey] || '';
    }
    function setProgressForDate(date: Date, progress: string) {
        const dateKey = getLocalDateKey(date);
        setProgressOnDates((prev) => ({ ...prev, [dateKey]: progress }));
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

    function updateGoalTrackerState(progressPerDay: number, start: Date, end: Date, targets: number[]) {
        updateProgressPerDay(progressPerDay);
        updateDateRange(start, end);
        updateTargets(targets.sort((a, b) => a - b));
    }

    return { currWeekState, incrementWeek, datesInWeek, goals, getProgressForDate, setProgressForDate, goalTrackerState, updateGoalTrackerState };
};