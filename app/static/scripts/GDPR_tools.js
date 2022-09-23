// ------------ GDPR SURVEY SCRIPTS ------------ 

var surveyModel;
var survey;

const categories = 6;

// ------------ UI SCRIPTS ------------ 

async function surveyComplete(sender){
    console.log("survey Complete")
    await saveSurveyResults(sender.data, type)
    displayResults(sender.data)
}

async function displayResults(json){
    var results = document.getElementById('surveyResults');

    document.getElementById('cancel').style.display = 'none'; 

    var resultTable;
    let parse = parseResults(json, categories);
    var mean = 0;

    await fetch("/survey/GDPR-result", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    })
    .then(function(response) { return response.text() })
    .then(function(html_results) {
        html_results = html_results.replace("{surveyID}", surveyID);
        for (var i = 0; i < parse.length; i++){
            mean += parseFloat(parse[i]);
            html_results = html_results.replace("{result_"+ (i+1) +"}", parse[i]);
        }
        mean = (mean / categories).toFixed(2);
        html_results = html_results.replace("{mean}", mean);
        html_results = html_results.replace("{qualitative}", computeQualitativeCompliance(mean));
        results.innerHTML += html_results; 
    })
    .catch(function(err) {  console.log('Failed to fetch page: ', err); });

    setGauge(mean, 100);
}

function computeQualitativeCompliance(mean){
    if(mean <= 25)
        return "NON CONFORME"
    else if(mean > 25 && mean <= 50)
        return "LIMITATAMENTE CONFORME"
    else if(mean > 50 && mean <= 75)
        return "QUASI CONFORME"
    else
        return "CONFORME"
}

function setChart(last){

    console.log(categories)

    var scores = parseResults(JSON.parse(last.data), categories);
    console.log(scores)
    var mean = 0;
    
    for (var i = 0; i < scores.length; i++)
        mean += parseFloat(scores[i])
    mean = (mean / categories).toFixed(2);

    document.getElementById('lastID').innerHTML = last._id
    document.getElementById('lastDate').innerHTML = last.date
    document.getElementById('qualitative').innerHTML = computeQualitativeCompliance(mean) + " (" + mean + "%)"

    const data = {
        labels: [
            'Responsabilità e Conformità',
            'Precisione',
            'Integrità e Riservatezza',
            'Legalità, Equità e Trasparenza',
            ['Limitazioni delle finalità e', 'minimizzazione dei dati'],
            'Limiti di archiviazione'
        ],
        datasets: [{
            label: '',
            data: scores,
            fill: true,
            backgroundColor: 'rgb(26, 179, 148, 0.2)',
            borderColor: 'rgb(26, 179, 148)',
            pointBackgroundColor: 'rgb(26, 179, 148)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(26, 179, 148)'
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
                    max: 100,
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
    const gdprChart = new Chart(ctx, config);
}

// ------------ DEFAULT SCRIPT ------------ 

$(async function() {
    type="GDPR";

    surveyModel = await retrieveModel("/gdpr/GDPR_model.json")
    survey = new Survey.Model(surveyModel);

    survey.onStarted.add(uiManager);
    survey.onComplete.add(surveyComplete);

    $("#surveyContainer").Survey({ model: survey });
});