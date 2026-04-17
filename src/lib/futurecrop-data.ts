export type Region = {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  area: string;
  staple: string;
};

export const REGIONS: Region[] = [
  { id: "iowa", name: "Iowa Belt", country: "United States", lat: 41.9, lon: -93.0, area: "145,000 km²", staple: "Maize" },
  { id: "punjab", name: "Punjab Plains", country: "India / Pakistan", lat: 31.1, lon: 75.3, area: "50,400 km²", staple: "Wheat" },
  { id: "saopaulo", name: "São Paulo Cerrado", country: "Brazil", lat: -22.0, lon: -47.5, area: "2.04M km²", staple: "Soybean" },
  { id: "nile", name: "Nile Delta", country: "Egypt", lat: 30.8, lon: 31.0, area: "24,000 km²", staple: "Rice / Cotton" },
  { id: "sahel", name: "Sahel Corridor", country: "West Africa", lat: 14.0, lon: 0.0, area: "3.05M km²", staple: "Sorghum / Millet" },
  { id: "ukraine", name: "Black Earth Belt", country: "Ukraine", lat: 49.0, lon: 32.0, area: "340,000 km²", staple: "Wheat / Sunflower" },
  { id: "mekong", name: "Mekong Delta", country: "Vietnam", lat: 10.0, lon: 105.5, area: "40,500 km²", staple: "Rice" },
  { id: "northeurope", name: "North European Plain", country: "DE / PL / FR", lat: 52.0, lon: 13.4, area: "1.20M km²", staple: "Wheat / Barley" },
];

export type Scenario = {
  ssp: "SSP1-1.9" | "SSP2-4.5" | "SSP3-7.0" | "SSP5-8.5";
  year: number;
  warming: number; // °C
  co2: number; // ppm
};
