// openutils.js
// **********************************************
//		adjustSizeDiv


function showEditText(msg,textSTR,onfinishFUNC) {

	// build html every time
	var edittext_html = "<div id='opendrillD2_content' class='content'>";
	edittext_html += "<header class='page-entry-header'><h1 class='entry-title'>edit text</h1></header>";
	edittext_html += "<div class='wpcf7'>";
	edittext_html += "<span id='opendrillD2_message_span' class='msg'>"+msg+"</span>";
	edittext_html += "<div id='opendrillD2_textdiv_div'>";
	edittext_html += "<label class='tabs_label' id='textdiv_text_label' for='textdiv_text_input'>Text</label>";
	edittext_html += "<textarea id='textdiv_text_input' class='tabs_input'></textarea>";
	edittext_html += "</div>";
	edittext_html += "<br><br>";
	edittext_html += "<button id='opendrillD2_button_cancel'>cancel</button>";
	edittext_html += "&nbsp&nbsp&nbsp&nbsp";
	edittext_html += "<button id='opendrillD2_button_done'>done</button>";
	edittext_html += "<br><br>";
	edittext_html += "</div>";
	edittext_html += "</div>";

	// edit text
	$("#opendrillD2_dialog").dialog("close");
	$("body").append("<div id='opendrillD2_dialog' style='display:none; text-align:center'></div>");
	$("#opendrillD2_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#opendrillD2_dialog").dialog("destroy"); $("#opendrillD2_dialog").remove(); }
	});

	$("#opendrillD2_dialog").html(edittext_html);
	$("#textdiv_text_input").val(textSTR);

	// Handler : cancel dialog
	$("#opendrillD2_button_cancel").button().unbind("click").click(function() { $("#opendrillD2_dialog").dialog("close"); });
	
	// Handler : done dialog, call return function
	$("#opendrillD2_button_done").button().unbind("click").click(function() {
		var returnSTR = $("#textdiv_text_input").val();

		$("#opendrillD2_dialog").dialog("close");
		onfinishFUNC(returnSTR);
	});
}

