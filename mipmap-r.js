'use strict';

var makeMipMaps = function(atlas, pad, rects) {
  var levels = [];

  var mx = atlas.width, my = atlas.height;
  var uvs = rects.uv();
  for (var name in uvs) {
    var u = uvs[name][0], v = uvs[name][1];
    var rx = u * mx, ry = v * my;

    console.log(name,rx,ry);
  }

  // TODO: iterate rects, find max
};

module.exports = makeMipMaps;
