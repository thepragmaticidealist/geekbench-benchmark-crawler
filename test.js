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

            const scscore = $('.desktop').text().trim().split('\n')[0];
            const mcscore = $('.desktop').text().trim().split('\n')[3];
            let tabledata = $('.system-table').text();

            tabledata = tabledata.split('\n').filter(item => item);
            console.log('tabledata', tabledata, 'table data length',tabledata.length)
            
            let processor = tabledata[1];
            obj = { mcscore, scscore, processor };
            for (i = 2; i < tabledata.length; i++) {
                if (i%2 === 0) {
                    // Write its value as a key in obj
                    obj [(tabledata[i]).replace(/\s/g, '').toLowerCase()] = tabledata[i+1];
                }
            }
           // Loop through table data,
           console.log('obj', obj, '>>>',(Object.keys(obj)).length);
           const idealkeys = ['processor', 'frequency', 'maximumfrequency', 'cores', 'threads', 'tdp', 'gpu', 'codename', 'package'];

           if ((Object.keys(obj)).length < 11) {
               // Figure out which ones are missing
               // save missing keys and their values as ''
               for (i=0; i < idealkeys.length; i++) {
                   if (!(obj.hasOwnProperty(idealkeys[i]))) {
                        obj[idealkeys[i]] = ''
                   }
               }
           }
            resolve(obj);
        });
    });
}

async function main() {
    let data = await getData(url); //3130 entries
    let specs = [];
    console.log('len',data.length);
    data = data.slice(3120, 3144); // Due to the fact that the website has a limit of the number of requests it can make, we are only going to make 2 requests.
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
            {id: 'frequency', title: 'frequency'},
            {id: 'maximumfrequency', title: 'maximumfrequency'},
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

 
 
