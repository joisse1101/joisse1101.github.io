import React, { useRef, type ChangeEvent } from 'react';
import { downloadGridCSV, parseGridCSV } from '@utils/csv';
import { useMediaQuery } from '@hooks/display';

export type CellColour = string | [string, string];

export interface InputGridProps {
    gridInput: string[][];
    setGridInput: React.Dispatch<React.SetStateAction<string[][]>>;
    gridSize: number; // Optional prop for grid size
    maxInput: number;
}

const DOWNLOAD_INPUT_TOOLTIP = 'Download the currently displayed grid as a CSV file.';
const UPLOAD_INPUT_TOOLTIP = 'Upload a CSV file to populate the grid.\nNumbers in the grid will be clamped between 0 and the specified maximum input value.';

export const InputGrid: React.FC<InputGridProps> = ({ gridInput, setGridInput, gridSize, maxInput }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const downloadGridAsCSV = () => {
        const filename = 'grid_data.csv';
        const csvData = gridInput.map((row) => row.map((cell) => cell.toString()));
        downloadGridCSV(csvData, filename);
    }

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!gridSize) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const parsedData = parseGridCSV(content, gridSize); // Use your parseGridCSV function
                const cleanedData = parsedData.map((row) =>
                    row.map((cell) => {
                        const num = parseInt(cell);
                        return isNaN(num) ? '' : Math.min(Math.max(num, 0), maxInput).toString();
                    })
                );
                setGridInput(cleanedData);
            }
        };

        reader.readAsText(file);

        // Reset input value so the same file can be selected twice in a row
        event.target.value = '';
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleClearGrid = () => {
        const clearedGrid = Array.from({ length: gridSize }, () =>
            Array.from({ length: gridSize }, () => '')
        );
        setGridInput(clearedGrid);
    };

    const isDesktop = useMediaQuery(600); // Adjust the breakpoint as needed
    const isGridEmpty = gridInput.every((row) => row.every((cell) => cell === ''));

    return (
        <>
            <div className='btn-container'>
                <div className='btn-wrapper' onClick={handleClearGrid}>
                    <input type="file" ref={fileInputRef}
                        accept=".csv,text/csv,text/plain,application/csv,text/comma-separated-values"
                        onChange={handleFileUpload} style={{ display: 'none' }} />
                    <button className='btn btn-primary' onClick={handleUploadButtonClick} title={UPLOAD_INPUT_TOOLTIP}>
                        Upload Grid
                    </button>
                    {!isGridEmpty && (
                        <button className='btn btn-secondary' onClick={downloadGridAsCSV} title={DOWNLOAD_INPUT_TOOLTIP}>
                            Download Grid
                        </button>
                    )}
                </div>
                {isDesktop && (
                    <button className='btn btn-danger' onClick={handleClearGrid}>
                        Clear Grid
                    </button>
                )}
            </div>
            {isDesktop && (
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
            )}
        </>
    );
};