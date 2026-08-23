import { interpolateColors } from '@/utils/colours';
import React, { useState, useMemo, useEffect } from 'react';

export interface PaletteItem {
    id: number;
    hex: string;
    stepsToNext: number;
}

interface ColorPalettePickerProps {
    /** Optional initial palette state */
    initialPalette?: PaletteItem[];
    /** Optional callback triggered whenever the generated full palette updates */
    onChange?: (fullPalette: string[]) => void;
}


// --- Default Initial State ---

const DEFAULT_PALETTE: PaletteItem[] = [
    { id: 1, hex: '#f2f3f5', stepsToNext: 5 },
    { id: 2, hex: '#9c8b7a', stepsToNext: 5 },
    { id: 3, hex: '#4bbed8', stepsToNext: 5 },
    { id: 4, hex: '#343648', stepsToNext: 0 },
];

export const ColorPalettePicker: React.FC<ColorPalettePickerProps> = ({
    initialPalette = DEFAULT_PALETTE,
    onChange,
}) => {
    const [paletteState, setPaletteState] = useState<PaletteItem[]>(initialPalette);
    const [nextId, setNextId] = useState<number>(() =>
        Math.max(...initialPalette.map((p) => p.id), 0) + 1
    );

    const fullPalette = useMemo(() => {
        if (paletteState.length === 0) return [];
        if (paletteState.length === 1) return [paletteState[0].hex];

        const generated: string[] = [];
        for (let i = 0; i < paletteState.length - 1; i++) {
            const startColor = paletteState[i].hex;
            const endColor = paletteState[i + 1].hex;
            const steps = paletteState[i].stepsToNext;

            const segment = interpolateColors(startColor, endColor, steps);
            if (i < paletteState.length - 2) {
                segment.pop();
            }
            generated.push(...segment);
        }

        return generated;
    }, [paletteState]); // Removed `onChange` dependency

    useEffect(() => {
        onChange?.(fullPalette);
    }, [fullPalette, onChange]);

    const handleColorChange = (id: number, hex: string) => {
        setPaletteState((prev) =>
            prev.map((item) => (item.id === id ? { ...item, hex } : item))
        );
    };

    const handleStepsChange = (id: number, steps: number) => {
        const validSteps = Math.max(0, isNaN(steps) ? 0 : steps);
        setPaletteState((prev) =>
            prev.map((item) => (item.id === id ? { ...item, stepsToNext: validSteps } : item))
        );
    };

    const handleAddColor = () => {
        setPaletteState((prev) => [
            ...prev,
            { id: nextId, hex: '#000000', stepsToNext: 2 },
        ]);
        setNextId((prev) => prev + 1);
    };

    const handleDeleteColor = (id: number) => {
        if (paletteState.length <= 2) return;
        setPaletteState((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <div className="color-picker-component">
            {/* Controls List */}
            <div className="color-inputs-list" id="color-inputs-list">
                {paletteState.map((item, index) => {
                    const isLast = index === paletteState.length - 1;

                    return (
                        <div key={item.id} className="input-card color-row">
                            {/* Native Color Input */}
                            <input
                                type="color"
                                value={item.hex}
                                onChange={(e) => handleColorChange(item.id, e.target.value)}
                            />

                            {/* Step Control (all except last item) */}
                            {!isLast && (
                                <div className="step-control">
                                    <label htmlFor={`step-input-${item.id}`}>Steps to next:</label>
                                    <input
                                        id={`step-input-${item.id}`}
                                        type="number"
                                        className="input-sm"
                                        min="0"
                                        max="20"
                                        value={item.stepsToNext}
                                        onChange={(e) =>
                                            handleStepsChange(item.id, parseInt(e.target.value, 10))
                                        }
                                    />
                                </div>
                            )}

                            {/* Remove Button */}
                            {paletteState.length > 2 && (
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => handleDeleteColor(item.id)}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Color Button */}
            <button type="button" className="btn btn-add-color" onClick={handleAddColor}>
                + Add Color
            </button>

            {/* Visual Palette Preview */}
            <div className="palette-preview" id="palette-preview">
                {fullPalette.map((hexCode, idx) => (
                    <div
                        key={`${hexCode}-${idx}`}
                        className="palette-swatch"
                        style={{ backgroundColor: hexCode }}
                        title={hexCode}
                    />
                ))}
            </div>

            {/* Hex Codes Display */}
            <div className="hex-codes" id="hex-codes">
                {fullPalette.map((hexCode, idx) => (
                    <span key={`${hexCode}-${idx}`} className="hex-chip">
                        {hexCode}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ColorPalettePicker;