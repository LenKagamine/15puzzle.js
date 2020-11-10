#include "../include/WalkingDistance.h"

#include <algorithm>
#include <limits>

#include "../include/Util.h"

using Board = std::vector<int>;
using Table = std::vector<std::vector<int>>;
using Hash = std::string;
using Cost = WalkingDistance::Cost;
using Index = WalkingDistance::Index;

using WalkingDistance::col;
using WalkingDistance::costs;
using WalkingDistance::edgesDown;
using WalkingDistance::edgesUp;
using WalkingDistance::height;
using WalkingDistance::row;
using WalkingDistance::width;

std::vector<Hash> tables;
std::vector<Cost> WalkingDistance::costs;
std::vector<std::vector<Index>> WalkingDistance::edgesUp;
std::vector<std::vector<Index>> WalkingDistance::edgesDown;

std::vector<int> WalkingDistance::row;  // Row #
std::vector<int> WalkingDistance::col;  // Column #

int WalkingDistance::width;
int WalkingDistance::height;

Table calculateTable(const Board& grid, bool alongRow = true) {
    Table table(height, std::vector<int>(width, 0));

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            int tile = grid[y * width + x];
            if (tile > 0) {
                if (alongRow) {
                    table[y][row[tile]]++;
                } else {
                    table[x][col[tile]]++;
                }
            }
        }
    }

    return table;
}

Hash calculateHash(const Table& table) {
    // Compress WD tables
    Hash hash = "";

    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            hash += (char)table[y][x];
        }
    }

    return hash;
}

std::pair<Table, int> hashToTable(const Hash& hash) {
    Table table(height, std::vector<int>(width, 0));
    int rowSpace = 0;

    for (int y = 0; y < height; y++) {
        int count = 0;
        for (int x = 0; x < width; x++) {
            table[y][x] = (unsigned char)hash[y * width + x];
            count += table[y][x];
        }

        if (count == width - 1) {
            rowSpace = y;
        }
    }

    return {table, rowSpace};
}

int add(const Table& table, int cost) {
    auto hash = calculateHash(table);

    auto it = std::find(tables.cbegin(), tables.cend(), hash);
    auto index = std::distance(tables.cbegin(), it);
    if (it == tables.cend()) {
        tables.push_back(hash);
        costs.push_back(cost);
        edgesUp.emplace_back(width, std::numeric_limits<Index>::max());
        edgesDown.emplace_back(width, std::numeric_limits<Index>::max());
    }

    return index;
}

void generate(const Board& goal) {
    // Start of BFS
    tables.clear();
    costs.clear();
    edgesUp.clear();
    edgesDown.clear();

    // Initial table (goal)
    tables.push_back(calculateHash(calculateTable(goal)));
    costs.push_back(0);
    edgesUp.emplace_back(width, std::numeric_limits<Index>::max());
    edgesDown.emplace_back(width, std::numeric_limits<Index>::max());

    for (std::size_t left = 0; left < tables.size(); left++) {
        auto cost = costs[left] + 1;
        auto [table, rowSpace] = hashToTable(tables[left]);

        if (int rowTile = rowSpace + 1; rowTile < height) {
            for (int x = 0; x < width; x++) {
                if (table[rowTile][x]) {
                    table[rowTile][x]--;
                    table[rowSpace][x]++;

                    auto index = add(table, cost);

                    edgesUp[left][x] = index;
                    edgesDown[index][x] = left;

                    table[rowTile][x]++;
                    table[rowSpace][x]--;
                }
            }
        }

        if (int rowTile = rowSpace - 1; rowTile >= 0) {
            for (int x = 0; x < width; x++) {
                if (table[rowTile][x]) {
                    table[rowTile][x]--;
                    table[rowSpace][x]++;

                    auto index = add(table, cost);

                    edgesDown[left][x] = index;
                    edgesUp[index][x] = left;

                    table[rowTile][x]++;
                    table[rowSpace][x]--;
                }
            }
        }
    }
}

void WalkingDistance::load(const std::vector<int>& goal, int w, int h) {
    assertm(w == h, "Walking Distance requires square boards");

    width = w;
    height = h;
    auto length = w * h;

    row.resize(length);
    col.resize(length);

    // Calculate row / column indices
    for (int i = 0; i < length; i++) {
        row[goal[i]] = i / width;
        col[goal[i]] = i % width;
    }

    // Database file missing, generate database
    DEBUG("Generating WD database");
    generate(goal);
    DEBUG("Done generating WD");
    return;
}

int WalkingDistance::getIndex(const Board& grid, bool alongRow) {
    auto hash = calculateHash(calculateTable(grid, alongRow));

    // Convert to index
    auto it = std::find(tables.cbegin(), tables.cend(), hash);
    assertm(it != tables.end(), "Missing walking distance table");
    auto index = std::distance(tables.cbegin(), it);

    return index;
}
