// openreading.js
// **********************************************
//		checkJS_openreading
//		parseJSON_openreading
//		notloggedin
//
//		openReading
//		insertSurroundingSpans
//		attachSpanHandler
//		insertObject
//		attachObjectHandler
//
//		highlightWord
//		highlightCharset
//		showAnnotate
//
//		selectChars
//		selectInsertPosition
//
//		showEditTextChooseType
//		insertText
//		showDeleteText
//		deleteText
//
//		showInsertChooseType
//		newImageObj
//		newAudioObj
//		showEditImageObj
//		editImageObj
//		showDeleteImageObj
//		deleteImageObj
//		showDeleteAudioObj
//		deleteAudioObj
//
//		showStarChooseType
//		saveStar
//
//		showSentenceChooseType
//		searchSentence
//
//		showAnnotateChooseType
//		showComputerAnnotate
//		showComputerAnnotateChooseLanguage
//		computerAnnotate
//		showNewAnnotate
//		newAnnotate
//		showEditAnnotate
//		editAnnotate
//		showDeleteAnnotate
//		deleteAnnotate
//
//		showNewAnnotate_getMap
//		showEditAnnotate_annotateDiv
//
//		newAnnotate_buildSendData
//
//		newAnnotate_updateMappings
//		deleteAnnotate_updateMappings
//		insertText_updateMappings
//		deleteText_updateMappings
//		newImageObj_updateMappings
//		deleteImageObj_updateMappings
//		newAudioObj_updateMappings
//		deleteAudioObj_updateMappings
//
//		allowSelectAnnotate
//		allowSelectInsert
//		getCharPattern
//		clearReadingDiv
//		text_to_htmlspans


function checkJS_openreading() {
	// build html for top bar
	var topbar_html = "<div id='topbar_div' style='border:2px #E04006 solid; padding:4px; margin:4px;'>";
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		topbar_html += "<button id='edittext_button' style='font-size:10pt'>text</button>";
		topbar_html += "<button id='annotate_button' style='font-size:10pt'>annotate</button>";
		topbar_html += "<button id='imageaudio_button' style='font-size:10pt'>image,audio</button>";
		topbar_html += "<button id='star_button' style='font-size:10pt'>star</button>";
		topbar_html += "<button id='sentence_button' style='font-size:10pt'>sentence</button>";
		topbar_html += "<button id='highlight_button' style='font-size:10pt'>highlight</button>";
		topbar_html += "&nbsp&nbsp&nbsp&nbsp";
		topbar_html += "<button id='edittop_button' style='font-size:10pt'>edit</button>";
		topbar_html += "<button id='deletetop_button' style='font-size:10pt'>delete</button>";
	}
	else {
		topbar_html += "<button id='annotate_button' style='font-size:10pt'>annotate</button>";
		topbar_html += "<button id='star_button' style='font-size:10pt'>star</button>";
		topbar_html += "<button id='sentence_button' style='font-size:10pt'>sentence</button>";
		topbar_html += "<button id='highlight_button' style='font-size:10pt'>highlight</button>";
	}
	topbar_html += "</div>";
	$("#openreading_div").before(topbar_html);
	
	// add click handlers for buttons
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		$("#edittext_button").button({icons:{ primary:"ui-icon-document" }}).unbind("click").click(function() { showEditTextChooseType(); });
		$("#annotate_button").button({icons:{ primary:"ui-icon-comment" }}).unbind("click").click(function() { showAnnotateChooseType(); });
		$("#imageaudio_button").button({icons:{ primary:"ui-icon-image" }}).unbind("click").click(function() { showInsertChooseType(); });
		$("#star_button").button({icons:{ primary:"ui-icon-star" }}).unbind("click").click(function() { showStarChooseType(); });
		$("#sentence_button").button({icons:{ primary:"ui-icon-note" }}).unbind("click").click(function() { showSentenceChooseType(); });
		$("#highlight_button").button({icons:{ primary:"ui-icon-flag" }}).unbind("click").click(function() { highlightWord(null,(GLOBAL_highlightingWords+1)%2); });
		$("#edittop_button").button({icons:{ primary:"ui-icon-pencil" }}).unbind("click").hide();
		$("#deletetop_button").button({icons:{ primary:"ui-icon-trash" }}).unbind("click").hide();
	}
	else {
		$("#annotate_button").button({icons:{ primary:"ui-icon-comment" }}).unbind("click").click(function() { showAnnotate("open",null); });
		$("#star_button").button({icons:{ primary:"ui-icon-star" }}).unbind("click").click(function() { showStarChooseType(); });
		$("#sentence_button").button({icons:{ primary:"ui-icon-note" }}).unbind("click").click(function() { showSentenceChooseType(); });
		$("#highlight_button").button({icons:{ primary:"ui-icon-flag" }}).unbind("click").click(function() { highlightWord(null,(GLOBAL_highlightingWords+1)%2); });
	}
	
	// setup ajax global events
	$(document).ajaxStart(function() { showAjaxWaiting(1); });
	$(document).ajaxStop(function() { showAjaxWaiting(0); });
}

