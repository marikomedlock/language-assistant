#!/usr/bin/perl -wT

# account functions (login, logout, createAccount, lookupPassword, modifyAccount)

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;
use Captcha::reCAPTCHA;

# create GLOBAL server hash
my %GLOBAL_server = (
		CGIObj			=> (new CGI),
		CGISession		=> (CGI::Session->load() or die CGI::Session->errstr),
		CGICookie		=> "",
		
		JSON_utf8		=> (JSON->new->utf8),
		
		dbHandle		=> 0,
		dbConnected		=> 0,
		dbURL			=> "mysql:mm87;",
		dbUsername		=> "root",
		dbPassword		=> "honopuHI",
		
		captchaPublic	=> "6Lcpc-ASAAAAAOAXssqBYG9uWNIkOP9qJMdm6JQD",
		captchaPrivate	=> "6Lcpc-ASAAAAABpMFgtX_IO5XkMkeedVMV2iMXF3",
		captchaHTML		=> ""
	);

# create GLOBAL state hash
my %GLOBAL_state = (
		webURL			=> "http://language-assistant.org",
		redirectURL		=> $GLOBAL_server{CGIObj}->param("redirectURL") ? $GLOBAL_server{CGIObj}->param("redirectURL") : "http://language-assistant.org/cgi-bin/account.cgi",
		logged_in		=> 0,
		
		action			=> $GLOBAL_server{CGIObj}->param("action") ? $GLOBAL_server{CGIObj}->param("action") : "",
		status			=> 0,
		message			=> ""
	);

# refresh session
refreshSession(\%GLOBAL_server,\%GLOBAL_state);

# connect to database
connectDatabase(\%GLOBAL_server,1);

# execute requested action
for($GLOBAL_state{action}) {
	if(/^login$/) 						{ login(\%GLOBAL_server,\%GLOBAL_state); }
	elsif(/^getCreateInfo$/)			{ getCreateInfo(\%GLOBAL_server,\%GLOBAL_state); }
	elsif(/^createAccount$/)			{
											createAccount(\%GLOBAL_server,\%GLOBAL_state);
											if($GLOBAL_state{status}==0) {
												getCreateInfo(\%GLOBAL_server,\%0);
												$GLOBAL_state{action} = "getCreateInfo";
											}
										}
	elsif(/^getLookupInfo$/)			{ getLookupInfo(\%GLOBAL_server,\%GLOBAL_state); }
	elsif(/^lookupPassword$/)			{
											lookupPassword(\%GLOBAL_server,\%GLOBAL_state);
											if($GLOBAL_state{status}==0) {
												getLookupInfo(\%GLOBAL_server,\%0);
												$GLOBAL_state{action} = "getLookupInfo";
											}
										}
	elsif(!$GLOBAL_state{logged_in})	{ getCreateInfo(\%GLOBAL_server,\%GLOBAL_state); }
	elsif(/^logout$/)					{ logout(\%GLOBAL_server,\%GLOBAL_state); }
	elsif(/^getModifyInfo$/)			{ getModifyInfo(\%GLOBAL_server,\%GLOBAL_state); }
	elsif(/^modifyAccount$/)			{
											modifyAccount(\%GLOBAL_server,\%GLOBAL_state);
											if($GLOBAL_state{status}==0) {
												getModifyInfo(\%GLOBAL_server,\%0);
												$GLOBAL_state{action} = "getModifyInfo";
											}
										}
	else								{ getModifyInfo(\%GLOBAL_server,\%GLOBAL_state); }
}

# disconnect from database
connectDatabase(\%GLOBAL_server,0);

# generate JSON string
my $GLOBAL_JSONstate = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_state);

