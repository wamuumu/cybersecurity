Survey.StylesManager.applyTheme("modern");

const surveyModel = {
    elements: [{
        name: "FirstName",
        title: "Enter your first name:",
        type: "text"
    }, {
        name: "LastName",
        title: "Enter your last name:",
        type: "text"
    }]
};

const survey = new Survey.Model(surveyModel);

function surveyComplete(sender){
    saveSurveyResults(sender.data)
}

function saveSurveyResults(json) {

	let url = "/api/survey/gdpr";

	fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify(json)
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
    	if(data.status == 200)
    		alert("Questionario GDPR completato")
    })
    .catch( error => console.error(error) );
}

survey.onComplete.add(surveyComplete);

$(function() {
    $("#surveyContainer").Survey({ model: survey });
});