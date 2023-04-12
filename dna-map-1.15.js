const mapLines = []
var currCityMarkers = {}
var allCitiesMarkers = [];
var filteredCitiesMarkers = [];
var activeInfoWindow, allCities;
let iconBase = "https://brightmap.z13.web.core.windows.net/";
let drawingManager = null;

var all_overlays = [];
var selectedShape;
let markersSearchBox = [];

function loadMetaData() {
   /* $.getJSON("metadata.json", function (data) {
        $.each(data, function (key, val) {
            $.each(val, function (innerkey, innerval) {
                /* if (innerkey === "ClientTier1Label") {
                   document.getElementById("clientTier1Label").innerHTML = innerval;
                 } else if (innerkey === "ClientTier2Label") {
                   document.getElementById("clientTier2Label").innerHTML = innerval;
                 } else if (innerkey === "ClientTier3Label") {
                   document.getElementById("clientTier3Label").innerHTML = innerval;
                 } else if (innerkey === "ClientTier4Label") {
                   document.getElementById("clientTier4Label").innerHTML = innerval;
                 } else if (innerkey === "ClientTier5Label") {
                   document.getElementById("clientTier5Label").innerHTML = innerval;
                 } else if (innerkey === "ClientTier6Label") {
                   document.getElementById("clientTier6Label").innerHTML = innerval;
                 }*//*
            });
        });
    });*/
}

function toggleAccessPointTail(control,  _category) {

    

    if (tailSelected.length >= 2) {


        var showCity, distanceMin;
        tailSelected.forEach(selecedTails => {
           

            if (selecedTails) {

                allCities.forEach(element => {


                    // radius for cities
                    var distanceSP = calcDistance(
                        Number(element.Lat),
                        Number(element.Long),
                        selecedTails.position.lat(),
                        selecedTails.position.lng()
                    );
                   
                    distanceMin = distanceMin ?? distanceSP;
                    if (distanceMin >= distanceSP) {
                        showCity = element;
                    } 
                });
                if (_category == 2 && showCity) {

                    const foundCityInEnabled = allCities.filter(function (el) { return el != showCity; });
                    distanceMin = null;
                    foundCityInEnabled.forEach(element => {


                        // radius for cities
                        var distanceSP = calcDistance(
                            Number(element.Lat),
                            Number(element.Long),
                            selecedTails.position.lat(),
                            selecedTails.position.lng()
                        );


                        distanceMin = distanceMin ?? distanceSP;
                        if (distanceMin >= distanceSP ) {
                            showCity = element;
                        } 
                    });
                }
            }
           
        });

        if (showCity) {
            showCity.markerIcon = $(control).next().next().attr('src');
            let dp = {
                location: new google.maps.LatLng(parseFloat(showCity.Lat), parseFloat(showCity.Long)),
                data: showCity
            }
            if (control.checked) {

                createMarker(dp, control.id);
            } else {
                for (let i = 0; i < allCitiesMarkers.length; i++) {
                    if (control.id == allCitiesMarkers[i].title) {
                        allCitiesMarkers[i].setMap(null);

                        allCitiesMarkers.splice(i, 1);
                        break;
                    }

                }
            } 
            const points = [{
                lat: tailSelected[0].position.lat(),
                lng: tailSelected[0].position.lng()
            },
            {
                lat: parseFloat(showCity.Lat),
                lng: parseFloat(showCity.Long),
            },
            {
                lat: tailSelected[1].position.lat(),
                lng: tailSelected[1].position.lng(),
            },
            ];
            drawPathOnMapTile(points, control, _category);
            
        }
    }
}

