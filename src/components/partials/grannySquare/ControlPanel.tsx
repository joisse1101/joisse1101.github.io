import ColorPalettePicker from "@/components/ColourPalettePicker";
import { useMediaQuery } from "@/hooks/display";
import type { GrannyGridState } from "@/pages/projects/GrannySquare";
import { downloadGridCSV, parseGridCSV } from "@/utils/csv";
import { useRef, useState, type ChangeEvent } from "react";

export interface ControlPanelProps {
    isLoading: boolean;
    setGenerationLogs: (logs: string[]) => void;
    setActiveTab: (tab: string) => void;
    setIsOutputDisabled: (disabled: boolean) => void;
    grannyGridState: GrannyGridState;
    setGrannyGridState: (state: GrannyGridState) => void;
    lockedCells: Record<string, boolean>;
    handleCellLockUpdate: (newLockedCells: [number, number][]) => void;
}

const DOWNLOAD_INPUT_TOOLTIP = 'Download the pattern of the locked cells as a CSV file.';
const UPLOAD_INPUT_TOOLTIP = 'Upload a CSV file to populate the pattern grid.\nNumbers in the grid will be clamped between 0 and the specified maximum input value.';

export const ControlPanel: React.FC<ControlPanelProps> = ({
    isLoading,
    setGenerationLogs,
    setActiveTab,
    setIsOutputDisabled,
    grannyGridState,
    setGrannyGridState,
    lockedCells,
    handleCellLockUpdate,
}) => {
    const isDesktop = useMediaQuery(600);
    const maxGridSize = isDesktop ? 24 : 18; // Limit grid size for mobile devices

    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [gridSize, setGridSize] = useState<string>('18');
    const [numPatterns, setNumPatterns] = useState<string>('6');
    const [colors, setColors] = useState<string[]>([]);
    const [patternGrid, setPatternGrid] = useState<string[][]>(Array.from({ length: parseInt(gridSize, 10) }, () => Array(parseInt(gridSize, 10)).fill(''))); // User editable pattern grid

    const [errors, setErrors] = useState<string[]>([]);

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

        if (parseInt(gridSize, 10) > 0 && parseInt(numPatterns, 10) > 0 && colors.length > 0) {
            setIsOutputDisabled(true);
            setIsGenerating(true);
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

                const lockedCells: [number, number][] = [];
                patternGrid.forEach((row, rowIndex) => {
                    row.forEach((cell, colIndex) => {
                        if (cell !== '') {
                            lockedCells.push([rowIndex, colIndex]);
                        }
                    });
                });
                handleCellLockUpdate(lockedCells);

                setIsOutputDisabled(false);
                setTimeout(() => setActiveTab('output-tab'), 500);
            } else {
                setGenerationLogs(['Something went wrong.', 'generateGrannySquare function is not available on window.']);
            }
            setTimeout(() => setIsGenerating(false), 500);
        }

    };

    return (
        <div className="card card-control-panel">
            <div id="form-grid" className="form-grid">
                <div className="form-group">
                    <label htmlFor="gridSize">Grid Size</label>
                    <input type="number" id="gridSize" value={gridSize}
                        onChange={(e) => setGridSize(e.target.value)}
                        disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="numPatterns">Number of Patterns</label>
                    <input type="number" id="numPatterns" value={numPatterns}
                        onChange={(e) => setNumPatterns(e.target.value)}
                        disabled={isLoading} />
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
            <div className="btn-container">
                {isLoading ?
                    <button id="loadingBtn" className="btn btn-primary" type="button" disabled={true} onClick={handleGenerate}>
                        Loading...
                    </button>
                    :
                    <>
                        <DownloadAndUploadButtons
                            gridSize={parseInt(gridSize)}
                            maxInput={numPatterns ? parseInt(numPatterns) : 0}
                            gridInput={patternGrid}
                            setGridInput={setPatternGrid}
                            patternGrid={grannyGridState.patternGrid}
                            lockedCells={lockedCells}
                        />
                        <button id="submitBtn" className="btn btn-primary" type="button" disabled={isGenerating} onClick={handleGenerate}>
                            {'Generate Square'}
                        </button>
                    </>
                }
            </div>
        </div>
    )
}

const DownloadAndUploadButtons: React.FC<{
    gridSize: number;
    maxInput: number;
    gridInput: string[][];
    setGridInput: (grid: string[][]) => void;
    patternGrid: string[][];
    lockedCells: Record<string, boolean>;
}> = ({ gridSize, maxInput, gridInput, setGridInput, lockedCells, patternGrid }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !gridSize) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            if (content) {
                const parsedData = parseGridCSV(content, gridSize);
                const cleanedData = parsedData.map((row) =>
                    row.map((cell) => {
                        const num = parseInt(cell);
                        return isNaN(num) ? '' : Math.min(Math.max(num - 1, 0), maxInput - 1).toString();
                    })
                );
                cleanedData.length = gridSize; // Ensure the number of rows matches gridSize
                cleanedData.forEach((row) => {
                    row.length = gridSize; // Ensure the number of columns matches gridSize
                });
                setGridInput(cleanedData);
            }
        };

        reader.readAsText(file);
        event.target.value = '';
    };

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const downloadGridAsCSV = () => {
        const filename = 'grid_data.csv';
        console.log('gridInput:', patternGrid);
        console.log('lockedCells:', lockedCells);
        const csvData = patternGrid.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
                const cellKey = `${rowIdx}-${colIdx}`;
                const isLocked = Boolean(lockedCells[cellKey]);

                // Check if cell is non-empty and a valid number
                const numericValue = Number(cell);
                const isValidNumber = cell !== '' && cell !== null && !isNaN(numericValue);

                if (isLocked && isValidNumber) {
                    return (numericValue + 1).toString();
                }

                return '';
            })
        );
        downloadGridCSV(csvData, filename);
    };

    const isGridEmpty = lockedCells && Object.keys(lockedCells).length === 0;

    return (
        <div className="btn-wrapper">
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv,text/plain,application/csv,text/comma-separated-values"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
            <button className="btn btn-secondary" type="button" onClick={handleUploadButtonClick} title={UPLOAD_INPUT_TOOLTIP}>
                {'Upload Grid'}
            </button>
            {!isGridEmpty && (
                <button className="btn btn-secondary" type="button" onClick={downloadGridAsCSV} title={DOWNLOAD_INPUT_TOOLTIP}>
                    {'Download Grid'}
                </button>
            )}
        </div>
    )

}