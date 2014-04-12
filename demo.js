'use strict';

var createRects = require('atlaspack');
var ndarray = require('ndarray');
var getPixels = require('get-pixels');
var savePixels = require('save-pixels');
var rectMipMap = require('./mipmap-r.js');

var canvas = document.createElement('canvas');

var SIZE = 512;

canvas.width = canvas.height = SIZE;
canvas.style.border = '1px solid black';
//canvas.style.width = canvas.style.height = (SIZE * 4) + 'px'; // scale up for easy viewing TODO: disable fuzziness
document.body.appendChild(canvas); // TODO: remove dependence on canvas

var rects = createRects(canvas);

var imageURLs = {
  // test 16x16 images
  dirt: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAb0lEQVQ4y2OYmWb8/84U7/8gGhfGJg8TY8AlQchQGGYgRhGyYegGM5BiK7o8iM9Air+xegGbqcQahuICYm1EV8tArI24LGAgN/5R0gEl4cBAbujDA5EYDQQTErGKceYFcqMQwwXEBCZRYUDIIGQ+AHmcSKuZbPIVAAAAAElFTkSuQmCC',
  stone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAASklEQVQ4y+1SsQ0AMAjidz/gYTu1MU2QprODE6CggmSqiohTCkMldAKF49fBxlGJt1A1kw66aXIHjuCi4DWvigN3JucC8wfzB2QuoGWkP++xVxEAAAAASUVORK5CYII=',
  stick: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAI0lEQVQ4y2NgGFlgb73j/0Jv9f8UaQbRo5pHNeMEFGkeUAAAmkJGZ284PasAAAAASUVORK5CYII=',


  // a larger 128x128
  logo: 'data:image/png;base64,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',
};

var getImg = function(name) {
  var img = new Image();
  img.src = imageURLs[name];
  img.name = name;
  return img;
};

['dirt', 'stone', 'logo', 'stick'].forEach(function(name) {
  rects.pack(getImg(name));
});
//rects.pack(getImg(images.logo));

//rects._debug(); // shows red borders around each rect
global.rects = rects;

var pad = 1;
getPixels(canvas.toDataURL(), function(err, array) {
  if (err) throw new Error('get-pixels failed: '+err);

  var pyramid = rectMipMap(array, pad, rects);
  console.log(pyramid);

  pyramid.forEach(function(level) {
    var img = new Image();
    img.src = savePixels(level, 'canvas').toDataURL();
    img.style.border = '1px dotted black';
    document.body.appendChild(document.createElement('br'));
    document.body.appendChild(img);
  });
});


