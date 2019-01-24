
$(document).ready(function(){

const DROP_INTERVAL = 200; // ms
const SLOW_MO_RATE = 0.3;
const FPS = 60;


// control interval ID of dropTile
var shooting = setInterval(function(){
    shootTile();
    removeTiles();
}, DROP_INTERVAL);
var slowMoing = false;
var keyDowned = false;
var smBarVal = 100;

function startGame() {

}

$(document).keydown(function(event){
    if(event.which == 32 && !keyDowned && !slowMoing){ // space bar 
        startSM();
    }
    keyDowned = true;
});
$(document).keyup(function(event){
    if(event.which == 32 && keyDowned && slowMoing){ // space bar
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

var ms = 0;
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


Events.on(render, 'afterRender', function(e){
    updateTimer();
    updateSMbar();
});








});