# execute requested display
$GLOBAL_server{CGIDisplay} = $GLOBAL_server{CGIObj}->param("display") ? $GLOBAL_server{CGIObj}->param("display") : "";
for($GLOBAL_server{CGIDisplay}) {
	if(/^ajax$/)				{
									print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
									print $GLOBAL_JSONstate;
	}
	elsif(/^redirect$/)			{
									if($GLOBAL_state{status}==1) {
										print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie},-location=>$GLOBAL_state{redirectURL});
									}
									else {
										print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
										print generateHTML(\%GLOBAL_server,\%GLOBAL_state,\$GLOBAL_JSONstate);
									}
	}
	else						{
									print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
									print generateHTML(\%GLOBAL_server,\%GLOBAL_state,\$GLOBAL_JSONstate);
								}
}





sub generateHTML {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_JSONstate_ptr = shift;

my $pageHTML = <<END_HTML;
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US" xml:lang="en">
	<head>
		<title>L-A Accounts</title>
	    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/account.js"></script>

		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-1.9.1.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-ui-1.10.1.custom.js"></script>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/jquery-ui-1.10.1.custom.css"/>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_style.css"/>
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/lookup.css" />
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_dokkai.css" />
	</head>

	<body onload='checkJS_account(); parseJSON_account();'>

	<div id="page" class="clearfix">
		<header id="branding">
			<nav id="mainnav" class="clearfix">
				<div class="menu-page-menu-container"><ul id="menu-page-menu" class="menuY">
					<li><a id="reading_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/reading.cgi">reading</a></li>
					<li><a id="drill_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/drill.cgi">drill</a></li>
					<li><a id="userpage_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/user.cgi">user page</a></li>
					<li><a id="account_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/account.cgi">account</a></li>
					<li><a id="loginout_button" href="javascript:loginout()">loginout</a></li>
				</ul></div>
			</nav>

			<hgroup id="site-title">
				<h1><a id="site_title_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/account.cgi">L-A Accounts</a></h1>
				<h2 id="site_description">user account information</h2>
			</hgroup>
			<img src="$$LOCAL_state_ptr{webURL}/icons/ginko2.png" class="headerimage" width="1101" height="46" alt=""/>
		</header>
		<div id="wrap">
			<div class="content" class="full-width">

				<article id="index_article">
					<div class="single-entry-content" id="account_div">
						$$LOCAL_server_ptr{captchaHTML}
					</div>
				</article>
			</div>
		</div>
		<span style='float:right;font-size:13px;color:#CCC'><a href="mailto:info\@language-assistant.org" style='color:#777'>Contact Us</a></span>
	</div>

	<script type='text/javascript'>
		var GLOBAL_JSONstate = $$LOCAL_JSONstate_ptr;
	</script>
	
	</body>
</html>

END_HTML

	return $pageHTML;
}


sub login {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI object
	my $username = $$LOCAL_server_ptr{CGIObj}->param("username");
	my $password = $$LOCAL_server_ptr{CGIObj}->param("password");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$password = forceAlphanumeric($password,"\.");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
	elsif($password=~m/^$/) { $return_status = 0; $return_msg = "password invalid"; }
	else {
	
		# check username exists
		my $query_str = "SELECT * FROM user WHERE username=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($username);
		
		# if valid user, then create new session object
		if($query_handle->rows!=1) { $return_status = 0; $return_msg = "username not found"; }
		else {
			# [0 1 2 3] = [userid username password email]
			my @data = $query_handle->fetchrow_array();
			
			if(!($data[1]=~m/^$username$/) || !($data[2]=~m/^$password$/)) { $return_status = 0; $return_msg = "password no match"; }
			else {
				$$LOCAL_server_ptr{CGISession}->param("username",$data[1]); #initiate the session object
				$return_status = 1; $return_msg = "logged in";
			}
		}
	}
	
	$$LOCAL_state_ptr{logged_in} = $return_status;
	$$LOCAL_state_ptr{action} = "login";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}

