const request = require('request');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const url = 'https://browser.geekbench.com/';


async function getData(url) {
    let requests = [];
    return new Promise((resolve, reject) => {
        request(`${url}/processor-benchmarks`, function (error, response, body) {
            const $ = cheerio.load(body);
            $('td a').each(function (i, elem) {
                requests.push(url + elem.attribs.href);
            }).text();
            resolve(requests);
        });
    });
}

async function getSpecs(url) {
    return new Promise((resolve, reject) => {
        request(url, function (error, response, body) {
            let obj;
            const $ = cheerio.load(body);
            let score = $('.score').text().slice(0, 9);
            // console.log('>>>>>>>>>>',$('.score-container-1').text().replace(/[\n\r]/g, '').split('S')[0]);
            console.log('!!!!',$('.desktop').text().trim().split('\n'));
            console.log('scscore',$('.desktop').text().trim().split('\n')[0]);
            console.log('mcscore',$('.desktop').text().trim().split('\n')[3]);

            // const scscore = score.slice(0, 4);
            // const mcscore = score.slice(4);
            const scscore = $('.desktop').text().trim().split('\n')[0];
            const mcscore = $('.desktop').text().trim().split('\n')[3];
            let tabledata = $('.system-table').text();
            tabledata = tabledata.split('\n').filter(item => item);
            console.log('tabledata', tabledata, 'table data length',tabledata.length)
            if (tabledata.includes('GPU')) {
                const processor = tabledata[1];
                const freq = tabledata[3];
                const maxfreq = tabledata[5];
                const cores = tabledata[7];
                const threads = tabledata[9];
                const tdp = tabledata[11];
                const gpu = tabledata[13];
                const codename = tabledata[15];
                const package = tabledata[17];
                obj = { mcscore, scscore, processor, freq, maxfreq, cores, threads, tdp, gpu, codename, package };
            } 
            if (tabledata.includes('Maximum Frequency')) {
                const processor = tabledata[1];
                const freq = tabledata[3];
                const maxfreq = tabledata[5];
                const cores = tabledata[7];
                const threads = tabledata[9];
                const tdp = tabledata[11];
                const codename = tabledata[13];
                const package = tabledata[15];
                obj = { mcscore, scscore, processor, freq, maxfreq, cores, threads, tdp, codename, package };
            }  
            if (!(tabledata.includes('Maximum Frequency'))) {
                const processor = tabledata[1];
                const freq = tabledata[3];
                const cores = tabledata[5];
                const threads = tabledata[7];
                const tdp = tabledata[9];
                const codename = tabledata[11];
                const package = tabledata[13];
                obj = { mcscore, scscore, processor, freq, cores, threads, tdp, codename, package };
            }
            if (!(tabledata.includes('TDP')) && !(tabledata.includes('Maximum Frequency'))) {
                obj = { mcscore, scscore, processor, freq, cores, threads, codename, package };
            }
           // Loop through table data, 
            resolve(obj);
        });
    });
}

async function main() {
    let data = await getData(url); //3130 entries
    let specs = [];
    console.log('len',data.length);
    data = data.slice(0, 3); // Due to the fact that the website has a limit of the number of requests it can make, we are only going to make 2 requests.
    console.log(data);
    for (const item of data) {
        specs.push(await getSpecs(item));
        console.log('len',specs.length)
    }
    console.log(specs);


    // Iterate through result of main and push the data into a csv
    const csvWriter = createCsvWriter({
        path: 'dat.csv',
        header: [
            {id: 'mcscore', title: 'mcscore'},
            {id: 'scscore', title: 'scscore'},
            {id: 'processor', title: 'processor'},
            {id: 'freq', title: 'freq'},
            {id: 'maxfreq', title: 'maxfreq'},
            {id: 'cores', title: 'cores'},
            {id: 'threads', title: 'threads'},
            {id: 'tdp', title: 'tdp'},
            {id: 'gpu', title: 'gpu'},
            {id: 'codename', title: 'codename'},
            {id: 'package', title: 'package'},
        ]
    });

    await csvWriter.writeRecords(specs)       // returns a promise


}

main();

 
 
