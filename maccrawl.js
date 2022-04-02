const request = require('request');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const url = 'https://browser.geekbench.com/';


async function getData(url) {
    let requests = [];
    return new Promise((resolve, reject) => {
        request(`${url}/mac-benchmarks`, function (error, response, body) {
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

            const scscore = $('.desktop').text().trim().split('\n')[0];
            const mcscore = $('.desktop').text().trim().split('\n')[3];
            let tabledata = $('.system-table').text();
            tabledata = tabledata.split('\n').filter(item => item);
            // console.log('tabledata', tabledata);
            const name = tabledata[1];
            const modelid = tabledata[3];
            const cpu = tabledata[5];
            const cpufreq = tabledata[7];
            const numcpus = tabledata[9];
            const cpucores = tabledata[11];
            const cputhreads = tabledata[13];
            obj = { mcscore, scscore, name, modelid, cpu, cpufreq, numcpus, cpucores, cputhreads };
            resolve(obj);
        });
    });
}

async function main() {
    let data = await getData(url); //566 entries
    let specs = [];
    console.log('len',data.length);
    data = data.slice(250, 567); // Due to the fact that the website has a limit of the number of requests it can make, we are only going to make 2 requests.
    console.log(data);
    for (const item of data) {
        specs.push(await getSpecs(item));
        console.log('len',specs.length)
    }
    console.log(specs);


    // Iterate through result of main and push the data into a csv
    const csvWriter = createCsvWriter({
        path: 'data.csv',
        header: [
            {id: 'mcscore', title: 'mcscore'},
            {id: 'scscore', title: 'scscore'},
            {id: 'name', title: 'name'},
            {id: 'modelid', title: 'modelid'},
            {id: 'cpu', title: 'cpu'},
            {id: 'cpufreq', title: 'cpufreq'},
            {id: 'numcpus', title: 'numcpus'},
            {id: 'cpucores', title: 'cpucores'},
            {id: 'cputhreads', title: 'cputhreads'},
        ]
    });

    await csvWriter.writeRecords(specs)       // returns a promise
}

main();