import { WeekSelector } from "@/components/WeekSelector";
import { GoalTimeline } from "@/components/partials/goalTracker/GoalTimeline";
import { useGoalTracker } from "@/hooks/useGoalTracker";

export const TrackerTab: React.FC<{ id: string }> = ({
    id,
}) => {

    const { currWeekState, incrementWeek, weeksInTracker, datesInWeek, goals, getProgressForDate, setProgressForDate, goalTrackerState, updateGoalTrackerState, weekendDates, targetWeekendProgress } = useGoalTracker(id);

    return (
        <div className="output-flex-wrapper stacked">
            <GoalTimeline goals={goals} goalTrackerState={goalTrackerState} updateGoalTrackerState={updateGoalTrackerState} />
            <WeekSelector
                weekState={currWeekState}
                incrementWeek={incrementWeek}
                maxWeeks={weeksInTracker}
            />
            <div className="stacked">
                {datesInWeek.map((date) => {
                    const placeholder = weekendDates.includes(date) ? targetWeekendProgress.toString() : goalTrackerState.expectedProgressPerDay.toString();
                    const isDisabled = date < goalTrackerState.startDate || date > goalTrackerState.endDate;
                    return (
                        <div key={date.toISOString()} className="side-by-side">
                            <span style={{ width: '150px', display: 'inline-block' }}>
                                {date.toDateString()}
                            </span>
                            <input
                                type="number"
                                step="any"
                                className="no-spinner"
                                min="0"
                                placeholder={isDisabled ? '-' : placeholder}
                                disabled={isDisabled}
                                value={getProgressForDate(date)}
                                onChange={(e) => setProgressForDate(date, e.target.value)} />
                            <span>km</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )

}