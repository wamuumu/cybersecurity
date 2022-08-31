var totalEntries = 0;
var upperBound = 0;
var allControls;
var type = "cve";
var currentVendor = "";
var currentSearch = "";

function setCVE(entries) { 
	totalEntries = entries;
	lastEntries = entries; 
	allControls = document.getElementById('controls').children;

	$("#toggleFilters").click(function() {
		$("#filters").slideToggle(250);
	});
}

function setCVEDetail(){
	$(".slider").click(function () {
	    toggle($(this))
	});
}

function toggle(item) {
    if (item.height() > 200){
    	item.css('overflow-y', 'scroll')
        item.css('height', 200);
    }
    else{
    	item.css('height', 'auto')
    	item.css('overflow-y', 'hidden')
    }
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

function setMethod(){
	if(type == "cve"){
		document.getElementById('changeSearch').innerHTML = "Ricerca per venditore";
		document.getElementById('changeSearch').onclick = function(){getVendors(0);}
		if(currentSearch)
			document.getElementById('searchType').innerHTML = "<b>Tipo ricerca: </b>CVE<br><b>Valore ricerca: </b>" + currentSearch;
		else
			document.getElementById('searchType').innerHTML = "<b>Tipo ricerca: </b>CVE";
		document.getElementById('backBtn').onclick = function(){history.back()}
		document.getElementById('search').placeholder = "Ricerca CVE"
		document.getElementById('cve-filters').style.display = "block"
		document.getElementById('filterSearch').onclick = function(){getCVE(0);}
	} else if(type == "vendors") {
		document.getElementById('changeSearch').innerHTML = "Ricerca per CVE";
		document.getElementById('changeSearch').onclick = function(){getCVE(0);}
		if(currentSearch)
			document.getElementById('searchType').innerHTML = "<b>Tipo ricerca: </b>venditore<br><b>Valore ricerca: </b>" + currentSearch;
		else
			document.getElementById('searchType').innerHTML = "<b>Tipo ricerca: </b>venditore";
		document.getElementById('backBtn').onclick = function(){getCVE(0)}
		document.getElementById('search').placeholder = "Ricerca venditore"
		document.getElementById('cve-filters').style.display = "none"
		document.getElementById('filterSearch').onclick = function(){getVendors(0);}
	} else if(type == "products"){
		if(currentSearch)
			document.getElementById('searchType').innerHTML = "<b>Tipo ricerca: </b>prodotto<br><b>Valore ricerca: </b>" + currentSearch;
		else
			document.getElementById('searchType').innerHTML = "<b>Tipo ricerca: </b>prodotto";
		document.getElementById('backBtn').onclick = function(){getVendors(0)}
		document.getElementById('search').placeholder = "Ricerca prodotto di " + currentVendor
		document.getElementById('cve-filters').style.display = "none"
		document.getElementById('filterSearch').onclick = function(){getProducts(0);}
	}
}

async function getCVE(skipValue){
    let skip = skipValue || 0;
    let limit = parseInt(document.getElementById('entries').value) || 50;
    type = "cve"

    let filter = document.getElementById('enableFilter');

	upperBound = Math.ceil(totalEntries / limit); 

    console.log(skip, limit, upperBound, totalEntries)

    if(skip >= 0 && skip + 1 <= upperBound){

    	Array.from(allControls).forEach(button => {
		    button.disabled = true;
		});

		document.getElementById('entries').disabled = true;
		document.getElementById('filterSearch').disabled = true;
		document.getElementById('search').disabled = true;
		document.getElementById('changeSearch').disabled = true;

	    var cves = {}, last = {}, filters = {};
	    var url = '/api/cve-search/cve';

		if(filter.checked){
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
		    	rejected: document.getElementById('rejected_selector').value,
		    	search: document.getElementById('search').value || ""
		    }
		    
			document.getElementById('search').value = ""
		}
		else
			filters = {
				limit: limit,
		    	skip: skip,
		    	search: document.getElementById('search').value || ""
			}

		currentSearch = filters.search;

	    document.body.classList.toggle('loading');
	    var total = 0;

	    await fetch(url, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(filters)
	    })
	    .then((resp) => { return resp.json() })
	    .then(function(data){
	    	if(data.status == 200){
		    	cves = data.data.results
		    	total = data.data.total
		    }
	    })
	    .catch( error => console.error(error) );

		if(cves.length != 0){

			totalEntries = total
			upperBound = Math.ceil(totalEntries / limit);

			var tableHead = document.getElementById('cve-table').getElementsByTagName('thead')[0];
			var tableBody = document.getElementById('cve-table').getElementsByTagName('tbody')[0];

			removeRows(tableHead)
			removeRows(tableBody)

			var page = document.getElementById('page');
			page.value = skip;

			setControls(skip)

			console.log("Entries loaded: " + cves.length)

			addHead(tableHead)

			for (var i = 0; i < cves.length; i++){
				addRows(tableBody, cves[i], i+1, skip);
			}

			var table = document.getElementById('cve-table');
			sorttable.makeSortable(table)

		} else
			alert('Caricamento fallito: CVE mancanti o inesistenti')

		Array.from(allControls).forEach(button => {
	    	button.disabled = false;
		});

		document.getElementById('entries').disabled = false;
		document.getElementById('filterSearch').disabled = false;
		document.getElementById('search').disabled = false;
		document.getElementById('changeSearch').disabled = false;

		document.body.classList.toggle('loading');

		setMethod()
	} else {
		console.error("Index out of bound")
		alert('Limite raggiunto')
	}
}