function showEditMultipleChoice(msg,choicesARR,onfinishFUNC) {

	// build html every time
	var choicesHTML = "";
	$.each(choicesARR,function(key,val) { choicesHTML += "<option value=\""+val+"\">"+val+"</option>"; });
	
	var editmc_html = "<div id='opendrillD2_content' class='content'>";
	editmc_html += "<header class='page-entry-header'><h1 class='entry-title'>edit multiple choice</h1></header>";
	editmc_html += "<div class='wpcf7'>";
	editmc_html += "<span id='opendrillD2_message_span' class='msg'>"+msg+"</span>";
	editmc_html += "<br><br>";
	editmc_html += "<select id='opendrillD2_select_choices' class='tabs_input'>"+choicesHTML+"</select>";
	editmc_html += "<br><span id='opendrillD2_error_span' class='msg'></span><br>";
	editmc_html += "<span id='opendrillD2_span_deletechoice' class='tabs_input' style='font-size:11px'></span>";
	editmc_html += "&nbsp&nbsp&nbsp&nbsp";
	editmc_html += "<button id='opendrillD2_button_deletechoice' class='tabs_input' style='font-size:11px'>delete choice</button>";
	editmc_html += "<br><br>";
	editmc_html += "<input id='opendrillD2_input_addchoice' class='tabs_input' type='text' style='font-size:11px'/>";
	editmc_html += "&nbsp&nbsp&nbsp&nbsp";
	editmc_html += "<button id='opendrillD2_button_addchoice' class='tabs_input' style='font-size:11px'>add choice</button>";
	editmc_html += "<br><br>";
	editmc_html += "<button id='opendrillD2_button_cancel'>cancel</button>";
	editmc_html += "&nbsp&nbsp&nbsp&nbsp";
	editmc_html += "<button id='opendrillD2_button_done'>done</button>";
	editmc_html += "<br><br>";
	editmc_html += "</div>";
	editmc_html += "</div>";

	// edit multiple choices
	$("#opendrillD2_dialog").dialog("close");
	$("body").append("<div id='opendrillD2_dialog' style='display:none; text-align:center'></div>");
	$("#opendrillD2_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#opendrillD2_dialog").dialog("destroy"); $("#opendrillD2_dialog").remove(); }
	});

	$("#opendrillD2_dialog").html(editmc_html);
	
	// Handler : change currently selected span (for delete)
	$("#opendrillD2_select_choices").unbind("change").change(function() {
		$("#opendrillD2_span_deletechoice").text($("#opendrillD2_select_choices").val() +" (currently selected)")
	});
	$("#opendrillD2_select_choices").change();
	
	// Handler : add new choice
	$("#opendrillD2_button_addchoice").button().unbind("click").click(function() {
		var newchoice = $("#opendrillD2_input_addchoice").val();
		newchoice = forceJSONsafe(newchoice,'');
		if(newchoice=="") { $("#opendrillD2_error_span").text("please enter a new choice"); }
		else if($("#opendrillD2_select_choices>option[value=\""+newchoice+"\"]").length>0) { $("#opendrillD2_error_span").text("this choice already exists"); }
		else {
			$("#opendrillD2_select_choices").append("<option value=\""+newchoice+"\">"+newchoice+"</option>");
			$("#opendrillD2_select_choices").change();
			$("#opendrillD2_error_span").text("choice added : "+newchoice);
		}
	});
	
	// Handler : delete choice
	$("#opendrillD2_button_deletechoice").button().unbind("click").click(function() {
		var deletevalue = $("#opendrillD2_select_choices").val();
		if(!deletevalue || deletevalue=="") { $("#opendrillD2_error_span").text("no choices to delete"); return; }
		var newselect_html = "";
		$("#opendrillD2_select_choices>option").each(function() {
			if($(this).attr("value")!=deletevalue) {
				newselect_html += "<option value=\""+$(this).attr("value")+"\">"+$(this).attr("value")+"</option>";
			}
		});
		$("#opendrillD2_select_choices").html(newselect_html).change();
		$("#opendrillD2_error_span").text("choice deleted : "+deletevalue);
	});
	
	// Handler : cancel dialog
	$("#opendrillD2_button_cancel").button().unbind("click").click(function() { $("#opendrillD2_dialog").dialog("close"); });
	
	// Handler : done dialog, call return function
	$("#opendrillD2_button_done").button().unbind("click").click(function() {
		var returnARR = [];
		$("#opendrillD2_select_choices>option").each(function(key) { returnARR.push($(this).attr("value")); });

		$("#opendrillD2_dialog").dialog("close");
		onfinishFUNC(returnARR);
	});
}

