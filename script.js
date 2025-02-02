let map, geocoder, drawingManager;
let totalArea = 0;

function initAutocomplete() {
    let input = document.getElementById("address");
    let autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.setFields(["geometry", "formatted_address"]);
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 18,
        center: { lat: 45.4215, lng: -75.6972 }, // Default: Ottawa, Canada
        mapTypeId: "satellite"
    });

    geocoder = new google.maps.Geocoder();

    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ["polygon"]
        },
        polygonOptions: {
            fillColor: "#00FF00",
            fillOpacity: 0.4,
            strokeWeight: 2,
            clickable: false,
            editable: true,
            zIndex: 1
        }
    });

    drawingManager.setMap(map);

    google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
        let polygon = event.overlay;
        let area = google.maps.geometry.spherical.computeArea(polygon.getPath());
        totalArea = Math.round(area);
        calculatePrice();
    });
}

function getLawnArea() {
    let address = document.getElementById("address").value;
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === "OK") {
            map.setCenter(results[0].geometry.location);
            new google.maps.marker.AdvancedMarkerElement({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert("Address not found: " + status);
        }
    });
}

function calculatePrice() {
    let pricePerSqft = 0.10;
    let totalPrice = totalArea * pricePerSqft;
    document.getElementById("result").innerHTML =
        `Estimated Lawn Area: ${totalArea} sq. ft.<br>
        Total Price: $${totalPrice.toFixed(2)}`;
}
