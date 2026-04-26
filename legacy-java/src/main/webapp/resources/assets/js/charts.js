//var echarts = require('echarts');
var shareChart = echarts.init(document.getElementById('chart_share'));
var allChart = echarts.init(document.getElementById('chart_all'));
var calculateChart = echarts.init(document.getElementById('chart_calculateChart'));
var chart_top5_sell = echarts.init(document.getElementById('chart_top5_sell'));
var chart_top5_product = echarts.init(document.getElementById('chart_top5_product'));
//var data = genData(50);
var backgroundColor = ['#41d9d9','#41bfd9', '#41a6d9', '#418dd9', '#4174d9', '#415ad9'];
var nameList = Array('옥션', '11번가', '지마켓', '인터파크', '티몬', '위메프', '쿠팡');
var dataList = Array(300,50,100,120,40,20,5);
var dataAllList = [600,500,150,250,400,200,50,510,350,175,340,130];
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
$(function () {
	shareChart.setOption({
		title:false,
		tooltip: {
			trigger: 'item',
			//formatter: '{a} <br/>{b} : {c} ({d}%)'
			formatter: '{b} : {c} ({d}%)'
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
				show:true,
				feature:{
					magicType:{
						show:true,
						type:["pie","funnel"],
						option:{
							funnel:{x:"25%",width:"50%",funnelAlign:"left",max:1548}
						}
					},
					restore:{show:!0,title:"Restore"},
					saveAsImage:{show:!0,title:"Save Image"}
				}
			},
		calculable:!0,
		series: [{
			name: '쇼핑몰 매출 비중',
			type: 'pie',
			color: ['#37A2DA', '#32C5E9', '#67E0E3', '#9FE6B8', '#FFDB5C','#ff9f7f', '#fb7293', '#E062AE', '#E690D1', '#e7bcf3', '#9d96f5', '#8378EA', '#96BFFF'],
			itemStyle: {color: '#c23531'},
			data: [
                { value: dataList[0], name: nameList[0], itemStyle: { normal: { color: backgroundColor[0] }} },
                { value: dataList[1], name: nameList[1], itemStyle: { normal: { color: backgroundColor[1] }} },
                { value: dataList[2], name: nameList[2], itemStyle: { normal: { color: backgroundColor[2] }} },
                { value: dataList[3], name: nameList[3], itemStyle: { normal: { color: backgroundColor[3] }} },
                { value: dataList[4], name: nameList[4], itemStyle: { normal: { color: backgroundColor[4] }} },
                //{ value: dataList[5], name: nameList[5], itemStyle: { normal: { color: backgroundColor[5] }} },
                //{ value: dataList[6], name: nameList[6], itemStyle: { normal: { color: backgroundColor[6] }} },
                //{ value: dataList[7], name: nameList[7], itemStyle: { normal: { color: backgroundColor[7] }} }
            ],
			radius: '50%',
			center: ['50%', '50%'],
		}]
	});
	allChart.setOption({
		title:false,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
				crossStyle: {color: textColor}
			}
		},
		grid:{x:40},
		legend: {orient: 'horizontal'},
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
            data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
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
			max: 1000,
			interval: 100,
			axisLabel: { formatter: '{value}',textStyle:{color:textColor} },
			axisLine:{show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } },
			axisTick: {show:true, length: 0,alignWithLabel: true},
			splitLine: {show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } }
		}],
		labelLine: {
			lineStyle: {show: false,normal: {color: areaColor}}
		},
		series: [{
				name: '쇼핑몰 전체매출',
				type: 'line',
				itemStyle: { normal: { color: 'rgba(0,155,232,1)' }},
				data : dataAllList,
				areaStyle: { normal: { color: areaColor }},
		}],
	});
	calculateChart.setOption({
		title:false,
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
				crossStyle: {color: textColor}
			}
		},
		legend: {orient: 'horizontal'},
		grid:{x:40},
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
            data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
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
			max: 1000,
			interval: 100,
			axisLabel: { formatter: '{value}',textStyle:{color:textColor} },
			axisLine:{show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } },
			axisTick: {show:true, length: 0,alignWithLabel: true},
			splitLine: {show: false, lineStyle: { color: lineColor, width: 1, type: 'solid' } }
		}],
		labelLine: {
			lineStyle: {show: false,normal: {color: areaColor}}
		},
		series: [{
				name: '예상정산금액',
				type: 'line',
				itemStyle: { normal: { color: 'rgba(0,155,232,1)' }},
				data : dataAllList,
				areaStyle: { normal: { color: areaColor }},
		}],
	});
	chart_top5_sell.setOption({
		title:false,
		tooltip: { trigger: "axis"	},
		legend: {x: 100, data : ['화장품','향수','메이크업','스킨케어','네일케어'],},
		toolbox: {
			show: !0,
			feature: {
				saveAsImage: {
					show: !0,
					title: "Save Image"
				}
			}
		},
		nameGap: 35,
		responsive: true,
		calculable: !0,
		grid:{x:60},
		xAxis: [{
            type: 'value',
			boundaryGap: [0, .01],
			reversed:true,
            //data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			min: 0,
			max: 5000,
			interval: 500,
			axisLabel: { formatter: '{value}',textStyle:{color:textColor} },
			axisLine:{ show: false},
			axisTick: {show:false },
			splitLine: { show: false },
		}],
		yAxis: [{
			type: 'category',
			reversed:true,
			data : ['화장품','향수','메이크업','스킨케어','네일케어'],
			axisLabel: { 
				formatter: '{value}',
				textStyle:{color:textColor} 
			},
			axisLine:{show: false },
			axisTick: {show:false },
			splitLine: { show: false },
		}],
		labelLine: {
			lineStyle: {show: false,normal: {color: areaColor}}
		},
		series: [
			{
				markLine: {label: {normal: {show: false}}},
				type: 'bar',
				itemStyle: { normal: { color: 'rgba(0,155,232,1)' }},
				data: [1070, 1344, 1820, 3034, 4052]
			}
		],
	});
	chart_top5_product.setOption({
		title:false,
		tooltip: { trigger: "axis"	},
		legend: {x: 100, data : ['화장품','향수','메이크업','스킨케어','네일케어'],},
		toolbox: {
			show: !0,
			feature: {
				saveAsImage: {
					show: !0,
					title: "Save Image"
				}
			}
		},
		nameGap: 35,
		responsive: true,
		calculable: !0,
		grid:{x:60},
		xAxis: [{
            type: 'value',
			boundaryGap: [0, .01],
			reversed:true,
            //data: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			min: 0,
			max: 5000,
			interval: 500,
			axisLabel: { formatter: '{value}',textStyle:{color:textColor} },
			axisLine:{ show: false},
			axisTick: {show:false },
			splitLine: { show: false },
		}],
		yAxis: [{
			type: 'category',
			reversed:true,
			data : ['화장품','향수','메이크업','스킨케어','네일케어'],
			axisLabel: { 
				formatter: '{value}',
				textStyle:{color:textColor} 
			},
			axisLine:{show: false },
			axisTick: {show:false },
			splitLine: { show: false },
		}],
		labelLine: {
			lineStyle: {show: false,normal: {color: areaColor}}
		},
		visualMap: {
			orient: 'horizontal',
			left: 'center',
			min: 10,
			max: 100,
			text: ['High Score', 'Low Score'],
			// Map the score column to color
			dimension: 0,
			inRange: {
				color: ['#D7DA8B', '#E15457']
			}
		},
		series: [
			{
				markLine: {label: {normal: {show: false}}},
				type: 'bar',
				encode: {x: 'amount',y: 'product'},
				itemStyle: { normal: { color: backgroundColor[1] }},
				data: [1070, 1344, 1820, 3034, 4052]
			}
		],
	});
});