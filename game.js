
$(document).ready(function(){

const DROP_INTERVAL = 200; // ms
const SLOW_MO_RATE = 0.3;
const FPS = 60;
const TIME_LIMIT = 120000;

var slowMoing = false;
var keyDowned = false;
var smBarVal = 100;
var inGame = false;
var modeChoice = 0;
var mode = 0; // 0:speed, 1:point

// menu part------------------

$("#setting").click(function() { // toggle menu
    if($("#menu-bg").css('display') == 'none')
        $("#menu-bg").fadeIn();
    else $("#menu-bg").fadeOut();
})
$("#mode").click(function () {
    if(modeChoice == 0){
        $("#mode").text("MODE: POINT");
        modeChoice = 1;
    }
    else {
        $("#mode").text("MODE: SPEED");
        modeChoice = 0;
    }
});
$("#back").click(function() {
    $("#menu-bg").fadeOut();
});
$("#start").click(function() { // start game
    $("#menu-bg").fadeOut();
    ms = 0;
    inGame = false;
    resetWorld();

    countDown(3, function() {
        inGame = true;
        mode = modeChoice; // execute choice
        
        if(mode == 0)
            startSpeedMode();
        else
            startPointMode();
    });
});
$(document).keydown(function(event){
    if(event.which == 32 && inGame && !keyDowned && !slowMoing){ // space bar 
        startSM();
    }
    keyDowned = true;
});
$(document).keyup(function(event){
    if(event.which == 32 && inGame && keyDowned && slowMoing){ // space bar
        stopSM();
    }
    keyDowned = false;
});

function countDown(count, callBack) {
    $("#countdown").text("READY");
    $("#countdown-bg").fadeIn();
    var x = setInterval(function(){
        $("#countdown").text(count.toString());
        count--;
        if(count < 0){
            $("#countdown-bg").fadeOut();
            clearInterval(x);
            callBack();
        }
    }, 1000);
}
function startSpeedMode() {
    ms = 0;
    initWorld();
    // start shooting
    shooting = setInterval(function(){
        shootTile();
        removeTiles();
    }, DROP_INTERVAL);

    // start render timer & bar
    Events.on(render, 'afterRender', function(e){
        updateTimer();
        updateSMbar();
    });

}
function startPointMode() {
    ms = TIME_LIMIT;
    initWorld();
    // start shooting
    shooting = setInterval(function(){
        shootTile();
        removeTiles();
    }, DROP_INTERVAL);

    // start render timer & bar
    Events.on(render, 'afterRender', function(e){
        updateTimerReverse();
        updateSMbar();
    });

}
function startSM() {
    console.log('slow-mo')
    slowMoing = true;
    engine.timing.timeScale = SLOW_MO_RATE;
    // stop shooting
    clearInterval(shooting);
}
function stopSM() {
    console.log('stop slow-mo');
    slowMoing = false;
    engine.timing.timeScale = 1.0;
    // restart shooting
    shooting = setInterval(function(){
        shootTile();
        removeTiles();
    }, DROP_INTERVAL);
}

function updateTimer() { // 60 fps
    let ms10 = (Math.floor(ms/10) % 100).toString();
    let s = (Math.floor(ms/1000) % 60).toString();
    let m = (Math.floor(ms/60000)).toString();
    if(slowMoing)
        ms += (50 / 3) * SLOW_MO_RATE;
    else
        ms += 50 / 3; // T = 1000/60 ms

    var ctx = render.context;
    ctx.font = "80pt Arial";
    ctx.textAlign = 'center';
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(`${m.padStart(2,'0')}:${s.padStart(2,'0')}:${ms10.padStart(2,'0')}`, WIDTH*0.5, 400);
}

function updateTimerReverse() { // 60 fps
    if(ms <= 0)
        ms = 0;
    let ms10 = (Math.floor(ms/10) % 100).toString();
    let s = (Math.floor(ms/1000) % 60).toString();
    let m = (Math.floor(ms/60000)).toString();
    if(slowMoing)
        ms -= (50 / 3) * SLOW_MO_RATE;
    else
        ms -= 50 / 3; // T = 1000/60 ms

    var ctx = render.context;
    ctx.font = "80pt Arial";
    ctx.textAlign = 'center';
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillText(`${m.padStart(2,'0')}:${s.padStart(2,'0')}:${ms10.padStart(2,'0')}`, WIDTH*0.5, 400);
}

function updateSMbar(){
    if(slowMoing) 
        smBarVal -= 0.5;
    else // !slowmo & !cooldown
        smBarVal += 0.1;

    // saturate
    if(smBarVal > 100)
        smBarVal = 100;
    if(smBarVal <= 0){
        smBarVal = 0;
        stopSM();
    }

    // render
    var barH = 10;
    var barW = 200;
    var ctx = render.context;
    // border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(WIDTH*0.5-barW*0.5-5, 420);
    ctx.lineTo(WIDTH*0.5-barW*0.5-5, 420+barH);
    ctx.moveTo(WIDTH*0.5+barW*0.5+5, 420);
    ctx.lineTo(WIDTH*0.5+barW*0.5+5, 420+barH);
    ctx.stroke();
    // bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.fillRect(WIDTH*0.5-barW*0.5, 420, 2*smBarVal, barH);
}

function initRun() { // start shooting with no plat
    // reset yama
    yama = [];
    for(let i=0; i<=33; i++)
        for(let j=0; j<4; j++) // 4 tiles
            yama.push(i);
    // start shooting
    shooting = setInterval(function(){
        shootTile();
        removeTiles();
    }, DROP_INTERVAL);
}

initRun();


});