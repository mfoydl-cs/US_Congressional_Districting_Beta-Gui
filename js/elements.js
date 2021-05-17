/* ********************************************************** */
/* ********** GENERIC BUILDER FUNCTIONS W/ LEAFLET ********** */
/* ********************************************************** */

function modalDialog(id, headerText, bodyContent, callback) {
  let fade = L.DomUtil.create('div', 'modal fade');
  fade.id = id;
  fade.setAttribute('tabindex', '-1');
  fade.setAttribute('aria-labelledby', id + 'Label');
  fade.setAttribute('aria-hidden', 'true');

  let dialog = htmlElement(fade, 'div', 'modal-dialog');
  let content = htmlElement(dialog, 'div', 'modal-content');

  let header = htmlElement(content, 'div', 'modal-header');
  createTextElement(header, 'h5', headerText, 'modal-title', id + "Label"); //Title
  let close = createButton(header, 'button', '', 'btn-close');
  close.setAttribute('data-bs-dismiss', 'modal');
  close.setAttribute('aria-label', 'Close');

  let body = htmlElement(content, 'div', 'modal-body');
  body.appendChild(bodyContent);

  let footer = htmlElement(content, 'div', 'modal-footer');
  let closeBtn = createButton(footer, 'button', 'Done', 'btn btn-primary');
  closeBtn.setAttribute('data-bs-dismiss', 'modal');

  if (callback) {
    L.DomEvent.on(closeBtn, 'click', callback);
  }

  return fade;
}

function createSelect(parent, options, label, id) {
  let select = htmlElement(parent, 'select', 'form-select', id);
  select.setAttribute('aria-label', label);
  options.forEach(function (opt) {
    let option = createTextElement(select, 'option', opt);
    option.setAttribute('value', opt);
  });

  select.firstChild.setAttribute('selected', 'selected');
  return select;
}

function createRadioGroup(parent, labelVals, label, name) {
  let group = htmlElement(parent, 'div', 'container');
  createLabel(group, label);
  labelVals.forEach(function (val) {
    group.appendChild(createRadioButton(val.label, name, val.value, val.disabled, val.checked, name + "-" + val.value));
  });
  return group;
}

function createRadioButton(labelText, name, value, disabled, checked, id) {
  let container = L.DomUtil.create('div', 'form-check');
  let input = createInput(container, 'radio', 'form-check-input', id);
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
  let div = htmlElement(parent, "div", "list-group");
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
  let item = L.DomUtil.create('a', 'list-group-item');
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
  let nav = htmlElement(parent, "ul", "nav nav-tabs cust-nav", id);
  nav.setAttribute('role', 'tablist');
  let content = htmlElement(parent, "div", "tab-content", id + "Content");
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
  let li = htmlElement(parent, "li", "nav-item");
  li.setAttribute('role', 'presentation')
  let button = createButton(li, "button", text, 'nav-link cust-nav-link', id + "-tab");
  button.setAttribute("data-bs-toggle", "tab");
  button.setAttribute("data-bs-target", "#" + id);
  button.setAttribute("role", "tab");
  button.setAttribute("aria-controls", id);
  button.setAttribute("aria-selected", "" + active);
  if (disabled) {
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
  let div = htmlElement(parent, "div", "tab-pane fade show", id);
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
  let accordian = htmlElement(parent, 'div', 'accordion', id + "Parent");
  let accordionItem = htmlElement(accordian, 'div', 'accordion-item');
  let header = createTextElement(accordionItem, 'p', '', 'accordion-header', id + "Header");
  let button = createCollapseButton(id, text);
  header.appendChild(button);
  let collapse = createCollapseDiv(id, content);
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
  let button = htmlElement(parent, 'button', classes, id);
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
function Slider(parent, id, text, min, max, step) {
  let div = htmlElement(parent, 'div', 'container');
  let range = htmlElement(div, 'div', 'range');
  createLabel(range, text, id);
  let slider = createInput(range, 'range', 'form-range', id);
  slider.min = min;
  slider.max = max;
  slider.step = step;
  let value = createLabel(range, slider.value, id, "range-value smalls", id + "Value");
  slider.oninput = function () {
    value.innerHTML = this.value;
  }
  return div;
}

function createSlider(parent, id, text, min, max, step, abbr) {

  let tr = L.DomUtil.create('tr', 'd-flex', parent);

  //let slider = Slider(tr,id,text,min,max,step);
  let labelCol = L.DomUtil.create('div', 'slider-flex-label overflow-ellipsis', tr);
  let rangeCol = L.DomUtil.create('div', 'slider-flex-slider', tr);
  let valueCol = L.DomUtil.create('div', 'slider-flex-value', tr);

  let range = htmlElement(rangeCol, 'div', 'range');

  let p = L.DomUtil.create('p', 'overflow-ellipsis', labelCol)
  let abbrEl = L.DomUtil.create('abbr', '', p);
  abbrEl.setAttribute('title', text)
  abbrEl.innerHTML = abbr;
  //createLabel(labelCol, abbr, id);

  let slider = createInput(range, 'range', 'form-range', id);
  slider.min = min;
  slider.max = max;
  slider.step = step;
  let decimals = text === 'Compactness' ? 2 : 1;
  let value = createLabel(valueCol, Number(slider.value).toFixed(decimals), id, "range-value smalls", id + "Value");
  slider.oninput = function () {
    value.innerHTML = Number(this.value).toFixed(decimals);
  }

  return tr;
}

/**
 * 
 * @param {Element} parent The container Element to append this to
 * @param {string} id value to set the 'id' attribute
 * @param {string} text value for the Label
 * @return {Element}
 */
function createSwitch(parent, id, text) {
  let div = htmlElement(parent, 'div', 'container')
  let switchdiv = htmlElement(div, 'div', 'form-check form-switch switch');
  let element = createInput(switchdiv, 'checkbox', 'form-check-input', id);
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
  let label = htmlElement(parent, 'label', classes);
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
  let input = htmlElement(parent, 'input', classes, id);
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
  let element = htmlElement(parent, type, classes, id);
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
  let element = L.DomUtil.create(type, classes, parent);
  if (!(typeof id === 'undefined')) {
    element.id = id;
  }
  return element;
}

function createCollapseButton(id, text) {
  //return `<button class='accordion-button collapsed label' type='button' data-bs-toggle='collapse' data-bs-target='#${id}' aria-exapanded='false' aria-controls'${id}'>${text}</button>`
  let button = L.DomUtil.create('button', 'accordion-button collapsed');
  button.type = 'button'
  button.setAttribute('data-bs-toggle', 'collapse')
  button.setAttribute('data-bs-target', "#" + id)
  button.setAttribute('aria-expanded', 'false')
  button.setAttribute('aria-controls', id)
  button.innerHTML = text;
  return button;
}

function createCollapseDiv(id, content) {
  let div = L.DomUtil.create('div', 'accordion-collapse collapse')
  div.id = id;
  div.setAttribute("aria-labelledby", id + "Header");
  div.setAttribute("data-bs-parent", "#" + id + "Parent");

  divChild = htmlElement(div, 'div', 'accordion-body');

  divChild.appendChild(content);

  return div;
}