sub logout {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;

	# delete session
	$$LOCAL_server_ptr{CGISession}->clear("username");
	$$LOCAL_server_ptr{CGISession}->delete();
	
	# delete cookie
	$$LOCAL_server_ptr{CGICookie} = "";
	
	$$LOCAL_state_ptr{logged_in} = 0;
	$$LOCAL_state_ptr{action} = "logout";
	$$LOCAL_state_ptr{status} = 1;
	$$LOCAL_state_ptr{message} = "logged out";
}

sub getCreateInfo {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	
	my $captchaHTML = createCaptcha($LOCAL_server_ptr);

	# build getAccountInfo HTML string
	my $captcha_str = <<END_HTML;
						<div id='account_content' class='content'>
							<header class='page-entry-header'><h1 class='entry-title'>please enter your information</h1></header>
							<div class='wpcf7'>
								<div id='account_message_span' class='msg'></div>
								<form id='account_form' action='$$LOCAL_state_ptr{webURL}/cgi-bin/account.cgi' method='post' enctype='multipart/form-data'>
									username : <span class='wpcf7-form-control-wrap'>
									<input id='account_input_username' type='text' name='username' value='' class='wpcf7-text'/></span><br>
									password : <span class='wpcf7-form-control-wrap'>
									<input id='account_input_password' type='password' name='password' value='' class='wpcf7-text'/></span><br>
									email : <span class='wpcf7-form-control-wrap'>
									<input id='account_input_email' type='text' name='email' value='' class='wpcf7-text'/></span><br>
									<div style='width:100%'>&nbsp</div>
									<input type='hidden' name='action' value='createAccount'>
									<br><br>
									$captchaHTML
									<br><br>
								</form>
								<button id='account_button_createaccount'>create new account</button>
							</div>
						</div>
END_HTML

	$$LOCAL_server_ptr{captchaHTML} = $captcha_str;
	
	$$LOCAL_state_ptr{action} = "getCreateInfo";
	$$LOCAL_state_ptr{status} = 1;
}

sub createAccount {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);
	
	# strip arguments from CGI object
	my $username = $$LOCAL_server_ptr{CGIObj}->param("username");
	my $password = $$LOCAL_server_ptr{CGIObj}->param("password");
	my $email = $$LOCAL_server_ptr{CGIObj}->param("email");

	# check captcha correct
	my $captcha_result = checkCaptcha($LOCAL_server_ptr);
	if($captcha_result==0) { $return_status = 0; $return_msg = "captcha response incorrect"; }
	else {
		
		# force valid characters
		$username = forceAlphanumeric($username,"\.");
		$password = forceAlphanumeric($password,"\.");
		$email = forceValidEmail($email);
		
		# check fields not null
		if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
		elsif($password=~m/^$/) { $return_status = 0; $return_msg = "password invalid"; }
		elsif($email=~m/^$/) { $return_status = 0; $return_msg = "email invalid"; }
		else {
			
			# if username already exists, return error
			my $query_str = "SELECT * FROM user WHERE username=?;";
			my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($username);
			if($query_handle->rows > 0) { $return_status = 0; $return_msg = "username already exists"; }
		
			# add user to database
			else {
				$query_str = "INSERT INTO user (username,password,email) VALUES(?,?,?);";
				$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
				$query_handle->execute($username,$password,$email);
				$$LOCAL_server_ptr{CGISession}->param("username",$username); #initiate the session object
				$return_status = 1; $return_msg = "created account";
			}
		
		} #end.. check fields not null

	} #end.. check captcha correct
	
	$$LOCAL_state_ptr{logged_in} = $return_status;
	$$LOCAL_state_ptr{action} = "printAccountInfo";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{password} = $password;
	$$LOCAL_state_ptr{email} = $email;
}

