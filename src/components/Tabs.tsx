import React, { useState, type ReactNode } from 'react';

export interface TabItem {
    id: string;
    label: ReactNode;
    content: ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: TabItem[];
    defaultActiveId?: string;
    activeId?: string;
    onTabChange?: (tabId: string) => void;
    onTabDelete?: (tabId: string) => void;
    onTabAdd?: () => void;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    defaultActiveId,
    activeId: controlledActiveId,
    onTabChange,
    onTabDelete,
    onTabAdd,
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
                        <div
                            key={tab.id}
                            className={`tab-btn ${isActive ? 'active' : ''}`}
                            data-tab={tab.id}
                            onClick={() => handleTabClick(tab.id, tab.disabled)}
                            role="button"
                            aria-disabled={tab.disabled}
                        >
                            {tab.label}
                            {onTabDelete && (
                                <button
                                    className="btn btn-danger btn-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTabDelete(tab.id);
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    );
                })}
                {onTabAdd && (
                    <button
                        type="button"
                        className="tab-btn"
                        onClick={onTabAdd}
                    >
                        + Add Tab
                    </button>
                )}
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