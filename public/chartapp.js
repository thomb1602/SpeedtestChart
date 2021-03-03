var socket = io.connect('http://localhost:3000');

        //startup
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
            const todaysfileName =  "output.csv";
            selectize.addOption({value: todaysfileName, text: "Today"});
            selectize.setValue(todaysfileName, true);

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
            const filenames = [...new Set(files.match(filenameRegex))];
            return filenames;
        }
        //-----------------------------------------------------------------

        function loadSelection()
        {
            var timePeriod = 36; // 3 hours
            var todaysfileName = 'output.csv'; 
            if(sessionStorage.getItem("time_period")) { timePeriod = sessionStorage.getItem("time_period");}
            if(sessionStorage.getItem("day")) { todaysfileName = sessionStorage.getItem("day");}
            
            drawChartAsync(timePeriod, todaysfileName);
        }

        function setChoiceInSession(dataPoints, fileName)
        {
            sessionStorage.setItem("time_period", dataPoints);
            sessionStorage.setItem("day", fileName);
        }

        function passInputToChart()
        {            
            var $timeSelect = $(document.getElementById('time_period')).selectize();
            var timeDropDown = $timeSelect[0].selectize;
            const dataPoints = timeDropDown.getValue();

            var $daySelect = $(document.getElementById('day')).selectize();
            var dayDropDown = $daySelect[0].selectize;
            var fileName = dayDropDown.getValue();

            if(fileName != "output.csv") { fileName = '/archive/' + fileName} 

            setChoiceInSession(dataPoints, fileName);          
            drawChartAsync(dataPoints, fileName);
        }

        async function drawChartAsync(dataPoints, fileName) {
            const data = await getDataAsync(dataPoints, fileName);

            const ctx = document.getElementById('chart').getContext('2d');
            const myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.times,
                    datasets: [
                        {
                            label: 'Download',
                            data: data.downloads,
                            backgroundColor: 'rgba(164, 52, 235, 0.2)',
                            borderColor: 'rgba(164, 52, 235, 0.2)',
                            borderWidth: 1
                        },
                        {
                            label: 'Upload',
                            data: data.uploads,
                            backgroundColor: 'rgba(235, 158, 52, 0.2)',
                            borderColor: 'rgba(235, 158, 52)',
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
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