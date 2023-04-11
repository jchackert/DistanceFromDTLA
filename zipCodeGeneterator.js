const zipcodes = require('zipcodes');

// Generate 100 random ZIP codes
const randomZipCodes = [];
for (let i = 0; i < 100; i++) {
  const randomZipCode = zipcodes.random();
  randomZipCodes.push(randomZipCode.zip);
}

console.log(randomZipCodes);

