/**
 * Parses GeoJSON object to create list item
 * @param {Object} geoJSON geoJSON object representing the district
 * @return {Element} List Item element to add to list
 */
class EnactedDistricting extends Districting {
	constructor(geoJson, scores, dicTab) {
		// maybe one day dicTab won't be global...
		super(scores, dicTab, 'Enacted Districting')
        this.geoJSON = geoJson;
        this.featureGroup = new L.LayerGroup();
		this.count = 1;
		this.id = 'enacted';
		L.geoJson(this.geoJSON, {
			onEachFeature: this.processDistrict
		});
	}
}
