/**
 * Parses GeoJSON object to create list item
 * @param {Object} geoJSON geoJSON object representing the district
 * @return {Element} List Item element to add to list
 */
class Districting {
	constructor(geoJSON, dicTab) {
		// maybe one day dicTab won't be global...
		this.dicTab = dicTab
		this.geoJSON = geoJSON

		// create list item
		var id = geoJSON.features[0].properties.CDSESSN;
		var div = L.DomUtil.create('div');
		var headerDiv = htmlElement(div, "div", 'd-flex w-100 justify-content-between');
		createTextElement(headerDiv, "h5", id, "mb-1");
		this.check = L.DomUtil.create("input", "form-check-input", headerDiv);
		this.check.type = "checkbox";
		var contentDiv = htmlElement(div, "div", 'd-flex w-100 justify-content-between');
		createTextElement(contentDiv, "p", "Score: " + this.getScore().toFixed(2), "");
		var link = createTextElement(contentDiv,'a','<em>more info</em>','modal-link')
		this.listItem = createListItem(div, false, false);

		// District List for Info Tab
		var listgroupContainer = L.DomUtil.create('div');
		this.districtList = createListGroup(listgroupContainer);
		this.districtList.classList.add('list-group-flush');
		this.featureGroup = new L.LayerGroup();
		L.geoJson(geoJSON, {
				onEachFeature: this.processDistrict
		});


		//Info Page
		var infoContainer = L.DomUtil.create('div');
		this.infoContainer = infoContainer
		var infoHeader = htmlElement(infoContainer, 'div','d-flex w-100 justify-content-between');
		createTextElement(infoHeader, 'h5', id, 'h5');

		var checkDiv = htmlElement(infoHeader, 'div');
		createLabel(checkDiv, '<i>show</i>&nbsp',id+'InfoCheck','small');
		this.infoCheck = L.DomUtil.create("input", "form-check-input custom-check", checkDiv);
		this.infoCheck.id = id+"InfoCheck"
		this.infoCheck.type = "checkbox";

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
		for (let score in this.geoJSON['scores']) {
	    	var div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
			let s = this.geoJSON.scores[score]
			if (score == 'majmin') {
				let link = createTextElement(div, 'a', 'Maj-Min Districts', 'stat-col score modal-link')
				link.setAttribute('data-bs-toggle', 'modal');
				link.setAttribute('data-bs-target', '#majminModal' + id);
			} else {
				createTextElement(div, 'p', score, 'stat-col score')
			}
			createTextElement(div, 'p', s, 'stat-col')
			createTextElement(div, 'p', this.dicTab.weights[score], 'stat-col')
			createTextElement(div, 'p', s*this.dicTab.weights[score], 'stat-col')
			let statItem = createListItem(div, true, false)
			this.statsList.appendChild(statItem)
		}
	    div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
		createTextElement(div, 'p', 'Total', 'stat-col score')
		createTextElement(div, 'p', '', 'stat-col')
		createTextElement(div, 'p', '', 'stat-col')
		createTextElement(div, 'p', this.getScore().toFixed(2), 'stat-col')
		statItem = createListItem(div, true, false)
		this.statsList.appendChild(statItem)
		
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
			// console.log(d.properties)
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
		$('body').append(this.majminModal)

		//start chart popout
		var aggregates = createTextElement(infoBody, 'a', 'Districting Data', 'modal-link',);
		aggregates.setAttribute('data-bs-toggle', 'modal');
		aggregates.setAttribute('data-bs-target', '#aggregatesModal');
		var content = this.analysisContent();
		var aggregatesModal = modalDialog('aggregatesModal', 'Aggregate Districting Data', content);

		// add more data to popout
		const data = {
			'count': { 'label': 'Districtings Returned: ', 'value': 1000 },
			'avg-compactness': { 'label': 'Average Compactness: ', 'type': '', 'value': '.92 [Polsby-Popper]' },
			'avg-maj-min': { 'label': 'Average Majority-Minority Districts: ', 'value': 2 },
			'population-diff': { 'label': 'Average Population Difference: ', 'type': '', 'value': '1.2% [Total Population]' },
		}
		htmlElement(content, 'br');
		var body = htmlElement(content, 'div', '',); //Content container
		Object.keys(data).forEach(function (key) {
			var row = htmlElement(body, 'div', 'row');
			createTextElement(row, 'p', data[key].label, 'col', key + "ConSummaryLabel");
			var value = createTextElement(row, 'p', data[key].value, 'col', key + "ConSummaryValue");
			if (data[key].type) {
				value.innerHTML += "(" + data[key].type + ")";
			}
		});

		//add charts to popout
		$(document).ready(() => {
			$('body').append(aggregatesModal);
			var graph = this.boxPlot();
			Plotly.newPlot('analysisDiv', graph.data, graph.layout);
			Plotly.addTraces('analysisDiv', this.scatterPlot())
		});
	    
		var infoFooter = htmlElement(infoContainer, 'div', 'd-grid gap-2');
	    var back = createButton(infoFooter, 'button', 'Back', 'btn btn-secondary btn-lg ');

	    L.DomEvent.on(this.check, 'click', this.checkClicked);

	    L.DomEvent.on(this.infoCheck, 'click', this.checkClicked);

	    L.DomEvent.on(link, 'click', this.dicTab.showDistrictInfo.bind(this.dicTab, this))
	    // 	function (ev) {
	    //     showDistrictInfo(infoContainer, featureGroup);
	    // });

	    L.DomEvent.on(back, 'click', this.dicTab.showDistrictList.bind(this.dicTab, this))
	    // function (ev) {
	    //     showDistrictList(infoContainer, featureGroup);
	    // });
	}

