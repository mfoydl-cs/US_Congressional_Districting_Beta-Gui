/* ********** CUSTOM LEAFLET UI CONTROL DEFINITIONS ********** */

const constraintsDataFormat = {
    'count': { 'label': 'Districtings Returned: ', 'value': 0},
    'avg-compactness': { 'label': 'Average Compactness: ', 'type': '', 'value': 0},
    'avg-maj-min': { 'label': 'Average Majority-Minority Districts: ', 'value': 0},
    'population-diff': { 'label': 'Average Population Difference: ', 'type': '', 'value': 0},
}

/**
 * 
 */
L.Control.Center = L.Control.extend({
    onAdd: function (map) {
        var img = L.DomUtil.create('img', 'sideBtn');
        img.src = './center.png';
        img.innerHTML = "<span class='tooltiptext'>re-center map</span>";

        L.DomEvent.on(img, 'click', function (ev) {
            recenter();
        });

        return img;


    },
    onRemove: function (map) { }
});

/**
 * 
 * @param {*} opts 
 */
L.control.center = function (opts) {
    return new L.Control.Center(opts);
}

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
        L.DomEvent.disableScrollPropagation(div);

        var nav = createTabNav(div, "menuNav");

        this.constraintsData = constraintsDataFormat;

        createTab(nav, "Jobs", jobsTab(this.state), 'jobs', true)//Jobs Tab
        createTab(nav, "Constraints", constraintsTab(this.state,this), "constraints",false,true); //Constraints Tab
        createTab(nav, "Constrain Results", constraintsSummaryTab(this.constraintsData), 'constraintsSummary',false,true)//Summary Tab
        createTab(nav, "Measures", measuresTab(this.state), "measures",false,true); //Measures Tab
        createTab(nav, "Top Districtings", districtsTab(this.state), "districts",false,true); //Districtings Tab

        $(document).ready(function () {
            $('#constraintsSummary-tab').hide(); //Hide the physical tab, content accesssed through buttons
        });

        return div;
    },
    onRemove: function (map) { },
    setState: function (state) {
        this.state = state //Keep track of the current state selected
    },
    setConstraintsData: function(data){
        this.constraintsData = data;
        Object.keys(data).forEach(function (key) {
            $("#" + key + "ConSummaryLabel").html(data[key].label)
            var value = $("#" + key + "ConSummaryValue")
            value.html(data[key].value)
            if (data[key].type) {
                value.append(" <i>[" + data[key].type + "]</i>");
            }
        });
    }
});

/**
 * Factory function for the menu control
 * @param {Object} opts Leaflet options object
 */
L.control.menu = function (opts) {
    return new L.Control.Menu(opts);
}

/* **********   SPECIFIC BUILDER FUNCTIONS W/ LEAFLET  ********** */

function jobsTab(state) {
    var jobs = getJobsSummary(state)['jobs-summary'];

    var container = L.DomUtil.create('div');

    var headerDiv = htmlElement(container, 'div', 'center tabContentTitle mb-3');
    createTextElement(headerDiv, 'h5', 'Select a Job', 'h5');


    var bodyDiv = htmlElement(container, 'div');
    var list = createListGroup(bodyDiv);
    list.id = 'jobList';
    list.classList.add('list-group-flush');

    jobs.forEach(function (job) {
        list.appendChild(jobListItem(job));
    });

    return container;
}

function jobListItem(job) {
    var container = L.DomUtil.create('div');

    var headerDiv = htmlElement(container, "div", 'd-flex w-100 justify-content-between');
    createTextElement(headerDiv, "h5", job.name, "mb-1 center");

    var content = htmlElement(container, 'div', 'container');
    createTextElement(content, 'p', 'Rounds: ' + job.rounds);
    createTextElement(content, 'p', 'Cooling-Period: ' + job['cooling-period']);

    var footer = htmlElement(container, 'div', 'd-grid gap-2');
    var selectBtn = createButton(footer, 'button', 'Select', 'btn btn-primary', 'select-' + job.name);

    L.DomEvent.on(selectBtn, 'click', function (ev) { selectJob(job.name) });

    return createListItem(container, false, false);
}

/**
 * Creates the content for the 'params' tab
 * @return {Element} div container of the content
 */
