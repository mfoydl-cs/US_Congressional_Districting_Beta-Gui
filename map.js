const countryBounds = [[20, -127], [53, -65]]; //-127.70507812500001,20.4270128142574,-65.87402343750001,53.4357192066942
var countryZoom;
const states = ["AL", "AR", "MI"];

var map;

var stateLayer = new L.LayerGroup();
var districtLayer = new L.LayerGroup();
var countyLayer = new L.LayerGroup();
var zoomLayer = [districtLayer, countyLayer];

var overlays = { "Counties": countyLayer, "Districts": districtLayer };
var layersControl = L.control.layers(null, overlays);

//Feature Style variables
const style = {
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.5
}

const statesStyle = { //Styling for State GeoJSON features
    fillColor: '#3388FF',
    color: '#3388FF',
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.2
}

const districtStyle = { //Styling (besides color) for District GeoJSON features
    weight: 2,
    opacity: 0.6,
    color: 'white',
    fillOpacity: 0.5,
    fillColor: 'red'
}

const highLightStyle = { //Style for highlighted features
    weight: 4,
    opacity: 1,
    fillOpacity: 0.7
}

const countyStyle = {
    weight: 2,
    opacity: 1,
    fillOpacity: 0,
    color: 'white',
    dashArray: '3 8'
}

//Pastel color palette for coloring the districts
const pastelPalette = [
    "#e89af9", "#f18bf4", "#dd74f2", "#f78fd8",
    "#9bffa7", "#97ff9e", "#7fefac", "#93f9bf",
    "#f4869a", "#f18bf4", "#ed6a82", "#f780a6",
    "#f7a08f", "#ffc5c4", "#f2c091", "#ff967f",
    "#83fcdc", "#bff8ff", "#b2cef4", "#b7d5ff",
    "#fffbbf", "#f7dc8a", "#ffeeb5", "#ecf280",
    "#d4b7ff", "#e6c9ff", "#e3a0f7", "#a869e0",
]

const darkPalette = [
    "#1a7003", "#6d8908", "#019356", "#08876f", "#66a310", //Greens
    "#992300", "#ba3f01", "#961b06", "#960f30", "#b73110", //Reds
    "#04838e", "#0b557c", "#0faf9f", "#0b7e82", "#004e66", //Blues
    "#28056d", "#053177", "#0d3393", "#05005b", "#033d60", //Dark-blues
    "#ccbf14", "#ddda0f", "#e0c816", "#cc7f0c", "#e0a016", //Yellows
    "#ba3e09", "#e27216", "#e05804", "#d63f08", "#ff652d", //Oranges
    "#af08d8", "#520d84", "#c10d97", "#680c96", "#7b12cc", //Purples
]

//Function to set up highlight on mouseover on geoFeature
function addHighlight(layer, style) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: function(e) {resetHighlight(e,style)}
    });
}

//Sets the highlight feature functionality
function highlightFeature(e) {
    e.target.setStyle(highLightStyle);
}
//Unhighlight a feature
function resetHighlight(e,style) {
    e.target.setStyle(style);
}

function highlightDistrict(district){
    console.log("hi")
    district.setStyle(highLightStyle);
}

function resetDistrictHighlight(district, style) {
    district.setStyle(style);
}

//Adds all layers of a Leaflet LayerGroup into another LayerGroup
function addGroup(newGroup, group) {
    newGroup.eachLayer(function (layer) {
        group.addLayer(layer);
    })
}

//Styles all the layers of a leaflet LayerGroup
function styleGroup(layerGroup, style) {
    layerGroup.eachLayer(function (layer) {
        layer.setStyle(style);
    });
}

// Clears the map of all features
function hideAll(group) {
    group.clearLayers();
}

//Sets the style of each district
function styleDistrict() {
    return {
        fillColor: randomPresetColor(darkPalette),
        weight: districtStyle.weight,
        opacity: districtStyle.opacity,
        color: districtStyle.color,
        fillOpacity: districtStyle.fillOpacity
    };
}

//Random color generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//Random color generator from a limited pre-determined palatte
function randomPresetColor(palette) {
    return palette[Math.floor(Math.random() * palette.length)];
}


function backToCountry(){
    map.removeControl(backButton);
    map.removeControl(menu);
    map.removeControl(layersControl);
    stateLayer.addTo(map);
    zoomLayer.forEach(function (layer) { layer.remove(); layer.clearLayers() });
    map.flyToBounds(countryBounds);
    bounds = countryBounds;
    
}

var bounds = countryBounds;

function zoomToState(state,obj){

    stateLayer.remove();

    obj.county.addTo(countyLayer);

    zoomLayer.forEach(function (layer) { layer.addTo(map) })

    layersControl.setPosition("topleft").addTo(map);

    backButton.addTo(map);
    menu.addTo(map);

    bounds = state.getBounds();
    map.flyToBounds(bounds);
}

function recenter(){
    map.flyToBounds(bounds);
}

var statesObj = {}

function addStates(stateAbbr, index) {
    statesObj[stateAbbr] = {}
    var obj = statesObj[stateAbbr];

    var stateJSON = L.geoJson(window["" + stateAbbr + "_STATE_20"], {
        style: statesStyle,
        onEachFeature: function (feature, layer) { addHighlight(layer, statesStyle) }
    });

    var counties = L.geoJson(window["" + stateAbbr + "_COUNTY_20"], {
        style: countyStyle
    })

    obj.state = stateJSON;
    obj.county = counties;

    stateLayer.addLayer(obj.state);

    stateJSON.on('click', function () {
        zoomToState(this,obj);
    });



}

function toggleDistrict(district,checked){
    if(checked){
        district.addTo(districtLayer);
    }
    else{
        districtLayer.removeLayer(district);
    }
}

$(document).ready(function () {
    map = L.map('map');

    L.tileLayer('https://api.mapbox.com/styles/v1/mfoydl/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWZveWRsIiwiYSI6ImNrbGNqdnNocDBpZ2Qyd214bDZ2Y2piMDgifQ.nxwFI-kYDMC7ag_O8PgNhg', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'cklh2icm3065v17qfbaanb9fe',
        tileSize: 512,
        zoomOffset: -1,
    }).addTo(map);
    
    //map.
    map.fitBounds(countryBounds);
    countryZoom = map.getZoom();
    map.setMinZoom(countryZoom);
    //map.setMaxBounds(countryBounds);

    states.forEach(addStates);


    stateLayer.addTo(map);
    districtLayer.addTo(map);
    countyLayer.addTo(map);


    backButton = L.control.backButton({ position: 'bottomleft' });

    menu = L.control.menu({ position: 'topright' });

    center = L.control.center({position:'topleft'}).addTo(map);
    
});



