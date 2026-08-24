import { useMediaQuery } from "@/hooks/display";

export type WeekState = {
    startDate: Date;
    endDate: Date;
    week: number;
};
type WeekSelectorProps = {
    weekState: WeekState;
    incrementWeek: (increment: number) => void;
}

export const WeekSelector = ({ weekState, incrementWeek }: WeekSelectorProps) => {
    const { startDate, endDate, week } = weekState;
    const isDecrementDisabled = week <= 1; // Disable decrement button if week is 1 or less

    const onIncrWeek = () => {
        incrementWeek(1);
    };

    const onDecrWeek = () => {
        if (isDecrementDisabled) return; // Prevent decrementing below week 1
        incrementWeek(-1);
    };

    const isPhone = !useMediaQuery(600); // Adjust the breakpoint as needed
    const weekString = isPhone ? `Week ${week}\n${startDate.toDateString()} - ${endDate.toDateString()}` : `Week ${week}: ${startDate.toDateString()} - ${endDate.toDateString()}`;

    return (
        <div className="week-selector-wrapper">
            <button className="btn btn-invisible" onClick={onDecrWeek} disabled={isDecrementDisabled}>
                〈
            </button>
            <span>{weekString}</span>
            <button className="btn btn-invisible" onClick={onIncrWeek}>
                〉
            </button>
        </div>
    )
}