/* Messages:

From main thread:
- SETUP(pattern)
  - calls Module.setup
  - returns SETUP_DONE()
- SOLVE(board)
  - calls Module.solve
  - returns SOLVE_DONE(solution)
- CLEAN()
  - calls Module.clean
  - returns CLEAN_DONE()

From worker thread:
- READY()
  - when Module is loaded
*/

var Module = {};

Module.onRuntimeInitialized = () => {
  self.onmessage = ({ data }) => {
    if (data.type === 'SETUP') {
      const { pattern } = data;
      const grid = pattern.map(p => p.flat());
      const width = pattern[0][0].length;
      const height = pattern[0].length;
      Module.setup(grid, width, height);
      self.postMessage({ type: 'SETUP_DONE' });
    } else if (data.type === 'SOLVE') {
      const { board } = data;
      const solution = Module.solve(board.flat());
      self.postMessage({ type: 'SOLVE_DONE', solution });
    } else if (data.type === 'CLEAN') {
      Module.clean();
      self.postMessage({ type: 'CLEAN_DONE' });
    }
  };

  self.postMessage({ type: 'READY' });
};

self.importScripts('puzzle.js');