function constraintsTab(state,menu) {

    var div = L.DomUtil.create('div');  //Main Container

    var headerDiv = htmlElement(div, 'div', 'center tabContentTitle mb-3');
    createTextElement(headerDiv, 'h5', 'Job Subset Constraints', 'h5');

    var constraints = htmlElement(div, 'div', 'container');

    //Constraints Sliders
    createSlider(constraints, 'compactness-constraint', 'Compactness', 0, 1, 0.1);
    createSlider(constraints, 'majmin-constraint', 'Majority-Minority Districts (>=)', 0, 10, 1);
    createSlider(constraints, 'population-constraint', 'Population Difference (<=%)', 0, 3, 0.1);

    //Incumbents Protection Menu
    var incumbentsDiv = htmlElement(constraints, 'div', 'container')
    createLabel(incumbentsDiv, 'Incumbent Protection: &emsp;&emsp;', 'incumbentsLink')
    var incumbents = createTextElement(incumbentsDiv, 'a', 'Set Protections', 'modal-link', 'incumbentsLink');
    incumbents.setAttribute('data-bs-toggle', 'modal');
    incumbents.setAttribute('data-bs-target', '#incumbentsModal');

    var incumbentsList = incumbentsContent(state);
    var incumbentsModal = modalDialog('incumbentsModal', 'Protect Incumbents', incumbentsList);
    $('body').append(incumbentsModal);

    //Compactness and Population Options menu
    var compactnessRadioLabels = [
        { 'label': 'Graph Compactness', 'value': 'graph', 'checked': true },
        { 'label': 'Population Fatness', 'value': 'fatness' },
        { 'label': 'Polsby-Popper', 'value': 'polsby' }
    ];
    var populationRadioLabels = [
        { 'label': 'Total Population', 'value': 'total', 'checked': true },
        { 'label': 'Voting Age Population (TVAP)', 'value': 'tvap', 'disabled': true },
        { 'label': 'Citizen Voting Age Population', 'value': 'cvap', 'disabled': true }
    ]

    var optionsContainer = L.DomUtil.create('div');
    createRadioGroup(optionsContainer, compactnessRadioLabels, "Compactness Measure", "compactnessRadio");
    createRadioGroup(optionsContainer, populationRadioLabels, "Population Constraint-Type", "populationRadio");
    createAccordian(constraints, 'compactnessAccordion', '<i>options</i>', optionsContainer);

    //Submit Buttons
    var subDiv = htmlElement(div, 'div', 'd-grid gap-2 col-6 mx-auto submitBtn')
    var subBtn = createButton(subDiv, 'button', 'Submit', 'btn btn-primary btn-lg', 'submitButton');

    //Event Handler
    L.DomEvent.on(subBtn, 'click', function (ev) { submitConstraints('',menu) })

    return div;
}

function constraintsSummaryTab(data,menu) {
    var container = L.DomUtil.create('div'); //Contianer div

    //Header Elements
    var headerDiv = htmlElement(container, 'div', 'center tabContentTitle mb-3');;
    createTextElement(headerDiv,'h5','Constraints Results','h5');// Page title

    var body = htmlElement(container, 'div', 'data-table',); //Content container
    Object.keys(data).forEach(function(key){
        var row = htmlElement(body,'div','row');
        createTextElement(row,'p',data[key].label+data[key].value,'col',key+"ConSummaryLabel");
        var value = createTextElement(row, 'p', data[key].value, 'col', key + "ConSummaryValue");
        if (data[key].type){
            value.innerHTML+= "("+data[key].type+")";
        }
    });

    //Footer elements
    var footer = htmlElement(container, 'div', 'row');
    var left = htmlElement(footer,'div','col d-grid gap-2');
    var right = htmlElement(footer, 'div', 'col d-grid gap-2');
    var back = createButton(left, 'button', 'Back', 'btn btn-secondary btn-lg');
    var next = createButton(right, 'button', 'Next', 'btn btn-primary btn-lg');

    L.DomEvent.on(back, 'click', function (ev) { switchTabContent('constraints-tab', 'constraints');disableTab('measures');disableTab('districts') })
    L.DomEvent.on(next, 'click', function (ev) { switchTabs('measures') });

    return container;
}