function showEditImage(msg,imageURL,imageHeight,imageWidth,onfinishFUNC) {

	// build html every time
	var editimage_html = "<div id='opendrillD2_content' class='content'>";
	editimage_html += "<header class='page-entry-header'><h1 class='entry-title'>edit image</h1></header>";
	editimage_html += "<div class='wpcf7'>";
	editimage_html += "<span id='opendrillD2_message_span' class='msg'>"+msg+"</span>";
	editimage_html += "<br><span id='opendrillD2_error_span' class='msg'></span><br>";
	editimage_html += "<input id='editimage_na_radio' class='tabs_input' type='radio' name='editimage_radiogroup'/>";
	editimage_html += "<label class='tabs_label' id='editimage_na_label' for='editimage_na_radio'>No image</label>";
	editimage_html += "<div id='editimage_na_div' style='font-size:11px'>";
	editimage_html += "<br><br>";
	editimage_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editimage_html += "<button id='editimage_na_button' class='tabs_input'>remove current image</button></span>";
	editimage_html += "<br>";
	editimage_html += "</div>";
	editimage_html += "<br>";
	editimage_html += "<input id='editimage_link_radio' class='tabs_input' type='radio' name='editimage_radiogroup'/>";
	editimage_html += "<label class='tabs_label' id='editimage_link_label' for='editimage_link_radio'>Link to an image (on the internet)</label>";
	editimage_html += "<div id='editimage_link_div' style='font-size:11px'>";
	editimage_html += "<br>";
	editimage_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editimage_html += "URL address: <input id='editimage_link_input' class='tabs_input' type='text'/><br>";
	editimage_html += "<button id='editimage_link_button' class='tabs_input'>load link</button></span>";
	editimage_html += "<br><br><br>";
	editimage_html += "</div>";
	editimage_html += "<br>";
	editimage_html += "<input id='editimage_upload_radio' class='tabs_input' type='radio' name='editimage_radiogroup'/>";
	editimage_html += "<label class='tabs_label' id='editimage_upload_label' for='editimage_upload_radio'>Upload an image (from this computer)</label>";
	editimage_html += "<div id='editimage_upload_div' style='font-size:11px'>";
	editimage_html += "<br>";
	editimage_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editimage_html += "<input id='editimage_upload_input' class='tabs_input' type='file'/><br>";
	editimage_html += "<button id='editimage_upload_button' class='tabs_input'>upload file</button></span>";
	editimage_html += "<br><br>";
	editimage_html += "</div>";
	editimage_html += "<br><br><br>";
	editimage_html += "<div id='opendrillD2_preview_div' imageURL=''></div><br>";
	editimage_html += "<button id='opendrillD2_button_cancel'>cancel</button>";
	editimage_html += "&nbsp&nbsp&nbsp&nbsp";
	editimage_html += "<button id='opendrillD2_button_done'>done</button>";
	editimage_html += "<br><br>";
	editimage_html += "</div>";
	editimage_html += "</div>";

	// edit image
	$("#opendrillD2_dialog").dialog("close");
	$("body").append("<div id='opendrillD2_dialog' style='display:none; text-align:center'></div>");
	$("#opendrillD2_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#opendrillD2_dialog").dialog("destroy"); $("#opendrillD2_dialog").remove(); }
	});

	$("#opendrillD2_dialog").html(editimage_html);
	
	loadImage(imageURL,imageHeight,imageWidth,"opendrillD2_preview_div",function(){});

	// Handler : radio buttons
	$("#editimage_na_radio,#editimage_link_radio,#editimage_upload_radio").unbind("change").change(function() {
		if($("#editimage_na_radio").prop("checked") && $("#opendrillD2_preview_div").attr("imageURL")!="") { $("#editimage_na_div").show(); }
		else { $("#editimage_na_div").hide(); }		
	
		if($("#editimage_link_radio").prop("checked")) { $("#editimage_link_div").show(); }
		else { $("#editimage_link_div").hide(); }
		
		if($("#editimage_upload_radio").prop("checked")) { $("#editimage_upload_div").show(); }
		else { $("#editimage_upload_div").hide(); }
	});
	
	$("#editimage_link_radio").prop("checked",true);
	$("#editimage_link_input").val(imageURL);
	$("#editimage_link_radio").change();

	// Handler : no image button
	$("#editimage_na_button").button().unbind("click").click(function() {
		loadImage("",50,50,"opendrillD2_preview_div",function(){});
		$("#editimage_na_div").hide();
	});

	// Handler : link button
	$("#editimage_link_button").button().unbind("click").click(function() {
		loadImage($("#editimage_link_input").val(),50,50,"opendrillD2_preview_div",function(){});
	});
	
	// Handler : upload button
	$("#editimage_upload_button").button().unbind("click").click(function() {
		uploadFile("editimage_upload_input",{"action":"uploadImage"},function(returnURL) {
			loadImage(returnURL,50,50,"opendrillD2_preview_div",function(){});
		});
	});
	
	// Handler : cancel dialog
	$("#opendrillD2_button_cancel").button().unbind("click").click(function() { $("#opendrillD2_dialog").dialog("close"); });
	
	// Handler : done dialog, call return function
	$("#opendrillD2_button_done").button().unbind("click").click(function() {
		var returnURL = $("#opendrillD2_preview_div").attr("imageURL");
		var returnHeight = $("#opendrillD2_preview_div_spinnerHeight").val();
		var returnWidth = $("#opendrillD2_preview_div_spinnerWidth").val();
		
		$("#opendrillD2_dialog").dialog("close");
		onfinishFUNC(returnURL,returnHeight,returnWidth);
	});
}

