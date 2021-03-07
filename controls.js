/* ********** CUSTOM LEAFLET UI CONTROL DEFINITIONS ********** */

/**
 * Creates the Back button control
 */
L.Control.BackButton = L.Control.extend({
    onAdd: function (map) {
        var button = L.DomUtil.create('div', 'mapButton');
        button.innerHTML = '<h4>Back</h4>'

        L.DomEvent.on(button, 'click', function (ev) {
            backToCountry();
        });
        return button;
    },
    onRemove: function (map) { }
});

/**
 * Factory function for the backButton control
 * @param {Object} opts Leaflet options object 
 */
L.control.backButton = function (opts) {
    return new L.Control.BackButton(opts);
}

/**
 * Creates the Menu control
 */
L.Control.Menu = L.Control.extend({
    onAdd: function (map) {
        var div = L.DomUtil.create('div', 'menu');

        L.DomEvent.disableClickPropagation(div);

        var nav = createTabNav(div, "menuNav");

        var parametersContent = parametersTab();
        var districtsContent = districtsTab();
        var paramsTab = createTab(nav, "Params", parametersContent, "params", true);
        var distTab = createTab(nav, "Districts", districtsContent, "districts");

        $(document).ready(function () {
            $("#submitButton").click(function () {
                submitParameters();
            })
        });

        return div;
    },
    onRemove: function (map) { }
});

/**
 * Factory function for the menu control
 * @param {Object} opts Leaflet options object
 */
L.control.menu = function (opts) {
    return new L.Control.Menu(opts);
}

/* **********   SPECIFIC BUILDER FUNCTIONS W/ LEAFLET  ********** */

/**
 * Creates the content for the 'params' tab
 * @return {Element} div container of the content
 */
function parametersTab() {
    var div = L.DomUtil.create('div');
    createTextElement(div, 'p', "Districting Parameters", "h1 center")
    createSlider(div, 'population-equality', 'Population Equality', 0, 1, 0.1);
    createSlider(div, 'avgerage-deviation', 'Deviation from Average Districting', 0, 1, 0.1);
    createSlider(div, 'enacted-deviation', 'Deviation from Enacted Plan', 0, 1, 0.1);
    createSlider(div, 'compactness', 'Compactness', 0, 1, 0.1);
    createSlider(div, 'political-fairness', 'Political Fairness', 0, 1, 0.1);
    createSwitch(div, 'split-counties', "Allow Split Counties");
    var text = L.DomUtil.create('p');
    text.innerHTML = "THiefasoieufhalsiufh aidsufh kjdsfkjfksjdf";
    createAccordian(div, "incumbent", "Incumbent Protection", text.innerHTML);
    var subDiv = htmlElement(div, 'div', 'd-grid gap-2 col-6 mx-auto submitBtn')
    var subBtn = createButton(subDiv, 'button', 'Submit', 'btn btn-primary', 'submitButton');
    return div;
}

/**
 * Create the content for the 'districts' Tab
 * @return {Element} div container of the content
 */
function districtsTab() {
    var div = L.DomUtil.create('div');
    createTextElement(div, 'p', "View Districtings", "h1 center")
    var list = createListGroup(div);
    list.id = "districtList";
    const emptyText= "Districting Parameters have not been set :("
    var text = L.DomUtil.create('p')
    text.innerHTML = emptyText;
    list.appendChild(text);

    return div;
}

/**
 * Parses GeoJSON object to create list item
 * @param {Object} geoJSON geoJSON object representing the district
 * @return {Element} List Item element to add to list
 */
function districtListItem(geoJSON) {
    var div = L.DomUtil.create('div');
    var headerDiv = htmlElement(div, "div", 'd-fkex w-100 justify-content-between')
    var header = createTextElement(headerDiv, "h5", "Some Header Text", "mb-1");
    var content = createTextElement(div, "p", "Some random paragraph filler text", "");

    var listItem = createListItem(div, true, false);
    return listItem;
}


