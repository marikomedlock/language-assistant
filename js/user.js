// user.js
// **********************************************
//		checkJS_user
//		parseJSON_user
//		getUser
//		listLessons
//		showLessonOptions
//		openLesson
//		createLesson
//		renameLesson
//		linkLesson
//		showShareOptions
//		deleteShare
//		deleteLesson
//		showRearrangeLessons
//		rearrangeLessons

function checkJS_user() {
	
	// build html for drill, reading tabs
	var listLessons_html = "<span class='red-header'>Page Of "+GLOBAL_JSONstate.username+"</span>";
	listLessons_html += "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp";
	listLessons_html += "<a href=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi?action=getUser\" style='color:#777'>search for another user</a>";
	listLessons_html += "<br>";
	listLessons_html += "<span id='userpage_message_span' class='msg'></span>";
	listLessons_html += "<div id='userpage_content' class='content'>";
	listLessons_html += "<ul id='userpage_content_tabs_list'>";
	listLessons_html += "<li><a href='#userpage_content_tabs_drills'>drills</a></li>";
	listLessons_html += "<li><a href='#userpage_content_tabs_readings'>readings</a></li>";
	listLessons_html += "</ul>";
	listLessons_html += "<div id='userpage_content_tabs_drills'>";
	listLessons_html += "<div id='userpage_drill_list'></div>";
	listLessons_html += "</div>";
	listLessons_html += "<div id='userpage_content_tabs_readings'>";
	listLessons_html += "<div id='userpage_reading_list'></div>";
	listLessons_html += "</div>";
	listLessons_html += "</div>";

	$("#userpage_div").html(listLessons_html);
	$("#userpage_content").addClass('tabs-min').tabs({
		activate : function(event,ui) {
				var activeTabIndex = $("#userpage_content").tabs("option","active");
				var lessonType = activeTabIndex==0 ? 'drill' : 'reading';

				// change url
				window.location.hash = lessonType;

				if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
					// move top bar on tab change
					$("#userpage_"+lessonType+"_list").before($("#topbar_div").detach());		
				}
			},
			
		// check which tab is specified by url hash
		active : ((window.location.hash == "#reading") ? 1 : 0)
	});

	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		// build html for top bar
		var topbar_html = "<div id='topbar_div' style='border:2px #E04006 solid; padding:4px; margin:4px;'>";
		topbar_html += "<button id='createnew_button' style='font-size:10pt'>create new</button>";
		topbar_html += "&nbsp&nbsp&nbsp&nbsp";
		topbar_html += "<button id='rearrangelessons_button' style='font-size:10pt'>rearrange</button>";
		topbar_html += "</div>";
		
		var activeTabIndex = $("#userpage_content").tabs("option","active");
		var lessonType = activeTabIndex==0 ? 'drill' : 'reading';
		$("#userpage_" + lessonType + "_list").before(topbar_html);
		
		// add click handlers for buttons
		$("#createnew_button").button({icons:{ primary:"ui-icon-document" }}).unbind("click").click(function() { createLesson(); });
		$("#rearrangelessons_button").button({icons:{ primary:"ui-icon-arrowthick-2-n-s" }}).unbind("click").click(function() { showRearrangeLessons(1); });
	}

	// setup ajax global events
	$(document).ajaxStart(function() { showAjaxWaiting(1); });
	$(document).ajaxStop(function() { showAjaxWaiting(0); });
}