function parseJSON_openreading() {

	switch(GLOBAL_JSONstate.action) {
		case "createReading" :
			openReading(GLOBAL_JSONstate.message);
			break;
		case "openReading" :
			openReading(GLOBAL_JSONstate.message);
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


function openReading(msg) {

	// surround each character, including whitespace, with a span
 	insertSurroundingSpans();
 	
 	// attach mouseover, click handlers to spans
 	attachSpanHandler(null);
 	
 	// insert all objects
 	insertObject(null);
 	
 	// attach click handlers to objects
 	attachObjectHandler(null);
	
	// set size of opendrill div
 	adjustSizeDiv("openreading_div");
 	$(window).unbind("resize").resize(function() { adjustSizeDiv("openreading_div"); });
		
}

function insertSurroundingSpans() {

	var nospans_textstr = $("#openreading_div").text();
	
	var index_ctr = 0;
	var spans_htmlstr = text_to_htmlspans(nospans_textstr,index_ctr);

	$("#openreading_div").html(spans_htmlstr);
}

function attachSpanHandler(charKEY) {

	// attach mouseover,click handlers for one character span
	if(charKEY) {
		
		var mouseoverFUNC = function() { highlightCharset(charKEY,1,0); };
		var mouseoutFUNC = function() { highlightCharset(charKEY,0,0); };
		var clickFUNC = function() {
			highlightCharset(charKEY,1,1);
			
			var charVAL = GLOBAL_JSONcharTOword[charKEY];
			if($("#"+charKEY).attr("stick")) {
				$("#edittop_button").button().unbind("click").click(function() { showEditAnnotate(charVAL[0],charVAL[1]); }).show();
				$("#deletetop_button").button().unbind("click").click(function() { showDeleteAnnotate(charVAL[0],charVAL[1]); }).show();
			}
			else {
				$("#edittop_button").button().unbind("click").hide();
				$("#deletetop_button").button().unbind("click").hide();
			}
			
			// star word, update dialog
			if(GLOBAL_selectingStarred==1) {
				GLOBAL_JSONstar[charVAL[0]] = "";
				showStarChooseType();
			}
			
			// search sentence
			if(GLOBAL_selectingSentence==1) {
				$("#searchsentence_input").val(GLOBAL_JSONwordTOannotate[charVAL[0]]["dict"]);
			}
		};
	
		$("#"+charKEY).unbind("mouseover").mouseover(mouseoverFUNC)
						.unbind("mouseout").mouseout(mouseoutFUNC)
						.unbind("click").click(clickFUNC);
	}
	
	// attach handlers to all character spans
	else {
		for(var charKEYi in GLOBAL_JSONcharTOword) { if(charKEYi) { attachSpanHandler(charKEYi); } }
	}
}

function insertObject(objKEY) {
	
	// insert one object
	var objVAL = GLOBAL_JSONobjTOchar[objKEY];
	if(objVAL) {
		var afterid = objVAL["afterID"];
		var objtype = objVAL["type"];
	
		// insert span after insert start
		$("#"+objKEY+"_OBJ_div").remove();
		var obj_html = "<div id=\""+objKEY+"_OBJ_div\" objtype=\""+objtype+"\" style='width:100%'></div><br id=\""+objKEY+"_OBJ_br\">";
		if(afterid==-1) { $("#openreading_div").prepend(obj_html); }
		else {
			if($("#"+afterid).attr("newline")) { $("#BR1_"+afterid).after(obj_html); }
			else { $("#"+afterid).after(obj_html); }
		}
		
		switch(objtype) {
			case "image" :
				var imageURL = objVAL["URL"];
				var imageHeight = objVAL["height"];
				var imageWidth = objVAL["width"];
				if(imageURL=="") { $("#"+objKEY+"_OBJ_div").html("error loading image"); }
				else {
					$("#"+objKEY+"_OBJ_div").html("<img id=\""+objKEY+"_IMG\" src=\""+imageURL+"\"/>");
					$("#"+objKEY+"_IMG").height(imageHeight).width(imageWidth);
				}
				break;
				
			case "audio" :
				var audioURL = objVAL["URL"];
				if(audioURL=="") { $("#"+objKEY+"_OBJ_div").html("error loading audio"); }
				else {
					var audio_html = "<audio controls id=\""+objKEY+"_AUD\">";
					audio_html += "<source src=\""+audioURL+"\">";
					audio_html += "<a id=\""+objKEY+"_AUD_link\" style='font-size:11px' href=\""+audioURL+"\">download this audio file</a>";
					audio_html += "</audio>";
					$("#"+objKEY+"_OBJ_div").html(audio_html);
				}
				break;
		}
	}
	
	// insert all objects
	else {
		for(var objKEYi in GLOBAL_JSONobjTOchar) { insertObject(objKEYi); }
	}
}

function attachObjectHandler(objKEY) {
	
	// if not logged in, don't need handlers
	if(parseInt(GLOBAL_JSONstate["logged_in"])==0) { return; }
	
	// attach handler to one object
	var objVAL = GLOBAL_JSONobjTOchar[objKEY];
	if(objVAL) {
		var afterid = objVAL["afterID"];
		var objtype = objVAL["type"];

		switch(objtype) {
			case "image" :
// 				if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
				$("#"+objKEY+"_IMG")
					.unbind("mouseover").mouseover(function() { $(this).css("border","4px solid orange"); })
					.unbind("mouseout").mouseout(function() { $(this).css("border","0px solid white"); })
					.unbind("click").click(function() {
						if($("#"+objKEY+"_OBJ_div").attr("stick")) {
							$("#edittop_button").button().unbind("click").click(function() { showEditImageObj("",objKEY); }).show();
							$("#deletetop_button").button().unbind("click").click(function() { showDeleteImageObj("",objKEY); }).show();
							$("#"+objKEY+"_OBJ_div").removeAttr("stick");
						}
						else {
							$("#edittop_button").button().unbind("click").hide();
							$("#deletetop_button").button().unbind("click").hide();
							$("#"+objKEY+"_OBJ_div").attr("stick",1);
						}
						
// 							$("#edittop_button").button().unbind("click").click(function() { showEditImageObj("",objKEY); }).show();
// 							$("#deletetop_button").button().unbind("click").click(function() { showDeleteImageObj("",objKEY); }).show();
					});
// 				}
				break;
				
			case "audio" :
				$("#"+objKEY+"_AUD")
					.unbind("mouseover").mouseover(function() { $(this).css("border","4px solid orange"); })
					.unbind("mouseout").mouseout(function() { $(this).css("border","0px solid white"); })
					.unbind("click").click(function() {
						if($("#"+objKEY+"_OBJ_div").attr("stick")) {
							$("#edittop_button").button().unbind("click").click(function() { showEditAudioObj("",objKEY); }).show();
							$("#deletetop_button").button().unbind("click").click(function() { showDeleteAudioObj("",objKEY); }).show();
							$("#"+objKEY+"_OBJ_div").removeAttr("stick");
						}
						else {
							$("#edittop_button").button().unbind("click").hide();
							$("#deletetop_button").button().unbind("click").hide();
							$("#"+objKEY+"_OBJ_div").attr("stick",1);
						}

// 						if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
// 							$("#edittop_button").button().unbind("click").click(function() { showEditAudioObj("",objKEY); }).show();
// 							$("#deletetop_button").button().unbind("click").click(function() { showDeleteAudioObj("",objKEY); }).show();
// 						}
// 						else { showPlayAudioObj("",objKEY); }
					});
				break;
		}
	}
	
	// insert handler for all objects
	else {
		for(var objKEYi in GLOBAL_JSONobjTOchar) { attachObjectHandler(objKEYi); }
	}
}


var GLOBAL_highlightColors = { 0:"#FFFF7E", 1:"#B0E2FF", 2:"#BCEE68" };
GLOBAL_highlightingWords = 0;
function highlightWord(wordKEY,highlight) {

	// update global variable
	GLOBAL_highlightingWords = highlight;

	// highlight one word
	var wordVAL = GLOBAL_JSONwordTOannotate[wordKEY];
	if(wordVAL) {
		$.each(wordVAL["charset"],function(key,arr) {
			
			var highlightcolor = 0;
			
			var before_charKEY = parseInt(arr[0]) -1;
			var before_highlightcolor = 2;
			if($("#"+before_charKEY).length>0 && $("#"+before_charKEY).attr("highlight-color")) { before_highlightcolor = parseInt($("#"+before_charKEY).attr("highlight-color")); }
			
			var after_charKEY = parseInt(arr[arr.length-1]) +1;
			var after_highlightcolor = 1;
			if($("#"+after_charKEY).length>0 && $("#"+after_charKEY).attr("highlight-color")) { after_highlightcolor = parseInt($("#"+after_charKEY).attr("highlight-color")); }
			
			if(highlightcolor==before_highlightcolor) { highlightcolor = (highlightcolor+1)%3; }
			if(highlightcolor==after_highlightcolor) { highlightcolor = (highlightcolor+1)%3; }
			
			var highlightcolorstr = GLOBAL_highlightColors[highlightcolor];
			$.each(arr,function(key2,charKEY) {
			
				if(highlight==1) {
					$("#"+charKEY).attr("highlight-color",highlightcolor).css("background-color",highlightcolorstr);
				}
				else {
					$("#"+charKEY).removeAttr("highlight-color").css("background-color","white");
				}
				
				// remove stick attibute, so words don't highlight randomly when you mouse over them
				$("#"+charKEY).removeAttr("stick");
			});
		});
	}
	
	// highlight all words
	else {
		for(var wordKEYi in GLOBAL_JSONwordTOannotate) { highlightWord(wordKEYi,highlight); }
	}

}

function highlightCharset(charKEY,on,stick) {

	var hasStickAttr = $("#"+charKEY).attr("stick");

	// return here if stick attribute set (clicked before), on=0 (turn off), and stick=0 (mouse event)
	if(stick==0 && on==0 && hasStickAttr) { return; }
	
	// just swap highlight on/off if on=1 (don't force off) and stick=1 (click event)
	else if(stick==1 && on==1) { on = hasStickAttr ? 0 : 1; }

	// return here if no charTOword mapping
	var charVAL = GLOBAL_JSONcharTOword[charKEY];
	if(!charVAL) { return; }
	
	var wordKEY = charVAL[0];
	var annotateCHARSET_IND = charVAL[1];
	var annotateCHARSET_ARR = GLOBAL_JSONwordTOannotate[wordKEY]["charset"][annotateCHARSET_IND];

	if(on==1) {
		$.each(annotateCHARSET_ARR,function(key,val) {
			$("#"+val).css("background-color","pink");
			if(stick==1) { $("#"+val).attr("stick",true); }
		});
		showAnnotate("keepstate",wordKEY);
	}
	else {
		$.each(annotateCHARSET_ARR,function(key,val) {
			if($("#"+val).attr("highlight-color")) { $("#"+val).css("background-color",GLOBAL_highlightColors[$("#"+val).attr("highlight-color")]); }
			else { $("#"+val).css("background-color","white"); }
			if(stick==1) { $("#"+val).removeAttr("stick"); }
		});
	}
}

function showAnnotate(open,wordKEY) {

	// open annotate dialog
	if(open=="open") {

		// build dialog
		if($("#showannotate_dialog").length<=0) {
			// build html
			var showAnnotate_html = "<div id='showannotate_content' class='content'>";
			showAnnotate_html += "<header class='page-entry-header'><h1 class='entry-title' id='showannotate_header_h1'></h1></header>";
			showAnnotate_html += "<div class='wpcf7'>";
			showAnnotate_html += "<span id='showannotate_message_span' class='msg'></span>";
			showAnnotate_html += "<div id='showannotate_annotatediv_div' style='float:left'>";
			showAnnotate_html += "<label id='showannotate_annotatediv_dict_label' class='annotate_header'>Dictionary Form</label>";
			showAnnotate_html += "<br>";
			showAnnotate_html += "<div id='showannotate_annotatediv_dict_span' class='annotate_text'></div>";
			showAnnotate_html += "<br><br>";
			showAnnotate_html += "<label id='showannotate_annotatediv_pronounce_label' class='annotate_header'>Pronunciation</label>";
			showAnnotate_html += "<br>";
			showAnnotate_html += "<div id='showannotate_annotatediv_pronounce_span' class='annotate_text'></div>";
			showAnnotate_html += "<br><br>";
			showAnnotate_html += "<label id='showannotate_annotatediv_text_label' class='annotate_header'>Text</label>";
			showAnnotate_html += "<br>";
			showAnnotate_html += "<div id='showannotate_annotatediv_text_div' class='annotate_text'></div>";
			showAnnotate_html += "</div>";
			showAnnotate_html += "<br><br>";
			showAnnotate_html += "</div>";
			showAnnotate_html += "</div>";
		
			// open dialog
			$("#showannotate_dialog").dialog("close");
			$("body").append("<div id='showannotate_dialog' style='display:none; text-align:center'></div>");
			$("#showannotate_dialog").dialog({
				autoOpen:true, position:["bottom","right"],
				width:500,
				modal:false,
				close: function() {	$("#showannotate_dialog").dialog("destroy"); $("#showannotate_dialog").remove(); }
			});
		
			$("#showannotate_dialog").html(showAnnotate_html);
			
			// add click handler to buttons
		}
	}
	
	// close annotate dialog
	else if(open=="close") { $("#showannotate_dialog").dialog("close"); }

	// populate dialog if open
	if($("#showannotate_dialog").length>0) {
		var wordVAL = GLOBAL_JSONwordTOannotate[wordKEY];
		if(wordVAL) {
			$("#showannotate_message_span").text("");
			$("#showannotate_annotatediv_dict_span").text(wordVAL["dict"]);
			$("#showannotate_annotatediv_pronounce_span").text(wordVAL["pronounce"]);
			$("#showannotate_annotatediv_text_div").html(text_to_htmlnewlines(wordVAL["text"]));
		}
		else {
			$("#showannotate_message_span").text("move your mouse over an annotated word");
		}
	}
}


function selectChars(msg,ondoneFUNC,includeWhitespace) {

	// build html every time
	var newAnnotate_html = "<div id='openreading_content' class='content'>";
	newAnnotate_html += "<header class='page-entry-header'><h1 class='entry-title'>"+msg+"</h1></header>";
	newAnnotate_html += "<div class='wpcf7'>";
	newAnnotate_html += "<span id='openreading_message_span' class='msg'>Hold down CTRL or COMMAND key to select unconnected characters.</span>";
	newAnnotate_html += "<br><br>";
	newAnnotate_html += "<span id='openreading_currentselection_span' class='red-header'></span>";
	newAnnotate_html += "<br><br>";
	newAnnotate_html += "<button id='openreading_button_cancel'>cancel</button>";
	newAnnotate_html += "&nbsp&nbsp&nbsp&nbsp";
	newAnnotate_html += "<button id='openreading_button_done'>done</button>";
	newAnnotate_html += "<br><br>";
	newAnnotate_html += "</div>";
	newAnnotate_html += "</div>";

	// close show annotate dialog
	showAnnotate("close",null);

	// show instructions for selecting annotation
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); allowSelectAnnotate(0,null,includeWhitespace); }
	});

	$("#openreading_dialog").html(newAnnotate_html);
	
	// enable selectable
	var onselectFUNC = function(text_str) {
		$("#openreading_currentselection_span").text(text_str);
	};
	allowSelectAnnotate(1,onselectFUNC,includeWhitespace);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#openreading_button_done").button().unbind("click").click(function() {
		var selectedChar_arr = getSelectedChars(includeWhitespace);
		if(selectedChar_arr.length==0) { $("#openreading_message_span").text("no characters selected"); }
		else { $("#openreading_dialog").dialog("close"); ondoneFUNC(selectedChar_arr); }
	});
}