/* *************************************** */
/* ********** HANDLER FUNCTIONS ********** */
/* *************************************** */

/**
 * Gathers form data from the parameters tab to be sent as request
 * Clears current districts list
 * Adds new dsitricts list to the UI
 */
function submitParameters() {
    console.log("submit")
    clearDistricts();
    var districts = retrieveDistricts();
    var list = $("#districtList");
    districts.forEach(function (item) {
        list.append(districtListItem(item));
    });
    $(".nav-link.active,.tab-pane.active").removeClass('show active');
    //$(".tab-pane.active").removeClass('show active');
    $("#districts-tab,#districts").addClass('active show');
}


/* ************************************** */
/* ********** HELPER FUNCTIONS ********** */
/* ************************************** */


/**
 * Clears the List Group of districtings on the districts tab on the menu
 */
function clearDistricts() {
    $("#districtList").empty();
}


/* ********************************************************** */
/* ********** GENERIC BUILDER FUNCTIONS W/ LEAFLET ********** */
/* ********************************************************** */


/**
 * 
 * @param {Element} parent The container Element to append this to
 * @returns {Element}
 */
function createListGroup(parent) {
    var div = htmlElement(parent, "div", "list-group");
    return div;
}

/**
 * 
 * @param {Element} content Content to display within item
 * @param {boolean} action whether to add action class to element
 * @param {boolean} active whether to add active class to element
 * @return {Element}
 */
function createListItem(content, action = false, active = false) {
    var item = L.DomUtil.create('a', 'list-group-item');
    if (action) { item.classList.add("list-group-item-action"); }
    if (active) {
        item.classList.add("active");
        item.setAttribute("aria-current", "true");
    }
    item.appendChild(content);
    return item;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} id value used to attatch tab link to 'id' of tab content
 * @return {Object} Object containing the 'nav' and 'content' container elements
 */
function createTabNav(parent, id) {
    var nav = htmlElement(parent, "ul", "nav nav-tabs cust-nav", id);
    nav.setAttribute('role', 'tablist');
    var content = htmlElement(parent, "div", "tab-content", id + "Content");
    return { "nav": nav, "content": content };
}

/**
 * 
 * @param {Object} nav The 'nav' object from createTabNav()
 * @param {string} text value of the Tab text
 * @param {Element} content content to display when tab is selected
 * @param {string} id value to set 'id' attribute and link content to tab
 * @param {boolean} active 
 */
function createTab(nav, text, content, id, active = false) {
    createTabItem(nav.nav, text, active, id);
    createTabPane(nav.content, content, active, id);
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} text value to set the header text
 * @param {boolean} active whether or not to add the 'active' class
 * @param {string} id value used to attatch tab link to 'id' of tab content
 */
