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
        //Load initial state data
        response.item.forEach(addState);
    });

    //Add controls and layers to the map
    stateLayer.addTo(map);
    districtLayer.addTo(map);
    countyLayer.addTo(map);

    backButton = L.control.backButton({ position: 'bottomleft' });
    menu = L.control.menu({ position: 'topright' })//.addTo(map);
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
        obj.state = L.geoJson(JSON.parse(response.json))

        //Add state geometry to map
        stateLayer.addLayer(obj.state);
        obj.state.on('click', function () {
            zoomToState(obj.abbr, obj);
        });
    })

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

    //Send requests for state-level geometry if needed
    // if (!('counties' in obj)) {
        getCounties(state).then(res => {
            console.log(res)
            obj.counties = L.geoJson(JSON.parse(res.counties), {
                style: countyStyle
            });
            obj.counties.addTo(countyLayer);
        })
    // }
    // if (!('precincts' in obj)) {
        getPrecincts(state).then(res => {
            let tileIndex = geojsonvt(JSON.parse(res.precincts), precinctTileOptions);
            obj.precincts = L.gridLayer.precincts();
            obj.precincts.setTileIndex(tileIndex); 
            // obj.precincts = L.geoJson(JSON.parse(res.precincts), {
            //     style: precinctStyle
            // })
            obj.precincts.addTo(precinctLayer);
        })
    // }


    // Add state level UI controls and geometry
    layersControl.setPosition("topleft").addTo(map);
    backButton.addTo(map);
    menu.setState(obj.abbr)
    menu.addTo(map);

    //Set view to state
    bounds = obj.state.getBounds();
    map.flyToBounds(bounds);
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



