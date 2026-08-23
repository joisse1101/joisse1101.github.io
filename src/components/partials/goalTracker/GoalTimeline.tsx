import { useEffect, useState } from "react";
import type { GoalState } from "@/hooks/useGoalTracker";

export const GoalTimeline = ({ goals }: { goals: GoalState[] }) => {
    return (
        <div className="card">
            <div className="horizontal-tracker">
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