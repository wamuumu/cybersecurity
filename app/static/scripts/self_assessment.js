// ------------ RISK ASSESSMENT SCRIPTS ------------ 

var defaultConf;
var configuration;
var fileConf;

var surveyModel = {};
var survey;

const categories = 8

// ------------ CONF FILE UPLOAD SCRIPTS ------------ 

function getFile() {
  document.getElementById("configuration").click();
}

async function readFile(e){
    var file = e.target.files[0]
    if(file == undefined){
        configuration = defaultConf
        fileConf = defaultConf
        await setUpSurvey()
    }
    else if(file.type == "application/json"){
        var reader = new FileReader();
        reader.onload = async function(evt) { 

            var isValid = false
            
            try {
                fileConf = JSON.parse(evt.target.result);
                isValid = checkConfiguration(fileConf)
            } catch(e) {
                alert("Configurazione invalida - JSON malformato")
            }

            if(isValid)
                configuration = fileConf;
            else {
                document.getElementById("configuration").value = "" //reset del file
                configuration = defaultConf;
            }

            await setUpSurvey()
        };
        reader.readAsText(file);
    } else {
        alert("File invalido!")
    }
}

// ------------ CONF CHECK SCRIPTS ------------ 

async function retrieveConfiguration(){

    await fetch("/static/models/self-assessment/default_conf.json")
    .then(res => res.json())
    .then(out => { defaultConf = out; fileConf = defaultConf; configuration = defaultConf; })
    .catch(err => console.log(err));
}

function checkConfiguration(conf){
    //controllo configurazione corretta
    const max = [
        { "1": 5, "2": 5 },
        { "1": 3, "2": 6, "3": 4, "4": 4, "5": 5},
        { "1": 3, "2": 4, "3": 6},
        { "1": 4, "2": 3, "3": 6},
        { "1": 4, "2": 6, "3": 4, "4": 5},
        { "1": 2, "2": 5, "3": 3},
        { "1": 4, "2": 7, "3": 6, "4": 3, "5": 2},
        { "1": -1, "2": -1, "3": -1, "4": -1, "5": -1, "6": -1, "7": -1}
    ]

    const validCategories = ["category1", "category2", "category3", "category4", "category5", "category6", "category7", "category8"]
    var isCategoryDone = [false, false, false, false, false, false, false, false]
    var isQuestionDone = [
        [false, false],
        [false, false, false, false, false],
        [false, false, false],
        [false, false, false],
        [false, false, false, false],
        [false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false, false, false]
    ]

    var isValid = true
    var lastCat = "", lastQuest = "", lastType = ""

    for (const key in conf) {
        if(key != "name"){

            let index;

            if(!validCategories.includes(key)){
                isValid = false
                break
            }else
                index = parseInt(key[key.length-1]) - 1; 

            if(key != "category8")
                for(const question in conf[key]){

                    if(isNaN(question) || max[index][question] == undefined){
                        lastQuest = question
                        lastType = "domanda non valida"
                        isValid = false
                        break
                    } else
                        isQuestionDone[index][parseInt(question)-1] = true

                    let probArr = conf[key][question]['probability']
                    if(!Array.isArray(probArr) || (probArr.length != max[index][question] && probArr.length != 1) || !onlyNumbers(probArr)){
                        lastQuest = question
                        lastType = "probabilità errate"
                        isValid = false
                        break
                    }

                    let impArr = conf[key][question]['impact']
                    if(!Array.isArray(impArr) || (impArr.length != max[index][question] && impArr.length != 1) || !onlyNumbers(impArr)){
                        lastQuest = question
                        lastType = "impatti errati"
                        isValid = false
                        break
                    }
                }
            else
                for(const question in conf[key]){

                    if(isNaN(question) || max[index][question] == undefined){
                        lastQuest = question
                        lastType = "domanda non valida"
                        isValid = false
                        break
                    } else 
                        isQuestionDone[index][parseInt(question)-1] = true

                    if(!checkNumber(conf[key][question]['probability'])){
                        lastQuest = question
                        lastType = "probabilità errata"
                        isValid = false
                        break
                    }

                    if(!checkNumber(conf[key][question]['impact'])){
                        lastQuest = question
                        lastType = "impatto errato"
                        isValid = false
                        break
                    }
                }

            //console.log(key + " " + isValid)

            if(!isValid){
                lastCat = "categoria " + (index + 1)
                break
            } else {
                isCategoryDone[index] = true
            }
        }
    }

    if(isValid)
        for (var i = 0; i < isCategoryDone.length; i++)
            if(!isCategoryDone){
                isValid = false
                break
            }

    if(isValid)
        for (var i = 0; i < isQuestionDone.length; i++){
            for (var j = 0; j < isQuestionDone[i].length; j++) {
                if(!isQuestionDone[i][j]){
                    isValid = false
                    break
                }
            }

            if(!isValid)
                break
        }

    if(isValid && conf['name'] == "Default")
        console.log("Configurazione di default valida")
    else if(isValid && conf['name'] != "Default")
        alert("Configurazione caricata valida")
    else{
        if(lastCat != "")
            alert('Configurazione invalida su ' + lastCat + ", domanda " + lastQuest + " (" + lastType + ")")
        else
            alert("Configurazione invalida")
    }

    return isValid
}

