// TODO: put these here

    // async function populateDayAsync()
    // {
    //     var $select = $(document.getElementById('day')).selectize();
    //     var selectize = $select[0].selectize;
    //     const todaysfileName =  "output.csv";
    //     selectize.addOption({value: todaysfileName, text: "Today"});
    //     selectize.setValue(todaysfileName, true);

    //     // get data for date dropdown
    //     const archiveData = await getArchiveDatesAsync();
    //     archiveData.dateLabels.reverse();
    //     archiveData.filenames.reverse();
    //     for (var i = 0; i<=archiveData.dateLabels.length; i++)
    //     {
    //         selectize.addOption({value: archiveData.filenames[i], text: archiveData.dateLabels[i]});
    //     }
    // }

    // async function getArchiveDatesAsync()
    // {
    //     const filenames = await getArchiveFilesAsync();
    //     const dateRegex = /[0-9]*-[0-9]*-[0-9]*/g
    //     const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    //     const dateLabels = [];
    //     filenames.forEach(row =>
    //     {
    //         const date = new Date(row.match(dateRegex));
    //         dateLabels.push(date.toLocaleDateString('en-EN', dateOptions));
    //     });
    //     return{dateLabels, filenames};
    // }

    // async function getArchiveFilesAsync()
    // {
    //     //http://localhost:3000/archive/
    //     const filesPromise = await fetch('/archive/index.txt');
    //     const files = await filesPromise.text();
    //     const filenameRegex =  /output[0-9]*-[0-9]*-[0-9]*T[0-9]*.csv/g
    //     const filenames = [...new Set(files.match(filenameRegex))];
    //     return filenames;
    // }