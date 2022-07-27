
const surveyModel = {
    pages: [{

    }, {
        title: "Categoria: Informazioni sull'organizzazione",
        elements: [{
            name: "p0f0",
            title: "Turnover:",
            type: "radiogroup",
            choices: [
                { value: 1, text: ">20 milioni per anno" },
                { value: 0.75, text: "10-20 milioni per anno" },
                { value: 0.58, text: "2-10 milioni per anno" },
                { value: 0.42, text: "1-2 milioni per anno" },
                { value: 0.25, text: "<1 milione per anno" },
            ],
            isRequired: true
        }, {
            name: "p0f1",
            title: "Numero dipendenti:",
            type: "radiogroup",
            choices: [
                { value: 1, text: "50-250" },
                { value: 0.75, text: "20-50" },
                { value: 0.58, text: "10-20" },
                { value: 0.42, text: "5-10" },
                { value: 0.25, text: "<5" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Informazioni sulla rete",
        elements: [{
            name: "p1f0",
            title: "La tua organizzazione possiede una rete IT?",
            type: "radiogroup",
            choices: [
                { value: 1, text: "Sì, ma la rete è condivisa con altre entità" },
                { value: 0.5, text: "Sì" },
                { value: 0, text: "No" },
            ],
            isRequired: true
        }, {
            name: "p1f1",
            title: "Computer tradizionali:",
            type: "radiogroup",
            choices: [
                { value: 1, text: ">250" },
                { value: 0.83, text: "50-250" },
                { value: 0.66, text: "20-50" },
                { value: 0.50, text: "10-20" },
                { value: 0.33, text: "5-10" },
                { value: 0.17, text: "<5" },
            ],
            isRequired: true,
            enableIf: "{p1f0}>0",
        }, {
            name: "p1f2",
            title: "Server:",
            type: "radiogroup",
            choices: [
                { value: 1, text: ">5" },
                { value: 0.66, text: "2-5" },
                { value: 0.33, text: "1" },
                { value: 0, text: "0" },
            ],
            isRequired: true,
            enableIf: "{p1f0}>0",
        }, {
            name: "p1f3",
            title: "Servizi Cloud:",
            type: "radiogroup",
            choices: [
                { value: 1, text: ">5" },
                { value: 0.66, text: "2-5" },
                { value: 0.33, text: "1" },
                { value: 0, text: "0" },
            ],
            isRequired: true,
            enableIf: "{p1f0}>0",
        }, {
            name: "p1f4",
            title: "Altri dispositivi elettronici connessi alla rete (Stampanti, Fax, Telefoni VoIP, etc.):",
            type: "radiogroup",
            choices: [
                { value: 1, text: ">50" },
                { value: 0.75, text: "20-50" },
                { value: 0.58, text: "10-20" },
                { value: 0.42, text: "5-10" },
                { value: 0.25, text: "<5" },
            ],
            isRequired: true,
            enableIf: "{p1f0}>0",
        }]
    }, {
        title: "Categoria: Informazioni sulle risorse dati",
        elements: [{
            type: "html",
            name: "p2info",
            html: "<p>Quali dei seguenti dati sono memorizzati dalla vostra azienda (sono consentite risposte multiple):</p>"
        }, {
            name: "p2f0",
            title: "Informazioni del cliente:",
            type: "checkbox",
            choices: [
                { value: 0.329, text: "Informazioni sanitarie personali" },
                { value: 0.330, text: "Informazioni personali identificabili" },
                { value: 0.331, text: "Informazioni finanziarie" },
            ],
            isRequired: true,
        }, {
            name: "p2f1",
            title: "Informazioni di altre aziende partner:",
            type: "checkbox",
            choices: [
                { value: 0.249, text: "Record finanziari" },
                { value: 0.250, text: "Know-how" },
                { value: 0.251, text: "Informazioni sulle transazioni" },
                { value: 0.252, text: "Informazioni sui clienti del partner" },
            ],
            isRequired: true,
        }, {
            name: "p2f2",
            title: "Informazioni dell’azienda:",
            type: "checkbox",
            choices: [
                { value: 0.1663, text: "Informazioni finanziarie" },
                { value: 0.1664, text: "Dati operativi" },
                { value: 0.1665, text: "Know-how" },
                { value: 0.1666, text: "Informazioni su transazioni" },
                { value: 0.1667, text: "Audit e Log" },
                { value: 0.1668, text: "Media" },
            ],
            isRequired: true,
        }]
    }, {
        title: "Categoria: Protezione informatica - Management",
        elements: [{
            type: "html",
            name: "p3first",
            html: "<h1>Politiche</h1>"
        }, {
            name: "p3f0",
            title: " La sua azienda ha formalmente definito delle politiche di sicurezza:",
            type: "radiogroup",
            choices: [
                { value: 0.25, text: "Sì, tutti i dipendenti hanno familiarità con esse e lo staff responsabile assicura che vengano seguiti" },
                { value: 0.5, text: "Sì, tutti i dipendenti ne sono a conoscenza (almeno all'inizio del loro impiego)" },
                { value: 0.75, text: "Sì, le politiche sono definite e il personale responsabile è a conoscenza di esse" },
                { value: 1, text: "No" },
            ],
            isRequired: true
        }, {
            name: "p3f1",
            title: "Politiche sui dispositivi mobili:",
            type: "radiogroup",
            choices: [
                { value: 0.33, text: "Solo i dispositivi mobili dell’azienda (configurati e gestiti dal personale IT interno) possono connettersi alla rete aziendale" },
                { value: 0.66, text: "Tutti i dispositivi mobili sono obbligati a soddisfare le politiche dell'azienda" },
                { value: 0.80, text: "I dispositivi mobili possono connettersi liberamente alla rete, presupponendo che vengano fornite le credenziali corrette" },
            ],
            isRequired: true
        }, {
            type: "html",
            name: "p3second",
            html: "<h1>Azienda</h1>"
        }, {
            name: "p3f2",
            title: "La sua azienda ha una persona ufficialmente responsabile della sicurezza informatica (colui/colei che distribuisce il budget per la sicurezza informatica, stabilisce gli obiettivi strategici e definisce le politiche di sicurezza, ecc.):",
            type: "radiogroup",
            choices: [
                { value: 0.25, text: "Un’organizzazione per la gestione IT" },
                { value: 0.400, text: "Il nostro amministratore IT" },
                { value: 0.401, text: "Un responsabile dedicato alla sicurezza informatica" },
                { value: 0.50, text: "Un amministratore condiviso nell’area IT" },
                { value: 0.75, text: "Uno o più dipendenti che si occupano anche dell’aspetto di sicurezza informatica" },
                { value: 1, text: "No" },
            ],
            isRequired: true
        }]
    }, {
        title: "Categoria: Protezione Informatica - Domande non techniche",
        elements: [{
            type: "html",
            name: "p4first",
            html: "<h1>Risorse Umane</h1>"
        }, {
            name: "p4f0",
            title: "Qual è il livello di consapevolezza da parte dei suoi dipendenti della sicurezza informatica nella sua azienda:",
            type: "checkbox",
            choices: [
                { value: 0.329, text: "I dipendenti leggono (e firmano un documento speciale) sulle politiche di sicurezza informatica" },
                { value: 0.330, text: "Vengono effettuate attività speciali di formazione sulla sicurezza informatica organizzate dall'azienda" },
                { value: 0.331, text: "Vengono effettuate corsi di formazione sulla sicurezza informatica da una ditta esterna" },
            ],
            isRequired: true,
            hasNone: true,
            noneText: "Nessuna delle precedenti",
        }, {
            type: "html",
            name: "p4second",
            html: "<h1>Gestione Delle Risorse</h1>"
        }, {
            name: "p4f1",
            title: "Quali beni sono inclusi in un inventario mantenuto dalla sua azienda:",
            type: "checkbox",
            choices: [
                { value: 0.198, text: "Dispositivi fisici (workstation, server, router, ecc.)" },
                { value: 0.199, text: "Dispositivi mobili" },
                { value: 0.200, text: "Software" },
                { value: 0.201, text: "Servizi (ad es. Cloud, social network, siti Web, email, ecc.)" },
                { value: 0.202, text: "Dati" },
            ],
            isRequired: true,
            hasNone: true,
            noneText: "Nessuna delle precedenti",
        }, {
            type: "html",
            name: "p4third",
            html: "<h1>Protezione Fisica</h1>"
        }, {
            name: "p4f2",
            title: "In che modo l'accesso fisico ai locali dell’azienda è protetto e controllato:",
            type: "checkbox",
            choices: [
                { value: 0.250, text: "La stanza del server è bloccata e solo il personale responsabile ha accesso ad essa" },
                { value: 0.251, text: "Uffici. L'accesso agli uffici principali è severamente vietato ai visitatori esterni se nessuno dei presenti è all'interno" },
                { value: 0.66, text: "Perimetro. L'accesso all'area è sorvegliato dall'addetto alla reception" },
                { value: 1, text: "L'accesso di visitatori esterni non è monitorato" },
            ],
            isRequired: true
        }, {
            type: "html",
            name: "p4fourth",
            html: "<h1>Conformità</h1>"
        }, {
            name: "p4f3",
            title: "L'organizzazione ha un certificato di sicurezza informatica:",
            type: "checkbox",
            choices: [
                { value: 0.250, text: "Cobit" },
                { value: 0.251, text: "ISO 2700X" },
                { value: 0.252, text: "(N)CSF" },
                { value: 0.253, text: "Altro" },
            ],
            isRequired: true,
            hasNone: true,
            noneText: "Nessuna delle precedenti",
            noneText: "Nessuna delle precedenti",
        }]
    }, {
        title: "Categoria: Protezione Informatica - Access control",
        elements: [{
            name: "p5f0",
            title: "Gestione delle password:",
            type: "radiogroup",
            choices: [
                { value: 0, text: "Sì" },
                { value: 1, text: "No" },
            ],
            isRequired: true
        }, {
            name: "p5f1",
            title: "Politiche di gestione della password e dell'identità:",
            type: "radiogroup",
            choices: [
                { value: 0.10, text: "Altri metodi di autenticazione, oltre al semplice login-password, sono in uso (come le smart card, la biometria, ecc.)" },
                { value: 0.15, text: "L'autorizzazione a multi-fattori viene applicata" },
                { value: 0.25, text: "Le password vengono emesse esclusivamente dal software personale di gestione delle password" },
                { value: 0.60, text: "Le password possono essere selezionate dai dipendenti, ma controllate e devono soddisfare i requisiti interni" },
                { value: 1, text: "Le password possono essere selezionate dai dipendenti, senza ulteriori controlli sulla sicurezza della password" },
            ],
            isRequired: true,
            enableIf: "{p5f0}=0"
        }, {
            name: "p5f2",
            title: "Qual è la procedura per garantire l'accesso alle risorse informative:",
            type: "radiogroup",
            choices: [
                { value: 0.25, text: "Esiste una procedura formale per garantire l'accesso e la revoca al dipendente" },
                { value: 0.50, text: "L'accesso è concesso per quanto riguarda il lavoro svolto dal dipendente e solo per quello" },
                { value: 1, text: "Non esiste una procedura particolare. L'accesso è concesso quando è necessario" },
            ],
            isRequired: true,
            enableIf: "{p5f0}=0"
        }]
    }, {
        title: "Categoria: Protezione Informatica - Domande techniche",
        elements: [{
            type: "html",
            name: "p6first",
            html: "<h1>Sicurezza Delle Comunicazioni</h1>"
        }, {
            name: "p6f0",
            title: "Come viene protetto l'accesso remoto alle risorse informative:",
            type: "radiogroup",
            choices: [
                { value: 0, text: "Non è consentito l'accesso remoto" },
                { value: 0.40, text: "Questo è gestito direttamente dall'amministratore IT" },
                { value: 0.41, text: "I dati vengono crittografati con un protocollo di sicurezza (HTTPS, TLS, SSL, ecc.) o inviati tramite una VPN" },
                { value: 1, text: "I dati inviati non vengono criptati" },
            ],
            isRequired: true
        }, {
            type: "html",
            name: "p6second",
            html: "<h1>Protezione Del Sistema</h1>"
        }, {
            name: "p6f1",
            title: "Quali meccanismi di protezione sono installati:",
            type: "checkbox",
            choices: [
                { value: 0.1417, text: "Protezione da malware (ad es. antivirus)" },
                { value: 0.1418, text: "Protezione della rete (ad es. firewall)" },
                { value: 0.1419, text: "Backup regolare" },
                { value: 0.1420, text: "Registrazione degli eventi" },
                { value: 0.1421, text: "Crittografia dei dati (per le principali risorse informative)" },
                { value: 0.1422, text: "Scansione periodica delle vulnerabilità" },
                { value: 0.1423, text: "Analisi degli eventi informatici (anche esternalizzati)" },
            ],
            isRequired: true,
        }, {
            name: "p6f2",
            title: "Con quale frequenza aggiorni i tuoi sistemi (inclusi sistemi operativi, servizi Web, browser, database, ecc.):",
            type: "radiogroup",
            choices: [
                { value: 0.28, text: "Gli aggiornamenti vengono eseguiti automaticamente utilizzando le regole predefinite del software" },
                { value: 0.30, text: "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni settimana" },
                { value: 0.40, text: "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni un mese" },
                { value: 0.60, text: "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni 3 mesi" },
                { value: 0.80, text: "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni 6 mesi" },
                { value: 1, text: "Non c'è controllo sugli aggiornamenti. Gli aggiornamenti automatici potrebbero essere disabilitati" },
            ],
            isRequired: true,
        }, {
            name: "p6f3",
            title: "Hai mai superato un controllo di sicurezza informatica:",
            type: "radiogroup",
            choices: [
                { value: 0.30, text: "Si" },
                { value: 0.40, text: "Si, come parte di altri audit" },
                { value: 0.80, text: "No" },
            ],
            isRequired: true,
        }, {
            type: "html",
            name: "p6third",
            html: "<h1>Risposta Agli Incidenti Informatici</h1>"
        }, {
            name: "p6f4",
            title: "L'organizzazione ha una serie di azioni prescritte e un elenco di possibili punti di contatto (ad es. esperti di sicurezza informatica) nel caso si verificasse un incidente di sicurezza informatica?",
            type: "radiogroup",
            choices: [
                { value: 0.35, text: "Si" },
                { value: 1, text: "No" },
            ],
            isRequired: true,
        }]
    }, {
        title: "Categoria: Attacchi",
        elements: [{
            type: "html",
            name: "p7first",
            html: "<p>Quali e quanti incidenti informatici la sua azienda ha riscontrato negli ultimi 3 anni (numero):</p>"
        }, {
            name: "p7f1",
            title: "Malware / Hacker:",
            type: "text",
            inputType: "number",
            min: 0,
            isRequired: true,
            validators: [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            name: "p7f2",
            title: "Ransomware:",
            type: "text",
            inputType: "number",
            min: 0,
            isRequired: true,
            validators: [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            name: "p7f3",
            title: "Phishing:",
            type: "text",
            inputType: "number",
            min: 0,
            isRequired: true,
            validators: [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            name: "p7f4",
            title: "Cyber Fraud (denaro rubato):",
            type: "text",
            inputType: "number",
            min: 0,
            isRequired: true,
            validators: [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            name: "p7f5",
            title: "Comportamento scorretto dei dipendenti:",
            type: "text",
            inputType: "number",
            min: 0,
            isRequired: true,
            validators: [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            name: "p7f6",
            title: "Numero di altri incidenti registrati:",
            type: "text",
            inputType: "number",
            min: 0,
            isRequired: true,
            validators: [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
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
        json.p4f0[0] = 1

    if(json.p4f1.includes("none"))
        json.p4f1[0] = 1

    if(json.p4f3.includes("none"))
        json.p4f3[0] = 1
    
    console.log(json)
    await saveSurveyResults(json, type)
    displayResults(json)
}

async function displayResults(json){
    var results = document.getElementById('surveyResults');

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
            mean += parseFloat(parse[i]);
            html_results = html_results.replace("{result_"+ (i+1) +"}", parse[i]);
        }
        mean = (mean / categories).toFixed(2);
        html_results = html_results.replace("{mean}", mean);
        results.innerHTML += html_results; 
    })
    .catch(function(err) {  console.log('Failed to fetch page: ', err); });

    setGauge(mean);
}

function setChart(scores){

    const data = {
        labels: [
            "Informazioni sull'organizzazione",
            'Informazioni sulla rete',
            'Informazioni sulle risorse dati',
            ['Protezione informatica', '[Management]'],
            ['Protezione Informatica', '[Domande non techniche]'],
            ['Protezione Informatica', '[Access control]'],
            ['Protezione Informatica', '[Domande techniche]'],
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
    const selfassessmetChart = new Chart(ctx, config);
}

survey.onStarted.add(uiManager);
survey.onComplete.add(surveyComplete);

$(function() {
    type = "SELF_ASSESSMENT";
    $("#surveyContainer").Survey({ model: survey });
});