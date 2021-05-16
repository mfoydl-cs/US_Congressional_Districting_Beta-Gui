/**
 * Parses GeoJSON object to create list item
 * @param {Object} geoJSON geoJSON object representing the district
 * @return {Element} List Item element to add to list
 */
class Districting {
	constructor(id, scores, dicTab) {
		// maybe one day dicTab won't be global...
		this.id = id;
		this.dicTab = dicTab;
		this.score = scores.score
		delete scores.score
		delete scores.id
		this.scores = scores;

		this.geoJSON = null;
		

		var div = L.DomUtil.create('div');
		var headerDiv = htmlElement(div, "div", 'd-flex w-100 justify-content-between');
		createTextElement(headerDiv, "h5", "Districting "+id, "mb-1");

		

	
		this.checkDiv = htmlElement(headerDiv, 'div', '');
		createLabel(this.checkDiv, '<i>show</i>&nbsp', id + 'Check', 'small');
		this.check = L.DomUtil.create("input", "form-check-input custom-check", this.checkDiv);
		this.check.id = id + "Check";
		this.check.type = "checkbox";
		L.DomEvent.on(this.check, 'click', this.checkClicked);

		var contentDiv = htmlElement(div, "div", 'd-flex w-100 justify-content-between');
		createTextElement(contentDiv, "p", "Score: " + this.score.toFixed(2), "");
		var link = createTextElement(contentDiv,'a','<em>more info</em>','modal-link')
		this.listItem = createListItem(div, false, false);

		// District List for Info Tab
		var listgroupContainer = L.DomUtil.create('div');
		this.districtList = createListGroup(listgroupContainer);
		this.districtList.classList.add('list-group-flush');

		//Info Page
		var infoContainer = L.DomUtil.create('div');
		this.infoContainer = infoContainer
		var infoHeader = htmlElement(infoContainer, 'div','d-flex w-100 justify-content-between');
		createTextElement(infoHeader, 'h5', "Districting " + id, 'h5');

		this.infocheckDiv = htmlElement(infoHeader, 'div','');
		createLabel(this.infocheckDiv, '<i>show</i>&nbsp', id + 'InfoCheck', 'small');
		this.infoCheck = L.DomUtil.create("input", "form-check-input custom-check", this.infocheckDiv);
		this.infoCheck.id = id + "InfoCheck";
		this.infoCheck.type = "checkbox";
		L.DomEvent.on(this.infoCheck, 'click', this.checkClicked);

		var infoBody = htmlElement(infoContainer, 'div');

		createAccordian(infoBody, "Dist" + id, "Districts", listgroupContainer);

		var stats = htmlElement(infoBody,'div','container');
		var statsListContainer = L.DomUtil.create('div')
		this.statsList = createListGroup(statsListContainer)
		createAccordian(infoBody, "stats" + id, "Objective Function Breakdown", statsListContainer)
		div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
		createTextElement(div, 'p', 'Measure', 'stat-col score')
		createTextElement(div, 'p', 'Value', 'stat-col')
		createTextElement(div, 'p', 'Weight', 'stat-col')
		createTextElement(div, 'p', 'Contrib', 'stat-col')
		let statItem = createListItem(div, true, false)
		this.statsList.appendChild(statItem)

		
		// populate stats list
		// TODO this.scores is enum string but weights is different keys
		for (let score in this.scores) {
	    	var div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
			let s = this.scores[score];
			if (score == 'MAJMIN') {
				let link = createTextElement(div, 'a', 'Maj-Min Districts', 'stat-col score modal-link')
				link.setAttribute('data-bs-toggle', 'modal');
				link.setAttribute('data-bs-target', '#majminModal' + id);
			} else {
				createTextElement(div, 'p', score, 'stat-col score')
			}
			console.log(s)
			console.log(score)
			console.log(this.dicTab.weights)
			console.log(Number(this.dicTab.weights[score]))
			createTextElement(div, 'p', Number(s).toFixed(3), 'stat-col')
			createTextElement(div, 'p', Number(this.dicTab.weights[score]).toFixed(3), 'stat-col')
			createTextElement(div, 'p', Number(s*this.dicTab.weights[score]).toFixed(3), 'stat-col')
			let statItem = createListItem(div, true, false)
			this.statsList.appendChild(statItem)
		}
	    div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
		createTextElement(div, 'p', 'Total', 'stat-col score')
		createTextElement(div, 'p', '', 'stat-col')
		createTextElement(div, 'p', '', 'stat-col')
		createTextElement(div, 'p', this.score.toFixed(3), 'stat-col')
		statItem = createListItem(div, true, false)
		this.statsList.appendChild(statItem)
		

		var infoFooter = htmlElement(infoContainer, 'div', 'd-grid gap-2');
	    var back = createButton(infoFooter, 'button', 'Back', 'btn btn-secondary btn-lg ');

	    L.DomEvent.on(link, 'click', this.dicTab.showDistrictInfo.bind(this.dicTab, this))


	    L.DomEvent.on(back, 'click', this.dicTab.showDistrictList.bind(this.dicTab, this))
	}

