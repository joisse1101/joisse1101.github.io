import ColorPalettePicker from "@/components/ColourPalettePicker";
import { useMediaQuery } from "@/hooks/display";
import { downloadGridCSV, parseGridCSV } from "@/utils/csv";
import { useRef, useState, type ChangeEvent } from "react";

export interface ControlPanelProps {
    isLoading: boolean;
    setGenerationLogs: (logs: string[]) => void;
    setActiveTab: (tab: string) => void;
    setIsOutputDisabled: (disabled: boolean) => void;
    setGrannyGridState: (state: any) => void;
}

const DOWNLOAD_INPUT_TOOLTIP = 'Download the currently displayed grid as a CSV file.';
const UPLOAD_INPUT_TOOLTIP = 'Upload a CSV file to populate the grid.\nNumbers in the grid will be clamped between 0 and the specified maximum input value.';

export const ControlPanel: React.FC<ControlPanelProps> = ({
    isLoading,
    setGenerationLogs,
    setActiveTab,
    setIsOutputDisabled,
    setGrannyGridState
}) => {
    const isDesktop = useMediaQuery(600);
    const maxGridSize = isDesktop ? 24 : 18; // Limit grid size for mobile devices

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
                setIsOutputDisabled(false);
                setTimeout(() => setActiveTab('output-tab'), 500);
            } else {
                setGenerationLogs(['Something went wrong.', 'generateGrannySquare function is not available on window.']);
            }
        }

    };

    return (
        <div className="card card-control-panel">
            <div id="form-grid" className="form-grid">
                <div className="form-group">
                    <label htmlFor="gridSize">Grid Size</label>
                    <input type="number" id="gridSize" value={gridSize}
                        onBlur={(e) => {
                            if (e.target.value != gridSize) {
                                setGridSize(e.target.value)
                            }
                        }}
                        disabled={isLoading} />
                </div>
                <div className="form-group">
                    <label htmlFor="numPatterns">Number of Patterns</label>
                    <input type="number" id="numPatterns" value={numPatterns} onBlur={(e) => {
                        if (e.target.value != numPatterns) {
                            setNumPatterns(e.target.value)
                        }
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
            <div className="btn-container">
                {isLoading ?
                    <button id="loadingBtn" className="btn btn-primary" type="button" disabled={true} onClick={handleGenerate}>
                        {isLoading ? 'Loading...' : 'Upload Grid'}
                    </button>
                    :
                    <>
                        <DownloadAndUploadButtons
                            gridSize={parseInt(gridSize)}
                            maxInput={maxGridSize}
                            gridInput={patternGrid}
                            setGridInput={setPatternGrid}
                        />
                        <button id="submitBtn" className="btn btn-primary" type="button" onClick={handleGenerate}>
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
}> = ({ gridSize, maxInput, gridInput, setGridInput }) => {
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
                        return isNaN(num) ? '' : Math.min(Math.max(num, 0), maxInput).toString();
                    })
                );
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
        const csvData = gridInput.map((row) => row.map((cell) => cell.toString()));
        downloadGridCSV(csvData, filename);
    };

    const isGridEmpty = gridInput.every((row) => row.every((cell) => cell === ''));

    return (
        <div className="btn-wrapper">
            <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv,text/plain,application/csv,text/comma-separated-values"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />
            <button className="btn btn-secondary" type="button" onClick={handleUploadButtonClick}>
                {'Upload Grid'}
            </button>
            {!isGridEmpty && (
                <button className="btn btn-secondary" type="button" onClick={downloadGridAsCSV}>
                    {'Download Grid'}
                </button>
            )}
        </div>
    )

}