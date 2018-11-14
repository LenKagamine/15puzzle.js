function Solver(path, onload) {
  const resolves = {
    setup: [],
    solve: [],
    clean: []
  };

  const worker = new Worker(path);
  worker.onmessage = ({ data }) => {
    if (data.type === "READY") {
      onload();
    } else if (data.type === "SETUP_DONE") {
      const resolve = resolves.setup.shift();
      resolve();
    } else if (data.type === "SOLVE_DONE") {
      const resolve = resolves.solve.shift();
      resolve(data.solution);
    } else if (data.type === "CLEAN_DONE") {
      const resolve = resolves.clean.shift();
      resolve();
    }
  };

  this.setup = pattern => {
    return new Promise(resolve => {
      resolves.setup.push(resolve);
      worker.postMessage({ type: "SETUP", pattern });
    });
  };

  this.solve = board => {
    return new Promise(resolve => {
      resolves.solve.push(resolve);
      worker.postMessage({ type: "SOLVE", board });
    });
  };

  this.clean = () => {
    return new Promise(resolve => {
      resolves.clean.push(resolve);
      worker.postMessage({ type: "CLEAN" });
    });
  };
}
