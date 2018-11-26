# 15puzzle.js

This is a WebAssembly port of my [generalized 15-puzzle solver](https://github.com/LenKagamine/15puzzle). Check out the demo [here](https://puzzle.michaelkim.me).

It can optimally solve any p x q sized board, although it becomes very slow for boards larger than 4 x 4, and some 4 x 4 boards with long solutions.

To solve a puzzle, it uses the IDA\* algorithm with an [additive disjoint pattern database](https://www.sciencedirect.com/science/article/pii/S0004370201000923).

## Differences

The bulk of the solver is exactly the same as the native C++ code, except for a few changes:

- Since this port doesn't use command line arguments, `InputParser` is not added.
- Multithreading in JS / Wasm is not supported (without Web Workers), and the multithreaded solver doesn't perform that well to begin with, so it isn't added.
- Once generating the disjoint database, the database files are normally stored to disk for subsequent runs. Wasm doesn't have any direct access to a file system, so instead the database setup and the solver is split into two function calls. This allows the setup to be run once at the start, and all solves will use the database held in memory.

## WebAssembly

### Build

Install the Emscripten SDK, then run `make`.

To run the page locally, serve `web/index.html` with your tool of choice.

### API

To use the solver, there are three main function available:

- `Module.setup(patterns)`
  - Sets up the solver when the provided patterns
  - `patterns` is an array of p x q patterns that will be used by the pattern database heuristic
    - Example of a 4 x 4 pattern database:

``` js
[
  [
    [1, 2, 3, 0],
    [5, 6, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
 ],[
    [0, 0, 0, 4],
    [0, 0, 7, 8],
    [0, 0, 11, 12],
    [0, 0, 0, 0]
  ],[
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [9, 10, 0, 0],
    [13, 14, 15, 0]
  ]
]
```

- `Module.solve(startBoard)`
  - Solves a given starting board
  - Returns an array of numbers that represent the moves needed to solve the given board
    - 1: Slide down
    - 2: Slide left
    - 3: Slide up
    - 4: Slide right
  - `startBoard` is a p x q 2D array which represents the board to solve
    - Example of a 4 x 4 starting board:

``` js
[
  [1, 9, 11, 4],
  [14, 8, 2, 7],
  [10, 6, 3, 12],
  [5, 0, 13, 15]
]
```

- `Module.clean()`
  - Deletes the stored database in memory
  - `Module.setup` doesn't store the generated database to disk anywhere, and is just kept in memory. In order to setup another database with different patterns, the old database needs to be cleared from memory beforehand to avoid a memory leak.

C++ vectors and JS arrays aren't compatible with each other, so JS arrays can't be directly passed as arguments to C++ functions expecting vectors. Similarly, C++ functions that return vectors once passed to JS are not real JS arrays.

However, Emscripten can bind C++ vector types to be used in JS. `Module.solve` and `Module.setup` automatically convert between arrays and vectors, but there are helper functions and lower level versions of `solve` and `setup` exposed to the `Module` object for more control over the solver:

- `Module.VecInt`, `Module.Vec2Int`, `Module.Vec3Int`
  - These are C++ vector constructors for 1D (`vector<int>`), 2D (`vector<vector<int>>`), and 3D (`vector<vector<vector<int>>>`) vectors bound by Emscripten. They have limited API in JS, but have basic array manipulation methods:

``` js
// Create 1D int vector
const vec = new Module.VecInt();

// Resize vector to [0, 0, 0, 0, 0]
vec.resize(5, 0);

// Get size
vec.size(); // 5

// Set element
vec.set(2, 5);

// Get element
vec.get(2); // 5
```

- `Module.vec(arr)`, `Module.vec2(arr2)`, `Module.vec3(arr3)`
  - These are wrapper functions that convert JS arrays (1D, 2D, and 3D) into C++ vectors using the above vector bindings.

- `Module._setup(patterns)`, `Module._solve(startBoard)`
  - These are the same as `Module.setup` and `Module.solve`, except they don't automatically convert JS arrays into C++ vectors, so they require C++ vectors as arguments.

These wrapper functions are defined in `src/post.js`.

You can read more about C++ bindings at the [Emscripten docs](https://kripken.github.io/emscripten-site/docs/porting/connecting_cpp_and_javascript/embind.html#built-in-type-conversions).

## Results

Compared against the native C++ solver, the Wasm solver takes ~2x longer.

All 8-puzzle boards can be solve in a fraction of a second. The hardest 8-puzzle boards take 31 moves to solve, and even those are solved instantly.

11-puzzle (4x3) boards can be solved relatively quickly, but I haven't tested all of them thoroughly.

Most 15-puzzle can be solved within 5 seconds. Solutions longer than ~55 moves will take significantly longer.

Any larger boards (5x4, 5x5, etc.) with non-trivial solutions will take extremely long to solve.
