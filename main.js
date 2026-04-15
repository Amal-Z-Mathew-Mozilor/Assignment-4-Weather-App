import Dashboard from "./dashboard.js";
import { getCoordinates } from "./api.js";
import { loadCities, saveCities } from "./storage.js";

const dashboard = new Dashboard();
let history = [];

async function initialize() {
  try {
    const savedcities = loadCities();

    if (savedcities?.length) {
      savedcities.forEach(city =>
        dashboard.addCity(city.name, city.lat, city.lon)
      );
    } else {
      await getCurrentLocation();
    }
  } catch (err) {
    console.error("Error while initiating", err.message);
  }
}

export async function search(city) {
  try {
    if (!city) return;

    const { name, latitude, longitude } = await getCoordinates(city);

    dashboard.addCity(name, latitude, longitude);

    const data = dashboard.getCities().map(city => ({
      name: city.name,
      lat: city.latitude,
      lon: city.longitude
    }));

    saveCities(data);

    updateHistory(name);
  } catch (err) {
    console.error("Error while searching", err.message);
  }
}

function updateHistory(city) {
  history = history.filter(c => c !== city);
  history.unshift(city);
  history = history.slice(0, 5);
}

async function getCurrentLocation() {
  try {
    if (!navigator.geolocation) return;

    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const { latitude, longitude } = position.coords;

    dashboard.addCity("Current Location", latitude, longitude);

    const data = dashboard.getCities().map(city => ({
      name: city.name,
      lat: city.latitude,
      lon: city.longitude
    }));

    saveCities(data);

  } catch (err) {
    console.error("Error While Finding current Location", err.message);
  }
}

initialize();
export { dashboard, history };