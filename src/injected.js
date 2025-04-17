import { getFromStorage, setInStorage, initializeStorage } from './storage_utilities.js';

// Initialize storage
initializeStorage();

// keep running so when new videos appear, ie. on page scroll, we add button to them as well
setInterval(() => {
    addButtons("ytd-playlist-video-renderer");
}, 2000);

const baseStyles = `
<style>
    .watched-button {
        position: absolute;
        right: 25px;
        background: none;
        border: none;
        cursor: pointer;
        opacity: 0.5;
        z-index: 1000;  /* Ensure buttons appear above other elements */
        font-size: 20px;  /* Make buttons more visible */
        padding: 5px;
    }
    .watched-button:hover {
        opacity: 1;
    }

    .btn-top {
        top: 45px;
    }

    .hide-popup {
        opacity: 0;
        display: none;
    }
</style>`;
document.head.insertAdjacentHTML("beforeend", baseStyles);

// Helper function to create SVG element with given path
function createSvgElement(pathD) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.style.fill = "currentColor";
    
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    svg.appendChild(path);
    
    return svg;
}

async function logger(...data) {
    const isDebuggingEnabled = await getFromStorage("isDebuggingEnabled");
    if (isDebuggingEnabled) {
        console.log("watch_later -", ...data);
    }
}

logger("YouTube Watched Extension Loaded");

async function addButtons(videoBoxSelector) {
    logger("Adding buttons. . .")
    const watchedButton = {
        onClick: actionWatched(
            "M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z"
        ),
        cssClass: "btn-top",
        svgPath: "M11 17H9V8h2v9zm4-9h-2v9h2V8zm4-4v1h-1v16H6V5H5V4h4V3h6v1h4zm-2 1H7v15h10V5z",
    };
    const buttonsToAdd = [watchedButton];

    try {
        const elements = document.querySelectorAll(videoBoxSelector);
        logger(`Found ${elements.length} ${videoBoxSelector} elements`);

        for (const videoBox of elements) {
            // Skip if this video already has our button
            if (videoBox.querySelector('.watched-button')) continue;

            // Ensure the container has relative positioning
            videoBox.style.position = "relative";

            // Create and append the button
            const button = document.createElement("button");
            button.classList.add("watched-button");
            button.classList.add(watchedButton.cssClass);
            
            // Append SVG instead of using textContent
            const svg = createSvgElement(watchedButton.svgPath);
            button.appendChild(svg);
            
            button.onclick = watchedButton.onClick;
            
            // Add the button to the container
            videoBox.appendChild(button);
            
            // Log successful addition
            logger(`Added button to ${videoBoxSelector} element`);
        }
    } catch (err) {
        console.error(err);
    }
}

function actionWatched(svgPath) {
    return (event) => {
        event.preventDefault();
        event.stopPropagation();

        // prevent popup from appearing when custom button is pressed
        const popupWrapper = document.querySelector("ytd-popup-container");
        popupWrapper.classList.add("hide-popup");
        event.target.parentElement
            .querySelector("#menu #button yt-icon")
            .click();

        // ..wait for popup to render using artificial delay
        setTimeout(async () => {
            const popupNode = popupWrapper.querySelector(
                `ytd-menu-popup-renderer #items`
            );
            if (!popupNode) {
                logger("Could not find popup menu in DOM");
                return;
            }
            let buttonChildIndex;
            const popupMenuChildren = Array.from(popupNode.children);
            for (let i = 0; i < popupMenuChildren.length; i++) {
                const childNode = popupMenuChildren[i];
                const svgCandidate = childNode.querySelector(
                    "ytd-menu-service-item-renderer tp-yt-paper-item yt-icon span div svg"
                );
                logger(childNode);
                logger(childNode.textContent.trim());
                logger(svgCandidate);
                if (!svgCandidate) continue;
                logger(svgCandidate.innerHTML);
                const isCandidateCorrectButton = svgCandidate.innerHTML
                    .trim()
                    .indexOf(svgPath);
                if (isCandidateCorrectButton >= 0) {
                    logger(`found button at index ${i}`);
                    buttonChildIndex = i;
                    break;
                }
            }

            if (!buttonChildIndex) {
                logger("Could not find button in DOM");
                return;
            }
            // nth-child css selector index is 1-based
            buttonChildIndex += 1;

            const watchedButton = popupWrapper.querySelector(
                `ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer:nth-child(${buttonChildIndex})`
            );

            if (watchedButton) {
                logger("clicking", watchedButton.textContent.trim());
                watchedButton.click();
            }
            popupWrapper.classList.remove("hide-popup");
        }, 100);

        return false;
    };
}
