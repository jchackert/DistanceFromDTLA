const test = require('tape');
const { getLocationFromZipCode, getDistanceInMeters } = require('./distance');

test('getLocationFromZipCode', async (t) => {
  const zipCode = '90803';
  const expectedPlaceName = 'Long Beach';
  const expectedLat = 33.7523035;
  const expectedLong = -118.1298234;
  
  const actualLocation = await getLocationFromZipCode(zipCode);
  
  t.assert(typeof actualLocation.lat === 'number', 'Latitude should be a number');
  t.assert(typeof actualLocation.long === 'number', 'Longitude should be a number');
  t.assert(typeof actualLocation.placeName === 'string', 'Place name should be a string');
  t.equal(actualLocation.placeName, expectedPlaceName, 'Place name should match expected value');
  t.equal(actualLocation.zipCode, zipCode, 'Zip code should match input value');
  t.equal(actualLocation.lat, expectedLat, 'Latitude should match expected value');
  t.equal(actualLocation.long, expectedLong, 'Longitude should match expected value');
  
  t.end();
});

test('getDistanceInMeters', (t) => {
  const lat1 = 33.7523035;
  const long1 = -118.1298234;
  const lat2 = 34.0395;
  const long2 = -118.2662;
  const expectedDistance = 34325.92; // Distance calculated using Google Maps
  
  const actualDistance = getDistanceInMeters(lat1, long1, lat2, long2);
  
  t.assert(typeof actualDistance === 'number', 'Distance should be a number');
  t.equal(actualDistance.toFixed(2), expectedDistance.toFixed(2), 'Distance should match expected value');
  
  t.end();
});