function drawPathOnMapTile(points, control, _category) {
    let isChecked = control.checked
    const shortestPath = new google.maps.Polyline({
        path: points,
        geodesic: false,
        strokeColor: _category == 2 ?"#76bece":"#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });
   
    if (!mapLines[control.id]) {

        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            shortestPath.setMap(map);
        } else {
            shortestPath.setMap(null);
        }
    } else if (!isChecked) {
            mapLines[control.id].forEach(function (line) {
                line.setMap(null)
            })
            delete mapLines[control.id]
        
    }
  
}

function loadCitiesData() {
    var citiesHTML = '<div class="container pull-left">'+
       ' <p class="pls"> Radius(ms)</p>'+
                '</div> '+

        '<div class="container"> '+
        '<p class="pls"> City</p> '+
                '</div> '+

               ' <div class="clear"></div>';

    
    allCities = allCitiesData.Cities;
    allCities.forEach(element => {
        let dp = '<div class="container mts">' +
            '<input type = "checkbox" name = "cityname" value = "' + element.Location + '" onclick = "toggleCitiesUpdated(this.value,this);" />' +
            '<img src="images/target.svg" alt="cities" />' +
            '<span> ' + element.Location + ' </span>' +
            ' <span class="pull-right">' +
            '<input type="checkbox" onclick="toggleClientPeeringSitesRadius(this, \'' + element.Location + '\', 2);" /><span>2 </span>' +
            '<input type="checkbox" onclick="toggleClientPeeringSitesRadius(this, \'' + element.Location + '\', 5);" /><span>5 </span>' +
            '<input type="checkbox" onclick="toggleClientPeeringSitesRadius(this, \'' + element.Location + '\', 10);" /><span>10</span>' +
            '<input type="checkbox" onclick="toggleClientPeeringSitesRadius(this, \'' + element.Location + '\', 20);" /><span>20 </span>' +
            '</span></div>';
        citiesHTML = citiesHTML + dp;

        // radius for cities
        var latLng = new google.maps.LatLng(parseFloat(element.Lat), parseFloat(element.Long));
        var markerradius2 = new google.maps.Circle({
            strokeColor: "#808080",
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: "#FFC0CB",
            fillOpacity: 0.2,
            map: map,
            type: "ClientPeeringSites",
            city: element.Location,
            center: latLng,
            radius: 90000,
        });
        var markerradius5 = new google.maps.Circle({
            strokeColor: "#808080",
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: "#ADD8E6",
            fillOpacity: 0.2,
            map: map,
            type: "ClientPeeringSites",
            city: element.Location,
            center: latLng,
            radius: 225000,
        });
        var markerradius10 = new google.maps.Circle({
            strokeColor: "#808080",
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: "#98FB98",
            fillOpacity: 0.2,
            map: map,
            type: "ClientPeeringSites",
            city: element.Location,
            center: latLng,
            radius: 450000,
        });
        var markerradius20 = new google.maps.Circle({
            strokeColor: "#808080",
            strokeOpacity: 0.9,
            strokeWeight: 1,
            fillColor: "#FFFFE0",
            fillOpacity: 0.3,
            map: map,
            type: "ClientPeeringSites",
            city: element.Location,
            center: latLng,
            radius: 900000,
        });

        markerradius2.setVisible(false);
        markerradius5.setVisible(false);
        markerradius10.setVisible(false);
        markerradius20.setVisible(false);
        radiusarray2.push(markerradius2);
        radiusarray5.push(markerradius5);
        radiusarray10.push(markerradius10);
        radiusarray20.push(markerradius20);
    //
    });
    $('#citiesDetails').html(citiesHTML);
}
function loadVendorParent(farmData) {
    console.log("loadfarm",farmData);
   

    var vendorHTML ='';
    var vendorData = [];
    farmData.forEach(element =>{
        if( !vendorData.includes(element['Vendor Parent']) ) {
            vendorData.push(element['Vendor Parent']);
        };
    })
    vendorData.sort();
    console.log(vendorData);
    var i=0;
    vendorData.forEach(element => {
        i= i+1;
        if(i == 26) {i=1;}
        vendorHTML += '<div class="container">'+
                        '<img src="images/'+i+'cityicon.svg" alt="cities" />'+
                        '<input type="checkbox" onclick="toggleFarmVendor(this, \''+element+'\', \''+i+'cityicon.svg\');"/>'+
                            '<span>'+element+'</span>'+
                            '<div class="clear"></div>'+
                        '</div>';
    })
    $('.vendor-menu').html(vendorHTML);
}
function getImageForType(type, subtype, category) {
    image = "images/wifi-purple.png";

    switch (type) {
        case "AWS":
            image = "images/aws.svg";
            break;
        case "ClientAWS":
            image = "images/clientaws.svg";
            break;
        case "ClientSaaS":
            image = "images/clientsaas.png";
            break;
        case "ClientNetworkPeerPoint":
            image = "images/clientnetworkpeer.png";
            break;
        case "ClientTransportHub":
            image = "images/clienttransporthub.svg";
            break;
        case "ClientPerformanceHub":
            image = "images/clientperformancehub.svg";
            break;
        case "IXPTier1":
            image = "images/ixp1.png";
            break;
        case "IXPTier2":
            image = "images/ixp2.png";
            break;
        case "IXPTier3":
            image = "images/ixp3.png";
            break;
        case "Azure":
            image = "images/azure.svg";
            break;
        case "ClientAzure":
            image = "images/clientazure.png";
            break;

        case "SaaS":
            if (subtype === "Salesforce") {
                image = "images/salesforce.svg";
            } else if (subtype === "Virtustream") {
                image = "images/virtustream.svg";
            } else if (subtype === "ServiceNow") {
                image = "images/servicenow.svg";
            } else if (subtype === "Duke Energy") {
                image = "images/dukeIcon.svg";
                switch (category) {
                    case "AccessPoint":
                        image = "images/1cityicon.svg";
                        break;
                    case "DataCenter":
                        image = "images/primaryhub_city_chicagoashburn.svg";
                        break;
                    case "BatteryDuke":
                        image = "images/2cityicon.svg";
                        break;
                    case "Campus":
                        image = "images/3cityicon.svg";
                        break;
                    case "Cell":
                        image = "images/4cityicon.svg";
                        break;
                    case "COPOP":
                        image = "images/5cityicon.svg";
                        break;
                    case "ElectricSubstation":
                        image = "images/6cityicon.svg";
                        break;
                    //case "GasSubstation":
                    //    image = "images/clientazure.svg";
                    //    break;
                    case "HydroElectricPlant":
                        image = "images/7cityicon.svg";
                        break;
                    case "NuclearPlant":
                        image = "images/9cityicon.svg";
                        break;
                    case "MLSP":
                        image = "images/8cityicon.svg";
                        break;
                    case "Siren":
                        image = "images/10cityicon.svg";
                        break;
                    case "Office":
                        image = "images/12cityicon.svg";
                        break;
                    //case "OverHead":
                    //    image = "images/clientazure.svg";
                    //    break;
                    case "PiedmontGas":
                        image = "images/13cityicon.svg";
                        break;
                    case "PowerStation":
                        image = "images/14cityicon.svg";
                        break;
                    case "RemoteLineSwitch":
                        image = "images/15cityicon.svg";
                        break;
                    case "SirenEnergy":
                        image = "images/16cityicon.svg";
                        break;
                    case "StormStaging":
                        image = "images/17cityicon.svg";
                        break;
                    case "Tower":
                        image = "images/18cityicon.svg";
                        break;
                    case "Windplant":
                        image = "images/19cityicon.svg";
                        break;
                    default:
                        image = "";
                        break;
                }
                
            }
            break;

        case "AzureExpressRoute":
            image = "images/azureer.svg";
            break;   
        case "GoogleCloud":
            image = "images/googlecloud.png";
            break;

        case "AWSDirectConnect":
            image = "images/awsdc.png";
            break;

        case "ClientDataCenter":
            image = "images/customerdatacenter.svg";
            break;

        case "ClientTier1":
            image = "images/tier1.svg";
            break;

        case "ClientTier2":
            image = "images/tier2.svg";
            break;

        case "ClientTier3":
            image = "images/tier3.svg";
            break;

        case "ClientTier4":
            image = "images/tier4.svg";
            break;

        case "ClientTier5":
            image = "images/tier5.svg";
            break;

        case "ClientTier6":
            image = "images/tier6.png";
            break;

        case "Equinix":
            image = "images/equinix.svg";
            break;

        case "NetworkPeerPoint":
            image = "images/networkpeer.svg";
            break;
        case "DukeNet":
            image = "images/dukeIcon.svg";
            break;

        case "CoLocation":
            if (subtype === "Equinix") {
                image = "images/equinix.svg";
            } else if (subtype === "CyrusOne") {
                image = "images/cyrusone.svg";
            } else if (subtype === "Digital Realty") {
                image = "images/digitalrealty.svg";
            } else if (subtype === "Cyxtera Technologies, Inc.") {
                image = "images/cyxtera.png";
            } else if (subtype === "Interxion") {
                image = "images/interxion.svg";
            } else if (subtype === "Level 3 Communications, LLC") {
                image = "images/level3.svg";
            } else if (subtype === "CoreSite") {
                image = "images/coresite.svg";
            } else if (subtype === "CoreSite LLC") {
                image = "images/coresite.svg";
            } else {
                image = "images/colocation.svg";
            }
            break;

        case "IBM":
            image = "images/IBM.svg";
            break;

        case "SAP":
            image = "images/sap.svg";
            break;

        case "Oracle":
            image = "images/oracle.svg";
            break;

        case "OKTA":
            image = "images/okta.svg";
            break;

        case "Workday":
            image = "images/workday.svg";
            break;

        default:
            image = "images/wifi-purple.png";
    }

    return image;
}

//
function geocodeAddress(marker, address, city, state, zip, country) {
    var geocoder = new google.maps.Geocoder();

    var fulladdress = address;

    if (city !== "") {
        fulladdress = fulladdress + ", " + city;
    }
    if (state !== "") {
        fulladdress = fulladdress + ", " + state;
    }
    if (zip !== "") {
        fulladdress = fulladdress + ", " + zip;
    }
    if (country !== "") {
        fulladdress = fulladdress + " " + country;
    }

    sleep(250);

    geocoder.geocode({
        address: fulladdress
    }, function (results, status) {
        if (status === "OK") {
            latlong = results[0].geometry.location;
            marker.setPosition(latlong);
        } else {
            alert(
                "Geocode was not successful for the following reason: " +
                status +
                " For: " +
                address +
                ", " +
                city
            );
        }
    });
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if (new Date().getTime() - start > milliseconds) {
            break;
        }
    }
}

