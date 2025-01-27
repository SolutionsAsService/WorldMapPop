// Initialize the map
const map = L.map('map').setView([20, 0], 2); // Center the map on the world

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fetch GeoJSON data for country borders
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(response => response.json())
    .then(data => {
        // Add the GeoJSON layer to the map
        L.geoJSON(data, {
            style: {
                color: '#555',
                weight: 1,
                fillColor: '#aaa',
                fillOpacity: 0.5
            },
            onEachFeature: (feature, layer) => {
                // Add a click event to each country
                layer.on('click', () => {
                    const countryName = feature.properties.name;
                    fetchCountryData(countryName);
                });
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));

// Function to fetch population data for a given country
function fetchCountryData(countryName) {
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => response.json())
        .then(data => {
            const country = data[0];
            const population = country.population;

            // Update the info panel
            document.getElementById('country-name').textContent = `Country: ${countryName}`;
            document.getElementById('country-population').textContent = `Population: ${population.toLocaleString()}`;
        })
        .catch(error => {
            console.error('Error fetching country data:', error);
            document.getElementById('country-name').textContent = `Country: ${countryName}`;
            document.getElementById('country-population').textContent = `Population: Data not available`;
        });
}
