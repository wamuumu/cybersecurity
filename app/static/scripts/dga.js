/* ---- DGA ---- */

function resetRadio(radioName){
	let radios = document.getElementsByName(radioName);
	for (var i = 0; i < radios.length; i++) {
		radios[i].checked = false;
	}
}

function showOption(radio){
	
	let domainContainer = document.getElementById("domain-container");
	let fileContainer = document.getElementById("file-container");

	let sendButton = document.getElementById("send_dga");
	sendButton.disabled = false;

	if(radio.value == "domain"){
		domainContainer.style.display = "block";
		fileContainer.style.display = "none";
	} else {
		domainContainer.style.display = "none";
		fileContainer.style.display = "block";
	}
}