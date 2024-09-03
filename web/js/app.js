import { getDataByUrl }     from './xhttp.js?v4';
import { ping }             from './xhttp.js?v4';
import { getCookie }        from './xhttp.js?v4';
import { setPreloaderEvent} from './effects.js?v4';

const content     = document.getElementById('content');
const sidebar     = document.getElementById('sidebar');
const vkbar       = document.getElementById('vk_groups');


window.addEventListener ('pageshow', function (event) {
  
    if (event.currentTarget.origin !== "https://oyw.neocities.org") // Compliant
    return;
  
  if (event.persisted) 
  {
    setOpacity();
  } 
  
});

standartOnLoad();

function standartOnLoad(){
  
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller != null && navigator.serviceWorker.controller.state != 'activated') 
        {
         navigator.serviceWorker.register('/sw.js').then(
           function(registration) {
             console.log('ServiceWorker registration successful with scope: ', registration.scope); 
             
             },
           function(err) {
             console.log('ServiceWorker registration failed: ', err);
           });
      
        }
  
    let sidebarCache = false;
    
    getDataByUrl('/blocks/sidebar.html', false).then(function(response)
    {

        if(sidebar != undefined)
        {
          sidebar.innerHTML = response;
          sidebar.style.display = 'flex';
          localStorage.setItem('navigation', sidebar.innerHTML);
        }
      
      
      const status      = document.getElementById("status");
      const info        = document.getElementById("statinfo");
      const profile     = document.getElementById('profilelink');
      

      setPreloaderEvent();
      setOpacity();  

    });        
}

function setOpacity(){
    content.style.opacity       = "1";
    
    if(vkbar){
     
    setTimeout(function() {  
       vkbar.style.opacity = "1";
       vkbar.style.transition = "opacity 1s ease-out";    
    }, 1800); 
    
    }
}

