$( document ).ready(function() {
    setHeader();
	getManager();
});

function setHeader(){
	var loginDiv = document.getElementById('loginDiv');
	var logoutDiv = document.getElementById('logoutDiv');

	let cookie = getCookie("userCookie");

	if(cookie != null){
		loginDiv.style.display = "none"
		logoutDiv.style.display = "block"
	} else {
		loginDiv.style.display = "block"
		logoutDiv.style.display = "none"
	}
}

function getManager(){
	let cookie = getCookie("userCookie");
	let path = window.location.pathname.replace("/", "");

	if(["login", "signin"].includes(path) && cookie != null){
		//alert("[" + cookie.email + "] già autenticato")
		window.history.back()
	} else if(["survey/GDPR-tools", "antimalware", "dga-detection", "cve-search/cve"].includes(path)){
        //alert("Il servizio è disponibile solo per gli utenti autenticati")
        if(cookie == null)
            location.href = "/login";
        else
            document.getElementsByClassName('crypted')[0].classList.remove('crypted');
    }
}

function setError(status, text){
	document.getElementById('errorStatus').innerHTML = status;
	document.getElementById('errorText').innerHTML = "<strong>Errore: </strong>" + text;
}

function login(em, pass){
    var status;

    let email = em == undefined ? document.getElementById('email').value : em;
    let password = pass == undefined ? document.getElementById('password').value : pass;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {

        if(status == 200){
            setCookie("userCookie", { token: data.token, email: data.email, name: data.name, surname: data.surname, id: data.id, role: data.role, organization: data.organization, province: data.province})
            location.href = "/";
        }
        else{
            alert("Credenziali errate")
        }

        return;
    })
    .catch( error => console.error(error) )
}

function signin(){
    var status;
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var organization = document.getElementById("organization").value;
    var province = document.getElementById("province").value;

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, surname: surname, email: email, password: password, organization: organization, province: province })
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {

        if(status == 200){
            login(email, password)
            alert("Utente creato correttamente")
        }
        else if(status == 409)
            alert("Utente già esistente")
        else if(status == 400)
            alert("Dati mancanti o errati")
        return;
    })
    .catch( error => console.error(error))
}

function logout(){
    var status;
    if(getCookie("userCookie") == null) return;

    fetch('/api/logout?token='+getCookie("userCookie").token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
    .then((resp) => {status = resp.status; return resp.json() })
    .then(function(data) {

        if(status == 200){
            deleteCookie("userCookie")
            location.href = "/login";
        }else{
            alert("Errore di logout. Riprova...");
        }
        return;
    })
    .catch( error => console.error(error) )
}

function setCookie(cname, cvalue) {
    const d = new Date();
    d.setTime(d.getTime() + 24*60*60*1000); //one day
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + JSON.stringify(cvalue) + ";" + expires + ";path=/";
}

function getCookie(cname) {

    var cookieArr = document.cookie.split(";");

    for(var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");

        if(cname == cookiePair[0].trim()) {
            return JSON.parse(decodeURIComponent(cookiePair[1]));
        }
    }

    return null;
}

function deleteCookie(cname){
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}