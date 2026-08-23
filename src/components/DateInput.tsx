import React, { useRef } from 'react';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    id: string;
}

export const DateInput: React.FC<DateInputProps> = ({ label, id, ...props }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Opens the browser's native datepicker popup when clicking the icon
    const handleIconClick = () => {
        if (inputRef.current) {
            inputRef.current.showPicker();
        }
    };

    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <div className="input-wrapper">
                <input
                    ref={inputRef}
                    type="date"
                    id={id}
                    {...props}
                />
                {/* Native SVG without extra libraries */}
                <svg
                    className="input-icon"
                    onClick={handleIconClick}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            </div>
        </div>
    );
};