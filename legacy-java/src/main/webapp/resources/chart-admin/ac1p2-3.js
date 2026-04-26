// mixedChart3 선언 (전역변수로 사용)
let mixedChart3;
function serviceChartView(mbUser ,serviceUser ,serviceReUser, servicePercent ,barLabel){
	var ctx = document.getElementById('ac1p2-3').getContext('2d');
	// 객체에 그래프 데이터가 쌓이는 것 방지하기 위해 객체 데이터 파괴
	if (mixedChart3 != undefined){
		mixedChart3.destroy();
		}
	var chartData = {
	    datasets: [{
	        label: '머니뱅크 회원',
	        data:cumulative(mbUser),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        label: '서비스 이용자 ',
	        data: serviceUser,
	        yAxisID: 'y-axis-1',
	        borderColor: '#f9a268',
	        backgroundColor: '#f9a268',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        label: '서비스 재이용자',
	        data: serviceReUser,
	        yAxisID: 'y-axis-1',
	        borderColor: '#f95d7e',
	        backgroundColor: '#f95d7e',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        type: 'line',
	        label: '서비스 이용율',
	        data: servicePercent,
	        yAxisID: 'y-axis-2',
	        borderColor: '#3de962',
	        backgroundColor: '#3de962',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    }],
	    labels: barLabel,
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
	 mixedChart3 = new Chart(ctx, {
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




