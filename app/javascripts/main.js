/*global Modernizr*/

var debugggger = function () {};

var theCanvas = document.getElementById('canvas-one');
var context = theCanvas.getContext('2d');

debugggger.log = function (message) {
    try {
        console.log(message);
    } catch (exception) {
        return;
    }
};

function canvasSupport() {
    return Modernizr.canvas;

}


function canvasAPP() {
    if (!canvasSupport || !theCanvas || !theCanvas.getContext) {
        return;
    }

    function drawScreen() {
        context.fillStyle = '#ffffaa';
        context.fillRect(0, 0, 500, 300);
    }

    drawScreen();
}


window.onload = function () {
    canvasAPP();
};


