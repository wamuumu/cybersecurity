// ------------ COMMON SCRIPTS ------------ 

var close = false;

function isEmpty(obj) {
    return Object.keys(obj).length === 0 || obj == undefined;
}

const toggleResponsiveMenu = (element) => {
    const nav = document.getElementById("topnav");
    if(!close){
        close = true;
        element.innerHTML = "&times;"
    }else{
        close = false;
        element.innerHTML = '<i class="fa fa-bars"></i>'
    }
    nav.className === "topnav" ? nav.className += " responsive" : nav.className = "topnav";
};

function setError(status, text){
	document.getElementById('errorStatus').innerHTML = status;
	document.getElementById('errorText').innerHTML = "<strong>Errore: </strong>" + text;
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