function selectInsertPosition(msg,ondoneFUNC) {

	// return here if empty
	if($("#openreading_div").text().length==0) {
		var insertstart_charKEY = -1;
		ondoneFUNC(insertstart_charKEY);
		return;
	}

	// build html every time
	var inserttype_html = "<div id='openreading_content' class='content'>";
	inserttype_html += "<header class='page-entry-header'><h1 class='entry-title'>"+msg+"</h1></header>";
	inserttype_html += "<div class='wpcf7'>";
	inserttype_html += "<span id='openreading_message_span' class='msg'>click on a character to insert after. click character again to insert before.</span>";
	inserttype_html += "<br><br>";
	inserttype_html += "<header class='page-entry-header'><h1 class='entry-title'>then click done.</h1></header>";
	inserttype_html += "<br><br>";
	inserttype_html += "<button id='openreading_button_cancel' name='cancel'>cancel</button>";
	inserttype_html += "&nbsp&nbsp&nbsp&nbsp";
	inserttype_html += "<button id='openreading_button_done' name='delete'>done</button>";
	inserttype_html += "<br><br>";
	inserttype_html += "</div>";
	inserttype_html += "</div>";

	// show instructions for selecting annotation
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:false,
		close: function() { allowSelectInsert(0); $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(inserttype_html);
	
	// close show annotate dialog
	showAnnotate("close",null);
	
	// enable insertable
	allowSelectInsert(1);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#openreading_button_done").button().unbind("click").click(function() {
		if($("#insert_placeholder").length<=0) { $("#openreading_message_span").text("no characters selected"); }
		else {
			var selectedid = parseInt($("#insert_placeholder").attr("insertcharID"));
			var insertstart_charKEY = $("#insert_placeholder").attr("insertafter")==0 ? selectedid-1 : selectedid;
			$("#openreading_dialog").dialog("close");
			
			ondoneFUNC(insertstart_charKEY);
		}
	});
}


function showEditTextChooseType() {

	// build html every time
	var edittextchoosetype_html = "<div id='openreading_content' class='content'>";
	edittextchoosetype_html += "<header class='page-entry-header'><h1 class='entry-title'>what would you like to do?</h1></header>";
	edittextchoosetype_html += "<div class='wpcf7'>";
	edittextchoosetype_html += "<span id='openreading_message_span' class='msg'></span>";
	edittextchoosetype_html += "<br><button id='inserttext_button'>insert text</button>";
	edittextchoosetype_html += "<br><button id='deletetext_button'>delete text</button>";
	edittextchoosetype_html += "<br><br>";
	edittextchoosetype_html += "<button id='openreading_button_cancel'>cancel</button>";
	edittextchoosetype_html += "<br><br>";
	edittextchoosetype_html += "</div>";
	edittextchoosetype_html += "</div>";

	// show dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(edittextchoosetype_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#inserttext_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		var ondoneFUNC = function(insertstart_charKEY) {
			allowSelectInsert(0);
			var onfinishINSERT = function() { allowSelectInsert(0); };
			var onfinishTXT = function(returnSTR) { insertText(returnSTR,insertstart_charKEY,onfinishINSERT); };
			showEditText("","",onfinishTXT);
		}
		selectInsertPosition("click where you'd like to insert the text",ondoneFUNC);
	});
	$("#deletetext_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		showDeleteText();
	});
}

