var surveyID = -1;

Survey.StylesManager.applyTheme("modern");
Survey.surveyLocalization.locales[Survey.surveyLocalization.defaultLocale].requiredError = "Campo obbligatorio";
Survey.defaultBootstrapCss.navigation.start = "start-survey";

const surveyModel = {
    pages: [{

    }, {
        title: "Categoria: Responsabilità e Conformità",
        elements: [{
            name: "p0f0",
            title: "La tua organizzazione ha considerato la necessità di nominare un responsabile della protezione dei dati (DPO)?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p0f1",
            title: "La tua organizzazione ha impostato procedure per il rilevamento e la notifica di violazioni dei dati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p0f2",
            title: "La tua organizzazione fornisce formazione GDPR ai tuoi dipendenti?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p0f3",
            title: "La tua organizzazione ha un registro per documentare le tue attività di elaborazione dei dati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p0f4",
            title: "Se la tua organizzazione esternalizza determinate attività di elaborazione dei dati, adempie agli obblighi contrattuali e di sicurezza?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p0f5",
            title: "La tua organizzazione è a conoscenza del significato di dati personali ai sensi del GDPR?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Precisione",
        elements: [{
            name: "p1f0",
            title: "La tua organizzazione concede all'interessato il diritto di accedere alle sue informazioni?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p1f1",
            title: "La tua organizzazione ha in atto politiche che garantiscono che i dati personali vengano rettificati o cancellati nel caso in cui siano imprecisi e cancellati non appena non sono pertinenti per gli scopi per i quali vengono elaborati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p1f2",
            title: "La vostra organizzazione dispone di procedure che garantiscono un pieno esercizio del diritto alla portabilità dei dati agli interessati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Integrità e Riservatezza",
        elements: [{
            name: "p2f0",
            title: "Esistono diversi livelli di accesso ai dati per posizioni diverse nella tua organizzazione?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p2f1",
            title: "La tua organizzazione dispone di un sistema di log che registra chi e quando inserisce i dati personali che elabori, li modifica, cancella o accede ad essi?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p2f2",
            title: "La tua organizzazione dispone di procedure adeguate per l'esecuzione della valutazione dell'impatto sulla privacy (PIA)?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p2f3",
            title: "La tua organizzazione adotta misure tecniche e organizzative per proteggersi da trattamento illecito, perdita accidentale e distruzione o danneggiamento dei dati personali?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p2f4",
            title: "La tua organizzazione verifica la riservatezza, l'integrità e la resilienza dei servizi e dei sistemi utilizzati per l'elaborazione dei dati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Legalità, Equità e Trasparenza",
        elements: [{
            name: "p3f0",
            title: "Le tue procedure per il backup e il ripristino dei dati sono adeguatamente documentate?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p3f1",
            title: "La tua organizzazione identifica i rischi associati al trattamento dei dati personali?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p3f2",
            title: "La tua organizzazione informa l'interessato sulla tua identità, i dettagli di contatto e i diritti dell'interessato?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Limitazioni delle finalità e minimizzazione dei dati",
        elements: [{
            name: "p4f0",
            title: "La tua organizzazione conserva ed elabora i dati solo se è assolutamente necessario per l'espletamento dei suoi compiti?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p4f1",
            title: "La tua organizzazione identifica le categorie di dati oggetto della procedura di elaborazione dei dati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p4f2",
            title: "Se la tua organizzazione elabora gli stessi dati, con il consenso come base giuridica, per più scopi, raccoglie un consenso separato per ogni scopo?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Limiti di archiviazione",
        elements: [{
            name: "p5f0",
            title: "La tua organizzazione ha determinato il periodo di conservazione dei dati?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p5f1",
            title: "La tua organizzazione ha il processo di cancellazione dei dati dell'interessato su sua richiesta?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }, {
            name: "p5f2",
            title: "La tua organizzazione rimuove in modo sicuro i dati quando non sono più necessari?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì" },
                { value: 0, text: "No" },
                { value: -1, text: "Non lo so" },
            ],
            isRequired: true
        }]
    }],
    firstPageIsStarted: true,
    startSurveyText: "Avvia il quesitonario",
    showQuestionNumbers: "off",
    pageNextText: "Avanti",
    pagePrevText: "Indietro",
    completeText: "Invia",
    showCompletedPage: false,
    requiredText: "",
    showProgressBar: "bottom"
};

const survey = new Survey.Model(surveyModel);
const categories = survey.pages.length - 1;

async function surveyComplete(sender){
    console.log("survey Complete")
    await saveSurveyResults(sender.data)
    displayResults(sender.data)
}

async function saveSurveyResults(json) {

    var data = {
        "type": "gdpr",
        "data": json
    }

	await fetch("/api/survey", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: JSON.stringify(data)
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
        console.log(data)
    	if(data.status == 200){
    		console.log("Questionario GDPR completato")
            surveyID = data.surveyID;
            console.log("SurveyID: " + surveyID);
        }
    })
    .catch( error => console.error(error) );
}

async function displayResults(json){
    var results = document.getElementById('surveyResults');

    var resultTable;
    let parse = parseResults(json);
    var mean = 0;

    await fetch("/survey/GDPR-result", {
        method: 'GET'
    })
    .then(function(response) { return response.text() })
    .then(function(html_results) {
        html_results = html_results.replace("{surveyID}", surveyID);
        for (var i = 0; i < parse.length; i++){
            mean += parseFloat(parse[i]);
            html_results = html_results.replace("{result_"+ (i+1) +"}", parse[i]);
        }
        mean = (mean / 6).toFixed(2);
        html_results = html_results.replace("{mean}", mean);
        results.innerHTML += html_results; 
    })
    .catch(function(err) {  console.log('Failed to fetch page: ', err); });

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
    text.innerHTML = mean;
    var gauge = new Donut(target).setOptions(opts); // create sexy gauge!
    gauge.maxValue = 100; // set max gauge value
    gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
    gauge.animationSpeed = 32; // set animation speed (32 is default value)
    gauge.text = mean;
    gauge.set(mean); // set actual value
}

function parseResults(json){
    var parseArr = [], count = [], isPositive = []

    for (var i = 0; i < categories; i++){
        parseArr[i] = 0;
        count[i] = 0;
        isPositive[i] = 0;
    } 

    for (const field in json) {
        var info = getFieldInfo(field);
        count[info['page']] += 1
        if(json[field] == 1)
            isPositive[info['page']] += 1
    }

    for (var i = 0; i < categories; i++) {
        parseArr[i] = ((isPositive[i] / count[i]) * 100).toFixed(2)
    }

    return parseArr;
}

function getFieldInfo(field){
    let values = field.split("f");
    values[0] = values[0].substring(1);
    return { "page" : parseInt(values[0]), "field": parseInt(values[1]) };
}

async function restoreSurvey(){
    var restoreID = document.getElementById('restoreID').value.replaceAll(/\s/g,'');

    if(!restoreID){
        alert("Inserisci un ID valido");
        return;
    }

    await fetch("/api/survey/" + restoreID, {
        method: 'GET'
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
        if(data.status == 200){
            console.log("Questionario ripristinato")
            survey.data = JSON.parse(data.survey.data);
            survey.mode = "display";
            survey.start()
        } else {
            alert("Inserisci un ID valido");
            return;
        }
    })
    .catch( error => console.error(error) );
}

survey.onStarted.add(function(){ 
    document.getElementById('description').style.display = 'none'; 
    var seps = document.getElementsByClassName('separator');
    for (var i = 0; i < seps.length; i++)
        seps[i].style.display = 'none'; 
    document.getElementById('restore').style.display = 'none'; 
    document.getElementById('chart').style.display = 'none'; 
})
survey.onComplete.add(surveyComplete);

$(function() {
    $("#surveyContainer").Survey({ model: survey });
});

function setChart(scores){
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