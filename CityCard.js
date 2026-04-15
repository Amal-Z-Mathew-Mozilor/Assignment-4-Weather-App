import { getWeather } from "./api.js";
class CityCard
{
    #timer;
    constructor(name,latitude,longitude)
    {
        this.name=name;
        this.latitude=latitude;
        this.longitude=longitude;
        this.current=null;
        this.forecast=null;
        this.fetchWeather();
        this.startAutoRefresh();
    }
    async fetchWeather()
    {
        try
        {
            const{current,forecast}=await getWeather(this.latitude,this.longitude);
            this.current=current;
            this.forecast=forecast;
        }
        catch(err)
        {
            console.error("Error Fetching Weather",err.message);
        }
    }
    refresh()
    {
        this.fetchWeather();
    }
    startAutoRefresh()
    {
        this.#timer=setInterval(()=>{this.refresh();},10000); 
    }
    stopAutoRefresh()
    {
        clearInterval(this.#timer);
    }
   
}
export default CityCard;