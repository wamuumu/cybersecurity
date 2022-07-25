/* ---- DGA ---- */

function resetRadio(radioName){
	let radios = document.getElementsByName(radioName);
	for (var i = 0; i < radios.length; i++) {
		radios[i].checked = false;
	}
}

function readFile(file){
	if(file.url != ""){
		document.getElementById('resultsForm').submit();
		file.disabled = true;
		file.value = "";
	}
}

function resetDomain(e){
	e.preventDefault();
	var domain = document.getElementById('domain');
	if(domain.value != ""){
		document.getElementById('resultsForm').submit();
		domain.value = "";
	} else
		alert("Inserisci un dominio valido")
}

function showOption(radio){
	
	let domainContainer = document.getElementById("domain-container");
	let fileContainer = document.getElementById("file-container");
	let algContainer = document.getElementById("alg-container");
	let button = document.getElementById('send_dga');

	let sendButton = document.getElementById("send_dga");
	sendButton.disabled = false;
	algContainer.style.display = "block";

	if(radio.value == "domain"){
		domainContainer.style.display = "block";
		fileContainer.style.display = "none";
		button.style.display = "block";
	} else {
		domainContainer.style.display = "none";
		fileContainer.style.display = "block";
		button.style.display = "none";
	}
}