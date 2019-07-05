// account.js
// **********************************************
//		checkJS_account
//		parseJSON_account
//		loginout
//		login
//		logout
//		getCreateInfo
//		getLookupInfo
//		getModifyInfo
//		printAccountInfo
//		checkAlphanumeric
//		checkValidEmail

function checkJS_account() {
	
	// change loginout button label
	var loginout_label = (GLOBAL_JSONstate.logged_in=="0") ? "login" : "logout";
	$("#loginout_button").text(loginout_label);
	
	// change account button label
	var account_label = (GLOBAL_JSONstate.logged_in=="0") ? "signup" : "settings";
	$("#account_button").text(account_label);
}

function parseJSON_account() {

	switch(GLOBAL_JSONstate.action) {
		case "login" :
			getCreateInfo("");
			login(GLOBAL_JSONstate.message);
			break;
			
		case "getCreateInfo" :
			getCreateInfo(GLOBAL_JSONstate.message);
			break;
		
		case "getLookupInfo" :
			getLookupInfo(GLOBAL_JSONstate.message);
			break;
		
		case "getModifyInfo" :
			getModifyInfo(GLOBAL_JSONstate.message);
			break;
			
		case "printAccountInfo" :
			printAccountInfo(GLOBAL_JSONstate.message);
			break;
	}

}

function loginout() {
	if(GLOBAL_JSONstate.logged_in=="1") { logout(); }
	else { login(''); }
}


function login(msg) {

	// build html every time
	var login_html = "<div id='loginout_content' class='content'>";
	login_html += "<header class='page-entry-header'><h1 class='entry-title'>please login</h1></header>";
	login_html += "<div class='wpcf7'>";
	login_html += "<div id='loginout_message_span' class='msg'>"+msg+"</div>";
	login_html += "<form id='loginout_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/account.cgi\" method='post'>";
	login_html += "username : <span class='wpcf7-form-control-wrap'>";
	login_html += "<input id='loginout_input_username' type='text' name='username' value='' class='wpcf7-text'/></span><br>";
	login_html += "password : <span class='wpcf7-form-control-wrap'>";
	login_html += "<input id='loginout_input_password' type='password' name='password' value='' class='wpcf7-text'/></span><br>";
	login_html += "<div style='width:100%'>&nbsp</div>";
	login_html += "<input type='hidden' name='action' value='login'>";
	login_html += "<input type='hidden' name='display' value='redirect'>";
	login_html += "<input type='hidden' name='redirectURL' value=\""+GLOBAL_JSONstate.redirectURL+"\">";
	login_html += "</form>";
	login_html += "<button id='loginout_button_send' name='login'>login</button>";
	login_html += "<br><br>";
	login_html += "<button id='loginout_button_createaccount'><a id='loginout_link_createaccount' href=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/account.cgi?action=getCreateInfo\">create new account</a></button>";
	login_html += "<br><br>";
	login_html += "<a id='loginout_link_forgotpassword' href=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/account.cgi?action=getLookupInfo\" style='color:purple;font-size:85%'>forgot password?</a>";
	login_html += "</div>";
	login_html += "</div>";

	$("#loginout_dialog").dialog("close");
	$("body").append("<div id='loginout_dialog' style='display:none; text-align:center'></div>");
	$("#loginout_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#loginout_dialog").dialog("destroy"); $("#loginout_dialog").remove(); }
	});

	$("#loginout_dialog").html(login_html);

	// add click handler to buttons
	$("#loginout_button_send").button().unbind("click").click(function() {
		$("#loginout_form").submit();
	});
	$("#loginout_button_createaccount").button().unbind("click").click(function() { window.location = $("#loginout_link_createaccount").attr("href"); });
	$("#loginout_input_username").focus(); //focus in username box
}

function logout() {

	//build html every time
	var logout_html = "<div id='logout_content' class='content'>";
	logout_html += "<form id='logout_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/account.cgi\" method='post'>";
	logout_html += "<input type='hidden' name='action' value='logout'>";
	logout_html += "<input type='hidden' name='display' value='redirect'>";
	logout_html += "<input type='hidden' name='redirectURL' value=\""+GLOBAL_JSONstate.redirectURL+"\">";
	logout_html += "</form>";
	logout_html += "</div>";

	$("body").append(logout_html);
	
	// submit form
	$("#logout_form").submit();
}