//
function getConnectionPath(beginlat, beginlong, endlat, endlong, type) {



    var connectioncoord = [{
        lat: parseFloat(beginlat),
        lng: parseFloat(beginlong)
    },
    {
        lat: parseFloat(endlat),
        lng: parseFloat(endlong)
    },
    ];

    var connectionPath;

    if (
        type === "ClientBackbone" ||
        type === "LongHaulFiber" ||
        "AWSDirectConnect"
    ) {
        connectionPath = new google.maps.Polyline({
            path: connectioncoord,
            //geodesic: false,
            strokeColor: "#696969",
            strokeOpacity: 1,
            type: type,
            strokeWeight: 1,
        });
    } else if (type === "ClientBroadband-Internet") {
        var lineSymbol = {
            path: "M 0,-1 0,1",
            strokeColor: "#8B0000",
            strokeOpacity: 1,
            strokeWeight: 1,
            scale: 4,
        };

        connectionPath = new google.maps.Polyline({
            path: connectioncoord,
            //geodesic: false,
            strokeColor: "#8B0000",
            strokeOpacity: 0,
            type: type,
            strokeWeight: 1,
            icons: [{
                icon: lineSymbol,
                offset: "0",
                repeat: "20px",
            },],
        });
    } else if (type === "ClientPrimaryTail") {
        connectionPath = new google.maps.Polyline({
            path: connectioncoord,
            //geodesic: false,
            strokeColor: "#0000CD",
            strokeOpacity: 1,
            type: type,
            strokeWeight: 1,
        });
    } else if (type === "ClientSecondaryTail") {
        var lineSymbol = {
            path: "M 0,-1 0,1",
            strokeColor: "#0000CD",
            strokeOpacity: 1,
            strokeWeight: 1,
            scale: 4,
        };

        connectionPath = new google.maps.Polyline({
            path: connectioncoord,
            //geodesic: false,
            strokeColor: "#0000CD",
            strokeOpacity: 0,
            type: type,
            strokeWeight: 1,
            icons: [{
                icon: lineSymbol,
                offset: "0",
                repeat: "20px",
            },],
        });
    }

    return connectionPath;
}

function drawingToggle() {

    if (!document.getElementById("pac-input")) {

    // Create the search box and link it to the UI element.
        const input = document.createElement("input");
        input.id = "pac-input";
        input.class = "controls";
        input.type = "text";
        input.placeholder = "Enter Location";

    const searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });
    

    //

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        //markersSearchBox.forEach((marker) => {
        //    marker.setMap(null);
        //});
       // markersSearchBox = [];
        // For each place, get the icon, name and location.
       // const bounds = new google.maps.LatLngBounds();
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };
            // Create a marker for each place.
            markersSearchBox.push(
                new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location,
                })
            );

            //if (place.geometry.viewport) {
            //    // Only geocodes have viewport.
            //    bounds.union(place.geometry.viewport);
            //} else {
            //    bounds.extend(place.geometry.location);
            //}
        });
       // map.fitBounds(bounds);
    });

  
         drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [
                  //  google.maps.drawing.OverlayType.MARKER,
                  //  google.maps.drawing.OverlayType.CIRCLE,
                   // google.maps.drawing.OverlayType.POLYGON,
                    google.maps.drawing.OverlayType.POLYLINE,
                    //google.maps.drawing.OverlayType.RECTANGLE,
                ],
            },
          
        });
        //
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
            all_overlays.push(e);
            if (e.type != google.maps.drawing.OverlayType.MARKER) {
                // Switch back to non-drawing mode after drawing a shape.
                drawingManager.setDrawingMode(null);

                // Add an event listener that selects the newly-drawn shape when the user
                // mouses down on it.
                var newShape = e.overlay;
                newShape.type = e.type;
                google.maps.event.addListener(newShape, 'click', function () {
                    setSelection(newShape);
                });
                setSelection(newShape);

             
                for (var i = 0; i < all_overlays.length; i++) {
                    if (all_overlays[i].type ==="polyline") {
                        var lengthInMeters = google.maps.geometry.spherical.computeLength(all_overlays[i].overlay.getPath());
                        console.log("polyline is " + lengthInMeters + " long");
                        var dvDistance = document.getElementById("dvDistance");
                        dvDistance.innerHTML = "";
                        dvDistance.innerHTML +=
                            "<strong> Distance: </strong>" + "&nbsp;&nbsp;" + (lengthInMeters / 1000).toFixed(1) + " km<br />";
                        dvDistance.innerHTML +=
                            "<strong> Data Transfer rate: </strong>" +
                            "&nbsp;&nbsp;" +
                            "178,000,000 Mbps" +
                            "<br />";
                            "<button> Save </button>" +
                    "<br />";
                    }
                    
                }
                
            }
        });

        drawingManager.setMap(map);
    }

   
}

function clearSelection() {
    if (selectedShape) {
        selectedShape.setEditable(false);
        selectedShape = null;
    }
}

function setSelection(shape) {
    clearSelection();
    selectedShape = shape;
    shape.setEditable(true);
}
function deleteSelectedShape() {
    if (selectedShape) {
        selectedShape.setMap(null);
    }
}

function deleteAllShape() {
    for (var i = 0; i < all_overlays.length; i++) {
        all_overlays[i].overlay.setMap(null);
    }
    all_overlays = [];
}



function toggleCities(obj) {
    if (typeof currCityMarkers[obj.id] != "undefined") {
        currCityMarkers[obj.id]["marker"].setVisible(false)
        delete currCityMarkers[obj.id]
        return
    }

    let marker = new google.maps.Marker({
        position: cities[obj.id]["loc"],
        map: map,
        title: cities[obj.id]["name"],
        icon: { url: "images/cities.png" },
    })

    currCityMarkers[obj.id] = {
        "marker": marker
    }

    marker.setVisible(obj.checked)

}

