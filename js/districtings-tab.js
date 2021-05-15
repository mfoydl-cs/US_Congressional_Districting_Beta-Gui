var sortings = {
	overall: {
		desc:'overall best objective function score',
		cmp: function(d1, d2) {
			return d2.getScore() - d1.getScore()
		}
	},
	overallworst: {
		desc:'overall worst objective function score',
		cmp: function(d1, d2) {
			return d1.getScore() - d2.getScore()
		}
	},
	enacted: {
		desc:'closest to enacted',
		cmp: function(d1, d2) {
			return d2.getScore() - d1.getScore()
		}
	},
	majmin: {
		desc:'highest scoring majority minority',
		cmp: function(d1, d2) {
			return d2.getScore() - d1.getScore()
		}
	},
	different: {
		desc:'most different area pair-deviations',
		cmp: function(d1, d2) {
			return d2.getScore() - d1.getScore()
		}
	}
}

const plotLayout = {
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
	showlegend: false
};

class DistrictingsTab {
	/**
	 * Create the content for the 'districts' Tab
	 * @return {Element} div container of the content
	 */
	constructor() {
		// Set default sort value
		this.sorting = 'overall'

		//Root
		this.div = L.DomUtil.create('div');

		//Header
		let headerDiv = htmlElement(this.div, 'div', 'center tabContentTitle mb-3');
		createTextElement(headerDiv, 'h5', 'Examine Districtings', 'h5');

		
		//Div for sorting
		this.sortDiv = htmlElement(this.div, "div", 'd-flex w-100 justify-content-between','sortDiv');
		createTextElement(this.sortDiv, "p", "Sorted by: " + sortings[this.sorting].desc, "");
		let sortBtn = createButton(this.sortDiv, 'button', 'Sort', 'btn btn-outline-primary btn-sm modal-link');
		sortBtn.setAttribute('data-bs-toggle', 'modal');
		sortBtn.setAttribute('data-bs-target', '#sortModal');
		
		//Create Sorting popup
		$(document).ready(() => {
			$('body').append(aggregatesModal);
		});
		$(document).ready(this.makeModal);
			

		//Create list
		this.list = createListGroup(this.div);
		this.list.id = "districtList";

		//Box and Whisker Plot Model
		let aggregates = createTextElement(this.div, 'a', 'Districting Data', 'modal-link',);
		aggregates.setAttribute('data-bs-toggle', 'modal');
		aggregates.setAttribute('data-bs-target', '#aggregatesModal');
		let content = this.analysisContent();
		let aggregatesModal = modalDialog('aggregatesModal', 'Aggregate Districting Data', content);

		// Get Summary Info
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

	makeModal = () => {
		// create sortModal
		let sortRadioLabels = []
		for (let sort in sortings) {
			sortRadioLabels.push({'label': sortings[sort].desc, value: sort})
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
		this.sortList()
	}

	/**
	 * Clears the List Group of districtings on the districts tab on the menu
	 */
	clearList = () => {
		while (this.list.firstChild) {
			this.list.removeChild(this.list.firstChild)
		}
	}

	setDistricts = (dics, weights) => {
		this.sorts = dics
		let plans = {}
		this.weights = weights
		for (let sort in this.sorts) {
			let list = this.sorts[sort]
			for (let i = 0; i < list.length; i++) {
				let plan = list[i]
				let id = plan['id']
				console.log(plans)
				console.log(plan['id'])
				if (id in plans) {
					list[i] = plans[id]
				} else {
					list[i] = new Districting(id, plan, this)
					plans[id] = list[i]
				}
			}
		}
		this.sorting = "bestOF"
		this.updateDics()
	}

	updateDics = () => {
		this.dics = this.sorts[this.sorting]
		this.updateList()
	}

	displayDistricting = (d) => {
		if (this.currentDic && this.currentDic != d) {
			this.currentDic.toggleDisplay(false)
		}
		this.currentDic = d
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
		for (let dic of this.dics) {
			this.list.append(dic.listItem);
		}
	}

	showDistrictInfo = (d) => {
		this.div.append(d.infoContainer)
		this.list.style.display = 'none';
		for (let c of this.sortDiv.children) {
			c.style.display = 'none'
		}
	}

	showDistrictList = (d) => {
		d.infoContainer.remove();
		// reset to default display
		this.list.style.display = '';
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
			let graph = this.boxPlot(JSON.parse(response.boxplot));
			Plotly.newPlot('analysisDiv', graph.data, graph.layout);
			Plotly.addTraces('analysisDiv', this.scatterPlot(JSON.parse(response.scatterplot)));
		});
	}

	boxPlot = (yValues) => {
		var data = [];

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

		return {
			data: data,
			layout: plotLayout
		}
	}

	scatterPlot = (data) => {
		var xtraces = []
		for (var i = 0; i < data.length; i++) {
			xtraces.push('trace ' + i.toString());
		}
		return {
			x: xtraces,
			y: data,
			mode: 'markers',
			marker: { color: 'red' }
		}
	}

}
