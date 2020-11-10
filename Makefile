CXX = em++
CXXFLAGS = -std=c++17 -Wall -Werror \
	-O3 --closure 1 -s FILESYSTEM=0 -s ENVIRONMENT=worker \
	-flto
export EMCC_DEBUG=1

web: obj/wasm.o obj/Board.o obj/BoardRect.o obj/Direction.o obj/DisjointDatabase.o obj/Idastar.o obj/Pattern.o obj/WalkingDistance.o obj/Util.o
	$(CXX) $(CXXFLAGS) --bind -o web/js/puzzle.js $^ \
		--post-js src/post.js \
		-s WASM=1 -s ALLOW_MEMORY_GROWTH=1

obj/wasm.o: src/wasm.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Board.o: src/Board.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/BoardRect.o: src/BoardRect.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Direction.o: src/Direction.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/DisjointDatabase.o: src/DisjointDatabase.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Idastar.o: src/Idastar.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Pattern.o: src/Pattern.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/WalkingDistance.o: src/WalkingDistance.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<
obj/Util.o: src/Util.cpp | obj
	$(CXX) $(CXXFLAGS) -c -o $@ $<

obj:
	mkdir -p $@

.PHONY: clean
clean:
	rm -r web/js/puzzle.js web/js/puzzle.wasm obj/
