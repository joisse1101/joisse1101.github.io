import { useCanSideScroll } from "@/hooks/useCanSideScroll";
import { useRef } from "react";

export type Option = {
    label: string;
    value: string | number;
}
interface ButtonSelectorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
    label: string;
    options: Option[];
    selectedOptions: (string | number)[] | null;
    onSelect: (value: string | number) => void;
}

export const ButtonSelector: React.FC<ButtonSelectorProps> = ({ label, options, selectedOptions, onSelect, ...props }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const { canScrollLeft, canScrollRight } = useCanSideScroll(containerRef);

    return (<div className="form-group" {...props}>
        <div id={label} className="label">{label}</div>
        <div className="overlay-wrapper">
            <div className={`overlay-left ${!canScrollLeft ? 'hidden' : ''}`} />
            <div className={`overlay-right ${!canScrollRight ? 'hidden' : ''}`} />
            <div className="overlay-component" aria-labelledby={label} ref={containerRef}>
                {options.map((option) => (

                    <button
                        key={option.value}
                        onClick={() => onSelect(option.value)}

                        className={`btn-option${selectedOptions?.includes(option.value) ? ' selected' : ''}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    </div>)
}