sub getLookupInfo {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;

	my $captchaHTML = createCaptcha($LOCAL_server_ptr);

	# build getLookupInfo HTML string
	my $captcha_str = <<END_HTML;
						<div id='account_content' class='content'>
							<header class='page-entry-header'><h1 class='entry-title'>please enter your information</h1></header>
							<div class='wpcf7'>
								<div id='account_message_span' class='msg'></div>
								<form id='account_form' action='$$LOCAL_state_ptr{webURL}/cgi-bin/account.cgi' method='post' enctype='multipart/form-data'>
									username : <span class='wpcf7-form-control-wrap'>
									<input id='account_input_username' type='text' name='username' value='' class='wpcf7-text'/></span><br>
									email : <span class='wpcf7-form-control-wrap'>
									<input id='account_input_email' type='text' name='email' value='' class='wpcf7-text'/></span><br>
									<div style='width:100%'>&nbsp</div>
									<input type='hidden' name='action' value='lookupPassword'>
									<br><br>
									$captchaHTML
									<br><br>
									<button id='account_button_lookupPassword'>lookup password</button>
								</form>
							</div>
						</div>
END_HTML

	$$LOCAL_server_ptr{captchaHTML} = $captcha_str;

	$$LOCAL_state_ptr{action} = "getLookupInfo";
	$$LOCAL_state_ptr{status} = 1;
}

sub lookupPassword {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);
	
	# strip arguments from CGI object
	my $username = $$LOCAL_server_ptr{CGIObj}->param("username");
	my $email = $$LOCAL_server_ptr{CGIObj}->param("email");
	
	my $password;

	# check captcha correct
	my $captcha_result = checkCaptcha($LOCAL_server_ptr);
	if($captcha_result==0) { $return_status = 0; $return_msg = "captcha response incorrect"; }
	else {
		
		# force valid characters
		$username = forceAlphanumeric($username,"\.");
		$email = forceValidEmail($email);
		
		# check fields not null
		if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
		elsif($email=~m/^$/) { $return_status = 0; $return_msg = "email invalid"; }
		else {
			
			# if username not found, return error
			my $query_str = "SELECT * FROM user WHERE username=?;";
			my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($username);
			if($query_handle->rows!=1) { $return_status = 0; $return_msg = "username not found"; }
		
			# return user password
			else {
				# [0 1 2 3] = [userid username password email]
				my @data = $query_handle->fetchrow_array();
		
				if(!($data[1]=~m/^$username$/) || !($data[3]=~m/^$email$/)) { $return_status = 0; $return_msg = "email no match"; }
				else {
					$password = $data[2];
					$return_status = 1; $return_msg = "password found";
				}
			}
		
		} #end.. check fields not null

	} #end.. check captcha correct
	
	$$LOCAL_state_ptr{logged_in} = $return_status;
	$$LOCAL_state_ptr{action} = "printAccountInfo";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{password} = $password;
	$$LOCAL_state_ptr{email} = $email;
}

sub getModifyInfo {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);
	
	# strip arguments from CGI session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my ($password, $email) = '';
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	
	# check field not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
	else {
		
		# if username not found, return error
		my $query_str = "SELECT * FROM user WHERE username=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($username);
		if($query_handle->rows!=1) { $return_status = 0; $return_msg = "username not found"; }
	
		# return user password, email
		else {
			# [0 1 2 3] = [userid username password email]
			my @data = $query_handle->fetchrow_array();
	
			if(!($data[1]=~m/^$username$/)) { $return_status = 0; $return_msg = "username no match"; }
			else {
				$password = $data[2];
				$email = $data[3];
				$return_status = 1; $return_msg = '';
			}
		}
	
	} #end.. check fields not null

	$$LOCAL_state_ptr{logged_in} = $return_status;
	$$LOCAL_state_ptr{action} = "getModifyInfo";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{password} = $password;
	$$LOCAL_state_ptr{email} = $email;
}