function toggleCitiesUpdated(obj, control) {
    console.log('here:', obj);

    var enabledCities = [];
    $.each($("input[name='cityname']:checked"), function () {
        const markerIcon = $(this).next().attr('src');
        enabledCities.push({
            name: $(this).val(),
            markerIcon: markerIcon || 'images/1cityicon.svg'
        });
    });
     console.log(enabledCities);

    // let filteredCities = allCities.filter(city =>  {
    //   let cityname = city.City;
    //   if(cityname){
    //     cityname = cityname.trim().replace(/[ -]+/g, '_'); 
    //   }

    //   return !!enabledCities.find(cityObj => cityObj.name === cityname);
    // });

    const filteredCities = [];
    allCities.forEach((cityObj) => {
        let cityName = cityObj.Location;
        if (cityObj.Country === 'Ireland') {
           // cityName = 'Ireland';
        }
        //if (cityName) {
        //    cityName = cityName.trim().replace(/[ -]+/g, '_');
        //}
        const foundCityInEnabled = enabledCities.find(cO => cO.name === cityName);
        if (foundCityInEnabled) {
            cityObj.markerIcon = foundCityInEnabled.markerIcon;
            filteredCities.push(cityObj)
        }
    })
	console.log(filteredCities);

    deleteMarkers();
    var thisLocationLat, thisLocationLong;
    if (filteredCities.length > 0) {
        filteredCities.forEach(element => {
            let dp = {
                location: new google.maps.LatLng(parseFloat(element.Lat), parseFloat(element.Long)),
                data: element
            }
            console.log("element", element)
            createMarker(dp);
            thisLocationLat = parseFloat(element.Lat);
            thisLocationLong = parseFloat(element.Long);
        })
    }
    try {
		
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
   
    if (startPoint === null && endPoint === null) {
        //for (var i = 0; i < gmarkers.length; i++) {
        //    if (gmarkers[i]["type"] == "IXPTier1") {
        //        gmarkers[i].setVisible(control.checked);
        //    }
        //}
    } else {
        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: thisLocationLat,
            lng: thisLocationLong,
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap2(points, control);
    }

}

function drawPathOnMap2(points, control) {
    let isChecked = control.checked
    const shortestPath = new google.maps.Polyline({
        path: points,
        geodesic: false,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });



    var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
    var markerS = new google.maps.Marker({
        position: positionS,
        title: "Start Point",
    });

    var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
    var markerE = new google.maps.Marker({
        position: positionE,
        title: "Destination",
    });

    mapLines[control.id] = [shortestPath, markerS, markerE]
    if (isChecked) {
        markerS.setMap(map);
        markerE.setMap(map);
        shortestPath.setMap(map);
    } else {
        markerS.setMap(null);
        markerE.setMap(null);
        shortestPath.setMap(null);
    }
}
function toggleTier1IXP(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "IXPTier1") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "IXPTier1") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "IXPTier1") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


    // var marker = new google.maps.Marker({
    //     position: {
    //         lat: 41.8722,
    //         lng: -87.6188
    //     },
    //     map: map,
    //     icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    // });

}

function toggleTier2IXP(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "IXPTier2") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "IXPTier2") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "IXPTier2") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

       
        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleTier3IXP(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "IXPTier3") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "IXPTier3") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "IXPTier3") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleClientAzureMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "ClientAzure") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */

    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "ClientAzure") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "ClientAzure") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }

}


function toggleClientPeeringSitesRadius(control, city, radius) {
    var radiusArray = radiusarray2;
    switch (radius) {
        case 2:
            radiusArray = radiusarray2;
            break;
        case 5:
            radiusArray = radiusarray5;
            break;
        case 10:
            radiusArray = radiusarray10;
            break;
        case 20:
            radiusArray = radiusarray20;
            break;
        default:
            break;
    }
    for (var i = 0; i < radiusArray.length; i++) {
        if (radiusArray[i]["city"] == city) {
          
            radiusArray[i].setVisible(control.checked);
            break;
        }
    }
}


function toggle2msClientDCRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "SaaS" ) {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggle5msClientDCRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "SaaS") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggle10msClientDCRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "SaaS") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggle20msClientDCRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "SaaS") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggle2msClientAzureRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "ClientAzure") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggle5msClientAzureRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "ClientAzure") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggle10msClientAzureRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "ClientAzure") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggle20msClientAzureRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "ClientAzure") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggleAzureMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "Azure") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
	console.log(mapLines);
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "Azure") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "Azure") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggle2msAzureRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "Azure") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggle5msAzureRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "Azure") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggle10msAzureRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "Azure") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggle20msAzureRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "Azure") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}


function toggleAWSCitiesUpdatedMarkers(city, control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "ClientAWS") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;

    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            // if (gmarkers[i]["type"] == "AWS" && gmarkers[i]["city"] == city) {
            if (gmarkers[i]["type"] == "ClientAWS" && gmarkers[i]["city"] == city) {
                console.log(gmarkers[i])
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            // if (gmarkers[i]["type"] == "AWS" && gmarkers[i]["city"] == city) {
            if (gmarkers[i]["type"] == "ClientAWS" && gmarkers[i]["city"] == city) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {


        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
        console.log("mapLines")
        console.log(mapLines)
    }

}



function toggleClientAzureCitiesUpdatedMarkers(city, control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "ClientAzure") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */

    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            //if (gmarkers[i]["type"] == "Azure" && gmarkers[i]["city"] == city) {
            if (gmarkers[i]["type"] == "ClientAzure" && gmarkers[i]["city"] == city) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            //if (gmarkers[i]["type"] == "Azure" && gmarkers[i]["city"] == city) {
            if (gmarkers[i]["type"] == "ClientAzure" && gmarkers[i]["city"] == city) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }

}

function toggleClientAWSMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "ClientAWS") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;

    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "ClientAWS" ) {
                console.log(gmarkers[i])
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "ClientAWS") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
       

        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
        console.log("mapLines")
        console.log(mapLines)
    }

}

function toggle2msClientAWSRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "ClientAWS") {
            radiusarray2[i].setVisible(control.checked && $('#aws-region').is(':checked'));
        }
    }
}

function toggle5msClientAWSRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "ClientAWS") {
            radiusarray5[i].setVisible(control.checked && $('#aws-region').is(':checked'));
        }
    }
}

function toggle10msClientAWSRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "ClientAWS") {
            radiusarray10[i].setVisible(control.checked && $('#aws-region').is(':checked'));
        }
    }
}

function toggle20msClientAWSRadius(control) {
    
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "ClientAWS") {
            radiusarray20[i].setVisible(control.checked && $('#aws-region').is(':checked'));
        }
    }
}

function toggleCoLocationMarkers(control) {
    //for (var i = 0; i < gmarkers.length; i++) {
    //    if (gmarkers[i]["type"] == "CoLocation") {
    //        gmarkers[i].setVisible(control.checked);
    //    }
    //}

    drawPathAndShowMarkersForTypes(control, "CoLocation")
}

