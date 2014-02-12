$(function (){
	layers = []

	types = ['snow','drought','tornado','pollution','drought','flood']
	instance = true;
	//Mapping
	var map = L.mapbox.map('map', 'djohnson.map-1vkng6p4', { zoomControl: false })
		.setView([38.908, -77.02], 4);
	map._layersMinZoom = 2
	map._layersMaxZoom = 7

	var renderDistricts = function(types){
				// Clear old layers
		$.each(layers, function(i, l){
			l.clearLayers();
		});

		districts = $.getJSON("districts.json", function(d) {
			$.each(types, function (i,type){
				if (instance) {
					document.getElementById('info').innerHTML = "<div class='pad2'><h2>Climate Change and Retiring Members of Congress</h2><p>Click a cateogry above to see events by category, and click on districts to get contact info for a local retiring representative.</p></div>"
				} else {
					document.getElementById('info').innerHTML = "<div class='pad2'>"+d[type]['copy']+"</div>";
				}

				$.each(d[type]['districts'], function (i, data) {
					var url = 'processed/'+data+'.json';
					$.getJSON(url, function(d) {

						var markerLayer = L.mapbox.markerLayer()
							.loadURL(url)
							.addTo(map);
						// Add to layers array so we can clear on ul li a click
						layers.push(markerLayer)
						var popupContent;
						markerLayer.on('mouseover', function(e) {
							var feature = e.layer.feature;
							var popupContent = '<div class="pad2 prose"><h2>' + feature.properties.name + '</h2>' +
									'<p>Contact Information</p>'+
									'<a href="http://twitter.com/'+ feature.properties.twitter +'">Twitter</a><br/>'+
									'<a href="'+ feature.properties.website +'">Website</a></div>';
							e.layer.bindPopup(popupContent).openPopup();
							// document.getElementById('info').innerHTML = popupContent;
						});
						map.markerLayer.on('mouseout', function(e) {
							// e.layer.closePopup();
						});
						markerLayer.on('click', function(e) {
							var feature = e.layer.feature;
							e.layer.bindPopup(popupContent).openPopup();
							bounds =  markerLayer.getBounds();
							map.fitBounds(bounds, { paddingBottomRight: [300, 000] });
						});
					});
				});
			})
			
		});

	};
	// First function run through
	renderDistricts(types)
	
	$('ul.nav li a').click(function(e) {
		e.preventDefault();
		$('ul.nav li a').removeClass('active');
		$(this).addClass('active');
		type = [$(this).attr('data')];
		if (type == 'all'){
			instance = true;
			renderDistricts(types)
		} else {
			instance = false;
			renderDistricts(type)
		}
	});
});