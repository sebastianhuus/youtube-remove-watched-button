// keep running so when new videos appear, ie. on page scroll, we add button to them as well
setInterval(function () {
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

function addNahBtns(videoBoxSelector) {
    let btnsToAdd = [
        {
            onClick: actionNah(6), // not interested is 6th in popup menu list
            cssClass: "btn-top",
            textContent: "👎",
        },
        {
            onClick: actionNah(7), // dont recommend channel is 7th in popup menu list
            cssClass: "btn-bottom",
            textContent: "❌",
        },
    ];

    try {
        for (const btnToAdd of btnsToAdd) {
            document
                .querySelectorAll(videoBoxSelector)
                .forEach(function (vidBox) {
                    if (
                        vidBox.querySelector(`button.${btnToAdd.cssClass}`) !=
                        null
                    )
                        return; // if this vidBox has buttons already, can return early

                    let button = document.createElement("button");
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
        let popupWrapper = document.querySelector("ytd-popup-container");
        popupWrapper.classList.add("hide-popup");
        event.target.parentElement
            .querySelector("#menu #button yt-icon")
            .click();

        // ..wait for popup to render
        setTimeout(function () {
            let notInterestedBtn = popupWrapper.querySelector(
                `ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer:nth-child(${cssChildNum})`
            );
            if (notInterestedBtn) notInterestedBtn.click();
            popupWrapper.classList.remove("hide-popup");
        }, 10);

        return false;
    };
}
