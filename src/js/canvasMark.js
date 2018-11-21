let drawedCanvasArr = [];

function isFoundInArray (array, givenValue) {
    let found = false;
    for(let i = 0; i < array.length; i++) {
        if (array[i] === givenValue) {
            found = true;
            break;
        }
    }
    return found;
}

export function isCanvasDrawed (SVG_ID) {
    if (isFoundInArray(drawedCanvasArr, SVG_ID)) {
        return true;
    }
    return false;
}

export function canvasFinished (SVG_ID) {
    drawedCanvasArr.push(SVG_ID);
}