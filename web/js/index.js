import { getDataByUrl } from './xhttp.js?v4';

let totalcounter = document.getElementById('totalcounter');
let starscounter = document.getElementById('starscounter');
let authorscounter = document.getElementById('authorscounter');

getDataByUrl("https://openyellow.org/data/counters.json", true).then(function (response) {

  if (totalcounter != undefined) {
    totalcounter.textContent = response["totalcounter"];
  }

  if (starscounter != undefined) {
    starscounter.textContent = response["starscounter"];
  }

  if (authorscounter != undefined) {
    authorscounter.textContent = response["authorscounter"];
  }

});