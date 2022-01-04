let lastSpeaker = null;
let isNewVersion = false; //new means ~2394+
let initialLoad = true;

function init() {
    let counter = 0;
    let initTimer = setInterval(function () {
        baseElement = document.getElementsByClassName("buttonWrapper--x8uow button--295UAi")[0];
        if (typeof baseElement !== 'undefined' || typeof document.getElementsByClassName("icon--2q1XXw icon-bbb-hand")[0] !== 'undefined') {
            console.info("[BBB+] Loading volume control");
            document.querySelector("audio").volume = getVolume();
            clearInterval(initTimer);
            document.getElementsByClassName("left--18SBXP")[0].addEventListener("click", function () {
                if (document.getElementsByClassName("arrowLeft--1CFBz1 icon-bbb-left_arrow").length === 0) setTimeout(function () {
                    addVolumeControl();
                }, 100);
            });
            addVolumeControl();

            mutationObserver.observe(document.getElementsByClassName("speaking--Z2tUpzD")[0], {
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
    h2.classList = "smallTitle--2wz4kP";
    h2.innerText = "Lautstärke " + parseInt(getVolume() * 100) + "%";
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
    document.getElementsByClassName("messages--Z1feno8")[1].append(outerdiv);

    const userMutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList" && mutation.target.className === "ReactVirtualized__Grid__innerScrollContainer" && mutation.addedNodes.length > 0 && mutation.removedNodes.length === 0) {
                addPerUserVolume();
            }
        });
    });

    userMutationObserver.observe(document.getElementsByClassName("ReactVirtualized__Grid ReactVirtualized__List scrollStyle--Ckr4w")[0], {
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
        isNewVersion = true;
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
                    console.info(name)
                });
                slider.value = getUserVolume(document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children[ii].children[0].children[0].children[0].children[0].children[1].children[0].children[0].innerText);

                if (isNewVersion) {
                    document.getElementsByClassName("MuiPopover-root menu--Z1jX85y")[tC].children[1].children[0].append(slider)
                } else {
                    users[ii].children[0].children[0].children[0].children[0].append(slider)
                }
            }

            function hasSlider() {
                let arr = [...users[ii].children[0].children[0].children[0].children[0].children]
                if (isNewVersion) {
                    let tC = getTcIncrement() + ii;
                    arr = [...document.getElementsByClassName("MuiPopover-root menu--Z1jX85y")[tC].children[1].children[0].children];
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
    document.getElementsByClassName("smallTitle--2wz4kP")[2].innerText = "Lautstärke " + parseInt(r * 100) + "%";
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
            let speakerList = document.getElementsByClassName("speaking--Z2tUpzD")[0].children;
            for (let i = 0; i < speakerList.length; i++) {
                let speaker = speakerList.item(i);

                //make sure user is really talking
                if (speaker.classList.contains("talker--2eNUIW") && speaker.dataset.test === "isTalking") {

                    let speakerName = speaker.children.item(1).innerText;
                    lastSpeaker = speakerName;
                    console.log(speakerName);
                    console.info(document.getElementsByClassName("userNameMain--2fo2zM")[0].children[0].innerText.trim())
                    if (speakerName !== document.getElementsByClassName("userNameMain--2fo2zM")[0].children[0].innerText.trim()) {
                        document.querySelector("audio").volume = getVolume() * getUserVolume(speakerName);
                        console.warn("Real value:" + document.querySelector("audio").volume + "\nGlobal:" + getVolume() + "\nPer User (" + speakerName + "):" + getUserVolume(speakerName))
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
    return document.getElementsByClassName("userAvatar--1GxXQi")[0].children[0].className.includes("moderator");
}

function isPresenter() {
    return document.getElementsByClassName("userAvatar--1GxXQi")[0].children[0].className.includes("presenter");
}