// mixedChart
let memChart;
let regiPeriodChart;
let regiPartnerChart;

//누적 함수
function cumulative(arr){
    let cArray = [];

    //최초 누적값 추가
    cArray.push(arr[0]);

    //누적배열 생성
    arr.reduce(function(acc, cur, i){
        cArray.push(acc + cur);
        return acc + cur;
    });

    return cArray;
}

// 그래프
function memChartFunc(id, newUser, outUser, lineData, barLabel){
	
	let ctx = document.getElementById(id).getContext('2d');
	
	// 그래프 겹침 방지
	if(memChart != undefined) {
		memChart.destroy()
	}	
	
	let chartData = {
	    datasets: [{
	        label: '신규가입',
	        data: newUser,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        label: '가입해지',
	        data: outUser,
	        yAxisID: 'y-axis-1',
	        borderColor: '#f9a268',
	        backgroundColor: '#f9a268',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        type: 'line',
	        label: '누적회원',
	        data: cumulative(lineData),
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
		

	let chartOption = {
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
	memChart = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	});
}

function regiPeriodChartFunc(id, cubiciPeriod, moneyPeriod, barLabel){
	let ctx = document.getElementById(id).getContext('2d');
	
	// 그래프 겹침 방지
	if(regiPeriodChart != undefined) {
		regiPeriodChart.destroy()
	}
	
	var chartData = {
	    datasets: [{
	        label: '큐빅아이',
	        data: cubiciPeriod,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        label: '머니뱅크',
	        data: moneyPeriod,
	        yAxisID: 'y-axis-1',
	        borderColor: '#f9a268',
	        backgroundColor: '#f9a268',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    }],
	    labels: barLabel,
	};
	let chartOption = {
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
                position: 'right',
                id: 'y-axis-1',
                ticks: {
                    beginAtZero:true,
                },
                gridLines: {
                    drawOnChartArea: true
                }
            }],
        }
	}

	regiPeriodChart = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	});
}

function regiPartnerChartFunc(id, data1, data2, data3, data4, barStckedLabel){
	let ctx_bar_stacked = document.getElementById(id).getContext('2d');

	// 그래프 겹침 방지
	if(regiPartnerChart != undefined) {
		regiPartnerChart.destroy()
	}
	
	let chartData =  {
	    datasets: [{
	        label: 'cubici',
	        data: data1,
	        backgroundColor: '#0049ad',
	    },{
	        label: '헬로핀테크',
	        data: data2,
	        backgroundColor: '#f9a268',
	    },{
	        label: '제휴2',
	        data: data3,
	        backgroundColor: '#fe7b90',
	    },{
	        label: '제휴2',
	        data: data4,
	        backgroundColor: '#26ccd2',
	    }],
	    labels: barStckedLabel
	};
	let chartOption = {
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
	            barPercentage: 0.33, 
	            ticks: {
	                minRotation: 90,
	            }
	        }],
	        yAxes: [{
	            stacked: true,
	            type: 'linear', 
	            display: true,
	            position: 'left',
	            ticks: {
	                beginAtZero: true
	            },
	        }],
	    }
	}
	regiPartnerChart = new Chart(ctx_bar_stacked, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	});
}