#!/usr/bin/perl -wT

# user functions (getUser, listLessons, renameLesson, deleteLesson, shareLesson, deleteShare)

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;
use Encode;

my $CGIObj = new CGI;
my $CGISession = CGI::Session->load() or die CGI::Session->errstr;
my $CGICookie = '';

# create GLOBAL state hash
my %GLOBAL_state = (
		webURL			=> "http://language-assistant.org",
		redirectURL		=> "http://language-assistant.org/cgi-bin/reading.cgi",
		logged_in		=> 0,
		username		=> (!$CGISession->param("username")) ? "" : $CGISession->param("username"),
		
		action			=> (!$CGIObj->param("action")) ? "" : $CGIObj->param("action"),
		status			=> 0,
		message			=> ''
	);

# refresh session
refreshSession(\%GLOBAL_state);

# convert to UTF-8
for my $key ( keys %GLOBAL_state) { $GLOBAL_state{$key} = Encode::decode("utf8",$GLOBAL_state{$key}); }

# generate JSON string
my $JSON_utf8 = JSON->new->utf8;
my $GLOBAL_JSONstate = $JSON_utf8->utf8(0)->encode(\%GLOBAL_state);

# pull arguments from CGI object
my $word_str = $CGIObj->param("word_str"); if(!$word_str) { $word_str = ""; }
my $pron_str = $CGIObj->param("pron_str"); if(!$pron_str) { $pron_str = ""; }
my $defn_str = $CGIObj->param("defn_str"); if(!$defn_str) { $defn_str = ""; }

# parse arguments to build json
my $json_words = "";
my @word_split = split("////",$word_str);
my @pron_split = split("////",$pron_str);
my @defn_split = split("////",$defn_str);
for(my $i=0; $i<@word_split; $i++) {
	if($i > 0) { $json_words .= ", "; }
	$json_words .= "\"$i\": {\"word\":\"$word_split[$i]\", \"pron\":\"$pron_split[$i]\", \"defn\":\"$defn_split[$i]\"}";
}

# display page
print $CGIObj->header(-charset=>'utf-8',-cookie=>$CGICookie);
print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,$json_words);


sub generateHTML {

	my $LOCAL_state_ptr = shift;
	my $LOCAL_JSONstate_ptr = shift;
	my $json_words = shift;

my $pageHTML = <<END_HTML;
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US" xml:lang="en">
	<head>
		<title>L-A Flashcards</title>
	    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/account.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/opencard.js"></script>

		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-1.9.1.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-ui-1.10.1.custom.js"></script>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/jquery-ui-1.10.1.custom.css"/>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_style.css"/>
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/lookup.css" />
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_dokkai.css" />
	</head>

	<body onload='checkJS_account(); setup_cards();'>

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
				<h1><a id="site_title_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/user.cgi">L-A Flashcards</a></h1>
				<h2 id="site_description">vocabulary practice tool</h2>
			</hgroup>
			<!--<img src="$$LOCAL_state_ptr{webURL}/icons/ginko2.png" class="headerimage" width="1101" height="46" alt=""/>--!>
		</header>
		<div id="wrap">
			<div class="content" class="full-width">

				<article id="index_article">
					<!--<div class="single-entry-content" id="userpage_div">--!>
					
					<header class="single-entry-header">
							<span id="list_button" style="font-size:22pt">List</span>
							&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
							<span id="flashcard_button" style="font-size:22pt">Flashcard</span>
						<div id="toggle_view"></div>
					</header>
					
					<!--</div>--!>
				</article>
				
			</div>
		</div>
		<span style='float:right;font-size:13px;color:#CCC'><a href="mailto:info\@language-assistant.org" style='color:#777'>Contact Us</a></span>
	</div>

	<script type="text/javascript">
		var GLOBAL_JSONstate = $$LOCAL_JSONstate_ptr;
		words={ $json_words };
	</script>
	
	</body>
</html>

END_HTML

	return $pageHTML;
}


sub refreshSession {

	my $LOCAL_state_ptr = shift;

	# check already logged in, refresh session
	if(!($CGISession->is_expired) && !($CGISession->is_empty) && defined($CGISession->param("username"))) { $CGISession->expire(+1800); }
	else { $CGISession = new CGI::Session() or die CGI::Session->errstr; $CGISession->expire(+1800); }
	my $already_logged_in = !defined($CGISession->param("username")) || ($CGISession->param("username"))=~m/^$/ ? 0 : 1;

	# store session id in cookie
	$CGICookie = $CGIObj->cookie(-name=>$CGISession->name,-value=>$CGISession->id);

	$$LOCAL_state_ptr{logged_in} = $already_logged_in;
}
