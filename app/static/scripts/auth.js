// ------------ AUTH SCRIPTS ------------ 

var captchaToken;

function setCaptcha(){
    grecaptcha.render('captcha', {
      'callback' : function(res) { captchaToken = res }
    });
}

function login(em, pass){
    var status;

    if(!captchaToken){
        alert("Captcha invalido")
        return;
    }

    let email = em == undefined ? document.getElementById('email').value : em;
    let password = pass == undefined ? document.getElementById('password').value : pass;

    var details = {
        'email': email,
        'password': password,
        'captcha': captchaToken
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody
    })
    .then((resp) => { 
        status = resp.status;
        if(status == 200) 
            return resp.json();
        else{
            alert("Credenziali errate")
            return;
        }
    })
    .then(function(data) {
        if(data != undefined){
            setCookie("userCookie", { email: data.email, name: data.name, surname: data.surname, id: data.id, role: data.role, organization: data.organization, province: data.province})
            location.href = "/";
        }
    })
    .catch( error => console.error(error) )
}

function keypress(e, type){
    if(e.key == "Enter"){
        e.preventDefault();
        if(type == 'login')
            login();
        else if(type == 'signin')
            signin();
    }
}

function signin(){
    var status;
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var organization = document.getElementById("organization").value;
    var province = document.getElementById("province").value;
    var terms = document.getElementById("terms").checked;

    if(!terms){
        alert("Devi accettare i termini")
        return;
    }

    if(!captchaToken){
        alert("Captcha invalido")
        return;
    }

    fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, surname: surname, email: email, password: password, organization: organization, province: province, terms: terms, captchaToken: captchaToken })
    })
    .then((resp) => {
        status = resp.status; 
        return resp.json() 
    })
    .then(function(data) {

        if(status == 200){
            login(email, password)
            alert("Utente creato correttamente")
        }
        else if(status == 409){
            grecaptcha.reset();
            alert("Utente già esistente")
        }
        else if(status == 400){
            grecaptcha.reset();
            alert("Dati mancanti o errati")
        }
        return;
    })
    .catch( error => console.error(error))
}

function logout(){
    var status;
    if(getCookie("userCookie") == null) return;

    fetch('/api/logout', {
        method: 'POST'
    })
    .then((resp) => {
        status = resp.status; 
        return resp.json() 
    })
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