const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const _ = require("lodash");
let ejs = require("ejs");
const appp = express();

appp.set('view engine', 'ejs');
appp.use(bodyParser.urlencoded({extended: true}));
appp.use(express.static("public"));
require('dotenv').config({path: __dirname + '/.env'});

let covidData = "";


appp.get("/", function(req, res){
    function getData() {
        let labData = "";
        return new Promise(function (resolve, reject) {
            // Corona virus lab data fetch for india
            const url1 = "https://api.covid19india.org/data.json";
            https.get(url1, function(response1){
                let body = "";
                response1.on("data", function(chunk){
                    body += chunk;
                    // console.log(body);
                });

                response1.on("end", function(){
                    labData = JSON.parse(body);
                    resolve(labData);
                });
            });
        })
    }
    getData().then(function (labData) {
        console.log(labData);
        // Corona virus data fetch for india
        const url = "https://api.covid19api.com/summary";
        https.get(url, function(response){
            let body = "";
            response.on("data", function(chunk){
                body += chunk;
                
            });

            response.on("end", function(){
                covidData = JSON.parse(body);
                let fullDate = "";
                let date = "";
                let month = "";
                let year = "";
                let time = "";
                let confirmedCase = 0;
                let newConfirmed = 0;
                let deaths = 0;
                let newDeaths = 0;
                let recovered = 0;
                let newRecovered = 0;
                let activeCase = 0;
                let newActiveCase = 0;
                let recoveryRate = 0;
                let testsDone = 0;
                let newTestsDone = 0;
                for (let i = 0; i < covidData.Countries.length; i++) {
                    if(covidData.Countries[i].CountryCode === 'IN') {
                        fullDate = covidData.Countries[i].Date;
                        date = fullDate.slice(8, 10);
                        month = fullDate.slice(5, 7);
                        year = fullDate.slice(0,4);
                        time = fullDate.slice(11, 19);
                        confirmedCase = covidData.Countries[i].TotalConfirmed;
                        newConfirmed = covidData.Countries[i].NewConfirmed;
                        deaths = covidData.Countries[i].TotalDeaths;
                        newDeaths = covidData.Countries[i].NewDeaths;
                        recovered = covidData.Countries[i].TotalRecovered;
                        newRecovered = covidData.Countries[i].NewRecovered;
                        activeCase = confirmedCase - deaths - recovered;
                        newActiveCase = newConfirmed - newDeaths - newRecovered;
                        if(newActiveCase > 0){
                            newActiveCase = "+ " + newActiveCase;
                        }
                        recoveryRate = ((recovered / confirmedCase) * 100).toFixed(2);
                        testsDone = labData.tested[(labData.tested.length-1)].totalsamplestested;
                        newTestsDone = labData.tested[(labData.tested.length-1)].samplereportedtoday;
                        break;
                    }
                }
                res.render("home", {
                    confirmedCase: confirmedCase, 
                    newConfirmed: newConfirmed, 
                    deaths: deaths, 
                    newDeaths: newDeaths, 
                    recovered: recovered, 
                    newRecovered: newRecovered, 
                    activeCase: activeCase, 
                    newActiveCase: newActiveCase, 
                    recoveryRate: recoveryRate, 
                    date: (date + "-" + month + "-" + year), 
                    time: time, 
                    testsDone: testsDone, 
                    newTestsDone: newTestsDone
                });
            });
        });
    }).catch(err => {
        console.log(err);
    })
});

appp.post("/states", function(req, res){
    const state= _.toLower(_.kebabCase(req.body.state));
    res.redirect("/states/" + state);
});

appp.get("/states/:states" ,function(req, res){
    const state= _.toLower(_.startCase(req.params.states));
    // Corona virus data fetch for states of India
    const url = "https://api.covid19india.org/data.json";
    https.get(url, function(response){
        let body = "";
        response.on("data", function(chunk){
            body += chunk;
            
        });

        response.on("end", function(){
            let rawData = JSON.parse(body);
            let stateData = rawData.statewise;
            let confirmedData = "";
            stateData.forEach(element => {
                if(_.toLower(element.state) === state){
                    confirmedData=element;
                }
            });
            
            // console.log(stateData);
            if(state === "selectcard"){
                res.redirect("/#updates");
            }
            else{
                let fullDate = confirmedData.lastupdatedtime;
                let date = fullDate.slice(0, 2);
                let month = fullDate.slice(3, 5);
                let year = fullDate.slice(6,10);
                let time = fullDate.slice(11, 19);
                let finalDate = date + "-" + month + "-" + year;
                const recoveryRate = ((confirmedData.recovered / confirmedData.confirmed) * 100).toFixed(2);
                res.render("states", {
                    stateData: confirmedData,
                    finalDate: finalDate,
                    time: time,
                    recoveryRate: recoveryRate
                });
            }
            
        });
    });
});

appp.get("/news", function(req, res){
    const url3 = "https://newsapi.org/v2/top-headlines?language=en&q=corona&q=coronavirus&q=covid19&apiKey=" + process.env.API_KEY + "";
    https.get(url3, function(response){
        let body = "";
        response.on("data", function(chunk){
            body += chunk;

        });

        response.on("end", function(){
            const newsData = JSON.parse(body);
            res.render("news", {
                newsData: newsData.articles
            });

        });
    });
});

// ------------------------GET REQUEST FOR THE WORLD UPDATES

appp.get("/world", function(req, res){
    const url = "https://api.covid19api.com/summary";
    https.get(url, function(response){
        let body = "";
        response.on("data", function(chunk){
            body += chunk;
            
        });
        response.on("end", function(){
            covidData = JSON.parse(body);
            const fullDate = covidData.Date;
            let date = fullDate.slice(8, 10);
            let month = fullDate.slice(5, 7);
            let year = fullDate.slice(0,4);
            let time = fullDate.slice(11, 19);
            res.render("world", {
                covidData: covidData.Countries, 
                worldUpdate: covidData.Global,
                date: (date + "-" + month + "-" + year), 
                time: time
            });
        });
    });
});

appp.get("/about-me", function(req, res){
    res.render("about-me");
});


var port_number = (process.env.PORT || 3000);
appp.listen(port_number, function(){
    console.log("Server is running on port "+ port_number);
});
