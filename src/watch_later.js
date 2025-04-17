// This is a content script that injects our module script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.type = 'module';
document.head.appendChild(script);

console.log("YouTube Watched Extension Content Script loaded");