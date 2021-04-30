var countryZoom;

var map;

var stateLayer = new L.LayerGroup();
var districtLayer = new L.LayerGroup();
var countyLayer = new L.LayerGroup();
var precinctLayer = new L.LayerGroup();
var zoomLayer = [districtLayer, countyLayer, precinctLayer];

var overlays = { "Counties": countyLayer, "Districts": districtLayer, "Voting Districts": precinctLayer };
var layersControl = L.control.layers(null, overlays);

//Function to set up highlight on mouseover on geoFeature
function addHighlight(layer, style) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: function (e) { resetHighlight(e, style) }
    });
}

//Sets the highlight feature functionality
function highlightFeature(e) {
    e.target.setStyle(highLightStyle);
}
//Unhighlight a feature
function resetHighlight(e, style) {
    e.target.setStyle(style);
}

function highlightDistrict(district) {
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


function backToCountry() {
    map.removeControl(backButton);
    map.removeControl(menu);
    map.removeControl(layersControl);
    dropdown.addTo(map);
    stateLayer.addTo(map);
    zoomLayer.forEach(function (layer) { layer.clearLayers() });
    stateLayer.eachLayer(function (layer) { layer.setStyle(statesStyle) })
    map.flyToBounds(countryBounds);
    bounds = countryBounds;
}

var bounds = countryBounds;

function zoomToState(state, obj) {
    map.removeControl(dropdown);
    stateLayer.remove();

    obj.county.addTo(countyLayer);
    obj.precinct.addTo(precinctLayer);
    layersControl.setPosition("topleft").addTo(map);
    backButton.addTo(map);
    menu.setState(obj.abbr)
    menu.addTo(map);

    bounds = state.getBounds();
    map.flyToBounds(bounds);
}

function recenter() {
    map.flyToBounds(bounds);
}

var statesObj = {}

function getGeoJSON(stateAbbr) {
    var stateJSON = L.geoJson(window["" + stateAbbr + "_STATE_20"], {
        style: statesStyle,
        onEachFeature: function (feature, layer) { addHighlight(layer, statesStyle) }
    });

    var counties = L.geoJson(window["" + stateAbbr + "_COUNTY_20"], {
        style: countyStyle
    });
    /*
    var precincts = L.geoJson(window["" + stateAbbr + "_VTD_20"], {
        style: precinctStyle
    });*/
    var tileIndex = geojsonvt(window["" + stateAbbr + "_VTD_20"],{
        maxZoom: 12,  // max zoom to preserve detail on; can't be higher than 24
        tolerance: 10, // simplification tolerance (higher means simpler)
        extent: 4096, // tile extent (both width and height)
        buffer: 64,   // tile buffer on each side
        debug: 0,     // logging level (0 to disable, 1 or 2)
        lineMetrics: false, // whether to enable line metrics tracking for LineString/MultiLineString features
        promoteId: null,    // name of a feature property to promote to feature.id. Cannot be used with `generateId`
        generateId: false,  // whether to generate feature ids. Cannot be used with `promoteId`
        indexMaxZoom: 12,       // max zoom in the initial tile index
        indexMaxPoints: 100000 // max number of points per tile in the index
    });
    var precincts = L.gridLayer.precincts();
    precincts.setTileIndex(tileIndex);

    return {
        stateJSON: stateJSON,
        counties: counties,
        precincts: precincts,
    }
}

function addStates(stateAbbr, index) {
    statesObj[stateAbbr] = {}
    var obj = statesObj[stateAbbr];
    var geo = getGeoJSON(stateAbbr);

    obj.abbr = stateAbbr;
    obj.state = geo.stateJSON;
    obj.county = geo.counties;
    obj.precinct = geo.precincts;
    obj.senators = incumbentsJson[stateAbbr]["senators"];
    obj.reps = incumbentsJson[stateAbbr]['representatives'];

    stateLayer.addLayer(obj.state);
    geo.stateJSON.on('click', function () {
        zoomToState(this, obj);
    });
}

function toggleDistrict(district, checked) {
    if (checked) {
        district.addTo(districtLayer);
    }
    else {
        districtLayer.removeLayer(district);
    }
}

$(document).ready(function () {
    $.ajaxSetup({xhrFields: { withCredentials: true } });
    map = L.map('map');

    L.tileLayer('https://api.mapbox.com/styles/v1/mfoydl/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWZveWRsIiwiYSI6ImNrbGNqdnNocDBpZ2Qyd214bDZ2Y2piMDgifQ.nxwFI-kYDMC7ag_O8PgNhg', {
        maxZoom: 12,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'cklh2icm3065v17qfbaanb9fe',
        tileSize: 512,
        zoomOffset: -1,
    }).addTo(map);

    map.fitBounds(countryBounds);
    countryZoom = map.getZoom();
    map.setMinZoom(countryZoom);
    map.setMaxBounds([
        [23, -129], //southwest coords
        [50, -63] //northeast coords
    ]);
    states.forEach(addStates);

    stateLayer.addTo(map);
    districtLayer.addTo(map);
    countyLayer.addTo(map);

    backButton = L.control.backButton({ position: 'bottomleft' });
    menu = L.control.menu({ position: 'topright' });
    dropdown = L.control.states({ position: 'topright' }).addTo(map);
    center = L.control.center({ position: 'topleft' }).addTo(map);
});

function test(obj) {
    return obj.state.eachLayer(function (layer) { layer.setStyle(highLightStyle); console.log(layer) });
}

L.GridLayer.Precincts = L.GridLayer.extend({
    createTile: function (coords,done) {
        //var ctx = canvas.getContext('2d');
        var error;

        var leafTile = L.DomUtil.create('canvas', 'leaflet-tile');

        var size = this.getTileSize();
        leafTile.width = size.x;
        leafTile.height = size.y;

        var ctx = leafTile.getContext('2d');
        var tile = this.tileIndex.getTile(coords.z, coords.x, coords.y);
        if(!tile){
            return leafTile;
        }
        ctx.clearRect(0, 0, leafTile.width, leafTile.height);
        var features = tile.features;
        ctx.strokeStyle = 'grey';
        pad=0
        for (var i = 0; i < features.length; i++) {
            var feature = features[i],
                type = feature.type;
            ctx.beginPath();

            for (var j = 0; j < feature.geometry.length; j++) {
                var geom = feature.geometry[j];

                if (type === 1) {
                    ctx.arc(geom[0] * ratio + pad, geom[1] * ratio + pad, 2, 0, 2 * Math.PI, false);
                    continue;
                }

                for (var k = 0; k < geom.length; k++) {
                    var p = geom[k];
                    var extent = 4096;

                    var x = p[0] / extent * 256;
                    var y = p[1] / extent * 256;
                    if (k) ctx.lineTo(x + pad, y + pad);
                    else ctx.moveTo(x + pad, y + pad);
                }
            }

            ctx.stroke();
        }
        setTimeout(function () {
            done(error, tile);
        }, 1000);
        return leafTile;
    },
    setTileIndex(tileIndex){
        this.tileIndex=tileIndex
    }
});

L.gridLayer.precincts = function (opts) {
    return new L.GridLayer.Precincts(opts);
}


