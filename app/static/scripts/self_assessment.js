var defaultConf = {}
var configuration = {}
var fileConf = {}
var surveyModel = {}
var survey = null
const categories = 8

function getFile() {
  document.getElementById("configuration").click();
}

function readFile(e){
    var file = e.target.files[0]
    if(file == undefined){
        configuration = defaultConf
        fileConf = defaultConf
        setUpSurvey()
    }
    else if(file.type == "application/json"){
        var reader = new FileReader();
        reader.onload = function(evt) { 

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

            setUpSurvey()
        };
        reader.readAsText(file);
    } else {
        alert("File invalido!")
    }
}

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

function showOption(radio){
    
    let fileContainer = document.getElementById("file-container");

    if(radio.value == "default"){
        fileContainer.style.display = "none";
        configuration = defaultConf;
        setUpSurvey()
    }
    else{
        fileContainer.style.display = "block";
        configuration = fileConf;
        setUpSurvey()
    }
}

function retrieveDefault(){

    fetch("/static/models/self-assessment/default_conf.json")
    .then(res => res.json())
    .then(out => { defaultConf = out; fileConf = defaultConf; configuration = defaultConf; })
    .catch(err => console.log(err));
}

var myCss = {
    navigation: {
        complete: "sv-btn sv-footer__complete-btn custom",
        prev: "sv-btn sv-footer__prev-btn custom",
        next: "sv-btn sv-footer__next-btn custom",
        start: "sv-btn sv-footer__start-btn custom",
        preview: "sv-btn sv-footer__preview-btn custom",
        edit: "sv-btn sv-footer__edit-btn custom",
    },
};

