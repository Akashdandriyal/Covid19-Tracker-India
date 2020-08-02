const express= require("express");
const https= require("https");
const bodyParser= require("body-parser");
let ejs = require("ejs");
const app= express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res){
    res.render("home");  
    
    const url= "https://api.covid19api.com/summary";
    https.get(url,(res) => {
        let body = "";
        
        res.on("data", (chunk) => {
            body += chunk;
        });
    
        res.on("end", () => {
            try {
               const covidData = JSON.parse(body);
                // do something with JSON
                const newConfirmed=covidData.Countries[76].NewConfirmed;
                const totalConfirmed=covidData.Countries[76].TotalConfirmed;
                const newDeaths=covidData.Countries[76].NewDeaths;
                const totalDeaths=covidData.Countries[76].TotalDeaths;
                const newRecovered=covidData.Countries[76].NewRecovered;
                const totalRecovered=covidData.Countries[76].TotalRecovered;
                const recoveryRate= (totalRecovered / totalConfirmed)* 100;
                const activeCase= totalConfirmed - totalRecovered - totalDeaths;
                console.log(newConfirmed, totalConfirmed, newDeaths, totalDeaths);
                res.write("<h1>The Covid19 updates are</h1>");
                res.write("<h3>New Cases: "+ newConfirmed + "</h3>");
                res.write("<h3>New Deaths: "+ newDeaths + "</h3>");
                res.write("<h3>New Recovered: "+ newRecovered + "</h3>");
                res.send();

            } catch (error) {
                console.error(error.message);
            };
        });
    
    }).on("error", (error) => {
        console.error(error.message);
    });
    
    
});
// app.post("/", function(req, res){
    
// });

app.listen(3000, function(){
    console.log("Server is running on port 3000");
});