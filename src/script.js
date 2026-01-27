// Get elements
const searchButton = document.querySelector('.search-btn');
const searchInput = document.querySelector('.search');

// Current weather elements
const locationElement = document.querySelector('.col1 p:nth-child(1)');
const dateElement = document.querySelector('.col1 p:nth-child(2)');
const timeElement = document.querySelector('.col1 p:nth-child(3)');
const temperatureElement = document.querySelector('.col2 p:nth-child(1)');
const aqiElement = document.querySelector('.col2 p:nth-child(2)');
const weatherIconElement = document.querySelector('.col3 img');

// Extra details
const humidityElement = document.querySelector('.hum p');
const uvIndexElement = document.querySelector('.uv-index p');
const airPressureElement = document.querySelector('.press p');
const sunsetElement = document.querySelector('.sun p');
const weatherTypeElement = document.querySelector('.w-type p');
const windSpeedElement = document.querySelector('.wind-speed p');

// Forecast container
const forecastContainer = document.querySelector('.days');

// Fetch weather data
async function fetchWeatherData(city) {
    const API_KEY = '4b66811a783e865846c0dc50b4d0648e';
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('City not found');
    }

    return response.json();
}

// Fetch AQI
async function fetchAQI(lat, lon) {
  const API_KEY = '4b66811a783e865846c0dc50b4d0648e';
  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch AQI');
  
  const data = await response.json();
  // AQI is in data.list[0].main.aqi (1=Good, 5=Very Poor)
  return data.list[0].main.aqi;
}

// Map AQI numbers to descriptive labels
const aqiLabels = {
    1: 'Good',
    2: 'Fair',
    3: 'Moderate',
    4: 'Poor',
    5: 'Very Poor'
};

// Map icons
function fetchImage(iconCode) {
    const iconMap = {
        '01d': 'clear-sky-day.png',
        '01n': 'clear-sky-night.png',
        '02d': 'few-clouds-day.png',
        '02n': 'few-clouds-night.png',
        '03d': 'scattered-clouds-day.png',
        '03n': 'scattered-clouds-night.png',
        '04d': 'broken-clouds-day.png',
        '04n': 'broken-clouds-night.png',
        '09d': 'shower-rain-day.png',
        '09n': 'shower-rain-night.png',
        '10d': 'rain-day.png',
        '10n': 'rain-night.png',
        '11d': 'thunderstorm-day.png',
        '11n': 'thunderstorm-night.png',
        '13d': 'snow-day.png',
        '13n': 'snow-night.png',
        '50d': 'mist-day.png',
        '50n': 'mist-night.png',
    };

    return iconMap[iconCode] || 'default.png';
}

// const iconPath = `assets/${fetchImage(current.weather[0].icon)}`;
// weatherIconElement.src = iconPath;
// weatherIconElement.alt = current.weather[0].description;

async function updateWeather(city) {
    try {
        const data = await fetchWeatherData(city);
        if (!data || data.cod !== "200" && data.cod !== 200) {
            alert('No data found for the city.');
            return;
        }

        // Extract useful info
        const weatherData = data.list[0];
        const cityData = data.city;
        const main = weatherData.main;
        const weather = weatherData.weather[0];
        const wind = weatherData.wind;
        const sys = cityData;  // For sunset time, city object has no sys, so use first list's sys instead
        const dt = weatherData.dt;

        // Get lat, lon for AQI fetch
        const lat = cityData.coord.lat;
        const lon = cityData.coord.lon;

        // Fetch AQI data
        const aqiValue = await fetchAQI(lat, lon);
        const aqiText = aqiLabels[aqiValue] || 'N/A';

        // Update current weather details
        locationElement.innerHTML = `<i class="bi-geo-alt"></i> ${cityData.name}, ${cityData.country}`;
        dateElement.innerHTML = `<i class="bi-calendar"></i> ${new Date(dt * 1000).toLocaleDateString()}`;
        timeElement.innerHTML = `<i class="bi-clock"></i> ${new Date(dt * 1000).toLocaleTimeString()}`;

        temperatureElement.innerHTML = `<i class="bi-thermometer"></i> ${main.temp}°C`;
        aqiElement.innerHTML = `<i class="bi-cloud-haze"></i> AQI: ${aqiText}`;

        // Weather icon
        const iconPath = `assets/${fetchImage(weather.icon)}`;
        weatherIconElement.src = iconPath;

        // Additional weather details
        humidityElement.innerHTML = `<i class="bi-droplet"></i> Humidity: ${main.humidity}%`;
        uvIndexElement.innerHTML = `<i class="bi-sun"></i> UV Index: N/A`;  // UV Index requires another API call
        airPressureElement.innerHTML = `<i class="bi-bar-chart-line"></i> Air Pressure: ${main.pressure} hPa`;

        // Sunset time: the city object doesn’t have sunset, get it from first weatherData.sys (if available)
        const sunsetUnix = data.city.sunset || weatherData.sys?.sunset;
        sunsetElement.innerHTML = `<i class="bi-sunset"></i> Sunset: ${
            sunsetUnix ? new Date(sunsetUnix * 1000).toLocaleTimeString() : 'N/A'}`;

        weatherTypeElement.innerHTML = `${weather.main}`;
        windSpeedElement.innerHTML = `<i class="bi-wind"></i> Wind Speed: ${wind.speed} m/s`;

        // Update 5-day forecast
        forecastContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const forecast = data.list[i * 8] || data.list[data.list.length - 1]; // fallback last item
            const date = new Date(forecast.dt * 1000).toLocaleDateString();
            const temp = forecast.main.temp;
            const humidity = forecast.main.humidity;
            const iconCode = forecast.weather[0].icon;
            const description = forecast.weather[0].description;

            const dayDiv = document.createElement('div');
            dayDiv.classList.add(`day${i}`);
            dayDiv.innerHTML = `
                <p>${date}</p>
                <p><i class="bi-thermometer"></i> ${temp}°C</p>
                <p><i class="bi-cloud-haze"></i> ${description}</p>
                <p><i class="bi-droplet"></i> Humidity: ${humidity}%</p>
                <img src="assets/${fetchImage(iconCode)}" alt="Weather Icon">
            `;
            forecastContainer.appendChild(dayDiv);
        }

    } catch (error) {
        alert(error.message);
        console.error("Error:", error);
    }
}

// Event listeners
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        updateWeather(city);
    } else {
        alert('Please enter a city name.');
    }
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});