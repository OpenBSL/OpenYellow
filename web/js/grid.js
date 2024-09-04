import { getDataByUrl }     from './xhttp.js?v4';

let gridApi;
let filterInput = document.getElementById('filterbox');
let title = document.getElementById('title');
let description = document.getElementById('description');
let current = document.getElementById('selectedRows');
let params   = new URL(document.location.toString()).searchParams;
let dataname = params.get("data");

let currentTitle = document.getElementById('currentTitle');
let currentPic = document.getElementById('currentPic');
let currentStars = document.getElementById('currentStars');
let currentForks = document.getElementById('currentForks');
let currentDescription = document.getElementById('currentDescription');
let currentAuthor = document.getElementById('currentAuthor');


if (dataname == undefined){
 dataname = "top"; 
}


class picRender {

 init(params) {
   let companyLogo = document.createElement('img');
   companyLogo.src = params.data.pic;
   companyLogo.setAttribute('style', 'display: block; width: 25px; height: 25px; border-radius: 30px; margin-right: 12px; filter: brightness(1.1); box-shadow:rgba(0,0,0,.40) 0px 5px 10px;');
   let companyName = document.createElement('p');
   companyName.textContent = params.value;
   
   companyName.setAttribute('style', 'text-overflow: ellipsis; overflow: hidden; white-space: nowrap;');
   this.eGui = document.createElement('a');
   this.eGui.setAttribute('href', params.data.url);
   this.eGui.setAttribute('style', 'display: flex; height: 100%; width: 100%; align-items: center');
   this.eGui.appendChild(companyLogo)
   this.eGui.appendChild(companyName)
 }

 getGui() {
   return this.eGui;
 }

 refresh(params) {
   return false
 }
}

class dynamicRender {

 init(params) {
   this.eGui = document.createElement('img');
   
   this.eGui.src = '/static/' + params.value + '.png';
   this.eGui.setAttribute('style', 'display: block; width: 25px; height: 25px; border-radius: 30px; margin-right: 12px; filter: brightness(1.1)');
 }

 // Required: Return the DOM element of the component, this is what the grid puts into the cell
 getGui() {
   return this.eGui;
 }

 // Required: Get the cell to refresh.
 refresh(params) {
   return false
 }
}

const gridOptions = {
  
    pagination: true,
    paginationPageSize: 50,
    paginationPageSizeSelector: [50, 100, 500],
    
        autoSizeStrategy: {
        type: 'fitCellContents'
        },
    
 rowData: [],
 columnDefs: [],
 
  rowSelection: "single",
  onSelectionChanged: onSelectionChanged,
  
    onPaginationChanged: (params) => {
    if (params.newPage) {
      let currentPage = params.api.paginationGetCurrentPage();    
      let pageSize = params.api.paginationGetPageSize();
      
      params.api.forEachNode(node=> node.rowIndex - (currentPage * pageSize) ? 0 : node.setSelected(true));


      localStorage.setItem('currentPage' + dataname, JSON.stringify(currentPage));
    }
  },
  
  onFirstDataRendered: (params) => {
    const pageToNavigate = JSON.parse(localStorage.getItem('currentPage' + dataname));
    params.api.paginationGoToPage(pageToNavigate);
  },
};

function onSelectionChanged() {
  const selectedRows = gridApi.getSelectedRows();
  
  if (selectedRows.length === 1 && current != undefined) {
    

    currentPic.setAttribute("src", selectedRows[0].pic);
    currentTitle.textContent = selectedRows[0].name;
    currentTitle.setAttribute("href", selectedRows[0].url);
    currentDescription.textContent = selectedRows[0].description;
    currentAuthor.textContent = selectedRows[0].author;
    currentAuthor.setAttribute("href", selectedRows[0].authorUrl);
    currentStars.textContent = "⭐"+ selectedRows[0].stars;
    currentForks.textContent = "🍴" + selectedRows[0].forks;
     
  }
}

if(filterInput != undefined) {
  
  filterInput.addEventListener('input', function() {
      gridApi.setGridOption(
        "quickFilterText",
        filterInput.value,
      );
  });

}

