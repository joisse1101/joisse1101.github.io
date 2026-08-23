import { useState } from "react";

export type WeekState = {
    startDate: Date;
    endDate: Date;
    week: number;
};
type WeekSelectorProps = {
    weekState: WeekState;
    onWeekChange: (newWeekState: WeekState) => void;
}

export const WeekSelector = ({ weekState, onWeekChange }: WeekSelectorProps) => {
    const { startDate, endDate, week } = weekState;
    const isDecrementDisabled = week <= 1; // Disable decrement button if week is 1 or less

    const onIncrWeek = () => {
        onWeekChange({
            week: week + 1,
            startDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        });
    };

    const onDecrWeek = () => {
        if (isDecrementDisabled) return; // Prevent decrementing below week 1
        onWeekChange({
            week: week - 1,
            startDate: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            endDate: new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        });
    };

    return (
        <div className="week-selector-wrapper">
            <button className="btn btn-invisible" onClick={onDecrWeek} disabled={isDecrementDisabled}>
                〈
            </button>
            <span>Week {week}: {startDate.toDateString()} - {endDate.toDateString()}</span>
            <button className="btn btn-invisible" onClick={onIncrWeek}>
                〉
            </button>
        </div>
    )
}