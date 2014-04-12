'use strict';

var ndarray = require('ndarray');
var ops = require('ndarray-ops');
var downsample = require('ndarray-downsample2x');

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
     
      // pad tiles 
      var ox = 0, oy = 0;
      for (var i = 0; i < rectsX.length; i += 1) {
        var rx = rectsX[i], ry = rectsY[i], rw = rectsW[i], rh = rectsH[i];

        for (var x = 0; x < pad; x += 1) {
          for (var y = 0; y < pad; y += 1) {
            var px = x * rw;
            var py = y * rh;
            console.log('pad',px,py);
            ops.assign(level.lo(ry+py+oy,rx+px+ox).hi(rh,rw), array.lo(ry,rx).hi(rh,rw));
          }
        }
        // accumulate offsets to fit padded tiles TODO: this is very wasteful, extra diagonal space
        /*
        ox += rw;
        oy += rh;
        */

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
        downsample(level.lo(ry,rx).hi(rh,rw), plevel.lo(ry>>1,rx>>1).hi(rh>>1,rw>>1), 0, 255)
        //downsample(level.lo(ry,rx).hi(rh,rw), plevel.lo(ry,rx).hi(rh,rw), 0, 255)
      }
      //ops.assign(level, plevel);
      downsample(level, plevel, 0, 255);
    }

    levels.push(level);

    // halve the dimensions
    tx >>>= 1;
    ty >>>= 1;
  }

  return levels;
};

module.exports = makeMipMaps;
