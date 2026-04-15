
export async function getCoordinates(city) {
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", city);
    url.searchParams.set("count", 1);

    const response = await fetch(url);
    if (!response.ok) throw new WeatherError("Failed to fetch coordinates");

    const data = await response.json();
    const citydata = data.results?.[0];

    if (!citydata) throw new WeatherError("City not found");

    const { name, latitude, longitude } = citydata;

    return { name, latitude, longitude };
  } catch (err) {
    console.error("Error fetching coordinates", err.message);
    throw err;
  }
}

export async function getWeather(latitude, longitude) {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.searchParams.set("latitude", latitude);
    url.searchParams.set("longitude", longitude);
    url.searchParams.set(
      "current",
      "temperature_2m,weather_code,wind_speed_10m,apparent_temperature,relative_humidity_2m"
    );
    url.searchParams.set(
      "daily",
      "temperature_2m_max,apparent_temperature_max,relative_humidity_2m_max,wind_speed_10m_max,weather_code"
    );
    url.searchParams.set("timezone", "auto");

    const response = await fetch(url);
    if (!response.ok) throw new WeatherError("Failed to fetch weather");

    const data = await response.json();

    const {
      temperature_2m,
      apparent_temperature,
      wind_speed_10m,
      relative_humidity_2m,
      weather_code
    } = data.current ?? {};

    if (temperature_2m == null) throw new WeatherError("No current weather");

    const current = {
      temperature: temperature_2m,
      feelsLike: apparent_temperature,
      wind: wind_speed_10m,
      humidity: relative_humidity_2m,
      code: weather_code
    };

    const {
      time,
      temperature_2m_max,
      apparent_temperature_max,
      relative_humidity_2m_max,
      wind_speed_10m_max,
      weather_code: dailyCode
    } = data.daily ?? {};

    if (!time) throw new WeatherError("No forecast data");

    const forecast = time.slice(0, 5).map((date, index) => ({
      date,
      temperature: temperature_2m_max[index],
      feelsLike: apparent_temperature_max[index],
      humidity: relative_humidity_2m_max[index],
      wind: wind_speed_10m_max[index],
      code: dailyCode[index]
    }));

    return { current, forecast };
  } catch (err) {
    console.error("Error fetching weather", err.message);
    throw err;
  }
}

class WeatherError extends Error {
  constructor(message) {
    super(message);
    this.name = "WeatherError";
  }
}

