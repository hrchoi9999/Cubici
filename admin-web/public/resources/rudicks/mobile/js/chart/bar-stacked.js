/*
* 2021-04-12 
* 통합정보_매출분석 그래프 그리기
* by.신명섭
*/

// barChart 선언 (전역변수로 사용)
let barChart;
let barChart2;

// 쇼핑몰 판매 금액 그래프
function ComboBarLineChart(id, data) {

	let ctx_bar_stacked = document.getElementById(id).getContext('2d');

	// 객체에 그래프 데이터가 쌓이는 것 방지하기 위해 객체 데이터 파괴
	if (barChart != undefined)
		barChart.destroy();

	let chartData = data;

	let chartOption = {
		responsive: true,
		// 툴팁 천단위로 수정
		tooltips: {
			callbacks: {
				label: function(value) {
					let shop_nm = data.datasets[value.datasetIndex].label;
					value = shop_nm + " : " + comma(value.value);
					return value;
				}
			}
		},
		legend: {
			display: true,
			position:'bottom',
			labels: {
				fontSize: 8,
				boxWidth: 8,
			},
		},
		scales: {
			xAxes: [{
				stacked: true,
				display: false,
				barPercentage: 0.33,
				ticks: {
					display: false,
					minRotation: 90,
				}
			}],
			yAxes: [{
				stacked: true,
				type: 'linear',
				display: true,
				position: 'left',
				ticks: {
					display: false,
					beginAtZero: true,
					// y축 단위 천단위로 수정 및 천단위 콤마 삽입 2021-04-08 by.신명섭
					userCallback: function(value) {
						if (chartData.FLAG == "PRICE")
							value = value / 1000;
						return comma(value);
					}
				},
			}],
		}
	}

	let plugins = {
		afterDraw: function(chart) {
			let ctx = chart.chart.ctx;
			let y = 9;
			ctx.save();
			ctx.textAlign = 'right';

			ctx.font = "400 9px sans-serif";
			ctx.fillStyle = "#333";
			ctx.fillText('단위 |', chart.chart.width - 30, y);

			ctx.font = "400 9px sans-serif";
			ctx.fillStyle = "#999";

			if (chartData.FLAG == "PRICE")
				ctx.fillText('천원', chart.chart.width-10, y);
			else if (chartData.FLAG == "QUANTITY")
				ctx.fillText('개', chart.chart.width-10, y);

			ctx.restore();

		}
	};

	barChart = new Chart(ctx_bar_stacked, {
		type: 'bar',
		plugins: plugins,
		data: chartData,
		options: chartOption
	});
}

// 반품 및 교환 그래프
function ComboBarLineChart2(id, data) {

	let ctx_bar_stacked = document.getElementById(id).getContext('2d');

	// 그래프 데이터가 객체에 쌓이는 것을 방지하기 위해 객체 데이터 파괴
	if (barChart2 != undefined)
		barChart2.destroy();

	let chartData = data;
	let chartOption = {
		responsive: true,
		// 툴팁 천단위로 수정
		tooltips: {
			callbacks: {
				label: function(value) {
					let shop_nm = data.datasets[value.datasetIndex].label;
					value = shop_nm + " : " + comma(value.value);
					return value;
				}
			}
		},
		legend: {
			display: true,
			labels: {
				fontSize: 10,
				boxWidth: 10,
			},
		},
		scales: {
			xAxes: [{
				stacked: true,
				barPercentage: 0.33,
				ticks: {
					display:false,
					minRotation: 90,
				}
			}],
			yAxes: [{
				stacked: true,
				type: 'linear',
				position: 'left',
				ticks: {
					display: false,
					beginAtZero: true,
					// y축 단위 천단위로 수정 및 천단위 콤마 삽입 2021-04-08 by.신명섭
					userCallback: function(value) {
						if (chartData.FLAG == "PRICE")
							value = value / 1000;
						return comma(value);
					}
				},
			}],
		}
	}

	let plugins = {
		afterDraw: function(chart) {
			let ctx = chart.chart.ctx;
			let y = 20;
			ctx.save();
			ctx.textAlign = 'right';

			ctx.font = "400 9px sans-serif";
			ctx.fillStyle = "#333";
			ctx.fillText('단위 |', chart.chart.width - 25, y);

			ctx.font = "400 9px sans-serif";
			ctx.fillStyle = "#999";

			// FLAG에 따라 단위 표시 바뀜			
			if (chartData.FLAG == "PRICE")
				ctx.fillText('천원', chart.chart.width, y);
			else if (chartData.FLAG == "QUANTITY")
				ctx.fillText('개', chart.chart.width, y);

			ctx.restore();

		}
	};

	barChart2 = new Chart(ctx_bar_stacked, {
		type: 'bar',
		plugins: plugins,
		data: chartData,
		options: chartOption
	});
}