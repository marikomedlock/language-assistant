function record_audio() { $.jRecorder.record(300); }

function stop_record_audio() { $.jRecorder.stop(); }

function send_audio() { $.jRecorder.sendData(); }

function callback_finished() {
	//$('#status').html('Recording is finished');
	$("#status").text();
}

function callback_started() {
	//$('#status').html('Recording is started');
	$("#status").html("click <img src=\""+GLOBAL_JSONstate.webURL+"/icons/stop.png\" width=10 height=10 alt='black square'> to stop");
}

function callback_error(code) {
	$('#status').html('Error, code:' + code);
}

function callback_stopped() {
	//$('#status').html('Stop request is accepted');
	$("#status").html("replaying audio now...<br>click <img src=\""+web_url+"/icons/green_check.png\" width=10 height=10 alt='green check'> to save");
}

function callback_finished_recording() {
	//$('#status').html('Recording event is finished');
	$("#status").html("replaying audio now...<br>click <img src=\""+web_url+"/icons/green_check.png\" width=10 height=10 alt='green check'> to save");
}

function callback_finished_sending() {
	//$('#status').html('File has been sent to server mentioned as host parameter');
	$("#status").html('saving audio file...');

	send_idfetch();
}

var idfetch_ctr = 0;
function send_idfetch() {
	$.ajax({ //send ajax delete request
		type:"POST",
		cache:false,
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/upload.cgi",
		dataType:"html",
		data:{"action":"recordIDFetch","blueprintid":GLOBAL_JSONstate.blueprintid},
		success: function(data_back) {
			data_back = jQuery.parseJSON(data_back);
			if(data_back["status"]==1) { //id_fetch successful
				done_save_audio(data_back["url"]);
				idfetch_ctr = 0;
			}
			else { //delete not successful
				if(idfetch_ctr>15) { alert("save audio failed"); return; }
				idfetch_ctr++;
				return send_idfetch();
			}
		}
	});
}

function done_save_audio(returnURL) {
	//close overlay, show saved audio URL
	$("#status_msg").text("audio saved");
	
	recordUploadFinishFUNC(GLOBAL_JSONstate.webURL+"/"+returnURL);
	recordUploadFinishFUNC = 0;
}

function callback_activityLevel(level) {
	$('#level').html(level);

	if(level == -1) { $('#levelbar').css("width",  "2px"); }
	else { $('#levelbar').css("width", (level * 2)+ "px"); }
}

function callback_activityTime(time) {
	//$('.flrecorder').css("width", "1px"); 
	//$('.flrecorder').css("height", "1px"); 
	$('#time').html(time); 
}