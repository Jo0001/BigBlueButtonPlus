let raise = false;
let btn, baseElement, hand, delay, cleanDelay, messageBar;
let user = [];
const defaultId = 8;

function init() {
    let counter = 0;
    let initTimer = setInterval(function () {
        baseElement = document.getElementsByClassName("buttonWrapper--x8uow button--295UAi")[0];
        if (typeof baseElement !== 'undefined') {
            clearInterval(initTimer);
            console.info("[BBB+] Loading BigBlueButton+");
            document.title = "BigBlueButton+ Videokonferenz";
            if (isMod()) {
                loadHandRaise(true);
                startObserver();
            } else {
                loadHandRaise(false);
            }

            loadMessageBar();

            //VOLUME CONTROL STUFF
            document.querySelector("audio").volume = getVolume();
            document.getElementsByClassName("left--18SBXP")[0].addEventListener("click", function () {
                if (document.getElementsByClassName("arrowLeft--1CFBz1 icon-bbb-left_arrow").length === 0) setTimeout(function () {
                    addVolumeControl();
                    addMessageBar()
                }, 100);
            });
            addVolumeControl();

            function addMessageBar() {
                document.getElementsByClassName("chatListItemLink--Z26YVGA")[0].addEventListener("click", function () {
                    if (typeof document.getElementsByClassName("chat--111wNM")[0] === "undefined") setTimeout(function () {
                        document.getElementsByClassName("chat--111wNM")[0].children[1].append(messageBar);
                    }, 100);
                });
            }

            mutationObserver.observe(document.getElementsByClassName("userAvatar--1GxXQi")[0], {
                attributes: true,
                childList: true,
                subtree: true
            });

        } else if (counter === 45) {
            clearInterval(initTimer);
            console.error("[BBB+] Couldn'messageBar load BigBlueButton+");
        } else {
            counter++;
        }
    }, 4000);//every 4sec
}

init();

function isMod() {
    return (document.getElementsByClassName("userAvatar--1GxXQi")[0].children[0].classList.contains("moderator--24bqCT") || document.getElementsByClassName("userAvatar--1GxXQi")[0].children[0].classList.contains("presenter--Z1INqI5"));
}

function loadHandRaise(invisible) {
    try {
        btn = document.createElement("button");
        btn.innerHTML = '<svg height="24" width="24" id="hand" viewBox="0 0 32 32" style="margin-left: -3px"><path d="M30.688 7.313v19.375c0 2.938-2.438 5.313-5.375 5.313h-9.688a5.391 5.391 0 01-3.813-1.563L1.312 19.75S3 18.125 3.062 18.125a1.7 1.7 0 011.063-.375c.313 0 .563.063.813.188.063 0 5.75 3.25 5.75 3.25V5.313c0-1.125.875-2 2-2s2 .875 2 2v9.375h1.313V2c0-1.125.875-2 2-2s2 .875 2 2v12.688h1.313V3.313c0-1.125.875-2 2-2s2 .875 2 2v11.375h1.375V7.313c0-1.125.875-2 2-2s2 .875 2 2z"></path></svg>';
        btn.style = "background: white; cursor: pointer;border: 2px solid white;border-radius: 50px;";
        btn.onclick = toggle;
        btn.title = "Hand heben";
        baseElement.parentElement.append(btn);
        hand = document.getElementById("hand");
        if (invisible) btn.style.display = "none";
    } catch (e) {
        console.error("[BBB+] Error on loadHandRaise() " + e);
    }
}

function loadMessageBar() {
    messageBar = document.createElement("div");
    messageBar.className = "systemMessage--ZYspJQ";
    messageBar.style.display = "none";
    document.getElementsByClassName("chat--111wNM")[0].children[1].append(messageBar);
}

function startObserver() {
    raiseObserver.observe(document.getElementsByClassName("list--Z2pj65C")[2], {
        attributes: true,
        subtree: true
    });
}

