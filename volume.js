let lastSpeaker = null;
let isOldVersion = false; //old means below ~2827
let isNewVersion = false; //new means ~2827+
let initialLoad = true;
let username;
let lastSlider = null;
let working = false;

function init() {
    let counter = 0;
    let initTimer = setInterval(function () {
        if (typeof document.getElementsByClassName("icon-bbb-hand")[0] !== 'undefined') {
            console.info("[BBB+] Loading volume control");
            document.querySelector("audio").volume = getVolume();
            clearInterval(initTimer);
            isNewVersion = typeof document.getElementsByClassName("icon--2q1XXw icon-bbb-hand")[0] === 'undefined';
            reapply();
            addVolumeControl();
            register();
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
            setInterval(function () {
                if (isMissingAndNeeded() && !working) {
                    working = true;
                    addVolumeControl();
                    register();
                    working = false;
                }
            }, 60000);//every minute
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

function reapply() {
    document.getElementsByClassName("icon-bbb-user")[0].addEventListener("click", function () {
        if (isNewVersion) {
            setTimeout(function () {
                let headstyle = document.getElementsByTagName("header")[0].style.left;
                if (headstyle.split("px")[0] > 0) {
                    setTimeout(function () {
                        working = true;
                        addVolumeControl();
                        register();
                        working = false;
                    }, 10);
                }
            }, 500)
        } else {
            if (document.getElementsByClassName("arrowLeft--1CFBz1 icon-bbb-left_arrow").length === 0) setTimeout(function () {
                working = true;
                addVolumeControl();
                register();
                working = false;
            }, 100);
        }
    });
}

function isMissingAndNeeded() {
    return document.getElementById("volumeslider") === null && (document.getElementsByTagName("header")[0].style.left.split("px")[0] !== "0"
        || (!isNewVersion && document.getElementsByClassName("arrowLeft--1CFBz1 icon-bbb-left_arrow").length === 0));
}


function register() {
    const userlist = document.querySelector('[data-test="userList"]');
    userlist.addEventListener("click", function (event) {
        const userItem = event.target.closest('[data-test^="userListItem"]');
        if (userItem) {
            remove();
            const usernameElement = userItem.querySelector('span[position="bottom"]');
            const name = usernameElement.textContent.trim();
            if (name !== username) {
                let slider = document.createElement("input");
                slider.style = "margin-left: 6px; width:95%";
                slider.type = "range";
                slider.min = 0;
                slider.max = 1
                slider.step = 0.1;
                slider.className = "bbb_plus_slider";
                slider.value = getUserVolume(name);
                slider.addEventListener('input', function () {
                    changeUserVolume(name, slider.value);
                });
                lastSlider = slider;
                usernameElement.parentNode.parentNode.append(slider);
            }
        }//clicked somewhere with no user
    });

    function remove() {
        if (lastSlider !== null) {
            lastSlider.remove();
        }
    }
}

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

function getVolumeLabelText() {
    return navigator.language.startsWith("de") ? "Lautstärke" : "Volume";
}