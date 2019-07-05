// opendrill.js
// **********************************************
//		checkJS_opendrill
//		parseJSON_opendrill
//		notloggedin
//
//		openDrill
//		appendQuestion
//
//		selectQuestion
//		showExplain
//		showInstructions
//		checkAnswers
//
//		showRearrangeQuestions
//		rearrangeQuestions
//		showDeleteQuestion
//		deleteQuestion
//		showEditQuestion
//		editQuestion
//		showNewQuestion
//		showEditInstructions
//		editInstructions
//
//		showEditQuestion_questionTab
//		showEditQuestion_responseTab
//		showEditQuestion_explainTab
//		showEditInstructions_instructionDiv
//
//		editQuestion_buildSendData
//		editInstructions_buildSendData
//
//		updateImageSpan
//		updateAudioSpan


var GLOBAL_JSONdrills;
var GLOBAL_JSONinstructions;
function checkJS_opendrill() {
	// separate lesson JSON into drills,instructions
	GLOBAL_JSONinstructions = $.extend(true, {}, GLOBAL_JSONlesson.instructions);
	GLOBAL_JSONdrills = GLOBAL_JSONlesson;
	delete GLOBAL_JSONdrills.instructions;

	// build html for top bar
	var topbar_html = "<div id='topbar_div' style='border:2px #E04006 solid; padding:4px; margin:4px;'>";
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		topbar_html += "<button id='checkanswers_button' style='font-size:10pt'>check answers</button>";
		topbar_html += "<button id='showinstructions_button' style='font-size:10pt'>show instructions</button>";
		topbar_html += "&nbsp&nbsp&nbsp&nbsp";
		topbar_html += "<button id='rearrangequestions_button' style='font-size:10pt'>rearrange questions</button>";
		topbar_html += "<button id='newquestion_button' style='font-size:10pt'>new question</button>";
		topbar_html += "&nbsp&nbsp&nbsp&nbsp";
		topbar_html += "<button id='edittop_button' style='font-size:10pt'>edit</button>";
		topbar_html += "<button id='deletetop_button' style='font-size:10pt'>delete</button>";
	}
	else {
		topbar_html += "<button id='checkanswers_button' style='font-size:10pt'>check answers</button>";
		topbar_html += "<button id='showinstructions_button' style='font-size:10pt'>show instructions</button>";
	}
	topbar_html += "</div>";
	$("#opendrill_div").before(topbar_html);
	
	// add click handlers for buttons
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		$("#checkanswers_button").button({icons:{ primary:"ui-icon-check" }}).unbind("click").click(function() { checkAnswers(); });
		$("#showinstructions_button").button({icons:{ primary:"ui-icon-info" }}).unbind("click").click(function() { showInstructions(1); });
		$("#rearrangequestions_button").button({icons:{ primary:"ui-icon-arrowthick-2-n-s" }}).unbind("click").click(function() { showRearrangeQuestions(1); });
		$("#newquestion_button").button({icons:{ primary:"ui-icon-document" }}).unbind("click").click(function() { showNewQuestion(); });
		$("#deletetop_button").button({icons:{ primary:"ui-icon-trash" }}).hide();
		$("#edittop_button").button({icons:{ primary:"ui-icon-pencil" }}).hide();
	}
	else {
		$("#checkanswers_button").button({icons:{ primary:"ui-icon-check" }}).unbind("click").click(function() { checkAnswers(); });
		$("#showinstructions_button").button({icons:{ primary:"ui-icon-info" }}).unbind("click").click(function() { showInstructions(1); });
	}
	
	// show instructions
	showInstructions(1);
	
	// setup ajax global events
	$(document).ajaxStart(function() { showAjaxWaiting(1); });
	$(document).ajaxStop(function() { showAjaxWaiting(0); });
}

function parseJSON_opendrill() {

	switch(GLOBAL_JSONstate.action) {
		case "openDrill" :
			openDrill(GLOBAL_JSONstate.message);
			break;
	}

}

function notloggedin() {
	// redirect to user page, need to login again
	GLOBAL_JSONstate.redirectURL = GLOBAL_JSONstate.webURL + "/cgi-bin/user.cgi";
	login("Page timed out. Please login again.");
}

function showAjaxWaiting(show) {

	// show please wait message + spinner gif	
	if(show==1) {
		// build html
		var loadingSpinner_html = "<div id='ajaxwaiting_content' class='content'>";
		loadingSpinner_html += "<header class='page-entry-header'><h1 class='entry-title' id='ajaxwaiting_header_h1'>please wait. your request is loading.</h1></header>";
		loadingSpinner_html += "<div class='wpcf7'>";
		loadingSpinner_html += "<span id='ajaxwaiting_message_span' class='msg'></span>";
		loadingSpinner_html += "<div id='ajaxwaiting_div'>";
		loadingSpinner_html += "<img src=\""+GLOBAL_JSONstate.webURL+"/icons/ajax-loader.gif\">";
		loadingSpinner_html += "</div>";
		loadingSpinner_html += "<br><br>";
		loadingSpinner_html += "</div>";
		loadingSpinner_html += "</div>";
		
		// open dialog
		$("#ajaxwaiting_dialog").dialog("close");
		$("body").append("<div id='ajaxwaiting_dialog' style='display:none; text-align:center'></div>");
		$("#ajaxwaiting_dialog").dialog({
			autoOpen:true, position:["center","top"],
			width:500,
			modal:true,
			close: function() {	$("#ajaxwaiting_dialog").dialog("destroy"); $("#ajaxwaiting_dialog").remove(); }
		});
		$("#ajaxwaiting_dialog").html(loadingSpinner_html);
	}
	
	// remove from dom
	else { $("#ajaxwaiting_dialog").dialog("close"); }
}


function openDrill(msg) {
	
	// remove any existing drills
	$("#opendrill_div>div[id^=drill][id$=_div]").remove();
	
	// loop drills, appending html
	var drillctr = 1;
	$.each(GLOBAL_JSONdrills, function(key,val) {
		appendQuestion(key,drillctr);
		drillctr++;
	});
	
	// set size of opendrill div
	adjustSizeDiv("opendrill_div");
	$(window).unbind("resize").resize(function() { adjustSizeDiv("opendrill_div"); });
}

