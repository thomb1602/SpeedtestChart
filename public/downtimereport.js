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

async function populateForm()
{
    var $select = $(document.getElementById('start_date')).selectize();
    var start_date = $select[0].selectize;
    var $select = $(document.getElementById('end_date')).selectize();
    var end_date = $select[0].selectize;
    var $select = $(document.getElementById('threshold')).selectize();
    var threshold = $select[0].selectize;

    start_date.addOption({value: "Today", text: "Today"});
    // start_date.setValue("Today", "Today");
    end_date.addOption({value: "Today", text: "Today"});
    // end_date.setValue("Today", "Today");

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

function getDownTimeReport()
{

}

function getDownTimeData(startDate, endDate, threshold)
{
    const datapoints  = 288; // whole day
    //var data = await getDataAsync(datapoints, )
}