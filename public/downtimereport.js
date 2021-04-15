//-----------------------------------------------------------------
// Connect to socket, selectize

var socket = io.connect('http://localhost:3000');     
$(function() {

    // set up select styles
    $('select').selectize(
    {
        create: true,
    });    
});

populateForm()
resetValidation()

async function populateForm()
{
    var $select = $(document.getElementById('start_date')).selectize();
    var start_date = $select[0].selectize;
    var $select = $(document.getElementById('end_date')).selectize();
    var end_date = $select[0].selectize;
    var $select = $(document.getElementById('threshold')).selectize();
    var threshold = $select[0].selectize;

    start_date.addOption({value: "Today", text: "Today"});
    end_date.addOption({value: "Today", text: "Today"});

    // get data for date dropdown
    const archiveData = await getArchiveDatesAsync();
    archiveData.dateLabels.reverse();
    archiveData.filenames.reverse();
    for (var i = 0; i<=archiveData.dateLabels.length; i++)
    {
        start_date.addOption({value: archiveData.filenames[i], text: archiveData.dateLabels[i]});
        end_date.addOption({value: archiveData.filenames[i], text: archiveData.dateLabels[i]});
    }
}

function validateForm()
{
    var $select = $(document.getElementById('start_date')).selectize();
    var start_date_select = $select[0].selectize;
    var $select = $(document.getElementById('end_date')).selectize();
    var end_date_select = $select[0].selectize;

    const dateRegex = /[0-9]*-[0-9]*-[0-9]*/g
    const start_date_val = start_date_select.getValue();
    const end_date_val = end_date_select.getValue();
    const todays_date = new Date();

    var start_date;
    var end_date;

    if(start_date_val == "Today") { start_date = todays_date; }
    else { start_date = new Date(start_date_val.match(dateRegex)); }
    if(end_date_val == "Today") { end_date = todays_date; }
    else { end_date = new Date(end_date_val.match(dateRegex)); }

    if(start_date > end_date) {
        document.getElementById("downtimereport_form").innerText = "Start date must be before end date";
        return false; 
    } 
    else { 
        resetValidation()
        return true; 
    }   
}

function resetValidation()
{
    document.getElementById("downtimereport_form").innerText = "";
}

async function getDownTimeReport()
{
    if(validateForm())
    {

        // get form values
        var $select = $(document.getElementById('threshold')).selectize();
        var threshold_select = $select[0].selectize;
        var $select = $(document.getElementById('start_date')).selectize();
        var start_date_select = $select[0].selectize;
        var $select = $(document.getElementById('end_date')).selectize();
        var end_date_select = $select[0].selectize;
        const start_date_val = start_date_select.getValue();
        const end_date_val = end_date_select.getValue();

        // get data
        const report_data = await getDowntimeData(start_date_val, end_date_val, threshold_select.getValue());
        
        // remove canvas
        $("#report_canvas").remove();

        // re-add canvas
        const reportCanvasElem = "<div class=\"row\" id=\"report_canvas\">";
        const reportRowId = "report_row";;
        $("#report_row").append(reportCanvasElem);
        
        // draw report
        const perRow = 4;
        var counter = 0;
        const numberOfRows = Math.ceil((report_data.allChartData.length / perRow));
        for(var i = 0; i < numberOfRows; i++)
        {
            // add row
            const rowElem = "<div class=\"row\" id=\"row" + i + "\">";
            $("#report_canvas").append(rowElem);
            
            for(var  j = 0; j < perRow; j++)
            {
                // add col
                var rowId = "#row" + i;
                var colElem = "<div class=\"col-md-3\" id=\"col" + j + "\">";
                $(rowId).append(colElem);

                var colId = "#col" + j;

                // add legend as first entry in matrix
                if(i == 0 && j == 0)
                {
                    var legendboxElem = "<div id = \"legendbox\">";
                    $(colId).append(legendboxElem);
                    var legendElem = "<img id=\"legend\" class=\"legend\" src=\"images\\combinedlegend.png\" >";
                    $("#legendbox").append(legendElem);

                    // add empty label for alignment
                    var dateLabelElem = "<p class = \"spacelabel\">.</p>";
                    var colId = "#col" + j;
                    $(colId).append(dateLabelElem);
                }

                else
                {
                    // add canvas
                    var canvasElem = "<canvas id=\"canvas" + counter + "\" class=\"downtimechart\">";
                    $(colId).append(canvasElem);
                    var canvasId = "canvas" + counter;
                    const ctx = document.getElementById(canvasId).getContext('2d');
                    const myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: report_data.allChartData[counter].times,
                            datasets: report_data.allChartData[counter].chartData
                        },
                        options: {
                            legend: { display: false },
                            tooltips: { enabled: false },
                            responsive: true,
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
                    // add label
                    var dateLabelElem = "<p class = \"chartlabel\">" + report_data.dateLabels[counter] + "</p>";
                    var colId = "#col" + j;
                    $(colId).append(dateLabelElem);

                    //add time of day icon
                    // var todElem = "<img id=\"legend\" class=\"legend\" src=\"images\\0-6.png\" >";
                    // $(colId).append(todElem);

                    // TODO: replace this pic with one that's a screenshot of a graph made with chart.js
                    // and decide which of the 4 to show based on the time held within the chart

                    // increment chart counter
                    counter = counter + 1;            
                }                                   
            }
        }

        // make legend the same size as the charts
        var somechart = $("#canvas" + (counter - 1));
        var chartHeight = somechart.outerHeight();
        var chartWidth = somechart.outerWidth();
        $("#legendbox").width(chartWidth).height(chartHeight);
        // centre img
        var legendHeight = 182; // not the actua dimensions, but centers it well
        var legendWidth = 332;
        $('#legendbox').find('*').css('padding-top', ((chartHeight - legendHeight) / 2).toString());
        $('#legendbox').find('*').css('padding-left', ((chartWidth - legendWidth) / 2).toString());       
    }

}