function appendQuestion(drillid,drillctr) {

	var drillJSON = GLOBAL_JSONdrills[drillid];
	var drillQUESTION = drillJSON["QUESTION"];
	var drillRESPONSE = drillJSON["RESPONSE"];
	var drillEXPLAIN = drillJSON["EXPLAIN"];
	
	// build html every time
	var drill_html = "<div id=\"drill"+drillid+"_div\" style='border:2px darkblue solid; margin:4px'>";
	drill_html += "<span id=\"drill"+drillid+"_questionnumber_span\">"+drillctr+".&nbsp&nbsp</span>";
	
	if(drillQUESTION["text"]!="") {
		drill_html += "<span id=\"drill"+drillid+"_questiontext_span\">"+add_rubytext(text_to_htmlnewlines(drillQUESTION["text"]))+"</span><br>";
	}
	if(drillQUESTION["audio"]!="") {
		drill_html += "<div id=\"drill"+drillid+"_questionaudio_div\"></div><br>";
	}
	if(drillQUESTION["image"]["URL"]!="") {
		drill_html += "<img id=\"drill"+drillid+"_questionimage_img\" src=\""+drillQUESTION["image"]["URL"]+"\" ";
		drill_html += "height=\""+drillQUESTION["image"]["height"]+"\" width=\""+drillQUESTION["image"]["width"]+"\"><br>";
	}
	
	if(!drillRESPONSE["na"]) {
		drill_html += "<br><span id=\"drill"+drillid+"_studentresponse_span\">Student Response : </span>";
		if(drillRESPONSE["text"]["show"]) {
			drill_html += "<input id=\"drill"+drillid+"_responsetext_input\"><br>";
		}
		if(drillRESPONSE["audio"]["show"]) {
			drill_html += "<button id=\"drill"+drillid+"_responserecorder_button\" style='font-size:10pt'>open recorder</button>&nbsp&nbsp";
		}
		if(drillRESPONSE["mc"]["show"]) {
			drill_html += "<select id=\"drill"+drillid+"_responsemultiplechoice_select\">";
			for(var optionctr=0; optionctr<(drillRESPONSE["mc"]["choices"]).length; optionctr++) {
				drill_html += "<option id=\"drill"+drillid+"_responsemultiplechoice_option"+optionctr+"\" value=\""+optionctr+"\">";
				drill_html += drillRESPONSE["mc"]["choices"][optionctr];
				drill_html += "</option>";
			}
			drill_html += "</select><br>";
		}
	}

	if(!drillEXPLAIN["na"]) {
		drill_html += "<br><span id=\"drill"+drillid+"_teacherexplanation_span\">Teacher Explanation : </span>";
		drill_html += "<button id=\"drill"+drillid+"_showexplain_button\" style='font-size:10pt'>show</button><br>";
	}
	
	drill_html += "</div>";
	
	// append to div
	$("#drill"+drillid+"_div").remove();
	$("#opendrill_div").append(drill_html);
	
	
	$("#drill"+drillid+"_div").unbind("click").click(function() { selectQuestion(drillid,1); });
	
	// build buttons
	if(drillQUESTION["audio"]!="") { loadAudio(drillQUESTION["audio"],"drill"+drillid+"_questionaudio_div",function() {}); }
	if(drillRESPONSE["audio"]["show"]) {
		$("#drill"+drillid+"_responserecorder_button").button().unbind("click")
			.click(function() { showRecorder("",{"canSave":false},function() {}); });
	}
	$("#drill"+drillid+"_showexplain_button").button().unbind("click").click(function() { showExplain(drillid,1); });
}


var GLOBAL_selectedQuestionId = -2;
function selectQuestion(drillid,select) {

	// select drill
	if(select==1) {
		// un-select currently selected drill
		selectQuestion(GLOBAL_selectedQuestionId,0);
		GLOBAL_selectedQuestionId = drillid;
		
		var drillDivId = (GLOBAL_selectedQuestionId==-1) ? "instructions" : "drill"+drillid;
		$("#"+drillDivId+"_div").css("border-width","5px").css("margin","2px").css("padding","3px");
		$("#"+drillDivId+"_div").unbind("click").click(function() { selectQuestion(drillid,0); });
		
		// show topbar edit,delete buttons
		if(drillid==-1) {
			$("#deletetop_button").button().unbind("click").hide();
			$("#edittop_button").button().unbind("click").click(function () { showEditInstructions(); }).show();

		}
		else {
			$("#deletetop_button").button().unbind("click").click(function() { showDeleteQuestion(drillid); }).show();
			$("#edittop_button").button().unbind("click").click(function () { showEditQuestion(drillid); }).show();
		}
	}
	
	// un-select drill
	else {
		if(GLOBAL_selectedQuestionId==drillid) { GLOBAL_selectedQuestionId = -2; }
		
		var drillDivId = (drillid==-1) ? "instructions" : "drill"+drillid;
		$("#"+drillDivId+"_div").css("border-width","2px").css("margin","4px").css("padding","4px");
		$("#"+drillDivId+"_div").unbind("click").click(function() { selectQuestion(drillid,1); });
		
		// hide topbar edit,delete buttons
		$("#deletetop_button").button().unbind("click").hide();
		$("#edittop_button").button().unbind("click").hide();
	}
}

function showExplain(drillid,show) {

	// show explanation
	if(show==1) {
		// build html for explain div
		var drillEXPLAIN = GLOBAL_JSONdrills[drillid]["EXPLAIN"];
		var drillexplain_html = "<div id=\"drill"+drillid+"_explaindiv\">";
		if(drillEXPLAIN["text"]!="") {
			drillexplain_html += "<span id=\"drill"+drillid+"_explaintext_span\">"+add_rubytext(text_to_htmlnewlines(drillEXPLAIN["text"]))+"</span><br>";
		}
		if(drillEXPLAIN["audio"]!="") {
			drillexplain_html += "<div id=\"drill"+drillid+"_explainaudio_div\"></div><br>";
		}
		if(drillEXPLAIN["image"]["URL"]!="") {
			drillexplain_html += "<img id=\"drill"+drillid+"_explainimage_img\" src=\""+drillEXPLAIN["image"]["URL"]+"\" ";
			drillexplain_html += "height=\""+drillEXPLAIN["image"]["height"]+"\" width=\""+drillEXPLAIN["image"]["width"]+"\"><br>";
		}
		drillexplain_html += "</div>";
		$("#drill"+drillid+"_explaindiv").remove();
		$("#drill"+drillid+"_showexplain_button").after(drillexplain_html);
	
		if(drillEXPLAIN["audio"]!="") { loadAudio(drillEXPLAIN["audio"],"drill"+drillid+"_explainaudio_div",function() {}); }
		$("#drill"+drillid+"_showexplain_button").button("option","label","hide").unbind("click").click(function() { showExplain(drillid,0); });
	}
	
	// hide explanation
	else {
		$("#drill"+drillid+"_showexplain_button").button("option","label","show").unbind("click").click(function() { showExplain(drillid,1); });
		$("#drill"+drillid+"_explaindiv").remove();
	}
}