function insertText(insertSTR,insertstartKEY,onfinishFUNC) {

	// return here if empty string
	if(insertSTR=="") { onfinishFUNC(); return; }

	// build new JSON object
	var sendData = {"action":"insertText","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData["insertSTR"] = json_escape_str(insertSTR);
	sendData["insertStartKEY"] = insertstartKEY;

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("insertText failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);

					// success
					if(returnData.status==1) {
						var returnDataJSON = $.parseJSON(returnData.return_data);
						// update global variable
						var insertSTR = returnDataJSON["insertSTR"];
						var insertstartKEY = parseInt(returnDataJSON["insertstartKEY"]);
						var insertLength = insertSTR.length;
						
						// shift all span IDs after insert start
						[].reverse.call($("#openreading_div > span")).each(function() {
							var spanid = parseInt($(this).attr("id"));
							var new_spanid = spanid+insertLength;
							if(spanid>insertstartKEY) {
								if($("#"+spanid).attr("newline")) {
									$("#"+spanid).next().remove(); $("#"+spanid).next().remove();
									var newlineHtml = text_to_htmlspans("\n",new_spanid);
									$("#"+spanid).replaceWith(newlineHtml);
								}
								$(this).attr("id",new_spanid);
							}
						});

						insertText_updateMappings(returnDataJSON);
						
						// insert spans after insert start
						var index_ctr = insertstartKEY +1;
						var spans_htmlstr = text_to_htmlspans(insertSTR,index_ctr);
					
						if(insertstartKEY==-1) {
							if($("#"+insertLength).length>0) { $("#"+insertLength).before(spans_htmlstr); }
							else { $("#openreading_div").append(spans_htmlstr); }
						}
						else {
							if($("#"+insertstartKEY).attr("newline")) { $("#BR1_"+insertstartKEY).after(spans_htmlstr); }
							else { $("#"+insertstartKEY).after(spans_htmlstr); }
						}
						attachSpanHandler(null);
						
						// insert all objects
						insertObject(null);
						
						// attach click handlers to objects
						attachObjectHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("insertText failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showDeleteText() {

	var ondoneFUNC = function(selectedChar_arr) {
		var onfinishFUNC = function() { }
		deleteText(selectedChar_arr,onfinishFUNC);
	}
	selectChars("select the characters to delete",ondoneFUNC,1);
}

function deleteText(delete_charKEYs,onfinishFUNC) {

	// build new JSON object
	var sendData = {"action":"deleteText","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData["delete_charKEYs"] = "[" + delete_charKEYs.join(",") + "]";

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("deleteText failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returnDataJSON = $.parseJSON(returnData.return_data);

						// shift all span IDs after delete chars
						$("#openreading_div > span").each(function() {
							var spanObj = $(this);
							var spanid = parseInt(spanObj.attr("id"));
							var new_spanid = spanid;
							$.each(returnDataJSON["delete_charKEYs"],function(key,val) {
								var deleteKEY = parseInt(val);
								if(spanid>deleteKEY && new_spanid>-1) { new_spanid = new_spanid -1; }
								else if(spanid==deleteKEY) { new_spanid = -1; }
							});
							if(new_spanid==-1) {
								if($("#"+spanid).attr("newline")) {
									$("#BR1_"+spanid).remove();
								}
								$("#"+spanid).remove();
							}
							else if(new_spanid<spanid) {
								if($("#"+spanid).attr("newline")) {
									$("#"+spanid).next().remove(); $("#"+spanid).next().remove();
									var newlineHtml = text_to_htmlspans("\n",new_spanid);
									$("#"+spanid).replaceWith(newlineHtml);
								}
								$("#"+spanid).attr("id",new_spanid);
							}
						});

						deleteText_updateMappings(returnDataJSON);
						
						// insert all objects
						insertObject(null);
						
						// attach click handlers to objects
						attachObjectHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("deleteText failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}


function showInsertChooseType() {

	// build html every time
	var insertchoosetype_html = "<div id='openreading_content' class='content'>";
	insertchoosetype_html += "<header class='page-entry-header'><h1 class='entry-title'>what would you like to insert?</h1></header>";
	insertchoosetype_html += "<div class='wpcf7'>";
	insertchoosetype_html += "<span id='openreading_message_span' class='msg'></span>";
	insertchoosetype_html += "<br><button id='newImageObj_button'>image</button>";
	insertchoosetype_html += "<br><button id='newAudioObj_button'>audio</button>";
	insertchoosetype_html += "<br><br>";
	insertchoosetype_html += "<button id='openreading_button_cancel'>cancel</button>";
	insertchoosetype_html += "<br><br>";
	insertchoosetype_html += "</div>";
	insertchoosetype_html += "</div>";

	// show dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(insertchoosetype_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); allowSelectInsert(0); });
	$("#newImageObj_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		
		var ondoneFUNC = function(insertstart_charKEY) {
			var onfinishINSERT = function() { allowSelectInsert(0); };
			var onfinishIMG = function(returnURL,returnHeight,returnWidth) { newImageObj(returnURL,returnHeight,returnWidth,insertstart_charKEY,onfinishINSERT); }
			showEditImage("","",0,0,onfinishIMG);
		}
		selectInsertPosition("click where you'd like to insert the image",ondoneFUNC);
	});
	$("#newAudioObj_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		
		var ondoneFUNC = function(insertstart_charKEY) {
			var onfinishINSERT = function() { allowSelectInsert(0); };
			var onfinishAUD = function(returnURL) { newAudioObj(returnURL,insertstart_charKEY,onfinishINSERT); };
			showEditAudio("","",onfinishAUD);
		}
		selectInsertPosition("click where you'd like to insert the audio",ondoneFUNC);
	});
}

function newImageObj(insertURL,insertHeight,insertWidth,insertstartKEY,onfinishFUNC) {

	// return here if empty URL
	if(insertURL=="") { onfinishFUNC(); return; }

	// build new JSON object
	var sendData = {"action":"newImageObj","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"objID":GLOBAL_JSONhashsizes["objTOchar"]};
	sendData["objURL"] = insertURL;
	sendData["objHeight"] = insertHeight;
	sendData["objWidth"] = insertWidth;
	sendData["objStartKEY"] = insertstartKEY;
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("newImageObj failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returndataJSON = $.parseJSON(returnData.return_data);
						newImageObj_updateMappings(returndataJSON);
// 						insertObject(returndataJSON["objID"]);
// 						attachObjectHandler(returndataJSON["objID"]);

						// insert all objects
						insertObject(null);
						
						// attach click handlers to objects
						attachObjectHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("newImageObj failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function newAudioObj(insertURL,insertstartKEY,onfinishFUNC) {

	// return here if empty URL
	if(insertURL=="") { onfinishFUNC(); return; }

	// build new JSON object
	var sendData = {"action":"newAudioObj","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"objID":GLOBAL_JSONhashsizes["objTOchar"]};
	sendData["objURL"] = insertURL;
	sendData["objStartKEY"] = insertstartKEY;

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("newAudioObj failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returndataJSON = $.parseJSON(returnData.return_data);
						newAudioObj_updateMappings(returndataJSON);
// 						insertObject(returndataJSON["objID"]);
// 						attachObjectHandler(returndataJSON["objID"]);

						// insert all objects
						insertObject(null);
						
						// attach click handlers to objects
						attachObjectHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("newAudioObj failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showEditImageObj(msg,objKEY) {

	var objVAL = GLOBAL_JSONobjTOchar[objKEY];
	var onfinishFUNC = function(returnURL,returnHeight,returnWidth) { editImageObj(objKEY,returnURL,returnHeight,returnWidth); }
	showEditImage(msg,objVAL["URL"],objVAL["height"],objVAL["width"],onfinishFUNC);
}

function editImageObj(objKEY,imageURL,imageHeight,imageWidth) {

	// delete if empty URL
	if(imageURL=="") { showDeleteImageObj("",objKEY); return; }

	// build new JSON object
	var sendData = {"action":"newImageObj","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"objID":objKEY};
	sendData["objURL"] = imageURL;
	sendData["objHeight"] = imageHeight;
	sendData["objWidth"] = imageWidth;
	sendData["objStartKEY"] = GLOBAL_JSONobjTOchar[objKEY]["afterID"];

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("editImageObj failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returndataJSON = $.parseJSON(returnData.return_data);
						newImageObj_updateMappings(returndataJSON);
						insertObject(returndataJSON["objID"]);
						attachObjectHandler(returndataJSON["objID"]);
						
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("editImageObj failed : \n\n"+returnData.message); }
				}
				
			}
	});
}

function showEditAudioObj(msg,objKEY) {

	var objVAL = GLOBAL_JSONobjTOchar[objKEY];
	var onfinishFUNC = function(returnURL) { editAudioObj(objKEY,returnURL); }
	showEditAudio(msg,objVAL["URL"],onfinishFUNC);
}

function editAudioObj(objKEY,audioURL) {

	// delete if empty URL
	if(audioURL=="") { showDeleteAudioObj("",objKEY); return; }

	// build new JSON object
	var sendData = {"action":"newAudioObj","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"objID":objKEY};
	sendData["objURL"] = audioURL;
	sendData["objStartKEY"] = GLOBAL_JSONobjTOchar[objKEY]["afterID"];

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("editAudioObj failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returndataJSON = $.parseJSON(returnData.return_data);
						newAudioObj_updateMappings(returndataJSON);
						insertObject(returndataJSON["objID"]);
						attachObjectHandler(returndataJSON["objID"]);
						
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("editAudioObj failed : \n\n"+returnData.message); }
				}
				
			}
	});
}

function showDeleteImageObj(msg,objKEY) {

	// build html every time
	var deleteImageObj_html = "<div id='openreading_content' class='content'>";
	deleteImageObj_html += "<header class='page-entry-header'><h1 class='entry-title'>are you sure you want to delete?</h1></header>";
	deleteImageObj_html += "<div class='wpcf7'>";
	deleteImageObj_html += "<span id='openreading_message_span' class='msg'>"+msg+"</span>";
	deleteImageObj_html += "<br><br>";
	deleteImageObj_html += "<button id='openreading_button_cancel'>cancel</button>";
	deleteImageObj_html += "&nbsp&nbsp&nbsp&nbsp";
	deleteImageObj_html += "<button id='openreading_button_send'>delete</button>";
	deleteImageObj_html += "<br><br>";
	deleteImageObj_html += "</div>";
	deleteImageObj_html += "</div>";

	// confirm delete
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(deleteImageObj_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#openreading_button_send").button().unbind("click").click(function() {
		var onfinishFUNC = function() { $("#openreading_dialog").dialog("close"); };
		deleteImageObj(objKEY,onfinishFUNC);
	});
}

function deleteImageObj(objKEY,onfinishFUNC) {

	// build new JSON object
	var sendData = {"action":"deleteImageObj","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"objID":objKEY};

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("deleteImageObj failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returndataJSON = $.parseJSON(returnData.return_data);
						deleteImageObj_updateMappings(returndataJSON);
						$("#"+objKEY+"_OBJ_div").remove();
						$("#"+objKEY+"_OBJ_br").remove();
						
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("deleteImageObj failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showDeleteAudioObj(msg,objKEY) {

	// build html every time
	var deleteAudioObj_html = "<div id='openreading_content' class='content'>";
	deleteAudioObj_html += "<header class='page-entry-header'><h1 class='entry-title'>are you sure you want to delete?</h1></header>";
	deleteAudioObj_html += "<div class='wpcf7'>";
	deleteAudioObj_html += "<span id='openreading_message_span' class='msg'>"+msg+"</span>";
	deleteAudioObj_html += "<br><br>";
	deleteAudioObj_html += "<button id='openreading_button_cancel'>cancel</button>";
	deleteAudioObj_html += "&nbsp&nbsp&nbsp&nbsp";
	deleteAudioObj_html += "<button id='openreading_button_send'>delete</button>";
	deleteAudioObj_html += "<br><br>";
	deleteAudioObj_html += "</div>";
	deleteAudioObj_html += "</div>";

	// confirm delete
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(deleteAudioObj_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#openreading_button_send").button().unbind("click").click(function() {
		var onfinishFUNC = function() { $("#openreading_dialog").dialog("close"); };
		deleteAudioObj(objKEY,onfinishFUNC);
	});
}

function deleteAudioObj(objKEY,onfinishFUNC) {

	// build new JSON object
	var sendData = {"action":"deleteAudioObj","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid,"objID":objKEY};
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("deleteAudioObj failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returndataJSON = $.parseJSON(returnData.return_data);
						deleteAudioObj_updateMappings(returndataJSON);
						$("#"+objKEY+"_OBJ_div").remove();
						$("#"+objKEY+"_OBJ_br").remove();
						
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("deleteAudioObj failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showPlayAudioObj(msg,objKEY) {

	// lookup audio URL
	var audioURL = GLOBAL_JSONobjTOchar[objKEY]["URL"];

	// build html every time
	var playAudioObj_html = "<div id='openreading_content' class='content'>";
	playAudioObj_html += "<header class='page-entry-header'><h1 class='entry-title'>listen to audio file</h1></header>";
	playAudioObj_html += "<div class='wpcf7'>";
	playAudioObj_html += "<span id='openreading_message_span' class='msg'>"+msg+"</span>";
	playAudioObj_html += "<br><br>";
	playAudioObj_html += "<audio controls id=\"showPlayAudioObj_audio\">";
	playAudioObj_html += "<source src=\""+audioURL+"\">";
	playAudioObj_html += "<a id=\"showPlayAudioObj_link\" style='font-size:11px' href=\""+audioURL+"\">download this audio file</a>";
	playAudioObj_html += "</audio>";
	playAudioObj_html += "<br><br>";
	playAudioObj_html += "<button id='openreading_button_cancel'>ok</button>";
	playAudioObj_html += "<br><br>";
	playAudioObj_html += "</div>";
	playAudioObj_html += "</div>";

	// show dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["bottom","right"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(playAudioObj_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
}


var GLOBAL_selectingStarred = 0;
function showStarChooseType() {

	// build html every time
	var starchoosetype_html = "<div id='openreading_content' class='content'>";
	starchoosetype_html += "<header class='page-entry-header'><h1 class='entry-title'>click an annotated word in the text to star it.</h1></header>";
	starchoosetype_html += "<div class='wpcf7'>";
	starchoosetype_html += "<span id='openreading_message_span' class='msg'></span>";
	starchoosetype_html += "<div id='openreading_starredlist_div' style='height:125px; width:100%; overflow:auto; font-size:12px;'></div>";
	starchoosetype_html += "<br>";
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		starchoosetype_html += "<br><button id='savestarred_button'>save changes</button>";
		starchoosetype_html += "<br>";
	}
	starchoosetype_html += "<br><button id='openreading_practicestarred_button'>practice flashcards</button>";
	starchoosetype_html += "<br>";
	starchoosetype_html += "<button id='openreading_button_cancel'>cancel</button>";
	starchoosetype_html += "<br><br>";
	starchoosetype_html += "</div>";
	starchoosetype_html += "</div>";

	// open dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:false,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); GLOBAL_selectingStarred = 0; }
	});

	$("#openreading_dialog").html(starchoosetype_html);
	
	// populate starred list
	var star_ctr = 1;
	for(var starKEYi in GLOBAL_JSONstar) {
		var starVALi = GLOBAL_JSONstar[starKEYi];
		var star_wordVAL = GLOBAL_JSONwordTOannotate[starKEYi];
		var star_str = star_ctr + ". " + star_wordVAL["dict"];
		if(star_wordVAL["pronounce"]) { star_str += " , " + star_wordVAL["pronounce"]; }
		if(star_wordVAL["defn"]) { star_str += " , " + star_wordVAL["defn"]; }
		var star_spanstr = "<span id=\"starredlist"+starKEYi+"_span\">"+star_str+"</span>";
		star_spanstr += "<span id=\"starredlistX"+starKEYi+"_span\" starkey=\""+starKEYi+"\"></span><br>";
		
		$("#openreading_starredlist_div").append(star_spanstr);
		$("#starredlistX"+starKEYi+"_span").text("  X  ")
			.css("padding","1px").css("color","orange")
			.hover(function() { $(this).css("color","green"); },function() { $(this).css("color","orange"); })
			.click(function() { delete GLOBAL_JSONstar[$(this).attr("starkey")]; showStarChooseType(); });
		
		star_ctr++;
	}
	
	GLOBAL_selectingStarred = 1;
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		$("#savestarred_button").button().unbind("click").click(function() {
			var starKEY_arr = []; var starKEY_ctr = 0;
			for(var starKEYi in GLOBAL_JSONstar) { starKEY_arr[starKEY_ctr] = starKEYi; starKEY_ctr++; }
			var onfinishFUNC = function() { $("#openreading_dialog").dialog("close"); };
			
			saveStar(starKEY_arr,onfinishFUNC);
		});
	}
	$("#openreading_practicestarred_button").button().unbind("click").click(function() { practiceStarred(); });
}

function saveStar(starKEY_arr,onfinishFUNC) {
	
	// build new JSON object
	var sendData = {"action":"saveStar","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData["starKEYs"] = "["+starKEY_arr.join(",")+"]";
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("saveStar failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returnDataJSON = $.parseJSON(returnData.return_data);
						
						var newGLOBAL_JSONstar = {};
						for(var ctr=0; ctr<returnDataJSON.length; ctr++) { newGLOBAL_JSONstar[returnDataJSON[ctr]] = ""; }
						GLOBAL_JSONstar = newGLOBAL_JSONstar;
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("saveStar failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function practiceStarred() {

	// build strings to send to opencard.cgi
	var word_str = ""; var pron_str = ""; var defn_str = "";
	var star_ctr = 0;
	for(var starKEYi in GLOBAL_JSONstar) {
		var wordVAL = GLOBAL_JSONwordTOannotate[starKEYi];

		if(star_ctr>0) { word_str += "////"; pron_str += "////"; defn_str += "////"; }
		word_str += wordVAL["dict"]; pron_str += wordVAL["pronounce"]; defn_str += wordVAL["text"];
		
		star_ctr++;
	}
	
	//build html every time
	var practicestarred_html = "<form id='practicestarred_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/opencard.cgi\" method='post' target='_blank'>";
	practicestarred_html += "<input type='hidden' name='word_str' value=\""+word_str+"\">";
	practicestarred_html += "<input type='hidden' name='pron_str' value=\""+pron_str+"\">";
	practicestarred_html += "<input type='hidden' name='defn_str' value=\""+defn_str+"\">";
	practicestarred_html += "</form>";

	$("body").append(practicestarred_html);
	$("#practicestarred_form").hide();
	
	// submit form and remove from dom
	$("#practicestarred_form").submit();
	$("#practicestarred_form").remove();
}


var GLOBAL_selectingSentence = 0;
function showSentenceChooseType() {

	// build html every time
	var sentencechoosetype_html = "<div id='openreading_content' class='content'>";
	sentencechoosetype_html += "<header class='page-entry-header'><h1 class='entry-title'>click a word in the text to search for example sentences.</h1></header>";
	sentencechoosetype_html += "<div class='wpcf7'>";
	sentencechoosetype_html += "<span id='openreading_message_span' class='msg'></span>";
	sentencechoosetype_html += "<div id='openreading_sentencelist_div' style='height:175px; width:100%; overflow:auto; font-size:12px; text-align:left;'></div>";
	sentencechoosetype_html += "<input id='searchsentence_input' type='text'>";
	sentencechoosetype_html += "<br>";
	sentencechoosetype_html += "<select id='sentencechooselanguage_select'>";
	sentencechoosetype_html += "<option id='sentencechooselanguage_jpn_option' value='jpn'>Japanese</option>";
	sentencechoosetype_html += "<option id='sentencechooselanguage_chn_option' value='chn'>Chinese</option>";
	sentencechoosetype_html += "</select>";
	sentencechoosetype_html += "<br>";
	sentencechoosetype_html += "<br><button id='searchsentence_button'>search sentences</button>";
	sentencechoosetype_html += "<br>";
	sentencechoosetype_html += "<button id='openreading_button_cancel'>cancel</button>";
	sentencechoosetype_html += "<br><br>";
	sentencechoosetype_html += "</div>";
	sentencechoosetype_html += "</div>";

	// open dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:500,
		modal:false,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); GLOBAL_selectingSentence = 0; }
	});

	$("#openreading_dialog").html(sentencechoosetype_html);
	$("#openreading_sentencelist_div").height('0px');
	
	GLOBAL_selectingSentence = 1;
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#searchsentence_button").button().unbind("click").click(function() {
		var searchTxt = $("#searchsentence_input").val();
		var searchLanguage = $("#sentencechooselanguage_select").val();
		var onfinishFUNC = function() { };
		
		searchSentence(searchTxt,searchLanguage,onfinishFUNC);
	});
}

function searchSentence(searchTxt,searchLanguage,onfinishFUNC) {
	
	// build new JSON object
	var sendData = {"action":"searchSentence","display":"ajax"};
	sendData["searchTxt"] = searchTxt;
	sendData["searchLanguage"] = searchLanguage;

	// send post request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("searchSentence failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returnDataJSON = $.parseJSON(returnData.return_data);
						
						var sent_str = ""; var sent_ctr = 1;
						for(var sentKEYi in returnDataJSON) {
							var sentVALi = returnDataJSON[sentKEYi];
							sent_str += "<div id=\"searchsent"+sentKEYi+"_span\" style='float:left'>"+sentVALi+"<br><br></div>";
							sent_ctr++;
						}
						if(sent_ctr==1) {
							$("#openreading_message_span").text("no sentences found");
							$("#openreading_sentencelist_div").height("0px");
						}
						else {
							$("#openreading_message_span").text("");
							$("#openreading_sentencelist_div").html(sent_str).show().height("200px").width("100%")
								.css("overflow","auto").css("font-size","12pt").css("float","left");
						}
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("searchSentence failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}


function showAnnotateChooseType() {

	// build html every time
	var annotatechoosetype_html = "<div id='openreading_content' class='content'>";
	annotatechoosetype_html += "<header class='page-entry-header'><h1 class='entry-title'>how would you like to annotate?</h1></header>";
	annotatechoosetype_html += "<div class='wpcf7'>";
	annotatechoosetype_html += "<span id='openreading_message_span' class='msg'></span>";
	annotatechoosetype_html += "<br><button id='showannotate_button'>show annotations</button>";
	annotatechoosetype_html += "<br><button id='manualannotate_button'>annotate myself</button>";
	annotatechoosetype_html += "<br><button id='computerannotate_button'>let the computer annotate</button>";
	annotatechoosetype_html += "<br><br>";
	annotatechoosetype_html += "<button id='openreading_button_cancel'>cancel</button>";
	annotatechoosetype_html += "<br><br>";
	annotatechoosetype_html += "</div>";
	annotatechoosetype_html += "</div>";

	// show dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(annotatechoosetype_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#showannotate_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		showAnnotate("open",null);
	});
	$("#manualannotate_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		showNewAnnotate();
	});
	$("#computerannotate_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
		showComputerAnnotate();
	});
}

function showComputerAnnotate() {

	var ondoneFUNC = function(selectedChar_arr,annotateLanguage) {
		var onfinishFUNC = function() { highlightWord(null,1); }
		computerAnnotate(selectedChar_arr,annotateLanguage,onfinishFUNC);
	}
	var onselectFUNC = function(selectedChar_arr) {
		showComputerAnnotateChooseLanguage(selectedChar_arr,ondoneFUNC);
	}
	selectChars("select the characters for the computer to annotate",onselectFUNC,1);
}

function showComputerAnnotateChooseLanguage(selectedChar_arr,onfinishFUNC) {

	// build html every time
	var annotatechooselanguage_html = "<div id='openreading_content' class='content'>";
	annotatechooselanguage_html += "<header class='page-entry-header'><h1 class='entry-title'>please select a language</h1></header>";
	annotatechooselanguage_html += "<div class='wpcf7'>";
	annotatechooselanguage_html += "<span id='openreading_message_span' class='msg'></span>";
	annotatechooselanguage_html += "<br>";
	annotatechooselanguage_html += "<select id='annotatechooselanguage_select'>";
	annotatechooselanguage_html += "<option id='annotatechooselanguage_jpn_option' value='jpn'>Japanese</option>";
	annotatechooselanguage_html += "<option id='annotatechooselanguage_chn_option' value='chn'>Chinese</option>";
	annotatechooselanguage_html += "</select>";
	annotatechooselanguage_html += "<br><br>";
	annotatechooselanguage_html += "<button id='openreading_button_cancel'>cancel</button>";
	annotatechooselanguage_html += "&nbsp&nbsp&nbsp&nbsp";
	annotatechooselanguage_html += "<button id='openreading_button_send'>annotate</button>";
	annotatechooselanguage_html += "<br><br>";
	annotatechooselanguage_html += "</div>";
	annotatechooselanguage_html += "</div>";

	// show dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(annotatechooselanguage_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#showannotate_button").button().unbind("click").click(function() {
		$("#openreading_dialog").dialog("close");
	});
	$("#openreading_button_send").button().unbind("click").click(function() {
		var annotateLanguage = $("#annotatechooselanguage_select").val();
		$("#openreading_dialog").dialog("close");
		onfinishFUNC(selectedChar_arr,annotateLanguage);
	});
}