async function getVendors(skipValue){

	let skip = skipValue || 0;
	let limit = parseInt(document.getElementById('entries').value) || 50;
	type = "vendors";

	let filter = document.getElementById('enableFilter');

	if(upperBound == 0 || (skip >= 0 && skip + 1 <= upperBound)){

		Array.from(allControls).forEach(button => {
		    button.disabled = true;
		});

		document.getElementById('entries').disabled = true;
		document.getElementById('filterSearch').disabled = true;
		document.getElementById('search').disabled = true;
		document.getElementById('changeSearch').disabled = true;

	    var vendors = {};
	    var url = '/api/cve-search/vendors';

	    document.body.classList.toggle('loading');

	    const filters = {
	    	limit: limit,
	    	skip: skip,
	    	search: filter.checked ? document.getElementById('search').value : ""
	    }

	    if(filter.checked)
	    	document.getElementById('search').value = ""

	    currentSearch = filters.search;
	    var total = 0

	    await fetch(url, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(filters)
	    })
	    .then((resp) => { return resp.json() })
	    .then(function(data){
	    	if(data.status == 200){
		    	vendors = data.data.vendors
	    	 	total = data.data.total
		    }
	    })
	    .catch( error => console.error(error) );

		if(vendors.length != 0){

			totalEntries = total
			upperBound = Math.ceil(totalEntries / limit);

			var tableHead = document.getElementById('cve-table').getElementsByTagName('thead')[0];
			var tableBody = document.getElementById('cve-table').getElementsByTagName('tbody')[0];

			removeRows(tableHead)
			removeRows(tableBody)

			var page = document.getElementById('page');
			page.value = skip;

			setControls(skip)

			console.log("Entries loaded: " + vendors.length)

			addHead(tableHead)

			for (var i = 0; i < vendors.length; i++){
				addRows(tableBody, vendors[i], i+1, skip);
			}

			var table = document.getElementById('cve-table');
			sorttable.makeSortable(table)

		} else
			alert('Caricamento fallito: Venditori mancanti o inesistenti')

		Array.from(allControls).forEach(button => {
	    	button.disabled = false;
		});

		document.getElementById('entries').disabled = false;
		document.getElementById('filterSearch').disabled = false;
		document.getElementById('search').disabled = false;
		document.getElementById('changeSearch').disabled = false;

		document.body.classList.toggle('loading');

		setMethod()

	} else {
		console.error("Index out of bound")
		alert('Limite raggiunto')
	}
}