function drawPathAndShowMarkersForTypes(control,type) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == type 
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == type
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/*function toggleEquinixColo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "Equinix"
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}

function toggleCyrusOneColo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "CyrusOne"
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}

function toggleDigitalRealtyColo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "Digital Realty"
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}

function toggleLevel3Colo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "Level 3 Communications, LLC"
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}

function toggleInterxionColo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "Interxion"
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}

/*function toggleCoreSiteColo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "CoreSite"
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}

function toggleCyxteraColo(control) {
  for (var i = 0; i < gmarkers.length; i++) {
    if (
      gmarkers[i]["type"] == "CoLocation" &&
      gmarkers[i]["companyname"] == "Cyxtera Technologies, Inc."
    ) {
      gmarkers[i].setVisible(control.checked);
    }
  }
}
*/
function toggleCoLocationWithAWSDC(control) {
	//console.log(control);
	console.log(mapLines)
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
	
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AWSDirectConnect") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AWSDirectConnect") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }


        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] == "CoLocation" &&
        gmarkers[i]["awsdconramp"] !== ""
      ) {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
   // toggleAWSDCOnRamp(control);
  //  toggleAWSMarkers(control);

}

function toggleCoLocationWithAzureER(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "GoogleCloud") {
        gmarkers[i].setVisible(control.checked);
      }
    }*/
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AzureExpressRoute") {
                console.log(gmarkers[i]["city"]);
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AzureExpressRoute") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }

}

function toggleAWSDCOnRamp(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AWSDirectConnect" && gmarkers[i]["awsdconramp"] !== "") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AWSDirectConnect" && gmarkers[i]["awsdconramp"] !== "") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


    toggleAzureExpressRoute(control);
    toggleAzureMarkers(control);
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "AWSDirectConnect") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
}

function toggleAWSMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "AWS") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AWS") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "AWS") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggle2msAWSRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "AWS") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggle5msAWSRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "AWS") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggle10msAWSRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "AWS") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggle20msAWSRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "AWS") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggle2msCoLocationRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "CoLocation") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggle5msCoLocationRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "CoLocation") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggle10msCoLocationRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "CoLocation") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggle20msCoLocationRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "CoLocation") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggleGoogleMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "GoogleCloud") {
        gmarkers[i].setVisible(control.checked);
      }
    }*/
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "GoogleCloud") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "GoogleCloud") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleSalesforceMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] == "SaaS" &&
        gmarkers[i]["companyname"] == "Salesforce"
      ) {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "Salesforce") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "Salesforce") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleServiceNowMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] == "SaaS" &&
        gmarkers[i]["companyname"] == "ServiceNow"
      ) {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "ServiceNow"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "ServiceNow"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleVirtustreamMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] == "SaaS" &&
        gmarkers[i]["companyname"] == "Virtustream"
      ) {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "Virtustream"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "Virtustream"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleSAPMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "SAP") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "SAP") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "SAP") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }




}

/******************* CoLocation *************************/

/*function toggleCoLocationMarkers(control) {
  var startPoint = JSON.parse(localStorage.getItem("startPoint"));
  var endPoint = JSON.parse(localStorage.getItem("endPoint"));
  var closedDistance = 100000000;
  var markerId = 0;
  if (startPoint === null && endPoint === null) {
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] == "CoLocation"
      ) {
        gmarkers[i].setVisible(control.checked);
      }
    }
  } else {
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] == "CoLocation"
      ) {
        var distanceSP = calcDistance(
          Number(startPoint.lat),
          Number(startPoint.lng),
          gmarkers[i].position.lat(),
          gmarkers[i].position.lng()
        );
        var distanceEP = calcDistance(
          Number(endPoint.lat),
          Number(endPoint.lng),
          gmarkers[i].position.lat(),
          gmarkers[i].position.lng()
        );
        var totalDistance = distanceSP + distanceEP;
        if (totalDistance < closedDistance) {
          closedDistance = totalDistance;
          markerId = i;
        }
        gmarkers[i].setVisible(control.checked);
      }
    }

    const points = [
      { lat: startPoint.lat, lng: startPoint.lng },
      {
        lat: gmarkers[markerId].position.lat(),
        lng: gmarkers[markerId].position.lng(),
      },
      { lat: endPoint.lat, lng: endPoint.lng },
    ];
    drawPathOnMap(points, control);
  }

  //drawPath
 
 
  function drawPathOnMap(points, control) {
      let isChecked = control.checked
    const shortestPath = new google.maps.Polyline({
      path: points,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
    var markerS = new google.maps.Marker({
      position: positionS,
      title: "Start Point",
    });

    var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
    var markerE = new google.maps.Marker({
      position: positionE,
      title: "Destination",
    });

        mapLines[control.id] = [shortestPath, markerS, markerE]
    if (isChecked) {
      markerS.setMap(map);
      markerE.setMap(map);
      shortestPath.setMap(map);
    } else {
      markerS.setMap(null);
      markerE.setMap(null);
      shortestPath.setMap(null);
    }
  }
  

}
*/
/******************* Equinix *************************/

function toggleEquinixColo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Equinix"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Equinix"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/******************* CyrusOne *************************/

function toggleCyrusOneColo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "CyrusOne"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "CyrusOne"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/******************* DigitalRealty *************************/

function toggleDigitalRealtyColo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Digital Realty"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Digital Realty"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/******************* Level3Colo *************************/

function toggleLevel3Colo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Level 3 Communications, LLC"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Level 3 Communications, LLC"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/******************* CyxteraColo *************************/

function toggleCyxteraColo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Cyxtera Technologies, Inc."
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Cyxtera Technologies, Inc."
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/******************* InterxionColo *************************/

function toggleInterxionColo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Interxion"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "Interxion"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

/******************* Core Site *************************/

function toggleCoreSiteColo(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }


    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "CoreSite"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "CoLocation" &&
                gmarkers[i]["companyname"] == "CoreSite"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }

}

/************ Duke Enery ************************/
function toggleDukeNetMarkers(control) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
   
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "Duke Energy"
            ) {
                gmarkers[i].setVisible(control.checked);

            }
        }
    } else {
        
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == "SaaS" &&
                gmarkers[i]["companyname"] == "Duke Energy"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }

                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMapDuke(points, control);
    }

    


    var subCategories = document.getElementsByClassName("subCategory");
    Array.prototype.map.call(subCategories, function (element) {
        element.checked = control.checked;
    });
}
// For Client sites map lines 

