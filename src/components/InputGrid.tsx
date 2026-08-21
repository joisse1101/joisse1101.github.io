import React from 'react';
import { downloadGridCSV } from '@utils/csv';
import { useMediaQuery } from '@hooks/display';

export type CellColour = string | [string, string];

export interface InputGridProps {
    filledCells: Record<string, string>;
    setFilledCells: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    gridSize: number;
    maxInput: number;
    lockedCells: Record<string, boolean>;
    handleClearGrid: () => void;
    handleFillCell: (rowIndex: number, colIndex: number, value: string) => void;
}

const DOWNLOAD_INPUT_TOOLTIP = 'Download the currently displayed grid as a CSV file.';
export const InputGrid: React.FC<InputGridProps> = ({ filledCells, setFilledCells, gridSize, maxInput, lockedCells, handleClearGrid, handleFillCell }) => {

    const downloadGridAsCSV = () => {
        const filename = 'grid_data.csv';
        const csvData = Array.from({ length: gridSize }, (_, rowIdx) =>
            Array.from({ length: gridSize }, (_, colIdx) => {
                const cellKey = `${rowIdx}-${colIdx}`;
                if (!filledCells[cellKey]) {
                    return '';
                }
                return filledCells[cellKey].toString();
            })
        );

        downloadGridCSV(csvData, filename);
    };

    const isDesktop = useMediaQuery(600);
    const isGridEmpty = Object.keys(filledCells).length === 0;

    return (
        <>
            <div className='btn-container btn-container-right'>
                <div className='btn-wrapper'>
                    {!isGridEmpty && (
                        <button className='btn btn-secondary' onClick={downloadGridAsCSV} title={DOWNLOAD_INPUT_TOOLTIP}>
                            Download Grid
                        </button>
                    )}
                    {isDesktop && (
                        <button className='btn btn-danger' onClick={handleClearGrid}>
                            Clear Grid
                        </button>
                    )}
                </div>

            </div>
            <div
                className="granny-grid"
                style={{
                    '--grid-size': gridSize,
                } as React.CSSProperties}
            >
                {Array.from({ length: gridSize }, (_, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                        {Array.from({ length: gridSize }, (_, colIdx) => {
                            const cellKey = `${rowIdx}-${colIdx}`;
                            const cellValue = filledCells[cellKey];
                            return (
                                <div key={cellKey} className="grid-cell">
                                    {isDesktop ? (
                                        <input
                                            className="no-spinner"
                                            type="number"
                                            min={0}
                                            max={maxInput}
                                            value={cellValue ?? ''}
                                            onChange={(e) =>
                                                handleFillCell(rowIdx, colIdx, e.target.value)
                                            }
                                            disabled={lockedCells[cellKey]}
                                        />
                                    ) : (
                                        <div>{cellValue}</div>
                                    )}
                                </div>
                            )
                        })}
                    </React.Fragment>
                ))}
            </div>
        </>
    );
};