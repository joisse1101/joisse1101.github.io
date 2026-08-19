import React, { useState, type ReactNode } from 'react';

export interface TabItem {
    id: string;
    label: string;
    content: ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: TabItem[];
    defaultActiveId?: string;
    activeId?: string;
    onTabChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    defaultActiveId,
    activeId: controlledActiveId,
    onTabChange,
}) => {
    const [internalActiveId, setInternalActiveId] = useState<string>(
        defaultActiveId || tabs[0]?.id || ''
    );

    // Support both controlled and uncontrolled usage
    const activeTabId = controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

    const handleTabClick = (tabId: string, disabled?: boolean) => {
        if (disabled) return;

        if (controlledActiveId === undefined) {
            setInternalActiveId(tabId);
        }
        onTabChange?.(tabId);
    };

    return (
        <div className="tabs-container">
            {/* Tab Buttons Header */}
            <div className="tabs-header">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            className={`tab-btn ${isActive ? 'active' : ''}`}
                            data-tab={tab.id}
                            disabled={tab.disabled}
                            onClick={() => handleTabClick(tab.id, tab.disabled)}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="tabs-body">
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTabId;
                    return (
                        <div
                            key={tab.id}
                            id={tab.id}
                            className={`tab-content ${isActive ? 'active' : ''}`}
                        >
                            {tab.content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Tabs;