function measuresTab(state) {
    var div = L.DomUtil.create('div');
    var headerDiv = htmlElement(div, 'div', 'center tabContentTitle mb-3');
    createTextElement(headerDiv,'h5','Objective Function Weights','h5');

    var measures = htmlElement(div, 'div', 'container');

    createSlider(measures, 'population-equality', 'Population Equality', 0, 1, 0.1);
    createSlider(measures, 'avgerage-deviation', 'Deviation from Average Districting', 0, 1, 0.1);
    createSlider(measures, 'enacted-deviation', 'Deviation from Enacted Plan', 0, 1, 0.1);
    createSlider(measures, 'compactness', 'Compactness', 0, 1, 0.1);
    createSlider(measures, 'political-fairness', 'Political Fairness', 0, 1, 0.1);
    createSwitch(measures, 'split-counties', "Allow Split Counties");


    var subDiv = htmlElement(div, 'div', 'd-grid gap-2 col-6 mx-auto submitBtn')
    var subBtn = createButton(subDiv, 'button', 'Submit', 'btn btn-primary btn-lg', 'submitButton');

    L.DomEvent.on(subBtn, 'click', function (ev) { submitMeasures(state) })
    return div;
}
/**
 * Create the content for the 'districts' Tab
 * @return {Element} div container of the content
 */
function districtsTab(state) {
    var div = L.DomUtil.create('div');
    createTextElement(div, 'p', "View Districtings", "h1 center")
    var list = createListGroup(div);
    list.id = "districtList";
    const emptyText = "Districting Parameters have not been set :("
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
    var id = geoJSON.features[0].properties.CDSESSN;

    var div = L.DomUtil.create('div');

    var headerDiv = htmlElement(div, "div", 'd-flex w-100 justify-content-between');
    createTextElement(headerDiv, "h5", id, "mb-1");
    var check = L.DomUtil.create("input", "form-check-input", headerDiv);
    check.type = "checkbox";

    var contentDiv = htmlElement(div, "div", 'd-flex w-100 justify-content-between');
    createTextElement(contentDiv, "p", "Score: XXX", "");
    var link = createTextElement(contentDiv,'a','<em>more info</em>','modal-link')

    //District List for Info Tab
    var listgroupContainer = L.DomUtil.create('div');

    var districtList = createListGroup(listgroupContainer);
    districtList.classList.add('list-group-flush');
    var featureGroup = new L.LayerGroup();
    
    var district = L.geoJson(geoJSON, {
        onEachFeature: function (feature, layer) {
            var featureJson = L.geoJson(feature);
            featureJson.addTo(featureGroup);
            districtList.appendChild(districtAccordionItem(feature, featureJson))
        }}
    );
    var listItem = createListItem(div, false, false);


    //Info Page
    var infoContainer = L.DomUtil.create('div');
    var infoHeader = htmlElement(infoContainer,'div');
    createTextElement(infoHeader,'h5',id,'h5');
    var infoBody = htmlElement(infoContainer,'div');
    createAccordian(infoBody, "Dist" + id, "districts", listgroupContainer);
    var infoFooter = htmlElement(infoContainer, 'div','d-grid gap-2');

    var back = createButton(infoFooter, 'button', 'Back', 'btn btn-secondary btn-lg ');
 
    L.DomEvent.on(check, 'click', function (ev) {
        toggleDistrict(featureGroup, check.checked);
    });

    L.DomEvent.on(link,'click',function(ev){
        showDistrictInfo(infoContainer,featureGroup);
    });

    L.DomEvent.on(back, 'click', function (ev) { 
        showDistrictList(infoContainer,featureGroup);
    });

    return listItem;
}

function districtAccordionItem(district, feature) {
    var id = "CD" + district.properties.CDSESSN + district.properties["CD" + district.properties.CDSESSN + "FP"]
    var div = L.DomUtil.create('div', 'd-flex w-100 justify-content-between');
    div.id = id;
    //var div = htmlElement(div, "div", 'd-flex w-100 justify-content-between',id);
    var p = createTextElement(div, 'p', "District " + district.properties["CD" + district.properties.CDSESSN + "FP"])
    var colorPicker = createInput(div, 'color');

    addDistrictHightlight(feature, div);

    var item = createListItem(div, true, false);
    return item;
}

