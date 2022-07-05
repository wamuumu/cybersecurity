var totalEntries = 0;
var upperBound = 0;
var allControls;

function setCommon(entries) { 
	totalEntries = entries; 
	allControls = document.getElementById('controls').children;
}

async function getCVE(skipValue){
    let skip = skipValue || 0;
    let limit = parseInt(document.getElementById('entries').value) || 50;

	upperBound = Math.ceil(totalEntries / limit) - 1; 

    console.log(skip, limit, upperBound, totalEntries)

    if(skip >= 0 && skip <= upperBound){

    	Array.from(allControls).forEach(button => {
		    button.disabled = true;
		});

		document.getElementById('entries').disabled = true;

	    var result = {};
	    let url = '/api/cve-search/cve?skip=' + skip + '&limit=' + limit;

	    document.getElementById('loading').style.display='block'

	    await fetch(url, {
	        method: 'GET'
	    })
	    .then((resp) => { return resp.json() })
	    .then(function(data){
	    	result = data
	    })
	    .catch( error => console.error(error) );

		if(result.status == 200){
			var tableBody = document.getElementById('cve-table').getElementsByTagName('tbody')[0];

			removeRows(tableBody)

			var page = document.getElementById('page');
			page.value = skip;

			setControls(skip)

			let entries = result.data.results;

			console.log("Entries loaded: " + entries.length)

			for (var i = 0; i < entries.length; i++){
				addRows(tableBody, entries[i], i+1, skip);
			}
			document.getElementById('loading').style.display='none'

			Array.from(allControls).forEach(button => {
		    	button.disabled = false;
			});

			document.getElementById('entries').disabled = false;

		} else {
			alert("Errore")
		}
	} else {
		console.error("Index out of bound")
	}
}

function setControls(page){
	//console.log("Current skip: " + page);

	var controls = document.getElementsByName('controls');

	for (var i = 0; i < controls.length; i++) {
		if(controls[i].classList.contains('active'))
			controls[i].classList.remove('active')
	}

	var control1 = document.getElementById('control1');
	var control2 = document.getElementById('control2');
	var control3 = document.getElementById('control3');
	var control4 = document.getElementById('control4');
	var control5 = document.getElementById('control5');
	var control6 = document.getElementById('control6');

	if(page >= 4 && page <= upperBound - 3) {
		control1.textContent = "..."
		control1.onclick = ""

		control2.textContent = page;
		control2.onclick = function(){
			getCVE(page - 1)
		};

		control3.textContent = page + 1;
		control3.onclick = function(){
			getCVE(page)
		};

		control3.classList.add('active')

		control4.textContent = page + 2;
		control4.onclick = function(){
			getCVE(page + 1)
		};

		control5.textContent = "...";
		control5.onclick = "";

	} else if (page > upperBound - 3) {

		control1.textContent = "..."

		control1.onclick = ""

		control2.textContent = upperBound - 3;
		control2.onclick = function(){
			getCVE(upperBound - 4)
		};

		control3.textContent = upperBound - 2;
		control3.onclick = function(){
			getCVE(upperBound - 3)
		};

		control4.textContent = upperBound - 1;
		control4.onclick = function(){
			getCVE(upperBound - 2)
		};

		control5.textContent = upperBound;
		control5.onclick = function(){
			getCVE(upperBound - 1)
		};

		for (var i = 0; i < controls.length; i++) {
			if(controls[i].id == "control"+(6 + page - upperBound))
				controls[i].classList.add('active')
		}

	} else {
		control1.textContent = "2";
		control1.onclick = function(){
			getCVE(1);
		};

		control2.textContent = "3";
		control2.onclick = function(){
			getCVE(2);
		};

		control3.textContent = "4";
		control3.onclick = function(){
			getCVE(3);
		};

		control4.textContent = "5";
		control4.onclick = function(){
			getCVE(4);
		};

		control5.textContent = "...";
		control5.onclick = "";

		for (var i = 0; i < controls.length; i++) {
			if(controls[i].id == "control"+page)
				controls[i].classList.add('active')
		}
	}

	control6.textContent = upperBound+1;
	control6.onclick = function(){
		getCVE(upperBound);
	};

	let limit = parseInt(document.getElementById('entries').value) || 50;
	let end = (parseInt(document.getElementById('page').value) + 1) * limit;
	if(end > totalEntries)
		end = totalEntries;
	document.getElementById('end').textContent = end;
	document.getElementById('start').textContent = 1 + (page * limit);
}

function removeRows(body) {
	body.innerHTML = ""
}

function addRows(table, data, index, page){ 
	var rowCount = table.rows.length;  
    var row = table.insertRow(rowCount);

    cell = row.insertCell(0);
    paragraph = document.createElement("p");
    let limit = parseInt(document.getElementById('entries').value) || 50;
    paragraph.textContent = index + (page * limit);
    cell.setAttribute('sorttable_customkey', index / 10);
 	cell.appendChild(paragraph);

 	cell = row.insertCell(1);  
 	a = document.createElement("a");
 	a.textContent = data['id'];
 	a.href = "/cve-search/cve/" + data['id'];
 	cell.appendChild(a);

 	cell = row.insertCell(2);  
 	paragraph = document.createElement("p");
 	paragraph.textContent = data['cvss'] || "";
 	cell.appendChild(paragraph);

 	cell = row.insertCell(3);  
 	paragraph = document.createElement("p");
 	paragraph.textContent = data['cvss3'] || "";
 	cell.appendChild(paragraph);

 	cell = row.insertCell(4);  
 	paragraph = document.createElement("p");
 	paragraph.textContent = data['summary'] || "";
 	cell.appendChild(paragraph);

 	cell = row.insertCell(5);  
 	paragraph = document.createElement("p");
 	paragraph.textContent = data['updated'];
 	cell.setAttribute('sorttable_customkey', sortableDate(data['updated']));
 	cell.appendChild(paragraph);

 	cell = row.insertCell(6);  
 	paragraph = document.createElement("p");
 	paragraph.textContent = data['published'];
 	cell.setAttribute('sorttable_customkey', sortableDate(data['published']));
 	cell.appendChild(paragraph);
}

function sortableDate(date){
	var dateArr = date.split("-");
	return dateArr[2] + dateArr[1] + dateArr[0];
}
