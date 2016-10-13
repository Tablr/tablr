/*** Classes ***/
class Tab {
  constructor(id, url) {
    this.id = id;
    this.url = url;
  }
}

/* HELPER FUNCTIONS */
// Get base domain
const getBaseDomain = url => {
  // thanks to anubhava on Stack Overflow: http://stackoverflow.com/questions/25703360/regular-expression-extract-subdomain-domain
  let domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/im;
  let baseDomain = domainRegex.exec(url)[1];
  let baseDomainArr = baseDomain.split('.');

  return baseDomainArr[baseDomainArr.length - 2];
};

// Gather all urls and separate by domain
const getAllTabIds = windows => {
  const urls = { singles: [] };

  // Structuring our urls with base urls and all their associated tabs
  windows.forEach(window => {
    window.tabs.forEach(tab => {
      // Get the base domain for the url
      // Ex. 'http://meta.stackoverflow.com/test' --> 'stackoverflow'
      const baseDomain = getBaseDomain(tab.url);

      // Update our urls with base domains and all associated Tabs
      if (!urls[baseDomain]) urls[baseDomain] = [];
      urls[baseDomain].push(new Tab(tab.id, baseDomain));
    });
  });

  // After updating our urls, we will have a bunch of single base domains
  // By design, we will push all of these to a single key
  for (let base in urls ) {
    if (urls[base].length <= 1 && base !== 'singles') {
      urls.singles.push(urls[base][0]);
      delete urls[base];
    }
  }

  return urls;
};

/**********************************************************************/
// We need super wrapper that does the initial gather of our data
// that everything will use
new Promise((resolve, reject) => {
  // Sets window filter options
  const windowOptions = {
    populate: true,
    windowTypes: [ 'normal' ]
  };

  chrome.windows.getAll(windowOptions, windows => {
    resolve(getAllTabIds(windows));
  });
}).then(superO => {
  // super --> { baseDomain: [Tab] }
  // Use the index to handle what preview render function to run
  let selectedOption;

  /* FEATURES */
  // Default functionality - sort tabs by base domain
  const sortTabsByBaseDomain = () => {
    for (let base in superO) {
      // We need to get the first tab to set as the first tab in the new window
      const firstTab = superO[base].pop();

      // We should check for when there are no single domains
      if (!firstTab) continue;

      chrome.windows.create({ tabId: firstTab.id }, window => {
        // Set up the array of tabs to move to the new window
        const arrOfTabs = superO[base].map(tab => tab.id);
        chrome.tabs.move(arrOfTabs, { windowId : window.id, index : -1 });
      });
    }
  };

  // On button click, it should sort our tabs
  // TODO: refactor so callback is dynamic
  const organizeTabsBtnEl = document.getElementById('organize-tab-btn');
  organizeTabsBtnEl.addEventListener('click', () => {
    switch (selectedOption) {
      case 1:
        break;
      default:
        sortTabsByBaseDomain();
    }
  });

  // Listens to option changes
  // Each option change should render a preview
  const organizeTypeDropdownEl = document.getElementById('organize-type-dropdown');
  organizeTypeDropdownEl.addEventListener('change', () => {
    const contentEl = document.getElementById('content');

    // We need to reset our content div
    // const oldEl = document.getElementById('preview-list');
    // if (oldEl) contentEl.removeChild(oldEl);

    // Use the index to handle what preview render function to run
    selectedOption = organizeTypeDropdownEl.selectedIndex;

    switch (selectedOption) {
      case 0:
        contentEl.innerHTML = '';
        break;
      case 1:
        // The tags we should tag our root domains with
        // TODO: Our tagData should ultimately be located in local storage or cloud storage
        const tagData = {
          developer : [ 'stackoverflow', 'github', 'stackexchange', 'promisesaplus', 'chaijs' ],
          social: [ 'facebook' ],
          news: [ 'nbc', 'yahoo' ]
        };

        // Restructure our data to have tags
        // TODO: This data will need to persist in local storage or the cloud
        const taggedDomains = {};

        // Simply goes through each url and tag it
        for (let base in superO) {
          superO[base].forEach(tab => {
            for (let tag in tagData) {
              if (tagData[tag].includes(tab.url)) {
                taggedDomains[tab.url] = tag;
                break;
              }
              else taggedDomains[tab.url] = 'untagged';
            }
          });
        }

        // Append a list of tagged items
        const taggedDomainListEl = document.createElement('ul');
        taggedDomainListEl.id = 'preview-list';
        taggedDomainListEl.className = 'list-group';

        for (let domain in taggedDomains) {
          // Skip unknown domains
          if (domain === 'undefined') continue;

          const taggedDomainListItemEl = document.createElement('li');
          taggedDomainListItemEl.className = 'list-group-item';

          const taggedDomainListItemSpanEl = document.createElement('span');
          taggedDomainListItemSpanEl.className = 'tag tag-default tag-pill pull-xs-right';
          taggedDomainListItemSpanElText = document.createTextNode(taggedDomains[domain]);
          taggedDomainListItemSpanEl.appendChild(taggedDomainListItemSpanElText);
          taggedDomainListItemEl.appendChild(taggedDomainListItemSpanEl);

          const textNode = document.createTextNode(domain);
          taggedDomainListItemEl.appendChild(textNode);
          taggedDomainListEl.appendChild(taggedDomainListItemEl);
        }

        contentEl.appendChild(taggedDomainListEl);
        break;
      }
  });
});

function sortTabsByTags(windows){
  let urls = getAllTabIds(windows);
}
