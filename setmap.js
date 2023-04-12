var gmarkers = [];
var radiusarray2 = [];
var radiusarray5 = [];
var radiusarray10 = [];
var radiusarray20 = [];
var map;
var convertedLatLong;
var tailSelected = [];

var distanceOrigin;
var distanceDestination;
var source, destination;
var directionsDisplay;
var directionsDisplay;
var directionsService;
var startPoint = { lat: 0, lng: 0 };
var endPoint = { lat: 0, lng: 0 };
//var geocoder = new google.maps.Geocoder();
function initMap() {
    //https://developers.google.com/maps/documentation/javascript/style-reference

    localStorage.clear();

    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    loadMetaData();

    //document.getElementById("tier1site").innerHTML = "BIG TIER LABEL";

    var mapOptions = getGoogleMapOptions(37.450143, -92.778961, 4);

    /* var mapOptions = {
         zoom: 3,
         center: { lat: parseFloat(37.450143), lng: parseFloat(-92.778961) }
       
 
     };*/

    //var directionsService = new google.maps.DirectionsService();
    google.maps.event.addDomListener(window, "load", function () {
        var startInput = document.getElementById("searchInput");
        var destinationInput = document.getElementById("destinationInput");
        var autocompleteStart = new google.maps.places.Autocomplete(startInput);
        var autocompleteEnd = new google.maps.places.Autocomplete(destinationInput);

        google.maps.event.addListener(
            autocompleteStart,
            "place_changed",
            function () {
                var place = autocompleteStart.getPlace();
                console.log(place);
                startPoint = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    formatted_address: place.formatted_address
                };
                console.log(startPoint);
                localStorage.setItem("startPoint", JSON.stringify(startPoint));
            }
        );
        google.maps.event.addListener(
            autocompleteEnd,
            "place_changed",
            function () {
                var place = autocompleteEnd.getPlace();
                endPoint = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    formatted_address: place.formatted_address
                };
                console.log(endPoint);
                localStorage.setItem("endPoint", JSON.stringify(endPoint));
            }
        );

        directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: false,
        });
    });

    //map = new google.maps.Map(document.getElementById('map'));

    // Create search box

    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    loadCitiesData();

    var citiesAzureHTML = "", citiesAWSHTML = "";

    var url = "https://sheets.googleapis.com/v4/spreadsheets/17C54tkoR8_C3p5hYeCpY0fe96pKFg--qfBWO1r1XC1g/?key=AIzaSyA3T3GjoAQPRXrGB9yUIA-jQkAUdtxHx68&includeGridData=true";
    var farmData = [];
    axios.get(url)
        .then(function (response) {
            var data = response.data.sheets[0].data[0].rowData;
            data.forEach((element, index) => {
                if (index !== 0) {
                    var obj = {};
                    for (var i = 0; i < data[0].values.length; i++) {
                        //console.log(data[0].values[i].formattedValue);
                        var key = data[0].values[i].formattedValue;
                        var single = { [key]: element.values[i].formattedValue }
                        obj = { ...obj, ...single };
                    }
                    obj['Type'] = "Farm";
                    farmData.push(obj);
                }
            })
            callgetJSON(farmData);
            loadVendorParent(farmData);

        })
        .catch(function (error) {
            console.log(error);
        });
    function callgetJSON(farmData) {
        $.getJSON("CloudMapDataComplete.json", function (data) {
            $.each(data, function (key, subNodeVal) {
                subNodeVal = subNodeVal.concat(farmData);
                $.each(subNodeVal, function (key, val) {
                    var lat = "";
                    var longitude = "";
                    var latLng = "";
                    var markername = "";
                    var peaktraffic = "";
                    var members = "";
                    var city = "";
                    var country = "";
                    var website = "";
                    var memberwebsite = "";
                    var trafficwebsite = "";
                    var desc = "";
                    var infocontent = "";
                    var type = "";
                    var markerimage = "";
                    var az = "";
                    var peering = "";
                    var awsdcproviders = "https://aws.amazon.com/directconnect/partners/";
                    var awsdcinfo =
                        "https://aws.amazon.com/directconnect/pricing/#AWS_Direct_Connect_data_transfer";
                    var racks = "";
                    var cost = "";
                    var markericon = "";
                    var beginlat = "";
                    var beginlong = "";
                    var endlat = "";
                    var endlong = "";
                    var costpermonth = "";
                    var bandwidthmbps = "";
                    var backupbandwidthmbps = "";
                    var address = "";
                    var state = "";
                    var zip = "";
                    var phone = "";
                    var accessspeed = "";
                    var portspeed = "";
                    var primarycost = "";
                    var accessspeed2 = "";
                    var portspeed2 = "";
                    var backupcost = "";
                    var companyname = "";
                    var farmname = "";
                    var vendername = "";
                    var sitecode = "";
                    var sitecategory = "";
                    var syngentagroup = "";
                    var region = "";
                    var sitecontact = "";
                    var sitecontactphone = "";
                    var equipmentowner = "";
                    var awsdconramp = "";
                    var fibermiles = "";
                    var carrier = "";
                    var primarycolo = "";
                    var businessunit = "";
                    var numofemployees = "";
                    var category = "";
                    var service = "";
                    var accountnumber = "";
                    var serviceid = "";


                    $.each(val, function (innerkey, innerval) {
                        if (innerkey.toLowerCase() === "Type".toLowerCase()) {
                            type = innerval;
                        } else if (innerkey.toLowerCase() === "Latitude".toLowerCase()) {
                            lat = innerval;
                        } else if (innerkey.toLowerCase() === "Longitude".toLowerCase()) {
                            longitude = innerval;
                        } else if (innerkey.toLowerCase() === "Name".toLowerCase()) {
                            markername = innerval;
                        } else if (innerkey.toLowerCase() === "PeakTrafficGbps") {
                            peaktraffic = innerval;
                        } else if (innerkey.toLowerCase() === "Members") {
                            members = innerval;
                        } else if (innerkey.toLowerCase() === "CITY".toLowerCase()) {
                            city = innerval;
                        } else if (innerkey.toLowerCase() === "COUNTRY".toLowerCase()) {
                            country = innerval;
                        } else if (innerkey === "Website") {
                            website = innerval;
                        } else if (innerkey === "MemberWebsite") {
                            memberwebsite = innerval;
                        } else if (innerkey === "TrafficWebsite") {
                            trafficwebsite = innerval;
                        } else if (innerkey === "Description") {
                            desc = innerval;
                        } else if (innerkey === "AZ") {
                            az = innerval;
                        } else if (innerkey === "DCInfo") {
                            dcinfo = innerval;
                        } else if (innerkey === "Racks") {
                            racks = innerval;
                        } else if (innerkey === "Cost") {
                            cost = innerval;
                        } else if (innerkey === "MarkerIcon") {
                            markericon = innerval;
                        } else if (innerkey === "BeginLatitude") {
                            beginlat = innerval;
                        } else if (innerkey === "BeginLongitude") {
                            beginlong = innerval;
                        } else if (innerkey === "EndLatitude") {
                            endlat = innerval;
                        } else if (innerkey === "EndLongitude") {
                            endlong = innerval;
                        } else if (innerkey === "CostPerMonth") {
                            costpermonth = innerval;
                        } else if (innerkey === "FiberMiles") {
                            fibermiles = innerval;
                        } else if (innerkey === "BandwidthMbps") {
                            bandwidthmbps = innerval;
                        } else if (innerkey === "Address") {
                            address = innerval;
                        } else if (innerkey === "State") {
                            state = innerval;
                        } else if (innerkey === "ZIP") {
                            zip = innerval;
                        } else if (innerkey === "Phone") {
                            phone = innerval;
                        } else if (innerkey === "AccessSpeed") {
                            accessspeed = innerval;
                        } else if (innerkey === "PortSpeed") {
                            portspeed = innerval;
                        } else if (innerkey === "PrimaryCost") {
                            primarycost = innerval;
                        } else if (innerkey === "AccessSpeed2") {
                            accessspeed2 = innerval;
                        } else if (innerkey === "PortSpeed2") {
                            portspeed2 = innerval;
                        } else if (innerkey === "BackupCost") {
                            backupcost = innerval;
                        } else if (innerkey.toLowerCase() === "CompanyName".toLowerCase()) {
                            companyname = innerval;
                        } else if (innerkey === "Site Code") {
                            farmname = innerval;
                        } else if (innerkey === "Vendor Parent") {
                            vendername = innerval;
                        } else if (innerkey === "Service  Type") {
                            service = innerval;
                        } else if (innerkey === "Account Number") {
                            accountnumber = innerval;
                        } else if (innerkey === "Service ID") {
                            serviceid = innerval;
                        } else if (innerkey === "SiteCode") {
                            sitecode = innerval;
                        } else if (innerkey === "SiteCategory") {
                            sitecategory = innerval;
                        } else if (innerkey === "SyngentaGroup") {
                            syngentagroup = innerval;
                        } else if (innerkey === "Region") {
                            region = innerval;
                        } else if (innerkey === "SiteContactName") {
                            sitecontact = innerval;
                        } else if (innerkey === "SiteContactPhone") {
                            sitecontactphone = innerval;
                        } else if (innerkey === "EquipmentOwner") {
                            equipmentowner = innerval;
                        } else if (innerkey === "AWSDCOnRamp") {
                            awsdconramp = innerval;
                        } else if (innerkey === "Carrier") {
                            carrier = innerval;
                        } else if (innerkey === "BackupBandwidthMbps") {
                            backupbandwidthmbps = innerval;
                        } else if (innerkey === "PrimaryColo") {
                            primarycolo = innerval;
                        } else if (innerkey === "BusinessUnit") {
                            businessunit = innerval;
                        } else if (innerkey === "NumOfEmployees") {
                            numofemployees = innerval;
                        } else if (innerkey.toLowerCase() === "Category".toLowerCase()) {
                            category = innerval;
                        }
                    });

                    infocontent = "<h3>" + markername + "</h3>";
                    infocontent = infocontent + "<input type='checkbox' class='view_tails' onclick='togglePeeringTrail(this," + lat + "," + longitude + ");' /> View Tails<br/>";

                    if (companyname !== "") {
                        infocontent = infocontent + "<b>Company Name:</b> " + companyname;
                    }
                    if (farmname !== "") {
                        infocontent = infocontent + "<b>Site Codes:</b> " + farmname;
                    }

                    if (!!sitecode) {
                        infocontent = infocontent + "<br><b>Site Code:</b> " + sitecode;
                    }
                    if (!!sitecategory) {
                        infocontent =
                            infocontent + "<br><b>Site Category:</b> " + sitecategory;
                    }
                    if (!!syngentagroup) {
                        infocontent =
                            infocontent + "<br><b>Syngenta Group:</b> " + syngentagroup;
                    }
                    if (!!businessunit) {
                        infocontent =
                            infocontent + "<br><b>Business Unit:</b> " + businessunit;
                    }
                    if (!!region) {
                        infocontent = infocontent + "<br><b>Region:</b> " + region;
                    }
                    if (!!address) {
                        infocontent = infocontent + "<br><b>Address:</b> " + address;
                    }
                    if (vendername !== "") {
                        infocontent = infocontent + "<br><b>Vendor:</b> " + vendername;
                    }
                    if (!!service) {
                        infocontent = infocontent + "<br><b>Service:</b> " + service;
                    }
                    if (!!accountnumber) {
                        infocontent = infocontent + "<br><b>Account #:</b> " + accountnumber;
                    }
                    if (!!serviceid) {
                        infocontent = infocontent + "<br><b>Service ID:</b> " + serviceid;
                    }
                    if (!!city) {
                        infocontent = infocontent + "<br><b>City:</b> " + city;
                    }
                    if (!!state) {
                        infocontent = infocontent + "<br><b>State:</b> " + state;
                    }
                    if (!!zip) {
                        infocontent = infocontent + "<br><b>Zip:</b> " + zip;
                    }
                    if (!!country) {
                        infocontent = infocontent + "<br><b>Country:</b> " + country;
                    }
                    if (!!numofemployees) {
                        infocontent =
                            infocontent + "<br><b># of Employees:</b> " + numofemployees;
                    }
                    if (!!awsdconramp) {
                        infocontent =
                            infocontent + "<br><b>AWS DC On Ramp For:</b> " + awsdconramp;
                    }
                    if (!!peaktraffic) {
                        infocontent =
                            infocontent + "<br><b>Peak Traffic:</b> " + peaktraffic + " Gbps";
                    }
                    if (!!members) {
                        infocontent = infocontent + "<br><b>Members:</b> " + members;
                    }
                    if (website !== "") {
                        infocontent =
                            infocontent +
                            '<br><b><a href="' +
                            website +
                            '" target="_blank">Website</a></b>';
                    }
                    if (memberwebsite !== "") {
                        infocontent =
                            infocontent +
                            '<br><b><a href="' +
                            memberwebsite +
                            '" target="_blank">Member List</a></b>';
                    }
                    if (!!trafficwebsite) {
                        infocontent =
                            infocontent +
                            '<br><b><a href="' +
                            trafficwebsite +
                            '" target="_blank">Traffic</a></b>';
                    }
                    if (!!costpermonth) {
                        infocontent =
                            infocontent + "<br><b>Cost per Month:</b> $" + costpermonth;
                    }
                    if (!!fibermiles) {
                        infocontent =
                            infocontent + "<br><b>Distance:</b> " + fibermiles + " miles";
                    }
                    if (!!bandwidthmbps) {
                        infocontent =
                            infocontent + "<br><b>Bandwidth:</b> " + bandwidthmbps + " Mbps";
                    }
                    if (!!backupbandwidthmbps) {
                        infocontent =
                            infocontent + "<br><b>Backup:</b> " + backupbandwidthmbps + " Mbps";
                    }
                    if (!!carrier) {
                        infocontent = infocontent + "<br><b>Carrier:</b> " + carrier;
                    }
                    if (sitecontact !== "") {
                        infocontent = infocontent + "<br><b>Site Contact:</b> " + sitecontact;
                    }
                    if (sitecontactphone !== "") {
                        infocontent =
                            infocontent + "<br><b>Site Contact Phone:</b> " + sitecontactphone;
                    }
                    if (equipmentowner !== "") {
                        infocontent =
                            infocontent + "<br><b>Equipment Owner:</b> " + equipmentowner;
                    }
                    if (phone !== "") {
                        infocontent = infocontent + "<br><b>Phone:</b> " + phone;
                    }
                    if (accessspeed !== "") {
                        infocontent = infocontent + "<br><b>Access Speed:</b> " + accessspeed;
                    }
                    if (portspeed !== "") {
                        infocontent = infocontent + "<br><b>Port Speed:</b> " + portspeed;
                    }
                    if (primarycost !== "") {
                        infocontent = infocontent + "<br><b>Primary Cost:</b> " + primarycost;
                    }
                    if (accessspeed2 !== "") {
                        infocontent =
                            infocontent + "<br><b>Access Speed 2:</b> " + accessspeed2;
                    }
                    if (portspeed2 !== "") {
                        infocontent = infocontent + "<br><b>Port Speed 2:</b> " + portspeed2;
                    }
                    if (backupcost !== "") {
                        infocontent = infocontent + "<br><b>Backup Cost:</b> " + backupcost;
                    }
                    if (primarycolo !== "") {
                        infocontent =
                            infocontent + "<br><b>Primary Colo Provider:</b> " + primarycolo;
                    }

                    if (desc !== "") {
                        infocontent = infocontent + "<br><b>Notes:</b> " + desc;
                    }

                    // CONNECTIONS
                    if (
                        type === "ClientTier2PrimaryTail" ||
                        type === "AWSDirectConnect" ||
                        type === "LongHaulFiber" ||
                        type === "ClientBackbone" ||
                        type === "ClientBroadband-Internet" ||
                        type === "ClientTier1PrimaryTail" ||
                        type === "ClientTier1SecondaryTail" ||
                        type === "ClientTier2SecondaryTail" ||
                        type === "ClientTier3PrimaryTail" ||
                        type === "ClientTier3SecondaryTail" ||
                        type === "ClientTier4PrimaryTail" ||
                        type === "ClientTier4SecondaryTail" ||
                        type === "ClientTier5PrimaryTail" ||
                        type === "ClientTier5SecondaryTail" ||
                        type === "CoLocation"
                    ) {
                        if (beginlat && beginlong) {
                            var connectionPath = getConnectionPath(
                                beginlat,
                                beginlong,
                                endlat,
                                endlong,
                                type,
                                category,
                                companyname
                            );

                            connectionPath.setMap(map);

                            var infowindow = new google.maps.InfoWindow({
                                content: infocontent,
                            });
                            google.maps.event.addListener(
                                connectionPath,
                                "mouseover",
                                function (event) {
                                    infowindow.setPosition(event.latLng);
                                    infowindow.open(map);
                                }
                            );
                            google.maps.event.addListener(
                                connectionPath,
                                "mouseout",
                                function (event) {
                                    infowindow.close();
                                }
                            );

                            connectionPath.setVisible(false);
                            gmarkers.push(connectionPath);
                        }
                    }
                    // LOCATIONS (markers)
                    if (
                        type === "ClientTier1" ||
                        type === "ClientTier2" ||
                        type === "ClientTier3" ||
                        type === "ClientTier4" ||
                        type === "ClientTier5" ||
                        type === "ClientTier6" ||
                        type === "NetworkPeerPoint" ||
                        type === "AWSDirectConnect" ||
                        type === "IXPTier1" ||
                        type === "IXPTier2" ||
                        type === "IXPTier3" ||
                        type === "AWS" ||
                        type === "Azure" ||
                        type === "azureexrt" ||
                        type === "awsdconramp" ||
                        type === "GoogleCloud" ||
                        type === "AzureExpressRoute" ||
                        type === "SaaS" ||
                        type === "Farm" ||
                        type === "ClientAWS" ||
                        type === "ClientAzure" ||
                        type === "ClientTransportHub" ||
                        type === "ClientPerformanceHub" ||
                        type === "ClientDataCenter" ||
                        type === "CoLocation" ||
                        type === "SAP"
                    ) {
                        if (type === "CoLocation") {
                            markerimage = getImageForType(type, companyname);
                        } else {
                            if (type === "SaaS") {

                                markerimage = getImageForType(type, companyname, category);
                            } else {
                                markerimage = getImageForType(type, "");
                            }
                        }

                        var markerIcon = { url: markerimage };

                        //                  if ( type === "NetworkPeerPoint" || type === "IXPTier1" ||  type === "IXPTier2" ||  type === "IXPTier3" || type === "AWS"  || type === "Azure"  || type === "GoogleCloud" || type === "SaaS"   || type === "ClientTransportHub"|| type === "ClientPerformanceHub"|| type === "CoLocation" ) {
                        //                      markerIcon =  {url: markerimage, anchor: new google.maps.Point(-0.25,-0.25) }   ;
                        //                  }
                        if (isLatitude(lat) && isLongitude(longitude)) {

                            //Fixing Wrong data
                            if (parseFloat(lat) < -90 || parseFloat(lat) > 90) {
                                var tempLong = longitude;
                                longitude = lat;
                                lat = tempLong;
                            }

                            latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(longitude));

                            var marker = new google.maps.Marker({
                                position: latLng,
                                map: map,
                                title: markername,
                                type: type,
                                companyname: companyname,
                                category: category,
                                awsdconramp: awsdconramp,
                                icon: markerimage,
                                city: city,
                                farmname: farmname,
                                vendername: vendername,
                                service: service,
                                accountnumber: accountnumber,
                                serviceid: serviceid,
                                //                      icon: {url: markerimage, scaledSize: new google.maps.Size(20, 20) }
                            });

                            // populate the longitude and latitude if an address is available
                            //                  if (long === "" && lat === "" && address !== "") {
                            //                      geocodeAddress(marker, address, city, state, zip, country);
                            //                  }

                            if (
                                type === "NetworkPeerPoint" ||
                                type === "AWS" ||
                                type === "Azure" ||
                                type === "ClientAWS" ||
                                type === "ClientAzure" ||
                                type === "ClientTransportHub" ||
                                type === "ClientPerformanceHub" ||
                                type === "CoLocation" ||
                                (type === "SaaS" && companyname === "Duke Energy" && category === "DataCenter") ||
                                type === "ClientDataCenter"
                            ) {
                                var markerradius2 = new google.maps.Circle({
                                    strokeColor: "#808080",
                                    strokeOpacity: 0.9,
                                    strokeWeight: 1,
                                    fillColor: "#FFC0CB",
                                    fillOpacity: 0.2,
                                    map: map,
                                    type: type,
                                    city: city,
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
                                    type: type,
                                    city: city,
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
                                    type: type,
                                    city: city,
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
                                    type: type,
                                    city: city,
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

                                // if (type === "AWS" && city)
                                if (type === "ClientAWS" && city) {
                                    let dp = '<div class="container mts">' +
                                        '<input type = "checkbox" name = "awscityname" value = "' + city + '" type = "' + type + '" onclick = "toggleAWSCitiesUpdatedMarkers(this.value,this);" />' +
                                        '<span> ' + city + ' </span>' +
                                        '</div>';
                                    citiesAWSHTML = citiesAWSHTML + dp;
                                }
                                // else if (type === "Azure" && city)
                                else if (type === "ClientAzure" && city) {
                                    let dp = '<div class="container mts">' +
                                        '<input type = "checkbox" name = "awscityname" value = "' + city + '" type = "' + type + '" onclick = "toggleClientAzureCitiesUpdatedMarkers(this.value,this);" />' +
                                        '<span> ' + city + ' </span>' +
                                        '</div>';
                                    citiesAzureHTML = citiesAzureHTML + dp;
                                }
                            }


                            var infowindow = new google.maps.InfoWindow({
                                content: infocontent,
                            });


                            if (type == 'SaaS' || type == 'Farm') {
                                marker.addListener("click", function () {
                                    infowindow.open(map, marker);
                                    tailSelected.push(marker)
                                });
                            } else {
                                marker.addListener("click", function () {
                                    infowindow.open(map, marker);
                                });
                            }

                            var labelwindow = new google.maps.InfoWindow({
                                content: "<h3>" + markername + "</h3>",
                            });

                            if (type === "ClientTier1") {
                                marker.setVisible(true);
                            } else if (type === "ClientDataCenter") {
                                marker.setVisible(false);
                            }
                            else {
                                marker.setVisible(false);
                            }
                            gmarkers.push(marker);
                        }
                    }
                });
            });

            $('#AWSCities').html(citiesAWSHTML);
            $('#AzureCities').html(citiesAzureHTML);
        });
    }

    // $.getJSON("CloudMapDataComplete.json", function (data) {
    //     console.log(data['Data']);
    //     $.each(data, function (key, subNodeVal) {
    //         console.log(subNodeVal);
    //         subNodeVal.concat(farmData);
    //         console.log(subNodeVal);
    //         $.each(subNodeVal, function (key, val) {
    //             var lat = "";
    //             var longitude = "";
    //             var latLng = "";
    //             var markername = "";
    //             var peaktraffic = "";
    //             var members = "";
    //             var city = "";
    //             var country = "";
    //             var website = "";
    //             var memberwebsite = "";
    //             var trafficwebsite = "";
    //             var desc = "";
    //             var infocontent = "";
    //             var type = "";
    //             var markerimage = "";
    //             var az = "";
    //             var peering = "";
    //             var awsdcproviders = "https://aws.amazon.com/directconnect/partners/";
    //             var awsdcinfo =
    //                 "https://aws.amazon.com/directconnect/pricing/#AWS_Direct_Connect_data_transfer";
    //             var racks = "";
    //             var cost = "";
    //             var markericon = "";
    //             var beginlat = "";
    //             var beginlong = "";
    //             var endlat = "";
    //             var endlong = "";
    //             var costpermonth = "";
    //             var bandwidthmbps = "";
    //             var backupbandwidthmbps = "";
    //             var address = "";
    //             var state = "";
    //             var zip = "";
    //             var phone = "";
    //             var accessspeed = "";
    //             var portspeed = "";
    //             var primarycost = "";
    //             var accessspeed2 = "";
    //             var portspeed2 = "";
    //             var backupcost = "";
    //             var companyname = "";
    //             var farmname = "";
    //             var vendername = "";
    //             var sitecode = "";
    //             var sitecategory = "";
    //             var syngentagroup = "";
    //             var region = "";
    //             var sitecontact = "";
    //             var sitecontactphone = "";
    //             var equipmentowner = "";
    //             var awsdconramp = "";
    //             var fibermiles = "";
    //             var carrier = "";
    //             var primarycolo = "";
    //             var businessunit = "";
    //             var numofemployees = "";
    //             var category = "";
    //             var service ="";
    //             var accountnumber ="";
    //             var serviceid ="";


    //             $.each(val, function (innerkey, innerval) {
    //                 if (innerkey.toLowerCase() === "Type".toLowerCase()) {
    //                     type = innerval;
    //                 } else if (innerkey.toLowerCase() === "Latitude".toLowerCase()) {
    //                     lat = innerval;
    //                 } else if (innerkey.toLowerCase() === "Longitude".toLowerCase()) {
    //                     longitude = innerval;
    //                 } else if (innerkey.toLowerCase() === "Name".toLowerCase()) {
    //                     markername = innerval;
    //                 } else if (innerkey.toLowerCase() === "PeakTrafficGbps") {
    //                     peaktraffic = innerval;
    //                 } else if (innerkey.toLowerCase() === "Members") {
    //                     members = innerval;
    //                 } else if (innerkey.toLowerCase() === "CITY".toLowerCase()) {
    //                     city = innerval;
    //                 } else if (innerkey.toLowerCase() === "COUNTRY".toLowerCase()) {
    //                     country = innerval;
    //                 } else if (innerkey === "Website") {
    //                     website = innerval;
    //                 } else if (innerkey === "MemberWebsite") {
    //                     memberwebsite = innerval;
    //                 } else if (innerkey === "TrafficWebsite") {
    //                     trafficwebsite = innerval;
    //                 } else if (innerkey === "Description") {
    //                     desc = innerval;
    //                 } else if (innerkey === "AZ") {
    //                     az = innerval;
    //                 } else if (innerkey === "DCInfo") {
    //                     dcinfo = innerval;
    //                 } else if (innerkey === "Racks") {
    //                     racks = innerval;
    //                 } else if (innerkey === "Cost") {
    //                     cost = innerval;
    //                 } else if (innerkey === "MarkerIcon") {
    //                     markericon = innerval;
    //                 } else if (innerkey === "BeginLatitude") {
    //                     beginlat = innerval;
    //                 } else if (innerkey === "BeginLongitude") {
    //                     beginlong = innerval;
    //                 } else if (innerkey === "EndLatitude") {
    //                     endlat = innerval;
    //                 } else if (innerkey === "EndLongitude") {
    //                     endlong = innerval;
    //                 } else if (innerkey === "CostPerMonth") {
    //                     costpermonth = innerval;
    //                 } else if (innerkey === "FiberMiles") {
    //                     fibermiles = innerval;
    //                 } else if (innerkey === "BandwidthMbps") {
    //                     bandwidthmbps = innerval;
    //                 } else if (innerkey === "Address") {
    //                     address = innerval;
    //                 } else if (innerkey === "State") {
    //                     state = innerval;
    //                 } else if (innerkey === "ZIP") {
    //                     zip = innerval;
    //                 } else if (innerkey === "Phone") {
    //                     phone = innerval;
    //                 } else if (innerkey === "AccessSpeed") {
    //                     accessspeed = innerval;
    //                 } else if (innerkey === "PortSpeed") {
    //                     portspeed = innerval;
    //                 } else if (innerkey === "PrimaryCost") {
    //                     primarycost = innerval;
    //                 } else if (innerkey === "AccessSpeed2") {
    //                     accessspeed2 = innerval;
    //                 } else if (innerkey === "PortSpeed2") {
    //                     portspeed2 = innerval;
    //                 } else if (innerkey === "BackupCost") {
    //                     backupcost = innerval;
    //                 } else if (innerkey.toLowerCase() === "CompanyName".toLowerCase()) {
    //                     companyname = innerval;
    //                 } else if (innerkey === "Site Code") {
    //                     farmname = innerval;
    //                 } else if (innerkey === "Vendor Parent") {
    //                     vendername = innerval;
    //                 } else if (innerkey === "Service  Type") {
    //                     service = innerval;
    //                 } else if (innerkey === "Account Number") {
    //                     accountnumber = innerval;
    //                 } else if (innerkey === "Service ID") {
    //                     serviceid = innerval;
    //                 } else if (innerkey === "SiteCode") {
    //                     sitecode = innerval;
    //                 } else if (innerkey === "SiteCategory") {
    //                     sitecategory = innerval;
    //                 } else if (innerkey === "SyngentaGroup") {
    //                     syngentagroup = innerval;
    //                 } else if (innerkey === "Region") {
    //                     region = innerval;
    //                 } else if (innerkey === "SiteContactName") {
    //                     sitecontact = innerval;
    //                 } else if (innerkey === "SiteContactPhone") {
    //                     sitecontactphone = innerval;
    //                 } else if (innerkey === "EquipmentOwner") {
    //                     equipmentowner = innerval;
    //                 } else if (innerkey === "AWSDCOnRamp") {
    //                     awsdconramp = innerval;
    //                 } else if (innerkey === "Carrier") {
    //                     carrier = innerval;
    //                 } else if (innerkey === "BackupBandwidthMbps") {
    //                     backupbandwidthmbps = innerval;
    //                 } else if (innerkey === "PrimaryColo") {
    //                     primarycolo = innerval;
    //                 } else if (innerkey === "BusinessUnit") {
    //                     businessunit = innerval;
    //                 } else if (innerkey === "NumOfEmployees") {
    //                     numofemployees = innerval;
    //                 } else if (innerkey.toLowerCase() === "Category".toLowerCase()) {
    //                     category = innerval;
    //                 }
    //             });

    //             infocontent = "<h3>" + markername + "</h3>";
    //             infocontent = infocontent +"<input type='checkbox' class='view_tails' onclick='togglePeeringTrail(this,"+ lat +","+longitude+");' /> View Tails<br/>";

    //             if (companyname !== "") {
    //                 infocontent = infocontent + "<b>Company Name:</b> " + companyname;
    //             }
    //             if (farmname !== "") {
    //                 infocontent = infocontent + "<b>Site Codes:</b> " + farmname;
    //             }

    //             if (!!sitecode) {
    //                 infocontent = infocontent + "<br><b>Site Code:</b> " + sitecode;
    //             }
    //             if (!!sitecategory) {
    //                 infocontent =
    //                     infocontent + "<br><b>Site Category:</b> " + sitecategory;
    //             }
    //             if (!!syngentagroup) {
    //                 infocontent =
    //                     infocontent + "<br><b>Syngenta Group:</b> " + syngentagroup;
    //             }
    //             if (!!businessunit) {
    //                 infocontent =
    //                     infocontent + "<br><b>Business Unit:</b> " + businessunit;
    //             }
    //             if (!!region) {
    //                 infocontent = infocontent + "<br><b>Region:</b> " + region;
    //             }
    //             if (!!address) {
    //                 infocontent = infocontent + "<br><b>Address:</b> " + address;
    //             }
    //             if (vendername !== "") {
    //                 infocontent = infocontent + "<br><b>Vendor:</b> " + vendername;
    //             }
    //             if (!!service) {
    //                 infocontent = infocontent + "<br><b>Service:</b> " + service;
    //             }
    //             if (!!accountnumber) {
    //                 infocontent = infocontent + "<br><b>Account #:</b> " + accountnumber;
    //             }
    //             if (!!serviceid) {
    //                 infocontent = infocontent + "<br><b>Service ID:</b> " + serviceid;
    //             }
    //             if (!!city) {
    //                 infocontent = infocontent + "<br><b>City:</b> " + city;
    //             }
    //             if (!!state) {
    //                 infocontent = infocontent + "<br><b>State:</b> " + state;
    //             }
    //             if (!!zip) {
    //                 infocontent = infocontent + "<br><b>Zip:</b> " + zip;
    //             }
    //             if (!!country) {
    //                 infocontent = infocontent + "<br><b>Country:</b> " + country;
    //             }
    //             if (!!numofemployees) {
    //                 infocontent =
    //                     infocontent + "<br><b># of Employees:</b> " + numofemployees;
    //             }
    //             if (!!awsdconramp) {
    //                 infocontent =
    //                     infocontent + "<br><b>AWS DC On Ramp For:</b> " + awsdconramp;
    //             }
    //             if (!!peaktraffic) {
    //                 infocontent =
    //                     infocontent + "<br><b>Peak Traffic:</b> " + peaktraffic + " Gbps";
    //             }
    //             if (!!members) {
    //                 infocontent = infocontent + "<br><b>Members:</b> " + members;
    //             }
    //             if (website !== "") {
    //                 infocontent =
    //                     infocontent +
    //                     '<br><b><a href="' +
    //                     website +
    //                     '" target="_blank">Website</a></b>';
    //             }
    //             if (memberwebsite !== "") {
    //                 infocontent =
    //                     infocontent +
    //                     '<br><b><a href="' +
    //                     memberwebsite +
    //                     '" target="_blank">Member List</a></b>';
    //             }
    //             if (!!trafficwebsite) {
    //                 infocontent =
    //                     infocontent +
    //                     '<br><b><a href="' +
    //                     trafficwebsite +
    //                     '" target="_blank">Traffic</a></b>';
    //             }
    //             if (!!costpermonth) {
    //                 infocontent =
    //                     infocontent + "<br><b>Cost per Month:</b> $" + costpermonth;
    //             }
    //             if (!!fibermiles) {
    //                 infocontent =
    //                     infocontent + "<br><b>Distance:</b> " + fibermiles + " miles";
    //             }
    //             if (!!bandwidthmbps) {
    //                 infocontent =
    //                     infocontent + "<br><b>Bandwidth:</b> " + bandwidthmbps + " Mbps";
    //             }
    //             if (!!backupbandwidthmbps) {
    //                 infocontent =
    //                     infocontent + "<br><b>Backup:</b> " + backupbandwidthmbps + " Mbps";
    //             }
    //             if (!!carrier) {
    //                 infocontent = infocontent + "<br><b>Carrier:</b> " + carrier;
    //             }
    //             if (sitecontact !== "") {
    //                 infocontent = infocontent + "<br><b>Site Contact:</b> " + sitecontact;
    //             }
    //             if (sitecontactphone !== "") {
    //                 infocontent =
    //                     infocontent + "<br><b>Site Contact Phone:</b> " + sitecontactphone;
    //             }
    //             if (equipmentowner !== "") {
    //                 infocontent =
    //                     infocontent + "<br><b>Equipment Owner:</b> " + equipmentowner;
    //             }
    //             if (phone !== "") {
    //                 infocontent = infocontent + "<br><b>Phone:</b> " + phone;
    //             }
    //             if (accessspeed !== "") {
    //                 infocontent = infocontent + "<br><b>Access Speed:</b> " + accessspeed;
    //             }
    //             if (portspeed !== "") {
    //                 infocontent = infocontent + "<br><b>Port Speed:</b> " + portspeed;
    //             }
    //             if (primarycost !== "") {
    //                 infocontent = infocontent + "<br><b>Primary Cost:</b> " + primarycost;
    //             }
    //             if (accessspeed2 !== "") {
    //                 infocontent =
    //                     infocontent + "<br><b>Access Speed 2:</b> " + accessspeed2;
    //             }
    //             if (portspeed2 !== "") {
    //                 infocontent = infocontent + "<br><b>Port Speed 2:</b> " + portspeed2;
    //             }
    //             if (backupcost !== "") {
    //                 infocontent = infocontent + "<br><b>Backup Cost:</b> " + backupcost;
    //             }
    //             if (primarycolo !== "") {
    //                 infocontent =
    //                     infocontent + "<br><b>Primary Colo Provider:</b> " + primarycolo;
    //             }

    //             if (desc !== "") {
    //                 infocontent = infocontent + "<br><b>Notes:</b> " + desc;
    //             }

    //             // CONNECTIONS
    //             if (
    //                 type === "ClientTier2PrimaryTail" ||
    //                 type === "AWSDirectConnect" ||
    //                 type === "LongHaulFiber" ||
    //                 type === "ClientBackbone" ||
    //                 type === "ClientBroadband-Internet" ||
    //                 type === "ClientTier1PrimaryTail" ||
    //                 type === "ClientTier1SecondaryTail" ||
    //                 type === "ClientTier2SecondaryTail" ||
    //                 type === "ClientTier3PrimaryTail" ||
    //                 type === "ClientTier3SecondaryTail" ||
    //                 type === "ClientTier4PrimaryTail" ||
    //                 type === "ClientTier4SecondaryTail" ||
    //                 type === "ClientTier5PrimaryTail" ||
    //                 type === "ClientTier5SecondaryTail" ||
    //                 type === "CoLocation"
    //             ) {
    //                 if (beginlat && beginlong) {
    //                     var connectionPath = getConnectionPath(
    //                         beginlat,
    //                         beginlong,
    //                         endlat,
    //                         endlong,
    //                         type,
    //                         category,
    //                         companyname
    //                     );

    //                     connectionPath.setMap(map);

    //                     var infowindow = new google.maps.InfoWindow({
    //                         content: infocontent,
    //                     });
    //                     google.maps.event.addListener(
    //                         connectionPath,
    //                         "mouseover",
    //                         function (event) {
    //                             infowindow.setPosition(event.latLng);
    //                             infowindow.open(map);
    //                         }
    //                     );
    //                     google.maps.event.addListener(
    //                         connectionPath,
    //                         "mouseout",
    //                         function (event) {
    //                             infowindow.close();
    //                         }
    //                     );

    //                     connectionPath.setVisible(false);
    //                     gmarkers.push(connectionPath);
    //                 }
    //             }
    //             // LOCATIONS (markers)
    //             if (
    //                 type === "ClientTier1" ||
    //                 type === "ClientTier2" ||
    //                 type === "ClientTier3" ||
    //                 type === "ClientTier4" ||
    //                 type === "ClientTier5" ||
    //                 type === "ClientTier6" ||
    //                 type === "NetworkPeerPoint" ||
    // 	type === "AWSDirectConnect" ||
    //                 type === "IXPTier1" ||
    //                 type === "IXPTier2" ||
    //                 type === "IXPTier3" ||
    //                 type === "AWS" ||
    //                 type === "Azure" ||
    //                 type === "azureexrt" ||
    //                 type === "awsdconramp" ||
    //                 type === "GoogleCloud" ||
    //                 type === "AzureExpressRoute" ||
    //                 type === "SaaS" ||
    //                 type === "Farm" ||
    //                 type === "ClientAWS" ||
    //                 type === "ClientAzure" ||
    //                 type === "ClientTransportHub" ||
    //                 type === "ClientPerformanceHub" ||
    //                 type === "ClientDataCenter" ||
    //                 type === "CoLocation" ||
    //                 type === "SAP"
    //             ) {
    //                 if (type === "CoLocation") {
    //                     markerimage = getImageForType(type, companyname);
    //                 } else {
    //                     if (type === "SaaS") {

    //                         markerimage = getImageForType(type, companyname, category);
    //                     } else {
    //                         markerimage = getImageForType(type, "");
    //                     }
    //                 }

    //                 var markerIcon = { url: markerimage };

    //                 //					if ( type === "NetworkPeerPoint" || type === "IXPTier1" ||  type === "IXPTier2" ||  type === "IXPTier3" || type === "AWS"  || type === "Azure"  || type === "GoogleCloud" || type === "SaaS"   || type === "ClientTransportHub"|| type === "ClientPerformanceHub"|| type === "CoLocation" ) {
    //                 //						markerIcon =  {url: markerimage, anchor: new google.maps.Point(-0.25,-0.25) }	;
    //                 //					}
    //                 if (isLatitude(lat) && isLongitude(longitude)) {

    //                     //Fixing Wrong data
    //                     if (parseFloat(lat) < -90 || parseFloat(lat) > 90) {
    //                         var tempLong = longitude;
    //                         longitude = lat;
    //                         lat = tempLong;
    //                     }

    //                     latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(longitude));

    //                     var marker = new google.maps.Marker({
    //                         position: latLng,
    //                         map: map,
    //                         title: markername,
    //                         type: type,
    //                         companyname: companyname,
    //                         category: category,
    //                         awsdconramp: awsdconramp,
    //                         icon: markerimage,
    //                         city: city,
    //                         farmname: farmname,
    //                         vendername: vendername,
    //                         service: service,
    //                         accountnumber: accountnumber,
    //                         serviceid: serviceid,
    //                         //						icon: {url: markerimage, scaledSize: new google.maps.Size(20, 20) }
    //                     });

    //                     // populate the longitude and latitude if an address is available
    //                     //					if (long === "" && lat === "" && address !== "") {
    //                     //						geocodeAddress(marker, address, city, state, zip, country);
    //                     //					}

    //                     if (
    //                         type === "NetworkPeerPoint" ||
    //                         type === "AWS" ||
    //                         type === "Azure" ||
    //                         type === "ClientAWS" ||
    //                         type === "ClientAzure" ||
    //                         type === "ClientTransportHub" ||
    //                         type === "ClientPerformanceHub" ||
    //                         type === "CoLocation" ||
    //                         (type === "SaaS" && companyname === "Duke Energy" && category === "DataCenter" ) ||
    //                         type === "ClientDataCenter"
    //                     ) {
    //                         var markerradius2 = new google.maps.Circle({
    //                             strokeColor: "#808080",
    //                             strokeOpacity: 0.9,
    //                             strokeWeight: 1,
    //                             fillColor: "#FFC0CB",
    //                             fillOpacity: 0.2,
    //                             map: map,
    //                             type: type,
    //                             city: city,
    //                             center: latLng,
    //                             radius: 90000,
    //                         });
    //                         var markerradius5 = new google.maps.Circle({
    //                             strokeColor: "#808080",
    //                             strokeOpacity: 0.9,
    //                             strokeWeight: 1,
    //                             fillColor: "#ADD8E6",
    //                             fillOpacity: 0.2,
    //                             map: map,
    //                             type: type,
    //                             city: city,
    //                             center: latLng,
    //                             radius: 225000,
    //                         });
    //                         var markerradius10 = new google.maps.Circle({
    //                             strokeColor: "#808080",
    //                             strokeOpacity: 0.9,
    //                             strokeWeight: 1,
    //                             fillColor: "#98FB98",
    //                             fillOpacity: 0.2,
    //                             map: map,
    //                             type: type,
    //                             city: city,
    //                             center: latLng,
    //                             radius: 450000,
    //                         });
    //                         var markerradius20 = new google.maps.Circle({
    //                             strokeColor: "#808080",
    //                             strokeOpacity: 0.9,
    //                             strokeWeight: 1,
    //                             fillColor: "#FFFFE0",
    //                             fillOpacity: 0.3,
    //                             map: map,
    //                             type: type,
    //                             city: city,
    //                             center: latLng,
    //                             radius: 900000,
    //                         });

    //                         markerradius2.setVisible(false);
    //                         markerradius5.setVisible(false);
    //                         markerradius10.setVisible(false);
    //                         markerradius20.setVisible(false);
    //                         radiusarray2.push(markerradius2);
    //                         radiusarray5.push(markerradius5);
    //                         radiusarray10.push(markerradius10);
    //                         radiusarray20.push(markerradius20);

    //                         // if (type === "AWS" && city)
    //                         if (type === "ClientAWS" && city)
    //                         {
    //                             let dp = '<div class="container mts">' +
    //                                 '<input type = "checkbox" name = "awscityname" value = "' + city + '" type = "' + type + '" onclick = "toggleAWSCitiesUpdatedMarkers(this.value,this);" />' +
    //                                 '<span> ' + city + ' </span>' +
    //                                 '</div>';
    //                             citiesAWSHTML = citiesAWSHTML + dp;
    //                         }
    //                         // else if (type === "Azure" && city)
    //                         else if (type === "ClientAzure" && city)
    //                         {
    //                             let dp = '<div class="container mts">' +
    //                                 '<input type = "checkbox" name = "awscityname" value = "' + city + '" type = "' + type + '" onclick = "toggleClientAzureCitiesUpdatedMarkers(this.value,this);" />' +
    //                                 '<span> ' + city + ' </span>' +
    //                                 '</div>';
    //                             citiesAzureHTML = citiesAzureHTML + dp;
    //                         }
    //                     }


    //                     var infowindow = new google.maps.InfoWindow({
    //                         content: infocontent,
    //                     });


    //                     if (type == 'SaaS' || type =='Farm') {
    //                         marker.addListener("click", function () {
    //                             infowindow.open(map, marker);
    //                             tailSelected.push(marker)
    //                         });
    //                     } else {
    //                         marker.addListener("click", function () {
    //                             infowindow.open(map, marker);
    //                         });
    //                     }

    //                     var labelwindow = new google.maps.InfoWindow({
    //                         content: "<h3>" + markername + "</h3>",
    //                     });

    //                     if (type === "ClientTier1") {
    //                         marker.setVisible(true);
    //                     } else if (type === "ClientDataCenter") {
    //                         marker.setVisible(false);
    //                     }
    //                     else {
    //                         marker.setVisible(false);
    //                     }
    //                     gmarkers.push(marker);
    //                 }
    //             }
    //         });
    //     });

    //     $('#AWSCities').html(citiesAWSHTML);
    //     $('#AzureCities').html(citiesAzureHTML);
    // });


}

