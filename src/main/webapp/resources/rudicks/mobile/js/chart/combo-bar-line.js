/*
* 2021-04-09 
* 통합정보_당월현황
* by.신명섭
*/

function ComboBarLineChart(id, data) {

	let ctx = document.getElementById(id).getContext('2d');

	let chartData = data;
	let chartOption = {
		responsive: true,
		// 툴팁 천단위로 수정
		tooltips: {
			callbacks: {
				label: function(value) {
					if (value.datasetIndex == 0) {
						value = "최근 : " + comma(value.value);
					} else if (value.datasetIndex == 1) {
						value = "전기 : " + comma(value.value);
					}
					return value;
				}
			}
		},
		legend: {
			display: true,
			labels: {
				fontSize: 13,
				boxWidth: 13,
			},
		},
		scales: {
			xAxes: [{
				display: true,
				barWidth: 0.1,
				barPercentage: 0.33,
				ticks: {
					display: false,
					minRotation: 90,
				},
			}],
			yAxes: [{
				type: 'linear',
				display: true,
				position: 'left',
				ticks: {
					display: false,
					beginAtZero: true,
					// y축 단위 천단위로 수정 및 천단위 콤마 삽입 2021-04-08 by.신명섭
					userCallback: function(value) {
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

			ctx.font = "400 12px sans-serif";
			ctx.fillStyle = "#333";
			ctx.fillText('단위 |', chart.chart.width - 30, y);

			ctx.font = "400 12px sans-serif";
			ctx.fillStyle = "#999";
			ctx.fillText('천원', chart.chart.width-5, y);

			ctx.restore();

		}
	};

	let mixedChart = new Chart(ctx, {
		type: 'bar',
		plugins: plugins,
		data: chartData,
		options: chartOption,
	});
}