function computerAnnotate(selectedChar_arr,annotateLanguage,onfinishFUNC) {

	// build new JSON object
	var sendData = {"action":"computerAnnotate","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData["selected_charKEYs"] = "[" + ( selectedChar_arr.join(",") ) + "]";
	sendData["annotateLanguage"] = annotateLanguage;
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("computerAnnotate failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						newAnnotate_updateMappings($.parseJSON(returnData.return_data));
						attachSpanHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("computerAnnotate failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showNewAnnotate() {

	var ondoneFUNC = function(selectedChar_arr) {
		var new_wordKEY = GLOBAL_JSONhashsizes["wordTOannotate"];
		var getMap_selectedChar = function() { return showNewAnnotate_getMap(new_wordKEY,selectedChar_arr); }
		var onfinishFUNC = function() { showEditAnnotate(new_wordKEY,0); }
		newAnnotate(getMap_selectedChar,onfinishFUNC);
	}
	selectChars("select the characters to annotate",ondoneFUNC,0);
}

function newAnnotate(getMap_selectedChar,onfinishFUNC) {

	// build new JSON object
	var sendData = {"action":"newAnnotate","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData = newAnnotate_buildSendData(sendData,getMap_selectedChar);

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("newAnnotate failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						var returnDataJSON = $.parseJSON(returnData.return_data);
						// update global variable
						newAnnotate_updateMappings(returnDataJSON);
						attachSpanHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("newAnnotate failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showEditAnnotate(wordKEY,charsetIND) {

	// build html every time
	var editAnnotate_html = "<div id='openreading_content' class='content'>";
	editAnnotate_html += "<header class='page-entry-header'><h1 class='entry-title'>edit annotation</h1></header>";
	editAnnotate_html += "<div class='wpcf7'>";
	editAnnotate_html += "<span id='openreading_message_span' class='msg'></span>";
	editAnnotate_html += showEditAnnotate_annotateDiv(1);
	editAnnotate_html += "<br><br>";
	editAnnotate_html += "<button id='openreading_button_cancel' name='cancel'>cancel</button>";
	editAnnotate_html += "&nbsp&nbsp&nbsp&nbsp";
	editAnnotate_html += "<button id='openreading_button_send' name='save'>save changes</button>";
	editAnnotate_html += "<br><br>";
	editAnnotate_html += "</div>";
	editAnnotate_html += "</div>";

	// close show annotate dialog
	showAnnotate("close",null);

	// open dialog
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:600,
		modal:true,
		close: function() {	$("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(editAnnotate_html);
	
	// add handlers to tabs
 	var getsetFields_annotateDiv = showEditAnnotate_annotateDiv(0);
	
	// set fields with current values
	getsetFields_annotateDiv["dict"]("set",GLOBAL_JSONwordTOannotate[wordKEY]["dict"]);
	getsetFields_annotateDiv["pronounce"]("set",GLOBAL_JSONwordTOannotate[wordKEY]["pronounce"]);
	getsetFields_annotateDiv["text"]("set",GLOBAL_JSONwordTOannotate[wordKEY]["text"]);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_dialog").dialog("close"); });
	$("#openreading_button_send").button().unbind("click").click(function() {
		var onfinishFUNC = function() {
			$("#openreading_dialog").dialog("close");
			showAnnotate("open",wordKEY);
			var charKEY = GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetIND][0];
			highlightCharset(charKEY,0,1);
			highlightCharset(charKEY,1,1);
		}
		editAnnotate(wordKEY,getsetFields_annotateDiv,onfinishFUNC);
	});
}

function editAnnotate(wordKEY,getsetFields_annotateDiv,onfinishFUNC) {
	
	// build new JSON object
	var sendData = {"action":"newAnnotate","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	
	var getMap_selectedChar = {
		"delete_charKEYs" : [],
		
		"add_charKEYs" : [],
		"add_charVALi0s" : [],
		"add_charVALi1s" : [],
		
		"add_wordKEYs" : [ wordKEY ],
		"add_annotateDICTs" : [ getsetFields_annotateDiv["dict"]("get",null) ],
		"add_annotatePRONOUNCEs" : [ getsetFields_annotateDiv["pronounce"]("get",null) ],
		"add_annotateTEXTs" : [ getsetFields_annotateDiv["text"]("get",null) ],
		"add_annotateCHARSETs" : [ GLOBAL_JSONwordTOannotate[wordKEY]["charset"] ],
		"add_annotatePATTERNs" : [ GLOBAL_JSONwordTOannotate[wordKEY]["pattern"] ]
	};
	sendData = newAnnotate_buildSendData(sendData,function() { return getMap_selectedChar; });

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("editAnnotate failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						var returnDataJSON = $.parseJSON(returnData.return_data);
						// update global variable
						newAnnotate_updateMappings(returnDataJSON);
						attachSpanHandler(null);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("editAnnotate failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}

function showDeleteAnnotate(wordKEY,charsetIND) {

	// build html every time
	var charPattern = getCharPattern(GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetIND]);
	
	var deleteAnnotate_html = "<div id='openreading_content' class='content'>";
	deleteAnnotate_html += "<header class='page-entry-header'><h1 class='entry-title'>are you sure you want to delete?</h1></header>";
	deleteAnnotate_html += "<div class='wpcf7'>";
	deleteAnnotate_html += "<span id='openreading_message_span' class='msg'>Annotation for : "+charPattern+"</span>";
	deleteAnnotate_html += "<br><br>";
	deleteAnnotate_html += "<button id='openreading_button_cancel' name='cancel'>cancel</button>";
	deleteAnnotate_html += "&nbsp&nbsp&nbsp&nbsp";
	deleteAnnotate_html += "<button id='openreading_button_send' name='delete'>delete</button>";
	deleteAnnotate_html += "<br><br>";
	deleteAnnotate_html += "</div>";
	deleteAnnotate_html += "</div>";

	// confirm delete
	$("#openreading_dialog").dialog("close");
	$("body").append("<div id='openreading_dialog' style='display:none; text-align:center'></div>");
	$("#openreading_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#openreading_dialog").dialog("destroy"); $("#openreading_dialog").remove(); }
	});

	$("#openreading_dialog").html(deleteAnnotate_html);
	
	// add click handler to buttons
	$("#openreading_button_cancel").button().unbind("click").click(function() { $("#openreading_button_send").dialog("close"); });
	$("#openreading_button_send").button().unbind("click").click(function() {
		var onfinishFUNC = function() { $("#openreading_dialog").dialog("close"); };
		deleteAnnotate(wordKEY,charsetIND,onfinishFUNC);
	});
}

function deleteAnnotate(wordKEY,charsetIND,onfinishFUNC) {
	
	// build new JSON object
	var delete_charKEYs = GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetIND];
	var sendData = {"action":"deleteAnnotate","display":"ajax","blueprintid":GLOBAL_JSONstate.blueprintid};
	sendData["delete_charKEYs"] = "["+delete_charKEYs.join(",")+"]";
	
	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/openreading.cgi",
		type:"POST",
		cache:false,
		data:sendData,
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("deleteAnnotate failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// update global variable
						var returnDataJSON = $.parseJSON(returnData.return_data);

						// remove handlers
						$.each(returnDataJSON["delete_charKEYs"],function(key,val) {
							highlightCharset(val,0,1);
							$("#"+val).unbind("mouseover").unbind("mouseout").unbind("click");
						});
						// !! shouldn't need to do this. if not, re-annotating a deleted word causes selecting to be white, not orange.
						$.each(returnDataJSON["delete_charKEYs"],function(key,val) { $("#"+val).attr("style",""); });
						$("#edittop_button").button().unbind("click").hide();
						$("#deletetop_button").button().unbind("click").hide();

						deleteAnnotate_updateMappings(returnDataJSON);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("deleteAnnotate failed : \n\n"+returnData.message); }
				}
				
				onfinishFUNC();
			}
	});
}


function showNewAnnotate_getMap(new_wordKEY,selectedChar_arr) {
	
	// delete mappings in charTOword
	var delete_charKEYs = [];
	
	// add mappings in charTOword
	var add_charKEYs = [];
	var add_charVALi0s = [];
	var add_charVALi1s = [];

	$.each(selectedChar_arr,function(key,val) {
		var new_charKEY = val;
		
		// delete mapping in charTOword
		var prev_charVAL = GLOBAL_JSONcharTOword[new_charKEY];
		if(prev_charVAL) { delete_charKEYs.push(new_charKEY); }
		
		// add mapping in charTOword
		add_charKEYs.push(new_charKEY);
		add_charVALi0s.push(new_wordKEY);
		add_charVALi1s.push(0);
	});

	// add mappings in wordTOannotate
	var add_wordKEYs = [];
	var add_annotateDICTs = [];
	var add_annotatePRONOUNCEs = [];
	var add_annotateTEXTs = [];
	var add_annotateCHARSETs = [];
	var add_annotatePATTERNs = [];

	var selected_str = getCharPattern(selectedChar_arr);

	add_wordKEYs.push(new_wordKEY);
	add_annotateDICTs.push(selected_str);
	add_annotatePRONOUNCEs.push("");
	add_annotateTEXTs.push("");
	add_annotateCHARSETs.push({ 0:selectedChar_arr });
	add_annotatePATTERNs.push({ 0:selected_str });
	
	// getters/setters
	var getMAP = {
		"delete_charKEYs" : delete_charKEYs,
		
		"add_charKEYs" : add_charKEYs,
		"add_charVALi0s" : add_charVALi0s,
		"add_charVALi1s" : add_charVALi1s,
		
		"add_wordKEYs" : add_wordKEYs,
		"add_annotateDICTs" : add_annotateDICTs,
		"add_annotatePRONOUNCEs" : add_annotatePRONOUNCEs,
		"add_annotateTEXTs" : add_annotateTEXTs,
		"add_annotateCHARSETs" : add_annotateCHARSETs,
		"add_annotatePATTERNs" : add_annotatePATTERNs
	}
	
	return getMAP;
}

function showEditAnnotate_annotateDiv(html) {

	// return html
	if(html==1) {
		var annotateDiv_html = "<div id='openreading_annotatediv_div'>";
		annotateDiv_html += "<fieldset class='tabs_fieldset'>";
		annotateDiv_html += "<label class='tabs_label' id='annotatediv_dict_label' for='annotatediv_dict_input'>Dictionary Form</label>";
		annotateDiv_html += "<br><br><input id='annotatediv_dict_input' class='tabs_input' type='text' style='width:80%; float:left'/>";
		annotateDiv_html += "<br><br>";
		annotateDiv_html += "<label class='tabs_label' id='annotatediv_pronounce_label' for='annotatediv_pronounce_input'>Pronunciation</label>";
		annotateDiv_html += "<br><br><input id='annotatediv_pronounce_input' class='tabs_input' type='text' style='width:80%; float:left'/>";
		annotateDiv_html += "<br><br>";
		annotateDiv_html += "<label class='tabs_label' id='annotatediv_text_label' for='annotatediv_text_input'>Text</label>";
		annotateDiv_html += "<textarea id='annotatediv_text_input' class='tabs_input'></textarea>";
		annotateDiv_html += "</fieldset>";
		annotateDiv_html += "</div>";
		
		return annotateDiv_html;
	}
	
	// attach handlers, return getter/setters
	else {
		// handlers
		
		// getter/setters
		var getsetFUNC_dict = function(getset,dict) {
			if(getset=="set") { $("#annotatediv_dict_input").val(dict); }
			else { return $("#annotatediv_dict_input").val(); }
		};
		var getsetFUNC_pronounce = function(getset,pronounce) {
			if(getset=="set") { $("#annotatediv_pronounce_input").val(pronounce); }
			else { return $("#annotatediv_pronounce_input").val(); }
		};
		var getsetFUNC_text = function(getset,text) {
			if(getset=="set") { $("#annotatediv_text_input").val(text); }
			else { return $("#annotatediv_text_input").val(); }
		};
		var getsetMAP = {
			"dict" : getsetFUNC_dict,
			"pronounce" : getsetFUNC_pronounce,
			"text" : getsetFUNC_text
		};
		return getsetMAP;
	}
}


function newAnnotate_buildSendData(sendData,getMap_selectedChar) {

	var getMAP = getMap_selectedChar();

	var delete_charKEYs_str = "[" + ( getMAP["delete_charKEYs"].join(",") ) + "]";

	var add_charKEYs_str = "[" + ( getMAP["add_charKEYs"].join(",") ) + "]";
	var add_charVALi0s_str = "[" + ( getMAP["add_charVALi0s"].join(",") ) + "]";
	var add_charVALi1s_str = "[" + ( getMAP["add_charVALi1s"].join(",") ) + "]";

	var add_wordKEYs_str = "[" + ( getMAP["add_wordKEYs"].join(",") ) + "]";
	var add_annotateDICTs_str = "[\"" + ( getMAP["add_annotateDICTs"].join("\",\"") ) + "\"]";
	var add_annotatePRONOUNCEs_str = "[\"" + ( getMAP["add_annotatePRONOUNCEs"].join("\",\"") ) + "\"]";
	var add_annotateTEXTs_str = "[\"" + ( getMAP["add_annotateTEXTs"].join("\",\"") ) + "\"]";
	
	var add_annotateCHARSETs_arrobjarr = getMAP["add_annotateCHARSETs"];
	for(var ctr1=0; ctr1<add_annotateCHARSETs_arrobjarr.length; ctr1++) {
	
		var add_annotateCHARSETs_objarr = add_annotateCHARSETs_arrobjarr[ctr1];
		var add_annotateCHARSETs_objarr_str = "";
		$.each(add_annotateCHARSETs_objarr,function(key,val) {
			add_annotateCHARSETs_objarr_str += "\"" + key + "\" : [ \"" + val.join("\",\"") + "\" ]";
		});
		add_annotateCHARSETs_arrobjarr[ctr1] = "{" + add_annotateCHARSETs_objarr_str + "}";
	}
	var add_annotateCHARSETs_str = "[" + add_annotateCHARSETs_arrobjarr.join(",") + "]";

	var add_annotatePATTERNs_arrobj = getMAP["add_annotatePATTERNs"];
	for(var ctr1=0; ctr1<add_annotatePATTERNs_arrobj.length; ctr1++) {
	
		var add_annotatePATTERNs_obj = add_annotatePATTERNs_arrobj[ctr1];
		var add_annotatePATTERNs_obj_str = "";
		$.each(add_annotatePATTERNs_obj,function(key,val) {
			add_annotatePATTERNs_obj_str += "\"" + key + "\" : \"" + val + "\"";
		});
		add_annotatePATTERNs_arrobj[ctr1] = "{" + add_annotatePATTERNs_obj_str + "}";
	}
	var add_annotatePATTERNs_str = "[" + add_annotatePATTERNs_arrobj.join(",") + "]";

	sendData["delete_charKEYs"] = delete_charKEYs_str;
	
	sendData["add_charKEYs"] = add_charKEYs_str;
	sendData["add_charVALi0s"] = add_charVALi0s_str;
	sendData["add_charVALi1s"] = add_charVALi1s_str;
	
	sendData["add_wordKEYs"] = add_wordKEYs_str;
	sendData["add_annotateDICTs"] = remove_newlines(add_annotateDICTs_str);
	sendData["add_annotatePRONOUNCEs"] = remove_newlines(add_annotatePRONOUNCEs_str);
	sendData["add_annotateTEXTs"] = json_escape_str(add_annotateTEXTs_str);
	sendData["add_annotateCHARSETs"] = add_annotateCHARSETs_str;
	sendData["add_annotatePATTERNs"] = remove_newlines(add_annotatePATTERNs_str);

	return sendData;
}


function newAnnotate_updateMappings(returnMAP) {

	// delete mappings in charTOword
	deleteAnnotate_updateMappings(returnMAP);
	
	// add mappings in charTOword
	for(var ctr=0; ctr<returnMAP["add_charKEYs"].length; ctr++) {
	
		var add_charKEY = returnMAP["add_charKEYs"][ctr];
		var add_charVALi0 = returnMAP["add_charVALi0s"][ctr];
		var add_charVALi1 = returnMAP["add_charVALi1s"][ctr];
		
		GLOBAL_JSONcharTOword[add_charKEY] = [ add_charVALi0, add_charVALi1 ];
	}
	
	// add mappings in wordTOannotate
	var addCTR_wordTOannotate = 0;
	for(var ctr=0; ctr<returnMAP["add_wordKEYs"].length; ctr++) {
	
		var add_wordKEY = returnMAP["add_wordKEYs"][ctr];
		var add_annotateDICT = returnMAP["add_annotateDICTs"][ctr];
		var add_annotatePRONOUNCE = returnMAP["add_annotatePRONOUNCEs"][ctr];
		var add_annotateTEXT = returnMAP["add_annotateTEXTs"][ctr];
		var add_annotateCHARSET = returnMAP["add_annotateCHARSETs"][ctr];
		var add_annotatePATTERN = returnMAP["add_annotatePATTERNs"][ctr];
		
		if(!GLOBAL_JSONwordTOannotate[add_wordKEY]) { addCTR_wordTOannotate++; }
		GLOBAL_JSONwordTOannotate[add_wordKEY] = {
			"dict" : add_annotateDICT,
			"pronounce" : add_annotatePRONOUNCE,
			"text" : add_annotateTEXT,
			"charset" : add_annotateCHARSET,
			"pattern" : add_annotatePATTERN
		}
	}
	
	// update hash sizes
	GLOBAL_JSONhashsizes["charTOword"] = parseInt(GLOBAL_JSONhashsizes["charTOword"]) + returnMAP["add_charKEYs"].length;
	GLOBAL_JSONhashsizes["wordTOannotate"] = parseInt(GLOBAL_JSONhashsizes["wordTOannotate"]) + addCTR_wordTOannotate;
}

function deleteAnnotate_updateMappings(returnMAP) {

	var deleted_charKEYS = 0;
	var deleted_wordKEYS = 0;

	// delete mapping in charTOword
	for(var ctr=0; ctr<returnMAP["delete_charKEYs"].length; ctr++) {
	
		var delete_charKEY = returnMAP["delete_charKEYs"][ctr];
		var delete_charVAL = GLOBAL_JSONcharTOword[delete_charKEY];
		
		// delete mapping in wordTOannotate
		if(delete_charVAL) {
			var prev_wordKEY = delete_charVAL[0];
			var prev_annotateCHARSET_IND = delete_charVAL[1];
			
			var prev_annotateCHARSET_ARROBJ = GLOBAL_JSONwordTOannotate[prev_wordKEY]["charset"];
			var prev_annotateCHARSET_OBJ = prev_annotateCHARSET_ARROBJ[prev_annotateCHARSET_IND];
			
			// there are other characters in this charset index array
			if(prev_annotateCHARSET_OBJ.length>1) {
				GLOBAL_JSONwordTOannotate[prev_wordKEY]["charset"][prev_annotateCHARSET_IND] = $.grep(prev_annotateCHARSET_OBJ,function(val) { return delete_charKEY != parseInt(val); });
			}
			
			// there are other charset index arrays
			else if(prev_annotateCHARSET_ARROBJ.length>1) {
				delete GLOBAL_JSONwordTOannotate[prev_wordKEY]["charset"][prev_annotateCHARSET_IND];
			}
			
			// this is the last character for this word
			else {
				delete GLOBAL_JSONwordTOannotate[prev_wordKEY]; deleted_wordKEYS++;
			}
			
			delete GLOBAL_JSONcharTOword[delete_charKEY]; deleted_charKEYS++;
		}
	}
	
	// update hash size
	GLOBAL_JSONhashsizes["charTOword"] = parseInt(GLOBAL_JSONhashsizes["charTOword"]) -deleted_charKEYS;
	//GLOBAL_JSONhashsizes["wordTOannotate"] = parseInt(GLOBAL_JSONhashsizes["wordTOannotate"]) -deleted_wordKEYS;
}

function insertText_updateMappings(returnMAP) {

	var insertSTR = returnMAP["insertSTR"];
	var insertstartKEY = parseInt(returnMAP["insertstartKEY"]);
	var insertLength = insertSTR.length;

	// shift all charKEYs after insert start
	//    in charTOword, wordTOannotate hash
	var new_charTOword = {};
	for(var charKEY in GLOBAL_JSONcharTOword) {
		var new_charKEY = parseInt(charKEY);
		if(charKEY>insertstartKEY) {
			var charVAL = GLOBAL_JSONcharTOword[charKEY];
			var wordKEY = charVAL[0];
			var charsetKEY = charVAL[1];
			var charsetARR = GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetKEY];
			if(new_charKEY==parseInt(charsetARR[charsetARR.length-1])) {
				for(var ctr=0; ctr<charsetARR.length; ctr++) {
					var charsetARR_val = parseInt(charsetARR[ctr]);
					if(charsetARR_val>insertstartKEY) {
						GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetKEY][ctr] = charsetARR_val + insertLength;
					}
				}
			}
			new_charKEY += insertLength;
		}
		new_charTOword[new_charKEY] = $.extend(true, {}, GLOBAL_JSONcharTOword[charKEY]);
	}
	GLOBAL_JSONcharTOword = new_charTOword;
	
	// in objTOchar hash
	for(var objKEY in GLOBAL_JSONobjTOchar) {
		var afterID = parseInt(GLOBAL_JSONobjTOchar[objKEY]["afterID"]);
		if(afterID>insertstartKEY) {
			GLOBAL_JSONobjTOchar[objKEY]["afterID"] = afterID + insertLength;
		}
	}
}

