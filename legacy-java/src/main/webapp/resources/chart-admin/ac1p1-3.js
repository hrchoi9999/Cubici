 /**
 * bar-stcked 샘플
*/
 //샘플 데이터
 var data1 = [20,22,30,33,32,42,39,37,55,47,21,59,62,44,32,55,45,12,42,33,28,36,54,62,57,71,66,64,67,58,72];
 var data2 = [1,1,2,4,3,5,6,1,4,2,2,3,3,3,4,3,3,5,4,3,5,4,1,4,3, 8,3,3,3,5,4];
 var barStckedLabel = ['21/01/01','21/01/02','21/01/03','21/01/04','21/01/05','21/01/06','21/01/07','21/01/08','21/01/09','21/01/10','21/01/11','21/01/12','21/01/13','21/01/14','21/01/15','21/01/16','21/01/17','21/01/18','21/01/19','21/01/20','21/01/21','21/01/22','21/01/23','21/01/24','21/01/25','21/01/26','21/01/27','21/01/28','21/01/29','21/01/30','21/01/31'];

var ctx_bar_stacked = document.getElementById('ac1p1-3').getContext('2d');

var chartData =  {
    datasets: [{
        label: 'cubici',
        data: data1,
        backgroundColor: '#0049ad',
    },{
        label: '제휴1',
        data: data2,
        backgroundColor: '#f9a268',
    },{
        label: '제휴2',
        data: data2,
        backgroundColor: '#fe7b90',
    },{
        label: '제휴2',
        data: data2,
        backgroundColor: '#26ccd2',
    }],
    labels: barStckedLabel
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


var barChart = new Chart(ctx_bar_stacked, {
    type: 'bar',
    data: chartData,
    options: chartOption
});