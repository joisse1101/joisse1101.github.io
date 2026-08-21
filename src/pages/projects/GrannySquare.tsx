import { useEffect, useState } from 'react';
import { ColorPalettePicker } from '@components/ColourPalettePicker';
import { Tabs, type TabItem } from '@components/Tabs';
import { GrannyGrid } from '@/components/partials/grannySquare/GrannyGrid';
import { PaletteDisplay } from '@/components/partials/grannySquare/PaletteDisplay';
import { InputGrid } from '@components/InputGrid';
import { useMediaQuery } from '@hooks/display';
import { ControlPanel } from '@/components/partials/grannySquare/ControlPanel';

// Extend Window so TypeScript doesn't throw errors
declare global {
    interface Window {
        generateGrannySquare?: (gridSize: number, colors: string[], numPatterns: number, patternGrid?: (number | undefined)[][]) => Promise<{ colourGrid: string[][]; patternGrid: string[][] }>;
        addLogs?: (log: string[]) => void;
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
    const [generationLogs, setGenerationLogs] = useState<string[]>([]);


    const [activeTab, setActiveTab] = useState<string>('logs-tab');
    const [isOutputDisabled, setIsOutputDisabled] = useState<boolean>(true);
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
        // {
        //     id: 'patterns-tab',
        //     label: 'Patterns',
        //     content: (
        //         <div className="output-section">
        //             <div id="grid-container">
        //                 <InputGrid
        //                     gridInput={patternGrid}
        //                     setGridInput={setPatternGrid}
        //                     gridSize={parseInt(gridSize, 10)}
        //                     maxInput={parseInt(numPatterns, 10) - 1}
        //                 />
        //             </div>
        //         </div>
        //     ),
        // },
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
                isLoading={isLoading}
                setGenerationLogs={setGenerationLogs}
                setActiveTab={setActiveTab}
                setIsOutputDisabled={setIsOutputDisabled}
                setGrannyGridState={setGrannyGridState}
            />

            <Tabs tabs={tabItems} activeId={activeTab} onTabChange={(tabId) => setActiveTab(tabId)} />
        </div>
    );
}