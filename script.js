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
    nato: [
        "United States", "Canada", "United Kingdom", "France", "Germany", "Italy", "Turkey", 
        "Poland", "Spain", "Belgium", "Norway", "Denmark", "Iceland", "Luxembourg", "Netherlands", 
        "Portugal", "Greece", "Czech Republic", "Hungary", "Bulgaria", "Romania", "Slovakia", 
        "Slovenia", "Estonia", "Latvia", "Lithuania", "Albania", "Croatia", "Montenegro", "North Macedonia", "Finland", "Sweden"
    ],
    gcc: [
        "Saudi Arabia", "United Arab Emirates", "Qatar", "Kuwait", "Bahrain", "Oman"
    ],
    asean: [
        "Indonesia", "Malaysia", "Thailand", "Vietnam", "Philippines", "Singapore", 
        "Myanmar", "Cambodia", "Laos", "Brunei"
    ],
    africanUnion: [
        "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi", "Cabo Verde", "Cameroon", 
        "Central African Republic", "Chad", "Comoros", "Congo (Democratic Republic)", "Congo (Republic)", 
        "Djibouti", "Egypt", "Equatorial Guinea", "Eritrea", "Eswatini", "Ethiopia", "Gabon", 
        "Gambia", "Ghana", "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia", 
        "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius", "Morocco", "Mozambique", 
        "Namibia", "Niger", "Nigeria", "Rwanda", "Sao Tome and Principe", "Senegal", "Seychelles", 
        "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Togo", 
        "Tunisia", "Uganda", "Zambia", "Zimbabwe"
    ],
    eu: [
        "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", 
        "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", 
        "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", 
        "Spain", "Sweden"
    ],
    un: [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", 
        "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", 
        "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", 
        "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", 
        "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Republic)", 
        "Congo (Democratic Republic)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", 
        "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", 
        "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", 
        "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", 
        "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", 
        "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", 
        "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
        "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", 
        "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", 
        "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", 
        "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", 
        "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", 
        "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
        "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", 
        "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", 
        "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
        "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", 
        "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", 
        "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", 
        "Vietnam", "Yemen", "Zambia", "Zimbabwe"
    ],
    brics: [
        "Brazil", "Russia", "India", "China", "South Africa"
    ],
    g7: [
        "United States", "Canada", "France", "Germany", "Italy", "Japan", "United Kingdom"
    ]
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