function parseJSON_user() {

	switch(GLOBAL_JSONstate.action) {
		case "getUser" :
			getUser(GLOBAL_JSONstate.message);
			break;

		case "listLessons" :
			listLessons(GLOBAL_JSONstate.message);
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


function getUser(msg) {

	// build html every time
	var getUser_html = "<div id='userpage_content' class='content'>";
	getUser_html += "<header class='page-entry-header'><h1 class='entry-title'>search for a user's page</h1></header>";
	getUser_html += "<div class='wpcf7'>";
	getUser_html += "<div id='userpage_message_span' class='msg'>"+msg+"</div>";
	getUser_html += "<form id='userpage_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi\" method='post'>";
	getUser_html += "username : <span class='wpcf7-form-control-wrap'>";
	getUser_html += "<input id='userpage_input_username' type='text' name='username' value='' class='wpcf7-text'/></span><br>";
	getUser_html += "<div style='width:100%'>&nbsp</div>";
	getUser_html += "<input type='hidden' name='action' value='listLessons'>";
	getUser_html += "</form>";
	getUser_html += "<button id='userpage_button_send' name='listLessons'>find user's page</button>";
	getUser_html += "</div>";
	getUser_html += "</div>";

	$("#userpage_div").html(getUser_html);

	// add click handler to buttons
	$("#userpage_button_send").button().unbind("click").click(function() {
		$("#userpage_form").submit();
	});
	$("#userpage_input_username").focus(); //focus in username box
}

function listLessons(msg) {

	// build array of record_ctr ordered by listindex
	var orderby_listindex = [];
	$.each(GLOBAL_JSONlessons,function(key,val) { orderby_listindex.push(key); });
	orderby_listindex.sort(function(a,b) {
			var aListindex = parseInt(GLOBAL_JSONlessons[a][7]);
			var bListindex = parseInt(GLOBAL_JSONlessons[b][7]);
			return ( aListindex>bListindex ? 1 : -1 )
		});	

	// build html every time
	var drills_html = ''; var readings_html = '';
	for(var key=0; key<orderby_listindex.length; key++) {
		var val = orderby_listindex[key];
	
		// key, val = listindex ctr, GLOBAL_JSONlessons ctr
		var keyLsn = val;
		var valLsn = GLOBAL_JSONlessons[keyLsn];
	
		// keyLsn, valLsn.[0 1 2 3 4 5 6 7] = ctr, [blueprintid name type owner username owner_bool user_bool listindex]
		if(valLsn[6]==1) { // only show records user owns or shares
	
			var lesson_html = "<div id=\"listLesson_"+keyLsn+"_div\">";
			lesson_html += "<a id=\"listLesson_"+keyLsn+"\" href=\"javascript:showLessonOptions("+keyLsn+")\"";
			
			// name is green if shared, blue if not
			if(valLsn[5]=="1") { lesson_html += " style='color:grey'>"+valLsn[1]; }
			else { lesson_html += " style='color:#4AA02C'>"+valLsn[1]+" ( shared by "+valLsn[3]+" )"; }
			
			lesson_html += "</a></div>";
			
			switch(valLsn[2]) { // type
				case "drill" :
					drills_html += lesson_html;
					break;
					
				case "reading" :
					readings_html += lesson_html;
					break;
			}
		}
	};
	$("#userpage_drill_list").html(drills_html);
	$("#userpage_reading_list").html(readings_html);
	
	// set message
	$("#userpage_message_span").text(msg);
}


function showLessonOptions(record_ctr) {

	// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// build html every time
	var lessonOptions_html = "<div id='userpage_content' class='content'>";
	lessonOptions_html += "<header class='page-entry-header'><h1 class='entry-title'>please choose an action</h1></header>";
	lessonOptions_html += "<div class='wpcf7'>";
	lessonOptions_html += "<span id='userpage_message_span' class='msg'>";
	lessonOptions_html += lessonArr[1]+"<br>[ "+lessonArr[2]+" ]";
	lessonOptions_html += "</span>";
	lessonOptions_html += "<br><br>";
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		lessonOptions_html += "<button id='userpage_button_open'>open</button><br>";
		lessonOptions_html += "<button id='userpage_button_rename'>rename</button><br>";
		lessonOptions_html += "<button id='userpage_button_link'>link</button><br>";
		lessonOptions_html += "<button id='userpage_button_share'>share</button><br>";
		lessonOptions_html += "<button id='userpage_button_delete'>delete</button><br>";
		lessonOptions_html += "<button id='userpage_button_copy'>make a copy</button><br>";
	}
	else {
		lessonOptions_html += "<span id='mustlogin_message_span' class='msg' style='color:green'>";
		lessonOptions_html += "Must be logged in as owner ("+lessonArr[3]+") to make changes.";
		lessonOptions_html += "</span><br><br>";
		lessonOptions_html += "<button id='userpage_button_open'>open</button><br>";
		lessonOptions_html += "<button id='userpage_button_link'>link</button><br>";
		if(GLOBAL_JSONstate["session_username"]!="") {
			lessonOptions_html += "<button id='userpage_button_copy'>copy to my account</button><br>";
		}
	}
	lessonOptions_html += "<br><br>";
	lessonOptions_html += "</div>";
	lessonOptions_html += "</div>";

	$("#userpage_dialog").dialog("close");
	$("body").append("<div id='userpage_dialog' style='display:none; text-align:center'></div>");
	$("#userpage_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#userpage_dialog").dialog("destroy"); $("#userpage_dialog").remove(); }
	});

	$("#userpage_dialog").html(lessonOptions_html);

	// add click handler to buttons
	if(parseInt(GLOBAL_JSONstate["logged_in"])==1) {
		$("#userpage_button_open").button().unbind("click").click(function() { openLesson(record_ctr); });
		$("#userpage_button_rename").button().unbind("click").click(function() { renameLesson(record_ctr); });
		$("#userpage_button_link").button().unbind("click").click(function() { linkLesson(record_ctr); });
		$("#userpage_button_share").button().unbind("click").click(function() { showShareOptions(record_ctr); });
		$("#userpage_button_delete").button().unbind("click").click(function() { deleteLesson(record_ctr); });
		$("#userpage_button_copy").button().unbind("click").click(function() { copyLesson(record_ctr); });
	}
	else {
		$("#userpage_button_open").button().unbind("click").click(function() { openLesson(record_ctr); });
		$("#userpage_button_link").button().unbind("click").click(function() { linkLesson(record_ctr); });
		$("#userpage_button_copy").button().unbind("click").click(function() { copyLesson(record_ctr); });
	}
}

