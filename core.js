let raise = false;
let btn, baseElement, hand, delay;
const defaultId = 8;

setTimeout(function () {
    load();
}, 6000);//6sec

function load() {
    console.info("Loading BigBlueButton+");
    document.title = "BigBlueButton+ Videokonferenz";
    btn = document.createElement("button");
    btn.innerHTML = '<svg height="24" width="24" id="hand" viewBox="0 0 32 32" style="margin-left: -3px"><path d="M30.688 7.313v19.375c0 2.938-2.438 5.313-5.375 5.313h-9.688a5.391 5.391 0 01-3.813-1.563L1.312 19.75S3 18.125 3.062 18.125a1.7 1.7 0 011.063-.375c.313 0 .563.063.813.188.063 0 5.75 3.25 5.75 3.25V5.313c0-1.125.875-2 2-2s2 .875 2 2v9.375h1.313V2c0-1.125.875-2 2-2s2 .875 2 2v12.688h1.313V3.313c0-1.125.875-2 2-2s2 .875 2 2v11.375h1.375V7.313c0-1.125.875-2 2-2s2 .875 2 2z"></path></svg>';
    btn.style = "background: white; cursor: pointer;border: 2px solid white;border-radius: 50px;";
    btn.onclick = toggle;
    btn.title = "Hand heben";
    baseElement = document.getElementsByClassName("buttonWrapper--x8uow button--295UAi")[0];
    baseElement.parentElement.append(btn);
    hand = document.getElementById("hand");
    setTimeout(function () {
        baseElement.addEventListener('click', unmuteClear);
    }, 30000);//30sec
}

function startAutoTimeout() {
    delay = setTimeout(function () {
        if (confirm("Du streckst seit 3min \nHand herunternehmen?")) {
            lowerHand();
        }
    }, 180000);//3min
}

function unmuteClear() {
    if (baseElement.children[0].children[0].classList.contains("icon-bbb-mute")) {
        clearTimeout(delay);
        lowerHand();
    }
}

function toggle() {
    if (!raise) {
        //raise hand
        document.getElementsByClassName("item--yl1AH")[6].click();
        document.getElementsByClassName("item--yl1AH")[getItem()].click();
        btn.title = "Hand herunternehmen";
        hand.style.fill = "#0F70D7";
        raise = true;
        startAutoTimeout();
    } else {
        lowerHand();
        clearTimeout(delay);
    }
}

function lowerHand() {
    //clear
    document.getElementsByClassName("item--yl1AH")[7].click();
    btn.title = "Hand heben";
    hand.style.fill = "black";
    raise = false;
}

function getItem() {
    let fromLocal = localStorage.getItem("bbb_plus_id");
    if (fromLocal !== null && !isNaN(parseInt(fromLocal))) {
        return parseInt(fromLocal);
    } else {
        return defaultId;
    }
}