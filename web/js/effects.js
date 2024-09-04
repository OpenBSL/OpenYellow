import { getCookie } from './xhttp.js?v4';

function setPreloaderEvent() {

  let links = document.getElementsByTagName("a");


  for (var i = 0; i < links.length; i++) {

    if (links[i].href == document.URL) {
      links[i].classList.add('active');
    }

    if (!links[i].onclick) {
      links[i].onclick = function (event) {
        try {
          event.preventDefault();
          if (this != undefined
            && this.href != undefined
            && this.baseURI != this.href
            && this.href.search('#') == -1
            && this.target != "_blank") {


            let href = this.href;


            for (var i = 0; i < links.length; i++) {

              if (links[i] != this) {
                links[i].classList.remove('active');
              }

            }

            event.stopPropagation();
            showPreloader();

            setTimeout(function () {

              window.location.href = href;

            }, 600);

          }
          else {
            window.location.href = this.href;
          }
        }

        catch {
          window.location.href = this.href;
        }

      };
    }
  }

}


function showPreloader() {
  const content = document.getElementById('content');
  content.style.opacity = "0";
}

function showMessage(text, style) {

  let content = document.getElementById('content');
  let b = document.createElement('div');
  b.innerHTML = text;
  b.classList.add('alert');
  b.classList.add('alert-' + style);
  b.classList.add('message');

  document.body.append(b);

  setTimeout(() => {
    b.style.display = 'none';
  }, "6100");


}

export { setPreloaderEvent }
export { showMessage }