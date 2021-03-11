let sortings = {
	overall: {
		desc:'overall best objective function score',
		cmp: function(d1, d2) {
			return d1.getScore() - d2.getScore()
		}
	},
	overallworst: {
		desc:'overall worst objective function score',
		cmp: function(d1, d2) {
			return d2.getScore() - d1.getScore()
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

		this.sortDiv = htmlElement(this.div, "div", 'd-flex w-100 justify-content-between','sortDiv');
		createTextElement(this.sortDiv, "p", "Sorted by " + sortings[this.sorting].desc, "");
	    var sortBtn = createTextElement(this.sortDiv, 'a', 'Sort', 'modal-link', 'sortLink');
	    sortBtn.setAttribute('data-bs-toggle', 'modal');
	    sortBtn.setAttribute('data-bs-target', '#sortModal');
	    
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
	    var sortRadioLabels = []
	    //     { 'label': 'Overall', 'value': 'overall'},
	    //     { 'label': 'Close to enacted', 'value': 'enacted'},
	    //     { 'label': 'Highest scoring with majority minority districts:', 'value': 'majmin'},
	    //     { 'label': 'Most different area pair-deviations', 'value': 'different'}
	    // ]
	    for (let sort in sortings) {
	    	sortRadioLabels.push({'label': sortings[sort].desc, value: sort})
	    }
	    for (let l of sortRadioLabels) {
	    	if (l.value == this.sorting) {
	    		l.checked = true
	    	}

	    }
	    var div = L.DomUtil.create('div');
	    createRadioGroup(div, sortRadioLabels, "Sort By", "sortRadio");
	    let sortModal = modalDialog('sortModal', 'Sort Districtings', div, this.modalClosed);
	    $('body').append(sortModal);
	}

	modalClosed = (e) => {
		console.log(this)
		console.log(e)
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

	showDistrictInfo(d) {
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
}