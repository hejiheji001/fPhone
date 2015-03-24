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
	var battery = new Vue({
		el: '#full',
		data: {
			w: 16,
			c: 'rgb(8, 189, 8)'
		},
		methods: {
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

	var clock = new Vue({
		el: '#clock',
		data: {
			date: new Date()
		},
		methods: {
			getTime: function(){
				this.date = new Date();
			}
		}

	});

	var power = self.setInterval(function(){
		battery.setBattery();
		if(battery.$data.w === 1){
			window.clearInterval(power);
		}
	}, 1000);

	setInterval(function(){
		clock.getTime();
	}, 1000);
};

$(function(){
	init();
});