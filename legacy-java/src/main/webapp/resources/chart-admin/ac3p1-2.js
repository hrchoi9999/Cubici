
let mixedChart2;

//누적 함수
function cumulative(arr){
    var cArray = [];

    //최초 누적값 추가
    cArray.push(arr[0]);

    //누적배열 생성
    arr.reduce(function(acc, cur, i){
        cArray.push(acc + cur);
        return acc + cur;
    });

    return cArray;
}

function userAmountGraphDisplay(dateArr, userArr, paymentArr, avgArr){
	var ctx = document.getElementById('ac3p1-2').getContext('2d');
	
	// 그래프 초기화
	if (mixedChart2 != undefined) mixedChart2.destroy();
	
	// 그래프 그리기
	var chartData = {
	    datasets: [{
	        label: '이용회원',
	        data: userArr,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        label: '선정산 이용금액',
	        data: paymentArr,
	        yAxisID: 'y-axis-2',
	        borderColor: '#f9a268',
	        backgroundColor: '#f9a268',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        type: 'line',
	        label: '평균 선정산 금액 ',
	        data: avgArr,
	        yAxisID: 'y-axis-2',
	        borderColor: '#3de962',
	        backgroundColor: '#3de962',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    }],
	    labels: dateArr,
	};
	var chartOption = {
	        responsive: true,
	        legend : {
	            display : true,
	            labels: {
	                fontSize: 13,
	                boxWidth: 13,
	            },
	        },
	        scales: {  
	            xAxes: [{
	                categoryPercentage: 0.5, 
	                barPercentage: 1, 
	                ticks: {
	                    minRotation: 90,
	                },
	            }],
	            yAxes: [{
	                display: true,
	                position: 'left',
	                id: 'y-axis-1',
	                ticks: {
	                    beginAtZero: true,
	                },
	            },{
	                display: true,
	                position: 'right',
	                id: 'y-axis-2',
	                stacked: true,
	                type: 'linear',
	                ticks: {
	                    beginAtZero:true,
	                },
	                gridLines: {
	                    drawOnChartArea: false
	                }
	            }],
	        }
	}
	
	mixedChart2 = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	});

}