
let windowOptions = {populate: true, windowTypes: ['normal']};

const organizeTabsBtnEl = document.getElementById('organize-tab-btn');
organizeTabsBtnEl.addEventListener('click', organizeTabs);

const organizeTypeDropdownEl = document.getElementById('organize-type-dropdown');
organizeTypeDropdownEl.addEventListener('change', () => {
  const selectedOption = organizeTypeDropdownEl.selectedIndex;
  let tagData = {
    developer : [ "stackoverflow", "github", "stackexchange", "promisesaplus"]
  }
  chrome.windows.getAll(windowOptions, (windows)=>{
    let data = getAllTabIds(windows);
    let taggedDomains = {};
    console.log(data);
    for( let domain in data ){
      console.log(domain);
      if(domain === "singles"){ //=============
        data[domain].forEach(function(domain){
          console.log(`singles domain: ${domain.tabUrl}`);
          let tagFound = false;
          for( let tag in tagData ){
            if(tagData[tag].includes(domain.tabUrl)){
              console.log(`found tag for domain.`);
              tagFound = !tagFound;
              taggedDomains[domain.tabUrl] = tag;
              break;
            }
          }
          if(!tagFound) taggedDomains[domain.tabUrl] = "untagged", console.log(`saving untagged domain`);
        });
      } //======================================
      console.log(`checking domain ${domain}`);
      let tagFound = false;
      for( let tag in tagData ){//==========
        console.log(data[domain]);
        if(tagData[tag].includes(data[domain][0].tabUrl)){
          console.log(`found tag for domain.`);
          tagFound = !tagFound;
          taggedDomains[data[domain][0].tabUrl] = tag;
          break;
        }
      }//===================================
      if(!tagFound) taggedDomains[data[domain][0].tabUrl] = "untagged", console.log(`saving untagged domain`);
    }
    console.log(taggedDomains);

    let contentEl = document.getElementById("content");
    let taggedDomainListEl = document.createElement("ul");
    for(let domain in taggedDomains){
      let taggedDomainListItemEl = document.createElement("li");
      let textNode = document.createTextNode(`${domain}: ${taggedDomains[domain]}`);
      taggedDomainListItemEl.appendChild(textNode);
      taggedDomainListEl.appendChild(taggedDomainListItemEl);
    }
    contentEl.appendChild(taggedDomainListEl);
  });

});

// chrome.browserAction.onClicked.addListener(()=>{
//   organizeTabs();
// });



function organizeTabs() {
  chrome.windows.getAll(windowOptions, (windows)=>{
    let data = getAllTabIds(windows);
    sortTabsToWindows(data);
  });
}

function sortTabsByTags(windows){
  let urls = getAllTabIds(windows);
}

function sortTabsToWindows(urls){
  //let urls = getAllTabIds(windows);
  for(let url in urls){
    if(url === "singles" && urls[url].length === 0){
      continue;
    }
    let firstTab = urls[url].shift();
    console.log("creating new window with key: " + url);
    console.log(urls[url]);
    chrome.windows.create({tabId:firstTab.tabId}, (window) => {
      let arr = urls[url].map(obj => obj.tabId);
      chrome.tabs.move(arr, {windowId : window.id, index : -1});
    });
  }
  console.log(urls);
}

/* helper functions */
function getAllTabIds(windows){
  let urls = {singles:[]};
  console.log("getAllTabIds");
  console.log(windows);
  console.log(windows.length);
  windows.forEach(function(window){
    window.tabs.forEach(function(tab){
      if(tab.url === "chrome://extensions/"){
        return;
      }
      if(!urls[getBaseDomain(tab.url)]){
        urls[getBaseDomain(tab.url)] = [];
      }
      console.log({tabId: tab.id, tabUrl: getBaseDomain(tab.url)});
      urls[getBaseDomain(tab.url)].push({tabId: tab.id, tabUrl: getBaseDomain(tab.url)})
    });
  });
  for( let url in urls ){
    if(urls[url].length <= 1 && url !== "singles"){
      urls["singles"] = urls["singles"].concat(urls[url]);
      delete urls[url];
    }
  }
  return urls;
}
function getBaseDomain(url){
  // thanks to anubhava on Stack Overflow: http://stackoverflow.com/questions/25703360/regular-expression-extract-subdomain-domain
  let domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
  let baseDomain = domainRegex.exec(url)[1];
  let baseDomainArr = baseDomain.split('.');

  return baseDomainArr[baseDomainArr.length - 2];
}
