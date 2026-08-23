import { getStatusColor, interpolateColors } from "@/utils/colours";
import { useState } from "react";

type GoalStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export const GoalTracker = () => {
    const [goal, setGoals] = useState<number[]>([1, 5, 30, 100, 200, 300, 500, 750]);

    const generatedPalette =
        [
            ...interpolateColors(getStatusColor('danger'), getStatusColor('warning'), goal.length / 2 - 2),
            ...interpolateColors(getStatusColor('warning'), getStatusColor('success'), goal.length / 2 - 1).slice(1)
        ];
    return (
        <div className="card">
            {/* <div className="palette-preview" id="palette-preview">
                {generatedPalette.map((hexCode, idx) => (
                    <div
                        key={`${hexCode}-${idx}`}
                        className="palette-swatch"
                        style={{ backgroundColor: hexCode }}
                        title={hexCode}
                    >{hexCode}</div>
                ))}
            </div> */}
            <div className="horizontal-tracker">
                {goal.map((goalNumber, idx) => {
                    const goalStatus: GoalStatus = idx < 2 ? 'COMPLETED' : idx === 2 ? 'ACTIVE' : 'PENDING';
                    return (
                        <GoalComponent
                            key={idx}
                            goalStatus={goalStatus}
                            goal={{
                                number: goalNumber,
                                title: `${goalNumber} km`,
                                subtitle: `Subtitle ${goalNumber}`,
                                color: generatedPalette[idx]
                            }}
                        />
                    );
                })}
            </div>

        </div>
    );
};

const GoalComponent: React.FC<{
    goalStatus: GoalStatus;
    goal: {
        number: number;
        title: string;
        subtitle: string;
        color: string;
    }
}> = ({ goalStatus, goal }) => {
    const [isHovered, setIsHovered] = useState(false);
    const stepClass = goalStatus === 'COMPLETED' ? 'completed' : goalStatus === 'ACTIVE' ? 'active' : '';

    const baseBorderColor = goalStatus === 'PENDING' ? 'var(--border-color)' : goal.color;
    const hoverBorderColor = `color-mix(in srgb, ${goal.color} 60%, white)`;
    return (
        <div className={`step ${stepClass}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="node"
                style={{
                    backgroundColor: goalStatus === 'PENDING' ? 'var(--input-bg)' : `color-mix(in srgb, ${goal.color} 40%, transparent)`,
                    borderColor: isHovered ? hoverBorderColor : baseBorderColor
                }}
            >{goalStatus === 'COMPLETED' ? '✔' :
                goal.number}</div>
            <div className="label-group">
                <span className="step-title">{goal.title}</span>
                <span className="step-subtitle">{goal.subtitle}</span>
            </div>

        </div>
    )
}