// ------------ SURVEY SCRIPTS ------------ 

var surveyID = -1;
var type = "";

Survey.StylesManager.applyTheme("modern");
Survey.surveyLocalization.locales[Survey.surveyLocalization.defaultLocale].requiredError = "Campo obbligatorio";
Survey.defaultBootstrapCss.navigation.start = "start-survey";

async function retrieveModel(modelName){

    var model = {}

    await fetch("/static/models" + modelName)
    .then(res => res.json())
    .then(out => model = out)
    .catch(err => console.log(err));

    return model
}

async function saveSurveyResults(json, type, configuration) {

    var data;

    if(configuration != undefined)
        data = {
            "type": type,
            "configuration": configuration,
            "data": json
        }
    else
        data = {
            "type": type,
            "data": json
        }

	await fetch("/api/survey", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data)
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
    	if(data.status == 200){
    		console.log("Questionario" + type + "completato")
            surveyID = data.surveyID;
            console.log("SurveyID: " + surveyID);
        } else {
            alert('Compilazione fallita')
            location.reload()
        }
    })
    .catch( error => console.error(error) );
}

async function restoreSurvey(){
    var restoreID = document.getElementById('restoreID').value.replaceAll(/\s/g,'');

    if(!restoreID){
        alert("Inserisci un ID valido");
        return;
    }

    let url = type == "GDPR" ? "/api/survey/gdpr/" : "/api/survey/self-assessment/";

    await fetch(url + restoreID, {
        method: 'GET'
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
        console.log(data);
        if(data.status == 200){
            console.log("Questionario ripristinato")
            survey.data = JSON.parse(data.survey.data);
            survey.mode = "display";
            survey.start()
        } else if(data.status == 401) {
            alert("Non sei autorizzato ad accedere a questionari altrui")
            return;
        } else {
            alert("Inserisci un ID valido");
            return;
        }
    })
    .catch( error => console.error(error) );
}

function parseResults(json, categories){
    var parseArr = [], count = [], sum = []

    for (var i = 0; i < categories; i++){
        parseArr[i] = 0;
        count[i] = 0;
        sum[i] = 0;
    } 

    for (const field in json) {
        var info = getFieldInfo(field);
        if(!(info['page'] == 0 && info['field'] == 0 && type == "SELF_ASSESSMENT")){
            if(Array.isArray(json[field])){
                count[info['page']] += json[field].length
                for (var i = 0; i < json[field].length; i++)
                    sum[info['page']] += parseFloat(json[field][i])
            }
            else if(json[field] != -1){
                count[info['page']] += 1
                sum[info['page']] += json[field]
            }
        }
    }

    for (var i = 0; i < categories; i++) {
        let perc = (sum[i] / count[i]) > 1 ? 1 : (sum[i] / count[i]);
        parseArr[i] = (perc * 100).toFixed(2)
    }

    return parseArr;
}

function getFieldInfo(field){
    let values = field.split("f");
    values[0] = values[0].substring(1);
    return { "page" : parseInt(values[0]), "field": parseInt(values[1]) };
}

// ------------ UI SCRIPTS ------------ 

function setGauge(mean, maxValue){

    maxValue = maxValue.toFixed(2)

    var opts = {
        angle: 0.35, // The span of the gauge arc
        lineWidth: 0.1, // The line thickness
        radiusScale: 1, // Relative radius
        pointer: {
            length: 0.6, // // Relative to gauge radius
            strokeWidth: 0.035, // The thickness
            color: '#000000' // Fill color
        },
        limitMax: false,     // If false, max value increases automatically if value > maxValue
        limitMin: false,     // If true, the min value of the gauge will be fixed
        colorStart: '#6F6EA0',   // Colors
        colorStop: '#C0C0DB',    // just experiment with them
        strokeColor: '#EEEEEE',  // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
    };
    
    var target = document.getElementById('gauge'); // your canvas element
    var text = document.getElementById('gauge-value'); // your text element
    text.innerHTML = mean + "<br>/" + maxValue;
    var gauge = new Donut(target).setOptions(opts); // create sexy gauge!
    gauge.maxValue = maxValue; // set max gauge value
    gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
    gauge.animationSpeed = 32; // set animation speed (32 is default value)
    gauge.text = mean;
    gauge.set(mean); // set actual value
}

function uiManager(){
    document.getElementById('description').style.display = 'none'; 
    document.getElementById('cancel').style.display = 'block'; 
    var seps = document.getElementsByClassName('separator');
    for (var i = 0; i < seps.length; i++)
        seps[i].style.display = 'none'; 
    document.getElementById('restore').style.display = 'none'; 
    document.getElementById('chart').style.display = 'none'; 
}