function showEditAudio(msg,audioURL,onfinishFUNC) {

	// build html every time
	var editaudio_html = "<div id='opendrillD2_content' class='content'>";
	editaudio_html += "<header class='page-entry-header'><h1 class='entry-title'>edit audio</h1></header>";
	editaudio_html += "<div class='wpcf7'>";
	editaudio_html += "<span id='opendrillD2_message_span' class='msg'>"+msg+"</span>";
	editaudio_html += "<br><span id='opendrillD2_error_span' class='msg'></span><br>";
	editaudio_html += "<input id='editaudio_na_radio' class='tabs_input' type='radio' name='editaudio_radiogroup'/>";
	editaudio_html += "<label class='tabs_label' id='editaudio_na_label' for='editaudio_na_radio'>No audio</label>";
	editaudio_html += "<div id='editaudio_na_div' style='font-size:11px'>";
	editaudio_html += "<br><br>";
	editaudio_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editaudio_html += "<button id='editaudio_na_button' class='tabs_input'>remove current audio</button></span>";
	editaudio_html += "<br>";
	editaudio_html += "</div>";
	editaudio_html += "<br>";
	editaudio_html += "<input id='editaudio_link_radio' class='tabs_input' type='radio' name='editaudio_radiogroup'/>";
	editaudio_html += "<label class='tabs_label' id='editaudio_link_label' for='editaudio_link_radio'>Link to an audio file (on the internet)</label>";
	editaudio_html += "<div id='editaudio_link_div' style='font-size:11px'>";
	editaudio_html += "<br>";
	editaudio_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editaudio_html += "URL address: <input id='editaudio_link_input' class='tabs_input' type='text'/><br>";
	editaudio_html += "<button id='editaudio_link_button' class='tabs_input'>load link</button></span>";
	editaudio_html += "<br><br><br>";
	editaudio_html += "</div>";
	editaudio_html += "<br>";
	editaudio_html += "<input id='editaudio_upload_radio' class='tabs_input' type='radio' name='editaudio_radiogroup'/>";
	editaudio_html += "<label class='tabs_label' id='editaudio_upload_label' for='editaudio_upload_radio'>Upload an audio file (from this computer)</label>";
	editaudio_html += "<div id='editaudio_upload_div' style='font-size:11px'>";
	editaudio_html += "<br>";
	editaudio_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editaudio_html += "<input id='editaudio_upload_input' class='tabs_input' type='file'/><br>";
	editaudio_html += "<button id='editaudio_upload_button' class='tabs_input'>upload file</button></span>";
	editaudio_html += "<br><br><br>";
	editaudio_html += "</div>";
	editaudio_html += "<br>";
	editaudio_html += "<input id='editaudio_record_radio' class='tabs_input' type='radio' name='editaudio_radiogroup'/>";
	editaudio_html += "<label class='tabs_label' id='editaudio_record_label' for='editaudio_record_radio'>Make a new audio recording</label>";
	editaudio_html += "<div id='editaudio_record_div' style='font-size:11px'>";
	editaudio_html += "<br><br>";
	editaudio_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
	editaudio_html += "<button id='editaudio_record_button' class='tabs_input'>load recorder</button></span>";
	editaudio_html += "</div>";
	editaudio_html += "<br><br>";
	editaudio_html += "<div id='opendrillD2_preview_div' audioURL=''></div><br>";
	editaudio_html += "<button id='opendrillD2_button_cancel'>cancel</button>";
	editaudio_html += "&nbsp&nbsp&nbsp&nbsp";
	editaudio_html += "<button id='opendrillD2_button_done'>done</button>";
	editaudio_html += "<br><br>";
	editaudio_html += "</div>";
	editaudio_html += "</div>";

	// edit audio
	$("#opendrillD2_dialog").dialog("close");
	$("body").append("<div id='opendrillD2_dialog' style='display:none; text-align:center'></div>");
	$("#opendrillD2_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#opendrillD2_dialog").dialog("destroy"); $("#opendrillD2_dialog").remove(); }
	});

	$("#opendrillD2_dialog").html(editaudio_html);
	
	loadAudio(audioURL,"opendrillD2_preview_div",function(){});

	// Handler : radio buttons
	$("#editaudio_na_radio,#editaudio_link_radio,#editaudio_upload_radio,#editaudio_record_radio").unbind("change").change(function() {
		if($("#editaudio_na_radio").prop("checked") && $("#opendrillD2_preview_div").attr("audioURL")!="") { $("#editaudio_na_div").show(); }
		else { $("#editaudio_na_div").hide(); }		
	
		if($("#editaudio_link_radio").prop("checked")) { $("#editaudio_link_div").show(); }
		else { $("#editaudio_link_div").hide(); }
		
		if($("#editaudio_upload_radio").prop("checked")) { $("#editaudio_upload_div").show(); }
		else { $("#editaudio_upload_div").hide(); }
		
		if($("#editaudio_record_radio").prop("checked")) { $("#editaudio_record_div").show(); }
		else { $("#editaudio_record_div").hide(); }
	});
	
	$("#editaudio_link_radio").prop("checked",true);
	$("#editaudio_link_input").val(audioURL);
	$("#editaudio_link_radio").change();

	// Handler : no audio button
	$("#editaudio_na_button").button().unbind("click").click(function() {
		loadAudio("","opendrillD2_preview_div",function(){});
		$("#editaudio_na_div").hide();
	});

	// Handler : link button
	$("#editaudio_link_button").button().unbind("click").click(function() {
		loadAudio($("#editaudio_link_input").val(),"opendrillD2_preview_div",function(){});
	});
	
	// Handler : upload button
	$("#editaudio_upload_button").button().unbind("click").click(function() {
		uploadFile("editaudio_upload_input",{"action":"uploadAudio"},function(returnURL) {
			loadAudio(returnURL,"opendrillD2_preview_div",function(){});
		});
	});
	
	// Handler : record button
	$("#editaudio_record_button").button().unbind("click").click(function() {
		showRecorder("",{"action":"uploadRecord","display":"ajax","canSave":true},function(returnURL) {
			loadAudio(returnURL,"opendrillD2_preview_div",function(){});
		});
	});
	
	// Handler : cancel dialog
	$("#opendrillD2_button_cancel").button().unbind("click").click(function() { $("#opendrillD2_dialog").dialog("close"); });
	
	// Handler : done dialog, call return function
	$("#opendrillD2_button_done").button().unbind("click").click(function() {
		var returnURL = $("#opendrillD2_preview_div").attr("audioURL");
		
		$("#opendrillD2_dialog").dialog("close");
		onfinishFUNC(returnURL);
	});
}

