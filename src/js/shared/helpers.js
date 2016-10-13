/*** Classes ***/
class Tab {
  constructor(id, url) {
    this.id = id;
    this.url = url;
  }
}

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


module.exports = {
  getBaseDomain,
  getAllTabIds,
};
