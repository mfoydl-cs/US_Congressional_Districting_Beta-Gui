var map;
var statesObj = {};
var bounds = countryBounds;

var stateLayer = new L.LayerGroup();
var districtLayer = new L.LayerGroup();
var countyLayer = new L.LayerGroup();
var precinctLayer = new L.LayerGroup();
var zoomLayer = [districtLayer, countyLayer, precinctLayer];

var overlays = { "Counties": countyLayer, "Districts": districtLayer, "Voting Districts": precinctLayer };
var layersControl = L.control.layers(null, overlays);

/**
 * Initilizes application
 */
$(document).ready(function () {
    $.ajaxSetup({ xhrFields: { withCredentials: true } });
    
    map = L.map('map');

    //Load MapBox tile data
    L.tileLayer('https://api.mapbox.com/styles/v1/mfoydl/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWZveWRsIiwiYSI6ImNrbGNqdnNocDBpZ2Qyd214bDZ2Y2piMDgifQ.nxwFI-kYDMC7ag_O8PgNhg', {
        maxZoom: 12,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'cklh2icm3065v17qfbaanb9fe',
        tileSize: 512,
        zoomOffset: -1,
    }).addTo(map);

    //Set up initial map view / constraints
    map.fitBounds(countryBounds);
    map.setMinZoom(map.getZoom());
    map.setMaxBounds([
        [23, -129], //southwest coords
        [50, -63] //northeast coords
    ]);

    //Load initial state data
    states.forEach(addState);

    //Add controls and layers to the map
    stateLayer.addTo(map);
    districtLayer.addTo(map);
    countyLayer.addTo(map);

    backButton = L.control.backButton({ position: 'bottomleft' });
    menu = L.control.menu({ position: 'topright' });
    dropdown = L.control.states({ position: 'topright' }).addTo(map);
    center = L.control.center({ position: 'topleft' }).addTo(map);
});

/**
 * Add highlight on mouseover functionality to featuregroup
 * @param {FeatureGroup} layer Leaflet FeatureGroup to be styled
 * @param {Object} style Object containing the FeatureGroups current style options
 */
function addHighlight(layer, style) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: function (e) { resetHighlight(e, style) }
    });
}

/**
 * Sets style of FeatureGroup to highlight for Event
 * @param {Event} e 
 */
function highlightFeature(e) {
    e.target.setStyle(highLightStyle);
}

/**
 * Removes highlight and resets style options when event ends
 * @param {Event} e 
 * @param {Object} style 
 */
function resetHighlight(e, style) {
    e.target.setStyle(style);
}

/**
 * Sets the style of a district feature to highlighted
 * @param {GeoJSON} district Leaflet GeoJSON to be styled 
 */
function highlightDistrict(district) {
    district.setStyle(highLightStyle);
}

/**
 * Sets the style-options of a district feature to style
 * @param {GeoJSON} district Leaflet GeoJSON to be styled
 * @param {Object} style Object containing style-options
 */
function resetDistrictHighlight(district, style) {
    district.setStyle(style);
}

/*
//Adds all layers of a Leaflet LayerGroup into another LayerGroup
function addGroup(newGroup, group) {
    newGroup.eachLayer(function (layer) {
        group.addLayer(layer);
    })
}*/
/*
//Styles all the layers of a leaflet LayerGroup
function styleGroup(layerGroup, style) {
    layerGroup.eachLayer(function (layer) {
        layer.setStyle(style);
    });
}*/
/*
// Clears the map of all features
function hideAll(group) {
    group.clearLayers();
}*/
/*
//Sets the style of each district
function styleDistrict() {
    return {
        fillColor: randomPresetColor(darkPalette),
        weight: districtStyle.weight,
        opacity: districtStyle.opacity,
        color: districtStyle.color,
        fillOpacity: districtStyle.fillOpacity
    };
}*/
/*
//Random color generator
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}*/

/**
 * Random color generator from a limited pre-determined palatte
 */
function randomPresetColor(palette) {
    return palette[Math.floor(Math.random() * palette.length)];
}

/**
 * Zoom map back out to country overview and updates controls on map accordingly
 */
function backToCountry() {
    // Remove uneeded UI controls from map
    map.removeControl(backButton);
    map.removeControl(menu);
    map.removeControl(layersControl);

    //Add country level UI controls to map
    dropdown.addTo(map);
    stateLayer.addTo(map);

    //remove state-level geometries
    zoomLayer.forEach(function (layer) { layer.clearLayers() });

    //add state outlines back to map and set view
    stateLayer.eachLayer(function (layer) { layer.setStyle(statesStyle) });
    map.flyToBounds(countryBounds);
    bounds = countryBounds;
}

/**
 * Zooms Map view to state level and updates UI options 
 * @param {String} state 
 * @param {Object} obj 
 */
function zoomToState(state, obj) {
    //Remove country-level UI controls and outline geometry
    map.removeControl(dropdown);
    stateLayer.remove();

    //Add state level UI controls and geometry
    obj.county.addTo(countyLayer);
    obj.precinct.addTo(precinctLayer);
    layersControl.setPosition("topleft").addTo(map);
    backButton.addTo(map);
    menu.setState(obj.abbr)
    menu.addTo(map);

    //Set view to state
    bounds = state.getBounds();
    map.flyToBounds(bounds);
}

/**
 * Set map view back to center of currently focused feature level (state/country)
 */
function recenter() {
    map.flyToBounds(bounds);
}


function getGeoJSON(stateAbbr) {
    var stateJSON = L.geoJson(window["" + stateAbbr + "_STATE_20"], {
        style: statesStyle,
        onEachFeature: function (feature, layer) { addHighlight(layer, statesStyle) }
    });

    var counties = L.geoJson(window["" + stateAbbr + "_COUNTY_20"], {
        style: countyStyle
    });

    var tileIndex = geojsonvt(window["" + stateAbbr + "_VTD_20"], precinctTileOptions);
    var precincts = L.gridLayer.precincts();
    precincts.setTileIndex(tileIndex);

    return {
        stateJSON: stateJSON,
        counties: counties,
        precincts: precincts,
    }
}

/**
 * Initializes State geometry and adds state to StateObj
 * @param {String} stateAbbr
 */
function addState(stateAbbr) {
    statesObj[stateAbbr] = {}
    var obj = statesObj[stateAbbr];

    obj.abbr = stateAbbr;
    obj.state = getStateOutline(stateAbbr);

    // THESE NEED TO BE ADDED AS SEPPARATE REQUESTS WHEN  STATE IS SELECTED
    //var geo = getGeoJSON(stateAbbr);
    //obj.county = geo.counties; 
    //obj.precinct = geo.precincts;
    //obj.senators = incumbentsJson[stateAbbr]["senators"];
    //obj.reps = incumbentsJson[stateAbbr]['representatives'];

    //Add state geometry to map
    stateLayer.addLayer(obj.state);
    geo.stateJSON.on('click', function () {
        zoomToState(this, obj);
    });
}

/**
 * Toggles whether a district's geometry is displayed on the map
 * @param {GeoJSON} district Leaflet GeoJSON Object for district geometry
 * @param {Boolean} checked True if district is currently displayed, otherwise false
 */
function toggleDistrict(district, checked) {
    if (checked) {
        district.addTo(districtLayer);
    }
    else {
        districtLayer.removeLayer(district);
    }
}


