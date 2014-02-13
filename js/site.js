$(function (){
	layers = []

	types = ['snow','drought','tornado','pollution','drought','flood']
	instance = true;
	//Mapping
	var map = L.mapbox.map('map', 'djohnson.map-m9l4eaq3', { zoomControl: false })
		.setView([38.908, -77.02], 4);
	map._layersMinZoom = 2
	map._layersMaxZoom = 7
	
	function highlightFeature(e) {
		var layer = e.target;
		layer.setStyle({
			weight: 2,
			color: '#fff',
			dashArray: '',
			fillOpacity: 0.7
		});
		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}
	}

	function zoomToFeature(e) {
		map.fitBounds(e.target.getBounds(),{paddingBottomRight:[320,-100]});
	}

	function getColor(d) {
		return d == 'drought' ? '#AA6827' :
			d == 'snow' ? '#0074A5' :
			d == 'tornado' ? '#FFB733' :
			d == 'flood' ? '#4CC0B9':
			d == 'pollution' ? '#E53032' :
								'#FEB24C';
	}

	var renderDistricts = function(types){
		map.setView([38.908, -77.02], 4);
		// Clear old layers
		$.each(layers, function(i, l){
			l.clearLayers();
		});

		districts = $.getJSON("districts.json", function(d) {
			$.each(types, function (i,type){
				if (instance) {
					document.getElementById('info').innerHTML = "<div class='pad2'><h1>Climate Change and Retiring Members of Congress</h1><p>Click a cateogry above to see events by category, and click on districts to get contact info for a local retiring representative.</p></div>"
				} else {
					document.getElementById('info').innerHTML = "<div class='pad2'>"+d[type]['copy']+"</div>";
				}
				var resetHighlight;
				var onEachFeature = function(feature, layer) {
					layer.on({
						mouseover: highlightFeature,
						mouseout: resetHighlight,
						click: zoomToFeature
					});
				}

				var style = function(markerLayer) {
					return {
						fillColor: getColor(type),
						weight: 1,
						opacity: 1,
						color: 'white',
						fillOpacity: 0.6
					};
				}

				$.each(d[type]['districts'], function (i, data) {
					var url = 'processed/'+data+'.json';
					$.getJSON(url, function(d) {

						var markerLayer = L.geoJson(d, {
							style: style,
							onEachFeature: onEachFeature
						}).addTo(map);

						var popupContent;
						markerLayer.on('mouseover', function(e) {
							var feature = e.layer.feature;
							var popupContent = '<div class="pad2 prose"><h3>' + feature.properties.name + '</h3>' +
									'<a target="_blank" href="http://twitter.com/'+ feature.properties.twitter +'">Twitter</a><br/>'+
									'<a target="_blank" href="'+ feature.properties.contact_form +'">Contact form</a><br/>'+
									'<a target="_blank" href="'+ feature.properties.website +'">Website</a><br/>'+
									'<p>'+feature.properties.phone+'</p></div>';
							$('#rep').show();
							document.getElementById('rep').innerHTML = popupContent;
						});
						resetHighlight = function(e) {
							markerLayer.resetStyle(e.target);
						}
						//Add to layers array so we can clear on ul li a click
						layers.push(markerLayer)
					});
				});
			})
		});
	};

	// First function run through
	renderDistricts(types)
	
	$('ul.nav li a').click(function(e) {
		e.preventDefault();
		$('#rep').hide();
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