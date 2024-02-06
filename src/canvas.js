/*
	The purpose of this file is to take in the analyser node and a <canvas> element: 
	  - the module will create a drawing context that points at the <canvas> 
	  - it will store the reference to the analyser node
	  - in draw(), it will loop through the data in the analyser node
	  - and then draw something representative on the canvas
	  - maybe a better name for this file/module would be *visualizer.js* ?
*/

import * as utils from './utils.js';

let ctx,canvasWidth,canvasHeight,gradient,analyserNode,audioData;
let background, star;
let stars = [];


const setupCanvas = (canvasElement,analyserNodeRef) => {
	// create drawing context
	ctx = canvasElement.getContext("2d");
	canvasWidth = canvasElement.width;
	canvasHeight = canvasElement.height;
	// create a gradient that runs top to bottom
	gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[
		{percent:1,color:"#020024"},
		{percent:.65,color:"#090979"},
		{percent:0,color:"#00d4ff"}]);
	// gradient = utils.getLinearGradient(ctx,0,0,0,canvasHeight,[{percent:0,color:"blue"},{percent:.25,color:"green"},{percent:.5,color:"yellow"},{percent:.75,color:"red"},{percent:1,color:"magenta"}]);

	// keep a reference to the analyser node
	analyserNode = analyserNodeRef;
	// this is the array where the analyser data will be stored
	audioData = new Uint8Array(analyserNode.fftSize/2);

	setBackground({"x" : 0, "y" : 0, "image" : "images/among-us-drip.jpg", "width" : 200, "height" : 200, "rotate" : 0});
}

const draw = (params={}) => {
  // 1 - populate the audioData array with the frequency data from the analyserNode
	// notice these arrays are passed "by reference"
	if(params.useWaveForm){
		analyserNode.getByteTimeDomainData(audioData);
	}
	else{
		analyserNode.getByteFrequencyData(audioData);
	}	
	// 2 - draw background
    ctx.save();
    ctx.fillStyle = "black";
    ctx.globalAlpha = .1;
    ctx.fillRect(0,0,canvasWidth,canvasHeight);
	ctx.restore();
	// 3 - draw gradient
	if(params.showGradient){
		ctx.save();
		ctx.fillStyle = gradient;
		ctx.globalAlpha = .3;
		ctx.fillRect(0,0,canvasWidth,canvasHeight);
		ctx.restore();
	}
	// Draw circles
	if(params.showCircles){
		drawBarsInCircle(audioData, 5);
		drawBarsInCircle(audioData, 3, -1);
	}
	
	// DRAW SPRITES -----------------------------------
	if(stars.length > 0){
		drawStars(audioData);
	}
	drawSprites(audioData);
	// 4 - draw bars
	if(params.showBars){
		drawBarsInArc(audioData);
		drawBars(audioData);
		//drawBarsInCircle(audioData, canvasWidth * 0.9, canvasHeight * 0.3, 3);
    }
	// 6 - bitmap manipulation
	let imageData = ctx.getImageData(0,0,canvasWidth,canvasHeight);
	let data = imageData.data;
	let length = data.length;
	let width = imageData.width; // not using here
	// B) Iterate through each pixel, stepping 4 elements at a time (which is the RGBA for 1 pixel)
	for (let i = 0; i < length; i+=4){
		// C) randomly change every 20th pixel to red
		if (params.showNoise && Math.random() < .05){
			// data[i] is the red channel
			// data[i+1] is the green channel
			// data[i+2] is the blue channel
			// data[i+3] is the alpha channel
			data[i] = data[i+1] = data[i+2] = 255;// zero out the red and green and blue channels
			//data[i+1] = 255;// make the red channel 100% red
		} // end if
		// 7 - Invert
		if(params.showInvert){
			let red = data[i], green = data[i + 1], blue = data[i+2];
			data[i] = 255 - red; // set red
			data[i+1] = 255 -green; // set green
			data[i+2] = 255 - blue; // set blue
			// data[i+3] = alpha
		}
	} // end for
	// 8 - Embass
	if(params.showEmbass){
		// stepping through each sub pixel
		for(let i = 0; i < length; i++) {
			if(i%4 ==3) continue; // skip alpha
			data[i] = 127 + 2* data[i] - data[i+4] - data[i+width * 4];
		}
	}

	// D) copy image data back to canvas
	ctx.putImageData(imageData, 0, 0);
}

