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

    getStates().then(response => {
        response.item.forEach(addState);
    });

    //Add controls and layers to the map
    stateLayer.addTo(map);
    districtLayer.addTo(map);
    

    backButton = L.control.backButton({ position: 'bottomleft' });
    menu = L.control.menu({ position: 'topright' });
    dropdown = L.control.states({ position: 'topright' }).addTo(map);
    center = L.control.center({ position: 'topleft' }).addTo(map);

});

/**
 * Initializes State geometry and adds state to StateObj
 * @param {Object} state containing state abbreviation and name
 */
function addState(state) {
    let stateAbbr = state.id
    statesObj[stateAbbr] = {}
    let obj = statesObj[stateAbbr];

    obj.abbr = stateAbbr;
    obj.name = state.name;

    getStateOutline(stateAbbr).then(response => {
        obj.state = L.geoJson(JSON.parse(response.json),{
            style: statesStyle,
            onEachFeature: function (feature, layer) { addHighlight(layer, statesStyle) }
        })

        //Add state geometry to map
        stateLayer.addLayer(obj.state);
        obj.state.on('click', function () {
            zoomToState(obj);
        });

        dropdown.addState(stateAbbr);
    });

    getCounties(stateAbbr).then(res => {
        state.counties = L.geoJson(JSON.parse(res.counties), {
            style: countyStyle
        });
        state.counties.addTo(countyLayer);
    });

    getPrecincts(obj.abbr).then(res => {
        let tileIndex = geojsonvt(JSON.parse(res.precincts), precinctTileOptions);
        obj.precincts = L.gridLayer.precincts();
        obj.precincts.setTileIndex(tileIndex);
        obj.precincts.addTo(precinctLayer);
    });

}

function backToCountry() {
    // Remove uneeded UI controls from map
    map.removeControl(backButton);
    map.removeControl(menu);
    map.removeControl(layersControl);

    //Add country level UI controls to map
    dropdown.addTo(map);
    stateLayer.addTo(map);

    //remove state-level geometries
    zoomLayer.forEach(function (layer) { map.removeLayer(layer); });
    //add state outlines back to map and set view
    stateLayer.eachLayer(function (layer) { layer.setStyle(statesStyle) });
    map.flyToBounds(countryBounds);
    bounds = countryBounds;
}

/**
 * Zooms Map view to state level and updates UI options 
 * @param {Object} state 
 */
function zoomToState(state) {
    console.log("?")
    //Remove country-level UI controls and outline geometry
    map.removeControl(dropdown);
    stateLayer.remove();

    countyLayer.addTo(map);
    districtLayer.clearLayers();
    districtLayer.addTo(map);

    // Add state level UI controls and geometry
    layersControl.setPosition("topleft").addTo(map);
    backButton.addTo(map);
    menu.setState(state.abbr);
    menu.addTo(map);

    //Set view to state
    bounds = state.state.getBounds();
    map.flyToBounds(bounds);

    //zoomLayer.forEach(function (layer) { layer.addTo(map) });

}

/**
 * Set map view back to center of currently focused feature level (state/country)
 */
function recenter() {
    map.flyToBounds(bounds);
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



function randomPresetColor(palette) {
    return palette[Math.floor(Math.random() * palette.length)];
}



