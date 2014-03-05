function setupGesture(eventInfo) {
    var item = eventInfo.currentTarget;
    item._gesture.addPointer(eventInfo.pointerId);
    //console.log("setup gesture");
}

var zindex = 0;
function setupPGesture(eventInfo) {
    var item = eventInfo.currentTarget;
    item._gesture.addPointer(eventInfo.pointerId);
    //console.log("setup gesture");
    item.style.zIndex = zindex++;

    var elt = item.id.replace("pawn", "");

    var numberAudio = new Audio("/sounds/numbers/" + elt + ".wma");
    //console.log("/sounds/numbers/" + elt + ".wma");

    var appData = Windows.Storage.ApplicationData.current;
    var localSettings = appData.localSettings;
    numberAudio.volume = localSettings.values["volume"];

    numberAudio.play();
}

function startGesture(eventInfo) {
    eventInfo.target._directionX = 1;
    eventInfo.target._directionY = 1;
    eventInfo.target._bounceDampeningFactor = 1;
    //console.log("start Gesture");
}

function holdGesture(eventInfo) {
    var target = eventInfo.target;

    if (eventInfo.detail === eventInfo.MSGESTURE_FLAG_BEGIN) {
        if (target._pinned) {
            target._pinned = false;
        } else {
            target._pinned = true;
        }
    }

    console.log("hold gesture: " + target._pinned);
}

function isInBounds(rect, scale) {
    var ret = 0;
    var offset = 0;    

    if (rect.left + rect.width > window.innerWidth) {
        ret = 1; // Right Edge Bounce
        offset = window.innerWidth - (rect.left + rect.width);
    } else if (rect.left < 0) {
        ret = 2; // Left Edge Bounce
        offset = rect.left;
    } else if (rect.top + rect.height > window.innerHeight) {
        ret = 3; // Bottom Edge Bounce
        offset = window.innerHeight - (rect.top + rect.height);
    } else if (rect.top < 0) {
        ret = 4; // Top Edge Bounce
        offset = rect.top;
    }

    console.log("x:" + rect.left + " wx" + window.innerWidth);
    console.log("y:" + rect.top + " wy" + window.innerHeight);
    return { "value": ret, "offset": offset };
}

function manipulateElement(eventInfo) {

    var MIN_SCALE = 0.25;
    var MAX_SCALE = 2;

    var tx, ty, inBounds;
    var eScale = eventInfo.scale, scale = 1;
    var target = eventInfo.target;

    var cssMatrix = new MSCSSMatrix(target.style.msTransform);
    var rect = target.getClientRects()[0];
    var targetScale = rect.width / target.clientWidth;

    // Don't manipulate the object if it is pinned
    if (target._pinned) {
        return;
    }

    // Get the reported translation values
    tx = eventInfo.translationX;
    ty = eventInfo.translationY;

    if (eventInfo.detail === eventInfo.MSGESTURE_FLAG_INERTIA) {
        inBounds = isInBounds(rect, targetScale);

        switch (inBounds.value) {
            case 1:
            case 2: target._directionX *= -1;
                target._stop = true;
                break;
            case 3:
            case 4: target._directionY = -1;
                target._stop = true;
                break;
            default: target._stop = false;// No Bounce
        }

        if (target._stop) {
            target._bounceDampeningFactor *= 0.45;
        }
        tx *= target._directionX * target._bounceDampeningFactor;
        ty *= target._directionY * target._bounceDampeningFactor;        
    }

    if (tx + rect.left + rect.width / 2 > window.innerWidth || tx + rect.left + rect.width / 2 < 0) {
        tx = 0;
    }
    if (ty + rect.top + rect.height / 2 > window.innerHeight || ty + rect.top + rect.height / 2 < 0) {
        ty = 0;
    }

    // rotation and translation
    target.style.msTransform = cssMatrix.translate(tx, ty).
                        rotate(eventInfo.rotation * 180 / Math.PI);
}

function rotateElement(eventInfo) {
    console.log("rotate Element");

    var target = eventInfo.target;
    var cssMatrix = new MSCSSMatrix(target.style.msTransform);

    // Don't manipulate the object if it is pinned
    if (target._pinned) {
        return;
    }

    // rotation / scale and
    target.style.msTransform = cssMatrix.rotate(eventInfo.rotation * 180 / Math.PI);
}