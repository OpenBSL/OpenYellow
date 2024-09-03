function getDataByUrl(url, isJson) {
 
  return new Promise(function(resolve, reject) {
   
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
    xhr.setRequestHeader('Expires', 'Thu, 1 Jan 1970 00:00:00 GMT');
    xhr.setRequestHeader('Pragma', 'no-cache');
  
    xhr.onload = function() {
      try{
      if (xhr.status === 200) 
      {
        var response = (isJson) ? JSON.parse(xhr.responseText) : xhr.responseText;
        resolve(response);
      } 
      
      else 
      {
        resolve(xhr.status);
      }
      
    }
    
    catch{
        var response = (isJson) ? xhr.responseText : JSON.parse(xhr.responseText);
        resolve(response);
    };
    };
    

  
    xhr.onerror = function() 
    {
      resolve(xhr.status);
    };
  
    xhr.send();
    
  });
}
 
 
function ping(url) {
  
  return new Promise(function(resolve, reject) {
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url , true);
    xhr.setRequestHeader('Athenaeum-Source', document.location.pathname);

    xhr.onload = function() {
      
      if (xhr.status === 200) 
      {
        resolve(true);
      } 
      else 
      {
        resolve(false);
      }
    };

    xhr.onerror = function() {
      resolve(false);
    };

    xhr.send();
  });
}


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}


function getCookie(name) {
  
  let cookies = document.cookie.split(';');
  
  for (var i = 0; i < cookies.length; i++) {
    
    let cookie = cookies[i].trim();
    
    if (cookie.indexOf(name + '=') === 0) 
    {
      return decodeURIComponent(cookie.substring(name.length + 1));
    }
    
  }
  return null;
}

 export{getDataByUrl};
 export{ping};
 export{uuidv4};
 export{getCookie};