	getScore = () => {
		let score = 0
		let weights = this.dicTab.weights
		for (let s in weights) {
			score += this.geoJSON['scores'][s] * weights[s]
		}
		return score
	}

	checkClicked = (ev) => {
		this.toggleDisplay(ev.target.checked)
	}

	// display is boolean
	toggleDisplay = (display) => {
		this.check.checked = display
		this.infoCheck.checked = display
		if (display) {
			this.dicTab.displayDistricting(this)
		} else {
			this.dicTab.unselectDistricting()
		}
	}

	processDistrict = (feature, layer) => {
		// add feature to map in our featureGroup
		var featureJson = L.geoJson(feature);
        featureJson.addTo(this.featureGroup);


        var id = "CD" + feature.properties.CDSESSN + feature.properties["CD" + feature.properties.CDSESSN + "FP"]
	    var div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
	    div.id = id;
	    //var div = htmlElement(div, "div", 'd-flex w-100 justify-content-between',id);
	    var p = createTextElement(div, 'p', "District " + feature.properties["CD" + feature.properties.CDSESSN + "FP"])
	    addDistrictHightlight(featureJson, div);
	    var item = createListItem(div, true, false);

        this.districtList.appendChild(item)
	}
	
	analysisContent = () => {
		var div = L.DomUtil.create('div');
		div['id'] = 'analysisDiv'
		// console.dir(div)

		// var img = L.DomUtil.create('img', 'modal-content', div);
		// img.src = './chart.jpg';

		return div;
	}

	boxPlot = () => {
		/*
		function linspace(a,b,n) {
			return Plotly.d3.range(n).map(function(i){return a+i*(b-a)/(n-1);});
		}*/
		//var boxNumber = 30;
		// var boxColor = [];
		// var allColors = linspace(0, 360, boxNumber);
		var data = [];
		var yValues = [];
		
		//Colors
		
		// for( var i = 0; i < boxNumber;  i++ ){
		// 	var result = 'hsl('+ allColors[i] +',50%'+',50%)';
		// 	boxColor.push(result);
		// }
		/*
		function getRandomArbitrary(min, max) {
			return Math.random() * (max - min) + min;
		};*/
		
		//Create Y Values
		/*
		for( var i = 0; i < boxNumber;  i++ ){
			var ySingleArray = [];
				for( var j = 0; j < 10;  j++ ){
					var randomNum = getRandomArbitrary(0, 1);
					var yIndValue = randomNum +i*.2;
					ySingleArray.push(yIndValue);
				}
			yValues.push(ySingleArray);
		}
		*/
		//Get y-values from server

		getBoxplot().then(response => {
			yValues = response.data

			for (var i = 0; i < yValues.length; i++) {
				var result = {
					y: yValues[i],
					type: 'box',
					marker: {
						color: 'black'
					}
				};
				data.push(result);
			};
		});
		
		//Create Traces
		
		
		
		//Format the layout
		
		let layout = {
			width: 450,
			height: 300,
			margin: {
				l: 20,
				r: 0,
				b: 30,
				t: 10,
				pad: 4
			},
			xaxis: {
				showgrid: false,
				zeroline: false,
				tickangle: 60,
				showticklabels: false
			},
			yaxis: {
				zeroline: false,
				gridcolor: 'white'
			},
			paper_bgcolor: 'rgb(233,233,233)',
			plot_bgcolor: 'rgb(233,233,233)',
			showlegend:false
		};
		// console.dir(data)

		return {
			data: data,
			layout: layout
		}
	}

	scatterPlot = () => {
		var xtraces = []
		for (var i = 0; i < 30; i++) {
			xtraces.push('trace ' + i.toString());
		}
		var yvals = []
		for (var i = 0; i < 30; i++) {
			yvals.push(Math.random() +i*.2);
		}
		return {
			x: xtraces,
			y: yvals,
			mode: 'markers',
			marker: {color: 'red'}
		}
	}
}