var recordUploadFinishFUNC;
function showRecorder(msg,formJSON,onfinishFUNC) {

	// student recording
	if(!formJSON.canSave && parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		// build html every time
		var studentRecorder_html = "<div id='opendrill_content' class='content'>";
		studentRecorder_html += "<header class='page-entry-header'><h1 class='entry-title'>student audio recording</h1></header>";
		studentRecorder_html += "<div class='wpcf7'>";
		studentRecorder_html += "<span id='opendrill_message_span' class='msg'>please go to the student view to use this recording function.</span>";
		studentRecorder_html += "<br><br>";
		studentRecorder_html += "<button id='opendrill_button_send' name='student view'>student view</button>";
		studentRecorder_html += "&nbsp&nbsp&nbsp&nbsp";
		studentRecorder_html += "<button id='opendrill_button_cancel' name='cancel'>cancel</button>";
		studentRecorder_html += "<br><br>";
		studentRecorder_html += "</div>";
		studentRecorder_html += "</div>";
	
		// confirm delete
		$("#opendrill_dialog").dialog("close");
		$("body").append("<div id='opendrill_dialog' style='display:none; text-align:center'></div>");
		$("#opendrill_dialog").dialog({
			autoOpen:true, position:["center","top"],
			width:400,
			modal:true,
			close: function() { $("#opendrill_dialog").dialog("destroy"); $("#opendrill_dialog").remove(); }
		});

		$("#opendrill_dialog").html(studentRecorder_html);
		
		// add click handler to buttons
		$("#opendrill_button_send").button().unbind("click").click(function() { gotoStudentView(); });
		$("#opendrill_button_cancel").button().unbind("click").click(function() { $("#opendrill_dialog").dialog("close"); });
	}
	else {
		// build recorder dialog html
		var recorder_html = "<span class='msg' id='status'></span><br><br>";
		recorder_html += "<div>";
		recorder_html += "<a id='record_button' href='javascript:void(0)' title='record'>";
		recorder_html += "<img src=\""+GLOBAL_JSONstate.webURL+"/icons/record.png\" width='50' height='50' alt='record'/></a>&nbsp &nbsp";
		recorder_html += "<a id='stop_button' href='javascript:void(0)' title='stop'>";
		recorder_html += "<img src=\""+GLOBAL_JSONstate.webURL+"/icons/stop.png\" width='50' height='50' alt='stop'/></a>&nbsp &nbsp";
		recorder_html += "<a id='save_audio_button' href='javascript:void(0)' title='save'>";
		recorder_html += "<img src=\""+GLOBAL_JSONstate.webURL+"/icons/green_check.png\" width='50' height='50' alt='save'/></a>";
		recorder_html += "<br><br>";
		recorder_html += "<div><span style='display:none' id='level'></span></div>";
		recorder_html += "<div id='levelbase' style='width:200px;height:20px;background-color:#CCC;float:center'>";
		recorder_html += "<div id='levelbar' style='height:19px; width:2px;background-color:green'></div>";
		recorder_html += "</div>";
		recorder_html += "<div>Time: <span id='time'>00:00</span> seconds</div>";
		
		recorder_html += "<input name='authenticity_token' value='xxxxx' type='hidden'>";
		recorder_html += "<input name='upload_file[parent_id]' value='1' type='hidden'>";
		recorder_html += "<input name='format' value='json' type='hidden'>";
		recorder_html += "<input id='canSave' type='hidden' value="+(formJSON["canSave"] ? 1 : 0)+">";
	
		recorder_html += "</div>";
		
		// open dialog
		$("#recorder_dialog").remove();
		$("body").append("<div id='recorder_dialog' style='display:none; text-align:center'></div>");
		$("#recorder_dialog").dialog({
			autoOpen:true, position:["center","top"],
			width:500,
			modal:true,
			close:function() { if(formJSON["canSave"]==1) { stop_record_audio(); } $("#recorder_dialog").dialog("destroy"); $("#recorder_dialog").remove(); }
		});
		$("#recorder_dialog").html(recorder_html);
	
		if(formJSON["canSave"]==0) { $("#save_audio_button").hide(); }
	
		$("#record_button").unbind("click").click(function() { record_audio(); });
		$("#stop_button").unbind("click").click(function() { stop_record_audio(); });
		$("#save_audio_button").unbind("click").click(function(){
			if(formJSON["canSave"]==1) { send_audio(); }
			else { alert("recorder cannot save files in this mode."); }
		})
		$("#status").html("click <img src=\""+GLOBAL_JSONstate.webURL+"/icons/record.png\" width=10 height=10 alt='red circle'> to record");
		
		recordUploadFinishFUNC = function(returnURL) { $("#recorder_dialog").dialog("close"); onfinishFUNC(returnURL); };
	}
}


