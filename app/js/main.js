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
	this.canvas = canvas;
	this.context = context;
	this.params = params;

	this.init = function(initParams){
		if(!initParams){
			initParams = params;
		}
		for(var cvsAttr in initParams.cvsAttr){
			canvas[cvsAttr] = initParams.cvsAttr[cvsAttr];
		}

		for(var cvsStyle in initParams.cvsStyle){
			canvas.style[cvsStyle] = initParams.cvsStyle[cvsStyle];
		}

		for(var ctxAttr in initParams.ctxAttr){
			context[ctxAttr] = initParams.ctxAttr[ctxAttr];
		}
	};

	// TODO: If something else can do here
	this.update = function(newParams){
		context.save();
		this.init(newParams);
	};

	// TODO: Use globalAlpha instead of Jquery
	this.fadeIn = function(){
		$(canvas).fadeIn();
	};

	// TODO: Use globalAlpha instead of Jquery
	this.fadeOut = function(){
		$(canvas).fadeOut();
	};


	// x为椭圆中心横坐标，
	// y为椭圆中心纵坐标，
	// a为椭圆横半轴长，
	// b为椭圆纵半轴长。
	// p为角度参数及方向
	this.evenCompEllipse = function(x, y, a, b, p){
		var r = (a > b) ? a : b; //选择a、b中的较大者作为arc方法的半径参数
		var ratioX = a / r; //横轴缩放比率
		var ratioY = b / r; //纵轴缩放比率
		context.scale(ratioX, ratioY); //进行缩放（均匀压缩）
		context.beginPath();

		// context.moveTo((x - a) / ratioX, y / ratioY); //从椭圆的左端点开始绘制
		// context.moveTo(x / ratioX, (y - b) / ratioY); //从椭圆的上端点开始绘制
		// context.moveTo((x + a) / ratioX, y / ratioY); //从椭圆的右端点开始绘制
		// context.moveTo(x / ratioX, (y + b) / ratioY); //从椭圆的下端点开始绘制

		// context.arc(x, y, radius, starAngle,endAngle, anticlockwise)
		// x:圆心的x坐标
		// y:圆心的y坐标
		// straAngle:开始角度
		// endAngle:结束角度
		// anticlockwise:是否逆时针
		context.arc(x / ratioX, y / ratioY, r, 0, Math.PI * p.rate, p.anticlock);

		// context.closePath();
		// context.fillStyle = 'rgba(0,255,0,0.25)';
		context.fill();
		context.stroke();
		context.restore();
	};

	this.pointA2B = function(points, type, args){
		switch(type){
			case "line":
				context.beginPath();
				context.moveTo(20, 20);
				context.lineTo(20, 20);
				this.update(args);
				context.closePath();
				this.execute();
				break;
			case "curve":
				var A = points.A;
				var B = points.B;
				var C = points.throughPoint;
				var x = C.x;
				var y = A.y;
				var a = x - A.x;
				var b = y - C.y;
				var p = {
					rate: 1,
					anticlock: true
				};

				this.update(args);
				this.evenCompEllipse(x, y, a, b, p);
				break;
		}
	};

	this.execute = function(){
		if(params.method){
			var funcName = params.method.name;
			var args = params.method.args;
			doMethod(funcName, context, args);
			context.restore();
		}else{
			throw "No Method Defined!";
		}
	};
};

var drawScreenImg = function(){
	var image = document.getElementById('bgi');
	var draw = function(){
		var canvas = document.getElementById('canvas');
		var cvsW = image.width;
		var cvsH = image.height;

		// Put image into canvas
		// var screenCanvas = new canvasUtils(canvas, {
		// 	type: "2d",
		// 	cvsAttr: {
		// 		width: cvsW,
		// 		height: cvsH
		// 	},
		// 	cvsStyle: {
		// 		display: "none"
		// 	},
		// 	method: {
		// 		name: "drawImage",
		// 		args: [image, 0, 0]
		// 	}
		// });

		// Create LinearGradient on canvas
		var linerBGI = canvas.getContext('2d').createLinearGradient(0, 0, cvsW, cvsH);
		linerBGI.addColorStop(0, "#A6C0AF");
		linerBGI.addColorStop(1, "#A3B8A8");

		var screenCanvas = new canvasUtils(canvas, {
			type: "2d",
			cvsAttr: {
				width: cvsW,
				height: cvsH
			},
			cvsStyle: {
				display: "block"
			},
			ctxAttr: {
				fillStyle: linerBGI
			},
			method: {
				name: "fillRect",
				args: [0, 0, cvsW, cvsH]
			}
		});

		screenCanvas.init();
		screenCanvas.execute();

		// Add some half ellipse
		var separation = cvsW * 0.5;
		var points = {
			A: {
				x: separation * 0,
				y: cvsH
			},
			B: {
				x: separation * 2,
				y: cvsH
			},
			throughPoint: {
				x: separation * 1,
				y: -50
			}
		};

		var ellipseStyle = canvas.getContext('2d').createLinearGradient(cvsW / 2, 0, cvsW / 2, cvsH);
		ellipseStyle.addColorStop(0, "rgba(41, 255, 0, 0.29)");
		ellipseStyle.addColorStop(0.5, "rgba(0, 139, 255, 0.29)");
		ellipseStyle.addColorStop(1, "rgba(161, 0, 255, 0.29)");

		var args = {
			ctxAttr: {
				fillStyle: ellipseStyle,
				strokeStyle: "rgba(41, 255, 0, 0.25)"
			}
		};
		screenCanvas.pointA2B(points, "curve", args);

		var ctx = screenCanvas.context;

		// ctx.translate(100,0);
		// context.transform(a,b,c,d,e,f);
		// 参数	描述
		// a	水平缩放绘图
		// b	水平倾斜绘图
		// c	垂直倾斜绘图
		// d	垂直缩放绘图
		// e	水平移动绘图
		// f	垂直移动绘图
		ctx.setTransform(1,0,0,1,200,0);
		screenCanvas.pointA2B(points, "curve", args);

		ctx.setTransform(1,0,0,1,-200,0);
		screenCanvas.pointA2B(points, "curve", args);

		ctx.setTransform(1,0,0,1,100,0);
		screenCanvas.pointA2B(points, "curve", args);

		ctx.setTransform(1,0,0,1,-100,0);
		screenCanvas.pointA2B(points, "curve", args);

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