function toggleClientSites(control,_type,_companyname,_category) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    $('[name=' + control.id + 'tail]').prop('disabled', !control.checked);
    if (control.checked) {
       
    } else {

    }
    
    
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;

    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == _type &&
                gmarkers[i]["companyname"] == _companyname &&
                gmarkers[i]["category"] == _category
            ) {
                gmarkers[i].setVisible(control.checked);

            }
        }
    } else {

        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == _type &&
                gmarkers[i]["companyname"] == _companyname &&
                gmarkers[i]["category"] == _category
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }

                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMapDuke(points, control);
    }

}
//drawPath
function drawPathOnMapDuke(points, control) {
    let isChecked = control.checked
    const shortestPath = new google.maps.Polyline({
        path: points,
        geodesic: false,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });



    var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
    var markerS = new google.maps.Marker({
        position: positionS,
        title: "Start Point",
    });

    var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
    var markerE = new google.maps.Marker({
        position: positionE,
        title: "Destination",
    });

    mapLines[control.id] = [shortestPath, markerS, markerE]
    if (isChecked) {
        markerS.setMap(map);
        markerE.setMap(map);
        shortestPath.setMap(map);
    } else {
        markerS.setMap(null);
        markerE.setMap(null);
        shortestPath.setMap(null);
    }
}
function distance(lat1, lon1, lat2, lon2, unit) {
    console.log('lat1', lat1);
    console.log('lon1', lon1);
    console.log('lat2', lat2);
    console.log('lon2', lon2);
    console.log('unit', unit);

    var radlat1 = Math.PI * lat1/180;
    var radlat2 = Math.PI * lat2/180;
    var theta = lon1-lon2;
    var radtheta = Math.PI * theta/180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
        dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180/Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist;
}

function togglePeeringTrail(control, lat, long) {
    var allCities = allCitiesData.Cities;
    console.log('lat', lat);
    console.log('long',long);
    console.log(allCities);
    var distArray = [];
    allCities.forEach((city, index)=>{
        dist = distance(lat, long, city.Lat, city.Long, "k");
        allCities[index]['distance'] = dist;
        distArray.push(dist);
    });
    var first = Math.min(...distArray);
    var removeIndex =  distArray.indexOf(first);
    distArray.splice(removeIndex,1);
    var second = Math.min(...distArray);
    console.log("allCities", first, second);

    var firstCity = allCities.filter(city=> {return city.distance == first} );
    var secondCity = allCities.filter(city=> {return city.distance ==second} );

    
    firstCity[0].markerIcon = "images/target.svg";
    secondCity[0].markerIcon = "images/target.svg";

    // ('.view_tails')
    deleteMarkers();
    if($(control).is( ":checked" )) {
        let dpfirst = {
            location: new google.maps.LatLng(parseFloat(firstCity[0].Lat), parseFloat(firstCity[0].Long)),
            data: firstCity[0]
        }
        createMarker(dpfirst);

        let dpsecond = {
            location: new google.maps.LatLng(parseFloat(secondCity[0].Lat), parseFloat(secondCity[0].Long)),
            data: secondCity[0]
        }
        createMarker(dpsecond);
        $("input[name='cityname'][value='"+firstCity[0].Location+"']").prop("checked", true);
        $("input[name='cityname'][value='"+secondCity[0].Location+"']").prop("checked", true);
    } else {
        // deleteMarkers();
        // firstCity[0].markerIcon = "images/target.svg";
        // secondCity[0].markerIcon = "images/target.svg";
        // deleteOneMarker(firstCity[0]);
        // deleteOneMarker(secondCity[0]);
        $("input[name='cityname'][value='"+firstCity[0].Location+"']").prop("checked", false);
        $("input[name='cityname'][value='"+secondCity[0].Location+"']").prop("checked", false);
    }
    

}
function toggleFarmClient(control, farmName, img) {
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    $('[name=' + control.id + 'tail]').prop('disabled', !control.checked);
    if (control.checked) {
       
    } else {

    }
    
    
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    var _type = "Farm";
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            //gmarkers[i]["Site Code"];
           // gmarkers[i]["type"];
            if (
                gmarkers[i]["type"] == _type &&
                gmarkers[i]["farmname"] == farmName
            ) {
                console.log("farm", gmarkers[i]["type"]);
                console.log('images/'+img);
                gmarkers[i].setVisible(control.checked);
                gmarkers[i].setIcon('images/'+img);
            }
        }
    } else {

        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == _type &&
                gmarkers[i]["farmname"] == farmName
            ) {
                console.log('images/'+img);
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }

                gmarkers[i].setVisible(control.checked);
                gmarkers[i].setIcon('images/'+img);
                
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMapDuke(points, control);
    }
}
function toggleFarmVendor(control, vendorName, img) {
    console.log(mapLines);
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }
    $('[name=' + control.id + 'tail]').prop('disabled', !control.checked);
    if (control.checked) {
       
    } else {

    }
    
    
    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    var _type = "Farm";
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            gmarkers[i]["Site Code"];
            gmarkers[i]["type"];
            if (
                gmarkers[i]["type"] == _type &&
                gmarkers[i]["vendername"] == vendorName
            ) {
                console.log('images/'+img);
                gmarkers[i].setVisible(control.checked);
                gmarkers[i].setIcon('images/'+img);
            }
        }
    } else {

        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] == _type &&
                gmarkers[i]["vendername"] == vendorName
            ) {
                console.log('images/'+img);
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }

                gmarkers[i].setVisible(control.checked);
                gmarkers[i].setIcon('images/'+img);
                
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMapDuke(points, control);
    }
}
function toggleDukeNetMarkersAccessPoint(control) {

    toggleClientSites(control, "SaaS", "Duke Energy", "AccessPoint");
    
}

function toggleDukeNetMarkersDataCenter(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "DataCenter");
   
}

//function toggleDukeNetMarkersDataCenter(control) {
//    for (var i = 0; i < gmarkers.length; i++) {
//        if (
//            gmarkers[i]["type"] == "SaaS" &&
//            gmarkers[i]["companyname"] == "Duke Energy" &&
//            gmarkers[i]["category"] == "DataCenter"
//        ) {
//            gmarkers[i].setVisible(control.checked);
//        }
//    }
//}

function toggleDukeNetMarkersBattery(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "BatteryDuke");
  
}

function toggleDukeNetMarkersCampus(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Campus");
   
}

function toggleDukeNetMarkersCell(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Cell");
    
}

function toggleDukeNetMarkersCOPOP(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "COPOP");
   
}

function toggleDukeNetMarkersElectricSubstation(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "ElectricSubstation");
   
}

function toggleDukeNetMarkersHydroElectricPlant(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "HydroElectricPlant");
   
}

function toggleDukeNetMarkersMiscellaneous(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Miscellaneous");
  
}

function toggleDukeNetMarkersMLSP(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "MLSP");
   
}

function toggleDukeNetMarkersNuclearPlant(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "NuclearPlant");
    
}

function toggleDukeNetMarkersNuclearSiren(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Siren");
    //for (var i = 0; i < gmarkers.length; i++) {
    //    if (
    //        gmarkers[i]["type"] == "SaaS" &&
    //        gmarkers[i]["companyname"] == "Duke Energy" &&
    //        gmarkers[i]["category"] == "Siren"
    //    ) {
    //        gmarkers[i].setVisible(control.checked);
    //    }
    //}
}