function getCreateInfo(msg) {
	
	// get account info HTML is generated on server, because of delay in creating captcha
	
	// print message
	$("#account_message_span").html(msg);

	// populate inputs
	if(GLOBAL_JSONstate.username) { $("#account_input_username").val(GLOBAL_JSONstate.username); }
	if(GLOBAL_JSONstate.password) { $("#account_input_password").val(GLOBAL_JSONstate.password); }
	if(GLOBAL_JSONstate.email) { $("#account_input_email").val(GLOBAL_JSONstate.email); }

	// add input validation handlers
	$("#account_input_username")
		.keyup(function() {
			var username_ok = checkAlphanumeric($("#account_input_username").val(),"\.");
			if(username_ok) { $("#account_input_username_validate_span").hide(); }
			else { $("#account_input_username_validate_span").show(); }
		}).after("<div id='account_input_username_validate_span' class='msg'>please use only letters, numbers, and . symbol</div>");
		$("#account_input_username_validate_span").hide();
	$("#account_input_password")
		.keyup(function() {
			var password_ok = checkAlphanumeric($("#account_input_password").val(),"\.");
			if(password_ok) { $("#account_input_password_validate_span").hide(); }
			else { $("#account_input_password_validate_span").show(); }
		}).after("<div id='account_input_password_validate_span' class='msg'>please use only letters, numbers, and . symbol</div>");
		$("#account_input_password_validate_span").hide();
	$("#account_input_email")
		.keyup(function() {
			var email_ok = checkValidEmail($("#account_input_email").val());
			if(email_ok) { $("#account_input_email_validate_span").hide(); }
			else { $("#account_input_email_validate_span").show(); }
		}).after("<div id='account_input_email_validate_span' class='msg'>please enter a valid email address</div>");
		$("#account_input_email_validate_span").hide();

	// add click handler to buttons
	$("#account_button_createaccount").button().unbind("click").click(function() {

		var username_ok = checkAlphanumeric($("#account_input_username").val(),"\.");
		var password_ok = checkAlphanumeric($("#account_input_password").val(),"\.");
		var email_ok = checkValidEmail($("#account_input_email").val());

		if(username_ok && password_ok && email_ok) { $("#account_form").submit(); }
		else { showInputError(username_ok,password_ok,email_ok); }
	});
	$("#account_input_username").focus(); //focus in username box
}

function getLookupInfo(msg) {

	// get account info HTML is generated on server, because of delay in creating captcha
	
	// print message
	$("#account_message_span").html(msg);

	// populate inputs
	if(GLOBAL_JSONstate.username) { $("#account_input_username").val(GLOBAL_JSONstate.username); }
	if(GLOBAL_JSONstate.password) { $("#account_input_password").val(GLOBAL_JSONstate.password); }
	if(GLOBAL_JSONstate.email) { $("#account_input_email").val(GLOBAL_JSONstate.email); }

	// add input validation handlers
	$("#account_input_username")
		.keyup(function() {
			var username_ok = checkAlphanumeric($("#account_input_username").val(),"\.");
			if(username_ok) { $("#account_input_username_validate_span").hide(); }
			else { $("#account_input_username_validate_span").show(); }
		}).after("<div id='account_input_username_validate_span' class='msg'>please use only letters, numbers, and . symbol</div>");
		$("#account_input_username_validate_span").hide();
	$("#account_input_password")
		.keyup(function() {
			var password_ok = checkAlphanumeric($("#account_input_password").val(),"\.");
			if(password_ok) { $("#account_input_password_validate_span").hide(); }
			else { $("#account_input_password_validate_span").show(); }
		}).after("<div id='account_input_password_validate_span' class='msg'>please use only letters, numbers, and . symbol</div>");
		$("#account_input_password_validate_span").hide();
	$("#account_input_email")
		.keyup(function() {
			var email_ok = checkValidEmail($("#account_input_email").val());
			if(email_ok) { $("#account_input_email_validate_span").hide(); }
			else { $("#account_input_email_validate_span").show(); }
		}).after("<div id='account_input_email_validate_span' class='msg'>please enter a valid email address</div>");
		$("#account_input_email_validate_span").hide();

	// add click handler to buttons
	$("#account_button_lookupPassword").button().unbind("click").click(function() { 
		$("#account_form").submit()
	});
	$("#account_input_username").focus(); //focus in username box
}

