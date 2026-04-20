import CityCard from "./CityCard.js";

class Dashboard {
  #cities = [];

  addCity(name, lat, lon, country) {
    if (this.#cities.find((c) => c.name === name)) {
      return { success: false, reason: "exists" };
    }

    if (this.#cities.length >= 8) {
      return { success: false, reason: "limit" };
    }

    const city = new CityCard(name, lat, lon, country);
    this.#cities.push(city);

    return { success: true };
  }

  removeCity(name) {
    const c = this.#cities.find((c) => c.name === name);
    if (c) c.stopAutoRefresh();
    this.#cities = this.#cities.filter((c) => c.name !== name);
  }

  getCities() {
    return this.#cities;
  }

  async refreshAll() {
    await Promise.allSettled(this.#cities.map((city) => city.fetchWeather()));
  }

  render(container) {
    const empty = document.getElementById("emptyState");

    if (this.#cities.length === 0) {
      container.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    container.innerHTML = "";

    this.#cities.forEach((c) => {
      container.appendChild(c.render());
    });
  }
}

export default Dashboard;