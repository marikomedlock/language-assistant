#!/usr/bin/perl -wT

# drill index page ()

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;

# create GLOBAL server hash
my %GLOBAL_server = (
		CGIObj			=> (new CGI),
		CGISession		=> (CGI::Session->load() or die CGI::Session->errstr),
		CGICookie		=> "",
		
		JSON_utf8		=> (JSON->new->utf8)
	);

# create GLOBAL state hash
my %GLOBAL_state = (
		webURL			=> "http://language-assistant.org",
		redirectURL		=> "http://language-assistant.org/cgi-bin/drill.cgi",
		logged_in		=> 0
	);

# refresh session
refreshSession(\%GLOBAL_server,\%GLOBAL_state);

# generate JSON string
my $GLOBAL_JSONstate = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_state);

# display page
print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate);





sub generateHTML {
	
	my $LOCAL_state_ptr = shift;
	my $LOCAL_JSONstate_ptr = shift;
	
	my $pageHTML = <<END_HTML;
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US" xml:lang="en">
	<head>
		<title>L-A Drills</title>
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

	<body onload='checkJS_account();'>
	
	<div id="page" class="clearfix">
		<header id="branding">
			<nav id="mainnav" class="clearfix">
				<div class="menu-page-menu-container"><ul id="menu-page-menu" class="menuY">
					<li><a id="reading_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/reading.cgi">reading</a></li>
					<li><a id="drill_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/drill.cgi">drill</a></li>
					<li><a id="userpage_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/user.cgi#drill">user page</a></li>
					<li><a id="account_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/account.cgi">account</a></li>
					<li><a id="loginout_button" href="javascript:loginout()">loginout</a></li>
				</ul></div>
			</nav>

			<hgroup id="site-title">
				<h1><a id="site_title_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/drill.cgi">L-A Drills</a></h1>
				<h2 id="site_description">drill builder tool</h2>
			</hgroup>
			<img src="$$LOCAL_state_ptr{webURL}/icons/ginko2.png" class="headerimage" width="1101" height="46" alt=""/>
		</header>
		<div id="wrap">
			<div class="content" class="full-width">
				<article id="index_article">
					<span id="server_message_span" class="msg">$$LOCAL_state_ptr{message}</span>
					<div class="single-entry-content">
					
							<div class="two-columns-one">
								<div style="border:1px solid #DDD; background-color:#F0F0F0; padding:15px 10px;">
									<header class="single-entry-header">
										<h1 id="top_header" class="entry-title">For Instructors</h1>
										<ul>
											<li>&bull; Choose from different question types</li>
											<li>&bull; Include images & audio</li>
											<li>&bull; Add more questions as you go</li>
											<li>&bull; Go back and edit again later</li>
										</ul>
										<br>
										<h1 id="bottom_header" class="entry-title">For Students</h1>
										<ul>
											<li>&bull; Check answers automatically</li>
										</ul>
									</header>
								</div>
							</div>
							
							<div class="two-columns-one last">
								<div style="border:1px solid #DDD; background-color:#F0F0F0; padding:15px 10px;">
									<header class="single-entry-header">
										<br>
										Please use the <a href="http://www.google.com/intl/en/chrome/browser/" target="_blank">Google Chrome <img src="$$LOCAL_state_ptr{webURL}/icons/googleChrome.png" height=15 width=15></a> browser.
										<br><br>
										To see your own files please login and go to the <a href="$$LOCAL_state_ptr{webURL}/cgi-bin/user.cgi">USER PAGE</a>.
										<br><br>
										<h1 id="right_header" class="entry-title">Example Files</h1>
										<ul>
											<li><a href="$$LOCAL_state_ptr{webURL}/cgi-bin/opendrill.cgi?blueprintid=208">Speaking : Short Questions</a></li>
											<li><a href="$$LOCAL_state_ptr{webURL}/cgi-bin/opendrill.cgi?blueprintid=210">Listening : Asking Someone's Age</a></li>
											<li><a href="$$LOCAL_state_ptr{webURL}/cgi-bin/opendrill.cgi?blueprintid=211">Typing : Using Location Words</a></li>
										</ul>
									</header>
								</div>
							</div>
							<div class="divider"></div>	
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
