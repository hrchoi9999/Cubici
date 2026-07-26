// mixedChart 선언 (전역변수로 사용)
let mixedChart3;


function payChartView(barLabel, togetherPay, togetherPayPercent){
	var ctx = document.getElementById('ac1p2-2-3').getContext('2d');
	
	// 객체에 그래프 데이터가 쌓이는 것 방지하기 위해 객체 데이터 파괴
	if (mixedChart3 != undefined)
		mixedChart3.destroy();
	
	var chartData = {
	    datasets: [{
	        label: '단비펀드',
	        data: togetherPay,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        type: 'line',
	        label: '잔액대비%',
	        data: togetherPayPercent,
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
	                stacked: true,
	                categoryPercentage: 0.33, 
	                barPercentage: 1, 
	                ticks: {
	                    minRotation: 90,
	                },
	            }],
	            yAxes: [{
	                display: true,
	                stacked: true,
	                position: 'left',
	                id: 'y-axis-1',
	                ticks: {
	                    beginAtZero: true,
	                },
	            },{
	                display: true,
	                position: 'right',
	                id: 'y-axis-2',
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

function setWon(pWon) {
    var won  = (pWon+"").replace(/,/g, "");
    var arrWon  = ["원", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정"];
    var changeWon = "";
    var pattern = /(-?[0-9]+)([0-9]{4})/;
    while(pattern.test(won)) {                  
        won = won.replace(pattern,"$1,$2");
    }

    var arrCnt = won.split(",").length-1;
    for(var ii=0; ii<won.split(",").length; ii++) {
        if(arrWon[arrCnt] == undefined) {
            alert("값의 수가 너무 큽니다.");
            break;
    }
    var tmpwon=0;
    for(i=0;i<won.split(",")[ii].length;i++){
        var num1 = won.split(",")[ii].substring(i,i+1);
        tmpwon = tmpwon+Number(num1);
    }
    if(tmpwon > 0){
        changeWon += won.split(",")[ii]+arrWon[arrCnt];
    }
            arrCnt--;
        }
    return changeWon;
}