function saveRoute() {
    var pathStr = [];
    var codeStr = [];
    Object.keys(mapLines).forEach(function (key) {
        if (mapLines[key][0]) {

            var line = mapLines[key][0];
            var pathArr = line.getPath();
            for (var i = 0; i < pathArr.length; i++) {
                codeStr.push({ lat: pathArr.getAt(i).lat(), lng: pathArr.getAt(i).lng() });
                //the coordinates path it�s print on the console of the browser
            };
            pathStr.push({ key: key, path: codeStr });
        }
    });


    var retrievedObjectOrigin = localStorage.getItem('startPoint');
    var retrievedObjectDestination = localStorage.getItem('endPoint');
    var parsedObjectOrigin = JSON.parse(retrievedObjectOrigin);
    var parsedObjectDetiantion = JSON.parse(retrievedObjectDestination);
    var uniqueid = Date.now();
    setCookieRoute(uniqueid, parsedObjectOrigin, parsedObjectDetiantion, pathStr)
    $('#RoutesSidebar ul').append('<li><input type="checkbox" id="' + uniqueid + '" onclick="showSavedRoute(this);" />' + parsedObjectOrigin.formatted_address + ' to ' + parsedObjectDetiantion.formatted_address + ' </li>')
}

function showSavedRouteList() {

    var names = getCookieRoute('saveRoutesList');
    $.each(names.split('|'), function (index, item) {
        var routeStart = getCookieRoute("routeStart" + item);
        var routeEnd = getCookieRoute("routeEnd" + item);
        var drawMap = getCookieRoute("drawMap" + item);

        var parsedObjectOrigin = JSON.parse(routeStart);
        var parsedObjectDetiantion = JSON.parse(routeEnd);
        console.log(drawMap)
        $('#RoutesSidebar ul').append('<li><input type="checkbox"  id="' + item + '" onclick="showSavedRoute(this);" />' + parsedObjectOrigin.formatted_address + ' to ' + parsedObjectDetiantion.formatted_address + ' </li>')
    });
}

