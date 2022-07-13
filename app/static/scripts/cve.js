var totalEntries = 0;
var upperBound = 0;
var allControls;

function setCommon(entries) { 
	totalEntries = entries; 
	allControls = document.getElementById('controls').children;

	var toggle = true;

	$("#toggleFilters").click(function() {
		$("#filters").slideToggle(250, function() {
			/*if(toggle){
				$("#toggleFilters").html('Nascondi filtri');
				toggle = false;
			} else {
				$("#toggleFilters").html('Mostra filtri');
				toggle = true;
			}*/
		});
	});
}

function showOption(e){
	let val = e.target.value;
	let startDate = document.getElementById('startDate');
	let endDate = document.getElementById('endDate');
	let cvssV = document.getElementById('score');

	switch(val){
		case "AT":
			startDate.disabled = true;
			endDate.disabled = true;
			startDate.value = '';
			endDate.value = '';
			break;

		case "from":
			startDate.disabled = false;
			endDate.disabled = true;
			break;

		case "until":
			startDate.disabled = true;
			endDate.disabled = false;
			break;

		case "between": 
		case "outside":
			startDate.disabled = false;
			endDate.disabled = false;
			break;

		case "AC":
			cvssV.disabled = true;
			cvssV.value = '0';
			break;

		case "above":
		case "equals":
		case "below":
			cvssV.disabled = false;
			break;
	}
}

async function getCVE(skipValue){
    let skip = skipValue || 0;
    let limit = parseInt(document.getElementById('entries').value) || 50;

    let filter = document.getElementById('enableFilter');

	upperBound = Math.ceil(totalEntries / limit); 

    console.log(skip, limit, upperBound, totalEntries)

    if(skip >= 0 && skip + 1 <= upperBound){

    	Array.from(allControls).forEach(button => {
		    button.disabled = true;
		});

		document.getElementById('entries').disabled = true;
		document.getElementById('filterSearch').disabled = true;

	    var result = {}, filters = {};
	    var url = '/api/cve-search/cve';

		if(filter.checked)
		    filters = {
		    	limit: limit,
		    	skip: skip,
		    	timetype: document.getElementById('timeType_selector').value,
		    	time: document.getElementById('timeT_selector').value == "AT" ? "" : document.getElementById('timeT_selector').value,
		    	start: parseDate(document.getElementById('startDate').value), 
		    	end: parseDate(document.getElementById('endDate').value), 
		    	version: document.getElementById('cvss_selector').value,
		    	cvsstype: document.getElementById('timeC_selector').value == "AC" ? "" : document.getElementById('timeC_selector').value,
		    	score: document.getElementById('timeC_selector').value == "AC" ? "" : document.getElementById('score').value,
		    	rejected: document.getElementById('rejected_selector').value
		    }
		else
			filters = {
				limit: limit,
		    	skip: skip
			}

	    document.getElementById('loading').style.display='block'

	    await fetch(url, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(filters)
	    })
	    .then((resp) => { return resp.json() })
	    .then(function(data){
	    	result = data
	    	totalEntries = data.data.total
	    	upperBound = Math.ceil(totalEntries / limit); 
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
			document.getElementById('filterSearch').disabled = false;

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

	let limit = parseInt(document.getElementById('entries').value) || 50;
	let end = (parseInt(document.getElementById('page').value) + 1) * limit;
	if(end > totalEntries)
		end = totalEntries;

	control1.style.display = 'none'
	control2.style.display = 'none'
	control3.style.display = 'none'
	control4.style.display = 'none'
	control5.style.display = 'none'
	control6.style.display = 'none'

	if (totalEntries > limit){
		control1.style.display = 'block'

		if(page < 4 || upperBound <= 6){
			control1.textContent = "2";
			control1.onclick = function(){
				getCVE(1);
			};
		} else {
			control1.textContent = "..."
			control1.onclick = ""
		}
	} 

	if (totalEntries > limit * 2){
		control2.style.display = 'block'

		if(page < 4 || upperBound <= 6){
			control2.textContent = "3";
			control2.onclick = function(){
				getCVE(2);
			};
		} else if(page >= 4 && page <= upperBound - 4){
			control2.textContent = page;
			control2.onclick = function(){
				getCVE(page - 1)
			};
		} else {
			control2.textContent = upperBound - 4;
			control2.onclick = function(){
				getCVE(upperBound - 5);
			};
		}
	}

	if (totalEntries > limit * 3){
		control3.style.display = 'block'

		if(page < 4  || upperBound <= 6){
			control3.textContent = "4";
			control3.onclick = function(){
				getCVE(3);
			};
		} else if(page >= 4 && page <= upperBound - 4){
			control3.textContent = page + 1;
			control3.classList.add('active')
			control3.onclick = function(){
				getCVE(page);
			};
			currentControl = control3;
		} else {
			control3.textContent = upperBound - 3;
			control3.onclick = function(){
				getCVE(upperBound - 4);
			};
		}
	}

	if (totalEntries > limit * 4){
		control4.style.display = 'block'

		if(page < 4  || upperBound <= 6){
			control4.textContent = "5";
			control4.onclick = function(){
				getCVE(4);
			};
		} else if(page >= 4 && page <= upperBound - 4){
			control4.textContent = page + 2;
			control4.onclick = function(){
				getCVE(page + 1);
			};
		} else {
			control4.textContent = upperBound - 2;
			control4.onclick = function(){
				getCVE(upperBound - 3);
			};
		}
	} 

	if (totalEntries > limit * 5){
		control5.style.display = 'block'

		if(upperBound <= 6){
			control5.textContent = upperBound;
			control5.onclick = function(){
				getCVE(upperBound - 1);
			};
		} else if(page > upperBound - 4){
			control5.textContent = upperBound - 1;
			control5.onclick = function(){
				getCVE(upperBound - 2);
			};
		} else {
			control5.textContent = "...";
			control5.onclick = ""
		}
	}

	if(totalEntries > limit * 6){
		control6.style.display = 'block'
		control6.textContent = upperBound;
		control6.onclick = function(){
			getCVE(upperBound-1);
		};
	}

	var currentControl;
	if(page < 4 || upperBound <= 6)		
		currentControl = document.getElementById('control'+ (page % 7))
	else if (page >= 4 && page <= upperBound - 4)
		currentControl = control3
	else
		currentControl = document.getElementById('control'+ (7 - (upperBound - page) % 7))

	currentControl.classList.add('active');

	document.getElementById('end').textContent = end;
	document.getElementById('start').textContent = 1 + (page * limit);
	document.getElementById('total').textContent = totalEntries;
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

function parseDate(date){
	if(date != undefined && date != "" && date != null){
		var dateArr = date.split("-");
		return dateArr[2] + "-" + dateArr[1] + "-" + dateArr[0];
	} else return ""
}
