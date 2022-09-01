
function resetRadio(radioName){
	let radios = document.getElementsByName(radioName);
	for (var i = 0; i < radios.length; i++) {
		radios[i].checked = false;
	}
}

function readFile(file){
	if(checkCoefficients())
		if(file.url != ""){
			document.body.classList.toggle('loading');
			document.getElementById('resultsForm').submit();
			file.disabled = true;
			file.value = "";
		}
}

function resetDomain(e){
	e.preventDefault();
	var domain = document.getElementById('domain');
	if(checkCoefficients())
		if(domain.value != ""){
			document.body.classList.toggle('loading');
			document.getElementById('resultsForm').submit();
			domain.value = "";
		} else
			alert("Inserisci un dominio valido")
}

function checkCoefficients(){
	var coeff1 = document.getElementById('coeff1').value || 0;
	var coeff2 = document.getElementById('coeff2').value || 0;
	var coeff3 = document.getElementById('coeff3').value || 0;
	console.log((parseFloat(coeff1) + parseFloat(coeff2) + parseFloat(coeff3)).toFixed(2))

	if((parseFloat(coeff1) + parseFloat(coeff2) + parseFloat(coeff3)).toFixed(2) == 1)
		return true
	else
		alert("La somma dei coefficienti deve essere pari a 1")
	return false
}

function showOption(radio){
	
	let domainContainer = document.getElementById("domain-container");
	let fileContainer = document.getElementById("file-container");

	let sendButton = document.getElementById("send_dga");
	sendButton.disabled = false;

	if(radio.value == "domain"){
		domainContainer.style.display = "block";
		fileContainer.style.display = "none";
		sendButton.style.display = "block";
	} else {
		domainContainer.style.display = "none";
		fileContainer.style.display = "block";
		sendButton.style.display = "none";
	}
}