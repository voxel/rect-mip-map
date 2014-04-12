'use strict';

var makeMipMaps = function(array, pad, rects) {
  var levels = [];

  var s = array.shape;
  var mx = s[0], my = s[1];
  var uvs = rects.uv();
  for (var name in uvs) {
    var u = uvs[name][0], v = uvs[name][1];
    var rx = u * mx, ry = v * my;

    console.log(name,rx,ry);
  }

  // TODO: iterate rects, find max
};

module.exports = makeMipMaps;
