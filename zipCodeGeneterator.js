const zipcodes = require("zipcodes");
const fs = require("fs");

// Generate 100 random US ZIP codes
const randomZipCodes = [];
while (randomZipCodes.length < 100) {
  const randomZipCode = zipcodes.random();
  if (randomZipCode.country === "US") {
    randomZipCodes.push(randomZipCode.zip);
  }
}

// Save the ZIP codes to a text file
fs.writeFileSync("zipcodes.txt", randomZipCodes.join("\n"));

console.log(
  `Random US ZIP codes saved to zipcodes.txt:\n${randomZipCodes.join("\n")}`
);
