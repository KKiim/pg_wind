
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
let endDate = new Date()
const bwd = document.getElementById("beginWeatherData")
const ewd = document.getElementById("endWeatherData")
let nextDayCount = 0; // used to dertimine if forecast is acivated
let urlParams = new URLSearchParams(window.location.search);
let dirColMode = urlParams.get('dirCol');



init()

function init() {
  //startDate.setHours(currentDate.getHours() - 3);
  startDate.setHours(6, 0, 0, 0)

  bwd.value = toLocal(startDate)
  ewd.value = toLocal(endDate)

  bwd.addEventListener("change", function () {
    startDate = new Date(bwd.value)
    fetchWindData();
  });

  ewd.addEventListener("change", function () {
    endDate = new Date(ewd.value)
    fetchWindData();
  });

  fetchWindData()
  intiLiveUpdate()
}

function fetchWindData() {
  //console.log("fetchWindData startDate: " + startDate + " endDate: " + endDate);

  if (!endDate) {
    endDate = new Date(); // current Date
  }

  let UTCstart = toUTC(startDate)
  let UTCend = toUTC(endDate)

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
      drawCharts();
    })
    .catch(error => {
      console.error('Fetch error:', error);
    });
}

let testF;

function fetchFordcastData(){
  fetch("https://api.openweathermap.org/data/2.5/forecast?lat=47.769291&lon=8.968063&units=metric&appid=e3cc74ea38feb7a798ae46719958f346")
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  })
  .then(forecastData => {
    // Use the 'data' object, which contains the response from the API
    addForecastToWindData(forecastData)
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
}

function addForecastToWindData(forecastData) {


  let dataPointCount = ((nextDayCount - 1) * 8 - 4)

  if (dataPointCount > 40) {
    nextDayCount--
    dataPointCount = 40
  }

  for (let i = 0; i< dataPointCount; i++) {
    let item = forecastData.list[i]
    let date = new Date(item.dt_txt)
    let wind_speed_min = item.wind.speed -1
    if (wind_speed_min < 0 ) wind_speed_min = 0
    let wind_speed_avg = item.wind.speed
    let wind_speed_max = item.wind.gust
    let wind_heading   = item.wind.deg

    wind_speed_min *= 3.6
    wind_speed_avg *= 3.6
    wind_speed_max *= 3

    wind_speed_min = Math.round(wind_speed_min)
    wind_speed_avg = Math.round(wind_speed_avg)
    wind_speed_max = Math.round(wind_speed_max)

    if (wind_speed_max <= wind_speed_avg) {
      wind_speed_max = Math.round(wind_speed_avg * 1.2)
      if (wind_speed_max <= wind_speed_avg) {
        wind_speed_max++
      }
    }

    let dataRow = [date, 47.769291, 8.968063, wind_speed_min, wind_speed_avg, wind_speed_max, wind_heading, null]
    windData.data.push(dataRow)
  }
  drawCharts();
}

function toUTC(val) {
  return (new Date(val + '')).toISOString()
}

function toLocal(val) {
  return val.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
}

function drawCharts() {

  let xValues = [];
  let yValues = [];

  let avg_color = "2,56,88"
  let min_max_color = "116,169,207"

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
      wind_speed_min: min_max_color + ",0.6",
      wind_speed_avg: avg_color     + ",0",
      wind_speed_max: min_max_color + ",0.6"
    }

    let myBorderColor = {
      wind_speed_min: min_max_color + ",0",
      wind_speed_avg: avg_color     + ",1",
      wind_speed_max: min_max_color + ",0"
    }

    let legend = windData.legend[i]

    dataset = {
      label: windData.legend[i],
      backgroundColor: "rgba(" + myBackgroundColor[legend] + ")",
      borderColor: "rgba(" + myBorderColor[legend] + ")",
      // lineTension: 0,
      fill: 0,
      data: yValues,
      pointRadius: 0,
      pointHitRadius: 100,
      pointHoverRadius: 10
    }
    datasets.push(dataset)
  }

  const chartAreaBackgroundColor = {
    id:'chartAreaBackgroundColor',
    beforeDraw(chart, args, plugins) {
      const { ctx, chartArea: { top, bottom, left , right, width,
         height} }= chart;
         console.log('Hello :)')
         ctx.save()
         ctx.fillStyle = 'rgba(166,97,26, 0.2)'
         let myHeight = height / 4
         ctx.fillRect(left, top, width, myHeight)
         ctx.fillStyle = 'rgba(223,194,125, 0.2)'
         ctx.fillRect(left, top + myHeight, width, myHeight)
         ctx.fillStyle = 'rgba(128,205,193, 0.2)'
         ctx.fillRect(left, top + myHeight + myHeight, width, myHeight)
         ctx.fillStyle = 'rgba(1,133,113, 0.2)'
         ctx.fillRect(left, top + (3 * myHeight), width, myHeight)

    }
  }

  const drawSubCharts = {
    id:'drawSubCharts',
    afterDraw(chart, args, plugins) {
      drawWindDirChart(chart)

      let currRow = windData.data[windData.data.length - 1]
      drawCurrChart((currRow[6] + 168.5) % 360, qualiToColor(currRow), currRow[3], currRow[4], currRow[5], d[0])
    }
  }


  if (myChart) {
    myChart.destroy();
  }

  Chart.defaults.font.size = 20;
  const ctx = document.getElementById('myChart').getContext('2d');


  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xValues,
      datasets: datasets
    },
    options: {
      responsive: true,
      aspectRatio: 4,
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              day: 'dd.MM',
              hour: 'H',
              minute: 'H:mm',
              second: 'H:mm:ss'
            },
            tooltipFormat: 'HH:mm dd.MM.yyyy'
          },
          ticks: {
            // source: 'auto',
            maxTicksLimit: 13,
            autoSkip: true,
            color: 'black'
          },
          grid: {
            color: 'grey'
          }
          //          maxRotation: 0 does not work
        },
        y: {
          beginAtZero: true,
          position: 'left',
          suggestedMax: 40,
          grid : {
            lineWidth: 1,
            color: function(context) {
              if (context.tick.value >= 40) {
                return 'black';
              } else if (context.tick.value >= 30) {
                return '#bd0026';
              }
              return 'grey';
            },
          },
          ticks: {
            maxTicksLimit: 6,
            color: 'black'
          }
        }
        ,
        // y1: {
        //   display: true,
        //   position: 'left',

        //   // grid line settings
        //   grid: {
        //     drawOnChartArea: false, // only want the grid lines for one axis to show up
        //   },
        //   beginAtZero: true,
        //   suggestedMax: 35

        // }
      },
      plugins: {
        legend: {
            display: false
        }}
    }, plugins : [drawSubCharts]
  });
  // drawWindDirChart()
}

