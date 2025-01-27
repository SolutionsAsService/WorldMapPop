// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Global variables
let geoJsonLayer = null;
let warsData = [];
const countryGroups = {
    nato: ["United States", "Canada", "United Kingdom", "France", "Germany", "Italy", "Turkey", "Poland", "Spain", "Belgium"],
    gcc: ["Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman"],
    asean: ["Indonesia", "Malaysia", "Thailand", "Vietnam", "Philippines", "Singapore", "Myanmar", "Cambodia", "Laos", "Brunei"],
};

// Fetch GeoJSON data for country borders
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
    .then(response => response.json())
    .then(data => {
        geoJsonLayer = L.geoJSON(data, {
            style: {
                color: '#555',
                weight: 1,
                fillColor: '#aaa',
                fillOpacity: 0.5,
            },
            onEachFeature: (feature, layer) => {
                // Add a click event to each country
                layer.on('click', () => {
                    const countryName = feature.properties.name;
                    fetchCountryData(countryName);
                });
            },
        }).addTo(map);

        // Add dropdown functionality
        document.getElementById('group-select').addEventListener('change', (event) => {
            const selectedGroup = event.target.value;
            filterCountriesByGroup(selectedGroup, data);
        });
    })
    .catch((error) => console.error('Error fetching GeoJSON:', error));

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
        .catch((error) => {
            console.error('Error fetching country data:', error);
            document.getElementById('country-name').textContent = `Country: ${countryName}`;
            document.getElementById('country-population').textContent = `Population: Data not available`;
        });
}

// Filter countries by selected group
function filterCountriesByGroup(group, data) {
    if (geoJsonLayer) {
        geoJsonLayer.clearLayers();
    }

    let filteredData;
    if (group === 'all') {
        filteredData = data;
    } else {
        const groupCountries = countryGroups[group];
        filteredData = {
            type: 'FeatureCollection',
            features: data.features.filter(feature =>
                groupCountries.includes(feature.properties.name)
            ),
        };
    }

    geoJsonLayer = L.geoJSON(filteredData, {
        style: {
            color: '#555',
            weight: 1,
            fillColor: '#67a9cf',
            fillOpacity: 0.6,
        },
        onEachFeature: (feature, layer) => {
            layer.on('click', () => {
                const countryName = feature.properties.name;
                fetchCountryData(countryName);
            });
        },
    }).addTo(map);
}
