import React, { useEffect } from 'react';

export type CellColour = string | [string, string];

export interface InputGridProps {
    gridInput: string[][];
    setGridInput: React.Dispatch<React.SetStateAction<string[][]>>;
    gridSize: number; // Optional prop for grid size
    maxInput: number;
}

export const InputGrid: React.FC<InputGridProps> = ({ gridInput, setGridInput, gridSize, maxInput }) => {
    // Create distinct sub-arrays for each row

    const handleInputChange = (rowIdx: number, colIdx: number, value: string) => {
        if (value) {
            value = Math.min(Math.max(parseInt(value), 0), maxInput).toString();
        }
        setGridInput((prevGrid) =>
            prevGrid.map((row, r) =>
                r === rowIdx
                    ? row.map((cell, c) => (c === colIdx ? value : cell))
                    : row
            )
        );
    };

    const handleClearGrid = () => {
        const clearedGrid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => '')
        );
        setGridInput(clearedGrid);
    };

    return (
        <>
            <button className='btn btn-danger' onClick={handleClearGrid}>
                Clear Grid
            </button>
            <div
                className="granny-grid"
                style={{
                    '--grid-size': gridSize,
                } as React.CSSProperties}
            >
                {gridInput.map((row, rowIdx) =>
                    row.map((value, colIdx) => {
                        const cellKey = `${rowIdx}-${colIdx}`;

                        return (
                            <div key={cellKey} className="grid-cell">
                                <input
                                    className="no-spinner"
                                    type="number"
                                    min={0}
                                    max={maxInput}
                                    value={value}
                                    onChange={(e) =>
                                        handleInputChange(rowIdx, colIdx, e.target.value)
                                    }
                                />
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
};