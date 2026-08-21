import { useCallback, useEffect, useState } from 'react';
import { Tabs, type TabItem } from '@components/Tabs';
import { GrannyGrid } from '@/components/partials/grannySquare/GrannyGrid';
import { PaletteDisplay } from '@/components/partials/grannySquare/PaletteDisplay';
import { ControlPanel } from '@/components/partials/grannySquare/ControlPanel';
import { InputGrid } from '@/components/InputGrid';

// Extend Window so TypeScript doesn't throw errors
declare global {
    interface Window {
        generateGrannySquare?: (gridSize: number, colors: string[], numPatterns: number, patternGrid?: (number | undefined)[][]) => Promise<{ colourGrid: string[][]; patternGrid: string[][] }>;
        addLogs?: (log: string[]) => void;
    }
}

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

export default function GrannySquare() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [generationLogs, setGenerationLogs] = useState<string[]>([]);


    const [activeTab, setActiveTab] = useState<string>('logs-tab');
    const [isOutputDisabled, setIsOutputDisabled] = useState<boolean>(true);
    const [grannyGridState, setGrannyGridState] = useState<GrannyGridState>(defaultGrannyGridState);
    const [lockedCells, setLockedCells] = useState<Record<string, boolean>>({});
    const [filledCells, setFilledCells] = useState<Record<string, string>>({});
    const [gridSize, setGridSize] = useState<string>('18');
    const [numPatterns, setNumPatterns] = useState<string>('6');

    const [selectedColour, setSelectedColour] = useState<string | null>(null);
    const [hoveredColour, setHoveredColour] = useState<string | null>(null);

    useEffect(() => {
        window.addLogs = (log: string[]) => {
            const newLogs = Array.from(log);
            setGenerationLogs((prevLogs) => [...prevLogs, ...newLogs]);
        };

        const handleAppReady = () => {
            console.log('PyScript environment fully loaded!');
            setIsLoading(false);
        };

        document.addEventListener('py-app-ready', handleAppReady);

        const pyScript = document.createElement('script');
        pyScript.type = 'py';
        pyScript.src = '/assets/python/granny-square/main.py';

        document.body.appendChild(pyScript);

        return () => {
            document.removeEventListener('py-app-ready', handleAppReady);
            pyScript.remove();
            delete window.generateGrannySquare;
            delete window.addLogs;
        };
    }, []);

    const activeHighlight = hoveredColour ?? selectedColour;

    const handleColourClick = (colour: string) => {
        // Toggle active selection on click
        if (selectedColour?.toLowerCase() === colour.toLowerCase()) {
            setSelectedColour(null);
        } else {
            setSelectedColour(colour);
        }
    };

    const isPatternGridEmpty = Object.keys(filledCells).length === 0 && Object.keys(lockedCells).length === 0;

    const handleCellLockToggle = (cellKey: string) => {
        const [rowIndex, colIndex] = cellKey.split('-').map((index) => parseInt(index, 10));
        console.log(`Row index: ${rowIndex}, Column index: ${colIndex}`);
        const cellValue = grannyGridState.patternGrid[rowIndex]?.[colIndex];
        console.log(`Toggling lock for cell ${cellKey}. Current value: ${cellValue}`);
        setLockedCells((prev) => ({ ...prev, [cellKey]: !prev[cellKey] }));
        setFilledCells((prev) => ({ ...prev, [cellKey]: cellValue }));
    };

    const handleCellLockUpdate = useCallback((newLockedCells: Record<string, string>) => {
        const updatedLockedCells: Record<string, boolean> = {};
        Object.keys(newLockedCells).forEach((cellKey) => {
            updatedLockedCells[cellKey] = true;
        });
        setLockedCells(updatedLockedCells);
    }, []);

    const lockFilledCells = () => {
        const newLockedCells: Record<string, string> = { ...filledCells };
        handleCellLockUpdate(newLockedCells);
    };

    const handleClearGrid = () => {
        setFilledCells({});
        setLockedCells({});
    }

    const tabItems: TabItem[] = [
        {
            id: 'output-tab',
            label: 'Grid & Palette',
            disabled: isOutputDisabled,
            content: (
                <div className="output-flex-wrapper">
                    <div id="grid-container">
                        <GrannyGrid
                            key={JSON.stringify(grannyGridState)} // Force re-render when state changes
                            gridSize={grannyGridState.gridSize}
                            colourGrid={grannyGridState.colourGrid}
                            patternGrid={grannyGridState.patternGrid}
                            highlightedColour={activeHighlight}
                            lockedCells={lockedCells}
                            handleCellLockToggle={handleCellLockToggle}
                            />
                    </div>
                    <div id="palette-table-container">
                        <PaletteDisplay
                            key={JSON.stringify(grannyGridState.palette)} // Force re-render when palette changes
                            palette={grannyGridState.palette}
                            activeColour={selectedColour}
                            onHoverColour={setHoveredColour}
                            onClickColour={handleColourClick}
                            />
                    </div>
                </div>
            ),
        },
        {
            id: 'patterns-tab',
            label: 'Patterns',
            disabled: isPatternGridEmpty,
            content: (
                <div className="output-section">
                    <div id="grid-container">
                        <InputGrid
                            filledCells={filledCells}
                            setFilledCells={setFilledCells}
                            gridSize={parseInt(gridSize, 10)}
                            maxInput={parseInt(numPatterns, 10) - 1}
                            lockedCells={lockedCells}
                            handleClearGrid={handleClearGrid}
                        />
                    </div>
                </div>
            ),
        },
        {
            id: 'logs-tab',
            label: 'Logs',
            content: (
                <div className="output-section">
                    <div id="log-container" className="card card-output-logs">
                        {generationLogs && generationLogs.length > 0 ? generationLogs.join('\n') : `Click Generate Square to begin`}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="app-wrapper">
            <div id="loading-spinner" className={`card ${isLoading ? '' : 'collapsed'}`}>
                <span>Loading Python environment and scripts...</span>
            </div>

            <ControlPanel
                gridSize={gridSize}
                setGridSize={setGridSize}
                numPatterns={numPatterns}
                setNumPatterns={setNumPatterns}
                filledCells={filledCells}
                setFilledCells={setFilledCells}
                isLoading={isLoading}
                setGenerationLogs={setGenerationLogs}
                setActiveTab={setActiveTab}
                setIsOutputDisabled={setIsOutputDisabled}
                setGrannyGridState={setGrannyGridState}
                lockFilledCells={lockFilledCells}
            />

            <Tabs tabs={tabItems} activeId={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />
        </div>
    );
}