// ------------ SURVEY SCRIPTS ------------ 

async function setUpSurvey(){
    if(isEmpty(surveyModel))
        surveyModel = await retrieveModel("/self-assessment/RISK_model.json");
    surveyModel['startSurveyText'] = "Avvia il questionario - " + configuration['name'];
    survey = new Survey.Model(surveyModel);

    var surveyStyle = {
        navigation: {
            complete: "sv-btn sv-footer__complete-btn custom",
            prev: "sv-btn sv-footer__prev-btn custom",
            next: "sv-btn sv-footer__next-btn custom",
            start: "sv-btn sv-footer__start-btn custom",
            preview: "sv-btn sv-footer__preview-btn custom",
            edit: "sv-btn sv-footer__edit-btn custom",
        },
    }

    survey.css = surveyStyle;

    survey.onStarted.add(uiManager);
    survey.onComplete.add(surveyComplete);

    $("#surveyContainer").Survey({ model: survey });
}

// ------------ COMPUTE RISK SCRIPTS ------------ 

function onlyNumbers(array) {
    for (var i = 0; i < array.length; i++) {
        if(!(typeof array[i] === 'number' && array[i] >= 0 && array[i] <= 4))
            return false
    }
    return true
}

function checkNumber(x) {
    if(typeof x == 'number' && !isNaN(x) && x >= 0 && x <= 1)
        return true
    return false
}

async function surveyComplete(sender){
    console.log("survey Complete")
    let json = sender.data;

    if(json.p1f0 == 0){
        if("p1f1" in json) delete json.p1f1
        if("p1f2" in json) delete json.p1f2
        if("p1f3" in json) delete json.p1f3
        if("p1f4" in json) delete json.p1f4
    }

    if(json.p5f0 == 1){
        if("p5f1" in json) delete json.p5f1
        if("p5f2" in json) delete json.p5f2
    }

    if(json.p4f0.includes("none"))
        json.p4f0[0] = 3

    if(json.p4f1.includes("none"))
        json.p4f1[0] = 5

    if(json.p4f3.includes("none"))
        json.p4f3[0] = 4

    await saveSurveyResults(json, type, configuration)

    json = computeRisk(json, configuration)
    
    //console.log(configuration)
    //console.log(json)

    displayResults(json)
}

function computeRisk(json, configuration){
    let sectorMultiplier = 1;
 
    // LOW [0,0.33]
    // MEDIUM [0.34, 0.66]
    // HIGH [0.67, 1]

    /*riskMatrix = [
        [LOW, LOW, LOW, MEDIUM, MEDIUM],
        [LOW, LOW, MEDIUM, MEDIUM, MEDIUM],
        [LOW, MEDIUM, MEDIUM, MEDIUM, HIGH],
        [MEDIUM, MEDIUM, MEDIUM, HIGH, HIGH],
        [MEDIUM, MEDIUM, HIGH, HIGH, HIGH]
    ]*/

    // probability * impact
    let riskMatrix = [
        [0.08, 0.17, 0.33, 0.42, 0.51],
        [0.17, 0.33, 0.42, 0.51, 0.66],
        [0.33, 0.42, 0.51, 0.66, 0.75],
        [0.42, 0.51, 0.66, 0.75, 0.88],
        [0.51, 0.66, 0.75, 0.88, 0.99]
    ]

    for (const key in json) {
        let info = getFieldInfo(key)

        if(info['page'] == 0 && info['field'] == 0)
            sectorMultiplier = json[key]
        else {
            let category = "category" + (info['page'] + 1)
            let question = info['page'] == 0 ? info['field'].toString() : (info['field'] + 1).toString()

            if(configuration[category][question]['probability'] != undefined && configuration[category][question]['impact'] != undefined){
                if(Array.isArray(json[key])){ //checkbox
                    for (var i = 0; i < json[key].length; i++){
                        id = configuration[category][question]['probability'].length == 1 ? 0 : json[key][i]
                        let prob = configuration[category][question]['probability'][id]

                        id = configuration[category][question]['impact'].length == 1 ? 0 : json[key][i]
                        let imp = configuration[category][question]['impact'][id]

                        json[key][i] = sectorMultiplier * riskMatrix[prob][imp] 
                    }
                } else{
                    if(category == "category8") //for malwares probabilities
                        json[key] = Math.pow(sectorMultiplier * configuration[category][question]['probability'] * configuration[category][question]['impact'], 1 / (json[key] + 0.5))
                    else{

                        id = configuration[category][question]['probability'].length == 1 ? 0 : json[key]
                        let prob = configuration[category][question]['probability'][id]

                        id = configuration[category][question]['impact'].length == 1 ? 0 : json[key]
                        let imp = configuration[category][question]['impact'][id]
                        
                        json[key] = sectorMultiplier * riskMatrix[prob][imp] 
                    }
                }
            }

            //console.log(key + ": " + category + " - " + question + " --> " + json[key])
        }
    }

    return json
}

