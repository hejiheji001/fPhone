var init = function(){
	var vm = new Vue({
		el: '#clock',
		data: {
			date: new Date().getTime()
		},
		methods:{
			getTime: function(){
				this.date++
			}
		}

	});
	setInterval(vm.getTime, 1000);
}

var dateToTime = function(){

}