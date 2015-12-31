'use strict';

var ndarray = require('ndarray');
var ops = require('ndarray-ops');
var downsample = require('ndarray-resample');

var makeMipMaps = function(array, rects, maxLevels) {
  var levels = [];

  var rectsX = [], rectsY = [], rectsW = [], rectsH = [];

  var s = array.shape;
  var mx = s[0], my = s[1], channels = s[2];
  var ctor = array.data.constructor;
  var uvs = rects.uv();
  var biggestRectIndex = undefined;
  var biggestRectDim = 0;
  for (var name in uvs) {
    // UV coordinates 0.0 - 1.0
    var uvTopLeft = uvs[name][0];      // *\  01
    var uvBottomRight = uvs[name][2];  // \*  23

    // scale UVs by image size to get pixel coordinates
    var sx = uvTopLeft[0] * mx, sy = uvTopLeft[1] * my;
    var ex = uvBottomRight[0] * mx, ey = uvBottomRight[1] * my;
    var w = ex - sx;
    var h = ey - sy;

    if (w > biggestRectDim) {
      biggestRectDim = w;
      biggestRectIndex = rectsX.length;
    } else if (h > biggestRectDim) {
      biggestRectDim = h;
      biggestRectIndex = rectsX.length;
    }

    rectsX.push(sx);
    rectsY.push(sy);
    rectsW.push(w);
    rectsH.push(h);
  }

  maxLevels = maxLevels || Infinity;
  var tx = mx, ty = my;
  do {
    var sz = tx * ty * channels;
    var level = ndarray(new ctor(sz), [tx,ty,channels]);

    if (levels.length === 0) {
      // first level, same size
     
      // copy rects (note: could just copy entire array all at once; but also have to downsize dimensions regardless)
      for (var i = 0; i < rectsX.length; i += 1) {
        var rx = rectsX[i], ry = rectsY[i], rw = rectsW[i], rh = rectsH[i];

        ops.assign(level.lo(ry,rx).hi(rh,rw), array.lo(ry,rx).hi(rh,rw));

        // shrink for next level
        rectsX[i] >>>= 1;
        rectsY[i] >>>= 1;
        rectsW[i] >>>= 1;
        rectsH[i] >>>= 1;
      }
    } else {
      // downsample previous level
      var plevel = levels[levels.length - 1];

      for (var i = 0; i < rectsX.length; i += 1) {
        var rx = rectsX[i], ry = rectsY[i], rw = rectsW[i], rh = rectsH[i];

        for (var k = 0; k < channels; k += 1) {
          var levelChannel = level.pick(undefined, undefined, k);
          var plevelChannel = plevel.pick(undefined, undefined, k);

          downsample(levelChannel.lo(ry,rx).hi(rh,rw), plevelChannel.lo(ry<<1,rx<<1).hi(rh<<1,rw<<1), 0, 255)
        }

        // shrink for next level
        rectsX[i] >>>= 1;
        rectsY[i] >>>= 1;
        rectsW[i] >>>= 1;
        rectsH[i] >>>= 1;
      }
      //ops.assign(level, plevel);
      /* the all-together native downsampling that causes blending artifacts
      for (var k = 0; k < channels; k += 1) {
        var levelChannel = level.pick(undefined, undefined, k);
        var plevelChannel = plevel.pick(undefined, undefined, k);
        downsample(levelChannel, plevelChannel, 0, 255);
      }
      */
    }

    levels.push(level);

    // halve the total dimensions for the next level
    tx >>>= 1;
    ty >>>= 1;

    if (tx === 0 || ty === 0) {
      // atlas itself got too small before any rects, shouldn't really happen..
      break;
    }
    if (rectsW[biggestRectIndex] === 0 || rectsH[biggestRectIndex] === 0) {
      // the biggest rect shrank down to nothing, no point in scaling down further
      // (parity with tile-mip-map)
      break;
    }
  } while(levels.length < maxLevels);

  return levels;
};

module.exports = makeMipMaps;