function toggleDukeNetMarkersOffice(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Office");
   
}

function toggleDukeNetMarkersPiedmont(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "PiedmontGas");
    
}

function toggleDukeNetMarkersRemoteLineSwitch(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "RemoteLineSwitch");
    
}

function toggleDukeNetMarkersSiren(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "SirenEnergy");
    
}

function toggleDukeNetMarkersPowerStation(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "PowerStation");
  
}

function toggleDukeNetMarkersStomStaging(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "StormStaging");
  
}

function toggleDukeNetMarkersTower(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Tower");

}

function toggleDukeNetMarkersWindPlant(control) {
    toggleClientSites(control, "SaaS", "Duke Energy", "Windplant");
   
}

function toggleDataCenterMarkers(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientDataCenter") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier1(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier1") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier2(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier2") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier3(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier3") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier4(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier4") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier5(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier5") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier6(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier6") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientPeeringPoints(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (
        gmarkers[i]["type"] === "ClientTransportHub" ||
        gmarkers[i]["type"] === "ClientPerformanceHub"
      ) {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] === "ClientTransportHub" ||
                gmarkers[i]["type"] === "ClientPerformanceHub"
            ) {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (
                gmarkers[i]["type"] === "ClientTransportHub" ||
                gmarkers[i]["type"] === "ClientPerformanceHub"
            ) {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


    toggleClientBackbone(control);
}

function toggleClientPerformanceHubs(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] === "ClientPerformanceHub") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientPerformanceHubs2msPeerRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] === "ClientPerformanceHub") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggleClientPerformanceHubs5msPeerRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] === "ClientPerformanceHub") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggleClientPerformanceHubs10msPeerRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] === "ClientPerformanceHub") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggleClientPerformanceHubs20msPeerRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] === "ClientPerformanceHub") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggleClientTransportHubs(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] === "ClientTransportHub") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTransportHubs2msPeerRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] === "ClientTransportHub") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggleClientTransportHubs5msPeerRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] === "ClientTransportHub") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggleClientTransportHubs10msPeerRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] === "ClientTransportHub") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggleClientTransportHubs20msPeerRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] === "ClientTransportHub") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggleEquinixMarkers(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "Equinix") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleNetworkPeer(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "NetworkPeerPoint") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "NetworkPeerPoint") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "NetworkPeerPoint") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });



        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}

function toggleNetwork2msPeerRadius(control) {
    for (var i = 0; i < radiusarray2.length; i++) {
        if (radiusarray2[i]["type"] == "NetworkPeerPoint") {
            radiusarray2[i].setVisible(control.checked);
        }
    }
}

function toggleNetwork5msPeerRadius(control) {
    for (var i = 0; i < radiusarray5.length; i++) {
        if (radiusarray5[i]["type"] == "NetworkPeerPoint") {
            radiusarray5[i].setVisible(control.checked);
        }
    }
}

function toggleNetwork10msPeerRadius(control) {
    for (var i = 0; i < radiusarray10.length; i++) {
        if (radiusarray10[i]["type"] == "NetworkPeerPoint") {
            radiusarray10[i].setVisible(control.checked);
        }
    }
}

function toggleNetwork20msPeerRadius(control) {
    for (var i = 0; i < radiusarray20.length; i++) {
        if (radiusarray20[i]["type"] == "NetworkPeerPoint") {
            radiusarray20[i].setVisible(control.checked);
        }
    }
}

function toggleLongHaulFiber(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "LongHaulFiber") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientBackbone(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientBackbone") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientBroadbandInternet(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientBroadband-Internet") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier1PrimaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier1PrimaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier1SecondaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier1SecondaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier2PrimaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier2PrimaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier2SecondaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier2SecondaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier3PrimaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier3PrimaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier3SecondaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier3SecondaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier4PrimaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier4PrimaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier4SecondaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier4SecondaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier5PrimaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier5PrimaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientTier5SecondaryTail(control) {
    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier5SecondaryTail") {
            gmarkers[i].setVisible(control.checked);
        }
    }
}