if (dataname == "top"){
  gridOptions["columnDefs"] = [ 
   { headerName: "🏆"           , field: "place", filter: false, cellDataType: 'number', maxWidth: 64},
   { headerName: "⭐"          , field: "stars", filter: true, cellDataType: 'number'},
   { headerName: "Наименование", field: "name", filter: true, cellRenderer: picRender},
   { headerName: "URL"         , field: "url", filter: true, hide: true},
   { headerName: "Описание"    , field: "description", filter: true},
   { headerName: "Автор"       , field: "author", filter: true},
   { headerName: "URL"       , field: "authorUrl", filter: true},
   { headerName: "Язык"        , field: "lang", filter: true},
   { headerName: "Тэги"        , field: "tags", filter: true},
   
   { headerName: "🍴"          , field: "forks", filter: true, cellDataType: 'number'},
   { headerName: "🔼"          , field: "dynamic", filter: false, maxWidth: 64, cellRenderer: dynamicRender},
   { headerName: "📈"          , field: "changing", filter: false, cellDataType: 'number', maxWidth: 64},
   { headerName: "Создан"      , field: "createddate", filter: true, cellDataType: 'date', valueFormatter: dateFormatter},
   { headerName: "Обновлен"    , field: "updateddate", filter: true, cellDataType: 'date', valueFormatter: dateFormatter},
   { headerName: "Лицензия"    , field: "license", filter: true},
   { headerName: "Значок"      , field: "badge", filter: true, editable:true},
   {field: "pic", hide: true}
  ]
}
else if (dataname == "new"){
  gridOptions["columnDefs"] = [ 
   { headerName: "Создан"      , field: "createddate", filter: true, cellDataType: 'date', valueFormatter: dateFormatter},
   { headerName: "Наименование", field: "name", filter: true, cellRenderer: picRender},
   { headerName: "⭐"          , field: "stars", filter: true, cellDataType: 'number'},
   { headerName: "🍴"          , field: "forks", filter: true, cellDataType: 'number'},
   { headerName: "URL"         , field: "url", filter: true, hide: true},
   { headerName: "Описание"    , field: "description", filter: true},
   { headerName: "Автор"       , field: "author", filter: true},
   { headerName: "URL"       , field: "authorUrl", filter: true},
   { headerName: "Язык"        , field: "lang", filter: true}, 
   { headerName: "Обновлен"    , field: "updateddate", filter: true, cellDataType: 'date', valueFormatter: dateFormatter},
   { headerName: "Лицензия"    , field: "license", filter: true},
   {field: "pic", hide: true}
  ]
}
else{
  gridOptions["columnDefs"] = [   
   { headerName: "Обновлен"    , field: "updateddate", filter: true, cellDataType: 'date', valueFormatter: dateFormatter},
   { headerName: "Наименование", field: "name", filter: true, cellRenderer: picRender},
   { headerName: "⭐"          , field: "stars", filter: true, cellDataType: 'number'},
   { headerName: "🍴"          , field: "forks", filter: true, cellDataType: 'number'},
   { headerName: "URL"         , field: "url", filter: true, hide: true},
   { headerName: "Описание"    , field: "description", filter: true},
   { headerName: "Автор"       , field: "author", filter: true},
   { headerName: "URL"       , field: "authorUrl", filter: true},
   { headerName: "Язык"        , field: "lang", filter: true}, 
   { headerName: "Создан"      , field: "createddate", filter: true, cellDataType: 'date', valueFormatter: dateFormatter},
   { headerName: "Лицензия"    , field: "license", filter: true},
   {field: "pic", hide: true}
  ] 
}

function yyyymmdd(item) {
  
  var dt = new Date(item);
  var mm = dt.getMonth() + 1; // getMonth() is zero-based
  var dd = dt.getDate();

  return [
          (dd>9 ? '' : '0') + dd,
          (mm>9 ? '' : '0') + mm,
          dt.getFullYear()
         ].join('-');
}

function dateFormatter(params) {
  return yyyymmdd(params.value);
}

getDataByUrl("https://openyellow.org/data/" + dataname + ".json", true).then(function(response)
{

  gridOptions["rowData"] = response["data"];
  
  if(title != undefined){
   title.textContent = response["title"];
  }
  
  if(description != undefined){
   description.textContent = response["description"];
  }
  
  const myGridElement = document.querySelector('#myGrid');
  gridApi = agGrid.createGrid(myGridElement, gridOptions);
  gridApi.forEachNode(node=> node.rowIndex ? 0 : node.setSelected(true));
  
  
});


