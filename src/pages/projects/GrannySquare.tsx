import { useEffect, useState } from 'react';
import { ColorPalettePicker } from '../../components/ColourPalettePicker';
import { Tabs, type TabItem } from '../../components/Tabs';
import { GrannyGrid } from '../../components/GrannyGrid';
import { PaletteDisplay } from '../../components/PaletteDisplay';

// Extend Window so TypeScript doesn't throw errors
declare global {
    interface Window {
        generateGrannySquare?: (gridSize: number, colors: string[], numPatterns: number) => Promise<{ colourGrid: string[][]; patternGrid: string[][] }>;
        setGenerationLogs?: (logs: string) => void;
    }
}

export default function GrannySquare() {
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [gridSize, setGridSize] = useState<number>(18);
    const [numPatterns, setNumPatterns] = useState<number>(6);
    const [colors, setColors] = useState<string[]>([]);
    const [generationLogs, setGenerationLogs] = useState<string>('');

    const [activeTab, setActiveTab] = useState<string>('logs-tab');
    const [isOutputDisabled, setIsOutputDisabled] = useState<boolean>(true);

    const [grannyGridState, setGrannyGridState] = useState<{
        gridSize: number;
        colourGrid: string[][]; patternGrid: string[][];
        palette: string[];
    }>({
        gridSize: gridSize,
        colourGrid: new Array(gridSize).fill(new Array(gridSize).fill('')),
        patternGrid: new Array(gridSize).fill(new Array(gridSize).fill('')),
        palette: colors,
    });

    const [selectedColour, setSelectedColour] = useState<string | null>(null);
    const [hoveredColour, setHoveredColour] = useState<string | null>(null);

    useEffect(() => {
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

    const handleGenerate = async () => {
        setActiveTab('logs-tab');
        setIsOutputDisabled(true);

        if (gridSize > 0 && numPatterns > 0 && colors.length > 0) {
            if (window.generateGrannySquare) {
                const result = await window.generateGrannySquare(gridSize, colors, numPatterns);
                setGrannyGridState({
                    gridSize: gridSize,
                    colourGrid: result.colourGrid,
                    patternGrid: result.patternGrid,
                    palette: colors,
                });
                setIsOutputDisabled(false);
                setActiveTab('output-tab');
            } else {
                setGenerationLogs('generateGrannySquare function is not available on window.');
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
            id: 'logs-tab',
            label: 'Logs',
            content: (
                <div className="output-section">
                    <div id="log-container" className="card card-output-logs">
                        {generationLogs ? generationLogs : `Click Generate Square to begin`}
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
                            onChange={(e) => setGridSize(Number(e.target.value))}
                            disabled={isLoading} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="numPatterns">Number of Patterns</label>
                        <input type="number" id="numPatterns" value={numPatterns} onChange={(e) => setNumPatterns(Number(e.target.value))} disabled={isLoading} />
                    </div>
                    <details id="colour-picker-details" className={`color-picker-accordion ${isLoading ? 'disabled' : ''}`}>
                        <summary className={`accordion-header ${isLoading ? 'disabled' : ''}`}>Colour Settings / Palette</summary>
                        <ColorPalettePicker onChange={(newPalette: string[]) => setColors(newPalette)} />
                    </details>
                </div>

                <button id="submitBtn" className="btn btn--primary" type="button" disabled={isLoading} onClick={handleGenerate}>
                    {isLoading ? 'Loading...' : 'Generate Square'}
                </button>
            </div>

            <Tabs tabs={tabItems} activeId={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />
        </div>
    );
}