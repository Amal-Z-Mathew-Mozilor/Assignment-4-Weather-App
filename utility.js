export function celsiusToFahrenheit(temp){
  return (temp*9)/5+32;
}

export function getWeatherIcon(code){
  if(code===0) return "☀️";
  if([1,2].includes(code)) return "🌤️";
  if(code===3) return "☁️";
  if([45,48].includes(code)) return "🌫️";
  if([51,53,55].includes(code)) return "🌦️";
  if([56,57].includes(code)) return "🌧️";
  if([61,63,65].includes(code)) return "🌧️";
  if([66,67].includes(code)) return "🌧️";
  if([71,73,75].includes(code)) return "❄️";
  if(code===77) return "🌨️";
  if([80,81,82].includes(code)) return "🌦️";
  if([85,86].includes(code)) return "❄️";
  if([95].includes(code)) return "⛈️";
  if([96,99].includes(code)) return "🌩️";
  return "🌤️";
}

export function getTemperatureStatus(temp){
  if(temp<=0) return { label:"Freezing",icon:"🥶",color:"#60A5FA" };
  if(temp<=10) return { label:"Cold",icon:"🧥",color:"#38BDF8" };
  if(temp<=20) return { label:"Cool",icon:"🌤️",color:"#34D399" };
  if(temp<=30) return { label:"Warm",icon:"😊",color:"#FBBF24" };
  if(temp<=38) return { label:"Hot",icon:"🔥",color:"#FB923C" };
  return { label:"Very Hot",icon:"🥵",color:"#EF4444" };
}