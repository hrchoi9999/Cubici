
let salesChart;
let avgSalesChart;
let skuChart;
let regiShopChart;
let shopSalesChart;

function salesChartFunc(id, data1, data2, percentage, barLabel){
	let ctx = document.getElementById(id).getContext('2d');
	
	// 그래프 겹침 방지
	if(salesChart != undefined) {
		salesChart.destroy()
	}	
	let chartData = {
		datasets: [{
	        label: '판매',
	        data: data1,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        label: '반품/교환',
	        data: data2,
	        yAxisID: 'y-axis-1',
	        borderColor: '#F85D7D',
	        backgroundColor: '#F85D7D',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    },{
	        type: 'line',
	        label: '반품/교환율',
	        data: percentage,
	        yAxisID: 'y-axis-2',
	        borderColor: '#F8A267',
	        backgroundColor: '#F8A267',
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
                    callback: function(label, index, labels) {
                        var num = label.toString().length;
                        var txt = num >= 8 ?  setWon(label) : addComma(label);
                        return  txt;
                    }
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
        },
        tooltips: {
	    	callbacks: {
	    		label: function(tooltipItem, data) {
	    			 return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    		}
	    	}
	    }
	}

	salesChart = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	});
}

function avgSalesChartFunc(id, data1, data2, barLabel){
	let ctx = document.getElementById(id).getContext('2d');
	// 그래프 겹침 방지
	if(avgSalesChart != undefined) {
		avgSalesChart.destroy()
	}	
	let chartData = {
	    datasets: [{
	        label: '회원 평균 매출금액',
	        data: data1,
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#0049ad',
	        barThickness: 10, 
	        z: 1
	    },{
	        type: 'line',
	        label: '회원 평균 판매단가',
	        data: data2,
	        yAxisID: 'y-axis-2',
	        borderColor: '#F8A267',
	        backgroundColor: '#F8A267',
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
                barPercentage: 0.33, 
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
                    callback: function(label, index, labels) {
                        var num = label.toString().length;
                        var txt = num >= 8 ?  setWon(label) : addComma(label);
                        return  txt;
                    }
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
                        return  addComma(label);
                    }
                },
                gridLines: {
                    drawOnChartArea: false
                }
            }],
        },
        tooltips: {
	    	callbacks: {
	    		label: function(tooltipItem, data) {
	    			 return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    		}
	    	}
	    }
	}
	avgSalesChart = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	}); 
}

function regiShopFunnc(id, interpark, gmarket, auction, shop11st, coupang, naver, avg, barLabel){
	// 그래프 겹침 방지
	if(regiShopChart != undefined) {
		regiShopChart.destroy()
	}	
	 let ctx_bar_stacked = document.getElementById(id).getContext('2d');

	 let chartData = {
	    datasets: [{
	        label: '인터파크',
	        data: cumulative(interpark),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#8d1f26',
	    },{
	        label: '지마켓',
	        data: cumulative(gmarket),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#3ba331',
	    },{
	        label: '옥션',
	        data: cumulative(auction),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#da2530',
	    },{
	        label: '11번가',
	        data: cumulative(shop11st),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#ff5261',
	    },{
	        label: '쿠팡',
	        data: cumulative(coupang),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#26ccd2',
	    },{
	        label: '네이버',
	        data: cumulative(naver),
	        yAxisID: 'y-axis-1',
	        backgroundColor: '#3de962',
	    },{
	        type: 'line',
	        label: '평균등록 쇼핑몰',
	        data: avg,
	        yAxisID: 'y-axis-2',
	        borderColor: '#F8A267',
	        backgroundColor: '#F8A267',
	        fill: false,
	        borderWidth: 1,
	        lineTension: 0,
	        z: 2
	    }],
	    labels: barLabel
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
	            id: 'y-axis-1',
	            display: true,
	            position: 'left',
	            ticks: {
	                beginAtZero: true,
	                callback: function(label, index, labels) {
	                    var num = label.toString().length;
	                    var txt = num >= 8 ?  setWon(label) : addComma(label);
	                    return  txt;
	                }
	            },
	        },{
	            stacked: true,
	            type: 'linear', 
	            id: 'y-axis-2',
	            display: true,
	            position: 'right',
	            ticks: {
	                beginAtZero: true
	            },
	        }],
	    },
        tooltips: {
	    	callbacks: {
	    		label: function(tooltipItem, data) {
	    			 return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    		}
	    	}
	    }
	}
	 regiShopChart = new Chart(ctx_bar_stacked, {
		 type: 'bar',
		 data: chartData,
		 options: chartOption
	 });

}

