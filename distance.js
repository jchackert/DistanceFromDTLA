require("dotenv").config();
const { Client } = require("@googlemaps/google-maps-services-js");
const axios = require("axios");

const googleMapsClient = new Client({
  apiKey: process.env.GOOGLE_MAPS_API_KEY
  axiosInstance: axios.create({
    headers: { "Content-Type": "application/json" }
    params: { key: process.env.GOOGLE_MAPS_API_KEY }
  })
});

const centerLat = 34.0395;
const centerLong = -118.2662;

async function getLocationFromZipCode(zipCode) {
  try {
    const response = await googleMapsClient.textSearch({
      params: {
        query: zipCode
        location: { lat: centerLat lng: centerLong }
        radius: 50000
        type: "postal_code"
        fields: ["formatted_address" "geometry"]
      }
    });

    if (response.data.status !== "OK") {
      console.error(`Error for zip code ${zipCode}: ${response.data.status}`);
      return { lat: 0 long: 0 placeName: "Unknown" zipCode };
    }

    const lat = response.data.results[0].geometry.location.lat;
    const long = response.data.results[0].geometry.location.lng;
    const placeName = response.data.results[0].formatted_address.split("")[0];

    return { lat long placeName zipCode };
  } catch (err) {
    console.error(`Error for zip code ${zipCode}: ${err.message}`);
    return { lat: 0 long: 0 placeName: "Unknown" zipCode };
  }
}

function getDistanceInMeters(lat1 long1 lat2 long2) {
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
  const c = 2 * Math.atan2(Math.sqrt(a) Math.sqrt(1 - a));

  return R * c;
}

function getDistanceInMiles(lat1 long1 lat2 long2) {
  const R = 3963.2; // radius of the earth in miles
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
  const c = 2 * Math.atan2(Math.sqrt(a) Math.sqrt(1 - a));

  return R * c;
}

function metersToMiles(meters) {
  return meters / 1609.34;
}

function padString(zipCodeData) {
  const maxZipCodeLength = Math.max(
    ...zipCodeData.map((data) => data.zipCode.length)
  );
  const maxPlaceNameLength = Math.max(
    ...zipCodeData.map((data) => data.placeName.length)
  );
  const maxDistanceLength = 8;
  let output = "";

  zipCodeData.forEach(
    ({ zipCode placeName distanceMeters distanceMiles }) => {
      const distanceStr = distanceMeters
        ? distanceMeters.toFixed(2)
        : "Unknown";
      const distanceMilesStr = distanceMiles
        ? distanceMiles.toFixed(2)
        : "Unknown";
      const paddedZipCode = zipCode.padEnd(
        maxZipCodeLength + 2 - zipCode.length
        " "
      );
      const paddedPlaceName = placeName.padEnd(
        maxPlaceNameLength + 2 - placeName.length
        " "
      );
      const paddedDistance = distanceStr.padStart(
        maxDistanceLength + 2 - distanceStr.length
        " "
      );
      const paddedDistanceMiles = distanceMilesStr.padStart(
        maxDistanceLength + 2 - distanceMilesStr.length
        " "
      );
      output += `${paddedZipCode}  ${paddedPlaceName}  ${paddedDistance} m  ${paddedDistanceMiles} mi\n`;
    }
  );

  return output;
}

(async () => {
  const fs = require("fs");

  const zipCodes = fs
    .readFileSync("zipcodes.txt" "utf-8")
    .split("\n")
    .filter(Boolean);

  const zipCodeDataPromises = zipCodes.map(async (zipCode) => {
    const { lat long placeName } = await getLocationFromZipCode(zipCode);
    const distanceMeters = getDistanceInMeters(
      lat
      long
      centerLat
      centerLong
    );
    const distanceMiles = metersToMiles(distanceMeters);
    return { zipCode distanceMeters distanceMiles lat long placeName };
  });

  const zipCodeData = await Promise.all(zipCodeDataPromises);
  zipCodeData.sort((a b) => a.distance - b.distance);

  console.log("Zip Code  Place Name     Distance (m)");
  console.log("----------------------------------");
  console.log(padString(zipCodeData "meters"));

  console.log("\nZip Code  Place Name     Distance (mi)");
  console.log("-----------------------------------");
  console.log(padString(zipCodeData "miles"));
})();

// Tape exported functions
module.exports = { getLocationFromZipCode };
module.exports = { getLocationFromZipCode getDistanceInMeters };