function openLesson(record_ctr) {

	// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// submit form to opendrill.cgi, openreading.cgi page
	var openpageURL = GLOBAL_JSONstate.webURL;
	switch(lessonArr[2]) { // type
		case "drill" :
			openpageURL += "/cgi-bin/opendrill.cgi";
			break;
		
		case "reading" :
			openpageURL += "/cgi-bin/openreading.cgi";
			break;
			
	}
	
	//build html every time
	var openLesson_html = "<div id='openLesson_content' class='content'>";
	openLesson_html += "<form id='openLesson_form' action=\""+openpageURL+"\" method='post'>";
	openLesson_html += "<input type='hidden' name='blueprintid' value=\""+lessonArr[0]+"\">";
	openLesson_html += "<input type='hidden' name='action' value='openLesson'>";
	openLesson_html += "</form>";
	openLesson_html += "</div>";

	$("body").append(openLesson_html);
	
	// submit form
	$("#openLesson_form").submit();
}

function createLesson() {

	// active tab decides lesson type to create
	var activeTabIndex = $("#userpage_content").tabs("option","active");
	var lessonType = activeTabIndex==0 ? 'drill' : 'reading';

	// submit createLesson request to opendrill.cgi, openreading.cgi page
	var createpageURL = GLOBAL_JSONstate.webURL;
	switch(lessonType) { // type
		case "drill" :
			createpageURL += "/cgi-bin/opendrill.cgi";
			break;
		
		case "reading" :
			createpageURL += "/cgi-bin/openreading.cgi";
			break;
			
	}

	// send ajax request to server
	$.ajax({
		url:createpageURL,
		type:"POST",
		cache:false,
		data:{"action":"createLesson","display":"ajax"},
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("createLesson failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						// count keys in global variable
						var newlessonKEY = 0; var newlessonindex = 0;
						$.each(GLOBAL_JSONlessons,function(key,val) { newlessonKEY++; newlessonindex = Math.max(newlessonindex,GLOBAL_JSONlessons[key][7]); });
						
						// build array of lesson information
						// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool listindex]
						var newlessonVAL = [];
						newlessonVAL[0] = returnData.blueprintid;
						newlessonVAL[1] = "untitled "+lessonType;
						newlessonVAL[2] = lessonType;
						newlessonVAL[3] = returnData.username;
						newlessonVAL[4] = returnData.username;
						newlessonVAL[5] = 1;
						newlessonVAL[6] = 1;
						newlessonVAL[7] = newlessonindex;
					
						// update global variable
						GLOBAL_JSONlessons[newlessonKEY] = newlessonVAL;
						
						// re-display lesson list
						listLessons(returnData.message);
						
						// call renameLesson
						renameLesson(newlessonKEY);
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("createLesson failed : \n\n"+returnData.message); }
				}
			}
	});
}