function showSavedRoute(control) {
    var routeStart = getCookieRoute("routeStart" + control.id);
    var routeEnd = getCookieRoute("routeEnd" + control.id);
    var drawMap = JSON.parse(getCookieRoute("drawMap" + control.id));
    var parsedObjectOrigin = JSON.parse(routeStart);
    var parsedObjectDetiantion = JSON.parse(routeEnd);

    localStorage.setItem("startPoint", JSON.stringify(parsedObjectOrigin));

    localStorage.setItem("endPoint", JSON.stringify(parsedObjectDetiantion));
    $.each(drawMap, function (index, item) {
        $('#' + item.key).trigger("click");

    });



}
function drawPathOnMapSaved(points, controlId) {

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

    mapLines[controlId] = [shortestPath, markerS, markerE]

    markerS.setMap(map);
    markerE.setMap(map);
    shortestPath.setMap(map);

}
function setCookieRoute(uniqueid, dataStart, dataEnd, codeStr) {
    //console.log("setCookie")
    //console.log(pwd)
    var d = new Date();
    d.setTime(d.getTime() + (73000 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    var names = getCookieRoute('saveRoutesList');
    if (names) { names += "|" + uniqueid } else { names = uniqueid }
    document.cookie = "saveRoutesList=" + names + ";" + expires + ";path=/";
    document.cookie = "routeStart" + uniqueid + "=" + JSON.stringify(dataStart) + ";" + expires + ";path=/";
    document.cookie = "routeEnd" + uniqueid + "=" + JSON.stringify(dataEnd) + ";" + expires + ";path=/";
    document.cookie = "drawMap" + uniqueid + "=" + JSON.stringify(codeStr) + ";" + expires + ";path=/";
}

function getCookieRoute(uniqueid) {
    var name = uniqueid + "=";
    var decodedCookie = decodeURIComponent(document.cookie);

    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
            //console.log(pwd)

        }
    }
    return "";
}