function deleteText_updateMappings(returnMAP) {

	// delete mappings in charTOword, wordTOannotate
	deleteAnnotate_updateMappings(returnMAP);

	// shift all charKEYs after delete start
	//    in charTOword, wordTOannotate hash
	var new_charTOword = {};
	var new_wordTOannotate_charsetARR = {};
	for(var charKEY in GLOBAL_JSONcharTOword) {
		charKEY = parseInt(charKEY);
		var charVAL = GLOBAL_JSONcharTOword[charKEY];
		var wordKEY = charVAL[0];
		var charsetKEY = charVAL[1];
		var charsetARR = GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetKEY];
		var charsetARR_lastchar = parseInt(charsetARR[charsetARR.length-1]);

		var new_charKEY = charKEY;
		var new_charsetARR = $.extend(true, [], charsetARR);
		for(var delctr=0; delctr<returnMAP["delete_charKEYs"].length; delctr++) {
			var deleteKEY = parseInt(returnMAP["delete_charKEYs"][delctr]);

			if(charKEY>deleteKEY) {

				if(charKEY==charsetARR_lastchar) {
					for(var ctr=0; ctr<charsetARR.length; ctr++) {
						var charsetARR_val = parseInt(charsetARR[ctr]);
						if(charsetARR_val>deleteKEY) {
							new_charsetARR[ctr] = new_charsetARR[ctr] - 1;
						}
					}
				}
				new_charKEY = new_charKEY - 1;
				
			}
			
		}
		if(charKEY==charsetARR_lastchar) { new_wordTOannotate_charsetARR[new_charKEY] = new_charsetARR; }
		new_charTOword[new_charKEY] = GLOBAL_JSONcharTOword[charKEY];
			
	} // end..charKEY in GLOBAL_JSONcharTOword
	
	// update global lesson charTOword hash
	GLOBAL_JSONcharTOword = new_charTOword;
	
	// update global lesson wordTOannotate hash, charset arrays
	for(var charKEY in new_wordTOannotate_charsetARR) {
		var charVAL = GLOBAL_JSONcharTOword[charKEY];
		var wordKEY = charVAL[0];
		var charsetKEY = charVAL[1];
		GLOBAL_JSONwordTOannotate[wordKEY]["charset"][charsetKEY] = new_wordTOannotate_charsetARR[charKEY];
	}
		
	// update global lesson objTOchar hash
	var new_objTOchar_afterID = {};
	for(var objKEY in GLOBAL_JSONobjTOchar) {
		var afterID = parseInt(GLOBAL_JSONobjTOchar[objKEY]["afterID"]);
		
		for(var delctr=0; delctr<returnMAP["delete_charKEYs"].length; delctr++) {
			var deleteKEY = parseInt(returnMAP["delete_charKEYs"][delctr]);
			if(afterID>deleteKEY) {
				if(!new_objTOchar_afterID[objKEY]) { new_objTOchar_afterID[objKEY] = afterID; }
				new_objTOchar_afterID[objKEY] = new_objTOchar_afterID[objKEY] - 1;
			}
		}
	}
	for(var objKEY in new_objTOchar_afterID) {
		var new_afterID = new_objTOchar_afterID[objKEY];
		GLOBAL_JSONobjTOchar[objKEY]["afterID"] = new_afterID;
	}

}