function showInstructions(show) {
	
	// show instructions
	if(show==1) {
		// build html for instructions div
		var instructionsBlank = 1;
		var instructions_html = "<div id='instructions_div' style='border:2px orange solid; padding:4px; margin:4px;'>";
		if(GLOBAL_JSONinstructions["text"]!="") {
			instructions_html += "<span id='instructionstext_span'>"+add_rubytext(text_to_htmlnewlines(GLOBAL_JSONinstructions["text"]))+"</span><br>";
			instructionsBlank = 0;
		}
		if(GLOBAL_JSONinstructions["audio"]!="") {
			instructions_html += "<div id='instructionsaudio_div'></div><br>";
			instructionsBlank = 0;
		}
		if(GLOBAL_JSONinstructions["image"]["URL"]!="") {
			instructions_html += "<img id='instructionsimage_img' src=\""+GLOBAL_JSONinstructions["image"]["URL"]+"\" ";
			instructions_html += "height=\""+GLOBAL_JSONinstructions["image"]["height"]+"\" width=\""+GLOBAL_JSONinstructions["image"]["width"]+"\"><br>";
			instructionsBlank = 0;
		}
		if(instructionsBlank==1) { instructions_html += "Instructions." }
		instructions_html += "</div>";
		$("#instructions_div").remove();
		$("#opendrill_div").before(instructions_html);
		
		$("#instructions_div").unbind("click").click(function() { selectQuestion(-1,1); });
	
		// build buttons
		$("#showinstructions_button").button({label:"hide instructions"}).unbind("click").click(function() { showInstructions(0); });
		if(GLOBAL_JSONinstructions["audio"]!="") { loadAudio(GLOBAL_JSONinstructions["audio"],"instructionsaudio_div",function() {}); }
		adjustSizeDiv("opendrill_div");
	}
	
	// hide instructions
	else {
		$("#showinstructions_button").button({label:"show instructions"}).unbind("click").click(function() { showInstructions(1); });
		$("#instructions_div").remove();
		adjustSizeDiv("opendrill_div");
	}
}

function checkAnswers() {
	
	// iterate through questions
	$.each(GLOBAL_JSONdrills, function(key,val) {
		var checkAnswer_returnVal; // -1:response diabled, 0:incorrect, 1:correct
		var placeimgspanID;
		
		if(val["RESPONSE"]["na"]) { checkAnswer_returnVal = -1; }
		else if(val["RESPONSE"]["text"]["show"]) {
			// check text answer
			var textAnswer = val["RESPONSE"]["text"]["answer"];
			var textResponse = $("#drill"+key+"_responsetext_input").val();
			checkAnswer_returnVal = (textAnswer==textResponse) ? 1 : 0;
			placeimgspanID = "drill"+key+"_responsetext_input";
		}
		else if(val["RESPONSE"]["audio"]["show"]) {
			// can't check audio answer
			checkAnswer_returnVal = -1;
		}
		else if(val["RESPONSE"]["mc"]["show"]) {
			// check mc answer
			var mcAnswer = val["RESPONSE"]["mc"]["answer"];
			var mcResponse = $("#drill"+key+"_responsemultiplechoice_select").val();
			checkAnswer_returnVal = (mcAnswer==mcResponse) ? 1 : 0;
			placeimgspanID = "drill"+key+"_responsemultiplechoice_select";
		}
		
		$("#drill"+key+"_checkAnswer_imgspan").remove();
		if(checkAnswer_returnVal==0) {
			var incorrectImage_html = "<img id=\"drill"+key+"_checkAnswer_imgspan\" src='http://dokkai.scripts.mit.edu/images/red_x.png' height=14; width=14;/>";
			$("#"+placeimgspanID).after(incorrectImage_html);
		}
		else if(checkAnswer_returnVal==1) {
			var correctImage_html = "<img id=\"drill"+key+"_checkAnswer_imgspan\" src='http://dokkai.scripts.mit.edu/images/green_check.png' height=14; width=14;/>";
			$("#"+placeimgspanID).after(correctImage_html);
		}
	});
}


function showRearrangeQuestions(allow) {

	// clicked rearrange
	if(allow==1) {
		$("#rearrangequestions_button").button("option","label","STOP rearrange questions").unbind("click").click(function() { showRearrangeQuestions(0); });

		// un-select any drills
		if(GLOBAL_selectedQuestionId>=-1) { selectQuestion(GLOBAL_selectedQuestionId,0); }
		
		// disable other topbar buttons
		$("#topbar_div button[id!=rearrangequestions_button]").attr("disabled","disabled");

		// allow sortable
		$("#opendrill_div").sortable({ items:">div[id^=drill][id$=_div]" });
	}
	
	// clicked STOP rearrange
	else {
		var onfinishFUNC = function() {
			$("#rearrangequestions_button").button("option","label","rearrange questions").unbind("click").click(function() { showRearrangeQuestions(1); });
			
			// re-display drills
			openDrill("");
			
			// re-enable other topbar buttons
			$("#topbar_div button[id!=rearrangequestions_button]").removeAttr("disabled");
			
			// dis-allow sortable
			$("#opendrill_div").sortable("destroy");
		};
	
		// send to server, update js
		rearrangeQuestions(onfinishFUNC);
	}
}

function rearrangeQuestions(onfinishFUNC) {

	// get current order
	var currentOrder_arr = $("#opendrill_div").sortable("toArray");
	var currentOrder_str = "[";
	for(var ctr=0; ctr<currentOrder_arr.length; ctr++) {
	
		var val = currentOrder_arr[ctr];
		if(ctr>0) { currentOrder_str += ","; }
		currentOrder_str += (val.replace("drill","")).replace("_div","");
	}
	currentOrder_str += "]";

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/opendrill.cgi",
		type:"POST",
		cache:false,
		data:{ "action":"rearrangeQuestions","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"newOrder":currentOrder_str },
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("rearrangeQuestions failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						var newOrder = $.parseJSON(returnData.return_data);
					
						// update global variable
						var newjson = {};
						$.each(newOrder,function(key,val) { newjson[key] = GLOBAL_JSONdrills[val]; });
						GLOBAL_JSONdrills = newjson;
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("rearrangeQuestions failed : \n\n"+returnData); }
				}
				
				onfinishFUNC();
			}
	});
}

function showDeleteQuestion(drillid) {

	// build html every time
	var deleteQuestion_html = "<div id='opendrill_content' class='content'>";
	deleteQuestion_html += "<header class='page-entry-header'><h1 class='entry-title'>are you sure you want to delete?</h1></header>";
	deleteQuestion_html += "<div class='wpcf7'>";
	deleteQuestion_html += "<span id='opendrill_message_span' class='msg'>Question #"+(parseInt(drillid)+1)+"</span>";
	deleteQuestion_html += "<br><br>";
	deleteQuestion_html += "<button id='opendrill_button_cancel' name='cancel'>cancel</button>";
	deleteQuestion_html += "&nbsp&nbsp&nbsp&nbsp";
	deleteQuestion_html += "<button id='opendrill_button_send' name='delete'>delete</button>";
	deleteQuestion_html += "<br><br>";
	deleteQuestion_html += "</div>";
	deleteQuestion_html += "</div>";

	// confirm delete
	$("#opendrill_dialog").dialog("close");
	$("body").append("<div id='opendrill_dialog' style='display:none; text-align:center'></div>");
	$("#opendrill_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#opendrill_dialog").dialog("destroy"); $("#opendrill_dialog").remove(); }
	});

	$("#opendrill_dialog").html(deleteQuestion_html);
	
	// add click handler to buttons
	$("#opendrill_button_cancel").button().unbind("click").click(function() { $("#opendrill_dialog").dialog("close"); });
	$("#opendrill_button_send").button().unbind("click").click(function() {
		var onfinishFUNC = function() { $("#opendrill_dialog").dialog("close"); openDrill(""); };
		deleteQuestion(drillid,onfinishFUNC);
	});
}

