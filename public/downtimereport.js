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
        return {valid: false, start_date, end_date}; 
    } 
    else { 
        resetValidation()
        return {valid:true, start_date, end_date}; 
    }   
}

function resetValidation()
{
    document.getElementById("downtimereport_form").innerText = "";
}

function getDownTimeReport()
{
    const validationData = validateForm();
    if(validationData.valid)
    {
        var $select = $(document.getElementById('threshold')).selectize();
        var threshold_select = $select[0].selectize;
        const report_data = getDownTimeData(validationData.start_date, validationData.end_date, threshold_select.getValue());
    }

}

function getDownTimeData(startDate, endDate, threshold)
{
    const datapoints  = 288; // whole day
    var threshold_int;
    if(threshold == "") { threshold_int = 20; }
    else { threshold_int = parseInt(threshold); }
    //var data = await getDataAsync(datapoints, )
}