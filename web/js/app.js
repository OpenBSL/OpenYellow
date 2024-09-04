import { getDataByUrl } from './xhttp.js?v4';
import { setPreloaderEvent } from './effects.js?v4';

const content = document.getElementById('content');
const sidebar = document.getElementById('sidebar');

window.addEventListener('pageshow', function (event) {

  if (event.currentTarget.origin !== "https://oyw.neocities.org") // Compliant
    return;

  if (event.persisted) {
    setOpacity();
  }

});

standartOnLoad();

function standartOnLoad() {

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller != null && navigator.serviceWorker.controller.state != 'activated') {
    navigator.serviceWorker.register('/sw.js').then(
      function (registration) {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);

      },
      function (err) {
        console.log('ServiceWorker registration failed: ', err);
      });

  }

  function setOpacity() {
    content.style.opacity = "1";
  }


  getDataByUrl('/blocks/sidebar.html', false).then(function (response) {

    if (sidebar != undefined) {
      sidebar.innerHTML = response;
      sidebar.style.display = 'flex';
      localStorage.setItem('navigation', sidebar.innerHTML);
      setMenuEvent();
    }

    setPreloaderEvent();
    setOpacity();

  });
}


function setMenuEvent(){
 
 let menu       = document.getElementById('menu');
 let menubutton = document.getElementById('menubutton');
 let menulogo   = document.getElementById('menulogo');
 
 if (menu != undefined && menubutton != undefined){
 
   menu.style.display = "none";
   menubutton.onclick = function (event) {
     
     if(menu.style.display == "none")
     {
       
       menulogo.classList.remove("fa-cubes-stacked");
       menulogo.classList.add("fa-xmark");
       
       menu.style.display = "flex";
       setTimeout(function () {menu.style.opacity = "1"}, 10);
       

     }
     else
     {
       
       menulogo.classList.remove("fa-xmark");
       menulogo.classList.add("fa-cubes-stacked");
       
       menu.style.opacity = "0";
       setTimeout(function () {menu.style.display = "none"}, 300);

     }

     
   };
     
 }
 
}