function loadImage(imageURL,imageHeight,imageWidth,imgdivid,onloadFUNC) {

	// build image html
	var img_html = "<span id=\""+imgdivid+"_msgspan\" class='feedback'></span>";
	img_html += "<img id=\""+imgdivid+"_img\" src=\""+imageURL+"\">";

	$("#"+imgdivid).empty().html(img_html);

	if(imageURL=="") {
		$("#"+imgdivid+"_msgspan").html("no image selected<br>");
		$("#"+imgdivid+"_img").hide();
		
		$("#"+imgdivid).attr("imageURL",imageURL);
		$("#"+imgdivid+"_spinnerHeight").val(0);
		$("#"+imgdivid+"_spinnerWidth").val(0);
		onloadFUNC();
	}
	else {
		$("#"+imgdivid+"_msgspan").html("loading image....<br>");
		$("#"+imgdivid+"_img").show();

		$("#"+imgdivid+"_img").load(function() { // image loaded
			$("#"+imgdivid).css("font-size","11px");
			$("#"+imgdivid+"_img").height(imageHeight).width(imageWidth);
			
			var spinners_html = "height : <input id=\""+imgdivid+"_spinnerHeight\" style='font-size:11px; width:30px'>";
			spinners_html += "&nbsp&nbsp&nbsp&nbsp";
			spinners_html += "width : <input id=\""+imgdivid+"_spinnerWidth\" style='font-size:11px; width:30px'><br><br>";
			$("#"+imgdivid+"_msgspan").replaceWith(spinners_html);
			
			$("#"+imgdivid).attr("imageURL",imageURL);
			
			$("#"+imgdivid+"_spinnerHeight").spinner({
				min:1,
				spin:function() { $("#"+imgdivid+"_img").height($("#"+imgdivid+"_spinnerHeight").val()); },
				change:function() { $("#"+imgdivid+"_img").height($("#"+imgdivid+"_spinnerHeight").val()); }
			}).val(imageHeight);
			$("#"+imgdivid+"_spinnerWidth").spinner({
				min:1,
				spin:function() { $("#"+imgdivid+"_img").width($("#"+imgdivid+"_spinnerWidth").val()); },
				change:function() { $("#"+imgdivid+"_img").width($("#"+imgdivid+"_spinnerWidth").val()); }
			}).val(imageWidth);
			onloadFUNC();
		}).error(function() { // error loading image
			$("#"+imgdivid+"_img").remove();
			$("#"+imgdivid+"_msgspan").html("error loading image<br>");
			onloadFUNC();
		});
	}
}