async function getDowntimeData(startDate, endDate, threshold)
{
    var threshold_int;
    if(threshold == "") { threshold_int = 20; }
    else { threshold_int = parseInt(threshold); }

   const data = await getDataInRange(startDate, endDate); 
   var dateLabels = [];
   const buffer = 4;

   var allChartData = []; // contains data for multiple charts
    for(var i = 0; i < data.ethData.length; i++) // for each day
    { 
        for(var j = 0; j < data.ethData[i].downloads.length; j++) // for each entry per file
        {
            var ethDataDownload = data.ethData[i].downloads[j];
            var wifiDataDownload = data.wifiData[i].downloads[j];
            if(ethDataDownload != null && wifiDataDownload != null)
            {
                if(ethDataDownload <= threshold_int || wifiDataDownload <= threshold_int)
                {
                    console.log("eth down: " + ethDataDownload + " wifi down: " + wifiDataDownload);
                    
                    var startj = j;
                    j -= buffer; 
                    var ethDownSpeeds = [];
                    var ethUpSpeeds = [];
                    var wifiDownSpeeds = [];
                    var wifiUpSpeeds = [];
                    var times = [];
                    while(j < startj + buffer)
                    {
                        ethDownSpeeds.push(data.ethData[i].downloads[j]);
                        ethUpSpeeds.push(data.ethData[i].uploads[j]);
                        wifiDownSpeeds.push(data.wifiData[i].downloads[j]);
                        wifiUpSpeeds.push(data.wifiData[i].uploads[j]);
                        times.push(data.ethData[i].times[j])
                        j++
                    }
                    // todo: check if we need to extend into past or future so start & end of downtime is captured

                    //add to a chart data
                    var chartData = [];
                    chartData.push( 
                    {
                        label: 'Ethernet Download', // dark blue
                        data: ethDownSpeeds,
                        backgroundColor: 'rgba(0, 162, 232, 0.2)',
                        borderColor: 'rgba(0, 162, 232, 0.2)',
                        borderWidth: 1
                    });
                    chartData.push( 
                    {
                        label: 'Ethernet Upload', // light blue
                        data: ethUpSpeeds,
                        backgroundColor: 'rgba(153, 217, 234, 0.2)',
                        borderColor: 'rgba(153, 217, 234)',
                        borderWidth: 1
                    });
                    chartData.push( 
                    {
                        label: 'Wifi Download', // dark green
                        data: wifiDownSpeeds,
                        backgroundColor: 'rgba(34, 177, 76, 0.2)',
                        borderColor: 'rgba(34, 177, 76, 0.2)',
                        borderWidth: 1
                    });
                    chartData.push( 
                    {
                        label: 'Wifi Upload', // light green
                        data: wifiUpSpeeds,
                        backgroundColor: 'rgba(181, 230, 39, 0.2)',
                        borderColor: 'rgba(181, 230, 39)',
                        borderWidth: 1
                    });
                    
                    allChartData.push({chartData, times});
                    dateLabels.push(data.ethData[i].dateLabels[i]);
                }
            }           
        }
    }
    return {allChartData, dateLabels};
}

async function getDataInRange(startDate, endDate)
{
    const datapoints  = 288; // whole day
    var wifiData = [];
    var ethData = [];
    var dateLabels = [];
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };

    if(start_date != "Today" && end_date != "Today")
    {
        const dateRegex = /[0-9]*-[0-9]*-[0-9]*/g
        const start = new Date(startDate.match(dateRegex));
        const end = new Date(endDate.match(dateRegex));
        
        var nextDate = addDays(start, 1);
        while(nextDate <= end)
        {
            var eth = await getDataAsync(datapoints, "\\ResultsArchive\\ethernet\\" + getFileName(nextDate)); 
            var wifi = await getDataAsync(datapoints, "\\ResultsArchive\\wifi\\" + getFileName(nextDate)); 
            var date = nextDate;
            // add date labels
            var dateLabelArray = new Array(eth.times.length);
            dateLabelArray.fill(nextDate.toLocaleDateString('en-EN', dateOptions));
            eth.dateLabels = dateLabelArray;
            wifi.dateLabels = dateLabelArray;

            ethData.push(eth);
            wifiData.push(wifi);

            nextDate = addDays(nextDate, 1);
        }
    }
    if(endDate == "Today")
    {
        var eth = await getDataAsync(datapoints, "ethernet.csv"); 
        var wifi = await getDataAsync(datapoints, "wifi.csv"); 
        var dateLabelArray = new Array(eth.times.length);
        dateLabelArray.fill("Today");
        eth.dateLabels = dateLabelArray;
        wifi.dateLabels = dateLabelArray;
        ethData.push(eth);
        wifiData.push(wifi);
    }

    return{wifiData, ethData};
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getFileName(date)
{
    var unformattedMonth = date.getMonth() + 1
    if(unformattedMonth <= 9) { unformattedMonth = "0" + unformattedMonth; }
    var unformattedDay = date.getDate();
    if(unformattedDay <= 9) { unformattedDay = "0" + unformattedDay; }
    var fileName = "output" + (date.getYear() + 1900) + "-" + unformattedMonth + "-" + unformattedDay + ".csv";
    return fileName;
}