function getModifyInfo(msg) {
	// build html
	var modifyinfo_html = "<div id='account_content' class='content'>";
	modifyinfo_html += "<header class='page-entry-header'><h1 class='entry-title'>here you can modify your information</h1></header>";
	modifyinfo_html += "<div class='wpcf7'>";
	modifyinfo_html += "<div id='account_message_span' class='msg'>"+msg+"</div>";
	modifyinfo_html += "<form id='account_form' action=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/account.cgi\" method='post' enctype='multipart/form-data'>";
	modifyinfo_html += "username : "+GLOBAL_JSONstate.username+"<br><br>";
	modifyinfo_html += "password : <span class='wpcf7-form-control-wrap'>";
	modifyinfo_html += "<input id='account_input_password' type='password' name='password' value='' class='wpcf7-text'/></span><br>";
	modifyinfo_html += "email : <span class='wpcf7-form-control-wrap'>";
	modifyinfo_html += "<input id='account_input_email' type='text' name='email' value='' class='wpcf7-text'/></span><br>";
	modifyinfo_html += "<div style='width:100%'>&nbsp</div>";
	modifyinfo_html += "<input type='hidden' name='action' value='modifyAccount'>";
	modifyinfo_html += "<br><br>";
	modifyinfo_html += "<button id='account_button_modifyaccount'>modify account</button>";
	modifyinfo_html += "</form>";
	modifyinfo_html += "</div>";
	modifyinfo_html += "</div>";

	$("#account_div").html(modifyinfo_html);

	// populate inputs
	if(GLOBAL_JSONstate.password) { $("#account_input_password").val(GLOBAL_JSONstate.password); }
	if(GLOBAL_JSONstate.email) { $("#account_input_email").val(GLOBAL_JSONstate.email); }

	// add input validation handlers
	$("#account_input_password")
		.keyup(function() {
			var password_ok = checkAlphanumeric($("#account_input_password").val(),"\.");
			if(password_ok) { $("#account_input_password_validate_span").hide(); }
			else { $("#account_input_password_validate_span").show(); }
		}).after("<div id='account_input_password_validate_span' class='msg'>please use only letters, numbers, and . symbol</div>");
		$("#account_input_password_validate_span").hide();
	$("#account_input_email")
		.keyup(function() {
			var email_ok = checkValidEmail($("#account_input_email").val());
			if(email_ok) { $("#account_input_email_validate_span").hide(); }
			else { $("#account_input_email_validate_span").show(); }
		}).after("<div id='account_input_email_validate_span' class='msg'>please enter a valid email address</div>");
		$("#account_input_email_validate_span").hide();
	
	// add click handler to buttons
	$("#account_button_modifyaccount").button().unbind("click").click(function() {
		$("#account_form").submit();
	});
	$("#account_input_password").focus(); //focus in password box
}

function printAccountInfo(msg) {

	// build html every time
	var lookupPassword_html = "<div id='account_content' class='content'>";
	lookupPassword_html += "<header class='page-entry-header'><h1 class='entry-title'>here is your account information</h1></header>";
	lookupPassword_html += "<div class='wpcf7'>";
	lookupPassword_html += "<div id='account_message_span' class='msg'>"+msg+"</div><br>";
	lookupPassword_html += "username : "+GLOBAL_JSONstate.username+"<br><br>";
	lookupPassword_html += "password : "+GLOBAL_JSONstate.password+"<br><br>";
	lookupPassword_html += "email : "+GLOBAL_JSONstate.email+"<br><br>";
	lookupPassword_html += "<button id='account_button_backtohome'><a id='account_link_backtohome' href=\""+GLOBAL_JSONstate.webURL+"/cgi-bin/reading.cgi\">back to home page</a></button>";
	lookupPassword_html += "</div>";
	lookupPassword_html += "</div>";

	$("#account_div").html(lookupPassword_html);

	// add click handler to buttons
	$("#account_button_backtohome").button().unbind("click").click(function() { $("#account_link_backtohome").attr("href"); });
}


function showInputError(username_ok,password_ok,email_ok) {

	var username_str = username_ok ? "OK" : "please use only letters, numbers, and . symbol";
	var password_str = password_ok ? "OK" : "please use only letters, numbers, and . symbol";
	var email_str = email_ok ? "OK" : "please enter a valid email address";

	// build html every time
	var inputerror_html = "<div id='inputerror_content' class='content'>";
	inputerror_html += "<header class='page-entry-header'><h1 class='entry-title'>there's a problem with your input.</h1></header>";
	inputerror_html += "<div class='wpcf7'>";
	inputerror_html += "<div id='inputerror_message_span' class='msg'></div>";
	inputerror_html += "username : <span class='wpcf7-form-control-wrap'>"+username_str+"</span><br><br>";
	inputerror_html += "password : <span class='wpcf7-form-control-wrap'>"+password_str+"</span><br><br>";
	inputerror_html += "email : <span class='wpcf7-form-control-wrap'>"+email_str+"</span><br><br>";
	inputerror_html += "<br><br>";
	inputerror_html += "<button id='inputerror_button_cancel' name='cancel'>ok</button>";
	inputerror_html += "<br><br>";
	inputerror_html += "</div>";
	inputerror_html += "</div>";

	$("#inputerror_dialog").dialog("close");
	$("body").append("<div id='inputerror_dialog' style='display:none; text-align:center'></div>");
	$("#inputerror_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:400,
		modal:true,
		close: function() { $("#inputerror_dialog").dialog("destroy"); $("#inputerror_dialog").remove(); }
	});

	$("#inputerror_dialog").html(inputerror_html);

	// add click handler to buttons
	$("#inputerror_button_cancel").button().unbind("click").click(function() { $("#inputerror_dialog").dialog("close"); });
}

function checkAlphanumeric(str,allowed_chars) {
	var regex_pattern = new RegExp("^([A-Z0-9"+allowed_chars+"]+)$","i");
	var regex_matches = str.match(regex_pattern);
	
	return (regex_matches && regex_matches[0]==str);
}

function checkValidEmail(str) {
	var regex_pattern = new RegExp("^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$","i");
	var regex_matches = str.match(regex_pattern);
	
	return (regex_matches && regex_matches[0]==str);
}
