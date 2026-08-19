import js  # type: ignore
from pyodide.ffi import create_proxy, to_js  # type: ignore
from pyodide.http import pyfetch  # type: ignore
import asyncio


# Fetch missing modules dynamically into Pyodide's filesystem
async def load_dependencies():
    files = [
        ("granny_square.py", "/assets/python/granny-square/granny_square.py"),
        ("diagonal_grid.py", "/assets/python/granny-square/diagonal_grid.py"),
    ]
    for local_name, url in files:
        response = await pyfetch(url)
        content = await response.string()
        with open(local_name, "w") as f:
            f.write(content)


asyncio.run(load_dependencies())

# Import modules after loading
from granny_square import PatternedColouredGrannySquare

async def generate_square(grid_size, palette, num_patterns, curr_pattern_grid=None):
    granny_square = await PatternedColouredGrannySquare.create(
        grid_size, list(palette), num_patterns, curr_pattern_grid
    )
    colour_grid, pattern_grid = await granny_square.get_granny_square_data()

    return to_js({"colourGrid": colour_grid, "patternGrid": pattern_grid})


js.window.generateGrannySquare = create_proxy(generate_square)

event = js.Event.new("py-app-ready")
js.document.dispatchEvent(event)