function deleteQuestion(drillid,onfinishFUNC) {

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/opendrill.cgi",
		type:"POST",
		cache:false,
		data:{"action":"deleteQuestion","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"drillid":drillid},
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("deleteQuestion failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						var newOrder = $.parseJSON(returnData.return_data);
					
						// update global variable
						var newjson = {};
						$.each(newOrder,function(key,val) { newjson[key] = GLOBAL_JSONdrills[val]; });
						GLOBAL_JSONdrills = newjson;

					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("deleteQuestion failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showEditQuestion(drillid) {

	// build html every time
	var editQuestion_html = "<div id='opendrill_content' class='content'>";
	editQuestion_html += "<header class='page-entry-header'><h1 class='entry-title'>edit question</h1></header>";
	editQuestion_html += "<div class='wpcf7'>";
	editQuestion_html += "<span id='opendrill_message_span' class='msg'>Question #"+(parseInt(drillid)+1)+"</span>";
	editQuestion_html += "<br><br>";
	editQuestion_html += "<div id='opendrill_tabs_div'>";
	editQuestion_html += "<ul>";
	editQuestion_html += "<li><a href='#opendrill_questiontab_div' class='tabs_a'><span id='opendrill_questiontab_span'>question</span></a></li>";
	editQuestion_html += "<li><a href='#opendrill_responsetab_div' class='tabs_a'><span id='opendrill_responsetab_span'>student response</span></a></li>";
	editQuestion_html += "<li><a href='#opendrill_explaintab_div' class='tabs_a'><span id='opendrill_explaintab_span'>teacher explanation</span></a></li>";
	editQuestion_html += "</ul>";
	editQuestion_html += showEditQuestion_questionTab(drillid,1);
	editQuestion_html += showEditQuestion_responseTab(drillid,1);
	editQuestion_html += showEditQuestion_explainTab(drillid,1);
	editQuestion_html += "</div>";
	editQuestion_html += "<br><br>";
	editQuestion_html += "<button id='opendrill_button_cancel' name='cancel'>cancel</button>";
	editQuestion_html += "&nbsp&nbsp&nbsp&nbsp";
	editQuestion_html += "<button id='opendrill_button_send' name='save'>save changes</button>";
	editQuestion_html += "<br><br>";
	editQuestion_html += "</div>";
	editQuestion_html += "</div>";

	// open dialog
	$("#opendrill_dialog").dialog("close");
	$("body").append("<div id='opendrill_dialog' style='display:none; text-align:center'></div>");
	$("#opendrill_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:600,
		modal:true,
		close: function() { $("#opendrill_dialog").dialog("destroy"); $("#opendrill_dialog").remove(); }
	});

	$("#opendrill_dialog").html(editQuestion_html);

	// add handlers to tabs
	var getsetFields_questionTab = showEditQuestion_questionTab(drillid,0);
	var getsetFields_responseTab = showEditQuestion_responseTab(drillid,0);	
	var getsetFields_explainTab = showEditQuestion_explainTab(drillid,0);
	
	$("#opendrill_tabs_div").tabs({heightStyle:"auto",active:0});
	
	// set fields with current values
	getsetFields_questionTab["text"]("set",GLOBAL_JSONdrills[drillid]["QUESTION"]["text"]);
	getsetFields_questionTab["image"]("set",GLOBAL_JSONdrills[drillid]["QUESTION"]["image"]);
	getsetFields_questionTab["audio"]("set",GLOBAL_JSONdrills[drillid]["QUESTION"]["audio"]);
	
	getsetFields_responseTab["text"]("set",GLOBAL_JSONdrills[drillid]["RESPONSE"]["text"]);
	getsetFields_responseTab["audio"]("set",GLOBAL_JSONdrills[drillid]["RESPONSE"]["audio"]);
	getsetFields_responseTab["mc"]("set",GLOBAL_JSONdrills[drillid]["RESPONSE"]["mc"]);
	getsetFields_responseTab["na"]("set",GLOBAL_JSONdrills[drillid]["RESPONSE"]["na"]);
	
	getsetFields_explainTab["text"]("set",GLOBAL_JSONdrills[drillid]["EXPLAIN"]["text"]);
	getsetFields_explainTab["image"]("set",GLOBAL_JSONdrills[drillid]["EXPLAIN"]["image"]);
	getsetFields_explainTab["audio"]("set",GLOBAL_JSONdrills[drillid]["EXPLAIN"]["audio"]);
	getsetFields_explainTab["na"]("set",GLOBAL_JSONdrills[drillid]["EXPLAIN"]["na"]);
		
	// add click handler to buttons
	$("#opendrill_button_cancel").button().unbind("click").click(function() {
		$("#opendrill_dialog").dialog("close");
		if(drillid==newDrillId_notsaved) {
			// update global variable
			delete GLOBAL_JSONdrills[drillid];
			
			// redisplay questions
			openDrill("");
			
			newDrillId_notsaved = -1;
		}
	});
	$("#opendrill_button_send").button().unbind("click").click(function() {
		newDrillId_notsaved = -1;
		var onfinishFUNC = function() { $("#opendrill_dialog").dialog("close"); openDrill(""); };
		editQuestion(drillid,getsetFields_questionTab,getsetFields_responseTab,getsetFields_explainTab,onfinishFUNC);
	});
}

function editQuestion(drillid,getsetFields_questionTab,getsetFields_responseTab,getsetFields_explainTab,onfinishFUNC) {
	
	// build new JSON object
	var sendData = {"action":"editQuestion","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"drillid":drillid};
	sendData = editQuestion_buildSendData(sendData,getsetFields_questionTab,getsetFields_responseTab,getsetFields_explainTab);
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/opendrill.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("editQuestion failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						GLOBAL_JSONdrills[returnData.drillid] = $.parseJSON(returnData.return_data);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("editQuestion failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

var newDrillId_notsaved = -1;
function showNewQuestion() {

	// find next id
	var newDrillId = 0;
	$.each(GLOBAL_JSONdrills,function() { newDrillId++; });

	// build new JSON val
	var newDrillVal = { "QUESTION":{},"RESPONSE":{},"EXPLAIN":{} };
	newDrillVal["QUESTION"]["text"] = "";
	newDrillVal["QUESTION"]["image"] = {"URL":"","height":0,"width":0};
	newDrillVal["QUESTION"]["audio"] = "";
	
	newDrillVal["RESPONSE"]["text"] = {"show":true,"answer":""};
	newDrillVal["RESPONSE"]["audio"] = {"show":false};
	newDrillVal["RESPONSE"]["mc"] = {"show":false,"choices":[],"answer":0};
	newDrillVal["RESPONSE"]["na"] = false;
	
	newDrillVal["EXPLAIN"]["text"] = "";
	newDrillVal["EXPLAIN"]["image"] = {"URL":"","height":0,"width":0};
	newDrillVal["EXPLAIN"]["audio"] = "";
	newDrillVal["EXPLAIN"]["na"] = false;

	// update global variable
	GLOBAL_JSONdrills[newDrillId] = newDrillVal;
	
	// need to delete this drill if cancel edit before save
	newDrillId_notsaved = newDrillId;
	
	showEditQuestion(newDrillId);
}

function showEditInstructions() {

	// build html every time
	var editInstructions_html = "<div id='opendrill_content' class='content'>";
	editInstructions_html += "<header class='page-entry-header'><h1 class='entry-title'>edit instructions</h1></header>";
	editInstructions_html += "<div class='wpcf7'>";
	editInstructions_html += "<span id='opendrill_message_span' class='msg'></span>";
	editInstructions_html += showEditInstructions_instructionDiv(1);
	editInstructions_html += "<br><br>";
	editInstructions_html += "<button id='opendrill_button_cancel' name='cancel'>cancel</button>";
	editInstructions_html += "&nbsp&nbsp&nbsp&nbsp";
	editInstructions_html += "<button id='opendrill_button_send' name='save'>save changes</button>";
	editInstructions_html += "<br><br>";
	editInstructions_html += "</div>";
	editInstructions_html += "</div>";

	// open dialog
	$("#opendrill_dialog").dialog("close");
	$("body").append("<div id='opendrill_dialog' style='display:none; text-align:center'></div>");
	$("#opendrill_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:600,
		modal:true,
		close: function() { $("#opendrill_dialog").dialog("destroy"); $("#opendrill_dialog").remove(); }
	});

	$("#opendrill_dialog").html(editInstructions_html);

	// add handlers to tabs
 	var getsetFields_instructiondiv = showEditInstructions_instructionDiv(0);
	
	// set fields with current values
	getsetFields_instructiondiv["text"]("set",GLOBAL_JSONinstructions["text"]);
	getsetFields_instructiondiv["image"]("set",GLOBAL_JSONinstructions["image"]);
	getsetFields_instructiondiv["audio"]("set",GLOBAL_JSONinstructions["audio"]);
	
	// add click handler to buttons
	$("#opendrill_button_cancel").button().unbind("click").click(function() { $("#opendrill_dialog").dialog("close"); });
	$("#opendrill_button_send").button().unbind("click").click(function() {
		var onfinishFUNC = function() { $("#opendrill_dialog").dialog("close"); showInstructions(1); };
		editInstructions(getsetFields_instructiondiv,onfinishFUNC);
	});
}

function editInstructions(getsetFields_instructionDiv,onfinishFUNC) {
	
	// build new JSON object
	var sendData = {"action":"editInstructions","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData = editInstructions_buildSendData(sendData,getsetFields_instructionDiv);
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/opendrill.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("editInstructions failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						GLOBAL_JSONinstructions = $.parseJSON(returnData.return_data);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("editInstructions failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}


function showEditQuestion_questionTab(drillid,html) {

	// return html
	if(html==1) {
		var questionTab_html = "<div id='opendrill_questiontab_div'>";
		questionTab_html += "<fieldset class='tabs_fieldset'>";
		questionTab_html += "<label class='tabs_label' id='questiontab_text_label' for='questiontab_text_input'>Text</label>";
		questionTab_html += "<textarea id='questiontab_text_input' class='tabs_input'></textarea>";
		questionTab_html += "<br><br>";
		questionTab_html += "<label class='tabs_label' id='questiontab_image_label' for='questiontab_image_button'>Image &nbsp&nbsp : &nbsp&nbsp</label>";
		questionTab_html += "<button id='questiontab_image_button' class='tabs_input' style='font-size:11px; float:left;'>edit image</button>";
		questionTab_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp</span>";
		questionTab_html += "<span id='questiontab_image_span' style='font-size:11px; float:left' imageURL='' imageHeight='' imageWidth=''>no image selected</span>";
		questionTab_html += "<br><br><br>";
		questionTab_html += "<label class='tabs_label' id='questiontab_audio_label' for='questiontab_audio_button'>Audio &nbsp&nbsp : &nbsp&nbsp</label>";
		questionTab_html += "<button id='questiontab_audio_button' class='tabs_input' style='font-size:11px; float:left'>edit audio</button>";
		questionTab_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp</span>";
		questionTab_html += "<span id='questiontab_audio_span' audioURL='' style='font-size:11px; float:left'>no audio selected</span>";
		questionTab_html += "</fieldset>";
		questionTab_html += "</div>";
		
		return questionTab_html;
	}
	
	// attach handlers, return getter/setters
	else {
		// handlers
		$("#questiontab_image_button").button({icons:{"primary":"ui-icon-pencil"}}).unbind("click").click(function() {
			var imageURL = $("#questiontab_image_span").attr("imageURL");
			var imageHeight = $("#questiontab_image_span").attr("imageHeight");
			var imageWidth = $("#questiontab_image_span").attr("imageWidth");
			var onfinishIMG = function(returnURL,returnHeight,returnWidth) { updateImageSpan(returnURL,returnHeight,returnWidth,"questiontab"); }
			showEditImage("Image for Question #"+(parseInt(drillid)+1),imageURL,imageHeight,imageWidth,onfinishIMG);
		});
		$("#questiontab_audio_button").button({icons:{"primary":"ui-icon-pencil"}}).unbind("click").click(function() {
			var audioURL = $("#questiontab_audio_span").attr("audioURL");
			var onfinishAUD = function(returnURL) { updateAudioSpan(returnURL,"questiontab"); };
			showEditAudio("Audio for Question #"+(parseInt(drillid)+1),audioURL,onfinishAUD);
		});
		
		// getter/setters
		var getsetFUNC_text = function(getset,text) {
			if(getset=="set") { $("#questiontab_text_input").val(json_unescape_str(text)); }
			else { return $("#questiontab_text_input").val(); }
		};
		var getsetFUNC_image = function(getset,imageMAP) {
			if(getset=="set") { updateImageSpan(imageMAP["URL"],imageMAP["height"],imageMAP["width"],"questiontab"); }
			else { return {	"URL" : $("#questiontab_image_span").attr("imageURL"),
							"height" : $("#questiontab_image_span").attr("imageHeight"),
							"width" : $("#questiontab_image_span").attr("imageWidth") };
			}
		};
		var getsetFUNC_audio = function(getset,audioURL) {
			if(getset=="set") { updateAudioSpan(audioURL,"questiontab"); }
			else { return $("#questiontab_audio_span").attr("audioURL"); }
		};
		var getsetMAP = {
			"text" : getsetFUNC_text,
			"image" : getsetFUNC_image,
			"audio" : getsetFUNC_audio
		};
		return getsetMAP;
	}
}

function showEditQuestion_responseTab(drillid,html) {

	// return html
	if(html==1) {
		var responseTab_html = "<div id='opendrill_responsetab_div'>";
		responseTab_html += "<fieldset class='tabs_fieldset'>";
		responseTab_html += "<input id='responsetab_na_input' class='tabs_input' type='checkbox'/>";
		responseTab_html += "<label class='tabs_label' id='responsetab_na_label' for='responsetab_na_input'>No Student Response</label>";
		responseTab_html += "<br><br><br>";
		responseTab_html += "<input id='responsetab_text_input' class='tabs_input' type='radio' name='responsetab_radiogroup'/>";
		responseTab_html += "<label class='tabs_label' id='responsetab_text_label' for='responsetab_text_input'>Text (type the answer)</label>";
		responseTab_html += "<br><br>";
		responseTab_html += "<div id='responsetab_textanswer_div'>";
		responseTab_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
		responseTab_html += "correct answer: <input id='responsetab_textanswer_input' class='tabs_input' type='text'/></span>";
		responseTab_html += "</div>";
		responseTab_html += "<br><br>";
		responseTab_html += "<input id='responsetab_mc_input' class='tabs_input' type='radio' name='responsetab_radiogroup'/>";
		responseTab_html += "<label class='tabs_label' id='responsetab_mc_label' for='responsetab_mc_input'>Multiple Choice (select the answer from a list)</label>";
		responseTab_html += "<br><br>";
		responseTab_html += "<div id='responsetab_mcanswer_div'>";
		responseTab_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp";
		responseTab_html += "correct answer: <select id='responsetab_mcanswer_input' class='tabs_input'></select>";
		responseTab_html += "&nbsp&nbsp&nbsp&nbsp";
		responseTab_html += "<button id='responsetab_mcanswer_addchoice_button' class='tabs_input'>edit choices</button></span>";
		responseTab_html += "</div>";
		responseTab_html += "<br><br><br>";
		responseTab_html += "<input id='responsetab_audio_input' class='tabs_input' type='radio' name='responsetab_radiogroup'/>";
		responseTab_html += "<label class='tabs_label' id='responsetab_audio_label' for='responsetab_audio_input'>Audio (record the answer)</label>";
		responseTab_html += "</fieldset>";
		responseTab_html += "</div>"
		
		return responseTab_html;
	}
	
	// attach handlers, return getter/setters
	else {
		// handlers
		$("#responsetab_na_input").prop("checked",false);
		$("#responsetab_na_input").unbind("change").change(function() {
			if($("#responsetab_na_input").prop("checked")) { $("#opendrill_responsetab_div .tabs_input[id!='responsetab_na_input']").attr("disabled","disabled"); }
			else { $("#opendrill_responsetab_div .tabs_input[id!='responsetab_na_input']").removeAttr("disabled"); }
		});
		$("#responsetab_na_input").change();
		
		$("#responsetab_text_input,#responsetab_mc_input,#responsetab_audio_input").unbind("change").change(function() {
			if($("#responsetab_text_input").prop("checked")) { $("#responsetab_textanswer_div").show(); }
			else { $("#responsetab_textanswer_div").hide(); }
			
			if($("#responsetab_mc_input").prop("checked")) { $("#responsetab_mcanswer_div").show(); }
			else { $("#responsetab_mcanswer_div").hide(); }
		});
		$("#responsetab_text_input").prop("checked",true);
		$("#responsetab_text_input").change();
		
		$("#responsetab_mcanswer_addchoice_button").button({icons:{ primary:"ui-icon-pencil" }})
			.unbind("click").click(function() {
				// build choices array
				var choicesARR = [];
				$("#responsetab_mcanswer_input>option").each(function() { choicesARR.push($(this).attr("value")); });
				var onfinishMC = function(returnARR) {
					// build select html
					var choicesHTML = "";
					$.each(returnARR,function(key,val) { choicesHTML += "<option value=\""+val+"\">"+val+"</option>"; });
					$("#responsetab_mcanswer_input").html(choicesHTML);
				};
				showEditMultipleChoice("Multiple Choice for Student Response #"+(parseInt(drillid)+1),choicesARR,onfinishMC);
			});
			
			
		// getter/setters
		var getsetFUNC_na = function(getset,naVAL) {
			if(getset=="set") {
				$("#responsetab_na_input").prop("checked",naVAL);
				$("#responsetab_na_input").change();
			}
			else { return ($("#responsetab_na_input").prop("checked") ? 1 : 0); }
		};
		var getsetFUNC_text = function(getset,textMAP) {
			if(getset=="set") {
				$("#responsetab_text_input").prop("checked",textMAP["show"]);
				$("#responsetab_textanswer_input").val(textMAP["answer"]);
				$("#responsetab_text_input").change();
			}
			else { return { "show":($("#responsetab_text_input").prop("checked") ? 1 : 0),
							"answer":$("#responsetab_textanswer_input").val() };
			}
		};
		var getsetFUNC_audio = function(getset,audioMAP) {
			if(getset=="set") {
				$("#responsetab_audio_input").prop("checked",audioMAP["show"]);
				$("#responsetab_audio_input").change();
			}
			else { return { "show":($("#responsetab_audio_input").prop("checked") ? 1 : 0) }; }
		};
		var getsetFUNC_mc = function(getset,mcMAP) {
			if(getset=="set") {
				$("#responsetab_mc_input").prop("checked",mcMAP["show"]);
				// build select html
				var choicesHTML = "";
				$.each(mcMAP["choices"],function(key,val) { choicesHTML += "<option value=\""+val+"\">"+val+"</option>"; });
				$("#responsetab_mcanswer_input").html(choicesHTML);
				$("#responsetab_mcanswer_input").val(mcMAP["choices"][mcMAP["answer"]]);
				$("#responsetab_mc_input").change();
			}
			else {
				// build choices array
				var selectedChoice = $("#responsetab_mcanswer_input").val();
				var choicesARR = []; var answerIND = 0; var ctrIND = 0;
				$("#responsetab_mcanswer_input>option").each(function() {
					var thisVAL = $(this).attr("value");
					choicesARR.push(thisVAL);
					if(thisVAL.match(new RegExp("^"+selectedChoice+"$"))) { answerIND = ctrIND; }
					ctrIND++;
				});
				return {	"show" : ($("#responsetab_mc_input").prop("checked") ? 1 : 0),
							"choices" : choicesARR,
							"answer" :  answerIND };
			}
		};
		var getsetMAP = {
			"na" : getsetFUNC_na,
			"text" : getsetFUNC_text,
			"audio" : getsetFUNC_audio,
			"mc" : getsetFUNC_mc
		};
		return getsetMAP;
	}	
}

function showEditQuestion_explainTab(drillid,html) {

	// return html
	if(html==1) {
		var explainTab_html = "<div id='opendrill_explaintab_div'>";
		explainTab_html += "<fieldset class='tabs_fieldset'>";
		explainTab_html += "<input id='explaintab_na_input' class='tabs_input' type='checkbox' style='float:left'/>";
		explainTab_html += "<label class='tabs_label' id='explaintab_na_label' for='explaintab_na_input'>No Explanation</label>";
		explainTab_html += "<br><br>";		
		explainTab_html += "<label class='tabs_label' id='explaintab_text_label' for='explaintab_text_input'>Text</label>";
		explainTab_html += "<textarea id='explaintab_text_input' class='tabs_input'></textarea>";
		explainTab_html += "<br><br>";
		explainTab_html += "<label class='tabs_label' id='explaintab_image_label' for='explaintab_image_button'>Image &nbsp&nbsp : &nbsp&nbsp</label>";
		explainTab_html += "<button id='explaintab_image_button' class='tabs_input' style='font-size:11px; float:left;'>edit image</button>";
		explainTab_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp</span>";
		explainTab_html += "<span id='explaintab_image_span' style='font-size:11px; float:left' imageURL='' imageHeight='' imageWidth=''>no image selected</span>";
		explainTab_html += "<br><br><br>";
		explainTab_html += "<label class='tabs_label' id='explaintab_audio_label' for='explaintab_audio_button'>Audio &nbsp&nbsp : &nbsp&nbsp</label>";
		explainTab_html += "<button id='explaintab_audio_button' class='tabs_input' style='font-size:11px; float:left'>edit audio</button>";
		explainTab_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp</span>";
		explainTab_html += "<span id='explaintab_audio_span' audioURL='' style='font-size:11px; float:left'>no audio selected</span>";
		explainTab_html += "</fieldset>";
		explainTab_html += "</div>";
		
		return explainTab_html;
	}
	
	// attach handlers, return getter/setters
	else {
		// handlers
		$("#explaintab_na_input").prop("checked",false);
		$("#explaintab_na_input").unbind("change").change(function() {
			if($("#explaintab_na_input").prop("checked")) { $("#opendrill_explaintab_div .tabs_input[id!='explaintab_na_input']").attr("disabled","disabled"); }
			else { $("#opendrill_explaintab_div .tabs_input[id!='explaintab_na_input']").removeAttr("disabled"); }
		});
		$("#explaintab_na_input").change();
		
		$("#explaintab_image_button").button({icons:{"primary":"ui-icon-pencil"}}).unbind("click").click(function() {
			var imageURL = $("#explaintab_image_span").attr("imageURL");
			var imageHeight = $("#explaintab_image_span").attr("imageHeight");
			var imageWidth = $("#explaintab_image_span").attr("imageWidth");
			var onfinishIMG = function(returnURL,returnHeight,returnWidth) { updateImageSpan(returnURL,returnHeight,returnWidth,"explaintab"); }
			showEditImage("Image for Explanation #"+(parseInt(drillid)+1),imageURL,imageHeight,imageWidth,onfinishIMG);
		});
		$("#explaintab_audio_button").button({icons:{"primary":"ui-icon-pencil"}}).unbind("click").click(function() {
			var audioURL = $("#explaintab_audio_span").attr("audioURL");
			var onfinishAUD = function(returnURL) { updateAudioSpan(returnURL,"explaintab"); };
			showEditAudio("Audio for Explanation #"+(parseInt(drillid)+1),audioURL,onfinishAUD);
		});
		
		
		// getter/setters
		var getsetFUNC_na = function(getset,naVAL) {
			if(getset=="set") {
				$("#explaintab_na_input").prop("checked",naVAL);
				$("#explaintab_na_input").change();
			}
			else { return ($("#explaintab_na_input").prop("checked") ? 1 : 0); }
		}
		var getsetFUNC_text = function(getset,text) {
			if(getset=="set") { $("#explaintab_text_input").val(json_unescape_str(text)); }
			else { return $("#explaintab_text_input").val(); }
		};
		var getsetFUNC_image = function(getset,imageMAP) {
			if(getset=="set") { updateImageSpan(imageMAP["URL"],imageMAP["height"],imageMAP["width"],"explaintab"); }
			else { return {	"URL" : $("#explaintab_image_span").attr("imageURL"),
							"height" : $("#explaintab_image_span").attr("imageHeight"),
							"width" : $("#explaintab_image_span").attr("imageWidth") };
			}
		};
		var getsetFUNC_audio = function(getset,audioURL) {
			if(getset=="set") { updateAudioSpan(audioURL,"explaintab"); }
			else { return $("#explaintab_audio_span").attr("audioURL"); }
		};
		var getsetMAP = {
			"na" : getsetFUNC_na,
			"text" : getsetFUNC_text,
			"image" : getsetFUNC_image,
			"audio" : getsetFUNC_audio
		};
		return getsetMAP;
	}
}

function showEditInstructions_instructionDiv(html) {

	// return html
	if(html==1) {
		var instructionDiv_html = "<div id='opendrill_instructiondiv_div'>";
		instructionDiv_html += "<fieldset class='tabs_fieldset'>";
		instructionDiv_html += "<label class='tabs_label' id='instructiondiv_text_label' for='instructiondiv_text_input'>Text</label>";
		instructionDiv_html += "<textarea id='instructiondiv_text_input' class='tabs_input'></textarea>";
		instructionDiv_html += "<br><br>";
		instructionDiv_html += "<label class='tabs_label' id='instructiondiv_image_label' for='instructiondiv_image_button'>Image &nbsp&nbsp : &nbsp&nbsp</label>";
		instructionDiv_html += "<button id='instructiondiv_image_button' class='tabs_input' style='font-size:11px; float:left;'>edit image</button>";
		instructionDiv_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp</span>";
		instructionDiv_html += "<span id='instructiondiv_image_span' style='font-size:11px; float:left' imageURL='' imageHeight='' imageWidth=''>no image selected</span>";
		instructionDiv_html += "<br><br><br>";
		instructionDiv_html += "<label class='tabs_label' id='instructiondiv_audio_label' for='instructiondiv_audio_button'>Audio &nbsp&nbsp : &nbsp&nbsp</label>";
		instructionDiv_html += "<button id='instructiondiv_audio_button' class='tabs_input' style='font-size:11px; float:left'>edit audio</button>";
		instructionDiv_html += "<span style='float:left'>&nbsp&nbsp&nbsp&nbsp</span>";
		instructionDiv_html += "<span id='instructiondiv_audio_span' audioURL='' style='font-size:11px; float:left'>no audio selected</span>";
		instructionDiv_html += "</fieldset>";
		instructionDiv_html += "</div>";
		
		return instructionDiv_html;
	}
	
	// attach handlers, return getter/setters
	else {
		// handlers
		$("#instructiondiv_image_button").button({icons:{"primary":"ui-icon-pencil"}}).unbind("click").click(function() {
			var imageURL = $("#instructiondiv_image_span").attr("imageURL");
			var imageHeight = $("#instructiondiv_image_span").attr("imageHeight");
			var imageWidth = $("#instructiondiv_image_span").attr("imageWidth");
			var onfinishIMG = function(returnURL,returnHeight,returnWidth) { updateImageSpan(returnURL,returnHeight,returnWidth,"instructiondiv"); }
			showEditImage("Image for Instructions",imageURL,imageHeight,imageWidth,onfinishIMG);
		});
		$("#instructiondiv_audio_button").button({icons:{"primary":"ui-icon-pencil"}}).unbind("click").click(function() {
			var audioURL = $("#instructiondiv_audio_span").attr("audioURL");
			var onfinishAUD = function(returnURL) { updateAudioSpan(returnURL,"instructiondiv"); };
			showEditAudio("Audio for Instructions",audioURL,onfinishAUD);
		});
		
		// getter/setters
		var getsetFUNC_text = function(getset,text) {
			if(getset=="set") { $("#instructiondiv_text_input").val(json_unescape_str(text)); }
			else { return $("#instructiondiv_text_input").val(); }
		};
		var getsetFUNC_image = function(getset,imageMAP) {
			if(getset=="set") { updateImageSpan(imageMAP["URL"],imageMAP["height"],imageMAP["width"],"instructiondiv"); }
			else { return {	"URL" : $("#instructiondiv_image_span").attr("imageURL"),
							"height" : $("#instructiondiv_image_span").attr("imageHeight"),
							"width" : $("#instructiondiv_image_span").attr("imageWidth") };
			}
		};
		var getsetFUNC_audio = function(getset,audioURL) {
			if(getset=="set") { updateAudioSpan(audioURL,"instructiondiv"); }
			else { return $("#instructiondiv_audio_span").attr("audioURL"); }
		};
		var getsetMAP = {
			"text" : getsetFUNC_text,
			"image" : getsetFUNC_image,
			"audio" : getsetFUNC_audio
		};
		return getsetMAP;
	}
}


function editQuestion_buildSendData(sendData,getsetFields_questionTab,getsetFields_responseTab,getsetFields_explainTab) {

	var question_text_str = getsetFields_questionTab["text"]("get",null);
	var question_image_hash = getsetFields_questionTab["image"]("get",null);
	var question_audio_str = getsetFields_questionTab["audio"]("get",null);
	
	var response_na_str = getsetFields_responseTab["na"]("get",null);
	var response_text_hash = getsetFields_responseTab["text"]("get",null);
	var response_audio_hash = getsetFields_responseTab["audio"]("get",null);
	var response_mc_hash = getsetFields_responseTab["mc"]("get",null);
	
	var explain_na_str = getsetFields_explainTab["na"]("get",null);
	var explain_text_str = getsetFields_explainTab["text"]("get",null);
	var explain_image_hash = getsetFields_explainTab["image"]("get",null);
	var explain_audio_str = getsetFields_explainTab["audio"]("get",null);

	sendData["Q-text"] = json_escape_str(question_text_str);
	sendData["Q-image-url"] = question_image_hash["URL"];
	sendData["Q-image-height"] = question_image_hash["height"];
	sendData["Q-image-width"] = question_image_hash["width"];
	sendData["Q-audio"] = question_audio_str;
	
	sendData["R-na"] = response_na_str;
	sendData["R-text-show"] = response_text_hash["show"];
	sendData["R-text-answer"] = remove_newlines(response_text_hash["answer"]);
	sendData["R-audio-show"] = response_audio_hash["show"];
	sendData["R-mc-show"] = response_mc_hash["show"];
	sendData["R-mc-choices"] = remove_newlines(response_mc_hash["choices"].join("::SPLIT::"));
	sendData["R-mc-answer"] = response_mc_hash["answer"];
	
	sendData["E-na"] = explain_na_str;
	sendData["E-text"] = json_escape_str(explain_text_str);
	sendData["E-image-url"] = explain_image_hash["URL"];
	sendData["E-image-height"] = explain_image_hash["height"];
	sendData["E-image-width"] = explain_image_hash["width"];
	sendData["E-audio"] = explain_audio_str;
	
	return sendData;
}

function editInstructions_buildSendData(sendData,getsetFields_instructionDiv) {

	var instructions_text_str = getsetFields_instructionDiv["text"]("get",null);
	var instructions_image_hash = getsetFields_instructionDiv["image"]("get",null);
	var instructions_audio_str = getsetFields_instructionDiv["audio"]("get",null);
	
	sendData["I-text"] = json_escape_str(instructions_text_str);
	sendData["I-image-url"] = instructions_image_hash["URL"];
	sendData["I-image-height"] = instructions_image_hash["height"];
	sendData["I-image-width"] = instructions_image_hash["width"];
	sendData["I-audio"] = instructions_audio_str;
	
	return sendData;
}


function updateImageSpan(imageURL,imageHeight,imageWidth,idSTR) {
	$("#"+idSTR+"_image_span").attr("imageURL",imageURL);
	var imageHTML = "<img id=\""+idSTR+"_image_img\" src=\""+imageURL+"\"/>";
	imageHTML += "&nbsp&nbsp"+imageHeight+" x "+imageWidth;
	if(imageURL=="") { imageHTML = "no image selected"; }
	$("#"+idSTR+"_image_span").html(imageHTML);
	$("#"+idSTR+"_image_img").height(10).width(10);
	$("#"+idSTR+"_image_span").attr("imageHeight",imageHeight).attr("imageWidth",imageWidth);
}

function updateAudioSpan(audioURL,idSTR) {
	$("#"+idSTR+"_audio_span").attr("audioURL",audioURL);
	var audioHTML = "<audio id=\""+idSTR+"_audio_audio\">";
	audioHTML += "<source src=\""+audioURL+"\">";
	audioHTML += "</audio>";
	audioHTML += "<button id=\""+idSTR+"_audio_playbutton\" style='font-size:11px'>play</button>";
	audioHTML += "<button id=\""+idSTR+"_audio_stopbutton\" style='font-size:11px'>stop</button>";
	audioHTML += "<button id=\""+idSTR+"_audio_downloadbutton\" style='font-size:11px'>download</button>";
	if(audioURL=="") { audioHTML = "no audio selected"; }
	$("#"+idSTR+"_audio_span").html(audioHTML);
	$("#"+idSTR+"_audio_audio").hide();
	$("#"+idSTR+"_audio_playbutton").button({icons:{"primary":"ui-icon-play"}}).unbind("click").click(function() {
		$("#"+idSTR+"_audio_audio").get(0).play();
	});
	$("#"+idSTR+"_audio_stopbutton").button({icons:{"primary":"ui-icon-stop"}}).unbind("click").click(function() {
		$("#"+idSTR+"_audio_audio").get(0).pause();
		$("#"+idSTR+"_audio_audio").get(0).currentTime = 0;
	});
	$("#"+idSTR+"_audio_downloadbutton").button({icons:{"primary":"ui-icon-arrowstop-1-s"}}).unbind("click").click(function() {
		window.open(audioURL);
	});
}

