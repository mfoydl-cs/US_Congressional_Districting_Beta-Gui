
//Feature Style variables
var style = {
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.5
}

var statesStyle = { //Styling for State GeoJSON features
    fillColor: '#3388FF',
    color: '#3388FF',
    weight: 2,
    opacity: 0.9,
    fillOpacity: 0.2
}

var districtStyle = { //Styling (besides color) for District GeoJSON features
    weight: 2,
    opacity: 0.6,
    color: 'white',
    fillOpacity: 0.5
}

var highLightStyle = { //Style for highlighted features
        weight: 4,
        opacity: 1,
        fillOpacity: 0.7
}

//Pastel color palette for coloring the districts
var pastelPresets = [
    "#e89af9", "#f18bf4", "#dd74f2", "#f78fd8",
    "#9bffa7", "#97ff9e", "#7fefac", "#93f9bf",
    "#f4869a", "#f18bf4", "#ed6a82", "#f780a6",
    "#f7a08f", "#ffc5c4", "#f2c091", "#ff967f",
    "#83fcdc", "#bff8ff", "#b2cef4", "#b7d5ff",
    "#fffbbf", "#f7dc8a", "#ffeeb5", "#ecf280",
    "#d4b7ff", "#e6c9ff", "#e3a0f7", "#a869e0",
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
        fillColor: randomPresetColor(pastelPresets),
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



