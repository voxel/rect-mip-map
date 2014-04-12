'use strict';

var createRects = require('atlaspack');
var ndarray = require('ndarray');
var rectMipMap = require('./mipmap-r.js');

var rects = createRects(2048, 2048);

rects._debug();
global.rects = rects;

var atlas = ndarray(new Uint8Array(2048*2048*4), [2048,2048,4]); // image
var pad = 1;
var pyramid = rectMipMap(atlas, pad, rects);
console.log(pyramid);