function setUpSurvey(){

    surveyModel = {
    "pages": [{

    }, {
        "title": "Categoria: Informazioni sull'organizzazione",
        "elements": [{
            "name": "p0f0",
            "title": "Settore:",
            "type": "radiogroup",
            "choices": [
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
            ],
            "isRequired": true
        },{
            "name": "p0f1",
            "title": "Turnover:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "<1 milione per anno" },
                { "value": 1, "text": "1-2 milioni per anno" },
                { "value": 2, "text": "2-10 milioni per anno" },
                { "value": 3, "text": "10-20 milioni per anno" },
                { "value": 4, "text": ">20 milioni per anno" }
            ],
            "isRequired": true
        }, {
            "name": "p0f2",
            "title": "Numero dipendenti:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "<5" },
                { "value": 1, "text": "5-10" },
                { "value": 2, "text": "10-20" },
                { "value": 3, "text": "20-50" },
                { "value": 4, "text": "50-250" }
            ],
            "isRequired": true
        }]
    }, {
        "title": "Categoria: Informazioni sulla rete",
        "elements": [{
            "name": "p1f0",
            "title": "La tua organizzazione possiede una rete IT?",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "No" },
                { "value": 1, "text": "Sì" },
                { "value": 2, "text": "Sì, ma la rete è condivisa con altre entità" }
            ],
            "isRequired": true
        }, {
            "name": "p1f1",
            "title": "Computer tradizionali:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "<5" },
                { "value": 1, "text": "5-10" },
                { "value": 2, "text": "10-20" },
                { "value": 3, "text": "20-50" },
                { "value": 4, "text": "50-250" },
                { "value": 5, "text": ">250" }
            ],
            "isRequired": true,
            "enableIf": "{p1f0}>0"
        }, {
            "name": "p1f2",
            "title": "Server:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "0" },
                { "value": 1, "text": "1" },
                { "value": 2, "text": "2-5" },
                { "value": 3, "text": ">5" }
            ],
            "isRequired": true,
            "enableIf": "{p1f0}>0"
        }, {
            "name": "p1f3",
            "title": "Servizi Cloud:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "0" },
                { "value": 1, "text": "1" },
                { "value": 2, "text": "2-5" },
                { "value": 3, "text": ">5" }
            ],
            "isRequired": true,
            "enableIf": "{p1f0}>0"
        }, {
            "name": "p1f4",
            "title": "Altri dispositivi elettronici connessi alla rete (Stampanti, Fax, Telefoni VoIP, etc.):",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "<5" },
                { "value": 1, "text": "5-10" },
                { "value": 2, "text": "10-20" },
                { "value": 3, "text": "20-50" },
                { "value": 4, "text": ">50" }
            ],
            "isRequired": true,
            "enableIf": "{p1f0}>0"
        }]
    }, {
        "title": "Categoria: Informazioni sulle risorse dati",
        "elements": [{
            "type": "html",
            "name": "p2info",
            "html": "<p>Quali dei seguenti dati sono memorizzati dalla vostra azienda (sono consentite risposte multiple):</p>"
        }, {
            "name": "p2f0",
            "title": "Informazioni del cliente:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "Informazioni finanziarie" },
                { "value": 1, "text": "Informazioni personali identificabili" },
                { "value": 2, "text": "Informazioni sanitarie personali" }
            ],
            "isRequired": true
        }, {
            "name": "p2f1",
            "title": "Informazioni di altre aziende partner:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "Informazioni sui clienti del partner" },
                { "value": 1, "text": "Informazioni sulle transazioni" },
                { "value": 2, "text": "Know-how" },
                { "value": 3, "text": "Record finanziari" }
            ],
            "isRequired": true
        }, {
            "name": "p2f2",
            "title": "Informazioni dell’azienda:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "Media" },
                { "value": 1, "text": "Audit e Log" },
                { "value": 2, "text": "Informazioni su transazioni" },
                { "value": 3, "text": "Know-how" },
                { "value": 4, "text": "Dati operativi" },
                { "value": 5, "text": "Informazioni finanziarie" }
            ],
            "isRequired": true
        }]
    }, {
        "title": "Categoria: Protezione informatica - Management",
        "elements": [{
            "type": "html",
            "name": "p3first",
            "html": "<h1>Politiche</h1>"
        }, {
            "name": "p3f0",
            "title": " La sua azienda ha formalmente definito delle politiche di sicurezza:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Sì, tutti i dipendenti hanno familiarità con esse e lo staff responsabile assicura che vengano seguiti" },
                { "value": 1, "text": "Sì, tutti i dipendenti ne sono a conoscenza (almeno all'inizio del loro impiego)" },
                { "value": 2, "text": "Sì, le politiche sono definite e il personale responsabile è a conoscenza di esse" },
                { "value": 3, "text": "No" }
            ],
            "isRequired": true
        }, {
            "name": "p3f1",
            "title": "Politiche sui dispositivi mobili:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Solo i dispositivi mobili dell’azienda (configurati e gestiti dal personale IT interno) possono connettersi alla rete aziendale" },
                { "value": 1, "text": "Tutti i dispositivi mobili sono obbligati a soddisfare le politiche dell'azienda" },
                { "value": 2, "text": "I dispositivi mobili possono connettersi liberamente alla rete, presupponendo che vengano fornite le credenziali corrette" }
            ],
            "isRequired": true
        }, {
            "type": "html",
            "name": "p3second",
            "html": "<h1>Azienda</h1>"
        }, {
            "name": "p3f2",
            "title": "La sua azienda ha una persona ufficialmente responsabile della sicurezza informatica (colui/colei che distribuisce il budget per la sicurezza informatica, stabilisce gli obiettivi strategici e definisce le politiche di sicurezza, ecc.):",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Un’organizzazione per la gestione IT" },
                { "value": 1, "text": "Il nostro amministratore IT" },
                { "value": 2, "text": "Un responsabile dedicato alla sicurezza informatica" },
                { "value": 3, "text": "Un amministratore condiviso nell’area IT" },
                { "value": 4, "text": "Uno o più dipendenti che si occupano anche dell’aspetto di sicurezza informatica" },
                { "value": 5, "text": "No" }
            ],
            "isRequired": true
        }]
    }, {
        "title": "Categoria: Protezione Informatica - Domande non tecniche",
        "elements": [{
            "type": "html",
            "name": "p4first",
            "html": "<h1>Risorse Umane</h1>"
        }, {
            "name": "p4f0",
            "title": "Qual è il livello di consapevolezza da parte dei suoi dipendenti della sicurezza informatica nella sua azienda:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "Vengono effettuate corsi di formazione sulla sicurezza informatica da una ditta esterna" },
                { "value": 1, "text": "Vengono effettuate attività speciali di formazione sulla sicurezza informatica organizzate dall'azienda" },
                { "value": 2, "text": "I dipendenti leggono (e firmano un documento speciale) sulle politiche di sicurezza informatica" }
            ],
            "isRequired": true,
            "hasNone": true,
            "noneText": "Nessuna delle precedenti"
        }, {
            "type": "html",
            "name": "p4second",
            "html": "<h1>Gestione Delle Risorse</h1>"
        }, {
            "name": "p4f1",
            "title": "Quali beni sono inclusi in un inventario mantenuto dalla sua azienda:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "Dati" },
                { "value": 1, "text": "Servizi (ad es. Cloud, social network, siti Web, email, ecc.)" },
                { "value": 2, "text": "Software" },
                { "value": 3, "text": "Dispositivi mobili" },
                { "value": 4, "text": "Dispositivi fisici (workstation, server, router, ecc.)" }
            ],
            "isRequired": true,
            "hasNone": true,
            "noneText": "Nessuna delle precedenti"
        }, {
            "type": "html",
            "name": "p4third",
            "html": "<h1>Protezione Fisica</h1>"
        }, {
            "name": "p4f2",
            "title": "In che modo l'accesso fisico ai locali dell’azienda è protetto e controllato:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "La stanza del server è bloccata e solo il personale responsabile ha accesso ad essa" },
                { "value": 1, "text": "Uffici. L'accesso agli uffici principali è severamente vietato ai visitatori esterni se nessuno dei presenti è all'interno" },
                { "value": 2, "text": "Perimetro. L'accesso all'area è sorvegliato dall'addetto alla reception" },
                { "value": 3, "text": "L'accesso di visitatori esterni non è monitorato" }
            ],
            "isRequired": true
        }, {
            "type": "html",
            "name": "p4fourth",
            "html": "<h1>Conformità</h1>"
        }, {
            "name": "p4f3",
            "title": "L'organizzazione ha un certificato di sicurezza informatica:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "(N)CSF" },
                { "value": 1, "text": "ISO 2700X" },
                { "value": 2, "text": "Cobit" },
                { "value": 3, "text": "Altro" }
            ],
            "isRequired": true,
            "hasNone": true,
            "noneText": "Nessuna delle precedenti"
        }]
    }, {
        "title": "Categoria: Protezione Informatica - Access control",
        "elements": [{
            "name": "p5f0",
            "title": "Gestione delle password:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Sì" },
                { "value": 1, "text": "No" }
            ],
            "isRequired": true
        }, {
            "name": "p5f1",
            "title": "Politiche di gestione della password e dell'identità:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Altri metodi di autenticazione, oltre al semplice login-password, sono in uso (come le smart card, la biometria, ecc.)" },
                { "value": 1, "text": "L'autorizzazione a multi-fattori viene applicata" },
                { "value": 2, "text": "Le password vengono emesse esclusivamente dal software personale di gestione delle password" },
                { "value": 3, "text": "Le password possono essere selezionate dai dipendenti, ma controllate e devono soddisfare i requisiti interni" },
                { "value": 4, "text": "Le password possono essere selezionate dai dipendenti, senza ulteriori controlli sulla sicurezza della password" }
            ],
            "isRequired": true,
            "enableIf": "{p5f0}=0"
        }, {
            "name": "p5f2",
            "title": "Qual è la procedura per garantire l'accesso alle risorse informative:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Esiste una procedura formale per garantire l'accesso e la revoca al dipendente" },
                { "value": 1, "text": "L'accesso è concesso per quanto riguarda il lavoro svolto dal dipendente e solo per quello" },
                { "value": 2, "text": "Non esiste una procedura particolare. L'accesso è concesso quando è necessario" }
            ],
            "isRequired": true,
            "enableIf": "{p5f0}=0"
        }]
    }, {
        "title": "Categoria: Protezione Informatica - Domande tecniche",
        "elements": [{
            "type": "html",
            "name": "p6first",
            "html": "<h1>Sicurezza Delle Comunicazioni</h1>"
        }, {
            "name": "p6f0",
            "title": "Come viene protetto l'accesso remoto alle risorse informative:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Non è consentito l'accesso remoto" },
                { "value": 1, "text": "Questo è gestito direttamente dall'amministratore IT" },
                { "value": 2, "text": "I dati vengono crittografati con un protocollo di sicurezza (HTTPS, TLS, SSL, ecc.) o inviati tramite una VPN" },
                { "value": 3, "text": "I dati inviati non vengono criptati" }
            ],
            "isRequired": true
        }, {
            "type": "html",
            "name": "p6second",
            "html": "<h1>Protezione Del Sistema</h1>"
        }, {
            "name": "p6f1",
            "title": "Quali meccanismi di protezione sono installati:",
            "type": "checkbox",
            "choices": [
                { "value": 0, "text": "Protezione da malware (ad es. antivirus)" },
                { "value": 1, "text": "Protezione della rete (ad es. firewall)" },
                { "value": 2, "text": "Backup regolare" },
                { "value": 3, "text": "Registrazione degli eventi" },
                { "value": 4, "text": "Crittografia dei dati (per le principali risorse informative)" },
                { "value": 5, "text": "Scansione periodica delle vulnerabilità" },
                { "value": 6, "text": "Analisi degli eventi informatici (anche esternalizzati)" }
            ],
            "isRequired": true
        }, {
            "name": "p6f2",
            "title": "Con quale frequenza aggiorni i tuoi sistemi (inclusi sistemi operativi, servizi Web, browser, database, ecc.):",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Gli aggiornamenti vengono eseguiti automaticamente utilizzando le regole predefinite del software" },
                { "value": 1, "text": "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni settimana" },
                { "value": 2, "text": "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni un mese" },
                { "value": 3, "text": "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni 3 mesi" },
                { "value": 4, "text": "Gli aggiornamenti vengono applicati in base alle politiche di sicurezza informatica, ma non meno di ogni 6 mesi" },
                { "value": 5, "text": "Non c'è controllo sugli aggiornamenti. Gli aggiornamenti automatici potrebbero essere disabilitati" }
            ],
            "isRequired": true
        }, {
            "name": "p6f3",
            "title": "Hai mai superato un controllo di sicurezza informatica:",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Si" },
                { "value": 1, "text": "Si, come parte di altri audit" },
                { "value": 2, "text": "No" }
            ],
            "isRequired": true
        }, {
            "type": "html",
            "name": "p6third",
            "html": "<h1>Risposta Agli Incidenti Informatici</h1>"
        }, {
            "name": "p6f4",
            "title": "L'organizzazione ha una serie di azioni prescritte e un elenco di possibili punti di contatto (ad es. esperti di sicurezza informatica) nel caso si verificasse un incidente di sicurezza informatica?",
            "type": "radiogroup",
            "choices": [
                { "value": 0, "text": "Si" },
                { "value": 1, "text": "No" }
            ],
            "isRequired": true
        }]
    }, {
        "title": "Categoria: Attacchi",
        "elements": [{
            "type": "html",
            "name": "p7first",
            "html": "<p>Quali e quanti incidenti informatici la sua azienda ha riscontrato nell'ultimo anno(numero):</p>"
        }, {
            "name": "p7f0",
            "title": "Malware o Mobile malware:",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            "name": "p7f1",
            "title": "Ransomware:",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            "name": "p7f2",
            "title": "Phishing:",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            "name": "p7f3",
            "title": "Cyber Fraud (denaro rubato):",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            "name": "p7f4",
            "title": "DDoS",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            "name": "p7f5",
            "title": "Spam o Botnet",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }, {
            "name": "p7f6",
            "title": "Toolkit (Rootkit, Metaexploit)",
            "type": "text",
            "inputType": "number",
            "min": 0,
            "isRequired": true,
            "validators": [
                {
                    "type": "regex",
                    "text": "Inserisci un numero intero",
                    "regex": "^[0-9]*$"
                }
            ]
        }]
    }],
    "firstPageIsStarted": true,
    "startSurveyText": "Avvia il quesitonario - " + configuration['name'],
    "showQuestionNumbers": "off",
    "pageNextText": "Avanti",
    "pagePrevText": "Indietro",
    "completeText": "Invia",
    "showCompletedPage": false,
    "requiredText": "",
    "showProgressBar": "bottom"
    }

    survey = new Survey.Model(surveyModel);
    survey.css = myCss;

    survey.onStarted.add(uiManager);
    survey.onComplete.add(surveyComplete);

    $("#surveyContainer").Survey({ model: survey });
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
                        json[key] = Math.pow(sectorMultiplier * configuration[category][question]['probability'] * configuration[category][question]['impact'], 1 / json[key])
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
            mean += parseFloat(parse[i]);
            html_results = html_results.replace("{result_"+ (i+1) +"}", parse[i]);
        }
        mean = (mean / categories).toFixed(2);
        html_results = html_results.replace("{mean}", mean);
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
    for (var i = 0; i < scores.length; i++)
        if(scores[i] > maxVal)
            scores[i] = maxVal

    for (var i = 0; i < sectors.length; i++)
        if(sectors[i].value == sec){
            sec = sectors[i].text + " (rischio del " + (sectors[i].value * 100) + "%)"
            break;
        }

    document.getElementById('lastID').innerHTML = last._id
    document.getElementById('lastDate').innerHTML = last.date
    document.getElementById('lastSector').innerHTML = sec
    document.getElementById('maxRisk').innerHTML = maxVal + "%"

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

$(function() {
    type = "SELF_ASSESSMENT";

    retrieveDefault();

    var check = function(){

        if(!isEmpty(configuration)) {
            let isValid = checkConfiguration(configuration)

            if(isValid){
                setUpSurvey()
                return
            }
        }
        else console.log("Waiting for configuration...");
        setTimeout(check, 1000);
    }

    check();
});