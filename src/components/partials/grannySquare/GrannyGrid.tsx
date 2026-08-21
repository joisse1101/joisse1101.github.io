import React, { useEffect, useState, } from 'react';

interface CustomCSSProperties extends React.CSSProperties {
    [key: `--${string}`]: string | number;
}

export type CellColour = string | [string, string];

export interface GrannyGridProps {
    gridSize: number;
    colourGrid: CellColour[][];
    patternGrid: string[][];
    highlightedColour: string | null;
}

export const GrannyGrid: React.FC<GrannyGridProps> = ({
    gridSize,
    colourGrid,
    patternGrid,
    highlightedColour,
}) => {
    const [animatedCells, setAnimatedCells] = useState<Record<string, boolean>>({});

    const handleAnimationEnd = (cellKey: string) => {
        setAnimatedCells((prev) => ({ ...prev, [cellKey]: true }));
    };

    useEffect(() => {
        setAnimatedCells({});
    }, [colourGrid, patternGrid, gridSize]);

    return (
        <>
            <div
                className={`granny-grid ${highlightedColour ? 'has-highlight' : ''}`}
                style={{ '--grid-size': gridSize } as React.CSSProperties}
            >
                {colourGrid.map((row, rowIdx) =>
                    row.map((colourList, colIdx) => {
                        const cellKey = `${rowIdx}-${colIdx}`;
                        const pattern = patternGrid[rowIdx]?.[colIdx] ?? '';
                        const isAnimationDone = animatedCells[cellKey];

                        return (
                            <GridCell
                                key={cellKey}
                                colourList={colourList}
                                pattern={pattern}
                                highlightedColour={highlightedColour}
                                handleAnimationEnd={handleAnimationEnd}
                                cellKey={cellKey}
                                delay={(rowIdx + colIdx) * 0.05}
                                isAnimationDone={isAnimationDone}
                                isLocked={true}
                            />
                        );
                    })
                )}
            </div>
            {/* <div>
                <h5>Legend:</h5>
                <ul>
                    <li><strong>Mix:</strong> Cells with a gradient of two colors.</li>
                    <li><strong>Single Color:</strong> Cells with a solid color.</li>
                    <li><strong>Highlighted:</strong> Cells that match the selected color in the palette.</li>
                </ul>
            </div> */}
        </>
    );
};

const GridCell: React.FC<{
    colourList: CellColour;
    pattern: string;
    highlightedColour: string | null;
    handleAnimationEnd: (cellKey: string) => void;
    cellKey: string;
    delay: number;
    isAnimationDone: boolean;
    isLocked: boolean;
}> = ({ colourList, pattern, highlightedColour, handleAnimationEnd, cellKey, delay, isAnimationDone, isLocked }) => {

    const isMix = Array.isArray(colourList) && colourList.length === 2;
    let cellStyle: CustomCSSProperties = {};
    let colourAttr = '';
    let colourTitle = '';

    if (isMix) {
        const [c1, c2] = colourList;
        cellStyle = {
            '--cell-bg': `linear-gradient(135deg, ${c1} 0% 50%, ${c2} 50% 100%)`,
        };
        colourTitle = `Mix: ${c1} to ${c2}`;
        colourAttr = `${c1.toLowerCase()} ${c2.toLowerCase()}`;
    } else {
        const colourVal = Array.isArray(colourList) ? colourList[0] : colourList;
        cellStyle = {
            '--cell-bg-color': colourVal,
        };
        colourTitle = colourVal;
        colourAttr = colourVal.toLowerCase();
    }

    if (!isAnimationDone) {
        cellStyle['--delay'] = `${delay.toFixed(2)}s`;
    }

    // Check if cell should be highlighted based on current active palette colour
    const isHighlighted =
        highlightedColour && colourAttr.includes(highlightedColour.toLowerCase());

    const classNames = [
        'grid-cell',
        !isAnimationDone ? 'animated-cell' : '',
        isHighlighted ? 'is-highlighted' : '',
        isLocked ? 'is-locked' : '',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            key={cellKey}
            className={classNames}
            style={cellStyle}
            data-colour={colourAttr}
            title={`${colourTitle}\nPattern: ${pattern}`}
            onAnimationEnd={() => handleAnimationEnd(cellKey)}
        >
            {pattern}
        </div>
    );
};