window.addEventListener('resize', onResize);
//window.addEventListener('load', onResize);


function getWindDirCols() {
  colors = ['#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788']

  if (dirColMode == 2) {
    colors = [ '#edf8fb', '#b2e2e2', '#66c2a4', '#2ca25f', '#006d2c', '#2ca25f', '#66c2a4', '#b2e2e2', '#edf8fb']
  }
  return colors
}

function degToColor(dataRow) {
  let deg = dataRow[6]
  let deltaDeg = 180
  if (deg > 45) deltaDeg = deg - 225;
  if (deg < 45) deltaDeg = 135 + deg;

  if (deltaDeg > 90 || deltaDeg < - 90) {
    return '#cccccc'
  }

  colorIndex = Math.round((deltaDeg / 90) * 4) + 4

  return getWindDirCols()[colorIndex]
}

function getMiddleDate(dateA, dateB) {
  const averageTimestamp = ((new Date(dateA)).getTime() + (new Date(dateB)).getTime()) / 2; // todo Check warum new Date noetig!
  const middleDate = new Date(averageTimestamp);
  return middleDate;
}

function fillColorCanvas(data, canvasId, dataToCol, chart) {
  // Get the canvas element and its 2d context
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const xAxis = chart.scales['x'];

  const canWidth = xAxis.width;

  ctx.canvas.width = canWidth

  ctx.canvas.height = 25

  if (isMobileDevice()) {
    ctx.canvas.height = 50
  }

  ctx.canvas.style.marginLeft = xAxis.left + "px"

  // Define colors for the blocks
  var colors = []

  for (d of data) {
    colors.push(dataToCol(d))         //degToColor(d[6]))
  }

  // Calculate block width based on the canvas width and the number of blocks
  const blockWidth = canWidth / (colors.length - 1);

  let blockTimeWidthArray = []

  let startDate = data[0][0]
  let endDate   = data[data.length - 1][0]
  let intevallLength = new Date(endDate) -  new Date(startDate)
  for (let i = 0; i < data.length ; i++) {
    if (i == 0) {
      blockTimeWidthArray[0] = ((new Date(data[1][0]) - new Date(startDate)) / 2)
    } else if (i == data.length -1) {
      blockTimeWidthArray[i] = ((new Date(data[i][0]) - new Date(data[i - 1][0])) / 2)
    } else {
      let betweenLastAndNow = (getMiddleDate(data[i][0], data[i - 1][0]))
      let betweenNextAndNow = (getMiddleDate(data[i + 1][0], data[i][0]))
      blockTimeWidthArray[i] = (betweenNextAndNow - betweenLastAndNow)
    }
  }

  //skalieren
  let blockWidthArray = []
  for (let b of blockTimeWidthArray) {
    blockWidthArray.push( (b / intevallLength) * canWidth)
  }
  // let blockWidthArray = blockTimeWidthArray.map(b => (b / intevallLength) * canWidth);

  // Loop through the colors and draw the blocks
  let currBlockStart = 0
  for (var i = 0; i < colors.length; i++) {
    let currBlockWidth = blockWidthArray[i]
    ctx.fillStyle = colors[i];

    ctx.fillRect(currBlockStart, 0, currBlockWidth, canvas.height);
    currBlockStart += currBlockWidth
  }
}

