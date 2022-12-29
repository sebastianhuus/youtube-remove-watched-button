window.onload = function()
{
    // keep running so when new videos appear, ie. on page scroll, we add button to them as well
    setInterval(function() {
        addNahBtn("ytd-rich-grid-media #details");
        addNahBtn("ytd-compact-video-renderer #dismissible .details");
    }, 2000);
    
    const baseStyles = `
    <style>
        .nah-btn {
            position: absolute;
            top: 45px;
            right: 0px;
            padding: 7px 0 7px 7px;
            background: none;
            border: none;
            cursor: pointer;
            opacity: 0.5;
        }
        .nah-btn:hover {
            opacity: 1;
        }
        .hide-popup {
            opacity: 0;
            display: none;
        }
    </style>`;
    document.head.insertAdjacentHTML('beforeend', baseStyles);
}

function addNahBtn(videoBoxSelector)
{
    try
    {
        document
        .querySelectorAll(videoBoxSelector)
        .forEach(function(vidBox)
        {
            if (vidBox.querySelector("button.nah-btn") != null) return;

            let nahBtn = document.createElement("button");
            nahBtn.classList.add("nah-btn");
            nahBtn.textContent = "👎";
            nahBtn.onclick = actionNah;
            vidBox.appendChild(nahBtn);
        });
    }
    catch (err)
    {
        console.error(err);
    }
}

function actionNah(event)
{
    event.preventDefault();
    event.stopPropagation();

    // prevent popup from appearing when custom button is pressed
    let popupWrapper = document.querySelector("ytd-popup-container");
    popupWrapper.classList.add("hide-popup");
    event.target.parentElement.querySelector("#menu #button yt-icon").click();

    // ..wait for popup to render
    setTimeout(function()
    {
        let notInterestedBtn = popupWrapper.querySelector("ytd-menu-popup-renderer #items > ytd-menu-service-item-renderer:nth-child(6)");
        if (notInterestedBtn) notInterestedBtn.click();
        popupWrapper.classList.remove("hide-popup");
    }, 10);

    return false;
}