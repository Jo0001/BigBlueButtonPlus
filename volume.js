let lastSpeaker = null;
let isOldVersion = false; //old means below ~2827
let isNewVersion = false; //new means ~2827+
let initialLoad = true;
let username;

function init() {
    let counter = 0;
    let initTimer = setInterval(function () {
        if (typeof document.getElementsByClassName("icon-bbb-hand")[0] !== 'undefined') {
            console.info("[BBB+] Loading volume control");
            document.querySelector("audio").volume = getVolume();
            clearInterval(initTimer);
            isNewVersion = typeof document.getElementsByClassName("icon--2q1XXw icon-bbb-hand")[0] === 'undefined';
            let index = isNewVersion ? 1 : 0;
            document.getElementsByClassName("icon-bbb-user")[index].addEventListener("click", function () {
                if (document.getElementsByClassName("arrowLeft--1CFBz1 icon-bbb-left_arrow").length === 0) setTimeout(function () {
                    addVolumeControl();
                }, 100);
            });
            addVolumeControl();
            username = document.querySelector('[data-test="userListItemCurrent"]').firstChild.children[1].firstChild.firstChild.innerText.trim();

            mutationObserver.observe(document.querySelector('[data-test="talkingIndicator"]'), {
                attributes: true,
                characterData: true,
                childList: true,
                subtree: true,
                attributeOldValue: true,
                characterDataOldValue: true
            });
            initialLoad = false;
            window.ononline = function () {
                if (!initialLoad) {
                    window.location.reload();//reload the page to reinitialize BBB+
                }
            }
        } else if (counter === 45) {
            clearInterval(initTimer);
            console.error("[BBB+] Couldn't load BigBlueButtonPlus");
            console.error("[BBB+] Please report this on GitHub https://github.com/Jo0001/BigBlueButtonPlus/issues");
        } else {
            counter++;
        }
    }, 4000);//every 4sec
}

init();

function addVolumeControl() {
    //Global Volume Slider
    let outerdiv = document.createElement("div");
    outerdiv.classList = "messages--Z1feno8";
    let container = document.createElement("div");
    container.classList = "container--Z1UAd2a";
    outerdiv.appendChild(container);
    let h2 = document.createElement("h2");
    h2.classList = "smallTitle--2wz4kP sc-cZrumJ sc-rUGft klSLYC iuhfYL";
    h2.innerText = getVolumeLabelText() + " " + parseInt(getVolume() * 100) + "%";
    h2.id = "volumeDisplay";
    if (isNewVersion) {
        h2.style = "padding-top: 20px;";
    }
    container.appendChild(h2);
    let slider = document.createElement("input");
    slider.style = "margin-left: 6px; width:95%";
    slider.type = "range";
    slider.id = "volumeslider";
    slider.min = 0;
    slider.max = 1
    slider.step = 0.05;
    slider.oninput = changeVolume;
    slider.value = getVolume();
    outerdiv.append(slider);
    let element = document.querySelector('[data-test="userListContent"]');
    element.insertBefore(outerdiv, element.firstChild);

    const userMutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList" && mutation.target.className === "ReactVirtualized__Grid__innerScrollContainer" && mutation.addedNodes.length > 0 && mutation.removedNodes.length === 0) {
                addPerUserVolume();
            }
        });
    });

    userMutationObserver.observe(document.querySelector('[data-test="userList"]'), {
        childList: true,
        subtree: true
    });
    addPerUserVolume();
}