function drawWindDirChart(chart) {
  let data = windData.data
  fillColorCanvas(data, "myCanvas", degToColor, chart)
  fillColorCanvas(data, "myCanvas1", qualiToColor, chart)
}

function qualiToColor(dataRow) {
  let qualiScore = getQualiForPointInTime(dataRow)
  let colors = ['#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b', '#ffffbf', '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837']

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
  } else if (avg > 20) {
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

  return (min_score * avg_score * max_score * deg_score * deg_score)
}

function onResize() {
  //drawWindDirChart()
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


function intiLiveUpdate() {
  var socket = io.connect('https://api.pioupiou.fr/v1/push');

  socket.on("connect", function () {
    socket.emit("subscribe", 1339); // station n° 1
  });

  socket.on("measurement", function (data) {
    console.log("measurement" + data);
    addLiveData(data)
  });

}

function addLiveData(data) {
  let dataRow = [data.date, 47.769291, 8.968063, data.wind_speed_min, data.wind_speed_avg, data.wind_speed_max, data.wind_heading, null]

  console.log("Added Data " + data.date + " data.station_id " + data.station_id + " data.wind_speed_avg " + data.wind_speed_avg + " data.wind_heading " + data.wind_heading)
  //let dataRow = [data.date, data.pressure, data.station_id, data.wind_speed_min, data.wind_speed_avg, data.wind_speed_max, data.wind_heading]

  let lastDate = new Date(windData.data[windData.data.length - 1][0])

  let inDate = new Date(data.date)

  const diffTime = Math.abs(inDate - lastDate);
  const diffMinutes = Math.ceil(diffTime / (1000 * 60));

  if (diffMinutes > 30) {
    console.log("ignoring update as chart is not showing live data")
  } else {
    windData.data.push(dataRow)
    drawCharts();
  }
}

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}


var button_yesterday = document.getElementById("button_yesterday");

button_yesterday.addEventListener("click", function() {
  if (nextDayCount > 0) nextDayCount = 0
  nextDayCount--;
  //startDate.setHours(currentDate.getHours() - 3);

  startDate.setDate(startDate.getDate() - 1)
  startDate.setHours(6, 0, 0, 0)

  endDate.setDate(endDate.getDate() - 1)
  endDate.setHours(18, 0, 0, 0)

  bwd.value = toLocal(startDate)
  ewd.value = toLocal(endDate)

  fetchWindData();
});

var button_tommorow = document.getElementById("button_tommorow");

button_tommorow.addEventListener("click", function() {
  nextDayCount++;
  startDate.setDate(startDate.getDate() + 1)
  startDate.setHours(6, 0, 0, 0)
  endDate.setDate(endDate.getDate() + 1)
  endDate.setHours(18, 0, 0, 0)


  let now = new Date()

  if (endDate > now || startDate > now) {
    startDate = new Date()
    startDate.setHours(6, 0, 0, 0)
    endDate = new Date()
  }

  bwd.value = toLocal(startDate)
  ewd.value = toLocal(endDate)

  fetchWindData();
  if(nextDayCount > 1) {
    //nextDayCount = 2
    fetchFordcastData()
  }
})