function incumbentsContent(state) {

    var div = L.DomUtil.create('div');

    createTextElement(div, 'p', "Senators", "h5");
    statesObj[state]['senators'].forEach(function (senator) {
        var elem = createSwitch(div, senator.name, senator.name + " <em>[" + senator.party + "]</em>");
        elem.classList.add(senator.party);
        elem.setAttribute('checked', 'true')
    });
    createTextElement(div, 'p', "Representatives", "h5");
    statesObj[state]['reps'].forEach(function (rep) {
        var elem = createSwitch(div, rep.name, rep.name + " -<em> " + rep.district + ' District ' + " [" + rep.party + "]</em>");
        elem.classList.add(rep.party);
        elem.setAttribute('checked', 'true');
    });

    return div;
}
// Add Analysis Tab?


/* *************************************** */
/* ********** HANDLER FUNCTIONS ********** */
/* *************************************** */

/**
 * Gathers form data from the parameters tab to be sent as request
 * Clears current districts list
 * Adds new dsitricts list to the UI
 */
function submitMeasures(state) {

    clearDistricts();
    var list = $("#districtList");

    var districts = retrieveDistricts(state);

    districts.forEach(function (item) {
        list.append(districtListItem(item));
    });

    switchTabs('districts')
}

function addDistrictHightlight(district, div) {
    L.DomEvent.on(div, 'mouseover', function (ev) { highlightDistrict(district) });
    L.DomEvent.on(div, 'mouseout', function (ev) { resetDistrictHighlight(district, districtStyle) })
}

function selectJob(job) {
    disableTab('measures')
    disableTab('districts')
    switchTabs('constraints');
}

