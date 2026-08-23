import type { WeekState } from "@components/WeekSelector";
import { useState } from "react";
import { getDatesInRange, getLocalDateKey } from "@/utils/dates";
import { getStatusColor, interpolateColors } from "@/utils/colours";

export type GoalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export type GoalState = {
    number: number;
    title: string;
    subtitle: string;
    color: string;
    state: GoalStatus;
};

export const useGoalTracker = () => {
    const [currWeekState, setCurrWeekState] = useState<WeekState>({
        startDate: new Date(2026, 7, 21),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Default to one week later
        week: 1
    });

    const incrementWeek = (increment: number) => {
        setCurrWeekState((prevState) => {
            const newWeek = prevState.week + increment;
            if (newWeek < 1) return prevState; // Prevent decrementing below week 1
            const newStartDate = new Date(prevState.startDate);
            newStartDate.setDate(newStartDate.getDate() + increment * 7);
            const newEndDate = new Date(newStartDate);
            newEndDate.setDate(newEndDate.getDate() + 6);
            return {
                startDate: newStartDate,
                endDate: newEndDate,
                week: newWeek
            };
        });
    };

    const datesInWeek = getDatesInRange(currWeekState.startDate, currWeekState.endDate);
    const goalTargets: number[] = [1, 5, 30, 100, 200, 300, 500, 750];
    const goalColors = [
        ...interpolateColors(getStatusColor('danger'), getStatusColor('warning'), goalTargets.length / 2 - 2),
        ...interpolateColors(getStatusColor('warning'), getStatusColor('success'), goalTargets.length / 2 - 1).slice(1)
    ];

    const [progressOnDates, setProgressOnDates] = useState<Record<string, string>>({});
    const getProgressForDate = (date: Date): string => {
        const dateKey = getLocalDateKey(date);
        return progressOnDates[dateKey] || '';
    }
    const setProgressForDate = (date: Date, progress: string) => {
        const dateKey = getLocalDateKey(date);
        setProgressOnDates((prev) => ({ ...prev, [dateKey]: progress }));
    }

    const currentProgress = datesInWeek.reduce((sum, date) => sum + (parseFloat(getProgressForDate(date)) || 0), 0);
    const activeGoalIdx = goalTargets.reduce(
        (maxIdx, goal, idx) => (currentProgress >= goal ? idx : maxIdx),
        -1
    );

    const goals: GoalState[] = goalTargets.map((number, idx) => ({
        number,
        title: `${number} km`,
        subtitle: `Subtitle ${number}`,
        color: goalColors[idx],
        state: idx == activeGoalIdx ? 'ACTIVE' : idx < activeGoalIdx ? 'COMPLETED' : 'PENDING'
    }));

    return { currWeekState, incrementWeek, datesInWeek, goals, getProgressForDate, setProgressForDate };
};