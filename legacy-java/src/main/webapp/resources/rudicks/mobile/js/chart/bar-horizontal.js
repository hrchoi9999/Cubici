/*
* 2021-04-14
* 통합정보_상품분석_TOP10 그래프 그리기
* by.신명섭
*/

let horizontalBarChart;
let horizontalBarChart2;

// TOP 10 매출상품
function HorizontalBarChart(id, data) {

	var ctx = document.getElementById(id).getContext('2d');

	// 그래프 겹침 방지
	if(horizontalBarChart != undefined)
		horizontalBarChart.destroy()
		
	var chartData = data;

	var chartOption = {
		responsive: true,
		title: {
			display: false,
			text: 'TOP 10 매출상품'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
			callbacks: {
				label: function(value) {
					let unit;
					// 기준에 따른 단위
					if (FLAG === "PRICE")
						unit = "원";
					else if (FLAG === "QUANTITY")
						unit = "개";
					return addComma(value.xLabel) + unit;
				}
			}
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		legend: {
			display: false,
			labels: {
				fontSize: 13,
				boxWidth: 13,
			},
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					display: false,
					userCallback: function(value) {
						return addComma(value);
					}
				}
			}],
			yAxes: [{
				display: false,
				gridLines: {
					display: false
				},
				barWidth: 0.1,
				barPercentage: 0.33,
				ticks: {
					display: false,
					beginAtZero: true,
					autoSkip: false,
					}
				}]
		}
	}

	var plugins = {
		afterDatasetsDraw: function(chart) {
			var ctx = chart.ctx;
	
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				if (!meta.hidden) {
					meta.data.forEach(function(element, index) {
						ctx.fillStyle = '#555';
						var fontSize = 12;
						var fontStyle = '300';
						var fontFamily = 'Helvetica Neue';
						ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
	
						var dataString = dataset.data[index].toString();
	
						ctx.textBaseline = 'middle';
	
						var padding = ctx.measureText(dataString).width / 2;
						var position = element.tooltipPosition();
						// ctx.fillText(addComma(dataString), position.x + padding, position.y);
					});
				}
			});
		}
	};

	function addComma(v) {
		return v.toString().split(/(?=(?:...)*$)/).join(',');
	};

	horizontalBarChart = new Chart(ctx, {
		type: 'horizontalBar',
		plugins: plugins,
		data: chartData,
		options: chartOption
	});
};

// TOP 10 재고상품
function HorizontalBarChart2(id, data) {

	var ctx = document.getElementById(id).getContext('2d');

	if(horizontalBarChart2 != undefined)
		horizontalBarChart2.destroy()
		
	var chartData = data;

	var chartOption = {
		responsive: true,
		title: {
			display: false,
			text: 'TOP 10 매출상품'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
			// 툴팁 단위 및 천단위 콤마
			callbacks: {
				label: function(value) {
					return addComma(value.xLabel) + "개";
				}
			}
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		legend: {
			display: false,
			labels: {
				fontSize: 13,
				boxWidth: 13,
			},
		},
		scales: {
			xAxes: [{
				display: true,
				ticks: {
					display: false,
					userCallback: function(value) {
						return addComma(value);
					}
				}
			}],
			yAxes: [{
				display: true,
				gridLines: {
					display: false
				},
				barWidth: 0.1,
				barPercentage: 0.33,
				ticks: {
					display: false,
					beginAtZero: true,
					autoSkip: false,
					}
				}]
		}
	}

	var plugins = {
		afterDatasetsDraw: function(chart) {
			var ctx = chart.ctx;
	
			chart.data.datasets.forEach(function(dataset, i) {
				var meta = chart.getDatasetMeta(i);
				if (!meta.hidden) {
					meta.data.forEach(function(element, index) {
						ctx.fillStyle = '#555';
						var fontSize = 12;
						var fontStyle = '300';
						var fontFamily = 'Helvetica Neue';
						ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
	
						var dataString = dataset.data[index].toString();
	
						ctx.textBaseline = 'middle';
	
						var padding = ctx.measureText(dataString).width / 2;
						var position = element.tooltipPosition();
						// ctx.fillText(addComma(dataString), position.x + padding, position.y);
					});
				}
			});
		}
	};

	function addComma(v) {
		return v.toString().split(/(?=(?:...)*$)/).join(',');
	};

	horizontalBarChart2 = new Chart(ctx, {
		type: 'horizontalBar',
		plugins: plugins,
		data: chartData,
		options: chartOption
	});
};