function GetRoute() {

    var OriginLatLon = localStorage.getItem('startPoint');
    var DestinationLatLon = localStorage.getItem('endPoint');
    // Retrieve the object from storage
    var retrievedObjectOrigin = localStorage.getItem('startPoint');
    var parsedObjectOrigin = JSON.parse(retrievedObjectOrigin);
    var lat1 = parsedObjectOrigin.lat;
    var lon1 = parsedObjectOrigin.lng;

    var retrievedObjectDestination = localStorage.getItem('endPoint');
    var parsedObjectDetiantion = JSON.parse(retrievedObjectDestination);

    var lat2 = parsedObjectDetiantion.lat;
    var lon2 = parsedObjectDetiantion.lng;

    directionsService = new google.maps.DirectionsService();
    //geocoder = new google.maps.Geocoder();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById("dvPanel"));

    //*********DIRECTIONS AND ROUTE**********************//

    source = document.getElementById("searchInput").value;
    destination = document.getElementById("destinationInput").value;
    //getLocation(source);

    var request = {
        origin: source,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            //directionsDisplay.setDirections(response);
        }
    });

    //*********DISTANCE AND DURATION**********************//

    var service = new google.maps.DistanceMatrixService();

    service.getDistanceMatrix(
        {
            origins: [source],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
        },
        function (response, status) {
            if (
                status == google.maps.DistanceMatrixStatus.OK &&
                response.rows[0].elements[0].status != "ZERO_RESULTS" &&
                response.rows[0].elements[0].status != "NOT_FOUND"
            ) {
                var distance = response.rows[0].elements[0].distance.text;
                var duration = response.rows[0].elements[0].duration.text;
                var dvDistance = document.getElementById("dvDistance");
                dvDistance.innerHTML = "";
                dvDistance.innerHTML +=
                    "<strong> Distance: </strong>" + "&nbsp;&nbsp;" + distance + "<br />";
                dvDistance.innerHTML +=
                    "<strong> Data Transfer rate: </strong>" +
                    "&nbsp;&nbsp;" +
                    "178,000,000 Mbps" +
                    "<button onclick='saveRoute();'> Save </button>" +
                    "<br />";
                //dvDistance.innerHTML += "Distance Between Origin & Destination: " + distance + "<br />";
                //dvDistance.innerHTML += "Duration:" + duration + "<br />";
                //getLocationOrigin(source);
                //getLocationDestination(destination);

                /*var line = new google.maps.Polyline({
                    path: [
                        new google.maps.LatLng(lat1, lon1), 
                        new google.maps.LatLng(lat2, lon2)
                    ],
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    map: map
                    });
                var marker = new google.maps.Marker({
                    position: { lat: lat1, lng: lon1 },
                    map: map
                  }); 
                
                var marker1 = new google.maps.Marker({
                    position: { lat: lat2, lng: lon2 },
                    map: map
                }); */

                //alert("Unable to find the distance via road.");
                var newdistance = calcCrow(lat1, lon1, lat2, lon2).toFixed(1);
                //alert(newdistance);
                var dvDistance = document.getElementById("dvDistance");
                dvDistance.innerHTML = "";
                dvDistance.innerHTML += "<strong> Distance: </strong>" + "&nbsp;&nbsp;" + newdistance + " km<br />";
                dvDistance.innerHTML += "<strong> Data Transfer rate: </strong>" + "&nbsp;&nbsp;" + "178,000,000 mbps <br />";
                dvDistance.innerHTML += "<button  onclick='saveRoute();'> Save </button>";

            } else {
                /*var line = new google.maps.Polyline({
                    path: [
                        new google.maps.LatLng(lat1, lon1), 
                        new google.maps.LatLng(lat2, lon2)
                    ],
                    strokeColor: "#FF0000",
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    map: map
                    });
                var marker = new google.maps.Marker({
                    position: { lat: lat1, lng: lon1 },
                    map: map
                  }); 
                
                var marker1 = new google.maps.Marker({
                    position: { lat: lat2, lng: lon2 },
                    map: map
                });  */

                //alert("Unable to find the distance via road.");
                var newdistance = calcCrow(lat1, lon1, lat2, lon2).toFixed(1);
                //alert(newdistance);
                var dvDistance = document.getElementById("dvDistance");
                dvDistance.innerHTML = "";
                dvDistance.innerHTML += "<strong> Distance: </strong>" + "&nbsp;&nbsp;" + newdistance + " km<br />";
                dvDistance.innerHTML += "<strong> Data Transfer rate: </strong>" + "&nbsp;&nbsp;" + "178,000,000 megabits a second" + "<br />";
                dvDistance.innerHTML += "<button onclick='saveRoute();'> Save </button>";
            }
        }
    );
}