function loadAudio(audioURL,audiodivid,onloadFUNC) {

	// build audio html
	var audio_html = "<span id=\""+audiodivid+"_msgspan\" class='feedback'></span>";
	audio_html += "<audio controls id=\""+audiodivid+"_audio\">";
	audio_html += "<source src=\""+audioURL+"\">";
	audio_html += "<a id=\""+audiodivid+"_link\" style='font-size:11px' href=\""+audioURL+"\">download this audio file</a>";
	audio_html += "</audio>";

	$("#"+audiodivid).empty().html(audio_html);

	if(audioURL=="") {
		$("#"+audiodivid+"_msgspan").html("no audio selected<br>");
		$("#"+audiodivid+"_audio").hide();
		
		$("#"+audiodivid).attr("audioURL",audioURL);
		$("#"+audiodivid).attr("audioDuration",-1);
		$("#"+audiodivid+"_link").attr("href",audioURL);
		onloadFUNC();
	}
	else {
		$("#"+audiodivid+"_msgspan").remove();
		$("#"+audiodivid+"_audio").show().height(30).width(250);
		
		$("#"+audiodivid).css("font-size","11px");	
		$("#"+audiodivid).attr("audioURL",audioURL);
		$("#"+audiodivid+"_link").attr("href",audioURL);
		onloadFUNC();
	}
}