async function getProducts(skipValue){

	let skip = skipValue || 0;
	let limit = parseInt(document.getElementById('entries').value) || 50;
	type = "products";

	let filter = document.getElementById('enableFilter');

	if(upperBound == 0 || (skip >= 0 && skip + 1 <= upperBound)){

		Array.from(allControls).forEach(button => {
		    button.disabled = true;
		});

		document.getElementById('entries').disabled = true;
		document.getElementById('filterSearch').disabled = true;
		document.getElementById('search').disabled = true;
		document.getElementById('changeSearch').disabled = true;

	    var products = {};
	    var url = '/api/cve-search/vendors/' + currentVendor;

	    document.body.classList.toggle('loading');

	    const filters = {
	    	limit: limit,
	    	skip: skip,
	    	search: filter.checked ? document.getElementById('search').value : ""
	    }

	    if(filter.checked)
	    	document.getElementById('search').value = ""

	    currentSearch = filters.search;
	    var total = 0

	    await fetch(url, {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify(filters)
	    })
	    .then((resp) => { return resp.json() })
	    .then(function(data){
	    	if(data.status == 200){
		    	products = data.data.products
		    	total = data.data.total
		    }
	    })
	    .catch( error => console.error(error) );

		if(!isEmpty(products)){

			totalEntries = total
			upperBound = Math.ceil(totalEntries / limit);

			var tableHead = document.getElementById('cve-table').getElementsByTagName('thead')[0];
			var tableBody = document.getElementById('cve-table').getElementsByTagName('tbody')[0];

			removeRows(tableHead)
			removeRows(tableBody)

			var page = document.getElementById('page');
			page.value = skip;

			setControls(skip)

			addHead(tableHead)

			var count = 1
			for(const key in products){
				let data = {
					product: key,
					vendor: currentVendor,
					cve: products[key]
				}
				addRows(tableBody, data, count, skip);
				count++;
			}

			var table = document.getElementById('cve-table');
			sorttable.makeSortable(table)

		} else
			alert('Caricamento fallito: Prodotti mancanti o inesistenti')

		Array.from(allControls).forEach(button => {
	    	button.disabled = false;
		});

		document.getElementById('entries').disabled = false;
		document.getElementById('filterSearch').disabled = false;
		document.getElementById('search').disabled = false;
		document.getElementById('changeSearch').disabled = false;

		document.body.classList.toggle('loading');

		setMethod()
	} else {
		console.error("Index out of bound")
		alert('Limite raggiunto')
	}
}

function isEmpty(obj) {
	return Object.keys(obj).length === 0 || obj == undefined;
}

