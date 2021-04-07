const puppeteer = require('puppeteer');
const $ = require('cheerio');
const url = 'https://github.com/govex/COVID-19/blob/master/data_tables/vaccine_data/global_data/vaccine_data_global.csv';

const getVaccine = () => {
    let date = "";
    let time = "";
    return puppeteer
    .launch({
    	headless: true,
        args: ['--no-sandbox','--disable-setuid-sandbox']
    })
    .then(browser => {
        return browser.newPage();
    })
    .then(page => {
        page.setDefaultNavigationTimeout(0);
        return page.goto(url).then(() => {
            return page.content();
        });
    })
    .then(html => {
        const country = ($('.csv-data > tbody > tr', html).text().split('\n'));
        let timeObject = $('span > relative-time', html);
        let timeString = timeObject['0'].attribs.title;
        date = timeString.slice(0, 11);
        time = timeString.slice(13, 18);
        for(let i = 0; i < country.length; i++) {
            country[i] = country[i].trim();
        }
        return country;
    })
    .then(array => {
        let data = [];
        const vaccineData = [];
        var reg = /^\d+$/;
        // console.log(array);
        for(let i = 0; i < array.length; i++) {
            if(array[i] !== '') {
                data.push(array[i]);
            }
        }
        data = data.filter(item => !reg.test(item));
        for(let i = 0; i < data.length; i = i + 6) {
            vaccineData.push({
                country: data[i],
                date: data[i + 1],
                doses_admin: data[i + 2],
                people_partially_vaccinated: data[i + 3],
                people_fully_vaccinated: data[i + 4],
            });
        }
        return(vaccineData);
    })
    .then(vaccineData => {
        let finalData = {
            countries: vaccineData,
            date,
            time
        };
        return finalData;
    })
    .catch(err => {
        console.warn(err);
    });
}

module.exports = {getVaccine};
