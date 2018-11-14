CXX = em++
CXXFLAGS = -std=c++14 -Wall -Werror
export EMCC_DEBUG=1

web: obj/wasm.o obj/Board.o obj/DisjointDatabase.o obj/PartialDatabase.o obj/Pattern.o
	$(CXX) --bind --std=c++14 -o web/js/puzzle.js $^ \
		--post-js src/post.js \
		-s WASM=1 -s ALLOW_MEMORY_GROWTH=1

obj/wasm.o: src/wasm.cpp include/Board.h include/DisjointDatabase.h include/Idastar.h include/Idastar-inl.h | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Board.o: src/Board.cpp include/Board.h include/Point.h | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/DisjointDatabase.o: src/DisjointDatabase.cpp include/DisjointDatabase.h include/Board.h | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/PartialDatabase.o: src/PartialDatabase.cpp include/PartialDatabase.h include/Board.h include/Pattern.h include/flat_hash_map.h | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Pattern.o: src/Pattern.cpp include/Pattern.h include/Direction.h | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<

obj:
	mkdir -p $@

.PHONY: clean
clean:
	rm -r web/js/puzzle.js web/js/puzzle.wasm obj/
