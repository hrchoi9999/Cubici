//샘플 데이터
var data1 = [20.5,22.333,30,33.286,32,15.56,39,37,55,47,21,59,62,44,32,55,45,12,15,33,28,36,16,62,8.12,16,11,64,67,58,54];
var data2 = [2,2,3,3,3,4,3,3,5,4,2,5,6,4,3,0,4,1,4,3,2,3,5,6,5,7,6,6,6,5,0];
var data3 = [20,22,30,33,32,42,39,37,55,47,21,59,62,44,32,55,45,12,42,33,28,36,54,62,57,71,66,64,67,58,72];
var barLabel = ['21/01','21/02','21/03','21/04','21/05','21/06','21/07','21/08','21/09','21/10','21/11','21/12','21/13','21/14','21/15','21/16','21/17','21/18','21/19','21/20','21/21','21/22','21/23','21/24','21/25','21/26','21/27','21/28','21/29','21/30','21/31'];

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


var ctx = document.getElementById('ac1p1-2').getContext('2d');

var chartData = {
    datasets: [{
        label: '큐빅아이',
        data: data1,
        backgroundColor: '#0049ad',
        barThickness: 10, 
        z: 1
    },{
        label: '머니뱅크',
        data: data2,
        borderColor: '#f9a268',
        backgroundColor: '#f9a268',
        fill: false,
        borderWidth: 1,
        lineTension: 0,
        z: 2
    },{
        type: 'line',
        label: '평균가입기간',
        data: cumulative(data2),
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
                    callback: function(value, index, values) {
                        return value.toFixed(1);
                    },
                },
            }],
        }
}

var mixedChart = new Chart(ctx, {
    type: 'bar',
    data: chartData,
    options: chartOption
});

