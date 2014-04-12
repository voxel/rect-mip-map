'use strict';

var ndarray = require('ndarray');
var ops = require('ndarray-ops');

var makeMipMaps = function(array, pad, rects) {
  var levels = [];

  var rectsX = [], rectsY = [], rectsW = [], rectsH = [];

  var s = array.shape;
  var mx = s[0], my = s[1], channels = s[2];
  var ctor = array.data.constructor;
  var uvs = rects.uv();
  for (var name in uvs) {
    // UV coordinates 0.0 - 1.0
    var uvTopLeft = uvs[name][0];      // *\  01
    var uvBottomRight = uvs[name][2];  // \*  23

    // scale UVs by image size to get pixel coordinates
    var sx = uvTopLeft[0] * mx, sy = uvTopLeft[1] * my;
    var ex = uvBottomRight[0] * mx, ey = uvBottomRight[1] * my;

    console.log(name,sx,sy,ex,ey);

    rectsX.push(sx);
    rectsY.push(sy);
    rectsW.push(ex - sx);
    rectsH.push(ey - sy);
  }

  var maxLevels = 5; // TODO: iterate rects, find max
  var tx = mx, ty = my;
  while(maxLevels--) {
    var sz = tx * ty * channels;
    var level = ndarray(new ctor(sz), [tx,ty,channels]);

    if (levels.length === 0) {
      // first level, same size
      //ops.assign(level, array);
      //for (var i = 0; i < rectsX.length; i += 1) {
      for (var i = 1; i < 2; i += 1) {
        var rx = rectsX[i], ry = rectsY[i], rw = rectsW[i], rh = rectsH[i];

        for (var x = 0; x < pad; x += 1) {
          for (var y = 0; y < pad; y += 1) {
            ops.assign(level.lo(rx,ry).hi(rw,rh), array.lo(rx,ry).hi(rw,rh));
          }
        }
      }
    } else {
      // TODO: downsample previous
      var plevel = levels[level.length - 1];
    }

    levels.push(level);
    break; // TODO

    // halve the dimensions
    tx >>>= 1;
    ty >>>= 1;
  }

  return levels;
};

module.exports = makeMipMaps;
