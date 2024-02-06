import * as main from "./main.js";
import * as canvas from "./canvas.js";


let trackList;
window.onload = ()=>{
	console.log("window.onload called");
	// 1 - do preload here - load fonts, images, additional sounds, etc...
	loadJson(callBack);
	// 2 - start up app
	main.init();
}

const loadJson = (callbackFunction) => {
	let url = "data/av-data.json";
    let xhr = new XMLHttpRequest();
    xhr.onerror = e => console.log("Failed to load...");
    xhr.onload = e => callbackFunction(e.target.responseText);
    xhr.open("GET",url);
    xhr.send();
}

const callBack = (text) => {
	let json;
    try{
        json = JSON.parse(text);
    }
    catch{
        console.log("Parse failed...");
        return;
    }
	// Set stuff up
	document.head.title = json.title;
	let titleHtml = json.title;
	document.querySelector("h1").innerHTML = titleHtml;

	let trackHtml = "";
	trackList = json.trackList;
	for(let i = 0 ; i < trackList.length; i++){
		trackHtml += `<option value="${i}">${trackList[i].trackName}</option>`;
	}
	document.querySelector("#track-select").innerHTML = trackHtml;

	let starSprite = new Sprite(json.star);
	canvas.setStar(starSprite);
}

export{trackList};