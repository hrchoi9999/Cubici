/**
 * combo-bar-line 샘플
*/
let mixedChart2;

function LineStyle(id, data) {
	let ctx = document.getElementById(id).getContext('2d');

	// 객체에 그래프 데이터가 쌓이는 것 방지하기 위해 객체 데이터 파괴
	if (mixedChart2 != undefined)
		mixedChart2.destroy();

	let chartData = data;
	let chartOption = {
		responsive: true,
		legend: {
			display: true,
			labels: {
				fontSize: 13,
				boxWidth: 13,
			},
		},
		tooltips: {
			mode: 'index',
			intersect: false,
			callbacks: {
				label: function(value) {
					let unit;
					// 기준에 따라 단위 변경
					if (value.datasetIndex == 0 || value.datasetIndex == 1)
						unit = "원";
					else if (value.datasetIndex == 2)
						unit = "%";

					value = chartData.datasets[value.datasetIndex].label + "\t:\t" + comma(value.yLabel) + unit;
					return value;
				}
			}
		},
		scales: {
			xAxes: [{
				barWidth: 0.1,
				categoryPercentage: 0.4,
				barPercentage: 0.6,
			}],
			yAxes: [{
				id: 'A',
				type: 'linear',
				display: true,
				position: 'left',
				ticks: {
					beginAtZero: true,
					// y축 단위 천단위로 수정 및 천단위 콤마 삽입 2021-04-08 by.신명섭
					userCallback: function(value) {
						return comma(value);
					}
				},
			}
				,
			{
				id: 'B',
				type: 'linear',
				display: true,
				position: 'right',
				ticks: {
					beginAtZero: true,
					userCallback: function(value) {
						value = value + "\t%";
						return value;
					}
				},
				gridLines: {
					display: false
				}
			}],
		},

	}


	mixedChart2 = new Chart(ctx, {
		type: 'line',
		data: chartData,
		options: chartOption
	});

}