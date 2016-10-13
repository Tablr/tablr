const organizeTabsBtnEl = document.getElementById('organize-tab-btn');
organizeTabsBtnEl.addEventListener('click', organizeTabs);

function organizeTabs() {
  let windowOptions = {populate: true, windowTypes: ['normal']};
  chrome.windows.getAll(windowOptions, sortTabsToWindows);
}

function sortTabsByTags(windows){
  let urls = getAllTabIds(windows);
}

function sortTabsToWindows(windows){
  let urls = getAllTabIds(windows);

  for(let url in urls){
    let firstTab = urls[url].shift();
    chrome.windows.create({tabId:firstTab}, (window) => {
      chrome.tabs.move(urls[url], {windowId : window.id, index : -1});
    });
  }
}

/* helper functions */
function getAllTabIds(windows){
  let urls = {singles:[]};
  windows.forEach(function(window){
    window.tabs.forEach(function(tab){
      if(!urls[getBaseDomain(tab.url)]){
        urls[getBaseDomain(tab.url)] = [];
      }
      urls[getBaseDomain(tab.url)].push(tab.id)
    });
  });
  for( let url in urls ){
    if(urls[url].length <= 1 && url !== "singles"){
      urls["singles"].push(urls[url][0]);
      delete urls[url];
    }
  }
  return urls;
}
function getBaseDomain(url){
  // thanks to anubhava on Stack Overflow: http://stackoverflow.com/questions/25703360/regular-expression-extract-subdomain-domain
  let domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
  return domainRegex.exec(url)[1];
}
