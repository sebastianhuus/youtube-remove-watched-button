import { getFromStorage, setInStorage } from './storage_utilities.js';

document.getElementById("save").addEventListener("click", async () => {
    const isDebuggingEnabled = document.getElementById("debug-mode").checked;

    // Save the checkbox value in storage
    await setInStorage("isDebuggingEnabled", isDebuggingEnabled);
    document.getElementById("status").innerHTML = "Settings saved!";
    setTimeout(() => {
        document.getElementById("status").innerHTML = "";
    }, 5000);
});

document.addEventListener("DOMContentLoaded", async () => {
    const isDebuggingEnabled = await getFromStorage("isDebuggingEnabled", false);
    document.getElementById("debug-mode").checked = isDebuggingEnabled;
});