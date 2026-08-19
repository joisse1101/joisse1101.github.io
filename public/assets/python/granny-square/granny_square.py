import sys
from typing import List
import asyncio
import string

from diagonal_grid import DiagonalGrid


class PatternedColouredGrannySquare:
    grid_size: int = 0
    palette: List[str] = []
    colours: int = len(palette)
    patterns: List[str] = []
    diagonal_grid: DiagonalGrid

    def __init__(
        self,
        grid_size: int,
        palette: List[str],
        numPatterns: int,
        diagonal_grid: DiagonalGrid,
    ):
        self.grid_size = grid_size
        self.colours = len(palette)
        self.palette = palette
        self.patterns = string.ascii_lowercase[:numPatterns]
        self.diagonal_grid = diagonal_grid

    @classmethod
    async def create(cls, grid_size: int, palette: List[str], numPatterns: int):
        diagonal_grid = await DiagonalGrid.create(
            grid_size, palette, string.ascii_lowercase[:numPatterns]
        )
        return cls(grid_size, palette, numPatterns, diagonal_grid)

    async def display_granny_square_grid(self, document, grid_container_id, anim_proxy):
        colour_grid = self.diagonal_grid.get_primary_elements_on_grid(
            resolve_elements=True
        )
        await asyncio.sleep(0)  # Allow the DOM to update before proceeding
        pattern_grid = await self.diagonal_grid.get_secondary_elements_on_grid()

        container = document.getElementById(grid_container_id)
        container.classList.add("display-block")
        container.innerHTML = ""

        grid = document.createElement("div")
        grid.className = "granny-grid"
        grid.style.setProperty("--grid-size", str(self.grid_size))

        for row_idx, row in enumerate(colour_grid):
            for col_idx, colour_list in enumerate(row):
                cell = document.createElement("div")
                cell.className = "grid-cell animated-cell"

                is_mix = isinstance(colour_list, list) and len(colour_list) == 2
                if is_mix:
                    c1, c2 = colour_list[0], colour_list[1]
                    cell.style.setProperty(
                        "--cell-bg",
                        f"linear-gradient(135deg, {c1} 0% 50%, {c2} 50% 100%)",
                    )
                    colour_title = f"Mix: {c1} to {c2}"
                    cell.setAttribute("data-colour", f"{c1.lower()} {c2.lower()}")
                else:
                    colour_val = (
                        colour_list[0] if isinstance(colour_list, list) else colour_list
                    )
                    cell.style.setProperty("--cell-bg-color", colour_val)
                    colour_title = colour_val
                    cell.setAttribute("data-colour", colour_val.lower())

                cell.title = (
                    f"{colour_title}\nPattern: {pattern_grid[row_idx][col_idx]}"
                )
                cell.innerText = pattern_grid[row_idx][col_idx]

                delay = (row_idx + col_idx) * 0.05
                cell.style.setProperty("--delay", f"{delay:.2f}s")
                # Remove animated-cell class when animation completes
                cell.addEventListener("animationend", anim_proxy)

                grid.appendChild(cell)

        container.appendChild(grid)

    async def get_granny_square_data(self):
        colour_grid = self.diagonal_grid.get_primary_elements_on_grid(
            resolve_elements=True
        )
        pattern_grid = await self.diagonal_grid.get_secondary_elements_on_grid()
        return colour_grid, pattern_grid