function renameLesson(record_ctr) {

	// active tab decides lesson type to rename
	var activeTabIndex = $("#userpage_content").tabs("option","active");
	var lessonType = activeTabIndex==0 ? 'drill' : 'reading';

	// key, val.[0 1 2 3 4 5 6] = [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// build html every time
	var renameLesson_html = "<div id='userpage_content' class='content'>";
	renameLesson_html += "<header class='page-entry-header'><h1 class='entry-title'>please enter a new name</h1></header>";
	renameLesson_html += "<div class='wpcf7'>";
	renameLesson_html += "<span id='userpage_message_span' class='msg'>"+lessonArr[1]+" [ "+lessonArr[2]+" ]<br>";
	renameLesson_html += "owner : "+lessonArr[3]+"</span>";
	renameLesson_html += "<br><br>";
	renameLesson_html += "<form id='userpage_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi#"+lessonType+"\" method='post'>";
	renameLesson_html += "new name : <span class='wpcf7-form-control-wrap'>";
	renameLesson_html += "<input id='userpage_input_rename' type='text' name='rename' value='' class='wpcf7-text'/></span><br>";
	renameLesson_html += "<div style='width:100%'>&nbsp</div>";
	renameLesson_html += "<input type='hidden' name='username' value=\""+GLOBAL_JSONstate.username+"\">";
	renameLesson_html += "<input type='hidden' name='blueprintid' value=\""+lessonArr[0]+"\">";
	renameLesson_html += "<input type='hidden' name='action' value='renameLesson'>";
	renameLesson_html += "</form>";
	renameLesson_html += "<button id='userpage_button_send' name='rename'>rename</button>";
	renameLesson_html += "<br><br>";
	renameLesson_html += "</div>";
	renameLesson_html += "</div>";

	$("#userpage_dialog").dialog("close");
	$("body").append("<div id='userpage_dialog' style='display:none; text-align:center'></div>");
	$("#userpage_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#userpage_dialog").dialog("destroy"); $("#userpage_dialog").remove(); }
	});

	$("#userpage_dialog").html(renameLesson_html);

	// add click handler to buttons
	$("#userpage_button_send").button().unbind("click").click(function() { $("#userpage_form").submit(); });
}

function linkLesson(record_ctr) {

	// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// submit form to opendrill.cgi, openreading.cgi page
	var openpageURL = GLOBAL_JSONstate.webURL;
	switch(lessonArr[2]) { // type
		case "drill" :
			openpageURL += "/cgi-bin/opendrill.cgi";
			break;
		
		case "reading" :
			openpageURL += "/cgi-bin/openreading.cgi";
			break;
			
	}
	openpageURL += "?blueprintid="+lessonArr[0];
	var openpageHTML = "<a href=\""+openpageURL+"\">"+lessonArr[1]+" [ "+lessonArr[2]+" ]</a>";

	// build html every time
	var linkLesson_html = "<div id='userpage_content' class='content'>";
	linkLesson_html += "<header class='page-entry-header'><h1 class='entry-title'>link to this record</h1></header>";
	linkLesson_html += "<div class='wpcf7'>";
	linkLesson_html += "<span id='userpage_message_span' class='msg'>"+lessonArr[1]+" [ "+lessonArr[2]+" ]<br>";
	linkLesson_html += "owner : "+lessonArr[3]+"</span>";
	linkLesson_html += "<br><br>";
	linkLesson_html += "<span id='userpage_urlmsg_span' style='color:#777'>paste this address into a web browser</span>";
	linkLesson_html += "<br>";
	linkLesson_html += "<span id='userpage_href_span' class='msg'>"+openpageURL+"</span>";
	linkLesson_html += "<br><br>";
	linkLesson_html += "<span id='userpage_acodemsg_span' style='color:#777'>or add this HTML code to your webpage</span>";
	linkLesson_html += "<br>";
	linkLesson_html += "<textarea id='userpage_acode_textarea' class='msg' rows=5>"+openpageHTML+"</textarea>";
	linkLesson_html += "<br><br>";
	linkLesson_html += "</div>";
	linkLesson_html += "</div>";

	$("#userpage_dialog").dialog("close");
	$("body").append("<div id='userpage_dialog' style='display:none; text-align:center'></div>");
	$("#userpage_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#userpage_dialog").dialog("destroy"); $("#userpage_dialog").remove(); }
	});

	$("#userpage_dialog").html(linkLesson_html);
}

