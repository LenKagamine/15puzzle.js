// Conversion functions between C++ vector and JS array

Module['vec'] = function (arr) {
  var vec = new Module['VecInt']();
  vec['resize'](arr.length, 0);
  for (var i = 0; i < arr.length; i++) {
    vec['set'](i, arr[i]);
  }
  return vec;
};

Module['vec2'] = function (arr2D) {
  var vec2D = new Module['Vec2Int']();
  for (var i = 0; i < arr2D.length; i++) {
    vec2D['push_back'](Module['vec'](arr2D[i]));
  }
  return vec2D;
};

Module['arr'] = function (vec) {
  var arr = [];
  var size = vec['size']();
  for (var i = 0; i < size; i++) {
    arr.push(vec['get'](i));
  }
  return arr;
};

// Wrapper functions around setup and solve

Module['setup'] = function (patterns, width, height) {
  Module['_setup'](Module['vec2'](patterns), width, height);
};

Module['solve'] = function (board) {
  return Module['arr'](Module['_solve'](Module['vec'](board)));
};
