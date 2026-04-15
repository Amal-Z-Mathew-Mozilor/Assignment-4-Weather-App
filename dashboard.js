import CityCard from "./CityCard.js";
class Dashboard {
  #cities = [];

  addCity(name, lat, lon) {

    if (!this.#cities.find(c => c.name === name)) {

      if (this.#cities.length === 8) {
        this.#cities[0].stopAutoRefresh();
        this.#cities.shift();

      }
      const city= new CityCard(name, lat, lon)
      this.#cities.push(city);
    }
  }

  removeCity(city) {
    const cityObj = this.#cities.find(c => c.name === city);
   if (cityObj) {
    cityObj.stopAutoRefresh();
   }
    this.#cities = this.#cities.filter(c => c.name !== city);
  }

  getCities() {
    return this.#cities;
  }

  async refreshAll() {
    await Promise.allSettled(
      this.#cities.map(city => city.refresh())
    );
  }
}
export default Dashboard;