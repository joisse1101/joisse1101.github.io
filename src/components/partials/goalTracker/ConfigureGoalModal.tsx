import { DateInput } from '@/components/DateInput';
import { Modal } from '@/components/Modal';
import React, { useRef, useEffect, useState } from 'react';
import type { GoalTrackerState } from '@/hooks/useGoalTracker';

interface ConfigureGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalTrackerState: GoalTrackerState;
    updateGoalTrackerState: (progressPerDay: number, start: Date, end: Date, targets: number[]) => void;
}

export const ConfigureGoalModal: React.FC<ConfigureGoalModalProps> = ({
    isOpen,
    onClose,
    goalTrackerState,
    updateGoalTrackerState
}) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [startDate, setStartDate] = useState<string>(goalTrackerState.startDate.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState<string>(goalTrackerState.endDate.toISOString().split('T')[0]);
    const [expectedProgress, setExpectedProgress] = useState<number | ''>(goalTrackerState.expectedProgressPerDay);
    const [targets, setTargets] = useState<string>(goalTrackerState.goalTargets.join(','));
    const [errors, setErrors] = useState<string[]>([]);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            if (!dialog.open) dialog.showModal();
        } else {
            if (dialog.open) dialog.close();
        }
    }, [isOpen]);

    const handleValidateAndSubmit = () => {
        const newErrors: string[] = [];

        if (!startDate) newErrors.push('Start date is required.');
        if (!endDate) newErrors.push('End date is required.');
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            newErrors.push('Start date cannot be after end date.');
        }
        if (expectedProgress === '') newErrors.push('Expected progress per day is required.');
        if (!targets) {
            newErrors.push('Goal targets are required.')
        } else if (!/^\s*\d+(\s*,\s*\d+)*\s*$/.test(targets)) {
            newErrors.push('Goal targets must be a list of comma-separated numbers.');
        }


        if (newErrors.length > 0) {
            setErrors(newErrors);
            return;
        }

        const parsedTargets = targets
            .split(',')
            .map((item) => Number(item.trim()));

        updateGoalTrackerState(
            parseFloat(expectedProgress as string),
            new Date(startDate),
            new Date(endDate),
            parsedTargets
        );
        onClose();
        setErrors([]);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleValidateAndSubmit}
            title={'Configure Goal'}
        >
            <div className='form-container'>
                <div className="form-group">
                    <label htmlFor="goal-title">Goal Name:</label>
                    <input type="text" id="goal-title" name="goal-title" placeholder="What is your goal?" />
                </div>
                <div className='form-row'>
                    <DateInput label="Start Date:" id="start-date" name="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <DateInput label="End Date:" id="end-date" name="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="expected-progress">Expected Progress Per Day:</label>
                    <div className="input-wrapper">
                        <input type="number" className="no-spinner" id="expected-progress" name="expected-progress" placeholder="e.g., 5" value={expectedProgress} onChange={(e) => setExpectedProgress(e.target.value === '' ? '' : Number(e.target.value))} />
                        <span className="input-suffix">km</span>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="targets">Goal Targets:</label>
                    <input type="text" id="targets" name="targets" placeholder="Enter a list of comma-separated numbers" value={targets} onChange={(e) => setTargets(e.target.value)} />
                </div>
                {errors.length > 0 &&
                    <div className='error-messages'>
                        {errors.map((error, index) => (
                            <div key={index} className="error-message">{error}</div>
                        ))}
                    </div>
                }
            </div>
        </Modal>
    );
};