function submitConstraints(constraints,menu) {
    menu.setConstraintsData(constrainJob(constraints));
    switchTabContent('constraints-tab', 'constraintsSummary');
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

function switchTabs(id) {
    enableTab(id);
    $(".nav-link.active,.tab-pane.active").attr({ 'aria-selected': 'false' }).removeClass('active show');
    $("#" + id + "-tab").addClass('active').attr({ 'aria-selected': 'true' });;
    $("#" + id).addClass('active show').attr({ 'aria-selected': 'true' });
    
    //$("#" + id + "-tab").attr({ 'aria-selected': 'true' });
}

function switchTabContent(tabid, contentid) {
    $(".tab-pane.active").attr({ 'aria-selected': 'false' }).removeClass('active show');
    $("#" + contentid).addClass('active show').attr({ 'aria-selected': 'true' });

    $("#" + tabid).attr({ "data-bs-target": "#" + contentid });
    $("#" + tabid).attr({ "aria-controls": contentid });
    $("#" + contentid).attr({ "aria-labelledby": tabid + "-tab" });


}

function enableTab(id){
    var tab = $("#" + id + '-tab');
    tab.attr({ 'aria-disabled': 'false' });
    tab.removeClass('disabled')
}

function disableTab(id){
    var tab = $("#" + id + '-tab');
    tab.attr({ 'aria-disabled': 'true' });
    tab.addClass('disabled')
}

function showDistrictInfo(info,featureGroup){
    var districtList = $("#districtList");
    districtList.parent().append(info);
    districtList.hide();
}

function showDistrictList(info,featureGroup){
    info.remove();
    $("#districtList").show();
}


/* ********************************************************** */
/* ********** GENERIC BUILDER FUNCTIONS W/ LEAFLET ********** */
/* ********************************************************** */

function modalDialog(id, headerText, bodyContent) {
    var fade = L.DomUtil.create('div', 'modal fade');
    fade.id = id;
    fade.setAttribute('tabindex', '-1');
    fade.setAttribute('aria-labelledby', id + 'Label');
    fade.setAttribute('aria-hidden', 'true');

    var dialog = htmlElement(fade, 'div', 'modal-dialog');
    var content = htmlElement(dialog, 'div', 'modal-content');

    var header = htmlElement(content, 'div', 'modal-header');
    var title = createTextElement(header, 'h5', headerText, 'modal-title', id + "Label");
    var close = createButton(header, 'button', '', 'btn-close');
    close.setAttribute('data-bs-dismiss', 'modal');
    close.setAttribute('aria-label', 'Close');

    var body = htmlElement(content, 'div', 'modal-body');
    body.appendChild(bodyContent);

    var footer = htmlElement(content, 'div', 'modal-footer');
    var closeBtn = createButton(footer, 'button', 'Confirm', 'btn btn-primary');
    closeBtn.setAttribute('data-bs-dismiss', 'modal');

    //var saveBtn = createButton(footer, 'button','Save','btn btn-primary');
    return fade;
}

function createSelect(parent, options, label, id) {
    var select = htmlElement(parent, 'select', 'form-select', id);
    select.setAttribute('aria-label', label);
    options.forEach(function (opt) {
        var option = createTextElement(select, 'option', opt);
        option.setAttribute('value', opt);
    });

    select.firstChild.setAttribute('selected', 'selected');
    return select;
}

function createRadioGroup(parent, labelVals, label, name) {
    var group = htmlElement(parent, 'div', 'container');
    createLabel(group, label);
    labelVals.forEach(function (val) {
        group.appendChild(createRadioButton(val.label, name, val.value, val.disabled, val.checked, name + "-" + val.value));
    });
    return group;
}

function createRadioButton(labelText, name, value, disabled, checked, id) {
    var container = L.DomUtil.create('div', 'form-check');
    var input = createInput(container, 'radio', 'form-check-input', id);
    input.setAttribute('name', name);
    input.setAttribute('value', value);
    if (disabled) {
        input.setAttribute('disabled', 'disabled')
    }
    if (checked) {
        input.setAttribute('checked', 'checked')
    }
    createLabel(container, labelText, id, 'form-check-label');

    return container;
}

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
function createTab(nav, text, content, id, active = false, disabled = false) {
    createTabItem(nav.nav, text, active, id, disabled);
    createTabPane(nav.content, content, active, id);
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} text value to set the header text
 * @param {boolean} active whether or not to add the 'active' class
 * @param {string} id value used to attatch tab link to 'id' of tab content
 */
function createTabItem(parent, text, active, id, disabled) {
    var li = htmlElement(parent, "li", "nav-item");
    li.setAttribute('role', 'presentation')
    var button = createButton(li, "button", text, 'nav-link cust-nav-link', id + "-tab");
    button.setAttribute("data-bs-toggle", "tab");
    button.setAttribute("data-bs-target", "#" + id);
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", id);
    button.setAttribute("aria-selected", "" + active);
    if(disabled){
        button.setAttribute('aria-disabled', 'true');
        button.classList.add('disabled')
    }

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
    var header = createTextElement(accordionItem, 'p', '', 'accordion-header', id + "Header");
    var button = createCollapseButton(id, text);
    header.appendChild(button);
    var collapse = createCollapseDiv(id, content);
    accordionItem.appendChild(collapse);
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

function htmlElement(parent, type, classes = '', id) {
    var element = L.DomUtil.create(type, classes, parent);
    if (!(typeof id === 'undefined')) {
        element.id = id;
    }
    return element;
}

function createCollapseButton(id, text) {
    //return `<button class='accordion-button collapsed label' type='button' data-bs-toggle='collapse' data-bs-target='#${id}' aria-exapanded='false' aria-controls'${id}'>${text}</button>`
    var button = L.DomUtil.create('button', 'accordion-button collapsed');
    button.type = 'button'
    button.setAttribute('data-bs-toggle', 'collapse')
    button.setAttribute('data-bs-target', "#" + id)
    button.setAttribute('aria-expanded', 'false')
    button.setAttribute('aria-controls', id)
    button.innerHTML = text;
    return button;
}
/*
function createCollapseDiv(id, text) {
    return `<div id="${id}" class="accordion-collapse collapse" aria-labelledby="${id}Header" data-bs-parent="#${id}Parent"><div class="accordion-body">${text}</div></div>`
}*/

function createCollapseDiv(id, content) {
    var div = L.DomUtil.create('div', 'accordion-collapse collapse')
    div.id = id;
    div.setAttribute("aria-labelledby", id + "Header");
    div.setAttribute("data-bs-parent", "#" + id + "Parent");

    divChild = htmlElement(div, 'div', 'accordion-body');

    divChild.appendChild(content);

    return div;
}