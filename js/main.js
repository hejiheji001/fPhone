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

var init = function(){
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
				setTimeout(function(){
					this.taskbar = this.taskbar == 'off' ? 'lock' : 'off';
					this.control = this.control == 'dim' ? 'bright' : 'dim';
				}, 500);
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
};

$(function(){
	init();
});