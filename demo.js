'use strict';

var createAtlas = require('atlaspack');
var ndarray = require('ndarray');
var getPixels = require('get-pixels');
var savePixels = require('save-pixels');
var rectMipMap = require('./mipmap-r.js');
var touchup = require('touchup');

var canvas = document.createElement('canvas');

var SIZE = 512;
var TILEPAD = 2;

// TODO: remove dependence on canvas
canvas.width = canvas.height = SIZE;
canvas.style.border = '1px solid black';
//canvas.style.width = canvas.style.height = (SIZE * 4) + 'px'; // scale up for easy viewing TODO: disable fuzziness
//document.body.appendChild(canvas); // redundant since we also show mip level #0

var atlas = createAtlas(canvas);
global.atlas = atlas; // debug

var imageURLs = {
  // test 16x16 images
  grass: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYElEQVQ4y61TwREAIAiy/cdyGqao3qWIXQ8flgGimfmYhh1OAuQsvahAPQOoFCACUFkR5K2+wxbQMMyZApXxrJUZ8TIFBoRoCl8UdL2QHpSLpBanf+F1hJcCNP2AugckXwA2yZhbyqZNAAAAAElFTkSuQmCC',
  stone: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAASklEQVQ4y+1SsQ0AMAjidz/gYTu1MU2QprODE6CggmSqiohTCkMldAKF49fBxlGJt1A1kw66aXIHjuCi4DWvigN3JucC8wfzB2QuoGWkP++xVxEAAAAASUVORK5CYII=',
  stick: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAI0lEQVQ4y2NgGFlgb73j/0Jv9f8UaQbRo5pHNeMEFGkeUAAAmkJGZ284PasAAAAASUVORK5CYII=',

  // a larger 128x128
  crate: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAABvUlEQVR42u3YsQ2DUBAFwX/I3dCEm6BfmqAe0wG52XkpGTs6CeZY81uW3eYVAGAAGAAGgAFgsX2eHu5fX4j/suscF0B8AMQHQHwAxAdAfADEB0B8AMQHQHwA0vGf/ugCEI4PQDw+APH4AMTjAxCPD0A8PgDx+ADE4wMQjw9APD4A8fgAxOMDEI8PQDw+APH4AMTjAxCPD0A8PgDx+ADE4wMQjw9APD4A8fgAxOMDEI8PQDw+APH4AMTjAxCPD0A8PgDx+ADE4wMQjw9APD4A8fgAxOMDEI8PQDw+APH4AMTj5wHU46cBiB8GIH4YgPhhAOKHAYgfBiB+GID4YQDihwGIHwYgfhiA+GEA4ocBiB8GIH4YgPhhAOKHAYgfBiB+GID4YQDihwGIHwYgfhiA+GEA4ocBiB8GIH4YgPhhAOKHAYgfBiB+GID4YQDihwGIHwYgfhiA+GEA4ocBiB8GIH4YgPhhAOKHAYgfBiB+GID4YQDihwGIHwYgfhiA+GEA4ocBiB8GIH4YgPhhAOKHAYgfBiB+GID4YQDiuwDiAyA+AOIDID4A4gMgPgDiv2pzrFHPBTAADAADwACw0m7+YETmqldkNQAAAABJRU5ErkJggg=='
};

var getImg = function(name, cb) {
  var img = new Image();
  img.onload = function() {
    var img2 = new Image();
    img2.src = touchup.repeat(img, TILEPAD, TILEPAD);
    img2.name = name;
    cb(null, img2);
  };
  img.onerror = function(err) {
    cb(err);
  };
  img.src = imageURLs[name];
  img.name = name;
};

var generate = function() {
  //atlas._debug(); // shows red borders around each rect
  getPixels(canvas.toDataURL(), function(err, array) {
    if (err) throw new Error('get-pixels failed: '+err);

    var pyramid = rectMipMap(array, atlas);
    console.log(pyramid);

    pyramid.forEach(function(level, i) {
      var img = new Image();
      img.src = savePixels(level, 'canvas').toDataURL();
      img.style.border = '1px dotted black';
      document.body.appendChild(document.createElement('br'));
      document.body.appendChild(img);
      document.body.appendChild(document.createTextNode(' level #'+i+' ('+img.width+'x'+img.height+')'));
    });
  });
};

var names = ['grass', 'stone', 'crate', 'stick'];
var i = 0;
names.forEach(function(name) {
  getImg(name, function(err, img) {
    if (img) atlas.pack(img);
    if (err) throw new Error(err);

    i += 1;
    if (i === names.length) {
      // images finished loading, so generate mipmaps
      generate();
    }
  });
});