function setControls(page){
	//console.log("Current skip: " + page);

	var controls = document.getElementsByName('controls');

	for (var i = 0; i < controls.length; i++) {
		if(controls[i].classList.contains('active'))
			controls[i].classList.remove('active')
	}

	var control0 = document.getElementById('control0');
	var control1 = document.getElementById('control1');
	var control2 = document.getElementById('control2');
	var control3 = document.getElementById('control3');
	var control4 = document.getElementById('control4');
	var control5 = document.getElementById('control5');
	var control6 = document.getElementById('control6');
	var previous = document.getElementById('previous');
	var next = document.getElementById('next');
	var entries = document.getElementById('entries');

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

	if(type == "cve"){
		control0.onclick = function(){getCVE(0);};
		previous.onclick = function(){getCVE(page - 1);}
		next.onclick = function(){getCVE(page + 1);}
		entries.onchange = function(){getCVE(0);}
	}
	else if(type == "vendors"){
		control0.onclick = function(){getVendors(0);};
		previous.onclick = function(){getVendors(page - 1)}
		next.onclick = function(){getVendors(page + 1)}
		entries.onchange = function(){getVendors(0);}
	} else if(type == "products"){
		control0.onclick = function(){getProducts(0);};
		previous.onclick = function(){getProducts(page - 1)}
		next.onclick = function(){getProducts(page + 1)}
		entries.onchange = function(){getProducts(0);}
	}

	if (totalEntries > limit){
		control1.style.display = 'block'

		if(page < 4 || upperBound <= 6){
			control1.textContent = "2";
			if(type == "cve")
				control1.onclick = function(){getCVE(1);};
			else if(type == "vendors")
				control1.onclick = function(){getVendors(1);};
			else if(type == "products")
				control1.onclick = function(){getProducts(1);};
		} else {
			control1.textContent = "..."
			control1.onclick = ""
		}
	} 

	if (totalEntries > limit * 2){
		control2.style.display = 'block'

		if(page < 4 || upperBound <= 6){
			control2.textContent = "3";
			if(type == "cve")
				control2.onclick = function(){getCVE(2);};
			else if(type == "vendors")
				control2.onclick = function(){getVendors(2);};
			else if(type == "products")
				control2.onclick = function(){getProducts(2);};
		} else if(page >= 4 && page < upperBound - 3){
			control2.textContent = page;
			if(type == "cve")
				control2.onclick = function(){getCVE(page - 1);};
			else if(type == "vendors")
				control2.onclick = function(){getVendors(page - 1);};
			else if(type == "products")
				control2.onclick = function(){getProducts(page - 1);};
		} else {
			control2.textContent = upperBound - 4;
			if(type == "cve")
				control2.onclick = function(){getCVE(upperBound - 5);};
			else if(type == "vendors")
				control2.onclick = function(){getVendors(upperBound - 5);};
			else if(type == "products")
				control2.onclick = function(){getProducts(upperBound - 5);};
		}
	}

	if (totalEntries > limit * 3){
		control3.style.display = 'block'

		if(page < 4  || upperBound <= 6){
			control3.textContent = "4";
			if(type == "cve")
				control3.onclick = function(){getCVE(3);};
			else if(type == "vendors")
				control3.onclick = function(){getVendors(3);};
			else if(type == "products")
				control3.onclick = function(){getProducts(3);};
		} else if(page >= 4 && page < upperBound - 3){
			control3.textContent = page + 1;
			control3.classList.add('active')
			if(type == "cve")
				control3.onclick = function(){getCVE(page);};
			else if(type == "vendors")
				control3.onclick = function(){getVendors(page);};
			else if(type == "products")
				control3.onclick = function(){getProducts(page);};
			currentControl = control3;
		} else {
			control3.textContent = upperBound - 3;
			if(type == "cve")
				control3.onclick = function(){getCVE(upperBound - 4);};
			else if(type == "vendors")
				control3.onclick = function(){getVendors(upperBound - 4);};
			else if(type == "products")
				control3.onclick = function(){getProducts(upperBound - 4);};
		}
	}

	if (totalEntries > limit * 4){
		control4.style.display = 'block'

		if(page < 4  || upperBound <= 6){
			control4.textContent = "5";
			if(type == "cve")
				control4.onclick = function(){getCVE(4);};
			else if(type == "vendors")
				control4.onclick = function(){getVendors(4);};
			else if(type == "products")
				control4.onclick = function(){getProducts(4);};
		} else if(page >= 4 && page < upperBound - 3){
			control4.textContent = page + 2;
			if(type == "cve")
				control4.onclick = function(){getCVE(page + 1);};
			else if(type == "vendors")
				control4.onclick = function(){getVendors(page + 1);};
			else if(type == "products")
				control4.onclick = function(){getProducts(page + 1);};
		} else {
			control4.textContent = upperBound - 2;
			if(type == "cve")
				control4.onclick = function(){getCVE(upperBound - 3);};
			else if(type == "vendors")
				control4.onclick = function(){getVendors(upperBound - 3);};
			else if(type == "products")
				control4.onclick = function(){getProducts(upperBound - 3);};
		}
	} 

	if (totalEntries > limit * 5){
		control5.style.display = 'block'

		if(upperBound <= 6){
			control5.textContent = upperBound;
			if(type == "cve")
				control5.onclick = function(){getCVE(upperBound - 1);};
			else if(type == "vendors")
				control5.onclick = function(){getVendors(upperBound - 1);};
			else if(type == "products")
				control5.onclick = function(){getProducts(upperBound - 1);};
		} else if(page >= upperBound - 3){
			control5.textContent = upperBound - 1;
			if(type == "cve")
				control5.onclick = function(){getCVE(upperBound - 2);};
			else if(type == "vendors")
				control5.onclick = function(){getVendors(upperBound - 2);};
			else if(type == "products")
				control5.onclick = function(){getProducts(upperBound - 2);};
		} else {
			control5.textContent = "...";
			control5.onclick = ""
		}
	}

	if(totalEntries > limit * 6){
		control6.style.display = 'block'
		control6.textContent = upperBound;
		if(type == "cve")
			control6.onclick = function(){getCVE(upperBound - 1);};
		else if(type == "vendors")
			control6.onclick = function(){getVendors(upperBound - 1);};
		else if(type == "products")
			control6.onclick = function(){getProducts(upperBound - 1);};
	}

	var currentControl;
	if(page < 4 || upperBound <= 6)		
		currentControl = document.getElementById('control'+ (page % 7))
	else if (page >= 4 && page < upperBound - 3)
		currentControl = control3
	else
		currentControl = document.getElementById('control'+ (7 - (upperBound - page) % 7))

	currentControl.classList.add('active');

	document.getElementById('info_entries').style.display = "block";
	document.getElementById('end').textContent = end;
	document.getElementById('start').textContent = 1 + (page * limit);
	document.getElementById('total').textContent = totalEntries;
}