function uploadFile(fileinputid,formJSON,onfinishFUNC) {

	// build form data object
	var outForm = new FormData();
	outForm.append("uploadfile",$("#"+fileinputid).get(0).files[0]);
	outForm.append("uploadfilestr",$("#"+fileinputid).val());
	outForm.append("blueprintid",GLOBAL_JSONstate.blueprintid);
	$.each(formJSON,function(key,val) { outForm.append(key,val); });

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/upload.cgi",
		type:"POST",
		data:outForm,
		processData:false,  // tell jQuery not to process the data
		contentType:false,  // tell jQuery not to set contentType
		success:function(returnData) {
				var returnURL = "";

				// no return
				if(!returnData) { alert("upload failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) { returnURL = GLOBAL_JSONstate.webURL+"/"+returnData.url; }
					// failure
					else { alert("upload failed : \n\n"+returnData); }
				}

				onfinishFUNC(returnURL);
			}
	});
	
}


function gotoStudentView() {
	
	// set redirect URL to this blueprint page
	GLOBAL_JSONstate.redirectURL = GLOBAL_JSONstate.webURL+"/cgi-bin/opendrill.cgi?blueprintid="+GLOBAL_JSONstate.blueprintid;
	
	// logout
	logout();
}


function forceJSONsafe(str) {
	var regex_pattern = new RegExp("[\"]","g");
	var forced_str = str.replace(regex_pattern,"'");
	
	return forced_str;
}

function clearSelection() {

	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else if (document.selection) {  // IE?
		document.selection.empty();
	}
}

function adjustSizeDiv(divid) {
	var div_height = $(window).height() -$("#"+divid).offset().top -60;
	if(div_height < 100) { div_height = 100; }
	
	$("#"+divid).height(div_height).css("overflow","auto");
}


function html_encode_str(str) {
	var encoded_str = str;
	if(str.match(/\n/)) { encoded_str = "&nbsp;"; }
	else if(str.match(/\s/)) { encoded_str = "&nbsp;"; }
	
	return encoded_str;
}

function json_escape_str(str) {
	var escaped_str = str;
	escaped_str = escaped_str.replace(/&nbsp/g," ");
	escaped_str = escaped_str.replace(/<br>/g,"\n");
	escaped_str = escaped_str.replace(/\n/g,"\\n");
	
	return escaped_str;
}

function json_unescape_str(str) {
	var unescaped_str = str;
	unescaped_str = unescaped_str.replace(/\\n/g,"\n");
	
	return unescaped_str;
}

function remove_newlines(str) {
	var nonewlines_str = str;
	nonewlines_str = nonewlines_str.replace(/<br>/g,"");
	nonewlines_str = nonewlines_str.replace(/\\n/g,"");
	nonewlines_str = nonewlines_str.replace(/\n/g,"");
	
	return nonewlines_str;
}

function text_to_htmlnewlines(str) {
	var htmlnewlines_str = str;
	htmlnewlines_str = htmlnewlines_str.replace(/\\n/g,"<br>");
	htmlnewlines_str = htmlnewlines_str.replace(/\n/g,"<br>");
	
	return htmlnewlines_str;
}

function add_rubytext(str) {
	var rubytext_str = str;
	rubytext_str = rubytext_str.replace(/「(.*?)｜(.*?)」/g,"<ruby> $1 <rp>（</rp> <rt>$2</rt> <rp>）</rp> </ruby>");
	
	return rubytext_str;
}