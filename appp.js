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
// Corona virus data fetch for World
let covidData = "";
// const url = "https://api.covid19api.com/summary";
// https.get(url, function(response){
//     let body = "";
//     response.on("data", function(chunk){
//         body += chunk;
        
//     });

//     response.on("end", function(){
//         covidData = JSON.parse(body);
        
//     });
// });

// Corona virus lab data fetch for india
let labData = "";
const url1 = "https://api.covid19india.org/data.json";
https.get(url1, function(response){
    let body = "";
    response.on("data", function(chunk){
        body += chunk;
        
    });

    response.on("end", function(){
        labData = JSON.parse(body);
        
    });
});


// Corona virus district data fetch for states
let districtData = "";
const url2 = "https://api.covid19india.org/state_district_wise.json";
https.get(url2, function(response){
    let body = "";
    response.on("data", function(chunk){
        body += chunk;

    });

    response.on("end", function(){
        districtData = JSON.parse(body);

    });
});


appp.get("/", function(req, res){
    const url = "https://api.covid19api.com/summary";
    https.get(url, function(response){
        let body = "";
        response.on("data", function(chunk){
            body += chunk;
            
        });

        response.on("end", function(){
            covidData = JSON.parse(body);
            const fullDate = covidData.Countries[76].Date;
            let date = fullDate.slice(8, 10);
            let month = fullDate.slice(5, 7);
            let year = fullDate.slice(0,4);
            let time = fullDate.slice(11, 19);
            const confirmedCase = covidData.Countries[76].TotalConfirmed;
            const newConfirmed = covidData.Countries[76].NewConfirmed;
            const deaths = covidData.Countries[76].TotalDeaths;
            const newDeaths = covidData.Countries[76].NewDeaths;
            const recovered = covidData.Countries[76].TotalRecovered;
            const newRecovered = covidData.Countries[76].NewRecovered;
            const activeCase = confirmedCase - deaths - recovered;
            var newActiveCase = newConfirmed - newDeaths - newRecovered;
            if(newActiveCase > 0){
                newActiveCase = "+ " + newActiveCase;
            }
            else{
                newActiveCase= "- " + newActiveCase;
            }
            const recoveryRate = ((recovered / confirmedCase) * 100).toFixed(2);
            const testsDone = labData.tested[(labData.tested.length-1)].totalsamplestested;
            const newTestsDone = labData.tested[(labData.tested.length-1)].samplereportedtoday
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
    
});

appp.post("/states", function(req, res){
    const state= _.toLower(_.kebabCase(req.body.state));
    res.redirect("/states/" + state);
});

appp.get("/states/:states" ,function(req, res){
    const state= _.toLower(_.startCase(req.params.states));
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

appp.get("/about-me", function(req, res){
    res.render("about-me");
});

// appp.get("/pictures/coronavirus.PNG", function(req, res){
//     res.writeHead(200, {'Content-Type': 'image/png'});
//     res.end("/pictures/coronavirus.PNG");
// });

var port_number = (process.env.PORT || 3000);
appp.listen(port_number, function(){
    console.log("Server is running on port "+ port_number);
});