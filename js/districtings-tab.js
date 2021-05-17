var sortNames = {
	'bestOF': 'Best Objective Function Score',
	'worstOF': 'Worst Objective Function Score',
	'areaPairDevs': 'Top 5 Plans With Very Different Area-Pair Deviations',
	'closeToEnacted': 'High Scoring Plans Close to the Enacted',
	'highMM': 'Top Plans With the Most Majority-Minority Districts',
	'closeToAvg': 'Plans Closest to the Average Plan Population'
}

const plotLayout = {
	width: 900,
	height: 450,
	margin: {
		l: 50,
		r: 20,
		b: 50,
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
	showlegend: true
};

class DistrictingsTab {
	/**
	 * Create the content for the 'districts' Tab
	 * @return {Element} div container of the content
	 */
	constructor() {
		// Set default sort value
		this.sorting = 'bestOF'

		//Root
		this.div = L.DomUtil.create('div');

		//Header
		let headerDiv = htmlElement(this.div, 'div', 'center tabContentTitle mb-3');

		//Sort
		this.sortDiv = htmlElement(this.div, "div", 'd-flex w-100 justify-content-between', 'sortDiv');

		//Enacted
		this.enactedDiv = htmlElement(this.div, 'div','enacted');

		//DISTRICTING LIST CONTENT
		this.list = createListGroup(this.div);
		this.list.id = "districtList";

		//Boxplot Button
		this.aggDiv = htmlElement(this.div, 'div', 'd-grid gap-2 col-6 mx-auto submitBtn');

		
		// HEADER CONTENT
		createTextElement(headerDiv, 'h5', 'Examine Districtings', 'h5');
		
		//SORTING CONTENT
		createTextElement(this.sortDiv, "p", "Sorted by: " + sortNames[this.sorting], "", 'sort-label');
		let sortBtn = createButton(this.sortDiv, 'button', 'Sort', 'btn btn-outline-primary btn-sm modal-link');
		sortBtn.setAttribute('data-bs-toggle', 'modal');
		sortBtn.setAttribute('data-bs-target', '#sortModal');

		
		
		
		
		//BOXPLOT MODAL
		this.makeAggregatesModal() //Create boxplot aggregate Modal Window

		$(document).ready(() => {
			$('body').append(this.aggregatesModal);
			this.makeSortModal();
		}); //Add boxplot modal to DOM
	}

	makeAggregatesModal = () => {
		//Box and Whisker Plot Model
		//this.aggregates = createTextElement(this.div, 'a', 'Districting Data', 'modal-link',);
		this.aggregates = createButton(this.aggDiv, 'button', 'Aggregate Districtings Data', 'btn btn-primary btn-sm')
		this.aggregates.setAttribute('data-bs-toggle', 'modal');
		this.aggregates.setAttribute('data-bs-target', '#aggregatesModal');
		let content = this.analysisContent();
		this.aggregatesModal = modalDialog('aggregatesModal', 'Aggregate Districting Data', content);

		const data = {
			'count': { 'label': 'Districtings Returned: ', 'value': 1000 },
			'avg-compactness': { 'label': 'Average Compactness: ', 'type': '', 'value': '.92 [Polsby-Popper]' },
			'avg-maj-min': { 'label': 'Average Majority-Minority Districts: ', 'value': 2 },
			'population-diff': { 'label': 'Average Population Difference: ', 'type': '', 'value': '1.2% [Total Population]' },
		}

		//Generate summary info on bottom
		htmlElement(content, 'br');
		let body = htmlElement(content, 'div', '',);
		Object.keys(data).forEach(function (key) {
			var row = htmlElement(body, 'div', 'row');
			createTextElement(row, 'p', data[key].label, 'col', key + "ConSummaryLabel");
			var value = createTextElement(row, 'p', data[key].value, 'col', key + "ConSummaryValue");
			if (data[key].type) {
				value.innerHTML += "(" + data[key].type + ")";
			}
		});
	}

	makeSortModal = () => {
		// create sortModal
		let sortRadioLabels = []
		for (let sort in sortNames) {
			sortRadioLabels.push({'label': sortNames[sort], value: sort})
		}
		sortRadioLabels[0].checked = true
		let form = L.DomUtil.create('form');
		createRadioGroup(form, sortRadioLabels, "Sort By", "sortRadio");
		this.sortModal = modalDialog('sortModal', 'Sort Districtings', form, this.modalClosed);
		$('body').append(this.sortModal);
	}

	modalClosed = (e) => {
		let data = new FormData(this.sortModal.querySelector('form'))
		this.sorting = data.get('sortRadio')
		document.getElementById('sort-label').innerHTML = "Sorted by: " + sortNames[this.sorting]
		this.updateDics()
	}

	/**
	 * Clears the List Group of districtings on the districts tab on the menu
	 */
	clearList = () => {
		while (this.list.firstChild) {
			this.list.removeChild(this.list.firstChild)
		}
		this.enactedDiv.innerHTML = '';
		this.enactedDiv.append(this.enacted);

	}

	setDistricts = (dics, weights) => {
		console.log(dics)
		this.weights = weights
		this.makeEnacted(dics.enacted)
		delete dics.enacted
		this.sorts = dics
		let plans = {}
		for (let sort in this.sorts) {
			let list = this.sorts[sort]
			for (let i = 0; i < list.length; i++) {
				let plan = list[i]
				let id = plan['id']
				if (id in plans) {
					list[i] = plans[id]
				} else {
					list[i] = new Districting(plan, this)
					plans[id] = list[i]
				}
			}
		}
		this.sorting = "bestOF"
		this.updateDics()
	}

	updateDics = () => {
		this.dics = this.sorts[this.sorting];
		this.updateList()
	}

	displayDistricting = (d) => {
		if (this.currentDic && this.currentDic != d) {
			this.currentDic.toggleDisplay(false)
		}
		this.currentDic = d
		if(d.id!='enacted'){
			this.generateSelected();
		}
		toggleDistrict(this.currentDic.featureGroup, true);
	}

	unselectDistricting = (d) => {
		if (this.currentDic) {
			toggleDistrict(this.currentDic.featureGroup, false);
			this.currentDic = null
		} else {console.log('this shouldntve happened..')}
	}

	updateList = () => {
		this.clearList()
		//this.dics.sort(sortings[this.sorting].cmp)
		console.log(this.dics)
		for (let dic of this.dics) {
			this.list.append(dic.listItem);
		}
	}

	showDistrictInfo = (d) => {
		this.div.append(d.infoContainer)
		this.list.style.display = 'none';
		this.aggregates.style.display = 'none';
		this.enactedDiv.style.display = 'none';
		for (let c of this.sortDiv.children) {
			c.style.display = 'none'
		}
	}

	showDistrictList = (d) => {
		d.infoContainer.remove();
		// reset to default display
		this.list.style.display = '';
		this.aggregates.style.display = '';
		this.enactedDiv.style.display = '';
		for (let c of this.sortDiv.children) {
			c.style.display = ''
		}
	}

	analysisContent = () => {
		let div = L.DomUtil.create('div');
		div['id'] = 'analysisDiv'
		return div;
	}

	generateBoxplot = () => {
		getBoxplot().then(response => {
			console.log("boxplot");
			console.log(response);
			let data = JSON.parse(response.boxplot)
			let graph = this.boxPlot(data);
			Plotly.newPlot('analysisDiv', graph.data, graph.layout);

			let xtraces = []
			let yVals = [] 
			for (var i = 0; i < data.length; i++) {
				xtraces.push('trace ' + i.toString());
				yVals.push(0);
			}

			let scatter = {
				x: xtraces,
				y: yVals,
				mode: 'markers',
				showlegend: false,
				visible: false,
				marker: { color: 'red' }
			}

			Plotly.addTraces('analysisDiv', scatter);
			// Plotly.addTraces('analysisDiv',this.scatterPlot(JSON.parse(response.enacted), 'Enacted','blue'));
		});
	}

	generateSelected = () => {
		console.log('selected')
		getScatterPlot(this.currentDic.id).then(response => {
			let data = JSON.parse(response.scatterplot);
			let update = this.scatterPlot(data, 'District ' + this.currentDic.id, 'red');
			Plotly.update('analysisDiv', { 'y': [update.y], showlegend: true, name: 'Districting ' + this.currentDic.id, visible: true }, {}, data.length);			
		});
	}

	boxPlot = (yValues) => {
		var data = [];

		for (var i = 0; i < yValues.length; i++) {
			var result = {
				y: yValues[i],
				type: 'box',
				showlegend: false,
				marker: {
					color: '#3388FF'
				}
			};
			data.push(result);
		};

		return {
			data: data,
			layout: plotLayout,
		}
	}

	scatterPlot = (data, n,c) => {
		var xtraces = []
		for (var i = 0; i < data.length; i++) {
			xtraces.push('trace ' + i.toString());
		}
		return {
			x: xtraces,
			y: data,
			mode: 'markers',
			name: n,
			showlegend: true,
			marker: { color: c }
		}
	}

	setState = (state) => {
		//ENACTED CONTENT
		// this is now done when setDistricts is called
	//	getEnactedDistricting(state).then(res => {
	//		res.geography = JSON.parse(res.geography)
	//		this.makeEnacted(res);
	//	})
	}

	makeEnacted = (enacted) => {
		enacted.geography = JSON.parse(enacted.geography)
		this.enacted = new EnactedDistricting(enacted.geography, enacted.data, this).listItem;
		this.enactedDiv.append(this.enacted);
	}

}
