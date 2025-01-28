// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Global variables
let geoJsonLayer = null;
let countryGroups = {};

// Fetch country group data from groups.json
fetch('groups.json')
    .then(response => response.json())
    .then(data => {
        countryGroups = data;
        populateDropdown(Object.keys(countryGroups));
    })
    .catch(error => console.error('Error fetching country groups:', error));

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
                layer.on('click', () => {
                    const countryName = feature.properties.name;
                    fetchCountryData(countryName);
                });
            },
        }).addTo(map);

        document.getElementById('group-select').addEventListener('change', (event) => {
            const selectedGroup = event.target.value;
            filterCountriesByGroup(selectedGroup, data);
        });
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));

// Function to populate dropdown
function populateDropdown(groups) {
    const dropdown = document.getElementById('group-select');
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group;
        option.textContent = group.charAt(0).toUpperCase() + group.slice(1);
        dropdown.appendChild(option);
    });
}

// Function to fetch population data for a country
function fetchCountryData(countryName) {
    fetch(`https://restcountries.com/v3.1/name/${countryName}`)
        .then(response => response.json())
        .then(data => {
            const country = data[0];
            const population = country.population;

            document.getElementById('country-name').textContent = `Country: ${countryName}`;
            document.getElementById('country-population').textContent = `Population: ${population.toLocaleString()}`;
        })
        .catch(error => {
            console.error('Error fetching country data:', error);
            document.getElementById('country-name').textContent = `Country: ${countryName}`;
            document.getElementById('country-population').textContent = `Population: Data not available`;
        });
}

// Function to filter countries by selected group
function filterCountriesByGroup(group, data) {
    if (geoJsonLayer) {
        geoJsonLayer.clearLayers();
    }

    let filteredData;
    if (group === 'all') {
        filteredData = data;
    } else {
        const groupCountries = countryGroups[group].countries;
        const groupColor = countryGroups[group].color;
        filteredData = {
            type: 'FeatureCollection',
            features: data.features.filter(feature =>
                groupCountries.includes(feature.properties.name)
            ),
        };

        geoJsonLayer = L.geoJSON(filteredData, {
            style: {
                color: '#555',
                weight: 1,
                fillColor: groupColor,
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
}
