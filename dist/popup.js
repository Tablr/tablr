(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const helpers = require('./shared/helpers.js');

console.log(helpers);

const EXTENSION_ID = 'ljpbgjanncoihbfakkppncfoghpmkpno';

// Listens to option changes
// Each option change should render a preview
const organizeTypeDropdownEl = document.getElementById('organize-type-dropdown');
// organizeTypeDropdownEl.addEventListener('change', () => {
//   const contentEl = document.getElementById('content');
//
//   // Use the index to handle what preview render function to run
// selectedOption = organizeTypeDropdownEl.selectedIndex;
//
//   switch (selectedOption) {
//     case 0:
//       contentEl.innerHTML = '';
//       break;
//     case 1:
//       const taggedDomains = getTaggedDomains();
//
//       // Append a list of tagged items
//       const taggedDomainListEl = document.createElement('ul');
//       taggedDomainListEl.id = 'preview-list';
//       taggedDomainListEl.className = 'list-group';
//
//       for (let domain in taggedDomains) {
//         // Skip unknown domains
//         if (domain === 'undefined') continue;
//
//         const taggedDomainListItemEl = document.createElement('li');
//         taggedDomainListItemEl.className = 'list-group-item';
//
//         const taggedDomainListItemSpanEl = document.createElement('span');
//         taggedDomainListItemSpanEl.className = 'tag tag-default tag-pill pull-xs-right';
//         taggedDomainListItemSpanElText = document.createTextNode(taggedDomains[domain]);
//         taggedDomainListItemSpanEl.appendChild(taggedDomainListItemSpanElText);
//         taggedDomainListItemEl.appendChild(taggedDomainListItemSpanEl);
//
//         const textNode = document.createTextNode(domain);
//         taggedDomainListItemEl.appendChild(textNode);
//         taggedDomainListEl.appendChild(taggedDomainListItemEl);
//       }
//
//       contentEl.appendChild(taggedDomainListEl);
//       break;
//     }
// });


// On button click, it should sort our tabs
// TODO: refactor so callback is dynamic
const organizeTabsBtnEl = document.getElementById('organize-tab-btn');
let selectedOption = organizeTypeDropdownEl.selectedIndex;

organizeTabsBtnEl.addEventListener('click', () => {
  switch (selectedOption) {
    case 1:
      sortTabsByTagName();
      break;
    default:
      // sortTabsByBaseDomain();
      chrome.runtime.sendMessage(EXTENSION_ID, 'sortByBaseDomain');
  }
});

},{"./shared/helpers.js":2}],2:[function(require,module,exports){
const foo = () => 'bar';

module.exports = foo;

},{}]},{},[1]);
