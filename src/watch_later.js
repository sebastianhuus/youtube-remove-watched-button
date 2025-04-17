// This is a content script that injects our module script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.type = 'module';
document.head.appendChild(script);

console.log("YouTube Watched Extension Content Script loaded");


// Add message listener for storage operations
window.addEventListener('message', async (event) => {
    // Make sure the message is from our injected script
    if (event.source != window || !event.data.type) return;
    
    if (event.data.type === 'getFromStorage') {
        try {
            chrome.storage.sync.get(event.data.key, (result) => {
                window.postMessage({
                    type: 'storageResponse',
                    id: event.data.id,
                    value: result[event.data.key] !== undefined ? result[event.data.key] : event.data.defaultValue
                }, '*');
            });
        } catch (err) {
            console.error("Storage error:", err);
            window.postMessage({
                type: 'storageResponse',
                id: event.data.id,
                value: event.data.defaultValue,
                error: err.message
            }, '*');
        }
    } else if (event.data.type === 'setInStorage') {
        try {
            chrome.storage.sync.set({ [event.data.key]: event.data.value }, () => {
                window.postMessage({
                    type: 'storageResponse',
                    id: event.data.id,
                    success: true
                }, '*');
            });
        } catch (err) {
            console.error("Storage error:", err);
            window.postMessage({
                type: 'storageResponse',
                id: event.data.id,
                success: false,
                error: err.message
            }, '*');
        }
    }
});