function computeQualitativeRisk(mean, maxVal){

    let val = (mean / maxVal) * 100

    if(val <= 33)
        return "BASSO"
    else if(val > 33 && val <= 66)
        return "MEDIO"
    else
        return "ALTO"
}

// ------------ UI SCRIPTS ------------ 


async function showOption(radio){
    
    let fileContainer = document.getElementById("file-container");

    if(radio.value == "default"){
        fileContainer.style.display = "none";
        configuration = defaultConf;
        await setUpSurvey()
    }
    else{
        fileContainer.style.display = "block";
        configuration = fileConf;
        await setUpSurvey()
    }
}

async function displayResults(json){
    var results = document.getElementById('surveyResults');

    maxVal = json.p0f0 * 100

    var resultTable;
    let parse = parseResults(json, categories);
    var mean = 0;

    await fetch("/survey/self-assessment-result", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    })
    .then(function(response) { return response.text() })
    .then(function(html_results) {
        html_results = html_results.replace("{surveyID}", surveyID);
        for (var i = 0; i < parse.length; i++){ 
            if(parse[i] > maxVal)
                parse[i] = maxVal           
            mean += parseFloat(parse[i]);
            html_results = html_results.replace("{result_"+ (i+1) +"}", parse[i]);
        }
        mean = (mean / categories).toFixed(2);
        html_results = html_results.replace("{mean}", mean);
        html_results = html_results.replace("{qualitative}", computeQualitativeRisk(mean, maxVal));
        results.innerHTML += html_results; 
    })
    .catch(function(err) {  console.log('Failed to fetch page: ', err); });

    setGauge(mean, maxVal);
}

function setChart(last){

    const sectors = [
        { "value": 0.15, "text": "Governo / Militare / Logistica" },
        { "value": 0.14, "text": "Informazione e Comunicazione" },
        { "value": 0.130, "text": "Target multipli" },
        { "value": 0.131, "text": "Assistenza medica" },
        { "value": 0.09, "text": "Educazione" },
        { "value": 0.07, "text": "Servizi finanziari" },
        { "value": 0.039, "text": "Professionale / Scientifico / Tecnico" },
        { "value": 0.04, "text": "Vendita al dettaglio / all'ingrosso" },
        { "value": 0.041, "text": "Trasporto e Deposito" },
        { "value": 0.042, "text": "Produzione" },
        { "value": 0.029, "text": "News / Multimedia" },
        { "value": 0.030, "text": "Organizzazione" },
        { "value": 0.020, "text": "Energia e Gas" },
        { "value": 0.021, "text": "Arte / Intrattenimento" },
        { "value": 0.031, "text": "Altro" }
    ]

    let risk = computeRisk(JSON.parse(last.data), JSON.parse(last.configuration))
    let sec = JSON.parse(last.data).p0f0
    let maxVal = sec * 100

    let scores = parseResults(risk, categories);
    var mean = 0

    for (var i = 0; i < scores.length; i++){
        mean += parseFloat(scores[i])
        if(scores[i] > maxVal)
            scores[i] = maxVal
    }

    mean = (mean / categories).toFixed(2);

    for (var i = 0; i < sectors.length; i++)
        if(sectors[i].value == sec){
            sec = sectors[i].text + " (rischio del " + (sectors[i].value * 100) + "%)"
            break;
        }

    document.getElementById('lastID').innerHTML = last._id
    document.getElementById('lastDate').innerHTML = unformatDate(last.date)
    document.getElementById('lastSector').innerHTML = sec
    document.getElementById('maxRisk').innerHTML = maxVal + "%"
    document.getElementById('qualitative').innerHTML = "RISCHIO " + computeQualitativeRisk(mean, maxVal) + " (" + mean + "%)"

    const data = {
        labels: [
            "Informazioni sull'organizzazione",
            'Informazioni sulla rete',
            'Informazioni sulle risorse dati',
            ['Protezione informatica', '[Management]'],
            ['Protezione Informatica', '[Domande non tecniche]'],
            ['Protezione Informatica', '[Access control]'],
            ['Protezione Informatica', '[Domande tecniche]'],
            'Attacchi'
        ],
        datasets: [{
            label: '',
            data: scores,
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
        }] 
    }

    const config = {
        type: 'radar',
        data: data,
        options: {
            elements: {
                line: {
                    borderWidth: 3
                },
                point: {
                    radius: 7,
                    hitRadius: 7
                }
            },
            
            scales: { 
                r: {
                    pointLabels: {
                        font: {
                            size: 17
                        }
                    },

                    beginAtZero: true,
                    max: maxVal,
                    min: 0
                }
            },
            
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        font: {
                            size: 22
                        }
                    }
                }
            },
        }
    };  

    var ctx = document.getElementById("gdpr-chart").getContext('2d');
    const selfassessmetChart = new Chart(ctx, config);
}

// ------------ DEFAULT SCRIPT ------------ 

$(async function() {
    type = "SELF_ASSESSMENT";

    await retrieveConfiguration();

    let isValid = checkConfiguration(configuration)

    if(isValid)
        await setUpSurvey()
});