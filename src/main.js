import * as audio from './audio.js';
import * as canvas from './canvas.js';
import * as utils from './utils.js';
import * as loader from './loader.js';

const fps = 60;
let sprites;

const drawParams = {
    showGradient : true,
    showBars     : true,
    showCircles  : true,
    showNoise    : false,
    showInvert   : false,
    showEmbass   : false,
    useWaveForm  : false
}

const soundParams = {
    useHighshelf     : false,
    useLowshelf      : false,
    useDistortion    : false,
    distortionAmount : 20
}

// 1 - here we are faking an enumeration
let DEFAULTS = {sound1 : "media/Among Us Drip Theme Song Original (Among Us Trap Remix  Amogus Meme Music).mp3"};

const init = () => {
    audio.setupWebaudio(DEFAULTS.sound1);
	  console.log("init called");
	  console.log(`Testing utils.getRandomColor() import: ${utils.getRandomColor()}`);
	  let canvasElement = document.querySelector("canvas"); // hookup <canvas> element
	  setupUI(canvasElement);
    canvas.setupCanvas(canvasElement,audio.analyserNode);
    // Looping
    loop();
}

const setupUI = (canvasElement) => {
  // A - hookup fullscreen button
  const fsButton = document.querySelector("#btn-fs");
  const playButton = document.querySelector("#btn-play");
	
  // add .onclick event to button
  fsButton.onclick = e => {
    console.log("goFullscreen() called");
    utils.goFullscreen(canvasElement);
  };

  // B - play button
  playButton.onclick = e => {
    console.log(`audioCtx.state before = ${audio.audioCtx.state}`);

    // check if context is in suspended state (autoplay policy)
    if(audio.audioCtx.state =="suspended") {
        audio.audioCtx.resume();
    }
    console.log(`audioCtx.state after = ${audio.audioCtx.state}`);
    if(e.target.dataset.playing =="no"){
        // if track is currently paused, play it
        audio.playCurrentSound();
        e.target.dataset.playing = "yes"; // CSS will set the text to "Pause"
        // if track IS playing, pause it
    }else{
        audio.pauseCurrentSound();
        e.target.dataset.playing = "no"; // CSS set to "Play"
    }
  };

  // C - hookup volume slider & label
  let volumeSlider = document.querySelector("#volume-slider");
  let volumeLabel = document.querySelector("#volume-label");

  //add .oninput event to slider
  volumeSlider.oninput = e => {
    //set the gain
    audio.setVolume(e.target.value);
    volumeLabel.innerHTML = Math.round((e.target.value/2 * 100));
  };

  // set value of label to match initial value of slider
  volumeSlider.dispatchEvent(new Event("input"));

  // D - hookup track <select>
  let trackSelect = document.querySelector("#track-select");
  // add.onchange event to <select>
  trackSelect.onchange = e => {
    let index = Number(e.target.value);

    console.log(`${loader.trackList[index].background.image}`);
    
    audio.loadSoundFile(loader.trackList[index].trackSrc);
    canvas.setBackground(loader.trackList[index].background);
    // pause the current track if it is playing
    if (playButton.dataset.playing == "yes"){
        playButton.dispatchEvent(new MouseEvent("click")); // pauses the event
    }
  }

  let radioFreq = document.querySelector("#radio-freq");
  let radioWave = document.querySelector("#radio-wave");

  // E - Checkboxes
  let gradientCB = document.querySelector("#cb-gradient");
  let barsCB = document.querySelector("#cb-bars");
  let circlesCB = document.querySelector("#cb-circles");
  let noiseCB = document.querySelector("#cb-noise");
  let invertCB = document.querySelector("#cb-invert");
  let embassCB = document.querySelector("#cb-embass");

  // Event Handling
  gradientCB.onclick = e => {
    drawParams.showGradient = e.target.checked;
  }
  barsCB.onclick = e => {
    drawParams.showBars = e.target.checked;
  }
  circlesCB.onclick = e => {
    drawParams.showCircles = e.target.checked;
  }
  noiseCB.onclick = e => {
    drawParams.showNoise = e.target.checked;
  }
  invertCB.onclick = e => {
    drawParams.showInvert = e.target.checked;
  }
  embassCB.onclick = e => {
    drawParams.showEmbass = e.target.checked;
  }
  radioFreq.onchange = e => {
    if(e.target.checked){
      drawParams.useWaveForm = false;
    }
  }
  radioWave.onchange = e => {
    if(e.target.checked){
      drawParams.useWaveForm = true;
    }
  }

  // Default Values
  gradientCB.checked = drawParams.showGradient;
  barsCB.checked = drawParams.showBars;
  circlesCB.checked = drawParams.showCircles;
  noiseCB.checked = drawParams.showNoise;
  invertCB.checked = drawParams.showInvert;
  embassCB.checked = drawParams.showEmbass;
  
  // Continue to sound UI
  setupSoundUI();
}

const setupSoundUI = () => {
  // Declare inputs
  let highShelfCB, lowShelfCB, distortionCB, distortionSlider;

  // Set each up
  highShelfCB = document.querySelector('#cb-highshelf');
  highShelfCB.checked = soundParams.useHighshelf; 
  lowShelfCB = document.querySelector('#cb-lowshelf');
  lowShelfCB.checked = soundParams.useLowshelf;
  distortionCB = document.querySelector('#cb-distortion');
  distortionCB.checked = soundParams.useDistortion;
	distortionSlider = document.querySelector('#slider-distortion');
  distortionSlider.value = soundParams.distortionAmount;

  // OnChange Events
	distortionSlider.onchange = e => {
		soundParams.distortionAmount = Number(e.target.value);
		audio.toggleDistortion(soundParams.useDistortion, soundParams.distortionAmount);
	};

  // Checkbox OnChanges
  highShelfCB.onchange = e => {
    soundParams.useHighshelf = e.target.checked;
    audio.toggleHighshelf(soundParams.useHighshelf);
  }
  lowShelfCB.onchange = e => {
    soundParams.useLowshelf = e.target.checked;
    audio.toggleLowshelf(soundParams.useLowshelf);
  }
  distortionCB.onchange = e => {
    soundParams.useDistortion = e.target.checked;
    audio.toggleDistortion(soundParams.useDistortion, soundParams.distortionAmount);
  }

  // Setups
  audio.toggleHighshelf();
  audio.toggleLowshelf();
}

const loop = () => {
        setTimeout(loop, 1000/fps);
        canvas.draw(drawParams, sprites);
}

const setSprites = (s) => {
  sprites = s;
  console.log(sprites);
}

export {init, setSprites};