function createTabItem(parent, text, active, id) {
    var li = htmlElement(parent, "li", "nav-item");
    li.setAttribute('role', 'presentation')
    var button = createButton(li, "button", text, 'nav-link cust-nav-link', id + "-tab");
    button.setAttribute("data-bs-toggle", "tab");
    button.setAttribute("data-bs-target", "#" + id);
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", id);
    button.setAttribute("aria-selected", "" + active);

    if (active) {
        button.classList.add("active");
    }
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {Element} content the Element to set as the accordiion child/content
 * @param {boolean} active whether or not to add the 'active' class
 * @param {string} id value to set theS 'id' attribute to attach to tab-link
 */
function createTabPane(parent, content, active, id) {
    var div = htmlElement(parent, "div", "tab-pane fade show", id);
    div.setAttribute("role", "tabpanel");
    div.setAttribute("aria-labelledby", id + "-tab");

    if (active) {
        div.classList.add("active");
    }
    div.appendChild(content);
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} id value to set the 'id' attribute
 * @param {string} text value to set the header text
 * @param {Element} content the Element to set as the accordiion child/content
 */
function createAccordian(parent, id, text, content) {
    var accordian = htmlElement(parent, 'div', 'accordion', id + "Parent");
    var accordionItem = htmlElement(accordian, 'div', 'accordion-item');
    var header = createTextElement(accordionItem, 'p', 'Incumbents', 'accordion-header', id + "Header");
    var button = createCollapseButton(id, text);
    header.innerHTML = button;
    var collapse = createCollapseDiv(id, content);
    accordionItem.innerHTML += collapse;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} type The Element tag
 * @param {string} text value to set the innerHTML of element
 * @param {string} classes value to set the 'class' attribute (optional)
 * @param {string} id value to set theS 'id' attribute (optional)
 * @return {Element}
 */
function createButton(parent, type, text, classes, id) {
    var button = htmlElement(parent, 'button', classes, id);
    button.type = type;
    button.innerHTML = text;
    button['data-bs-toggle'] = 'collapse';
    return button;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} id value to set the 'id' attribute
 * @param {string} text value for the Label
 * @param {number} min minimum value of the slider- 'min' attribute value
 * @param {number} max maximum value of the slider- 'max'  attribute value
 * @param {number} step step value of the slider - 'step' attribute value
 * @return {Element}
 */
function createSlider(parent, id, text, min, max, step) {
    var div = htmlElement(parent, 'div', 'container');
    var range = htmlElement(div, 'div', 'range');
    createLabel(range, text, id);
    var slider = createInput(range, 'range', 'form-range', id);
    slider.min = min;
    slider.max = max;
    slider.step = step;
    var value = createLabel(range, 1, id, "range-value smalls", id + "Value");
    slider.oninput = function () {
        value.innerHTML = this.value;
    }
    return div;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} id value to set the 'id' attribute
 * @param {string} text value for the Label
 * @return {Element}
 */
function createSwitch(parent, id, text) {
    var div = htmlElement(parent, 'div', 'container')
    var switchdiv = htmlElement(div, 'div', 'form-check form-switch switch');
    var element = createInput(switchdiv, 'checkbox', 'form-check-input', id);
    createLabel(switchdiv, text, id, 'form-check-label');
    return element;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} text the text for the label
 * @param {string} labelFor value to set the 'for' attribute
 * @param {string} classes value to set the 'class' attribute (optional)
 * @return {Element}
 */
function createLabel(parent, text, labelFor, classes = 'form-label') {
    var label = htmlElement(parent, 'label', classes);
    label.innerHTML = text;
    label.for = labelFor;
    return label;
}

/**
 *
 * @param {Element} parent The container Element to append this to
 * @param {string} type The Element tag
 * @param {string} classes value to set the 'class' attribute (optional)
 * @param {string} id value to set theS 'id' attribute (optional)
 * @return {Element}
 */
function createInput(parent, type, classes, id) {
    var input = htmlElement(parent, 'input', classes, id);
    input.type = type;
    return input;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} type The Element tag
 * @param {string} text value to set the innerHTML of element
 * @param {string} classes value to set the 'class' attribute (optional)
 * @param {string} id value to set theS 'id' attribute (optional)
 * @return {Element}
 */
function createTextElement(parent, type, text, classes, id) {
    var element = htmlElement(parent, type, classes, id);
    element.innerHTML = text;
    return element;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} type The Element tag
 * @param {string} classes value to set the 'class' attribute (optional)
 * @param {string} id value to set theS 'id' attribute (optional)
 * @return {Element}
 */

function htmlElement(parent, type, classes='', id) {
    var element = L.DomUtil.create(type, classes, parent);
    if (!(typeof id === 'undefined')) {
        element.id = id;
    }
    return element;
}

function createCollapseButton(id, text) {
    return `<button class='accordion-button collapsed label' type='button' data-bs-toggle='collapse' data-bs-target='#${id}' aria-exapanded='false' aria-controls'${id}'>${text}</button>`
}
function createCollapseDiv(id, text) {
    return `<div id="${id}" class="accordion-collapse collapse" aria-labelledby="${id}Header" data-bs-parent="#${id}Parent"><div class="accordion-body">${text}</div></div>`
}