function startAutoTimeout() {
    let min = 2.5;
    delay = setInterval(function () {
        if (confirm("Du streckst seit " + min + "min \nHand herunternehmen?")) {
            clearInterval(delay)
            lowerHand();
        } else {
            min += 2.5;
        }
    }, 150000);//2,5min
}

function unmuteClear() {
    if (baseElement.children[0].children[0].classList.contains("icon-bbb-mute")) {
        clearInterval(delay);
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
        baseElement.addEventListener('click', unmuteClear);
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

function fakeLowerHand() {
    clearTimeout(delay);
    btn.title = "Hand heben";
    hand.style.fill = "black";
    raise = false;
}

const mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
            //mod/presenter change test
            if (mutation.target.classList.contains("avatar--Z2lyL8K") && !(mutation.target.classList.contains("moderator--24bqCT") || mutation.target.classList.contains("presenter--Z1INqI5"))) {
                btn.style.display = "block";
                messageBar.style.display = "none";
                raiseObserver.disconnect()
            } else {
                fakeLowerHand();
                btn.style.display = "none";
                startObserver();
            }
        } else if (mutation.type === "childList") {
            if (mutation.removedNodes.length > 0) {
                try {
                    //check if the hand was cleared from a foreign source
                    if (mutation.removedNodes.item(0).classList[0].startsWith("icon")) {
                        fakeLowerHand();
                    }
                } catch (ignored) {
                }
            }
        }
    });
});

const raiseObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.type === "attributes") {
            try {
                if (mutation.target.getAttribute("aria-label").includes("raiseHand")) {
                    let name = mutation.target.getAttribute("aria-label").split("   ")[0];
                    console.info(name + " has raised his hand");
                    if (user.indexOf(name) === -1) {
                        user.unshift(name);
                        if (user.length > 3) user.pop();
                    }
                    messageBar.innerHTML = user + " strecken derzeit";
                    messageBar.style.display = "block";
                    clearTimeout(cleanDelay);
                    cleanDelay = setTimeout(function () {
                        messageBar.style.display = "none";
                        user = [];
                    }, 30000);
                }
            } catch (ignored) {
            }
        }
    });
});

function getItem() {
    let fromLocal = localStorage.getItem("bbb_plus_id");
    if (fromLocal !== null && !isNaN(parseInt(fromLocal))) {
        return parseInt(fromLocal);
    } else {
        return defaultId;
    }
}


function addVolumeControl() {
    //let volume = document.querySelector("audio").volume;
    let outerdiv = document.createElement("div");
    outerdiv.classList = "messages--Z1feno8";
    let container = document.createElement("div");
    container.classList = "container--Z1UAd2a";
    outerdiv.appendChild(container);
    let h2 = document.createElement("h2");
    h2.classList = "smallTitle--2wz4kP";
    h2.innerText = "Lautstärke " + getVolume() * 100 + "%";
    container.appendChild(h2);
    let slider = document.createElement("input");
    slider.style = "margin-left: 6px; width:95%";
    slider.type = "range";
    slider.id = "volumeslider";
    slider.min = 0;
    slider.max = 1
    slider.step = 0.1;
    slider.oninput = changeVolume;
    slider.value = getVolume();
    outerdiv.append(slider);
    document.getElementsByClassName("messages--Z1feno8")[1].append(outerdiv);
}

function changeVolume() {
    let r = document.getElementById("volumeslider").value;
    document.querySelector("audio").volume = r;
    localStorage.setItem("bbb_plus_volume", r);
    document.getElementsByClassName("smallTitle--2wz4kP")[2].innerText = "Lautstärke " + r * 100 + "%";
}

function getVolume() {
    let fromLocal = localStorage.getItem("bbb_plus_volume");
    if (fromLocal !== null && !isNaN(parseFloat(fromLocal))) {
        return parseFloat(fromLocal);
    } else {
        localStorage.setItem("bbb_plus_volume", "0.9");
        return 0.9;
    }
}