function showShareOptions(record_ctr) {

	// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// build html every time
	var shareOwner_html = '';
	var shareUsers_html = ''; var shareUsers_ctr = 1;
	$.each(GLOBAL_JSONlessons,function(key,val) {
		// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool]
		if(val[0]==lessonArr[0]) { // only show records for this blueprintid
			shareOwner_html = val[3];
			if(val[5]=="0") {
				shareUsers_html += "<a id=\"shareLesson_"+shareUsers_ctr+"\" href=\"javascript:deleteShare("+key+")\">"+val[4]+"</a><br>";
			}
			shareUsers_ctr++;
		}
	});
	
	var shareOptions_html = "<div id='userpage_content' class='content'>";
	shareOptions_html += "<header class='page-entry-header'><h1 class='entry-title'>users who share this record</h1></header>";
	shareOptions_html += "<div class='wpcf7'>";
	shareOptions_html += "<span id='userpage_message_span' class='msg'>"+lessonArr[1]+" [ "+lessonArr[2]+" ]<br>";
	shareOptions_html += "owner : "+shareOwner_html+"</span>";
	shareOptions_html += "<br><br>";
	shareOptions_html += shareUsers_html;
	shareOptions_html += "<br><br>";
	shareOptions_html += "<span id='userpage_acodemsg_span' style='color:#777'>or share with another user</span>";
	shareOptions_html += "<form id='userpage_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi\" method='post'>";
	shareOptions_html += "username : <span class='wpcf7-form-control-wrap'>";
	shareOptions_html += "<input id='userpage_input_shareuser' type='text' name='shareuser' value='' class='wpcf7-text'/></span><br>";
	shareOptions_html += "<div style='width:100%'>&nbsp</div>";
	shareOptions_html += "<input type='hidden' name='username' value=\""+GLOBAL_JSONstate.username+"\">";
	shareOptions_html += "<input type='hidden' name='blueprintid' value=\""+lessonArr[0]+"\">";
	shareOptions_html += "<input type='hidden' name='action' value='shareLesson'>";
	shareOptions_html += "</form>";
	shareOptions_html += "<button id='userpage_button_send' name='share'>share</button>";
	shareOptions_html += "<br><br>";
	shareOptions_html += "</div>";
	shareOptions_html += "</div>";

	$("#userpage_dialog").dialog("close");
	$("body").append("<div id='userpage_dialog' style='display:none; text-align:center'></div>");
	$("#userpage_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#userpage_dialog").dialog("destroy"); $("#userpage_dialog").remove(); }
	});

	$("#userpage_dialog").html(shareOptions_html);
	
	// add click handler to buttons
	$("#userpage_button_send").button().unbind("click").click(function() { $("#userpage_form").submit(); });
}

