// Conversion functions between C++ vector and JS array

Module["vec"] = function(arr) {
  var vec = new Module["VecInt"]();
  vec["resize"](arr.length, 0);
  for (var i = 0; i < arr.length; i++) {
    vec["set"](i, arr[i]);
  }
  return vec;
};

Module["vec2"] = function(arr2D) {
  var vec2D = new Module["Vec2Int"]();
  for (var i = 0; i < arr2D.length; i++) {
    vec2D["push_back"](Module["vec"](arr2D[i]));
  }
  return vec2D;
};

Module["vec3"] = function(arr3D) {
  var vec3D = new Module["Vec3Int"]();
  for (var i = 0; i < arr3D.length; i++) {
    vec3D["push_back"](Module["vec2"](arr3D[i]));
  }
  return vec3D;
};

Module["arr"] = function(vec) {
  var arr = [];
  var size = vec["size"]();
  for (var i = 0; i < size; i++) {
    arr.push(vec["get"](i));
  }
  return arr;
};

// Wrapper functions around setup and solve

Module["setup"] = function(patterns) {
  Module["_setup"](Module["vec3"](patterns));
};

Module["solve"] = function(board) {
  return Module["arr"](Module["_solve"](Module["vec2"](board)));
};
