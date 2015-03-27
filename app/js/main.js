Vue.filter('dateToTime', function (date, isBlink) {
	var hour = date.getHours();
	var minu = date.getMinutes();

	hour = hour < 10 ? '0' + hour : hour;
	minu = minu < 10 ? '0' + minu : minu;

	var blink = date.getSeconds() % 2 + Number.parseInt(isBlink);

	return hour + (blink === 0 ? " " : ":") + minu;
});

Vue.filter('numberToBattery', function (level) {
	var percent = (level / 60).toFixed();
	return percent;
});

var doMethod = function(funcName, funcParent){
	funcParent[funcName].apply(funcParent, Array.prototype.slice.call(arguments, 2)[0]);
};

var canvasUtils = function(canvas, params){
	var context = canvas.getContext(params['type'] || "2d");

	for(var attr in params.attr){
		canvas[attr] = params.attr[attr];
	}

	for(var style in params.style){
		canvas.style[style] = params.style[style];
	}

	this.canvas = canvas;

	this.fadeIn = function(){
		$(canvas).fadeIn();
	};

	this.fadeOut = function(){
		$(canvas).fadeOut();
	};

	this.execute = function(){
		if(params.method){
			var funcName = params.method.name;
			var args = params.method.args;
			doMethod(funcName, context, args);
		}else{
			throw "No Method Defined!";
		}
	};
};

var drawScreenImg = function(){
	var image = document.getElementById('bgi');
	var draw = function(){
		var canvas = document.getElementById('canvas');
		var screenCanvas = new canvasUtils(canvas, {
			type: "2d",
			attr: {
				width: image.width,
				height: image.height
			},
			style: {
				display: "none"
			},
			method: {
				name: "drawImage",
				args: [image, 0, 0]
			}
		});
		screenCanvas.execute();
		return screenCanvas;
	};

	if(image.complete){
		return draw();
	}else{
		image.onload = function(){
			return draw();
		};
	}
};

var requestAnimationFrame = function(){
	var lastTime = 0;
	var vendors = ['webkit', 'moz'];
	for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // name has changed in Webkit
		window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}
};

var init = function(){
	var canvasUtilInstance = drawScreenImg();
	var frame = new Vue({
		el: '.frame',
		data: {
			taskbar: 'off',
			control: 'dim',
			date: new Date(),
			w: 16,
			c: 'rgb(8, 189, 8)'
		},
		methods: {
			switchScreen: function(e){
				if(this.taskbar == 'off'){
					this.taskbar = 'lock';
					this.control = 'bright';
					canvasUtilInstance.fadeIn();
				}else{
					this.taskbar = 'off';
					this.control = 'dim';
					canvasUtilInstance.fadeOut();
				}
			},
			getTime: function(){
				this.date = new Date();
			},
			setBattery: function(){
				this.w = this.w > 1 ? this.w -= 0.1 : 1;

				if(this.w <= 8){
					this.c = 'rgb(255, 255, 0)';
				}
				if(this.w <= 4){
					this.c = 'rgb(255, 0, 0)';
				}
			}
		}
	});

	var power = self.setInterval(function(){
		frame.setBattery();
		if(frame.$data.w === 1){
			window.clearInterval(power);
		}
	}, 1000);

	setInterval(function(){
		frame.getTime();
	}, 1000);

	requestAnimationFrame();
};

$(function(){
	init();
});