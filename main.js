
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


var myChart;
let windData = {}
let startDate = new Date()
let endDate   = new Date()
const bwd = document.getElementById("beginWeatherData")
const ewd = document.getElementById("endWeatherData")


init()

function init(){
  //startDate.setHours(currentDate.getHours() - 3);
  startDate.setHours(6, 0, 0, 0)

  bwd.value = toLocal(startDate)
  ewd.value = toLocal(endDate)

  bwd.addEventListener("change", function () {
    startDate = bwd.value
    fetchWindData();
  });

  ewd.addEventListener("change", function () {
    endDate = ewd.value
    fetchWindData();
  });

  fetchWindData()
}

function fetchWindData() {
  console.log("fetchWindData startDate: " + startDate + " endDate: " + endDate);

  if (!endDate) {
    endDate = new Date(); // current Date
  }

  let UTCstart = toUTC(startDate)
  let UTCend   = toUTC(endDate)

  fetch("https://api.pioupiou.fr/v1/archive/1339?start=" + UTCstart + "&stop=" + UTCend)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Use the 'data' object, which contains the response from the API
      windData = data
      drawChart();
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

function toUTC(val) {
  return (new Date(val + '')).toISOString()
}

function toLocal(val) {
  return val.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}

function drawChart() {

  let xValues = [];
  let yValues = [];

  let colors = ["166,206,227", "31,120,180", "178,223,138", "51,160,44", "251,154,153", "227,26,28", "253,191,111", "255,127,0", "202,178,214", "106,61,154", "255,255,153", "177,89,40"]

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

    let myBackgroundColor = {
      wind_speed_min : "166,206,227,0.6",
      wind_speed_avg : "51,160,44,0",
      wind_speed_max : "166,206,227,0.6"
    }

    let myBorderColor = {
      wind_speed_min : "166,206,227,0",
      wind_speed_avg : "31,120,180,1",
      wind_speed_max : "166,206,227,0"
    }

    dataset = {
      label: windData.legend[i],
      backgroundColor: "rgba(" + myBackgroundColor[windData.legend[i]] + ")",
      borderColor: "rgba(" + myBorderColor[windData.legend[i]] + ")",
     // lineTension: 0,
      fill: 1,
      data: yValues,
      pointRadius: 0,
      pointHitRadius: 100,
      pointHoverRadius: 10
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
      legend: {
        display: false, // Hide the legend
    },
      responsive: true,
      aspectRatio: 2,
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              day: 'dd.MM',
              hour: 'HH:00',
              minute: 'HH:mm'
            },
             tooltipFormat:'HH:mm dd.MM.yyyy'
          },
          ticks: {
            // source: 'auto',
            maxTicksLimit: 10,
            autoSkip: true
          },
//          maxRotation: 0 does not work
        },
        y: {
          beginAtZero: true,
          position: 'right',
          suggestedMax: 35
        }
        ,
        y1: {
          display: true,
          position: 'left',

          // grid line settings
          grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
          },
          beginAtZero: true,
          suggestedMax: 35

        }
      }
    }
  });
  drawWindDirChart()
}

window.addEventListener('resize', onResize);
//window.addEventListener('load', onResize);

function degToColor(dataRow) {
  let deg = dataRow[6]
  let deltaDeg = 180
  if (deg > 45) deltaDeg = deg - 225;
  if (deg < 45) deltaDeg = 135 + deg;

  if (deltaDeg > 90 || deltaDeg < - 90) {
    return '#000000'
  }

  colorIndex = Math.round((deltaDeg / 90) * 4) + 4

  colors = ['#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788']

  //  console.log(deg + ' : ' + deltaDeg + ' : ' + colorIndex + ' : ' + colors[colorIndex])
  return colors[colorIndex]
}

function fillColorCanvas(data, canvasId, dataToCol) {
    // Get the canvas element and its 2d context
    var canvas = document.getElementById(canvasId);

    var ctx = canvas.getContext("2d");

    var xAxis = myChart.scales['x'];

    let canWidth = xAxis.right - xAxis.left;

    ctx.canvas.width = canWidth + xAxis.left

    // Define colors for the blocks
    var colors = []

    for (d of data) {
      colors.push(dataToCol(d))         //degToColor(d[6]))
    }

    // colors = ['#b35806','#e08214','#fdb863','#fee0b6','#f7f7f7','#d8daeb','#b2abd2','#8073ac','#542788'];

    // Calculate block width based on the canvas width and the number of blocks
    var blockWidth = canWidth / colors.length;

    // Loop through the colors and draw the blocks
    for (var i = 0; i < colors.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(xAxis.left + i * blockWidth, 0, blockWidth, canvas.height);
    }
}

function drawWindDirChart() {
  let data = windData.data
  fillColorCanvas(data, "myCanvas", degToColor)
  fillColorCanvas(data, "myCanvas1", qualiToColor)
}

function qualiToColor(dataRow) {
  let qualiScore = getQualiForPointInTime(dataRow)
  let colors = ['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#ffffbf','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837']

  if (qualiScore >= 0 && qualiScore <= 1) {
    return colors[Math.round(qualiScore * 10)]
  } else {
    return '#000000'
  }
}

function getQualiForPointInTime(dataRow) {
  const min = dataRow[3]
  const avg = dataRow[4]
  const max = dataRow[5]
  const deg = dataRow[6]

  min_score = 0
  avg_score = 0
  max_score = 0
  deg_score = 0

  if (min < 10) {
    min_score = min / 10
  } else {
    min_score = 1
  }

  if (avg > 30) {
    avg_score = 0
  } else if (avg > 20 ) {
    avg_score = 1 - ((avg - 20) / 10)
  } else if (avg > 15) {
    avg_score = 1
  } else {
    avg_score = avg / 15
  }

  if (max > 40) {
    max_score = 0
  } else if (max > 25) {
    max_score = 1 - ((max - 25) / 15)
  } else {
    max_score = 1
  }

  deg_score = 1 - getPenalty(deg)

  //console.log("min:" + min + " avg:" + avg + " max:" + max + " deg:" + deg)
  //console.log("min_score:" + min_score + " avg_score:" + avg_score + " max_score:" + max_score + " deg_score:" + deg_score)

  return ( min_score * avg_score * max_score * deg_score * deg_score )
}


function onResize() {
  drawWindDirChart()
}

function getPenalty(deg) {
  let deltaDeg = 180
  if (deg > 45) deltaDeg = deg - 225;
  if (deg < 45) deltaDeg = 135 + deg;

  if (deltaDeg > 90 || deltaDeg < - 90) {
    return 1
  }

  return Math.abs((deltaDeg / 90)) // Wert zwischen 0 und 1
}
