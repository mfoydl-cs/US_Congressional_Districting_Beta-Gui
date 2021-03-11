let sortings = {
	overall: {
		desc:'overall objective function score',
		cmp: function(d1, d2) {
			return getScore(d1, this.weights) - getScore(d2, this.weights)
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

		var sortDiv = htmlElement(this.div, "div", 'd-flex w-100 justify-content-between','sortDiv');
		createTextElement(sortDiv, "p", "Sorted by " + sortings[this.sorting].desc, "");
	    var sortBtn = createTextElement(sortDiv, 'a', 'Sort', 'modal-link', 'sortLink');
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
	    var sortRadioLabels = [
	        { 'label': 'Overall', 'value': 'overall'},
	        { 'label': 'Close to enacted', 'value': 'enacted'},
	        { 'label': 'Highest scoring with majority minority districts:', 'value': 'majmin'},
	        { 'label': 'Most different area pair-deviations', 'value': 'different'}
	    ]
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



	listDistricts = (dics, weights) => {
		this.weights = weights
		let l = this.list
		// sort dics


		dics.forEach(function (item) {
			l.append(districtListItem(item, weights));
		});
		
	}
}