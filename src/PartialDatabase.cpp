#include "../include/PartialDatabase.h"

#include "../include/Pattern.h"

#include <queue>

PartialDatabase::PartialDatabase(std::vector<std::vector<int>> grid,
                                 std::string dbName, int index)
    : filename("databases/" + dbName + "-" + std::to_string(index) + ".dat"),
      pattern(Pattern(grid)) {
    int count = 0;
    for (int y = 0; y < pattern.HEIGHT; y++) {
        for (int x = 0; x < pattern.WIDTH; x++) {
            if (grid[y][x] > 0) {
                cells[grid[y][x]] = count++;
            }
        }
    }

    // Generate database (don't save to disk in Wasm)
    generateDists();
}

void PartialDatabase::generateDists() {
    struct State {
        Pattern board;
        int dist;
    };

    // board has 0 for irrelevant cells, non-0 for those part of the database
    int count = 0;
    int dist = 0;

    // Start of algorithm
    distMap.clear();
    std::queue<State> bfs;

    bfs.push({pattern, 0});
    distMap[pattern.getId()] = 0;

    while (!bfs.empty()) {
        State curr = bfs.front();
        bfs.pop();

        // Logging
        if (curr.dist > dist) {
            dist = curr.dist;
            count = 1;
        }
        else
            count++;

        for (int i = 0; i < curr.board.cells.size(); i++) {
            for (int j = 0; j < 4; j++) {
                Direction dir = static_cast<Direction>(j);
                uint64_t shiftId = curr.board.getShiftId(i, dir);
                if (shiftId > 0 && distMap.find(shiftId) == distMap.end()) {
                    State next = {curr.board, curr.dist + 1};
                    next.board.shiftCell(i, dir);

                    distMap[shiftId] = next.dist;

                    bfs.push(next);
                }
            }
        }
    }
}

PartialDatabase::~PartialDatabase() {}