function toggleClientSaaSMarkers(control) {
    /*
    for (var i = 0; i < gmarkers.length; i++) {
      if (gmarkers[i]["type"] == "ClientSaaS") {
        gmarkers[i].setVisible(control.checked);
      }
    }
    */
    try {
        mapLines[control.id].forEach(function (line) {
            line.setMap(null)
        })
    }
    catch (e) {
        console.log(e)
    }

    var startPoint = JSON.parse(localStorage.getItem("startPoint"));
    var endPoint = JSON.parse(localStorage.getItem("endPoint"));
    var closedDistance = 100000000;
    var markerId = 0;
    if (startPoint === null && endPoint === null) {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "ClientSaaS") {
                gmarkers[i].setVisible(control.checked);
            }
        }
    } else {
        for (var i = 0; i < gmarkers.length; i++) {
            if (gmarkers[i]["type"] == "ClientSaaS") {
                var distanceSP = calcDistance(
                    Number(startPoint.lat),
                    Number(startPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var distanceEP = calcDistance(
                    Number(endPoint.lat),
                    Number(endPoint.lng),
                    gmarkers[i].position.lat(),
                    gmarkers[i].position.lng()
                );
                var totalDistance = distanceSP + distanceEP;
                if (totalDistance < closedDistance) {
                    closedDistance = totalDistance;
                    markerId = i;
                }
                gmarkers[i].setVisible(control.checked);
            }
        }

        const points = [{
            lat: startPoint.lat,
            lng: startPoint.lng
        },
        {
            lat: gmarkers[markerId].position.lat(),
            lng: gmarkers[markerId].position.lng(),
        },
        {
            lat: endPoint.lat,
            lng: endPoint.lng
        },
        ];
        drawPathOnMap(points, control);
    }

    //drawPath
    function drawPathOnMap(points, control) {
        let isChecked = control.checked
        const shortestPath = new google.maps.Polyline({
            path: points,
            geodesic: false,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        var positionS = new google.maps.LatLng(points[0].lat, points[0].lng);
        var markerS = new google.maps.Marker({
            position: positionS,
            title: "Start Point",
        });

        var positionE = new google.maps.LatLng(points[2].lat, points[2].lng);
        var markerE = new google.maps.Marker({
            position: positionE,
            title: "Destination",
        });

        mapLines[control.id] = [shortestPath, markerS, markerE]
        if (isChecked) {
            markerS.setMap(map);
            markerE.setMap(map);
            shortestPath.setMap(map);
        } else {
            markerS.setMap(null);
            markerE.setMap(null);
            shortestPath.setMap(null);
        }
    }


}



function getText() {
    var output = "";

    for (var i = 0; i < gmarkers.length; i++) {
        if (gmarkers[i]["type"] == "ClientTier1") {
            output = output + i + " " + gmarkers[i]["title"] + "<br>";
        }
    }

    document.getElementById("legend").innerHTML = output;
}

function calcDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return (Value * Math.PI) / 180;
}

function printAnyMaps() {
    const $body = $("body");
    const $mapContainer = $("#map");
    const $mapContainerParent = $mapContainer.parent();
    const $printContainer = $('<div style="position:relative;">');

    $printContainer
        .height($mapContainer.height())
        .append($mapContainer)
        .prependTo($body);

    const $content = $body.children().not($printContainer).not("script").detach();

    /**
     * Needed for those who use Bootstrap 3.x, because some of
     * its `@media print` styles ain't play nicely when printing.
     */
    const $patchedStyle = $('<style media="print">')
        .text(
            `
		  img { max-width: none !important; }
		  a[href]:after { content: ""; }
		`
        )
        .appendTo("head");

    window.print();

    $body.prepend($content);
    $mapContainerParent.prepend($mapContainer);

    $printContainer.remove();
    $patchedStyle.remove();
}

function logout() { }

function getGoogleMapOptions(latitude, longitude, zoomlevel) {
    var mapOptions = {
        zoom: zoomlevel,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeId: "roadmap",
        mapTypeControl: false,

        styles: [{
            elementType: "geometry",
            stylers: [{
                color: "#FFFFFF",
            },],
        },
        {
            elementType: "labels",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            elementType: "labels.icon",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            elementType: "labels.text.fill",
            stylers: [{
                color: "#616161",
            },],
        },
        {
            elementType: "labels.text.stroke",
            stylers: [{
                color: "#f5f5f5",
            },],
        },
        {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "administrative.land_parcel",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "administrative.land_parcel",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "administrative.province",
            elementType: "geometry.stroke",
            stylers: [{
                visibility: "on"
            }, {
                color: "#808080"
            }],
        },
        {
            featureType: "administrative.neighborhood",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "administrative.country",
            elementType: "geometry.stroke",
            stylers: [{
                visibility: "on"
            }, {
                color: "#808080"
            }],
        },
        {
            featureType: "poi",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "road",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{
                color: "#ffffff",
            },],
        },
        {
            featureType: "road",
            elementType: "labels.icon",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "road.arterial",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{
                color: "#dadada",
            },],
        },
        {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#616161",
            },],
        },
        {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#9e9e9e",
            },],
        },
        {
            featureType: "transit",
            stylers: [{
                visibility: "off",
            },],
        },
        {
            featureType: "transit.line",
            elementType: "geometry",
            stylers: [{
                color: "#e5e5e5",
            },],
        },
        {
            featureType: "transit.station",
            elementType: "geometry",
            stylers: [{
                color: "#eeeeee",
            },],
        },
        {
            featureType: "water",
            elementType: "geometry",

            stylers: [{
                color: "#eeeeee"
            }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{
                color: "#fff",
            },],
        },
        {
            featureType: "water",
            elementType: "geometry.stroke",
            stylers: [{
                visibility: "on"
            }, {
                color: "#fff"
            }],
        },
        ],
    };

    return mapOptions;
}

function createMarker(data,id) {



    var marker = new google.maps.Marker({
        position: data.location,
        title: id ?? "",
        icon: iconBase + data.data.markerIcon,
        map: map
    });
    if (jQuery.inArray(marker,allCitiesMarkers)==-1) {
        allCitiesMarkers.push(marker);

        //let popUpContent = "<b>" + data.data.Name + "</b>";
		let popUpContent = "<h3>" + data.data.Location + "</h3>";
		popUpContent = popUpContent + "<br><b>City:</b> " + data.data['City/State/province'];
		popUpContent = popUpContent + "<br><b>Country:</b> " + data.data.Country;
		 
        var infowindow = new google.maps.InfoWindow({
            content: popUpContent
        });

        google.maps.event.addListener(marker, 'click', function () {
            if (activeInfoWindow) { activeInfoWindow.close(); }
             console.log(marker);
            infowindow.open(map, marker);
            activeInfoWindow = infowindow;
        });
    }
    


}

function deleteOneMarker(data) {
    var marker = new google.maps.Marker({
        position: data.location,
        // title: data.phone,
        icon: iconBase + data.markerIcon,
        map: map
    });
    for (let i = 0; i < allCitiesMarkers.length; i++) {
        if (marker == allCitiesMarkers[i]) {
            allCitiesMarkers[i].setMap(null);
            
            allCitiesMarkers.splice(i, 1);
            break;
        }
       
    }

}

function deleteMarkers() {
    setMapOnAllMarkers(allCitiesMarkers);
    allCitiesMarkers = [];
}
function setMapOnAllMarkers(markers) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

function clearRadiusCircles() {
   
    for (var i = 0; i < radiusarray2.length; i++) {
        radiusarray2[i].setVisible(false);
    }
    for (var i = 0; i < radiusarray5.length; i++) {
        radiusarray5[i].setVisible(false);
    }
    for (var i = 0; i < radiusarray10.length; i++) {
        
        radiusarray10[i].setVisible(false);
       
    }
    for (var i = 0; i < radiusarray20.length; i++) {
       
        radiusarray20[i].setVisible(false);
        
    }
}


function clearEverything() {
    Object.keys(mapLines).forEach(function (key) {
        mapLines[key].forEach(function (line) {
            line.setMap(null)
        })
        delete mapLines[key]
    })

    let inputs = document.getElementsByTagName("input")
    Array.from(inputs).forEach(function (input) {
        if (input.type === "checkbox") {
            input.checked = false
        }
        if (input.id == "searchInput" || input.id == "destinationInput") {
            input.value = ""
        }
    })
    localStorage.clear()
    gmarkers.forEach(function (marker) {
        marker.setVisible(false)
    })
    Object.keys(currCityMarkers).forEach(function (marker) {
        currCityMarkers[marker]["marker"].setVisible(false)
    })
    currCityMarkers = {}

    dvDistance.innerHTML = "";
    dvDistance.innerHTML = "";
    map.innerHTML = "";
    // initMap();
    $('#mySidebar ').find('input[type=checkbox]:checked').removeAttr('checked');
    $('#mySidebar input:checkbox').prop('checked', false);
    collapseMenu();

    deleteMarkers();
    clearRadiusCircles();
    if (drawingManager) {
        drawingManager.setMap(null); // Used to disable the Circle tool
        map.controls[google.maps.ControlPosition.TOP_CENTER].clear();
        deleteAllShape();
         // Clear out the old markers.
        markersSearchBox.forEach((marker) => {
            marker.setMap(null);
        });
    }

    $('.newboxes').each(function (index) {
       
            $(this).slideUp(200);
        
    });
    tailSelected = [];
}