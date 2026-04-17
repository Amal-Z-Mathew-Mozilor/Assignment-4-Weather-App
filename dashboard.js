import CityCard from "./CityCard.js";

class Dashboard{
  #cities=[];

  addCity(name,lat,lon){
    if(this.#cities.find(c=>c.name===name)) return;

    if(this.#cities.length>=8){
      const oldest=this.#cities[0];
      oldest.stopAutoRefresh();
      this.#cities.shift();
    }

    const city=new CityCard(name,lat,lon);
    this.#cities.push(city);
  }

  removeCity(name){
    const c=this.#cities.find(c=>c.name===name);
    if(c) c.stopAutoRefresh();
    this.#cities=this.#cities.filter(c=>c.name!==name);
  }

  getCities(){
    return this.#cities;
  }

  async refreshAll(){
    await Promise.allSettled(
      this.#cities.map(city=>city.fetchWeather())
    );
  }

  render(container){
    const empty=document.getElementById("emptyState");

    if(this.#cities.length===0){
      container.innerHTML="";
      empty.classList.remove("hidden");
      return;
    }

    empty.classList.add("hidden");
    container.innerHTML=this.#cities.map(c=>c.render()).join("");
  }
}

export default Dashboard;