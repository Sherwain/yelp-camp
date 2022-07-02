// mapboxgl.accessToken = "<%- process.env.MAPBOX_TOKEN %>";
mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  // center: [-122.271356, 37.804456], // starting position [lng, lat]
  center: geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
  projection: "globe", // display the map as a 3D globe
});
map.addControl(new mapboxgl.NavigationControl());
map.on("style.load", () => {
  map.setFog({}); // Set the default atmosphere style
});

const marker = new mapboxgl.Marker()
  .setLngLat(geometry.coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${title}</h3>`))
  .addTo(map);
