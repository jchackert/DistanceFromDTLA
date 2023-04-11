require("dotenv").config();
const { Client } = require("@googlemaps/google-maps-services-js");
const axios = require("axios");

const googleMapsClient = new Client({
  apiKey: process.env.GOOGLE_MAPS_API_KEY,
  axiosInstance: axios.create({
    headers: { "Content-Type": "application/json" },
    params: { key: process.env.GOOGLE_MAPS_API_KEY },
  }),
});

const centerLat = 34.0395;
const centerLong = -118.2662;

async function getLocationFromZipCode(zipCode) {
  try {
    const response = await googleMapsClient.geocode({
      params: {
        address: zipCode,
      },
    });

    if (response.data.status !== "OK") {
      console.error(`Error for zip code ${zipCode}: ${response.data.status}`);
      return { lat: 0, long: 0, placeName: "Unknown", zipCode };
    }

    const lat = response.data.results[0].geometry.location.lat;
    const long = response.data.results[0].geometry.location.lng;
    let placeName = "Unknown";
    const addressComponents = response.data.results[0].address_components;

    addressComponents.forEach((component) => {
      if (component.types.includes("locality")) {
        placeName = component.long_name;
      }
    });

    return { lat, long, placeName, zipCode };
  } catch (err) {
    console.error(`Error for zip code ${zipCode}: ${err.message}`);
    return { lat: 0, long: 0, placeName: "Unknown", zipCode };
  }
}

function getDistanceInMeters(lat1, long1, lat2, long2) {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((long2 - long1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const zipCodes = [
  "85262",
  "67203",
  "70780",
  "58386",
  "71339",
  "60601",
  "19312",
  "55330",
  "59241",
  "39140",
  "99403",
  "02211",
  "28236",
  "37138",
  "57196",
  "29708",
  "28106",
  "98025",
  "30394",
  "56375",
  "53006",
  "67103",
  "46784",
  "02445",
  "35237",
  "48766",
  "12153",
  "16049",
  "52750",
  "02283",
  "05155",
  "56663",
  "36107",
  "61735",
  "09642",
  "01822",
  "19544",
  "49776",
  "62612",
  "53580",
  "15611",
  "15690",
  "12844",
  "44090",
  "08054",
  "48449",
  "72703",
  "55012",
  "13606",
  "57466",
  "33028",
  "77626",
  "01772",
  "15544",
  "78125",
  "21540",
  "55443",
  "06480",
  "79718",
  "62693",
  "97136",
  "95676",
  "50532",
  "47249",
  "44250",
  "64858",
  "42302",
  "36311",
  "85365",
  "99356",
  "44862",
  "36028",
  "56518",
  "37861",
  "13835",
  "77368",
  "27455",
  "22408",
  "24472",
  "68020",
  "53586",
  "56221",
  "36574",
  "67127",
  "55436",
  "78664",
  "97759",
  "45714",
  "91009",
  "47880",
  "10538",
  "40445",
  "29572",
  "63123",
  "77531",
  "03813",
  "51450",
  "80034",
  "28472",
  "63666",
];

(async () => {
  const zipCodeDataPromises = zipCodes.map(async (zipCode) => {
    const { lat, long, placeName } = await getLocationFromZipCode(zipCode);
    const distance = getDistanceInMeters(lat, long, centerLat, centerLong);
    return { zipCode, distance, lat, long, placeName };
  });

  function padString(str, length) {
    const spacesToAdd = length - str.length;
    if (spacesToAdd <= 0) {
      return str;
    }
    return str + " ".repeat(spacesToAdd);
  }

  const zipCodeData = await Promise.all(zipCodeDataPromises);
  zipCodeData.sort((a, b) => a.distance - b.distance);

  console.log("Zip Code  Place Name     Distance (m)");
  console.log("----------------------------------");
  zipCodeData.forEach(({ zipCode, placeName, distance }) => {
    const paddedZipCode = padString(zipCode, 8);
    const paddedPlaceName = padString(placeName, 14);
    const paddedDistance = padString(distance.toFixed(2), 8);
    console.log(`${paddedZipCode}  ${paddedPlaceName}  ${paddedDistance}`);
  });
})();

// Tape exported functions
module.exports = { getLocationFromZipCode };
module.exports = { getLocationFromZipCode, getDistanceInMeters };
