//-----------------------------------------------------------------
// Connect to socket, selectize, load chart

    var socket = io.connect('http://localhost:3000');     
    $(function() {

        // set up select styles
        $('select').selectize(
        {
            create: true,
        });    
    });
    populateDayAsync();
    loadSelection(); 


//-----------------------------------------------------------------
// For populating the day drop down with human readable labels
// and filename values

    async function populateDayAsync()
    {
        var $select = $(document.getElementById('day')).selectize();
        var selectize = $select[0].selectize;
     
        selectize.addOption({value: "Today", text: "Today"});
        selectize.setValue("Today", "Today");

        // get data for date dropdown
        const archiveData = await getArchiveDatesAsync();
        archiveData.dateLabels.reverse();
        archiveData.filenames.reverse();
        for (var i = 0; i<=archiveData.dateLabels.length; i++)
        {
            selectize.addOption({value: archiveData.filenames[i], text: archiveData.dateLabels[i]});
        }
    }

    async function getArchiveDatesAsync()
    {
        const filenames = await getArchiveFilesAsync();
        const dateRegex = /[0-9]*-[0-9]*-[0-9]*/g
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const dateLabels = [];
        filenames.forEach(row =>
        {
            const date = new Date(row.match(dateRegex));
            dateLabels.push(date.toLocaleDateString('en-EN', dateOptions));
        });
        return{dateLabels, filenames};
    }

    async function getArchiveFilesAsync()
    {
        //http://localhost:3000/archive/
        const filesPromise = await fetch('/archive/index.txt');
        const files = await filesPromise.text();
        const filenameRegex =  /output[0-9]*-[0-9]*-[0-9]*T[0-9]*.csv/g
        const filenames = files.split(/\r?\n/);
        return filenames;
    }
//-----------------------------------------------------------------

function loadSelection()
{
    // defaults
    var timePeriod = 36; // 3 hours
    var date = 'Today'; 
    var ethernet = true;
    var wifi = true;
    if(sessionStorage.getItem("time_period")) { timePeriod = sessionStorage.getItem("time_period");}
    if(sessionStorage.getItem("date")) { date = sessionStorage.getItem("date");}
    if(sessionStorage.getItem("ethernet")) { ethernet = sessionStorage.getItem("ethernet");}
    if(sessionStorage.getItem("wifi")) { wifi = sessionStorage.getItem("wifi");}
    
    drawChartAsync(timePeriod, date, ethernet, wifi);
}


//-----------------------------------------------------------------
// Get chart input, drawchart   was passInputToChart

function setSelection()
{            
    var $timeSelect = $(document.getElementById('time_period')).selectize();
    var timeDropDown = $timeSelect[0].selectize;
    const dataPoints = timeDropDown.getValue();

    var $daySelect = $(document.getElementById('day')).selectize();
    var dayDropDown = $daySelect[0].selectize;
    var date = dayDropDown.getValue();

    const ethernet = document.getElementById("ethernet").checked;
    const wifi = document.getElementById("wifi").checked;

    sessionStorage.setItem("time_period", dataPoints);
    sessionStorage.setItem("date", date);
    sessionStorage.setItem("ethernet", ethernet);
    sessionStorage.setItem("wifi", wifi);

    loadSelection();
}

async function drawChartAsync(dataPoints, date, ethernet, wifi) {
     
    // get chart data
    var chartData = [];
    var times;

    var response = getChartDataAsync(dataPoints, date, ethernet, wifi);
    chartData = (await response).chartData;
    times = (await response).times;

    // draw chart
    const ctx = document.getElementById('chart').getContext('2d');
    const myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: times,
            datasets: chartData
        },
        options: {
            //responsive: false,    // <-- uncommented this causes zoom bug, but wihtout it, chart won't centre >:(
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        suggestedMax: 100
                    }
                }],
            }
        }
    });
}

async function getChartDataAsync(dataPoints, date, ethernet, wifi)
{
    var ethernetBool = (ethernet == "true");
    var wifiBool = (wifi == "true");
    var chartData = [];
    var times;
    var ethernetData;
    var wifiData;

    // get data
    if(date == "Today")
    {
        if(ethernetBool) { ethernetData = await getDataAsync(dataPoints, "ethernet.csv"); }
        if(wifiBool) { wifiData = await getDataAsync(dataPoints, "wifi.csv"); }
    }
    else
    {
        if(ethernetBool) { ethernetData = await getDataAsync(dataPoints, "\\archive\\ethernet\\" + date); }
        if(wifiBool)  { wifiData = await getDataAsync(dataPoints, "\\archive\\wifi\\" + date); }
    }
    
    // push data to chart
    if(ethernetBool)
    {
        times = ethernetData.times;
        chartData.push( 
            {
                label: 'Ethernet Download', // dark blue
                data: ethernetData.downloads,
                backgroundColor: 'rgba(0, 162, 232, 0.2)',
                borderColor: 'rgba(0, 162, 232, 0.2)',
                borderWidth: 1
            });
            chartData.push( 
            {
                label: 'Ethernet Upload', // light blue
                data: ethernetData.uploads,
                backgroundColor: 'rgba(153, 217, 234, 0.2)',
                borderColor: 'rgba(153, 217, 234)',
                borderWidth: 1
            });
    }
    if(wifiBool)
    {
        times = wifiData.times;
        chartData.push( 
            {
                label: 'Wifi Download', // dark green
                data: wifiData.downloads,
                backgroundColor: 'rgba(34, 177, 76, 0.2)',
                borderColor: 'rgba(34, 177, 76, 0.2)',
                borderWidth: 1
            });
            chartData.push( 
            {
                label: 'Wifi Upload', // light green
                data: wifiData.uploads,
                backgroundColor: 'rgba(181, 230, 39, 0.2)',
                borderColor: 'rgba(181, 230, 39)',
                borderWidth: 1
            });
    }
    
    
    return {chartData, times}
}

//-----------------------------------------------------------------
// Get the data

async function getDataAsync(dataPoints, fileName) {
    const times = [];
    const downloads = [];
    const uploads = [];

    const response = await fetch(fileName);

    const data = await response.text();
    table = data.split('\n').slice(1); // remove header
    table = table.slice(0, (table.length - 1)) //remove trailing empty line
    table = table.reverse();
    table = table.slice(0, dataPoints); // get segment

    const mbSpeedRegex = /[0-9]*[0-9].[0-9][0-9]/s
    table.forEach(row => {
        const rowArray = row.split(',');
        const time = rowArray[0].slice(12, 17);
        times.push(time);
        downloads.push(rowArray[1].match(mbSpeedRegex));
        uploads.push(rowArray[2].match(mbSpeedRegex));

    })
    times.reverse();
    downloads.reverse();
    uploads.reverse();
    return { times, downloads, uploads }
}