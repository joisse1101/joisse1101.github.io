import { useEffect, useState } from 'react';
import { ColorPalettePicker } from '../../components/ColourPalettePicker';
import { Tabs, type TabItem } from '../../components/Tabs';
import { GrannyGrid } from '../../components/GrannyGrid';
import { PaletteDisplay } from '../../components/PaletteDisplay';
import { InputGrid } from '../../components/InputGrid';
import { useMediaQuery } from '../../hooks/display';

// Extend Window so TypeScript doesn't throw errors
declare global {
    interface Window {
        generateGrannySquare?: (gridSize: number, colors: string[], numPatterns: number, patternGrid?: (number | undefined)[][]) => Promise<{ colourGrid: string[][]; patternGrid: string[][] }>;
        addLogs: (log: string[]) => void;
    }
}

type GrannyGridState = {
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
    const isDesktop = useMediaQuery(600);
    const maxGridSize = isDesktop ? 24 : 18; // Limit grid size for mobile devices

    const [gridSize, setGridSize] = useState<string>('18');
    const [numPatterns, setNumPatterns] = useState<string>('6');
    const [colors, setColors] = useState<string[]>([]);
    const [patternGrid, setPatternGrid] = useState<string[][]>(Array.from({ length: parseInt(gridSize, 10) }, () => Array(parseInt(gridSize, 10)).fill(''))); // User editable pattern grid
    const [generationLogs, setGenerationLogs] = useState<string[]>([]);
    const [errors, setErrors] = useState<string[]>([]);

    const [activeTab, setActiveTab] = useState<string>('logs-tab');
    const [isOutputDisabled, setIsOutputDisabled] = useState<boolean>(true);
    4
    const [grannyGridState, setGrannyGridState] = useState<GrannyGridState>(defaultGrannyGridState);

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
        };
    }, []);

    const handleClearGrid = () => {
        const clearedGrid = Array.from({ length: parseInt(gridSize, 10) }, () =>
            Array.from({ length: parseInt(gridSize, 10) }, () => '')
        );
        setPatternGrid(clearedGrid);
    };

    const validateInputs = (): boolean => {
        const gridSizeNum = parseInt(gridSize, 10);
        const numPatternsNum = parseInt(numPatterns, 10);
        const errors: string[] = [];
        if (isNaN(gridSizeNum) || gridSizeNum <= 0 || gridSizeNum > maxGridSize) {
            errors.push(`Invalid grid size. Please enter a positive integer between 0 and ${maxGridSize}.`);
        }
        if (isNaN(numPatternsNum) || numPatternsNum <= 0 || numPatternsNum > maxGridSize) {
            errors.push(`Invalid number of patterns. Please enter a positive integer between 0 and ${maxGridSize}.`);
        }
        if (colors.length === 0) {
            errors.push('Please select at least one color for the palette.');
        }
        if (errors.length > 0) {
            setErrors(errors);
            return false;
        }
        setErrors([]);
        return true;
    };

    const handleGenerate = async () => {
        if (!validateInputs()) {
            setGenerationLogs(['Input validation failed. Please correct the errors and try again.']);
            return;
        }

        setActiveTab('logs-tab');
        setIsOutputDisabled(true);

        if (parseInt(gridSize, 10) > 0 && parseInt(numPatterns, 10) > 0 && colors.length > 0) {
            if (window.generateGrannySquare) {
                setGenerationLogs(['Generating granny square...']);
                
                const result = await window.generateGrannySquare(
                    parseInt(gridSize, 10),
                    colors,
                    parseInt(numPatterns, 10),
                    patternGrid.some(row => row.some(cell => cell !== ''))
                        ? patternGrid.map(row =>
                            row.map(cell => {
                                const parsed = parseInt(cell, 10);
                                return Number.isNaN(parsed) ? undefined : parsed;
                            })
                        )
                        : undefined
                );
                setGrannyGridState({
                    gridSize: parseInt(gridSize, 10),
                    colourGrid: result.colourGrid,
                    patternGrid: result.patternGrid,
                    palette: colors,
                });
                setPatternGrid(result.patternGrid);
                setIsOutputDisabled(false);
                setTimeout(() => setActiveTab('output-tab'), 500);
            } else {
                setGenerationLogs(['Something went wrong.', 'generateGrannySquare function is not available on window.']);
            }
        }

    };

    const activeHighlight = hoveredColour ?? selectedColour;

    const handleColourClick = (colour: string) => {
        // Toggle active selection on click
        if (selectedColour?.toLowerCase() === colour.toLowerCase()) {
            setSelectedColour(null);
        } else {
            setSelectedColour(colour);
        }
    };

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
            content: (
                <div className="output-section">
                    <div id="grid-container">
                        <InputGrid
                            gridInput={patternGrid}
                            setGridInput={setPatternGrid}
                            gridSize={parseInt(gridSize, 10)}
                            maxInput={parseInt(numPatterns, 10) - 1}
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

            <div className="card card-control-panel">
                <div id="form-grid" className="form-grid">
                    <div className="form-group">
                        <label htmlFor="gridSize">Grid Size</label>
                        <input type="number" id="gridSize" value={gridSize}
                            onChange={(e) => {
                                setGridSize(e.target.value)
                                handleClearGrid(); // Clear the pattern grid when grid size changes
                            }}
                            disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="numPatterns">Number of Patterns</label>
                        <input type="number" id="numPatterns" value={numPatterns} onChange={(e) => {
                            setNumPatterns(e.target.value)
                            handleClearGrid(); // Clear the pattern grid when number of patterns changes
                        }} disabled={isLoading} />
                    </div>
                    <details id="colour-picker-details" className={`color-picker-accordion ${isLoading ? 'disabled' : ''}`}>
                        <summary className={`accordion-header ${isLoading ? 'disabled' : ''}`}>Colour Settings / Palette</summary>
                        <ColorPalettePicker onChange={(newPalette: string[]) => setColors(newPalette)} />
                    </details>
                    {errors.length > 0 && (
                        <div className="error-messages">
                            {errors.map((error, index) => (
                                <div key={index} className="error-message">{error}</div>
                            ))}
                        </div>
                    )}
                </div>

                <button id="submitBtn" className="btn btn--primary" type="button" disabled={isLoading} onClick={handleGenerate}>
                    {isLoading ? 'Loading...' : 'Generate Square'}
                </button>
            </div>

            <Tabs tabs={tabItems} activeId={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />
        </div>
    );
}