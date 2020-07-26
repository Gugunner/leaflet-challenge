const earthquakesGeoJSONPath = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

const light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

const colors = {
    1: "blue",
    3: "#F4F452",
    5: "orange",
    7: "red",
    10: "black"
}

const mapStyle = ({properties}) => {
    const mag = properties.mag;
    return {
        fillColor: mag > 7 ? colors[10] : mag > 5 ? colors[7] : mag > 3 ? colors[5] : mag > 1 ? colors[3] : colors[1],
        color: "#F1F7FB",
        weight: 0.5
    }
};

d3.json(earthquakesGeoJSONPath).then(geoJsonResponse => {
    console.log("Data", geoJsonResponse);
    L.geoJSON(geoJsonResponse, {
        style: (feature) => mapStyle(feature),
        pointToLayer: (feature, latlng) => {
           return new L.circleMarker(latlng, {
               radius: Math.ceil(feature.properties.mag)*3,
               fillOpacity: 0.5
            })
        },
        onEachFeature: (features, layer) => {
            const { mag, place, time, title } = features.properties;
            const date =  new Date(time).toLocaleDateString()+" | "+new Date(time).toLocaleTimeString()
            layer.on({
                mouseover: (event) => {
                    layer = event.target;
                    layer.setStyle({ fillOpacity: 0.9, weight: 1 });
                },
                mouseout: (event) => {
                    layer = event.target;
                    layer.setStyle({ fillOpacity: 0.5, weight: 0.5 });
                }
            })
            layer.bindPopup(`
                <h3>${title}</h3>
                <p>Magnitud: ${mag}</p>
                <p>${place}</p>
                <p>${date}</p>
            `)
        }
    }).addTo(myMap);
});


const myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 3,
    layers: [light]
});