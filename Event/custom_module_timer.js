var EventEmitter = require('events');
//setInterval 함수가 동작하는 interval 값(1초)
var sec = 1; 

exports.timer = new EventEmitter();

setInterval(function() {
    exports.timer.emit('tick');
}, sec*1000);