function deleteShare(record_ctr) {

	// key, val.[0 1 2 3 4 5 6] = [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// build html every time
	var deleteShare_html = "<div id='userpage_content' class='content'>";
	deleteShare_html += "<header class='page-entry-header'><h1 class='entry-title'>are you sure you want to stop sharing?</h1></header>";
	deleteShare_html += "<div class='wpcf7'>";
	deleteShare_html += "<span id='userpage_message_span' class='msg'>"+lessonArr[1]+" [ "+lessonArr[2]+" ]<br>";
	deleteShare_html += "owner : "+lessonArr[3]+"</span>";
	deleteShare_html += "<br><br>";
	deleteShare_html += "<span id='userpage_deleteShare_span' style='color:#777'>user to remove : "+lessonArr[4]+"</span>";
	deleteShare_html += "<form id='userpage_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi\" method='post'>";
	deleteShare_html += "<input type='hidden' name='shareuser' value=\""+lessonArr[4]+"\">";
	deleteShare_html += "<input type='hidden' name='username' value=\""+GLOBAL_JSONstate.username+"\">";
	deleteShare_html += "<input type='hidden' name='blueprintid' value=\""+lessonArr[0]+"\">";
	deleteShare_html += "<input type='hidden' name='action' value='deleteShare'>";
	deleteShare_html += "</form>";
	deleteShare_html += "<br>";
	deleteShare_html += "<button id='userpage_button_cancel' name='cancel'>cancel</button>";
	deleteShare_html += "&nbsp&nbsp&nbsp&nbsp";
	deleteShare_html += "<button id='userpage_button_send' name='delete'>delete</button>";
	deleteShare_html += "<br><br>";
	deleteShare_html += "</div>";
	deleteShare_html += "</div>";

	$("#userpage_dialog").dialog("close");
	$("body").append("<div id='userpage_dialog' style='display:none; text-align:center'></div>");
	$("#userpage_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#userpage_dialog").dialog("destroy"); $("#userpage_dialog").remove(); }
	});

	$("#userpage_dialog").html(deleteShare_html);
	
	// add click handler to buttons
	$("#userpage_button_cancel").button().unbind("click").click(function() { $("#userpage_dialog").dialog("close"); });
	$("#userpage_button_send").button().unbind("click").click(function() { $("#userpage_form").submit(); });
}

function deleteLesson(record_ctr) {

	// active tab decides lesson type to rename
	var activeTabIndex = $("#userpage_content").tabs("option","active");
	var lessonType = activeTabIndex==0 ? 'drill' : 'reading';

	// key, val.[0 1 2 3 4 5 6] = [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	// build html every time
	var deleteLesson_html = "<div id='userpage_content' class='content'>";
	deleteLesson_html += "<header class='page-entry-header'><h1 class='entry-title'>are you sure you want to delete?</h1></header>";
	deleteLesson_html += "<div class='wpcf7'>";
	deleteLesson_html += "<span id='userpage_message_span' class='msg'>"+lessonArr[1]+" [ "+lessonArr[2]+" ]<br>";
	deleteLesson_html += "owner : "+lessonArr[3]+"</span>";
	deleteLesson_html += "<br><br>";
	deleteLesson_html += "<form id='userpage_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi#"+lessonType+"\" method='post'>";
	deleteLesson_html += "<input type='hidden' name='username' value=\""+GLOBAL_JSONstate.username+"\">";
	deleteLesson_html += "<input type='hidden' name='blueprintid' value=\""+lessonArr[0]+"\">";
	deleteLesson_html += "<input type='hidden' name='action' value='deleteLesson'>";
	deleteLesson_html += "</form>";
	deleteLesson_html += "<br>";
	deleteLesson_html += "<button id='userpage_button_cancel' name='cancel'>cancel</button>";
	deleteLesson_html += "&nbsp&nbsp&nbsp&nbsp";
	deleteLesson_html += "<button id='userpage_button_send' name='delete'>delete</button>";
	deleteLesson_html += "<br><br>";
	deleteLesson_html += "</div>";
	deleteLesson_html += "</div>";

	$("#userpage_dialog").dialog("close");
	$("body").append("<div id='userpage_dialog' style='display:none; text-align:center'></div>");
	$("#userpage_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#userpage_dialog").dialog("destroy"); $("#userpage_dialog").remove(); }
	});

	$("#userpage_dialog").html(deleteLesson_html);
	
	// add click handler to buttons
	$("#userpage_button_cancel").button().unbind("click").click(function() { $("#userpage_dialog").dialog("close"); });
	$("#userpage_button_send").button().unbind("click").click(function() { $("#userpage_form").submit(); });
}

