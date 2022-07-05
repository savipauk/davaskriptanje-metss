/*
Latitude: 1 deg = 110.574 km. Longitude: 1 deg = 111.320*cos(latitude) km
1deg=110574km
x = 10km
10*y = 110574
y = 110574 / 10
x*y = 1
x = 1 / (110574 / 10)
 

max-result: 50
search-radius: 10km

lat 
46.55  42.4
lng
13.5  19.45
*/

const fs = require('fs');
const https = require('https');
const http = require('http');


const max_result = 50;
const search_radius = 10;

const maxLat = 46.55;
const minLat = 42.4;
const maxLng = 19.45;
const minLng = 13.5;

// dok trazimo trgovine za kolko pomaknuti na lat ili na lng (na 10 km)
const latChangeRate = 1 / (110.574 / 10);
const lngChangeRate = 1 / ((111.320 * Math.cos(latChangeRate)) / 10);

// console.log("lat = " + latChangeRate + "\nlng = " + lngChangeRate);

let data = new Array();

let lat = 46.3897383; // <- test data (cakovec) maxLat;
let lng = 16.4379653; // maxLng;

let interval = 0;
// interval za request
const myInterval = setInterval(requestData, 2000);


// u teoriji preko ovoga dobijemo sve prodavaonice

// for(let lat = minLat; lat < maxLat; lat += latChangeRate){
//   for(let lng = minLng; lng < maxLng; lng += lngChangeRate){
//     // query
//     let address = 'https://metss.hr/wp-admin/admin-ajax.php?action=store_search&lat=' + lat + '&lng=' + lng + '&max_results=5&search_radius=10&autoload=1';
//   }
// }


function requestData() {
  console.log("getting data...");

  let address = 'https://metss.hr/wp-admin/admin-ajax.php?action=store_search&lat=' + lat + '&lng=' + lng + '&max_results=5&search_radius=10&autoload=1';

  let output;

  https.get(address, (resp) => {
    let rawdata = '';

    // A chunk of data has been received.
    resp.on('data', (chunk) => {
      rawdata += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', () => {
      output = JSON.parse(rawdata);
      for (let i = 0; i < output.length; i++) {
        data.push(output[i]["id"]);
      }
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });

  lat -= latChangeRate;
  lng -= lngChangeRate;

  interval++;
  if (interval > 2) {
    clearInterval(myInterval);
    updateSite();
  }
}


function updateSite() {
  let myString = "";
  for (let i = 0; i < data.length; i++) {
    myString += "id: " + data[i] + "\n";
  }

  fs.writeFileSync("prodavaonice.txt", myString);



  let output = "Unfiltered:\n";

  for (let i = 0; i < data.length; i++) {
    output += "id: " + data[i] + "\n";
  }

  // Filter duplicates
  let filteredData = new Array();

  for (let i = 0; i < data.length; i++) {
    let exists = false;

    for (let j = 0; j < filteredData.length; j++) {
      if (data[i] == filteredData[j]) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      filteredData.push(data[i]);
    }
  }


 
  output += "\nFiltered:\n";

  for (let i = 0; i < filteredData.length; i++) {
    // output += JSON.stringify(data[i]) + "\n\n";
    output += "id: " + filteredData[i] + "\n";
  }


  // Moja stranica
  const hostname = '127.0.0.1';
  const port = 3000;


  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end(output);
  });

  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}



// let rawdata = fs.readFileSync("test.json");
// console.log("raw data: " + rawdata);
// data = JSON.parse(rawdata);