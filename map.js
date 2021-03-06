
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
    fillOpacity: 0.5
}

const highLightStyle = { //Style for highlighted features
        weight: 4,
        opacity: 1,
        fillOpacity: 0.7
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



