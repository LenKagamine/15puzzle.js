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

const Module = {};

Module.onRuntimeInitialized = () => {
  self.onmessage = ({ data }) => {
    if (data.type === "SETUP") {
      const { pattern } = data;
      Module.setup(pattern);
      self.postMessage({ type: "SETUP_DONE" });
    } else if (data.type === "SOLVE") {
      const { board } = data;
      const solution = Module.solve(board);
      self.postMessage({ type: "SOLVE_DONE", solution });
    } else if (data.type === "CLEAN") {
      Module.clean();
      self.postMessage({ type: "CLEAN_DONE" });
    }
  };

  self.postMessage({ type: "READY" });
};

self.importScripts("puzzle.js");
