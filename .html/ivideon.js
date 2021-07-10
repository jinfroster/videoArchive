var gCamList = {};
var gArchiveDate = null;
var gArchiveVideoUrl = {};
var gArchiveVideoLength = [];
var gArchiveVideoTimeMapping = [];
var gArchivePhotoUrl = {};
var gArchivePhotoTimeMapping = [];
var gTimelineMouseOverEnabled = true;
var gCurrentCam = null;
var gCurrentMode = null; // 'video'/'photo'
var gCurrentTimestamp = null;

const TIMESTAMPS_COUNT = 86400;
const MIN_TIMESTAMP = 0;
const MAX_TIMESTAMP = TIMESTAMPS_COUNT - 1;

Object.size = function(arr) 
{
	var size = 0;
	for (var key in arr) 
	{
		if (arr.hasOwnProperty(key)) size++;
	}
	return size;
};


function appInit() {
	// console.log("appInit");
	loadGlobalIndex();
	//refreshCamList();
}

function loadGlobalIndex() {
	// console.log("loadGlobalIndex");
	fetch(".index/index.json")
		.then(res => res.json())
		.then((out) => {
			//console.log('Checkout this JSON! ', out);
			gCamList={};
			out.forEach((o,i) => {
				if (o.type="directory") {
					lCamName=o.name.slice(0,-1);
					gCamList[lCamName] = {}
					gCamList[lCamName].dates = [];
					o.contents.forEach((d,i) => {
						if (d.type="directory") {
							gCamList[lCamName].dates.push(d.name);
						}
					})
				}
			})
			//gCamList = out
			// console.log(gCamList);
			refreshCamList();
			showLast();
		})
		.catch(err => { throw err });	
}

function showLast(pCam=null) {
	var camPreviewHtml = "";
	document.getElementById("watchDay").innerHTML = ""
	document.getElementById("watchLast").innerHTML = "loading...";
	if (pCam == null) {
		for (var cam in gCamList) {
			camPreviewHtml += "<div><h3>"+cam+"</h3><img src='.index/"+cam+"/last.jpg#" + new Date().getTime() + "'/></div>";
		}
	} else {
		camPreviewHtml += "<div><h3>"+pCam+"</h3><img src='.index/"+pCam+"/last.jpg#" + new Date().getTime() + "'/></div>";
	}
	document.getElementById("watchLast").innerHTML = camPreviewHtml;
}

function refreshCamList() {
	//console.log("refreshCamList");
	var camListHtml = "<a onClick='javascript:showLast()'>Last ("+Object.size(gCamList)+")</a><ol>";
	var dates=[];
	for (var cam in gCamList) {
		camListHtml += "<li onclick='showLast(\""+cam+"\")'>"+cam+"</li>";
		dates.push(...gCamList[cam].dates);
	};
	dates = [...new Set(dates.sort())];
	// console.log('refreshCamList dates set=',dates)
	camListHtml += "</ol>Archive ("+dates.length+")<ul>";
	dates.reverse().forEach((d, i) => {
		camListHtml += "<li onClick='loadDateIndex(\""+d+"\")'>"+d+"</li>"
	});
	camListHtml += "</ul>";
	document.getElementById("camList").innerHTML = camListHtml;
}

function msgError(pMsg) {
	console.error(pMsg);
	alert(pMsg);
}

function loadDateIndex(pDate) {
	//console.log("loadDateIndex pDate="+pDate);
	for (var cam in gCamList) {
		loadCamDateIndex(cam, pDate);
	}
	gArchiveDate = pDate;
}

