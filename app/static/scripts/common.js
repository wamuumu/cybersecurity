function setError(status, text){
	document.getElementById('errorStatus').innerHTML = status;
	document.getElementById('errorText').innerHTML = "<strong>Errore: </strong>" + text;
}