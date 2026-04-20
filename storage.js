export function saveCities(cities) {
  try {
    localStorage.setItem("cities", JSON.stringify(cities));
  } catch (err) {
    console.error("error saving cities", err.message);
  }
}
export function loadCities() {
  try {
    const data = localStorage.getItem("cities");
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error("Error loading cities", err.message);
    return [];
  }
}
