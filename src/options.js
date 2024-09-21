// browser compatibility
const storage =
    typeof browser !== "undefined" ? browser.storage : chrome.storage;

document.getElementById("save").addEventListener("click", function () {
    const isChecked = document.getElementById("debug-mode").checked;

    // Save the checkbox value in storage
    storage.sync.set({ isDebuggingEnabled: isChecked }, function () {
        document.getElementById("status").innerHTML = "Settings saved!";
        setTimeout(() => {
            document.getElementById("status").innerHTML = "";
        }, 5000);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    storage.sync.get("isDebuggingEnabled", function (data) {
        document.getElementById("debug-mode").checked =
            data.isDebuggingEnabled || false;
    });
});
