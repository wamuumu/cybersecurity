// ------------ PROFILE SCRIPTS ------------ 

var user = {};

// ------------ UI SCRIPTS ------------ 

function reset(sectionName){
	if(sectionName != 'account'){
		document.getElementById('name').value = user.name;
		document.getElementById('surname').value = user.surname;
		document.getElementById('email').value = user.email;
		document.getElementById('organization').value = user.organization;
		document.getElementById('province').value = user.province;
	} else if (sectionName != 'security'){
		document.getElementById('old_password').value = "";
		document.getElementById('new_password').value = "";
		document.getElementById('cpassword').value = "";
	}
}

function changeSection(section){
	var sections = document.getElementsByName('section');

	for (var i = 0; i < sections.length; i++) {
		if(sections[i].classList.contains('active'))
			sections[i].classList.remove('active')
	}

	section.classList.add('active');
	let sectionName = section.getAttribute('section') || "account";

	if(sectionName == 'account'){
		document.getElementById('account-section').style.display = "block";
		document.getElementById('security-section').style.display = "none";
		document.getElementById('survey-section').style.display = "none";
	} else if(sectionName == 'security') {
		document.getElementById('account-section').style.display = "none";
		document.getElementById('security-section').style.display = "block";
		document.getElementById('survey-section').style.display = "none";
	} else if(sectionName == 'survey'){
		document.getElementById('account-section').style.display = "none";
		document.getElementById('security-section').style.display = "none";
		document.getElementById('survey-section').style.display = "block";
	}

	reset(sectionName);
}

function setProfile(){
	var cookie = getCookie('userCookie');

	if(cookie != null){
		user.id = cookie.id;
		user.name = cookie.name;
		user.surname = cookie.surname;
		user.email = cookie.email;
		user.role = cookie.role;
		user.organization = cookie.organization;
		user.province = cookie.province;
	}
	
	document.getElementById('province').value = user.province;
}

// ------------ PROFILE MANAGER SCRIPTS ------------ 

function modifyAccount(){

	var new_name = document.getElementById('name').value;
	var new_surname = document.getElementById('surname').value;
	var new_email = document.getElementById('email').value;
	var new_organization = document.getElementById('organization').value;
	var new_province = document.getElementById('province').value;

	//console.log(new_name, new_surname, new_email, new_organization, new_province)
	if(!new_name || !new_surname || !new_email || !new_organization || !new_province){
		alert("Modifica non eseguita: Campi mancanti richiesti")
		return;
	}

	if(new_name == user.name && new_surname == user.surname && new_email == user.email && new_organization == user.organization && new_province == user.province){
		alert("Modifica non eseguita: I nuovi campi sono identici a quelli precedenti")
		return;
	}

	fetch('/api/users/'+ user.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: new_name, surname: new_surname, email: new_email, role: user.role, organization: new_organization, province: new_province})
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
    	if(data.status == 200){
    		alert("Utente modificato correttamente")
    		deleteCookie("userCookie")
    		setCookie("userCookie", { email: new_email, name: new_name, surname: new_surname, id: user.id, role: user.role, organization: new_organization, province: new_province})
    		user.name = new_name;
    		user.surname = new_surname;
    		user.email = new_email;
    		user.organization = new_organization;
    		user.province = new_province;
    		document.getElementById("profileName").innerHTML = user.name + " " + user.surname;
    	}
    	else if(data.status == 500)
    		alert("Email non valida: utente già esistente")
    	else
    		alert("Errore in fase di modifica")

    	return; 
    })
    .catch( error => console.error(error) );

}

function modifyPassword(){
	var old_password = document.getElementById('old_password').value;
	var new_password = document.getElementById('new_password').value;
	var cpassword = document.getElementById('cpassword').value;

	if(!new_password || !cpassword || !old_password){
		alert("Campi mancanti richiesti")
		return;
	} else if(old_password == new_password){
		alert("Vecchia password uguale a nuova password")
		return;
	} else if(new_password != cpassword){
		alert("La nuova password non combacia con la password di conferma")
		return;
	}

	fetch('/api/users/'+ user.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldpassword: old_password, newpassword: new_password, cpassword: cpassword })
    })
    .then((resp) => { return resp.json() })
    .then(function(data) {
    	if(data.status == 200){
    		alert("Password modificata correttamente")
    		location.reload();
    	}
    	else if(data.status == 401)
    		alert("Vecchia password errata")
    	else
    		alert("Errore in fase di modifica")

    	return; 
    })
    .catch( error => console.error(error) );
}

function deleteAccount(){
    
    if(!confirm("Vuoi davvero eliminare il tuo account? Questo procedimento è irreversibile."))
    	return; 
	
	fetch('/api/users/' + user.id , { 
		method: 'DELETE' 
	})
    .then((resp) => {
        if(resp.status==200){
        	deleteCookie('userCookie');
            location.href = "/";
            return;
        }else{
            alert("Errore! Utente non eliminato");
        }
    })
    .catch( error => console.error(error) );
}