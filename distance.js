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
  "99501", // Anchorage, AK
  "85001", // Phoenix, AZ
  "72201", // Little Rock, AR
  "90803", // Long Beach, CA
  "80201", // Denver, CO
  "06101", // Hartford, CT
  "19901", // Dover, DE
  "32801", // Orlando, FL
  "30301", // Atlanta, GA
  "96801", // Honolulu, HI
  "83701", // Boise, ID
  "60601", // Chicago, IL
  "46201", // Indianapolis, IN
  "50301", // Des Moines, IA
  "67201", // Wichita, KS
  "40201", // Louisville, KY
  "70112", // New Orleans, LA
  "04101", // Portland, ME
  "21201", // Baltimore, MD
  "02108", // Boston, MA
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
