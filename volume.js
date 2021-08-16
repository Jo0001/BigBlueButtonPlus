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