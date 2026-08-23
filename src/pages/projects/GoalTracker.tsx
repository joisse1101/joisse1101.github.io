import Tabs, { type TabItem } from "@/components/Tabs";
import { WeekSelector, type WeekState } from "@/components/WeekSelector";
import { useState } from "react";
import { getDatesInRange } from "@/utils/dates";
import { GoalTimeline } from "@/components/partials/goalTracker/GoalTimeline";

export default function GoalTracker() {
    const [activeTab, setActiveTab] = useState<string>('walking-tab');

    const [currWeekState, setCurrWeekState] = useState<WeekState>({
        startDate: new Date(2026, 7, 21),
        endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // Default to one week later
        week: 1
    });

    const tabItems: TabItem[] = [
        {
            id: 'walking-tab',
            label: 'Walking',
            content: (
                <div>
                    <GoalTimeline />
                    <WeekSelector
                        weekState={currWeekState}
                        onWeekChange={(newWeekState) => setCurrWeekState(newWeekState)}
                    />
                    <div className="stacked">
                        {getDatesInRange(currWeekState.startDate, currWeekState.endDate).map((date) => (
                            <div key={date.toISOString()} className="side-by-side">
                                <span style={{ width: '150px', display: 'inline-block' }}>
                                    {date.toDateString()}
                                </span>
                                <input type="number" min="0" placeholder="Steps" />
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