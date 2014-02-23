function setupGesture(eventInfo) {
    var item = eventInfo.currentTarget;
    item._gesture.addPointer(eventInfo.pointerId);
    //console.log("setup gesture");
}

function setupPGesture(eventInfo) {
    var item = eventInfo.currentTarget;
    item._gesture.addPointer(eventInfo.pointerId);
    //console.log("setup gesture");
    
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
    var tollerance = 20 * (scale * 16);

    var centerPointX = rect.left + rect.width / 2;
    var centerPointY = rect.top + rect.height / 2;

    if (centerPointX + tollerance > window.innerWidth) {
        ret = 1; // Right Edge Bounce
        offset = window.innerWidth - (centerPointX + tollerance);
    } else if (centerPointX - tollerance < 0) {
        ret = 2; // Left Edge Bounce
        offset = centerPointX - tollerance;
    } else if (centerPointY + tollerance > window.innerHeight) {
        ret = 3; // Bottom Edge Bounce
        offset = window.innerHeight - (centerPointY + tollerance);
    } else if (centerPointY - tollerance < 0) {
        ret = 4; // Top Edge Bounce
        offset = centerPointY - tollerance;
    }
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

    // Prevent Over / Under Scaling
    if (eScale < 1 && targetScale > MIN_SCALE) { scale = eScale; }
    if (eScale > 1 && targetScale < MAX_SCALE) { scale = eScale; }

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
            target._bounceDampeningFactor *= 0.4;
        }
        tx *= target._bounceDampeningFactor;
        ty *= target._bounceDampeningFactor;
    }

    // rotation / scale and
    target.style.msTransform = cssMatrix.translate(tx, ty).
                        rotate(eventInfo.rotation * 180 / Math.PI);//.
    //scale(scale);
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