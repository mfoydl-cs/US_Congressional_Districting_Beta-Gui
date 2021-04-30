const countryBounds = [[20, -127], [53, -65]];
const states = ["AL", "AR", "MI"];

//Feature Style variables
const style = {
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.5
}

const statesStyle = { //Styling for State GeoJSON features
  fillColor: '#3388FF',
  color: '#3388FF',
  weight: 2,
  opacity: 0.9,
  fillOpacity: 0.2
}

const districtStyle = { //Styling (besides color) for District GeoJSON features
  weight: 3,
  opacity: 1,
  fillOpacity: 0.2
}

const highLightStyle = { //Style for highlighted features
  weight: 4,
  opacity: 1,
  fillOpacity: 0.7
}

const countyStyle = {
  weight: 2,
  opacity: 0.8,
  fillOpacity: 0,
  color: 'white',
  dashArray: '3 8'
}

const precinctStyle = {
  weight: 1,
  opacity: 1,
  fillOpacity: 0,
  color: 'white',
  dashArray: '1 3'
}

//Pastel color palette for coloring the districts
const pastelPalette = [
  "#e89af9", "#f18bf4", "#dd74f2", "#f78fd8",
  "#9bffa7", "#97ff9e", "#7fefac", "#93f9bf",
  "#f4869a", "#f18bf4", "#ed6a82", "#f780a6",
  "#f7a08f", "#ffc5c4", "#f2c091", "#ff967f",
  "#83fcdc", "#bff8ff", "#b2cef4", "#b7d5ff",
  "#fffbbf", "#f7dc8a", "#ffeeb5", "#ecf280",
  "#d4b7ff", "#e6c9ff", "#e3a0f7", "#a869e0",
]

const darkPalette = [
  "#1a7003", "#6d8908", "#019356", "#08876f", "#66a310", //Greens
  "#992300", "#ba3f01", "#961b06", "#960f30", "#b73110", //Reds
  "#04838e", "#0b557c", "#0faf9f", "#0b7e82", "#004e66", //Blues
  "#28056d", "#053177", "#0d3393", "#05005b", "#033d60", //Dark-blues
  "#ccbf14", "#ddda0f", "#e0c816", "#cc7f0c", "#e0a016", //Yellows
  "#ba3e09", "#e27216", "#e05804", "#d63f08", "#ff652d", //Oranges
  "#af08d8", "#520d84", "#c10d97", "#680c96", "#7b12cc", //Purples
]
