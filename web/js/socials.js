import { getDataByUrl }   from './xhttp.js?v4';
import { getCookie }      from './xhttp.js?v4';
import { uuidv4 }         from './xhttp.js?v4';
import { ping }           from './xhttp.js?v4';

var params  = (new URL(document.location)).searchParams;
var from    = params.get("from");

function generateLinks(vk = true, tg = true, existing = ""){
  returnSession(existing).then(function(success)
  {
    let session = success;
    
    if(from){ session += '_' + from;}
  
    if (tg){ telegramLogin(session);}
    if (vk){ vkLogin(session);}
  });

}

function telegramLogin(session){
  
  let element = document.getElementById('telegram-login');
  
  if (!element) 
  {
    setTimeout(telegramLogin, 100);
    return;
  }
  
  element.href      =  ('https://t.me/aioniotisbot?start=' + session);   
  
}


function vkLogin(session){
 
 let element = document.getElementById('vk-login');
 
  if (!element) 
  {
    setTimeout(telegramLogin, 100);
    return;
  }

  element.href      =  ('https://oauth.vk.com/authorize?client_id=51654824&display=page&redirect_uri=https://api.athenaeum.digital/node/bot/vk_login?uuid=' + session + '&response_type=code&v=5.131'); 

}


function returnSession(existing = ""){
 
  return new Promise(function(resolve, reject) {
    
    if (existing != ""){
     resolve(existing); 
     return;
    }
    
    let d     = new Date();
    let uuid  = uuidv4();
    let session;
    let expires;
    
    ping('https://api.athenaeum.digital/node/bot/site_session?cookie=' + uuid).then(function(success)
    {
      
      if(success)
      {
        
        d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 дней
        
        expires         = "expires=" + d.toUTCString();
        document.cookie = "uuid=" + uuid + ";" + expires + ";max-age:31536000;path=/";
        session         = getCookie("uuid");
        
      }
      
      else
      {
        session = returnSession();  
      }   
        
      resolve(session);
      
    });
  });  
}

export{generateLinks}