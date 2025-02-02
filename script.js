let map, geocoder, drawingManager;
let currentPolygon = null;
let totalArea = 0;

function initAutocomplete() {
  const input = document.getElementById("address");
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.setFields(["geometry", "formatted_address"]);
}

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 18,
    center: { lat: 45.4215, lng: -75.6972 }, // Default center: Ottawa
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
      editable: true, // Enables editing after creation
      zIndex: 1
    }
  });
  drawingManager.setMap(map);

  google.maps.event.addListener(drawingManager, "overlaycomplete", function(event) {
    // Remove previous polygon if exists
    if (currentPolygon) {
      currentPolygon.setMap(null);
    }
    currentPolygon = event.overlay;
    updateArea(currentPolygon);

    // Listen for changes when editing the polygon
    google.maps.event.addListener(currentPolygon.getPath(), 'set_at', function() {
      updateArea(currentPolygon);
    });
    google.maps.event.addListener(currentPolygon.getPath(), 'insert_at', function() {
      updateArea(currentPolygon);
    });

    // Disable drawing mode after finishing
    drawingManager.setDrawingMode(null);
  });
}

function updateArea(polygon) {
  const area = google.maps.geometry.spherical.computeArea(polygon.getPath());
  totalArea = Math.round(area);
  calculatePrice();
}

function calculatePrice() {
  const pricePerSqft = 0.10;
  const totalPrice = totalArea * pricePerSqft;
  document.getElementById("result").innerHTML =
    `Estimated Lawn Area: ${totalArea} sq. ft.<br>Total Price: $${totalPrice.toFixed(2)}`;
}

function getLawnArea() {
  const address = document.getElementById("address").value;
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

function resetPolygon() {
  if (currentPolygon) {
    currentPolygon.setMap(null);
    currentPolygon = null;
    totalArea = 0;
    document.getElementById("result").innerHTML = "";
    // Re-enable polygon drawing mode for a new shape
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
  }
}