sub modifyAccount {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);
	
	# strip arguments from CGI and session objects
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $password = $$LOCAL_server_ptr{CGIObj}->param("password");
	my $email = $$LOCAL_server_ptr{CGIObj}->param("email");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$password = forceAlphanumeric($password,"\.");
	$email = forceValidEmail($email);
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
	elsif($password=~m/^$/) { $return_status = 0; $return_msg = "password invalid"; }
	elsif($email=~m/^$/) { $return_status = 0; $return_msg = "email invalid"; }
	else {
		
		# if username not found, return error
		my $query_str = "UPDATE user SET password=?,email=? WHERE username=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($password,$email,$username);
		$return_status = 1; $return_msg = "modified account";
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{logged_in} = $return_status;
	$$LOCAL_state_ptr{action} = "printAccountInfo";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{password} = $password;
	$$LOCAL_state_ptr{email} = $email;
}


sub refreshSession {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;

	# refresh session
	my $CGISession = $$LOCAL_server_ptr{CGISession};
	if($CGISession->is_expired || $CGISession->is_empty || !defined($CGISession->param("username"))) {
		$CGISession = new CGI::Session() or die CGI::Session->errstr;
	}
	$CGISession->expire(+1800);
	
	# check if logged in
	my $already_logged_in = !defined($CGISession->param("username")) || ($CGISession->param("username"))=~m/^$/ ? 0 : 1;

	# store session id in cookie
	my $CGICookie = $$LOCAL_server_ptr{CGIObj}->cookie(-name=>$CGISession->name,-value=>$CGISession->id);

	$$LOCAL_server_ptr{CGISession} = $CGISession;
	$$LOCAL_server_ptr{CGICookie} = $CGICookie;
	
	$$LOCAL_state_ptr{logged_in} = $already_logged_in;
}

sub connectDatabase {

	my $LOCAL_server_ptr = shift;
	my $connecting = shift;
	
	if($connecting==1 && $$LOCAL_server_ptr{dbConnected}==0) {
		$$LOCAL_server_ptr{dbHandle} = DBI->connect("DBI:".$$LOCAL_server_ptr{dbURL},$$LOCAL_server_ptr{dbUsername},$$LOCAL_server_ptr{dbPassword}) or die;
		$$LOCAL_server_ptr{dbConnected} = 1;
	}
	elsif($connecting==0 && $$LOCAL_server_ptr{dbConnected}==1) {
		$$LOCAL_server_ptr{dbHandle} = 0;
		$$LOCAL_server_ptr{dbConnected} = 0;
	}
}


sub createCaptcha {

	my $LOCAL_server_ptr = shift;

	my $captchaObj = Captcha::reCAPTCHA->new;
	
	my $captcha_options = <<END_HTML;
	<script type="text/javascript">
		var RecaptchaOptions = { theme : "clean" };
	</script>
END_HTML

	my $captcha_html = $captcha_options.($captchaObj->get_html($$LOCAL_server_ptr{captchaPublic}));
	return $captcha_html;
}

sub checkCaptcha {

	my $LOCAL_server_ptr = shift;

	my $captchaObj = Captcha::reCAPTCHA->new;

	my $challenge = $$LOCAL_server_ptr{CGIObj}->param("recaptcha_challenge_field");
	my $response = $$LOCAL_server_ptr{CGIObj}->param("recaptcha_response_field");

	#check captcha response
	my $result = $captchaObj->check_answer(
		$$LOCAL_server_ptr{captchaPrivate}, $ENV{'REMOTE_ADDR'},
		$challenge, $response
	);

	if($result->{is_valid}) { return 1; }
	else { return 0; }
}


sub forceAlphanumeric {
	my $input_str = shift;
	my $allowed_chars = shift;

	my $output_str;
	if($input_str =~ m/([\w\d$allowed_chars]+)/) { $output_str = $1; }
	else { $output_str = ""; }
	
	return $output_str;
}

sub forceValidEmail {
	my $input_str = shift;
	
	my $output_str;
	if($input_str =~ m/^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i) { $output_str = $1; }
	else { $output_str = ""; }
	
	return $output_str;
}
