// mixedChart 선언 (전역변수로 사용)
let mixedChart;

function visitantChartView(visitant, barLabel){
	var ctx = document.getElementById('ac1p1-3-1').getContext('2d');
	
	// 객체에 그래프 데이터가 쌓이는 것 방지하기 위해 객체 데이터 파괴
	if (mixedChart != undefined)
		mixedChart.destroy();
	
	var colorArray = [];
	for(var i = 0; i < barLabel.length; i++){
	    var color = i == barLabel.length - 1 ?  '#F8A268' : '#0049ad';
	    colorArray.push(color);
	}
	var chartData = {
	    datasets: [{
	        data: visitant,
	        backgroundColor: colorArray,
	        barThickness: 10, 
	    }],
	    labels: barLabel,
	};
	var chartOption = {
	        responsive: true,
	        legend : {
	            display : false,
	        },
	        scales: {  
	            xAxes: [{
	                barPercentage: 0.33, 
	                ticks: {
	                    //minRotation: 90,
	                },
	            }],
	            yAxes: [{
	                display: false,
	                position: 'left',
	                ticks: {
	                    beginAtZero: true,
	                },
	            }],
	        }
	}
	
	var plugins = {
	    afterDraw: function(chart){
	        var ctx = chart.chart.ctx;
	        var y = 20;
	        var fomatTxt = '단위 |';
	        var fomat = '명';
	        var txtWidth = ctx.measureText(fomat).width + 10;
	        ctx.save();
	        ctx.textAlign = 'right';
	
	        ctx.font = "400 12px sans-serif";
	        ctx.fillStyle = "#333";
	        
	        ctx.fillText(fomatTxt, chart.chart.width - txtWidth, y);
	        
	        ctx.font = "400 12px sans-serif";
	        ctx.fillStyle = "#999";
	        ctx.fillText(fomat, chart.chart.width, y);
	    
	        ctx.restore();
	
	    }
	};
	
	mixedChart = new Chart(ctx, {
	    type: 'bar',
	    plugins: plugins,
	    data: chartData,
	    options: chartOption
	});
}



