import Tabs, { type TabItem } from "@/components/Tabs";
import { WeekSelector } from "@/components/WeekSelector";
import { useState } from "react";
import { GoalTimeline } from "@/components/partials/goalTracker/GoalTimeline";
import { useGoalTracker } from "@/hooks/useGoalTracker";

export default function GoalTracker() {
    const [activeTab, setActiveTab] = useState<string>('walking-tab');

    const { currWeekState, incrementWeek, datesInWeek, goals, getProgressForDate, setProgressForDate } = useGoalTracker();

    const tabItems: TabItem[] = [
        {
            id: 'walking-tab',
            label: 'Walking',
            content: (
                <div>
                    <GoalTimeline goals={goals} />
                    <WeekSelector
                        weekState={currWeekState}
                        incrementWeek={incrementWeek}
                    />
                    <div className="stacked">
                        {datesInWeek.map((date) => (
                            <div key={date.toISOString()} className="side-by-side">
                                <span style={{ width: '150px', display: 'inline-block' }}>
                                    {date.toDateString()}
                                </span>
                                <input type="number" className="no-spinner" min="0" placeholder="21" value={getProgressForDate(date)} onChange={(e) => setProgressForDate(date, e.target.value)} />
                                <span>km</span>
                            </div>
                        ))}
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