let sortings = {
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

class DistrictingsTab {
	/**
	 * Create the content for the 'districts' Tab
	 * @return {Element} div container of the content
	 */
	constructor() {
		this.sorting = 'overall'

		this.div = L.DomUtil.create('div');

		var headerDiv = htmlElement(this.div, 'div', 'center tabContentTitle mb-3');
		createTextElement(headerDiv, 'h5', 'Examine Districtings', 'h5');

		//start chart popout
		var aggregates = createTextElement(headerDiv, 'a', 'Districting Data', 'modal-link',);
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

		this.sortDiv = htmlElement(this.div, "div", 'd-flex w-100 justify-content-between','sortDiv');
		createTextElement(this.sortDiv, "p", "Sorted by " + sortings[this.sorting].desc, "");
	    var sortBtn = createButton(this.sortDiv, 'button', 'Sort', 'btn btn-primary modal-link');
	    sortBtn.setAttribute('data-bs-toggle', 'modal');
	    sortBtn.setAttribute('data-bs-target', '#sortModal');
		//L.DomEvent.on(sortBtn, 'click', this.modalOpened);
	    
	    $(document).ready(this.makeModal)

	    this.list = createListGroup(this.div);
		this.list.id = "districtList";

		const emptyText = "Districting Parameters have not been set :("
		let text = L.DomUtil.create('p')
		text.innerHTML = emptyText;
		this.list.appendChild(text);
	}

	makeModal = () => {
		// create sortModal
	    let sortRadioLabels = []
	    for (let sort in sortings) {
	    	sortRadioLabels.push({'label': sortings[sort].desc, value: sort})
	    }
		sortRadioLabels[0].checked = true
	    var form = L.DomUtil.create('form');
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
		this.weights = weights
		let l = this.list
		this.dics = []
		for (let dic of dics) {
			this.dics.push(new Districting(dic, this))
		}
		this.sortList()
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

	sortList = () => {
		this.clearList()
		this.dics.sort(sortings[this.sorting].cmp)
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
		var div = L.DomUtil.create('div');
		div['id'] = 'analysisDiv'
		// console.dir(div)

		// var img = L.DomUtil.create('img', 'modal-content', div);
		// img.src = './chart.jpg';

		return div;
	}

	boxPlot = () => {
		function linspace(a,b,n) {
			return Plotly.d3.range(n).map(function(i){return a+i*(b-a)/(n-1);});
		}
		var boxNumber = 30;
		// var boxColor = [];
		// var allColors = linspace(0, 360, boxNumber);
		var data = [];
		var yValues = [];
		
		//Colors
		
		// for( var i = 0; i < boxNumber;  i++ ){
		// 	var result = 'hsl('+ allColors[i] +',50%'+',50%)';
		// 	boxColor.push(result);
		// }
		
		function getRandomArbitrary(min, max) {
			return Math.random() * (max - min) + min;
		};
		
		//Create Y Values
		
		for( var i = 0; i < boxNumber;  i++ ){
			var ySingleArray = [];
				for( var j = 0; j < 10;  j++ ){
					var randomNum = getRandomArbitrary(0, 1);
					var yIndValue = randomNum +i*.2;
					ySingleArray.push(yIndValue);
				}
			yValues.push(ySingleArray);
		}
		
		//Create Traces
		
		for( var i = 0; i < boxNumber;  i++ ){
			var result = {
				y: yValues[i],
				type:'box',
				marker:{
					color: 'black'
				}
			};
			data.push(result);
		};
		
		//Format the layout
		
		var layout = {
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
		console.dir(data)

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
