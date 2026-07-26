 /**
 * combo-bar-line 샘플
*/

//샘플 데이터
var barData = [1000, 2000, 3000, 2500];
var barData2 = [500, 1000, 500, 200];
var lineData = [20, 50, 30, 50];

var ctx = document.getElementById('combo-bar-stacked-line').getContext('2d');

var chartData = {
    datasets: [{
        label: 'Bar Dataset',
        data: barData,
        yAxisID: 'y-axis-1',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderSkipped :'left',
        borderWidth: {
            top: 2,
            right: 0,
            bottom: 0,
            left: 0
        }
    },{
        label: 'Bar Dataset',
        data: barData2,
        yAxisID: 'y-axis-1',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: {
            top: 2,
            right: 0,
            bottom: 0,
            left: 0
        }
    }, {
        label: 'Line Dataset',
        data: lineData,
        yAxisID: 'y-axis-2',
        borderColor: 'rgb(0, 99, 132)',
        backgroundColor: 'rgba(0, 99, 132, 0)',
        borderWidth: 1,
        // Changes this dataset to become a line
        type: 'line'
    }],
    labels: ['January', 'February', 'March', 'April']
}
var chartOption = {
        responsive: true,
        legend : {
            display : true,
            labels: {
            fontSize: 15,
            boxWidth: 20,
            },
            generateLabels: {
            
            }
        },
        title: {
            display: true,
            text: 'combo-bar-stacked-line',
            fontSize : 20
        },
        scales: {       
        xAxes: [{
        stacked: true,
        //barThickness: 10,
        barWidth: 0.1, 
        categoryPercentage: 0.4, 
        barPercentage: 0.6, 
        }],
        yAxes: [{
            stacked: true,
            type: 'linear', 
            display: true,
            position: 'left',
            id: 'y-axis-1',
            ticks: {
                min: 0,
                max: 5000,
            },
        }, {
            display: true,
            position: 'right',
            id: 'y-axis-2',
            ticks: {
                min: 0,
                max: 100,
                //beginAtZero: true,
            },
            gridLines: {
                drawOnChartArea: false
            }
        }],
    }
}

var mixedChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: chartOption
});
