import { getDataByUrl } from './xhttp.js?v4';

let list = document.getElementById('authors');
let counter = 1;
let current;
let grid;
let place;
let info;
let title;
let stars;
let position;
let pic;
let repos;

getDataByUrl("./data/authors.json", true).then(function (response) {

  if (list != undefined) {

    response.forEach(function (item) {

      current = document.createElement('a');
      current.setAttribute('class', 'author');
      current.setAttribute('href', item.url);

      grid = document.createElement('div');
      grid.setAttribute('class', 'row');

      place = document.createElement('div');
      place.setAttribute('class', 'col-4');
      place.setAttribute('style', 'border-right: 1px solid #333333; text-align: center; ');

      position = document.createElement('h2');
      position.textContent = '#' + counter;
      position.setAttribute('style', 'margin-top: 7px');

      pic = document.createElement('img');
      pic.setAttribute('src', item.pic);
      pic.setAttribute('style', 'width: 32px; border-radius: 45px; ');

      info = document.createElement('div');
      info.setAttribute('class', 'col');
      info.setAttribute('style', 'margin-top: 7px');

      title = document.createElement('p');
      title.textContent = item.name;

      stars = document.createElement('small');
      stars.textContent = '⭐' + item.stars;

      repos = document.createElement('small');
      repos.textContent = '📒' + item.repos;
      repos.setAttribute('style', 'margin-left: 7px');

      place.appendChild(position);
      place.appendChild(pic);
      info.appendChild(title);
      info.appendChild(stars);
      info.appendChild(repos);
      grid.appendChild(place);
      grid.appendChild(info);
      current.appendChild(grid);
      list.appendChild(current);

      counter++;

    });

  }

});