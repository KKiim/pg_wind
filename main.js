
// curl "http://api.pioupiou.fr/v1/archive/1339?start=2023-10&stop=2023-11"
// curl "http://api.pioupiou.fr/v1/live/1339"

/*

let myData = {
  "doc": "http://developers.pioupiou.fr/api/archive/",
  "license": "http://developers.pioupiou.fr/data-licensing",
  "attribution": "(c) contributors of the Pioupiou wind network <http://pioupiou.fr>",
  "legend": ["time","latitude","longitude","wind_speed_min","wind_speed_avg","wind_speed_max","wind_heading","pressure"],
  "units": ["utc","degrees","degrees","km/h","km/h","km/h","degrees","(deprecated)"],
  "data": []
}

*/


//********* */ 3.11 War eine Topflugtag! **********************


function fetchWindData(startDate, endDate) {


  console.log("fetchWindData startDate: " + startDate + " endDate: " + endDate);


  if (!endDate) {
    endDate = new Date(); // current Date
  }



  fetch("http://api.pioupiou.fr/v1/archive/1339?start=" + startDate + "&stop=" + endDate)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Use the 'data' object, which contains the response from the API
      drawChart(data);
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}






// Create a new Date object for the current date and time
var currentDate = new Date();
// Subtract one day (24 hours) from the current date
currentDate.setHours(currentDate.getHours() - 3);
fetchWindData(currentDate)


var myChart;

function toUTC(val) {
  return (new Date(val + '')).toISOString()
}


const bwd = document.getElementById("beginWeatherData")

bwd.addEventListener("change", function () {
  fetchWindData(toUTC(bwd.value));
});

const ewd = document.getElementById("endWeatherData")

ewd.addEventListener("change", function () {
  fetchWindData(toUTC(bwd.value), toUTC(ewd.value));
});


function drawChart(data) {


  let xValues = [];
  let yValues = [];

  // let blue_l  = "166,206,227"
  // let blue_d  = "31,120,180"
  // let green_l = "178,223,138"
  // let green_d = "51,160,44"

  let colors = ["166,206,227", "31,120,180", "178,223,138", "51,160,44", "251,154,153", "227,26,28", "253,191,111", "255,127,0", "202,178,214", "106,61,154", "255,255,153", "177,89,40"]

  let windData = data

  datasets = []

  for (let d of windData.data) {
    xValues.push(new Date(d[0]))
    //xValues.push(d[0])
  }

  for (let i = 3; i < 6; i++) {

    yValues = []
    for (let d of windData.data) {
      yValues.push(d[i])
    }

    dataset = {
      label: windData.legend[i],
      backgroundColor: "rgba(" + colors[(i - 3) * 2] + ",1.0)",
      borderColor: "rgba(" + colors[(i - 3) * 2 + 1] + ",1.0)",
      lineTension: 0,
      fill: 'none',
      data: yValues,
      pointRadius: 0
    }
    datasets.push(dataset)
  }


  if (myChart) {
    myChart.destroy();
  }

  const ctx = document.getElementById('myChart').getContext('2d');


  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      scales: {
        x: {
          type: 'time',
          unit: 'day',
          displayFormats: {
            day: 'MMM DD HH'
          },
          ticks: {
            source: 'auto',
            maxTicksLimit: 12,
            autoSkip: true
          }
        },
        y: {
          beginAtZero: true
        }
      }
      //  scales: {
      //     x: {
      //         type: 'time',
      //         time: {
      //             unit: 'day',
      //             displayFormats: {
      //                 day: 'MMM D'
      //             },
      //         },
      //         title: {
      //             display: true,
      //             text: 'Date'
      //         }
      //     },
      //     y: {
      //         title: {
      //             display: true,
      //             text: 'Temperature (°C)'
      //         }
      //     }
      // },
      // scales: {
      //   xAxes: [
      //     {
      //       ticks: {
      //         callback: (val) => (new Date(val)).getDate().toString().padStart(2, '0') + " " + (new Date(val)).getHours().toString().padStart(2, '0') + ":" + (new Date(val)).getMinutes().toString().padStart(2, '0')  // or a different way to convert timestamp to date
      //       },
      //       // type: 'time',
      //       // time: {
      //       //     unit: 'day',
      //       //     displayFormats: {
      //       //         day: 'MMM D'
      //       //     },
      //       // }
      //     }
      //   ]
      // tooltips: {
      //   position: 'nearest',
      //   enabled: false // Enable tooltips on hover
      // }
    }
  });
  drawWindDirChart(windData.data)
}

function degToColor(deg){
  let deltaDeg = 180
  if (deg > 45) deltaDeg = deg - 225;
  if (deg < 45) deltaDeg = 135 + deg;

  if (deltaDeg > 90 || deltaDeg < - 90) {

    console.log("deltaDeg: " + deltaDeg)
    return '#000000'
  }

  colorIndex = Math.round((deltaDeg / 90) * 4) + 4

  colors = ['#b35806','#e08214','#fdb863','#fee0b6','#f7f7f7','#d8daeb','#b2abd2','#8073ac','#542788']


  console.log(deg + ' : ' + deltaDeg + ' : ' + colorIndex + ' : ' + colors[colorIndex])


  return colors[colorIndex]
}

function drawWindDirChart(data) {
      // Get the canvas element and its 2d context
      var canvas = document.getElementById("myCanvas");

      var ctx = canvas.getContext("2d");
      ctx.canvas.width  = window.innerWidth * 0.75;

      // Define colors for the blocks
      var colors = [] //['#b35806','#e08214','#fdb863','#fee0b6','#f7f7f7','#d8daeb','#b2abd2','#8073ac','#542788'];

      for ( d of data) {
        colors.push(degToColor(d[6]))
      }

      // Calculate block width based on the canvas width and the number of blocks
      var blockWidth = canvas.width / colors.length;

      // Loop through the colors and draw the blocks
      for (var i = 0; i < colors.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.fillRect(i * blockWidth, 0, blockWidth, canvas.height);
      }
}