function newImageObj_updateMappings(returnMAP) {

	var objID = returnMAP["objID"];
	var objURL = returnMAP["objURL"];
	var objHeight = returnMAP["objHeight"];
	var objWidth = returnMAP["objWidth"];
	var objStartKEY = returnMAP["objStartKEY"];

	// update global variables
	if(!GLOBAL_JSONhashsizes["objTOchar"][objID]) { GLOBAL_JSONhashsizes["objTOchar"] = parseInt(GLOBAL_JSONhashsizes["objTOchar"]) +1; }
	GLOBAL_JSONobjTOchar[objID] = { "afterID":objStartKEY,"type":"image","URL":objURL,"height":objHeight,"width":objWidth };
}

function deleteImageObj_updateMappings(returnMAP) {

	var objID = returnMAP["objID"];

	// update global variables
	delete GLOBAL_JSONobjTOchar[objID];
}

function newAudioObj_updateMappings(returnMAP) {

	var objID = returnMAP["objID"];
	var objURL = returnMAP["objURL"];
	var objStartKEY = returnMAP["objStartKEY"];

	// update global variables
	if(!GLOBAL_JSONhashsizes["objTOchar"][objID]) { GLOBAL_JSONhashsizes["objTOchar"] = parseInt(GLOBAL_JSONhashsizes["objTOchar"]) +1; }
	GLOBAL_JSONobjTOchar[objID] = { "afterID":objStartKEY,"type":"audio","URL":objURL };
}