const drawSprites = () => {
	background.draw(ctx);
}

const createStars = () => {
	let xSpacing = canvasWidth / 10;
	let ySpacing = 50;
	for(let i = 0; i < 10; i++){
		let newStar = new Sprite({x:0,y:0,image:star.image.src,width:star.width,height:star.height});
		newStar.x = i * xSpacing + utils.getRandom(10, 50);
		newStar.y += utils.getRandom(10, 50);
		if(i % 2 == 0){
			newStar.y = ySpacing + utils.getRandom(10, 50);
		}
		stars.push(newStar);
	}
}

const drawStars = (data) => {
	for(let star of stars){
		star.draw(ctx);
		star.setScale(data[0]/255);
	}
}

const drawBars = (data) => {
	const BAR_WIDTH = 10;
	const MAX_BAR_HEIGHT = 90;
	const PADDING = 4;
	
	// Bars
	ctx.save();
	ctx.translate(0, canvasHeight); // to desired point
	//ctx.rotate(utils.Deg2Rad(-90));
	for(let b of data){ // audio data
	  let percent = b/255;
	  ctx.fillStyle = `hsl(${(percent * 360 + 120) % 360}, 100%, 80%)`;
	  if(percent < .02) {
		  percent = .02;
	  }
	  else if(b == 0){
		percent = 0;
	  }
	  ctx.translate(BAR_WIDTH,0);
	  ctx.save();
	  ctx.scale(1,-1);
	  ctx.fillRect(0,0,BAR_WIDTH,MAX_BAR_HEIGHT * percent);
	  ctx.restore();
	  ctx.translate(PADDING, 0);
	}
	ctx.restore();
}

const drawBarsInCircle = (data, size = 3, scale = 1) => {
	let x = canvasWidth/2
	let y = canvasHeight/ (size + 1);
	const MAX_BAR_HEIGHT = 90;
	const PADDING = 4;
	// Bars
	ctx.save();
	ctx.translate(x, y); // to desired point
	for(let b of data){ // audio data
	  let percent = b/255;
	  if(percent < .02) {
		  percent = 0;
	  }
	  ctx.fillStyle = `hsl(${(percent * 360 + 120) % 360}, 90%, 85%)`;
	  ctx.translate(size,0);
	  ctx.rotate(Math.PI * 2 / data.length);
	  ctx.save();
	  ctx.scale(1,scale);
	  ctx.fillRect(0,0,size,MAX_BAR_HEIGHT * percent);
	  ctx.restore();
	  ctx.translate(PADDING, 0);
	}
	ctx.restore();
}

const drawBarsInArc = (data) => {
	const BAR_WIDTH = 3;
	const MAX_BAR_HEIGHT = 90;
	const PADDING = 4;
	const MIDDLE_Y = canvasHeight/2;
	// Bars
	ctx.save();
	ctx.translate(canvasWidth/4 - 100, MIDDLE_Y + 100); // to desired point
	ctx.rotate(utils.Deg2Rad(-90));
	for(let b of data){ // audio data
	  let percent = b/255;
	  ctx.fillStyle = `hsl(${(percent * 360 + 120) % 360}, 100%, 35%)`;
	  if(percent < .02) {
		  percent = .02;
	  }
	  else if(b == 0){
		percent = 0;
	  }
	  ctx.translate(BAR_WIDTH,0);
	  ctx.rotate(Math.PI / data.length);
	  ctx.save();
	  ctx.scale(1,1);
	  ctx.fillRect(0,0,BAR_WIDTH,MAX_BAR_HEIGHT * percent);
	  ctx.restore();
	  ctx.translate(PADDING, 0);
	}
	ctx.restore();
}

const setBackground = (sprite = {}) => {
	background = new Sprite(sprite);
	background.x = canvasWidth/2 - background.width/2; 
	background.y = canvasHeight - background.height;
	console.log(`${background.width}`);
}

const setStar = (sprite) => {
	star = sprite;
	createStars();
}

export {setupCanvas,setBackground,setStar,draw};