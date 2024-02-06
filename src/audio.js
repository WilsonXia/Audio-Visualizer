// 1 - our WebAudio context, **we will export and make this public at the bottom of the file**
let audioCtx;

// **These are "private" properties - these will NOT be visible outside of this module (i.e. file)**
// 2 - WebAudio nodes that are part of our WebAudio audio routing graph
let element, sourceNode, analyserNode, gainNode, highShelfBiquadFilter, lowShelfBiquadFilter, distortionFilter;

// 3 - here we are faking an enumeration
const DEFAULTS = Object.freeze({
    gain: .5,
    numSamples: 256
})

// 4 - create a new array of 8-bit integers (0-255)
// this is a typed array to hold the audio frequency data
let audioData = new Uint8Array(DEFAULTS.numSamples/2);

// **Next are "public" methods - we are going to export all of these at the bottom of this file**
const setupWebaudio = (filePath) => {
// 1 - The || is because WebAudio has not been standardized across browsers yet
const AudioContext = window.AudioContext || window.webkitAudioContext;
audioCtx = new AudioContext();

// 2 - this creates an <audio> element
element = new Audio(); // document.querySelector("audio");

// 3 - have it point at a sound file
loadSoundFile(filePath);

// Create Nodes
sourceNode = audioCtx.createMediaElementSource(element);

analyserNode = audioCtx.createAnalyser(); // note the UK spelling of "Analyser"
analyserNode.fftSize = DEFAULTS.numSamples;

gainNode = audioCtx.createGain();
gainNode.gain.value = DEFAULTS.gain;

highShelfBiquadFilter = audioCtx.createBiquadFilter();
highShelfBiquadFilter.type = "highshelf";

lowShelfBiquadFilter = audioCtx.createBiquadFilter();
lowShelfBiquadFilter.type = "lowshelf";

distortionFilter = audioCtx.createWaveShaper();

// 8 - connect the nodes - we now have an audio graph
sourceNode.connect(highShelfBiquadFilter);
highShelfBiquadFilter.connect(lowShelfBiquadFilter);
lowShelfBiquadFilter.connect(distortionFilter);
distortionFilter.connect(analyserNode);
analyserNode.connect(gainNode);
gainNode.connect(audioCtx.destination);
}

const loadSoundFile = (filePath) => {
    element.src = filePath;
}

const playCurrentSound = () => {
    element.play();
}

const pauseCurrentSound = () => {
    element.pause();
}

const setVolume = (value) => {
    value = Number(value);   // make sure that it's a Number rather than a String
    gainNode.gain.value = value;
}

const toggleHighshelf = (highshelf) => {
    if(highshelf){
        highShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime); // we created the `biquadFilter` (i.e. "treble") node last time
        highShelfBiquadFilter.gain.setValueAtTime(25, audioCtx.currentTime);
    }else{
        highShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
  }

const toggleLowshelf = (lowshelf) => {
    if(lowshelf){
        lowShelfBiquadFilter.frequency.setValueAtTime(1000, audioCtx.currentTime);
        lowShelfBiquadFilter.gain.setValueAtTime(15, audioCtx.currentTime);
    }else{
        lowShelfBiquadFilter.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

const toggleDistortion = (distortion, distortionAmount) => {
    if(distortion){
        distortionFilter.curve = null; // being paranoid and trying to trigger garbage collection
        distortionFilter.curve = makeDistortionCurve(distortionAmount);
    }else{
        distortionFilter.curve = null;
    }
}

// from: https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode
const makeDistortionCurve = (amount=20) => {
    let n_samples = 256, curve = new Float32Array(n_samples);
    for (let i =0 ; i < n_samples; ++i ) {
      let x = i * 2 / n_samples - 1;
      curve[i] = (Math.PI + amount) * x / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

export{audioCtx,setupWebaudio,playCurrentSound,pauseCurrentSound,loadSoundFile,setVolume,analyserNode};
export{toggleHighshelf,toggleLowshelf,toggleDistortion}