function deleteAudioObj_updateMappings(returnMAP) {

	var objID = returnMAP["objID"];

	// update global variables
	delete GLOBAL_JSONobjTOchar[objID];
}


var GLOBAL_selectingAnnotate = 0;
function allowSelectAnnotate(allow,onselectFUNC,includeWhitespace) {

	// turn on selectable
	if(allow==1) {
	
		// turn off first
		if(GLOBAL_selectingAnnotate==1) { allowSelectAnnotate(0,null); }
	
		// turn off selecting
		clearSelection();
		showNewlineCharacters(1);
		$("#body").disableSelection();
		clearReadingDiv();
	
		$("#openreading_div").selectable({
			stop: function() {
						var selectedChar_arr = getSelectedChars(includeWhitespace);
						var selected_str = getCharPattern(selectedChar_arr);
						onselectFUNC(selected_str);
					},
			appendTo: "#openreading_div"
			});
		
		GLOBAL_selectingAnnotate = 1;
	}
	
	// turn off selectable
	else {
		
		// check already turned off
		if(GLOBAL_selectingAnnotate==0) { return; }
	
		$(".ui-selected").removeClass("ui-selected");
		$("#openreading_div").selectable("destroy");
	
		// turn on selecting
		clearSelection();
		showNewlineCharacters(0);
		$("#body").enableSelection();
		attachSpanHandler(null);
		
		GLOBAL_selectingAnnotate = 0;
	}
}

var GLOBAL_selectingInsert = 0;
function allowSelectInsert(allow) {

	// turn on selectable
	if(allow==1) {
	
		// turn off first
		if(GLOBAL_selectingInsert==1) { allowSelectAnnotate(0,null,1); }
	
		// turn off selecting
		clearReadingDiv()
		clearSelection();
		showNewlineCharacters(1);
		$("#body").disableSelection();
	
		$("#openreading_div span").unbind("click").click(function() {
			var charKEY = parseInt($(this).attr("id"));
			var selectedid = ($("#insert_placeholder").length>0) ? $("#insert_placeholder").attr("insertcharID") : -1;
	
			if(selectedid==charKEY && $("#insert_placeholder").attr("insertafter")==1) {
				$("#insert_placeholder").remove();
				$("#"+charKEY).before("<span id='insert_placeholder' insertcharID=\""+charKEY+"\" insertafter=0 insertbefore=1 class='placeholder'>CLICK DONE TO INSERT HERE</span>");
			}
			else {
				$("#insert_placeholder").remove();
				$("#"+charKEY).after("<span id='insert_placeholder' insertcharID=\""+charKEY+"\" insertafter=1 insertbefore=0 class='placeholder'>CLICK DONE TO INSERT HERE</span>");
			}
		});
		
		GLOBAL_selectingInsert = 1;
	}
	
	// turn off selectable
	else {
		
		// check already turned off
		if(GLOBAL_selectingInsert==0) { return; }
	
		$("#insert_placeholder").remove();
		$("#openreading_div span").unbind("click");
	
		// turn on selecting
		clearReadingDiv();
		clearSelection();
		showNewlineCharacters(0);
		$("#body").enableSelection();
		attachSpanHandler(null);
		
		GLOBAL_selectingInsert = 0;
	}
}

function getCharPattern(charKEY_arr) {

	var selected_str = ""; var prev_index = -1;
	$.each(charKEY_arr,function(key,val) {
		var this_index = parseInt(val);
		if(this_index>prev_index+1 && prev_index>=0) { selected_str += " ... "; }
		prev_index = this_index;

		selected_str += $("#"+this_index).text();
	});
	
	return selected_str;
}

function getSelectedChars(includeWhitespace) {
	var selectedChar_arr = [];
	$("#openreading_div .ui-selected").each(function() {
		var iswhitespace = ($(this).html()==html_encode_str("\n")) || ($(this).html()==html_encode_str(" ") || $(this).html()=="_");
		if(includeWhitespace || !iswhitespace) { selectedChar_arr.push($(this).attr("id")); }
	});
	return selectedChar_arr;
}

function clearReadingDiv() {
	for(var charKEYi in GLOBAL_JSONcharTOword) { $("#"+charKEYi).unbind("mouseover").unbind("mouseout").unbind("click").css("background-color","white").removeAttr('style').removeAttr('stick'); }
	$("#edittop_button").unbind("click").hide();
	$("#deletetop_button").unbind("click").hide();
}

function showNewlineCharacters(show) {
	$("[newline='1']").each(function() {
		var newline_char = (show==1) ? "_" : html_encode_str("\n");
		$(this).html(newline_char);
	});
}

function text_to_htmlspans(nospans_textstr,index_ctr) {
	var spans_htmlstr = nospans_textstr.replace(/.|\s/g,function($0) {
			var text_str = $0;
			
			var span_str = "<span id=\""+index_ctr+"\">"+html_encode_str(text_str)+"</span>";
			if(text_str.match(/\n/)) {
				span_str = "<span id=\""+index_ctr+"\" newline=1>"+html_encode_str(text_str)+"</span>";
				span_str += "<br id=\"BR1_"+index_ctr+"\">";
			}
			
			index_ctr++;
			return span_str;
		});

	return spans_htmlstr;
}

