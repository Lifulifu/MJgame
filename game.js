
$(document).ready(function(){

const DROP_INTERVAL = 200; // ms
const SLOW_MO_RATE = 0.3;
const FPS = 60;

var slowMoing = false;
var keyDowned = false;
var smBarVal = 100;
var inGame = false;
var mode = 0; // 0:speed, 1:pointS, 2:pointL
var prevHandL = 0;
var handL = 0;

// menu part------------------

$("#setting").click(function() { // toggle menu
    if($("#menu-bg").css('display') == 'none')
        $("#menu-bg").fadeIn();
    else $("#menu-bg").fadeOut();
})
$("#mode").click(function () {
    if(mode == 0){
        $("#mode").text("模式: 計點(3 min)");
        mode = 1;
    }
    else if(mode == 1) {
        $("#mode").text("模式: 計點(5 min)");
        mode = 2;
    }
    else {
        $("#mode").text("模式: 競速");
        mode = 0;
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
        
        if(mode == 0)
            startSpeedMode();
        else if(mode == 1)
            startPointMode(3000);
        else    
            startPointMode(5000);
    });
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


// speed mode-----------------------
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

        // result: agari
        var hand = tilesOnPlatform();
        prevHandL = handL;
        handL = hand.length
        if(handL == 14 && handL != prevHandL && inGame) {
            hand = hand.map(x => parseInt(x));
            var result = agariJudger(hand, 1);
            if(result) // agari
                speedModeAgari(hand, result);
        }
    });
}
function speedModeAgari(hand, result) {
    inGame = false;
    clearInterval(shooting);
    console.log(result);

    // time
    $("#agari-bg #time").text(time2Str(ms));
    // hand img
    $("#agari-bg #hand").text('');
    for(let tile of hand.sort((a,b) => a-b)) // sort by numerical val
        $("#agari-bg #hand").append(`<img src="img/${textures[tile]}.png"/>`);
    // yaku
    $("#agari-bg #yaku").text('');
    for(let yaku of result.yakus) {
        $("#agari-bg #yaku").append(
            `<br><span>${yaku.toString()}</span>`
        );
    }
    // point
    $("#agari-bg #point").text(`${result.agariType} ${result.score.toString()} 点`);
    
    $("#agari-bg").fadeIn();
}
$("#agari-bg").click(function() { // return to title
    $("#agari-bg").fadeOut();
    resetWorld();
    initRun();
    $("#menu-bg").fadeIn();
});



// point mode---------------------
function startPointMode(time_lim) {
    ms = time_lim;
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

        // result: time out
        if(ms <= 0 && inGame) {
            pointModeTimeout();
        }

        // result: agari
        else {
            var hand = tilesOnPlatform();
            prevHandL = handL;
            handL = hand.length
            if(handL == 2 && handL != prevHandL && inGame) {
                console.log(hand);
                pointModeAgari();
            }
        }
    });

}
function pointModeTimeout() {
    inGame = false;
    clearInterval(shooting);
    $("#timeout-bg").fadeIn();
}
$("#timeout-bg .btn").click(function() { // return to title
    $("#point-timeout-bg").fadeOut();
    resetWorld();
    initRun();
    $("#menu-bg").fadeIn();
});
function pointModeAgari() {
    speedModeAgari();
}


// in game-------------------------
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
function time2Str(t) {
    if(t <= 0)
        return '00:00:00';
    let ms10 = (Math.floor(t/10) % 100).toString();
    let s = (Math.floor(t/1000) % 60).toString();
    let m = (Math.floor(t/60000)).toString();
    return `${m.padStart(2,'0')}:${s.padStart(2,'0')}:${ms10.padStart(2,'0')}`;
}
function updateTimer() { // 60 fps
    var ctx = render.context;
    ctx.font = "80pt Arial";
    ctx.textAlign = 'center';
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(time2Str(ms), WIDTH*0.5, 400);
    
    if(inGame && slowMoing)
        ms += (50 / 3) * SLOW_MO_RATE;
    else if(inGame)
        ms += 50 / 3; // T = 1000/60 ms

}
function updateTimerReverse() { // 60 fps
    var ctx = render.context;
    ctx.font = "80pt Arial";
    ctx.textAlign = 'center';
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText(time2Str(ms), WIDTH*0.5, 400);

    if(inGame && slowMoing)
        ms -= (50 / 3) * SLOW_MO_RATE;
    else if(inGame)
        ms -= 50 / 3; // T = 1000/60 ms

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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(WIDTH*0.5-barW*0.5-5, 420);
    ctx.lineTo(WIDTH*0.5-barW*0.5-5, 420+barH);
    ctx.moveTo(WIDTH*0.5+barW*0.5+5, 420);
    ctx.lineTo(WIDTH*0.5+barW*0.5+5, 420+barH);
    ctx.stroke();
    // bar
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(WIDTH*0.5-barW*0.5, 420, 2*smBarVal, barH);
}



function initRun() { // start shooting with no plat
    resetYama();
    // start shooting as bg
    shooting = setInterval(function(){
        shootTile();
        removeTiles();
    }, DROP_INTERVAL);
}

initRun();


});