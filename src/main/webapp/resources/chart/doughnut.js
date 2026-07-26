/*
* 2021-04-13 
* 통합정보_상품분석 도넛 그래프 그리기
* by.신명섭
*/

let mixedChart;


function doughnutChart(id, datasets) {
	let ctx = document.getElementById(id).getContext('2d');

	// 객체에 그래프 데이터가 쌓이는 것 방지하기 위해 객체 데이터 파괴
	if (mixedChart != undefined)
		mixedChart.destroy();

	let chartData = datasets;

	let chartOption = {
		// 툴팁 수정
		tooltips: {
			callbacks: {
				label: function(value) {
					let unit;
					// 기준에 따라 단위 변경
					if (FLAG === "PRICE")
						unit = "원";
					else if(FLAG === "QUANTITY")
						unit = "개";
					value = chartData.labels[value.index] + "\t:\t" + comma(chartData.datasets[0].data[value.index] + unit);
					return value;
				}
			}
		},
		title: {
			display: false,
			text: '쇼핑몰 판매 비중',
			fontSize: 20
		},
		responsive: true,
		legend: {
			display: true,
			labels: {
				fontSize: 13,
				boxWidth: 13,
			},
			generateLabels: {
			}
		},
		pieceLabel: {
			render: function(d) {
				let labels = d.label
				return d.percentage + "%";;
			},
			fontColor: '#333',
			position: 'outside',
			segment: true,
			segmentColor: '#ccc',
			fontSize: 15,
		}
	}

	mixedChart = new Chart(ctx, {
		type: 'doughnut',
		data: chartData,
		options: chartOption,
	});
}