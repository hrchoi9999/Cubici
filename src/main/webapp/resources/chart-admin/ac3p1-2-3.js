
let mixedChart2_3;

function feeAmountGraph(dateArr, feeArr, feeRatioArr){
	
	var ctx = document.getElementById('ac3p1-2-3').getContext('2d');
	
	// 그래프 초기화
	if (mixedChart2_3 != undefined) mixedChart2_3.destroy();
	
	var chartData = {
	    datasets: [{
	        label: '단비펀드 수수료',
	        data: feeArr,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        type: 'line',
	        label: '잔액대비 %',
	        data: feeRatioArr,
	        yAxisID: 'y-axis-2',
	        borderColor: '#f9a268',
	        backgroundColor: '#f9a268',
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
	                categoryPercentage: 0.33, 
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
	                    callback: function(label, index, labels) {
	                        return  label + '%';
	                    }
	                },
	                gridLines: {
	                    drawOnChartArea: false
	                }
	            }],
	        }
	}
	
		mixedChart2_3 = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	});
}


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

function addComma(v){
    return v.toString().split(/(?=(?:...)*$)/).join(',');
}
