
let mixedChart2_1;

function toContractGraph(dateArr, requestArr, evalArr, approveArr, reqApproveArr){
	
	var ctx = document.getElementById('ac3p1-2-1').getContext('2d');
	
	// 그래프 초기화
	if (mixedChart2_1 != undefined) mixedChart2_1.destroy();
	
	var chartData = {
	    datasets: [{
	        label: '신규신청',
	        data: requestArr,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        label: '심사금액',
	        data: evalArr,
	        yAxisID: 'y-axis-1',
	        borderColor: '#f9a268',
	        backgroundColor: '#f9a268',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        label: '계약금액',
	        data: approveArr,
	        yAxisID: 'y-axis-1',
	        borderColor: '#f95d7e',
	        backgroundColor: '#f95d7e',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        type: 'line',
	        label: '계약/신청%',
	        data: reqApproveArr,
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
	                categoryPercentage: 0.8, 
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
	
		mixedChart2_1 = new Chart(ctx, {
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
