import { useEffect, useRef, useState, useLayoutEffect } from "react";
import type { GoalState } from "@/hooks/useGoalTracker";
import { ConfigureGoalModal } from "./ConfigureGoalModal";
import type { GoalTrackerState } from '@/hooks/useGoalTracker';

export const GoalTimeline = ({ goals, goalTrackerState, updateGoalTrackerState }: { goals: GoalState[], goalTrackerState: GoalTrackerState, updateGoalTrackerState: (title: string, progressPerDay: number, start: Date, end: Date, targets: number[]) => void }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const checkScroll = () => {
        const el = containerRef.current;
        if (!el) return;

        // 1px buffer handles fractional rounding issues on high-DPI screens
        const isAtStart = el.scrollLeft <= 1;
        const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        const isOverflowing = el.scrollWidth > el.clientWidth;

        setCanScrollLeft(isOverflowing && !isAtStart);
        setCanScrollRight(isOverflowing && !isAtEnd);
    };

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        checkScroll();

        // Attach event listener for active scroll position changes
        el.addEventListener('scroll', checkScroll);
        window.addEventListener('resize', checkScroll);

        return () => {
            el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, []);

    return (
        <>
            <div className="card">
                <div className='horizontal-tracker-wrapper'>
                    <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
                    <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />
                    <div className={`horizontal-tracker`} ref={containerRef}>
                    {goals.map((goal, idx) => {
                        return (
                            <GoalComponent
                                key={idx}
                                goal={goal}
                            />
                        );
                    })}
                </div>
                </div>
                <button onClick={() => setIsModalOpen(true)}>Configure Goal</button>
            </div>
            <ConfigureGoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} goalTrackerState={goalTrackerState} updateGoalTrackerState={updateGoalTrackerState} />
        </>
    );
};

const GoalComponent: React.FC<{
    goal: GoalState
}> = ({ goal }) => {
    const [isHovered, setIsHovered] = useState(false);
    const stepClass = goal.state === 'COMPLETED' ? 'completed' : goal.state === 'ACTIVE' ? 'active' : '';

    const baseBorderColor = goal.state === 'PENDING' ? 'var(--border-color)' : goal.color;
    const hoverBorderColor = `color-mix(in srgb, ${goal.color} 60%, white)`;

    useEffect(() => {
        if (goal.state === 'ACTIVE') {
            const activeElement = document.querySelector('.step.active');
            if (activeElement) {
                activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [goal.state]);
    return (
        <div className={`step ${stepClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="node"
                style={{
                    backgroundColor: goal.state === 'PENDING' ? 'var(--input-bg)' : `color-mix(in srgb, ${goal.color} 40%, transparent)`,
                    borderColor: isHovered ? hoverBorderColor : baseBorderColor
                }}
            >{goal.state === 'COMPLETED' ? '✔' :
                goal.number}</div>
            <div className="label-group">
                <span className="step-title">{goal.title}</span>
                <span className="step-subtitle">{goal.subtitle}</span>
            </div>

        </div>
    )
}