	// deprecated
	getScore = () => {
		return this.score // incase anyone ignores the deprecated comment
		let score = 0
		let weights = this.dicTab.weights
		for (let s in this.scores) {
			score += this.scores[s] * weights[s];
		}
		console.log(score)
		return score//score.toFixed(2);
	}

	checkClicked = (ev) => {
		this.toggleDisplay(ev.target.checked)
	}

	// display is boolean
	toggleDisplay = (display) => {
		this.check.checked = display
		this.infoCheck.checked = display

		if (display) {
			console.log(this.geoJSON)
			if (this.geoJSON == undefined) {
				console.log('hi?');
				this.checkDiv.classList = "spinner";
				this.check.style.display = 'none';
				this.infocheckDiv.classList = "spinner";
				this.infoCheck.style.display = 'none';
				this.getGeoJson();
			}
			else {
				this.dicTab.displayDistricting(this);
			}
			
		} else {
			this.dicTab.unselectDistricting()
		}
	}

	processDistrict = (feature, layer) => {
		// add feature to map in our featureGroup
		var featureJson = L.geoJson(feature);
        featureJson.addTo(this.featureGroup);

        var id = "D"+this.id + "d" + this.count;
	    var div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
	    div.id = id;
	    //var div = htmlElement(div, "div", 'd-flex w-100 justify-content-between',id);
	    var p = createTextElement(div, 'p', "District " + this.count);
	    addDistrictHightlight(featureJson, div);
	    var item = createListItem(div, true, false);

        this.districtList.appendChild(item);
		this.count+=1;
	}

	majmin = () => {
		// make majmin modal
		let majminDiv = L.DomUtil.create('div')
		let table = htmlElement(majminDiv, 'table')
		let row = htmlElement(table, 'tr')
		let name = htmlElement(row, 'td')
		name.innerHTML = "District Name"
		let pop = htmlElement(row, 'td')
		pop.innerHTML = "Population"
		let minPop = htmlElement(row, 'td')
		minPop.innerHTML = "Minority Population"
		let minPer = htmlElement(row, 'td')
		minPer.innerHTML = "Minority Percentage"
		for (let d of this.geoJSON.features) {
			let row = htmlElement(table, 'tr')
			let name = htmlElement(row, 'td')
			if ('NAMELSAD20' in d.properties) {
				name.innerHTML = d.properties.NAMELSAD20
			} else {
				name.innerHTML = d.properties.NAMELSAD10
			}
			let pop = htmlElement(row, 'td')
			pop.innerHTML = d.properties.population
			let minPop = htmlElement(row, 'td')
			minPop.innerHTML = d.properties.minorityPop
			let minPer = htmlElement(row, 'td')
			minPer.innerHTML = (100 * d.properties.minorityPop / d.properties.population).toFixed(2) + '%'
		}
		this.majminModal = modalDialog('majminModal' + id, 'Majority-Minority Districts', majminDiv)
		$('body').append(this.majminModal);
	}

	getGeoJson = () => {
		console.log('getting...')
		retrieveDistricting(this.id).then(response => {
			console.log('Got')
			this.geoJSON = response;
			
			this.featureGroup = new L.LayerGroup();
			this.count = 1;

			L.geoJson(this.geoJSON, {
				onEachFeature: this.processDistrict
			});

			this.checkDiv.classList = "";
			this.infocheckDiv.classList = "";
			this.check.style.display = '';
			this.infoCheck.style.display = '';

			this.dicTab.displayDistricting(this);
			console.log('done');
		});
	}

}
