(function ($) {
	$.fn.interactiveMap = function (options)
	{
		//Default values - later overwritten by options
		let defaults = {
			lang: {
				"latitude": "52.21740202273157",
				"longitude": "21.016122479045407",
				zoom: 5,
				partners: null
			},
		};

		defaults = $.extend(defaults, options);


		//Get partenrs from DB/file
		let partnersFromDB = {};
		$.ajax({
			url: "partners.json",
			async: false,
			dataType: 'json',
			success: function (data) {
				partnersFromDB = data;
			}
		});



		let events = {
			//Load partners to html container
			loadPartners: function (partnersArr) {
				//Clear default info
				if ($(".partners-container").length) {
					$(".partners-container").empty();
				}
				//Append found partner info to html
				if (partnersArr.length) {
					partnersArr.forEach((partner, index) => {


						let partnerTypeWord = '';
						let partnerTypeClass = '';

						if (partner.partner_type === '1')
						{
							partnerTypeClass = 'custom';
							partnerTypeWord = 'Niestandardowy typ ';
						}else{
							partnerTypeWord = 'Domyślny typ ';
						}

						//Template for partners to show
						let template =
						`
							<div class="partner-wrapper hidden">
								<div class="partner-title ${partnerTypeClass}"> ${partnerTypeWord} Partnera</div>
								<div class="partner-container">
									<div class = "partner-item partner-email"> <strong> E-mail: </strong> ${partner.email} </div >
										<div class="partner-item partner-post-code"><strong>Kod pocztowy / Miejscowość:</strong> ${partner.post_code} / ${partner.street}</div>
										<div class="partner-item partner-street-number"><strong>Nr. domu / lokalu:</strong> ${partner.nr} </div>
									</div>
								</div>
							</div>
						`;
						$(".partners-container").append(template);
						$(".partner-wrapper").fadeIn(500);
					});
				}else{
					//Template for partners to show if there is no elements
					let template =
						`
							<div class="partner-wrapper hidden middle">
								<h3>Nie znaleziono partnerów w wybranym województwie.</h3>
							</div>
						`;
					$(".partners-container").append(template);
					$(".partner-wrapper").css("display", "flex")
						.hide()
						.fadeIn();
				}




				if ($('body').width() < 1250) {
					if ($(".partners-container").length) {
						$('html, body').animate({
							scrollTop: $(".partners-container").offset().top - 100
						}, 500);
					}
				}

			},
		}

		//Every function used in plugin is stored here
		let functions = {
			initializeMap: function ()
			{
				const latitude = defaults.lang.latitude;
				const longitude = defaults.lang.longitude;

				//Get provinces areas from file
				$.getJSON("/Users-Map/map/vendor/interactive_map/js/area.json", function (polygon) {

					function initialize()
					{
						let myLatlng = new google.maps.LatLng(latitude, longitude);
						let map = new google.maps.Map(document.getElementById("map-canvas"), {
							zoom: defaults.lang.zoom,
							center: myLatlng,
							styles: //Set styles for map
								[
									{
										"featureType": "administrative.country",
										"elementType": "geometry.fill",
										"stylers": [
											{
												"visibility": "off"
											}
										]
									},
									{
										"featureType": "administrative.country",
										"elementType": "geometry.stroke",
										"stylers": [
											{
												"visibility": "off"
											}
										]
									},
									{
										"featureType": "administrative.country",
										"elementType": "labels.text",
										"stylers": [
											{
												"visibility": "off"
											}
										]
									}
								]
						});


						let partnerId = {};
						let partnerLatLong = [];

						//Create array with every patrner latitude and longitude to place them on map later
						for (i = 0; i < partnersFromDB.length; i++)
						{
							partnerLatLong[i] = new google.maps.LatLng(
								Number(partnersFromDB[i].latitude),
								Number(partnersFromDB[i].longitude)
							);

							partnerId[i] = new Array();
							partnerId[i].push(partnersFromDB[i].id);
						}

						//Set provinces areas - Have to be in the same order as they are in area.json file (file with coordinates of provinces).
						let provinces = [];

						provinces['0'] = 'dolnoslaskie';
						provinces['1'] = 'kieleckie';
						provinces['2'] = 'kujawsko_pomorskie';
						provinces['3'] = 'lodzkie';
						provinces['4'] = 'lubelskie';
						provinces['5'] = 'lubuskie';
						provinces['6'] = 'malopolskie';
						provinces['7'] = 'mazowieckie';
						provinces['8'] = 'opolskie';
						provinces['9'] = 'podkarpackie';
						provinces['10'] = 'podlaskie';
						provinces['11'] = 'pomorskie';
						provinces['12'] = 'slaskie';
						provinces['13'] = 'warminsko_mazurskie';
						provinces['14'] = 'wielkopolskie';
						provinces['15'] = 'zachodnio_pomorskie';

						let polygonMap = polygon.features;
						let j;
						let provincesWithPolygons = [];
						let provincePolygon = [];
						let polygonArr = [];

						//Check if polygon contains marker
						google.maps.Polygon.prototype.Contains = function (point) {
							let crossings = 0,
									path = this.getPath();

							//Foreach edge
							for (let i = 0; i < path.getLength(); i++) {
								let a = path.getAt(i),
										j = i + 1;
								if (j >= path.getLength()) {
									j = 0;
								}
								let b = path.getAt(j);
								if (rayCrossesSegment(point, a, b)) {
									crossings++;
								}
							}

							//Odd number of crossings?
							return (crossings % 2 == 1);

							function rayCrossesSegment(point, a, b) {
								let px = point.lng(),
										py = point.lat(),
										ax = a.lng(),
										ay = a.lat(),
										bx = b.lng(),
										by = b.lat();
								if (ay > by) {
									ax = b.lng();
									ay = b.lat();
									bx = a.lng();
									by = a.lat();
								}
								//Alter longitude to cater for 180 degree crossings
								if (px < 0) {
									px += 360;
								}
								if (ax < 0) {
									ax += 360;
								}
								if (bx < 0) {
									bx += 360;
								}

								if (py == ay || py == by)
									py += 0.00000001;
								if ((py > by || py < ay) || (px > Math.max(ax, bx)))
									return false;
								if (px < Math.min(ax, bx))
									return true;

								let red = (ax != bx) ? ((by - ay) / (bx - ax)) : Infinity;
								let blue = (ax != px) ? ((py - ay) / (px - ax)) : Infinity;
								return (blue >= red);

							}
						}

						//Count partner properties
						function countProperties(partner) {
							let count = 0;
							for (let property in partner) {
								if (Object.prototype.hasOwnProperty.call(partner, property)) {
									count++;
								}
							}
							return count;
						}


						let markers = [];
						// Sets the map on all markers in the array.
						function setMapOnAll(map) {
							for (let i = 0; i < markers.length; i++) {
								markers[i].setMap(map);
							}
							markers = [];
						}

						// Removes the markers from the map, but keeps them in the array.
						function clearMarkers() {
							setMapOnAll(null);
						}

						var finalPartnersIndexes = [];
						var finalPartnersArray = [];

						//Partners which are already set on map on specific province
						var partnersAlreadySetOnMap = {};

						//Foreach province set parameters
						provinces.forEach(function (provinceName, provinceIndex)
						{
							//Set every province an edge (polygon)
							provincesWithPolygons[provinceName] = [];
							for (j = 0; j < polygonMap[provinceIndex].geometry.coordinates[0][0].length; j++) {
								provincesWithPolygons[provinceName].push(
										new google.maps.LatLng(
												polygonMap[provinceIndex].geometry.coordinates[0][0][j][1],
												polygonMap[provinceIndex].geometry.coordinates[0][0][j][0]
												)
										);
							}

							//Set every province a style
							provincePolygon[provinceName] = new google.maps.Polygon({
								paths: provincesWithPolygons[provinceName],
								strokeColor: '#000',
								strokeOpacity: 0.8,
								strokeWeight: 1,
								fillColor: '#fff',
								fillOpacity: 0.6
							});

							//Place every polygon in array
							polygonArr.push(provincePolygon[provinceName]);

							//Set map on every province
							provincePolygon[provinceName].setMap(map);

							//Set localization of each partner on map
							partnersAlreadySetOnMap[provinceIndex] = new Array();
							for (j = 0; j < countProperties(partnerId); j++)
							{
								if (polygonArr[provinceIndex].Contains(partnerLatLong[j]))
								{
									partnersAlreadySetOnMap[provinceIndex].push(partnerLatLong[j]);
									partnersAlreadySetOnMap[provinceIndex].push(partnerId[j]);
								}
							}

							//Add province mouseover options
							google.maps.event.addListener(polygonArr[provinceIndex], 'mouseover', function (event) {
								this.setOptions(
									{
										fillOpacity: 0.6,
										fillColor: '#fff'},
									);
							});

							//Add province mouseout options
							google.maps.event.addListener(polygonArr[provinceIndex], 'mouseout', function (event) {
								this.setOptions(
									{
										fillOpacity: 0.6,
										fillColor: '#fff'},
									);
							});

							//Add hover if partner belongs to province
							let indexPartner = Number(polygonArr.indexOf(polygonArr[provinceIndex]));
							for (j = 0; j < partnersAlreadySetOnMap[indexPartner].length; j++) {
								google.maps.event.addListener(polygonArr[provinceIndex], 'mouseover', function (event) {

									this.setOptions(
											{
												fillOpacity: 0.6,
												fillColor: '#e8412c'},
											);
								});

							}

							//Add click event on each province
							google.maps.event.addListener(provincePolygon[provinceName], 'click', function (event) {
								clearMarkers();

								for (i = 0; i < partnersAlreadySetOnMap[provinceIndex].length; i++) {
									if ((i % 2) == 0)
									{

										var partnerType = null;
										//Get Partner Type
										partnersFromDB.forEach(function (partner, partner_index)
										{
											//Iteration incrementation to get id of each partner
											if (partner.id == partnersAlreadySetOnMap[provinceIndex][Number(i + 1)][0])
											{
												partnerType = partner.partner_type;
											}
										});

										//Set marker color based on partnerType
										if (partnerType == '1')
										{
											var icon = {
												url: "/map/vendor/interactive_map/misc/map_marker_blue.png",
												scaledSize: new google.maps.Size(50, 50) // scaled size
											};
										} else
										{
											var icon = {
												url: "/map/vendor/interactive_map/misc/map_marker_red.png",
												scaledSize: new google.maps.Size(50, 50) // scaled size
											};
										}

										//Set marker on map
										var marker = new google.maps.Marker({
											position: partnersAlreadySetOnMap[provinceIndex][i],
											animation: google.maps.Animation.DROP,
											map: map,
											icon: icon
										});

										//Add marker to markers array to display them on map later.
										markers.push(marker);
									} else {
										finalPartnersIndexes.push(partnersAlreadySetOnMap[provinceIndex][i]);
									}
								}

								for (i = 0; i < countProperties(partnersFromDB); i++) {
									for (j = 0; j < finalPartnersIndexes.length; j++)
									{
										if (partnersFromDB[i].id == finalPartnersIndexes[j]) {
											finalPartnersArray.push(partnersFromDB[i]);
										}
									}
								}

								//Load partners info to container
								events.loadPartners(finalPartnersArray);

								//Reset partners if other province was clicked
								finalPartnersIndexes = [];
								finalPartnersArray = [];
							});
						});
					}
					;

					if (typeof ($("#map-canvas").attr("id")) != "undefined")
						initialize();
				});
			},

			init: function () {
				functions.initializeMap();
				$(".partner-wrapper").removeClass('hidden');
			}
		};

		//PLUGIN
		functions.init();
		//PLUGIN - END
	};
})(jQuery);