function skuChartFunc(id, data1, data2, data3, barLabel){
	let ctx = document.getElementById(id).getContext('2d');
	// 그래프 겹침 방지
	if(skuChart != undefined) {
		skuChart.destroy()
	}	
	let chartData = {
		datasets: [{
		        type: 'line',
		        label: '큐빅아이 평균',
		        data: cumulative(data1),
		        yAxisID: 'y-axis-2',
		        borderColor: '#FF7B90',
		        backgroundColor: '#F8A267',
		        fill: false,
		        borderWidth: 1,
		        lineTension: 0,
		        z: 2
		    },{
		        type: 'line',
		        label: '머니뱅크 평균',
		        data: cumulative(data2),
		        yAxisID: 'y-axis-2',
		        borderColor: '#00FF00',
		        backgroundColor: '#00FF00',
		        fill: false,
		        borderWidth: 1,
		        lineTension: 0,
 				pointStyle: 'rectRot',
		        z: 2
		    },{
		        label: '전체 등록상품 수',
		        data: cumulative(data3),
		        yAxisID: 'y-axis-1',
		        backgroundColor: '#0049ad',
		        barThickness: 10, 
		        z: 1
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
		            barPercentage: 0.33, 
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
		            callback: function(label, index, labels) {
		                return  addComma(label);
		            }
		        },
		    },{
		        display: true,
		        position: 'right',
		        id: 'y-axis-2',
		       // stacked: true,
		        type: 'linear',
		        ticks: {
		            beginAtZero:true,
		            stepSize: 1000,
		            callback: function(label, index, labels) {
		                return  addComma(label);
		            }
		        },
		        gridLines: {
		            drawOnChartArea: false
		        }
		    }],
		},
	    tooltips: {
	    	callbacks: {
	    		label: function(tooltipItem, data) {
	    			 return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    		}
	    	}
	    }
	}
	skuChart = new Chart(ctx, {
	    type: 'bar',
	    data: chartData,
	    options: chartOption
	}); 
}

function shopSalesChartFunc(id, total, barLabel){
	// 그래프 겹침 방지
	if(shopSalesChart != undefined) {
		shopSalesChart.destroy()
	}	
	
	let ctx_bar_stacked = document.getElementById(id).getContext('2d');
	
	let chartData = {
	    datasets: [{
	        label: '인터파크',
	        data: total[0],
	        backgroundColor: '#8d1f26',
	    },{
	        label: '지마켓',
	        data: total[1],
	        backgroundColor: '#3ba331',
	    },{
	        label: '옥션',
	        data: total[2],
	        backgroundColor: '#da2530',
	    },{
	        label: '11번가',
	        data: total[3],
	        backgroundColor: '#ff5261',
	    },{
	        label: '쿠팡',
	        data: total[4],
	        backgroundColor: '#26ccd2',
	    },{
	        label: '네이버',
	        data: total[5],
	        backgroundColor: '#3de962',
	    }],
	    labels: barLabel
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
	            barPercentage: 0.9, 
	        }],
	        yAxes: [{
	            stacked: true,
	            display: false,
	        }],
	    },
	    tooltips: {
	    	callbacks: {
	    		label: function(tooltipItem, data) {
	    			 return tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    		}
	    	}
	    }
	}

	let plugins = {
	    afterDatasetsDraw: function(chart) {
	    let ctx = chart.ctx;

	    chart.data.datasets.forEach(function(dataset, i) {
	    	let meta = chart.getDatasetMeta(i);
	        if (!meta.hidden) {
	        meta.data.forEach(function(element, index) {
	            ctx.fillStyle = '#fff';
	            let fontSize = 12;
	            let fontStyle = '300';
	            let fontFamily = 'Helvetica Neue';
	            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

	            let dataString = dataset.data[index].toString();

	            ctx.textBaseline = 'top';

	            let position = element.tooltipPosition();
	            ctx.fillText(dataString + '%', position.x, position.y + 5);
	        });
	        }
	    });
	    }
	};

	shopSalesChart = new Chart(ctx_bar_stacked, {
	    type: 'bar',
	    plugins: plugins,
	    data: chartData,
	    options: chartOption
	});
	
}

function addComma(v){
    return v.toString().split(/(?=(?:...)*$)/).join(',');
}

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

function setWon(pWon) {
	let won  = (pWon+"").replace(/,/g, "");
	let arrWon  = ["원", "만", "억", "조", "경", "해", "자", "양", "구", "간", "정"];
	let changeWon = "";
	let pattern = /(-?[0-9]+)([0-9]{4})/;
    while(pattern.test(won)) {                  
        won = won.replace(pattern,"$1,$2");
    }

    let arrCnt = won.split(",").length-1;
    for(let ii=0; ii<won.split(",").length; ii++) {
        if(arrWon[arrCnt] == undefined) {
            alert("값의 수가 너무 큽니다.");
            break;
    }
    let tmpwon=0;
    for(i=0;i<won.split(",")[ii].length;i++){
    	let num1 = won.split(",")[ii].substring(i,i+1);
        tmpwon = tmpwon+Number(num1);
    }
    if(tmpwon > 0){
        changeWon += won.split(",")[ii]+arrWon[arrCnt];
    }
            arrCnt--;
        }
    return changeWon;
}
