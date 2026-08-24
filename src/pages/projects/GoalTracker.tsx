import Tabs, { type TabItem } from "@/components/Tabs";
import { useEffect, useState } from "react";
import { TrackerTab } from "@/components/partials/goalTracker/TrackerTab";
import { getStorageItem } from "@/utils/storage";
import { useGoalTitle, deleteGoalStorage } from "@/hooks/useGoalTracker";
import { generateUUID } from '@/utils/numbers';

const STORAGE_KEY = 'goal_tracker_tab_ids';

export default function GoalTracker() {
    const [tabIds, setTabIds] = useState<string[]>(() =>
        getStorageItem(STORAGE_KEY, [generateUUID()]));
    const [activeTab, setActiveTab] = useState<string>(tabIds[0]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tabIds));
    }, [tabIds]);


    const tabItems: TabItem[] = tabIds.map((id) => ({
        id: id,
        label: <DynamicTabLabel id={id} />,
        content: <TrackerTab id={id} />,
    }));

    function handleAddTab() {
        const newId = generateUUID();
        setTabIds([...tabIds, newId]);
        setActiveTab(newId);
    }

    function handleDeleteTab(tabId: string) {
        if (tabIds.length === 1) {
            alert("You cannot delete the last remaining tab.");
            return;
        }
        setTabIds(tabIds.filter(id => id !== tabId));
        if (activeTab === tabId) {
            setActiveTab(tabIds[0]);
        }
        deleteGoalStorage(tabId);
    }
    return (
        <div className="app-wrapper">
            <Tabs
                tabs={tabItems}
                activeId={activeTab}
                onTabChange={(tabId) => setActiveTab(tabId)}
                onTabAdd={handleAddTab}
                onTabDelete={tabIds.length > 1 ? handleDeleteTab : undefined}
            />
        </div>
    )
};

const DynamicTabLabel = ({ id }: { id: string }) => {
    const title = useGoalTitle(id);
    return <>{title}</>;
};