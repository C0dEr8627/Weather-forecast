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

// Update UI
async function updateWeather(city) {
    try {
        const data = await fetchWeatherData(city);

        const current = data.list[0];
        const cityData = data.city;

        // Location / date / time
        locationElement.innerHTML = `<i class="bi-geo-alt"></i> ${cityData.name}, ${cityData.country}`;
        dateElement.innerHTML = `<i class="bi-calendar"></i> ${new Date(current.dt * 1000).toLocaleDateString()}`;
        timeElement.innerHTML = `<i class="bi-clock"></i> ${new Date(current.dt * 1000).toLocaleTimeString()}`;

        // Temperature & description
        temperatureElement.innerHTML = `<i class="bi-thermometer"></i> ${current.main.temp}°C`;
        aqiElement.innerHTML = `<i class="bi-cloud-haze"></i> ${current.weather[0].description}`;

        // Icon
        weatherIconElement.src = `assets/icons/${fetchImage(current.weather[0].icon)}`;

        // Extra details
        humidityElement.innerHTML = `<i class="bi-droplet"></i> Humidity: ${current.main.humidity}%`;
        uvIndexElement.innerHTML = `<i class="bi-sun"></i> UV Index: N/A`;
        airPressureElement.innerHTML = `<i class="bi-bar-chart-line"></i> Air Pressure: ${current.main.pressure} hPa`;
        sunsetElement.innerHTML = `<i class="bi-sunset"></i> Sunset: ${new Date(cityData.sunset * 1000).toLocaleTimeString()}`;
        weatherTypeElement.innerHTML = current.weather[0].main;
        windSpeedElement.innerHTML = `<i class="bi-wind"></i> Wind Speed: ${current.wind.speed} m/s`;

        // 5-day forecast (proper way)
forecastContainer.innerHTML = '';

const dailyMap = {};

data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();

    // Pick first forecast of each day (around noon if possible)
    if (!dailyMap[date]) {
        dailyMap[date] = item;
    }
});

const days = Object.values(dailyMap).slice(1, 6); // next 5 days

days.forEach((forecast, index) => {
    const div = document.createElement('div');
    div.classList.add(`day${index + 1}`);

    div.innerHTML = `
        <p>${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
        <p><i class="bi-thermometer"></i> ${forecast.main.temp}°C</p>
        <p>${forecast.weather[0].description}</p>
        <p><i class="bi-droplet"></i> ${forecast.main.humidity}%</p>
        <img src="assets/icons/${fetchImage(forecast.weather[0].icon)}" alt="">
    `;

    forecastContainer.appendChild(div);
});


    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// Events
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) updateWeather(city);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') searchButton.click();
});