function loadCamDateIndex(pCam, pDate) {
	//console.log("loadCamDateIndex pCam="+pCam+" pDate="+pDate);
	fetch(".index/"+pCam+"/"+pDate+"_index.json")
		.then(response => response.json())
		.then(function(data) {
			//console.log('Got index.json for '+pCam, data);
			data = data[0].contents[0].contents; // skip root and 001 folders
			gArchivePhotoUrl[pCam]={};
			gArchiveVideoUrl[pCam]={};
			gArchiveVideoLength[pCam]={};
			data.forEach((o,i) => {
				if (o.type=="directory" && o.name=="dav") {
					o.contents.forEach((hho,i) => {
						if (hho.type=="directory") {
							hho.contents.forEach((fo,i)=> {
								if (fo.type=="file" && fo.name.slice(-4)==".mp4") {
									var mi = parseInt(fo.name.slice(3,5));
									var ss = parseInt(fo.name.slice(6,8));
									var ts1 = parseInt(hho.name)*3600 + mi*60 + ss;
									gArchiveVideoUrl[pCam][ts1] = pCam+"/"+pDate+"/001/dav/"+hho.name+"/"+fo.name;

									var hh = parseInt(fo.name.slice(9,11));
									mi = parseInt(fo.name.slice(12,14));
									ss = parseInt(fo.name.slice(15,17));
									var ts2 = hh*3600 + mi*60 + ss;
									if (ts2<ts1) {
										ts2 = MAX_TIMESTAMP;
									}
									gArchiveVideoLength[pCam][ts1] = (ts2-ts1);
								}
							});
						}
					});
				} else if (o.name="jpg") {
					o.contents.forEach((hho,i) => {
						if (hho.type=="directory") {
							hho.contents.forEach((mio,i)=> {
								if (mio.type=="directory") {
									mio.contents.forEach((fo,i)=> {
										if (fo.type=="file" && fo.name.slice(-4)==".jpg") {
											var ss = parseInt(fo.name,0,2);
											var ts = parseInt(hho.name)*3600 + parseInt(mio.name)*60 + ss;
											gArchivePhotoUrl[pCam][ts] = pCam+"/"+pDate+"/001/jpg/"+hho.name+"/"+mio.name+"/"+fo.name;
										}
									})
								}
							})
						}
					})
				}
			})
			drawTimeline(pCam);
		})
		.catch(err => {
			gArchivePhotoUrl[pCam]={};
			gArchiveVideoUrl[pCam]={};
			gArchiveVideoLength[pCam]={};
			drawTimeline(pCam);
			throw err;
		});	

}

function drawTimeline(pCam) {
	//console.log("drawTimeline pCam="+pCam);
	document.getElementById("watchLast").innerHTML = ""
	var divWatchDay = document.getElementById("watchDay");
	if (divWatchDay.innerHTML == "") {
		var html = '<div id="timelines" class="timeline">';
		for (var cam in gCamList) {
			html += '<canvas id="timeline-'+cam+'" width=1080 height=20 onmousemove="onTimelineSeek(\''+cam+'\',event)" onclick="onTimelineClick(\''+cam+'\',event)"></canvas>';
		}
		html += '</div>'+
			'<div id="archiveTime"></div>'+
			'<div class="archivePhoto"><img id="archivePhoto"/></div>' + 
			'<div class="archiveVideo"><video id="archiveVideo" width="100%" controls>Ваш браузер не поддерживает воспроизведение видео</video></div>';
		divWatchDay.innerHTML = html;
	}

	var cvs = document.getElementById("timeline-"+pCam);
	var ctx = cvs.getContext('2d');
	ctx.clearRect(0,0,1080,20);

	gArchivePhotoTimeMapping[pCam]=[];
	ctx.fillStyle = 'green';
	for (var i in gArchivePhotoUrl[pCam]) {
		var x = Math.floor(i*1080/TIMESTAMPS_COUNT);
		ctx.fillRect(x,0,1,20);
		gArchivePhotoTimeMapping[pCam][x]=i;
	}

	gArchiveVideoTimeMapping[pCam]=[];
	ctx.fillStyle = 'red';
	for (var i in gArchiveVideoUrl[pCam]) {
		var x = Math.floor(i*1080/TIMESTAMPS_COUNT);
		var dx = Math.ceil(gArchiveVideoLength[pCam][i]*1080/TIMESTAMPS_COUNT);
		var x2 = x + dx;
		ctx.fillRect(x,0,dx,20);
		for(; x<x2; x++) {
			gArchiveVideoTimeMapping[pCam][x]=i;
		}
	}
}

function idx2time(pIdx) {
	var hh = String(Math.floor(pIdx/3600)).padStart(2,'0');
	var mi = String(Math.floor((pIdx%3600)/60)).padStart(2,'0');
	var ss = String((pIdx%3600%60)).padStart(2,'0');
	return hh+":"+mi+":"+ss;
}


function onTimelineSeek(pCam, pEvent) {
	if (! gTimelineMouseOverEnabled) return;
	var cvs = document.getElementById("timeline-"+pCam);
	if (cvs == null) return;

	var x = pEvent.x - cvs.offsetLeft;
	var idx1 = Math.floor(x*TIMESTAMPS_COUNT/1080);
	var idx2 = idx1 + 79; // в 1 пиксел помещается 80 секунд
	var time = gArchiveDate + " " + idx2time(idx1)+"-"+idx2time(idx2);
	var divTime = document.getElementById("archiveTime");
	if (divTime != null) {
		divTime.innerHTML = '<a class="textButton" onClick="showPrev()">⬅️</a><a class="textButton" onClick="showNext()">➡️</a> ' + time;
	}
	var ts = gArchivePhotoTimeMapping[pCam][x];
	// console.log("onTimelineSeek pCam="+pCam+" pEvent.x="+pEvent.x+" cvs.offsetLeft="+cvs.offsetLeft+" x="+x+" idx1="+idx1+" idx2="+idx2+" time="+time+" ts="+ts);
	showPhoto(pCam, ts);
}


