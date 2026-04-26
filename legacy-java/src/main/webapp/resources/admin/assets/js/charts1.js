//var echarts = require('echarts');
var memberChart = echarts.init(document.getElementById('chart_member'));
var backgroundColor = ['#41d9d9','#41bfd9', '#41a6d9', '#418dd9', '#4174d9', '#415ad9'];
var nameList = Array('옥션', '11번가', '지마켓', '인터파크', '티몬', '위메프', '쿠팡');
var dataList = Array(300,50,100,120,40,20,5);
var dataList_1 = [100,90,150,250,40,80,50,55,350,175,34,100];
var dataList_2 = [180,120,100,150,140,250,150,90,210,125,134,90];
var dataList_3 = [60,50,150,250,40,120,50,150,65,75,140,130];
var dataList_4 = [130,120,100,200,140,120,150,170,165,190,140,110];
var dataAllList1 = [9800000,9000000,8700000,7600000,6500000,6000000,5000000,5100000,4500000,3750000,3400000,3300000,2900000,2700000,1850000,1520000];
var dataAllList2 = [1520000,1850000,2700000,2900000,3300000,3400000,3750000,4500000,5000000,5100000,6000000,6500000,7600000,8700000,9000000,9800000];
var dataCategory = ['여성의류','유아동의류','화장품','향수','메이크업','스킨케어','네일케어','바디케어','패션잡화','문구','도서','유아용품','디지털','가구','침구','스포츠'];
var lineColor = '#e0e0e0';
var textColor = '#808080';
var areaColor = 'rgba(0,155,232,0.1)';
//var data = genData(7);
	/*myChart2.setOption({
		title: {
			text: 'ECharts entry example'
		},
		tooltip: {},
		xAxis: {
			data: ['shirt', 'cardign', 'chiffon shirt', 'pants', 'heels', 'socks']
		},
		yAxis: {},
		series: [{
			name: 'sales',
			type: 'bar',
			data: [5, 20, 36, 10, 10, 20]
		}]
	});*/
	function numberFormat(inputNumber) {
		return inputNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
$(function () {
	//============================== COUNTER-UP =========================


var counter = $('.counter');
	if (counter.length) {
		var a = 0;
			var oTop = counter.offset().top - window.innerHeight;
			if (a === 0 && $(window).scrollTop() > oTop) {
				$('.counter-value').each(function () {
					var $this = $(this),
						countTo = $this.attr('data-count');
					$({
						countNum: $this.text()
					}).animate({
						countNum: countTo
					},
						{
							duration: 6000,
							easing: 'swing',
							step: function () {
								$this.text(Math.floor(this.countNum));
							},
							complete: function () {
								$this.text(numberFormat(this.countNum));
								//alert('finished');
							}

						});
				});
				a = 1;
			}
	}
	memberChart.setOption({
		title:false,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
				crossStyle: {color: textColor}
			}
		},
		grid:{x:40},
		legend: {
			//type: 'scroll',
			orient: 'vertical',
			right: 0,
			top: 0,
			bottom: 0,
			//data: nameList,
			//selected: data.selected
		},
		toolbox:{
				feature:{
					dataView: {show: true, readOnly: false},
					magicType: {show: true, type: ['line', 'bar']},
					restore: {show: true},
					saveAsImage: {show: true}
				}
		},
		xAxis: [{
            type: 'category',
			boundaryGap : false,
            data: ['03/16', '03/17', '03/18', '03/19', '03/20', '03/21', '03/22', '03/23', '03/24', '03/25', '03/26', '03/27'],
			axisLabel: { formatter: '{value}',textStyle:{color:textColor} },
            axisPointer: { type: 'shadow'},
			axisLine:{ show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' }},
			axisTick: {length: 0,alignWithLabel: true},
			splitLine: {show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } }
		}],
		yAxis: [{
			type: 'value',
			name: '매출',
			min: 0,
			max: 500,
			interval: 100,
			axisLabel: { formatter: '{value}',textStyle:{color:textColor} },
			axisLine:{show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } },
			axisTick: {show:true, length: 0,alignWithLabel: true},
			splitLine: {show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } }
		}],
		labelLine: {
			lineStyle: {show: false,normal: {color: areaColor}}
		},
		series: [
			{
				name: nameList[0],
				type: 'line',
				itemStyle: { 
					normal: { color: backgroundColor[0] },
					areaStyle: { type: 'default' }
				},
				data : dataList_1,
				areaStyle: { normal: { color: backgroundColor[0], opacity:0.2 }},
				fillOpacity: 0.01,
			},
			{
				name: nameList[1],
				type: 'line',
				itemStyle: { normal: { color: backgroundColor[1] }},
				data : dataList_2,
				areaStyle: { normal: { color: backgroundColor[1], opacity:0.2 }},
			},
			{
				name: nameList[2],
				type: 'line',
				itemStyle: { normal: { color: backgroundColor[2] }},
				data : dataList_3,
				areaStyle: { normal: { color: backgroundColor[2], opacity:0.2 }},
			},
			{
				name: nameList[3],
				type: 'line',
				itemStyle: { normal: { color: backgroundColor[3] }},
				data : dataList_4,
				areaStyle: { normal: { color: backgroundColor[3], opacity:0.2 }},
			}
		],
	});
});