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
    return (<div {...props}>
        <label className="label">{label}</label>
        <div>
            {options.map((option) => (

                <button
                    key={option.value}
                    onClick={() => onSelect(option.value)}

                    className={`btn-option ${selectedOptions?.includes(option.value) ? 'selected' : ''}`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>)
}
