// keep running so when new videos appear, ie. on page scroll, we add button to them as well
setInterval(() => {
    addNahBtns("ytd-rich-grid-media #details");
    addNahBtns("ytd-compact-video-renderer #dismissible .details");
}, 2000);

const baseStyles = `
<style>
    .nah-btn {
        position: absolute;
        right: 0px;
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.5;
    }
    .nah-btn:hover {
        opacity: 1;
    }

    .btn-top {
        top: 45px;
    }

    .btn-bottom {
        top: 65px;
    }

    .hide-popup {
        opacity: 0;
        display: none;
    }
</style>`;
document.head.insertAdjacentHTML("beforeend", baseStyles);

// browser compatibility
const storage =
    typeof browser !== "undefined" ? browser.storage : chrome.storage;

function getFromStorage(key) {
    return new Promise((resolve, reject) => {
        storage.sync.get(key, (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(result[key]);
            }
        });
    });
}

async function logger(message) {
    const isDebuggingEnabled = await getFromStorage("isDebuggingEnabled");
    if (isDebuggingEnabled) {
        console.log("nah -", message);
    }
}

async function addNahBtns(videoBoxSelector) {
    const nahButton = {
        onClick: actionNah(6), // not interested is 6th in popup menu list
        cssClass: "btn-top",
        textContent: "👎",
    };
    const channelButton = {
        onClick: actionNah(7), // dont recommend channel is 7th in popup menu list
        cssClass: "btn-bottom",
        textContent: "❌",
    };
    const btnsToAdd = [];
    const shouldHideNahButton = await getFromStorage("shouldHideNahButton");
    const shouldHideChannelButton = await getFromStorage(
        "shouldHideChannelButton"
    );
    if (!shouldHideNahButton) {
        btnsToAdd.push(nahButton);
    }
    if (!shouldHideChannelButton) {
        btnsToAdd.push(channelButton);
    }

    try {
        for (const btnToAdd of btnsToAdd) {
            document.querySelectorAll(videoBoxSelector).forEach((vidBox) => {
                if (vidBox.querySelector(`button.${btnToAdd.cssClass}`) != null)
                    return; // if this vidBox has buttons already, can return early

                const button = document.createElement("button");
                button.classList.add("nah-btn");
                button.classList.add(btnToAdd.cssClass);
                button.textContent = btnToAdd.textContent;
                button.onclick = btnToAdd.onClick;
                vidBox.appendChild(button);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function actionNah(cssChildNum) {
    return (event) => {
        event.preventDefault();
        event.stopPropagation();

        // prevent popup from appearing when custom button is pressed
        const popupWrapper = document.querySelector("ytd-popup-container");
        popupWrapper.classList.add("hide-popup");
        event.target.parentElement
            .querySelector("#menu #button yt-icon")
            .click();

        // ..wait for popup to render
        setTimeout(function () {
            // show list of nodes in popup for debugging
            const popupNode = popupWrapper.querySelector(
                `ytd-menu-popup-renderer #items`
            );
            if (popupNode) {
                const textContent = Array.from(popupNode.childNodes).map(
                    (childNode) => {
                        return childNode.textContent.trim();
                    }
                );
                logger(textContent);
            }

            const notInterestedBtn = popupWrapper.querySelector(
                `ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer:nth-child(${cssChildNum})`
            );

            if (notInterestedBtn) notInterestedBtn.click();
            popupWrapper.classList.remove("hide-popup");
        }, 10);

        return false;
    };
}