function copyLesson(record_ctr) {

	// key, val.[0 1 2 3 4 5 6] = ctr, [blueprintid name type owner username owner_bool user_bool]
	var lessonArr = GLOBAL_JSONlessons[record_ctr];

	//build html every time
	var copyLesson_html = "<div id='copyLesson_content' class='content'>";
	copyLesson_html += "<form id='copyLesson_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi\" method='post'>";
	copyLesson_html += "<input type='hidden' name='blueprintid' value=\""+lessonArr[0]+"\">";
	copyLesson_html += "<input type='hidden' name='action' value='copyLesson'>";
	copyLesson_html += "</form>";
	copyLesson_html += "</div>";

	$("body").append(copyLesson_html);
	
	// submit form
	$("#copyLesson_form").submit();
}

function showRearrangeLessons(allow) {

	// active tab decides lesson type to rearrange
	var activeTabIndex = $("#userpage_content").tabs("option","active");
	var lessonType = activeTabIndex==0 ? 'drill' : 'reading';

	// clicked rearrange
	if(allow==1) {
		$("#rearrangelessons_button").button("option","label","STOP rearrange").unbind("click").click(function() { showRearrangeLessons(0); });
		
		// disable other topbar buttons
		$("#topbar_div button[id!=rearrangelessons_button]").attr("disabled","disabled");
		
		// allow sortable
		$("#userpage_"+lessonType+"_list").sortable({ items:">div[id^=listLesson_][id$=_div]" });
	}
	
	// clicked STOP rearrange
	else {
		var onfinishFUNC = function() {
			$("#rearrangelessons_button").button("option","label","rearrange").unbind("click").click(function() { showRearrangeLessons(1); });
			
			// re-display drills
			listLessons("");
			
			// re-enable other topbar buttons
			$("#topbar_div button[id!=rearrangelessons_button]").removeAttr("disabled");
			
			// dis-allow sortable
			$("#userpage_"+lessonType+"_list").sortable("destroy");
		};
		
		// send to server, update js
		rearrangeLessons(onfinishFUNC);
	}
}

function rearrangeLessons(onfinishFUNC) {

	// active tab decides lesson type to rearrange
	var activeTabIndex = $("#userpage_content").tabs("option","active");
	var lessonType = activeTabIndex==0 ? 'drill' : 'reading';

	// get current order
	var currentOrder_arr = $("#userpage_"+lessonType+"_list").sortable("toArray");
	var currentOrder_str = "";
	for(var ctr=0; ctr<currentOrder_arr.length; ctr++) {
	
		var val = currentOrder_arr[ctr];
		if(ctr>0) { currentOrder_str += ","; }
		var keyLsn = (val.replace("listLesson_","")).replace("_div","");
		currentOrder_str += GLOBAL_JSONlessons[keyLsn][0];
	}

	// send ajax request to server
	$.ajax({
		url:GLOBAL_JSONstate.webURL+"/cgi-bin/user.cgi",
		type:"POST",
		cache:false,
		data:{ "action":"rearrangeLessons","display":"ajax","username":GLOBAL_JSONstate.username,"newOrder":currentOrder_str },
		dataType:"html",
		success:function(returnData) {

				// no return
				if(!returnData) { alert("rearrangeLessons failed : \n\nno return data"); }
				else {
					returnData = $.parseJSON(returnData);
					// success
					if(returnData.status==1) {
						var newOrder = $.parseJSON(returnData.return_data);
						var newOrder_hash = {};
						$.each(newOrder,function(key,val) { newOrder_hash[val] = key; });
					
						// update global variable
						$.each(GLOBAL_JSONlessons,function(key,val) {
								if(GLOBAL_JSONlessons[key][6]==0) { return; }
								GLOBAL_JSONlessons[key][7] = newOrder_hash[GLOBAL_JSONlessons[key][0]];
							});
					}
					// failure
					else if(parseInt(returnData.logged_in)==0) { notloggedin(); }
					else { alert("rearrangeLessons failed : \n\n"+returnData); }
				}
				
				onfinishFUNC();
			}
	});
}
