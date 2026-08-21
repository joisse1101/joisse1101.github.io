import { useState } from 'react';

export type GrannyGridState = {
    gridSize: number;
    colourGrid: string[][];
    patternGrid: string[][];
    palette: string[];
};

const defaultGrannyGridState: GrannyGridState = {
    gridSize: 0,
    colourGrid: [],
    patternGrid: [],
    palette: [],
};

export const useGrannySquare = () => {
    const [grannyGridState, setGrannyGridState] = useState<GrannyGridState>(defaultGrannyGridState);
    const [lockedCells, setLockedCells] = useState<Record<string, boolean>>({});
    const [filledCells, setFilledCells] = useState<Record<string, string>>({});
    const [gridSize, setGridSize] = useState<string>('18');
    const [numPatterns, setNumPatterns] = useState<string>('6');

    const handleCellLockToggle = (cellKey: string) => {
        const [rowIndex, colIndex] = cellKey.split('-').map((index) => parseInt(index, 10));
        const cellValue = grannyGridState.patternGrid[rowIndex]?.[colIndex];
        setLockedCells((prev) => ({ ...prev, [cellKey]: !prev[cellKey] }));
        setFilledCells((prev) => ({ ...prev, [cellKey]: cellValue }));
    };

    const lockFilledCells = () => {
        const updatedLockedCells: Record<string, boolean> = {};
        Object.keys(filledCells).forEach((cellKey) => {
            updatedLockedCells[cellKey] = true;
        });
        setLockedCells(updatedLockedCells);
    };

    const handleClearGrid = () => {
        setFilledCells({});
        setLockedCells({});
    }

    return {
        grannyGridState,
        setGrannyGridState,
        lockedCells,
        filledCells,
        setFilledCells,
        gridSize,
        setGridSize,
        numPatterns,
        setNumPatterns,
        handleCellLockToggle,
        lockFilledCells,
        handleClearGrid,
    };
};