//Function to covert address to Latitude and Longitude
function getLocationOrigin(address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var lat1 = results[0].geometry.location.lat();
            var lon1 = results[0].geometry.location.lng();
            console.log(lat1, lon1);
            /*var lat2 = "35.2240776";
            var lon2 = "-80.8505057";
            var distanceOrigin = calcCrow(lat1, lon1, lat2, lon2).toFixed(1);
            dvDistance.innerHTML +=
            "Distance Between Origin & Marker: " + distanceOrigin + "<br />";*/
        }
    });
}

//Function to covert address to Latitude and Longitude
function getLocationDestination(address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var lat2 = results[0].geometry.location.lat();
            var lon2 = results[0].geometry.location.lng();
            console.log(lat2, lon2);
            /*var lat2 = "35.2240776";
            var lon2 = "-80.8505057";
            var distanceDestination = calcCrow(
              lat1,
              lon1,
              lat2,
              lon2
            ).toFixed(1);
            dvDistance.innerHTML +=
            "Distance Between Destination & Marker: " + distanceDestination;*/
        }
    });
}

/*function distance(lat1, lon1, lat2, lon2, unit) {

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
}*/

function calcCrow(lat1, lon1, lat2, lon2) {
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

function isLatitude(lat) {
    return isFinite(lat) && Math.abs(lat) <= 90;
}

function isLongitude(lng) {
    return isFinite(lng) && Math.abs(lng) <= 180;
}