screen.addEventListener("orientationchange", () => {
  drawCharts()
});


const qrcode = new QRCode(document.getElementById('qrcode'), {
  text: 'https://kkiim.github.io/pg_wind/',
  width: 128,
  height: 128,
  colorDark : '#000',
  colorLight : '#fff',
  correctLevel : QRCode.CorrectLevel.H
});


async function drawCurrChart(rotation, color, min, avg, max, lastUpdate) {

  // Set up the SVG container
  const svgWidth = 400;
  const svgHeight = 500;

  d3.select("svg").remove();
  const svg = d3.select("#curr-chart-container")
  .append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

  let colors = getWindDirCols();


  // Set up the ring data with 16 parts
  const ringData = [
      { startAngle: 0, endAngle: (1 * Math.PI) / 8, color: 'grey' },
      { startAngle: (1 * Math.PI) / 8, endAngle: (2 * Math.PI) / 8, color: 'grey' },
      { startAngle: (2 * Math.PI) / 8, endAngle: (3 * Math.PI) / 8, color: 'grey' },
      { startAngle: (3 * Math.PI) / 8, endAngle: (4 * Math.PI) / 8, color: 'grey' },
      { startAngle: (4 * Math.PI) / 8, endAngle: (5 * Math.PI) / 8, color: 'grey' },
      { startAngle: (5 * Math.PI) / 8, endAngle: (6 * Math.PI) / 8, color: colors[0] },
      { startAngle: (6 * Math.PI) / 8, endAngle: (7 * Math.PI) / 8, color: colors[1] },
      { startAngle: (7 * Math.PI) / 8, endAngle: (8 * Math.PI) / 8, color: colors[2] },
      { startAngle: (8 * Math.PI) / 8, endAngle: (9 * Math.PI) / 8, color: colors[3] },
      { startAngle: (9 * Math.PI) / 8, endAngle: (10 * Math.PI) / 8, color: colors[4] },
      { startAngle: (10 * Math.PI) / 8, endAngle: (11 * Math.PI) / 8, color: colors[5] },
      { startAngle: (11 * Math.PI) / 8, endAngle: (12 * Math.PI) / 8, color: colors[6] },
      { startAngle: (12 * Math.PI) / 8, endAngle: (13 * Math.PI) / 8, color: colors[7] },
      { startAngle: (13 * Math.PI) / 8, endAngle: (14 * Math.PI) / 8, color: colors[8] },
      { startAngle: (14 * Math.PI) / 8, endAngle: (15 * Math.PI) / 8, color: 'grey' },
      { startAngle: (15 * Math.PI) / 8, endAngle: 2 * Math.PI, color: 'grey' },
  ];

  // Draw the ring
  const radius = Math.min(svgWidth, svgHeight) / 2 - 10;

  const arc = d3.arc()
      .innerRadius(radius - 30)
      .outerRadius(radius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle);

  // Create a group for the ring and arrow, and apply rotation
  const group = svg.append('g')
      .attr('transform', `translate(${svgWidth / 2},${svgHeight / 2}) rotate(${360 / 32})`);

  group.selectAll('path.ring')
      .data(ringData)
      .enter()
      .append('path')
      .attr('class', 'ring')
      .attr('d', arc)
      .attr('fill', d => d.color);

  // Draw the custom wind arrow
  const arrowSize = 30;

  const arrowPath = `M0 -${arrowSize * 2} L${arrowSize} ${arrowSize * 4} L0 ${arrowSize * 2.5} L-${arrowSize} ${arrowSize * 4} Z`;

  group.append('path')
      .attr('d', arrowPath)
      .attr('transform', 'rotate(' + rotation + ')')
      .attr('fill', color);


  let dateLabel = 'Letztes Update: ' + new Date(lastUpdate).toLocaleTimeString()
  // Add text information
  const textGroup = group.append('g').attr('transform', `translate(0, -120) rotate(${-360 / 32})`);

  textGroup.append('text').text('max: ' + max + ' km/h').attr('text-anchor', 'middle');
  textGroup.append('text').text('avg: ' + avg + ' km/h').attr('text-anchor', 'middle').attr('dy', '1em');
  textGroup.append('text').text('min: ' + min + ' km/h').attr('text-anchor', 'middle').attr('dy', '2em');
  textGroup.append('text').text(dateLabel            ).attr('text-anchor', 'middle').attr('dy', '14em');

}