function removeRows(element) {
	element.innerHTML = ""
}

function addHead(head){
	var rowCount = head.rows.length;  
    var row = head.insertRow(rowCount);

    if(type == "cve"){

    	th = document.createElement('th')
    	th.innerHTML = "#"
    	th.style.width = 50
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "ID"
    	th.style.width = 150
    	th.classList.add("sorttable_nosort")
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "CVSS2"
    	th.style.width = 70
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "CVSS3"
    	th.style.width = 70
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Descrizione"
    	th.classList.add("sorttable_nosort")
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Ultimo aggiornamento"
    	th.style.width = 200
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Data pubblicazione"
    	th.style.width = 200
    	row.appendChild(th)

    } else if(type == "vendors"){
    	th = document.createElement('th')
    	th.innerHTML = "#"
    	th.style.width = 50
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Venditore"
    	th.style.width = 200
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Lista prodotti"
    	th.style.width = 200
    	th.classList.add("sorttable_nosort")
    	row.appendChild(th)

    } else if(type == "products"){
    	th = document.createElement('th')
    	th.innerHTML = "#"
    	th.style.width = 50
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Venditore"
    	th.style.width = 200
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "Prodotto"
    	th.style.width = 200
    	row.appendChild(th)

    	th = document.createElement('th')
    	th.innerHTML = "CVE"
    	th.style.width = 200
    	th.classList.add("sorttable_nosort")
    	row.appendChild(th)
    }
}

function addRows(body, data, index, page){ 
	var rowCount = body.rows.length;  
    var row = body.insertRow(rowCount);

    if(type == "cve"){

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
	} else if(type == "vendors"){
		
		cell = row.insertCell(0);
	    paragraph = document.createElement("p");
	    let limit = parseInt(document.getElementById('entries').value) || 50;
	    paragraph.textContent = index + (page * limit);
	    cell.setAttribute('sorttable_customkey', index / 10);
	 	cell.appendChild(paragraph);

	 	cell = row.insertCell(1);  
	 	paragraph = document.createElement("p");
	 	paragraph.textContent = data;
	 	cell.appendChild(paragraph);

	 	cell = row.insertCell(2);  
	 	button = document.createElement("button");
	 	button.innerHTML = "Lista dei prodotti <i class='fa fa-list'></i>";
	 	button.classList.add("option")
	 	button.onclick = function() { currentVendor = data; getProducts(0); }
	 	cell.appendChild(button);

	} else if(type == "products"){

		console.log(data)

		cell = row.insertCell(0);
	    paragraph = document.createElement("p");
	    let limit = parseInt(document.getElementById('entries').value) || 50;
	    paragraph.textContent = index + (page * limit);
	    cell.setAttribute('sorttable_customkey', index / 10);
	 	cell.appendChild(paragraph);

	 	cell = row.insertCell(1);  
	 	paragraph = document.createElement("p");
	 	paragraph.textContent = data.vendor;
	 	cell.appendChild(paragraph);

	 	cell = row.insertCell(2);  
	 	paragraph = document.createElement("p");
	 	paragraph.textContent = data.product;
	 	cell.appendChild(paragraph);

	 	cell = row.insertCell(3);
	 	if(data.cve.length > 0){ 
	 		div = document.createElement("div")
	 		div.style.overflowY = "scroll" 
	 		div.style.height = 150
		 	ul = document.createElement("ul");
		 	for (var i = 0; i < data.cve.length; i++) {
		 		var li = document.createElement("li");
		 		var a = document.createElement("a");
			 	a.textContent = data.cve[i];
			 	a.href = "/cve-search/cve/" + data.cve[i];
			 	a.target = "_blank"
			 	li.appendChild(a)
			 	ul.appendChild(li)
		 	}
		 	div.style.display = "flex"
		 	div.style.justifyContent = "center"
		 	div.style.alignItems = "center"
		 	div.appendChild(ul)
		 	cell.appendChild(div);
		} else {
			paragraph = document.createElement("p");
		 	paragraph.textContent = "-";
		 	cell.appendChild(paragraph);
		}
	}
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