function addPerUserVolume() {
    //Per User Slider
    let users = document.getElementsByClassName("tether-element tether-abutted tether-abutted-top tether-out-of-bounds tether-out-of-bounds-right tether-element-attached-bottom tether-element-attached-left tether-target-attached-top tether-target-attached-right tether-enabled");
    if (users.length === 0) {
        users = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children;
        isOldVersion = !isNewVersion;
    }
    for (let i = 1; i < users.length; i++) {
        //from https://dzone.com/articles/why-does-javascript-loop-only-use-last-value
        try {
            throw i
        } catch (ii) {
            let tC = getTcIncrement() + ii;
            if (!hasSlider()) {
                let slider = document.createElement("input");
                slider.style = "margin-left: 6px; width:95%";
                slider.type = "range";
                slider.min = 0;
                slider.max = 1
                slider.step = 0.1;
                slider.className = "bbb_plus_slider";
                slider.addEventListener('input', function () {
                    let name = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children[ii].children[0].children[0].children[0].children[0].children[1].children[0].children[0].innerText;
                    changeUserVolume(name, slider.value);
                });
                slider.value = getUserVolume(document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children[ii].children[0].children[0].children[0].children[0].children[1].children[0].children[0].innerText);

                if (isOldVersion) {
                    document.getElementsByClassName("MuiPopover-root menu--Z1jX85y")[tC].children[1].children[0].append(slider)
                } else {
                    document.querySelectorAll('[role="menu"]')[5 + ii].append(slider)
                }
            }

            function hasSlider() {
                let arr = [...users[ii].children[0].children[0].children[0].children[0].children];//very old
                if (isOldVersion) {
                    let tC = getTcIncrement() + ii;
                    arr = [...document.getElementsByClassName("MuiPopover-root menu--Z1jX85y")[tC].children[1].children[0].children];
                } else if (isNewVersion) {
                    arr = document.querySelectorAll('[role="menu"]')[5 + ii].children;
                }
                for (let j = 0; j < arr.length; j++) {
                    if (arr[j].className === "bbb_plus_slider") {
                        return true;
                    }
                }
                return false;
            }
        }
    }

}

function changeVolume() {
    let r = document.getElementById("volumeslider").value;
    document.querySelector("audio").volume = r;
    localStorage.setItem("bbb_plus_volume", r);
    document.getElementById("volumeDisplay").innerText = getVolumeLabelText() + " " + parseInt(r * 100) + "%";
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

const mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        let nodes = mutation.addedNodes;
        if (nodes.length > 0) {
            let speakerList = document.querySelector('[data-test="talkingIndicator"]').firstChild.children;
            for (let i = 0; i < speakerList.length; i++) {
                let speaker = speakerList.item(i);
                //make sure user is really talking
                let isTalkingElement = isOldVersion ? speaker.dataset.test : speaker.firstChild.dataset.test;
                if (isTalkingElement === "isTalking") {
                    let speakerName = isOldVersion ? speaker.children.item(1).innerText : speaker.firstChild.children.item(1).innerText;
                    lastSpeaker = speakerName;
                    console.log("Current speaker: " + speakerName);
                    if (speakerName !== username) {
                        document.querySelector("audio").volume = getVolume() * getUserVolume(speakerName);
                        console.log("Real value:" + document.querySelector("audio").volume + "\nGlobal:" + getVolume() + "\nPer User (" + speakerName + "):" + getUserVolume(speakerName))
                    }
                }
            }
        }
    });
});

function getUserVolume(user) {
    user = user.replaceAll(" ", "-").trim();
    let fromLocal = localStorage.getItem("bbb_plus_volume_" + user);
    if (fromLocal !== null && !isNaN(parseFloat(fromLocal))) {
        return parseFloat(fromLocal);
    } else {
        return 1.0;
    }
}

function changeUserVolume(user, value) {
    if (lastSpeaker === user) {
        document.querySelector("audio").volume = getVolume() * value;
    }
    user = user.replaceAll(" ", "-").trim();
    localStorage.setItem("bbb_plus_volume_" + user, value);
}

function getTcIncrement() {
    if (isMod()) {
        return 4;
    } else if (isPresenter()) {
        return 3;
    } else {
        return 2;
    }
}

function isMod() {
    let userElm = document.querySelector('[data-test="userListItemCurrent"]').firstChild.firstChild.firstChild;
    return userElm.className.includes("moderator") || userElm.dataset.test === "moderatorAvatar";
}

function isPresenter() {
    return document.querySelector('[data-test="userListItemCurrent"]').firstChild.firstChild.firstChild.dataset.testPresenter === "";
}

function getVolumeLabelText() {
    return navigator.language.startsWith("de") ? "Lautstärke" : "Volume";
}