function showPhoto(pCam, pTimestamp) {
	var url;
	if (pTimestamp != undefined) {
		url = gArchivePhotoUrl[pCam][pTimestamp];
	}

	var imgArchiveVideo = document.getElementById("archiveVideo");
	if (imgArchiveVideo != null) {
		if (url != undefined || imgArchiveVideo.ended) {
			imgArchiveVideo.style.display = 'none';
		}
		if (url != undefined) { // а иначе пусть продолжается воспроизведение текущего видео
			imgArchiveVideo.pause();
		}
	}

	if (url != undefined) {
		var imgArchivePhoto = document.getElementById("archivePhoto");
		if (imgArchivePhoto != null) {
				imgArchivePhoto.style.display = 'block';
				imgArchivePhoto.src = url;
		}
		gCurrentMode = 'photo';
		gCurrentCam = pCam;
		gCurrentTimestamp = pTimestamp;
	}
	// console.log("showPhoto pCam="+pCam+" pTimestamp="+pTimestamp+" url="+url);
}


function onTimelineClick(pCam, pEvent) {
	var cvs = document.getElementById("timeline-"+pCam);
	if (cvs == null) return;

	var x = pEvent.x - cvs.offsetLeft;
	var ts;

	// console.log("onTimelineClick pCam="+pCam+" pEvent.x="+pEvent.x+" cvs.offsetLeft="+cvs.offsetLeft+" x="+x);
	// ищем сначала в точке, затем расходимся в стороны +- 2px. Когда вокруг нет других видео, так проще попадать
	for (var i=0; i<3; i++) {
		ts = gArchiveVideoTimeMapping[pCam][x+i];
		if (ts != undefined) {
			//console.log(" found @ i="+i+" idx="+(x+i))
			showVideo(pCam, ts);
			break;
		}
		ts = gArchiveVideoTimeMapping[pCam][x-i];
		if (ts != undefined) {
			//console.log(" found @ i="+(-i)+" idx="+(x-i))
			showVideo(pCam, ts);
			break;
		}
	}
}

	
function showVideo(pCam, pTimestamp) {
	var url;
	url = gArchiveVideoUrl[pCam][pTimestamp];
	if (url != undefined) {
		var imgArchiveVideo = document.getElementById("archiveVideo");
		if (imgArchiveVideo != null) {
				
				imgArchiveVideo.src = url;
				imgArchiveVideo.style.display = 'block';
				imgArchiveVideo.play();
				gTimelineMouseOverEnabled = false;
				window.setTimeout('gTimelineMouseOverEnabled = true', 3000);

				var imgArchivePhoto = document.getElementById("archivePhoto");
				if (imgArchivePhoto != null) {
						imgArchivePhoto.style.display = 'none';
				}				
		}
		gCurrentMode = 'video';
		gCurrentCam = pCam;
		gCurrentTimestamp = pTimestamp;
	}
	// console.log("showVideo pCam="+pCam+" pTimestamp="+pTimestamp+" url="+url);
}


function showPrev() {
	// console.log("showPrev gCurrentMode="+gCurrentMode+" gCurrentCam="+gCurrentCam+" gCurrentTimestamp="+gCurrentTimestamp);
	var ts = gCurrentTimestamp;
	ts--;
	if (gCurrentMode == 'photo') {
		while(ts >= MIN_TIMESTAMP) {
			if (gArchivePhotoUrl[gCurrentCam][ts] != undefined) {
				showPhoto(gCurrentCam, ts);
				break;
			}
			ts--;
		}
	} else if (gCurrentMode == 'video') {
		while(ts >= MIN_TIMESTAMP) {
			if (gArchiveVideoUrl[gCurrentCam][ts] != undefined) {
				showVideo(gCurrentCam, ts);
				break;
			}
			ts--;
		}
	}
}



function showNext() {
	// console.log("showNext gCurrentMode="+gCurrentMode+" gCurrentCam="+gCurrentCam+" gCurrentTimestamp="+gCurrentTimestamp);
	var ts = gCurrentTimestamp;
	ts++;
	if (gCurrentMode == 'photo') {
		while(ts <= MAX_TIMESTAMP) {
			if (gArchivePhotoUrl[gCurrentCam][ts] != undefined) {
				showPhoto(gCurrentCam, ts);
				break;
			}
			ts++;
		}
	} else if (gCurrentMode == 'video') {
		while(ts <= MAX_TIMESTAMP) {
			if (gArchiveVideoUrl[gCurrentCam][ts] != undefined) {
				showVideo(gCurrentCam, ts);
				break;
			}
			ts++;
		}
	}
}
