import Tabs, { type TabItem } from "@/components/Tabs";
import { WeekSelector } from "@/components/WeekSelector";
import { useState } from "react";
import { GoalTimeline } from "@/components/partials/goalTracker/GoalTimeline";
import { useGoalTracker } from "@/hooks/useGoalTracker";

export default function GoalTracker() {
    const [activeTab, setActiveTab] = useState<string>('walking-tab');

    const { currWeekState, incrementWeek, datesInWeek, goals, getProgressForDate, setProgressForDate, goalTrackerState, updateGoalTrackerState, weekendDates, targetWeekendProgress } = useGoalTracker();

    const tabItems: TabItem[] = [
        {
            id: 'walking-tab',
            label: 'Walking',
            content: (
                <div>
                    <GoalTimeline goals={goals} goalTrackerState={goalTrackerState} updateGoalTrackerState={updateGoalTrackerState} />
                    <WeekSelector
                        weekState={currWeekState}
                        incrementWeek={incrementWeek}
                    />
                    <div className="stacked">
                        {datesInWeek.map((date) => {
                            const placeholder = weekendDates.includes(date) ? targetWeekendProgress.toString() : goalTrackerState.expectedProgressPerDay.toString();
                            return (
                                <div key={date.toISOString()} className="side-by-side">
                                    <span style={{ width: '150px', display: 'inline-block' }}>
                                        {date.toDateString()}
                                    </span>
                                    <input type="number" step="any" className="no-spinner" min="0" placeholder={placeholder} value={getProgressForDate(date)} onChange={(e) => setProgressForDate(date, e.target.value)} />
                                    <span>km</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )
        }

    ]
    return (
        <div className="app-wrapper">
            <Tabs
                tabs={tabItems}
                activeId={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId)}
            />
        </div>
    )
};