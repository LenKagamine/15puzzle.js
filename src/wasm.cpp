#include <emscripten/bind.h>

#include <algorithm>
#include <vector>

#include "../include/Board.h"
#include "../include/BoardRect.h"
#include "../include/DisjointDatabase.h"
#include "../include/Idastar.h"
#include "../include/Util.h"
#include "../include/WalkingDistance.h"

typedef std::vector<std::vector<int>> Vec2Int;

int width_, height_;
std::vector<int> solution;

void setup(Vec2Int grids, int width, int height) {
    width_ = width;
    height_ = height;
    solution = combine(grids);
    DisjointDatabase::load(grids, "def", width, height);
    if (width == height) {
        WalkingDistance::load(solution, width, height);
    }
}

int getInversions(const std::vector<int>& board) {
    int inversions = 0;
    for (int i = 0; i < board.size(); i++) {
        for (int j = i + 1; j < board.size(); j++) {
            if (board[i] != 0 && board[j] != 0 && board[i] > board[j]) {
                inversions++;
            }
        }
    }
    return inversions;
}

bool solvable(const std::vector<int>& solution, int width,
              const std::vector<int>& board) {
    if (width % 2 == 1) {
        // Odd width
        return (getInversions(solution) % 2) == (getInversions(board) % 2);
    }

    // Even width
    auto solutionBlankRow = getBlank(solution) / width;
    auto boardBlankRow = getBlank(board) / width;
    return getInversions(solution) % 2 !=
           (getInversions(board) % 2 == (solutionBlankRow - boardBlankRow) % 2);
}

template <class B>
std::vector<int> search(const std::vector<int>& grid) {
    Idastar<B> search;
    B board(grid, width_, height_);

    START_TIMER(solve);
    auto path = search.solve(board);
    END_TIMER(solve);

    DEBUG("Solution:");
    std::reverse(path.begin(), path.end());
    std::vector<int> solution;
    for (auto move : path) {
        std::cout << static_cast<int>(move) << ' ';
        solution.push_back(static_cast<int>(move));
    }

    return solution;
}

std::vector<int> solve(std::vector<int> grid) {
    if (!solvable(solution, width_, grid)) {
        DEBUG("No solution possible!");
        return {};
    }

    if (width_ == height_) {
        return search<Board>(grid);
    } else {
        return search<BoardRect>(grid);
    }
}

void clean() {}

EMSCRIPTEN_BINDINGS(puzzle) {
    emscripten::function("_setup", &setup);
    emscripten::function("_solve", &solve);
    emscripten::function("clean", &clean);
    emscripten::register_vector<int>("VecInt");
    emscripten::register_vector<std::vector<int>>("Vec2Int");
}
