import Dashboard from "./dashboard.js";
import { getCoordinates } from "./api.js";
import { loadCities,saveCities } from "./storage.js";

export let isCelsius=true;

const dashboard=new Dashboard();
const grid=document.querySelector(".grid");
const input=document.querySelector("#searchInput");
const historyBox=document.getElementById("historyDropdown");

let history=[];

function showToast(message,type="success"){
  const container=document.getElementById("toastContainer");
  const toast=document.createElement("div");
  toast.className=`toast ${type}`;
  toast.innerHTML=`<div class="dot"></div><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(()=>{toast.remove();},3000);
}

function updateHistory(city){
  history=history.filter(c=>c!==city);
  history.unshift(city);
  history=history.slice(0,5);
}

async function getSuggestions(query){
  if(!query) return [];
  try{
    const url=new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name",query);
    url.searchParams.set("count",5);
    const res=await fetch(url);
    const data=await res.json();
    return data.results??[];
  }catch{
    return [];
  }
}

async function renderHistory(){
  const value=input.value.trim();
  let html="";

  if(history.length){
    html+=`<div class="history-section">RECENT</div>`;
    html+=history.map(city=>`
      <div class="history-item" data-city="${city}">
        🕘 ${city}
      </div>
    `).join("");
  }

  if(value){
    const suggestions=await getSuggestions(value);
    if(suggestions.length){
      html+=`<div class="history-section">SUGGESTIONS</div>`;
      html+=suggestions.map(c=>`
        <div class="history-item"
             data-city="${c.name}"
             data-lat="${c.latitude}"
             data-lon="${c.longitude}">
          📍 ${c.name}
          <small>${c.country??""}</small>
        </div>
      `).join("");
    }
  }

  if(!html){
    historyBox.classList.add("hidden");
    return;
  }

  historyBox.innerHTML=html;
  historyBox.classList.remove("hidden");
}

async function getCurrentLocation(){
  if(!navigator.geolocation) return;

  try{
    const pos=await new Promise((res,rej)=>
      navigator.geolocation.getCurrentPosition(res,rej)
    );

    const { latitude,longitude }=pos.coords;

    dashboard.addCity("Current Location",latitude,longitude);

    saveCities(
      dashboard.getCities().map(c=>({
        name:c.name,
        lat:c.latitude,
        lon:c.longitude
      }))
    );

    showToast("Current location added","success");

  }catch(err){
    console.warn("Geolocation failed:",err.message);
    showToast("Location access denied","error");
  }
}

async function handleSearch(){
  const value=input.value.trim();
  if(!value) return;

  try{
    const { name,latitude,longitude }=await getCoordinates(value);

    const exists=dashboard.getCities().find(
      c=>c.name.toLowerCase()===name.toLowerCase()
    );

    if(exists){
      showToast(`${name} is already in your dashboard`,"error");
      input.value="";
      return;
    }

    dashboard.addCity(name,latitude,longitude);
    updateHistory(name);

    saveCities(
      dashboard.getCities().map(c=>({
        name:c.name,
        lat:c.latitude,
        lon:c.longitude
      }))
    );

    input.value="";
    historyBox.classList.add("hidden");
    render();
    showToast(`${name} added to your dashboard`,"success");

  }catch{
    if(!navigator.onLine){
      showNetworkOverlay();
    }else{
      showErrorOverlay(value);
    }
  }
}

function showErrorOverlay(value){
  const errorDiv=document.createElement("div");
  errorDiv.className="error-overlay";

  errorDiv.innerHTML=`
    <div class="card error-card" style="position:relative">
      <button class="error-close">×</button>
      <div class="error-icon">🌐</div>
      <h3>City Not Found</h3>
      <p>We couldn't find "${value}". Please check spelling.</p>
      <button id="retrySearch">Try Again</button>
    </div>
  `;

  document.body.appendChild(errorDiv);

  errorDiv.querySelector("#retrySearch").onclick=()=>{
    input.focus();
    errorDiv.remove();
  };

  errorDiv.querySelector(".error-close").onclick=()=>{
    errorDiv.remove();
  };

  errorDiv.addEventListener("click",(e)=>{
    if(e.target===errorDiv) errorDiv.remove();
  });

  const escHandler=(e)=>{
    if(e.key==="Escape"){
      errorDiv.remove();
      document.removeEventListener("keydown",escHandler);
    }
  };

  document.addEventListener("keydown",escHandler);
}

function showNetworkOverlay(){
  if(document.querySelector(".error-overlay")) return;

  const errorDiv=document.createElement("div");
  errorDiv.className="error-overlay";

  errorDiv.innerHTML=`
    <div class="card error-card" style="position:relative">
      <button class="error-close">×</button>
      <div class="error-icon">⚡</div>
      <h3>Network Error</h3>
      <p>You are offline. Please check your internet connection.</p>
      <button id="retryNetwork">Retry</button>
    </div>
  `;

  document.body.appendChild(errorDiv);

  errorDiv.querySelector("#retryNetwork").onclick=()=>{
    errorDiv.remove();
    if(navigator.onLine) render();
  };

  errorDiv.querySelector(".error-close").onclick=()=>{
    errorDiv.remove();
  };

  errorDiv.addEventListener("click",(e)=>{
    if(e.target===errorDiv) errorDiv.remove();
  });

  const escHandler=(e)=>{
    if(e.key==="Escape"){
      errorDiv.remove();
      document.removeEventListener("keydown",escHandler);
    }
  };

  document.addEventListener("keydown",escHandler);
}

document.querySelector("#addBtn").onclick=handleSearch;

input.addEventListener("keydown",e=>{
  if(e.key==="Enter") handleSearch();
});

input.addEventListener("input",renderHistory);
input.addEventListener("focus",renderHistory);

historyBox.addEventListener("click",(e)=>{
  const item=e.target.closest(".history-item");
  if(!item) return;

  const name=item.dataset.city;
  const lat=item.dataset.lat;
  const lon=item.dataset.lon;

  historyBox.classList.add("hidden");

  if(lat&&lon){
    const exists=dashboard.getCities().find(
      c=>c.name.toLowerCase()===name.toLowerCase()
    );
    if(exists){
      showToast(`${name} is already in your dashboard`,"error");
      return;
    }

    dashboard.addCity(name,+lat,+lon);
    updateHistory(name);

    saveCities(
      dashboard.getCities().map(c=>({
        name:c.name,
        lat:c.latitude,
        lon:c.longitude
      }))
    );

    render();
    showToast(`${name} added to your dashboard`,"success");

  }else{
    input.value=name;
    handleSearch();
  }
});

document.addEventListener("click",(e)=>{
  if(!e.target.closest(".search-container")){
    historyBox.classList.add("hidden");
  }
});

document.addEventListener("click",e=>{
  if(e.target.id==="emptyAddBtn") input.focus();
});

document.addEventListener("weatherUpdated",render);

const toggle=document.getElementById("unitToggle");

toggle.addEventListener("click",(e)=>{
  if(e.target.tagName!=="BUTTON") return;

  toggle.querySelectorAll("button").forEach(btn=>btn.classList.remove("active"));
  e.target.classList.add("active");

  isCelsius=e.target.dataset.unit==="c";
  render();
});

function render(){
  dashboard.render(grid);

  document.querySelectorAll(".remove-btn").forEach(btn=>{
    btn.onclick=()=>{
      dashboard.removeCity(btn.dataset.city);

      saveCities(
        dashboard.getCities().map(c=>({
          name:c.name,
          lat:c.latitude,
          lon:c.longitude
        }))
      );

      render();
    };
  });

  document.querySelectorAll(".retry-btn").forEach(btn=>{
    btn.onclick=()=>{
      const city=dashboard.getCities().find(c=>c.name===btn.dataset.city);
      if(city) city.fetchWeather();
    };
  });
}

async function init(){
  try{
    const savedCities=loadCities();

    if(savedCities?.length){
      savedCities.forEach(city=>
        dashboard.addCity(city.name,city.lat,city.lon)
      );
    }else{
      await getCurrentLocation();
    }

    render();
  }catch(err){
    console.error("Error while initializing:",err.message);
    showToast("Failed to load initial data","error");
  }
}

init();

setInterval(()=>{
  dashboard.refreshAll();
},600000);