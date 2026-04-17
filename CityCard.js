import { getWeather } from "./api.js";
import { getWeatherIcon,getTemperatureStatus,celsiusToFahrenheit } from "./utility.js";
import { isCelsius } from "./main.js";

class CityCard{
  #timer;

  constructor(name,lat,lon){
    this.name=name;
    this.latitude=lat;
    this.longitude=lon;

    this.current=null;
    this.forecast=[];
    this.loading=true;
    this.error=null;

    this.fetchWeather();
    this.startAutoRefresh();
  }

  async fetchWeather(){
    try{
      this.loading=true;

      const { current,forecast }=await getWeather(this.latitude,this.longitude);

      this.current=current;
      this.forecast=forecast;
      this.error=null;
      this.loading=false;

      document.dispatchEvent(new Event("weatherUpdated"));
    }catch(err){
      this.error=err.message;
      this.loading=false;

      document.dispatchEvent(new Event("weatherUpdated"));

      document.dispatchEvent(new CustomEvent("toast",{
        detail:{
          message:`Failed to refresh ${this.name}`,
          type:"error"
        }
      }));
    }
  }

  startAutoRefresh(){
    const refresh=async()=>{
      await this.fetchWeather();
    };
    this.#timer=setInterval(refresh,600000);
  }

  stopAutoRefresh(){
    clearInterval(this.#timer);
  }

  render(){
    if(this.loading||!this.current){
      return `
      <div class="card skeleton">
        <div class="sk-header">
          <div class="sk-line w-50"></div>
          <div class="sk-circle"></div>
        </div>
        <div class="sk-temp"></div>
        <div class="sk-line w-60"></div>
        <div class="sk-line w-40"></div>
        <div class="sk-stats">
          <div class="sk-line w-30"></div>
          <div class="sk-line w-30"></div>
          <div class="sk-line w-30"></div>
        </div>
        <div class="sk-forecast">
          <div class="sk-box"></div>
          <div class="sk-box"></div>
          <div class="sk-box"></div>
          <div class="sk-box"></div>
          <div class="sk-box"></div>
        </div>
      </div>
      `;
    }

    if(this.error){
      return `
      <div class="card error-card">
        <div class="error-icon">⚡</div>
        <h3>Network Error</h3>
        <p>${this.error}</p>
        <button class="retry-btn" data-city="${this.name}">
          ↻ Retry
        </button>
      </div>
      `;
    }

    const temp=isCelsius
      ? Math.round(this.current.temperature)
      : Math.round(celsiusToFahrenheit(this.current.temperature));

    const feels=isCelsius
      ? Math.round(this.current.feelsLike)
      : Math.round(celsiusToFahrenheit(this.current.feelsLike));

    const status=getTemperatureStatus(this.current.feelsLike);

    return `
    <div class="card" style="border-top:4px solid ${status.color}">
      <div class="card-header">
        <div>
          <h2>${this.name}</h2>
          <div class="sub">${this.latitude.toFixed(2)}, ${this.longitude.toFixed(2)}</div>
        </div>
        <button class="remove-btn" data-city="${this.name}">×</button>
      </div>

      <div class="main">
        <div class="temp">${temp}°${isCelsius?"C":"F"}</div>
        <div class="icon">${getWeatherIcon(this.current.code)}</div>
      </div>

      <div class="condition">
        ${status.label}
      </div>

      <div class="feels">
        Feels like ${feels}° · ${status.icon} ${status.label}
      </div>

      <div class="stats">
        <div class="stat">
          💧
          <span>${this.current.humidity}%</span>
          <small>HUMIDITY</small>
        </div>

        <div class="stat">
          🌬
          <span>${this.current.wind} km/h</span>
          <small>WIND</small>
        </div>

        <div class="stat">
          👁
          <span>${this.current.visibility ?? "--"} km</span>
          <small>VISIBILITY</small>
        </div>
      </div>

      <div class="forecast">
        ${this.forecast.map(d=>`
          <div class="day">
            <div class="icon">${getWeatherIcon(d.code)}</div>
            <strong>${Math.round(d.temperature)}°</strong>
            <small>${new Date(d.date).toLocaleDateString(undefined,{ weekday:"short" })}</small>
          </div>
        `).join("")}
      </div>

      <div class="updated">
        Updated just now
      </div>
    </div>
    `;
  }
}
export default CityCard;