// Storage utilities
let storage;
try {
    storage = typeof browser !== "undefined" ? browser.storage : chrome.storage;
} catch (err) {
    console.error("Failed to initialize storage", err);
}

export async function getFromStorage(key, defaultValue = false) {
    return new Promise((resolve, reject) => {
        try {
            storage.sync.get(key, (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result[key] !== undefined ? result[key] : defaultValue);
                }
            });
        } catch (err) {
            console.error("Storage error:", err);
            resolve(defaultValue);
        }
    });
}

export function setInStorage(key, value) {
    return new Promise((resolve, reject) => {
        try {
            storage.sync.set({ [key]: value }, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            console.error("Storage error:", err);
            reject(err);
        }
    });
}

// Initialize storage with default values
export async function initializeStorage() {
    const isDebuggingEnabled = await getFromStorage("isDebuggingEnabled");
    if (isDebuggingEnabled === undefined) {
        await setInStorage("isDebuggingEnabled", true);
        console.log("Initialized debugging mode");
    }
}