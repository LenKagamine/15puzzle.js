#include <emscripten/bind.h>
#include <vector>

#include "../include/Board.h"
#include "../include/DisjointDatabase.h"
#include "../include/Idastar.h"

typedef std::vector<std::vector<int>> Vec2Int;
typedef std::vector<Vec2Int> Vec3Int;

Idastar<DisjointDatabase, Board>* search = nullptr;

void setup(Vec3Int grids) {
    const int WIDTH = grids[0][0].size(), HEIGHT = grids[0].size();

    DisjointDatabase* db = new DisjointDatabase(WIDTH * HEIGHT, "def", grids);
    search = new Idastar<DisjointDatabase, Board>(db);
}

std::vector<int> solve(Vec2Int board) {
    Board startBoard(board);

    std::vector<Board::Move> moves = search->solve(startBoard);

    std::vector<int> solution;
    for (auto it = moves.rbegin(); it != moves.rend(); ++it) {
        solution.push_back(static_cast<int>(*it));
    }

    return solution;
}

void clean() {
  delete search;
}

EMSCRIPTEN_BINDINGS(puzzle) {
    emscripten::function("_setup", &setup);
    emscripten::function("_solve", &solve);
    emscripten::function("clean", &clean);
    emscripten::register_vector<int>("VecInt");
    emscripten::register_vector<std::vector<int>>("Vec2Int");
    emscripten::register_vector<std::vector<std::vector<int>>>("Vec3Int");
}
