const earthquakesGeoJSONPath = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
const geoJSON1Path = "static/data/PB2002_boundaries.json";

const light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

const streets = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
});

const satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
});

const colors = {
    1: "blue",
    3: "#F4F452",
    5: "orange",
    7: "red",
    10: "black"
};

const mapStyle = ({properties}) => {
    const mag = properties.mag;
    return {
        fillColor: mag > 7 ? colors[10] : mag > 5 ? colors[7] : mag > 3 ? colors[5] : mag > 1 ? colors[3] : colors[1],
        color: "#F1F7FB",
        weight: 0.5
    }
};

const earthquakesLayer = L.layerGroup();
const platesLayer = L.layerGroup();

d3.json(earthquakesGeoJSONPath).then(geoJsonResponse => {

    const addEarthquake = (feature, layer) => {
        earthquakesLayer.addLayer(layer);
    };

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
            });
            layer.bindPopup(`
                <h3>${title}</h3>
                <p>Magnitud: ${mag}</p>
                <p>${place}</p>
                <p>${date}</p>
            `);
            addEarthquake(features, layer);
        }
    });
});

const baseMaps = {
    "Light": light,
    "Streets": streets,
    "Satellite": satellite
};



d3.json(geoJSON1Path).then(geoJsonResponse => {
    console.log(geoJsonResponse)
    const addBondaries = (feature, layer) => {
        platesLayer.addLayer(layer);
    };

    const boundaries = geoJsonResponse.features.map(f => f.geometry);

    const styles = {
        "color": "#F76D13",
        "weight": 3,
        "opacity": 0.65
    };
    L.geoJSON(boundaries, {
        style: styles,
        onEachFeature: (features, layer) => addBondaries(features, layer)
    });
});

const myMap = L.map("map", {
    center: [34.0522, -118.2437],
    zoom: 3,
    layers: [light, earthquakesLayer]
});

const overLayMaps = {
    "Earthquakes": earthquakesLayer,
    "Fault Lines": platesLayer
};

const legend = L.control({position: 'bottomright'});
legend.onAdd = (map) => {
    const div = L.DomUtil.create('div', 'info legend');
    L.DomUtil.addClass(div, "legend");
    labels = ['<strong>Magnitude</strong>'];
    categories = ['0-1','2-3','4-5','6-7','8-10'];
    legendColors = Object.values(colors);
    for (let i = 0; i < categories.length; i++) {
        div.innerHTML +=
            labels.push(
                `<div class="label-container"><div style="background-color: ${legendColors[i]};" class="label"></div><i style="background: blue "></i>${(categories[i] ? categories[i] : '')}</div>`
            )
    }

    div.innerHTML = labels.join('');
    return div;
};

legend.addTo(myMap);

L.control.layers(baseMaps, overLayMaps).addTo(myMap);