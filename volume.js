let lastSpeaker = null;

function init() {
    let counter = 0;
    let initTimer = setInterval(function () {
        baseElement = document.getElementsByClassName("buttonWrapper--x8uow button--295UAi")[0];
        if (typeof baseElement !== 'undefined' || typeof document.getElementsByClassName("icon--2q1XXw icon-bbb-hand")[0] !== 'undefined') {
            console.info("[BBB+] Loading volume control");
            document.querySelector("audio").volume = getVolume();
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

            clearInterval(initTimer);
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

    //Per User Slider
    let users = document.getElementsByClassName("tether-element tether-abutted tether-abutted-top tether-out-of-bounds tether-out-of-bounds-right tether-element-attached-bottom tether-element-attached-left tether-target-attached-top tether-target-attached-right tether-enabled");
    console.info(users)
    for (let i = 1; i < users.length; i++) {
        //from https://dzone.com/articles/why-does-javascript-loop-only-use-last-value
        try {
            throw i
        } catch (ii) {
            let slider = document.createElement("input");
            slider.style = "margin-left: 6px; width:95%";
            slider.type = "range";
            slider.min = 0;
            slider.max = 1
            slider.step = 0.1;
            slider.addEventListener('input', function () {
                let name = document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children[ii].children[0].children[0].children[0].children[0].children[1].children[0].children[0].innerText;
                changeUserVolume(name, slider.value);
                console.info(name)
            });
            slider.value = getUserVolume(document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children[ii].children[0].children[0].children[0].children[0].children[1].children[0].children[0].innerText);

            users[ii].children[0].children[0].children[0].children[0].append(slider)
        }
    }

    const userMutationObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                let newNode = mutation.addedNodes[0].children[0].children[0].children[0].children[0];
                let slider = document.createElement("input");
                slider.style = "margin-left: 6px; width:95%";
                slider.type = "range";
                slider.min = 0;
                slider.max = 1
                slider.step = 0.1;
                slider.addEventListener('input', function () {
                    let name = newNode.children[1].children[0].children[0].innerText;
                    changeUserVolume(name, slider.value);
                    console.info(name)
                });
                slider.value = getUserVolume(newNode.children[1].children[0].children[0].innerText);

                let users = Array.prototype.slice.call(document.getElementsByClassName("ReactVirtualized__Grid__innerScrollContainer")[0].children);
                let u_id = document.getElementById(newNode.parentNode.parentNode.parentNode.parentNode.id);//get current user id
                let u_idx = users.indexOf(u_id);//get the index of the user in the user list
                let menuList = document.getElementsByClassName("tether-element tether-abutted tether-abutted-top tether-out-of-bounds tether-out-of-bounds-right tether-element-attached-bottom tether-element-attached-left tether-target-attached-top tether-target-attached-right tether-enabled");
                menuList[u_idx].children[0].children[0].children[0].children[0].append(slider)//add the slider to the new user
            }
        });
    });

    userMutationObserver.observe(document.getElementsByClassName("ReactVirtualized__Grid ReactVirtualized__List scrollStyle--Ckr4w")[0], {
        attributes: false,
        childList: true,
        subtree: true
    });

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