#!/usr/bin/perl -w

# reading index page (searchSentence, openLesson, createLesson, insertText, deleteText,
#	newAnnotate, deleteAnnotate, computerAnnotate, saveStar, newImageObj, deleteImageObj, newAudioObj, deleteAudioObj)

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;
use Encode;
use Text::MeCab;

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
		dbPassword		=> "honopuHI"
	);

# create GLOBAL state hash
my %GLOBAL_state = (
		webURL			=> "http://language-assistant.org",
		redirectURL		=> $GLOBAL_server{CGIObj}->param("redirectURL") ? $GLOBAL_server{CGIObj}->param("redirectURL") : "http://language-assistant.org/cgi-bin/reading.cgi",
		logged_in		=> 0,
		
		action			=> $GLOBAL_server{CGIObj}->param("action") ? $GLOBAL_server{CGIObj}->param("action") : "",
		status			=> 0,
		message			=> ""
	);

# create GLOBAL blueprint hash
my %GLOBAL_blueprint = ();

# refresh session
refreshSession(\%GLOBAL_server,\%GLOBAL_state);

# connect to database
connectDatabase(\%GLOBAL_server,1);

# execute requested action
for($GLOBAL_state{action}) {
	if(/^searchSentence$/)				{ searchSentence(\%GLOBAL_server,\%GLOBAL_state); } # !! move to sentence.cgi ??
	
	elsif(/^openLesson$/)				{ openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
	elsif(!$GLOBAL_state{logged_in})	{ openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
	elsif(/^createLesson$/)				{
											createReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^insertText$/)				{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											insertText(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^deleteText$/)				{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											deleteText(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^newAnnotate$/)				{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											newAnnotate(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^deleteAnnotate$/)			{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											deleteAnnotate(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^computerAnnotate$/)			{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											computerAnnotate(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^saveStar$/)					{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											saveStar(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^newImageObj$/)				{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											newImageObj(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^deleteImageObj$/)			{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											deleteImageObj(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^newAudioObj$/)				{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											newAudioObj(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^deleteAudioObj$/)			{
											openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											deleteAudioObj(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	else								{ openReading(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
}

# disconnect from database
connectDatabase(\%GLOBAL_server,0);

# generate JSON string
my $GLOBAL_JSONstate = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_state);
my %GLOBAL_JSONblueprint = (	charSTR			=> %GLOBAL_blueprint->{charSTR},
								charTOword		=> $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%{%GLOBAL_blueprint->{charTOword}}),
								wordTOannotate	=> $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%{%GLOBAL_blueprint->{wordTOannotate}}),
								objTOchar		=> $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%{%GLOBAL_blueprint->{objTOchar}}),
								star			=> $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%{%GLOBAL_blueprint->{star}}),
								hashsizes		=> $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%{%GLOBAL_blueprint->{hashsizes}})
							);
						
# execute requested display
$GLOBAL_server{CGIDisplay} = $GLOBAL_server{CGIObj}->param("display") ? $GLOBAL_server{CGIObj}->param("display") : "";
for($GLOBAL_server{CGIDisplay}) {
	if(/^ajax$/)				{
									if(!$GLOBAL_state{logged_in}) {
										$GLOBAL_state{status} = 0;
										$GLOBAL_state{message} = "not logged in";
									}
									print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
									print $GLOBAL_JSONstate;
	}
	elsif(/^redirect$/)			{
									if($GLOBAL_state{status}==1) {
										print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie},-location=>$GLOBAL_state{redirectURL});
									}
									else {
										print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
										print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,\%GLOBAL_JSONblueprint);
									}
	}
	else						{
									print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
									print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,\%GLOBAL_JSONblueprint);
								}
}





sub generateHTML {
	
	my $LOCAL_state_ptr = shift;
	my $LOCAL_JSONstate_ptr = shift;
	my $LOCAL_JSONblueprint_ptr = shift;
	
	my $pageHTML = <<END_HTML;
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US" xml:lang="en">
	<head>
		<title>L-A Readings</title>
	    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/account.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/openutils.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/openreading.js"></script>

		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-1.9.1.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-ui-1.10.1.custom.js"></script>
		
		<script type="text/javascript" src="$$LOCAL_state_ptr{webURL}/js/jRecorder.js"></script>
		<script type="text/javascript" src="$$LOCAL_state_ptr{webURL}/js/recorder2.js"></script>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/jquery-ui-1.10.1.custom.css"/>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_style.css"/>
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/lookup.css" />
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_dokkai.css" />
	</head>

	<body onload='checkJS_account(); checkJS_openreading(); parseJSON_openreading();'>
	
	<div id="page" class="clearfix">
		<header id="branding">
			<nav id="mainnav" class="clearfix">
				<div class="menu-page-menu-container"><ul id="menu-page-menu" class="menuY">
					<li><a id="reading_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/reading.cgi">reading</a></li>
					<li><a id="drill_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/drill.cgi">drill</a></li>
					<li><a id="userpage_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/user.cgi#reading">user page</a></li>
					<li><a id="account_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/account.cgi">account</a></li>
					<li><a id="loginout_button" href="javascript:loginout()">loginout</a></li>
				</ul></div>
			</nav>

			<hgroup id="site-title">
				<h1><a id="site_title_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/reading.cgi">L-A Readings</a></h1>
				<h2 id="site_description">text annotator tool</h2>
			</hgroup>
			<!--<img src="$$LOCAL_state_ptr{webURL}/icons/ginko2.png" class="headerimage" width="1101" height="46" alt=""/>--!>
		</header>
		
		<div id="wrap">
			<div class="content" class="full-width">
			
				<article id="index_article">
					<div class="single-entry-content" id="openreading_div" style="overflow:auto">$$LOCAL_JSONblueprint_ptr{charSTR}</div>
				</article>
			</div>
		</div>
		<span style='float:right;font-size:13px;color:#CCC'><a href="mailto:info\@language-assistant.org" style='color:#777'>Contact Us</a></span>
	</div>
	
	<script type="text/javascript">
		\$.jRecorder({
			host : "$$LOCAL_state_ptr{webURL}/cgi-bin/upload.cgi?blueprintid=$$LOCAL_state_ptr{blueprintid}",
			callback_started_recording :	function() { callback_started(); },
			callback_stopped_recording :	function() { callback_stopped(); },
			callback_activityLevel :		function(level) { callback_activityLevel(level); },
			callback_activityTime :			function(time) { callback_activityTime(time); },
			callback_finished_sending :		function(time) { callback_finished_sending(); },
			swf_path :						"$$LOCAL_state_ptr{webURL}/swf/jRecorder.swf",
		});
	</script>
	
	<script type='text/javascript'>
		var GLOBAL_JSONstate = $$LOCAL_JSONstate_ptr;
		
		var GLOBAL_JSONcharTOword = $$LOCAL_JSONblueprint_ptr{charTOword};
		var GLOBAL_JSONwordTOannotate = $$LOCAL_JSONblueprint_ptr{wordTOannotate};
		var GLOBAL_JSONobjTOchar = $$LOCAL_JSONblueprint_ptr{objTOchar};
		var GLOBAL_JSONstar = $$LOCAL_JSONblueprint_ptr{star};
		var GLOBAL_JSONhashsizes = $$LOCAL_JSONblueprint_ptr{hashsizes};
	</script>
	
	</body>
</html>
END_HTML

	return $pageHTML;
}


sub openReading {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	if($blueprintid=~m/^$/) { $blueprintid = $$LOCAL_server_ptr{CGIObj}->url_param("blueprintid"); }

	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	else {
		
		# build empty blueprint JSON
		my %empty_blueprint = (	charSTR			=> "",
								charTOword		=> { },
								wordTOannotate	=> { },
								objTOchar		=> { },
								star			=> { },
								hashsizes		=> { charTOword=>0, wordTOannotate=>0, objTOchar=>0 }
							);
							
		# open TXT file
		my $txtfile_str;
		{
			local $/; #Enable 'slurp' mode
			open my $txtfh, "<:utf8", "/blueprints_volume/blueprint/reading/$blueprintid.txt" or die "$!";
			$txtfile_str = <$txtfh>;
			close $txtfh;
		}
	
		# open JSON file
		my $jsonfile_str;
		{
			local $/; #Enable 'slurp' mode
			open my $jsonfh, "<:utf8", "/blueprints_volume/blueprint/reading/$blueprintid.json" or die "$!";
			$jsonfile_str = <$jsonfh>;
			close $jsonfh;
		}
		
		# decode_json returns a hash (or object) reference
		my $decodedjson_hashref = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->decode($jsonfile_str);
		
		# LOCAL_lesson_ptr is a reference to GLOBAL_lesson_ptr,
		# so need to set the value pointed at by GLOBAL_lesson_ptr, to the value pointed at by decodedjson_hashref.
		# $LOCAL_lesson_ptr = $decodedjson_hashref does not work because it doesn't affect the GLOBAL_ variable
		# passed as an argument to this subroutine.
		%$LOCAL_blueprint_ptr = %$decodedjson_hashref;
		$$LOCAL_blueprint_ptr{charSTR} = $txtfile_str;
		
		$return_status = 1;
		$return_msg = "opened reading";
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	
	# mask logged_in boolean if user doesn't own or share this blueprint
	checkCanEdit($LOCAL_server_ptr,$LOCAL_state_ptr);
	
	$$LOCAL_state_ptr{action} = "openReading";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub createReading {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");

	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username ($username) invalid"; }
	else {
	
		# add blueprint to database
		my $query_str = "INSERT INTO `blueprint` (`ownerid`,`type`,`name`) ";
		$query_str .= "SELECT us.`userid`,'reading','untitled reading' ";
		$query_str .= "FROM `user` us WHERE us.`username`=?;";		
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($username);
		my $blueprintid = $query_handle->{mysql_insertid};
		
		# insert record into share table
		$query_str = "INSERT INTO `share` (`userid`,`blueprintid`,`listindex`) ";
		$query_str .= "SELECT us.`userid`,?,";
		$query_str .= "(SELECT MAX(`listindex`)+1 FROM `share` sh1 ";
		$query_str .= "LEFT JOIN `user` us1 ON sh1.`userid`=us1.`userid` WHERE us1.`username`=?) ";
		$query_str .= "FROM `user` us WHERE us.`username`=?;";
		$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($blueprintid,$username,$username);
		
		# build empty blueprint JSON
		my %empty_blueprint = (	charSTR			=> "",
								charTOword		=> { },
								wordTOannotate	=> { },
								objTOchar		=> { },
								star			=> { },
								hashsizes		=> { charTOword=>0, wordTOannotate=>0, objTOchar=>0 }
							);

		$return_status = 1;
		$return_msg = "created reading";
		
		$$LOCAL_state_ptr{blueprintid} = $blueprintid;
		%$LOCAL_blueprint_ptr = %empty_blueprint;
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "createReading";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub saveReading {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from global state hash
	my $blueprintid = $$LOCAL_state_ptr{blueprintid};

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	else {
	
		my $charSTR = $$LOCAL_blueprint_ptr{charSTR};
	
		# build TXT file
		open(TXTFILE,">:utf8","/blueprints_volume/blueprint/reading/$blueprintid.txt") or die "$!";
		print TXTFILE $charSTR;
		close TXTFILE;

		# build blueprint JSON
		delete $LOCAL_blueprint_ptr->{charSTR};
		my $blueprint_JSONstr = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode($LOCAL_blueprint_ptr);
		$$LOCAL_blueprint_ptr{charSTR} = $charSTR;
	
		# write JSON file
		open(READINGFILE,">:utf8","/blueprints_volume/blueprint/reading/$blueprintid.json") or die "$!";
		print READINGFILE $blueprint_JSONstr;
		close READINGFILE;

		$return_status = 1;
		$return_msg = $$LOCAL_state_ptr{message};
		
	} #end.. check logged in
	
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}


sub insertText {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);
	
	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $insertStartKEY = $$LOCAL_server_ptr{CGIObj}->param("insertStartKEY");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$insertStartKEY = forceAlphanumeric($insertStartKEY,"\-");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	elsif($insertStartKEY=~m/^$/) { $return_status = 0; $return_msg = "insertStartKEY ($insertStartKEY) invalid"; $return_data = ""; }
	else {
		
		# strip fields from CGI object
		my $insertSTR = $$LOCAL_server_ptr{CGIObj}->param("insertSTR"); $insertSTR=~s/\\n/\n/g;
		$insertStartKEY = sprintf("%d",$insertStartKEY);
		my $insertLength = length(Encode::decode("utf8",$insertSTR));

		# shift all charKEYs after insert start
		#    in charTOword, wordTOannotate hash
		my %new_charTOword = ();
		foreach my $charKEY ( keys %{$LOCAL_blueprint_ptr->{charTOword}} ) {
		
			my $new_charKEY = sprintf("%d",$charKEY);
			if($charKEY>$insertStartKEY) {
				
				my @charVAL = @{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}};
				my $wordKEY = $charVAL[0];
				my $wordVAL_charsetKEY = $charVAL[1];
				my @wordVAL_charsetVAL = @{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY}};
				my $wordVAL_charsetVAL_lastchar = sprintf("%d",$wordVAL_charsetVAL[(@wordVAL_charsetVAL -1)]);
				if($new_charKEY==$wordVAL_charsetVAL_lastchar) {
					
					for(my $ctr=0; $ctr<@wordVAL_charsetVAL; $ctr++) {
						my $wordVAL_charsetVAL_ctrchar = sprintf("%d",$wordVAL_charsetVAL[$ctr]);
						if($wordVAL_charsetVAL_ctrchar>$insertStartKEY) {
							${$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY}}[$ctr] = $wordVAL_charsetVAL_ctrchar + $insertLength;
						}
					}
				}
				$new_charKEY = $new_charKEY + $insertLength;
			}
			@{$new_charTOword{$new_charKEY}} = @{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}};
		}
		
		# update global lesson charTOword hash
		%{$LOCAL_blueprint_ptr->{charTOword}} = %new_charTOword;

		#    in objTOchar hash
		foreach my $objKEY ( keys %{$LOCAL_blueprint_ptr->{objTOchar}} ) {
			my $afterID = sprintf("%d",$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{afterID});
			if($afterID>$insertStartKEY) {
				$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{afterID} = $afterID + $insertLength;
			}
		}
		
		#    in charSTR scalar
		my $charSTR_scalar = $$LOCAL_blueprint_ptr{charSTR};
		substr($charSTR_scalar, $insertStartKEY+1, 0) = Encode::decode("utf8",$insertSTR);
		
		# update global lesson charSTR scalar
		$$LOCAL_blueprint_ptr{charSTR} = $charSTR_scalar;

		my %return_data_hash = ( insertSTR=>Encode::decode("utf8",$insertSTR), insertstartKEY=>$insertStartKEY );
		
		$return_status = 1;
		$return_msg = "insertText successful";
		$return_data = encode_json(\%return_data_hash);
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "insertText";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub deleteText {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {

		# strip arguments from CGI object
		my %return_data_hash = (delete_charKEYs			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("delete_charKEYs")) );
		
		my @delete_charKEYs_arr = @{%return_data_hash->{delete_charKEYs}};

		# delete mappings in charTOword, wordTOannotate, charSTR scalar
		my $charSTR_scalar = $$LOCAL_blueprint_ptr{charSTR};
		for(my $ctr=@delete_charKEYs_arr -1; $ctr>=0; $ctr--) {
			my $delete_charKEY = $delete_charKEYs_arr[$ctr];
			substr($charSTR_scalar, $delete_charKEY, 1) = "";
			
			delete_charTOword($LOCAL_blueprint_ptr,$delete_charKEY);
		}

		# shift all charKEYs after delete start
		#    in charTOword, wordTOannotate hash
		my %new_charTOword = ();
		my %new_wordTOannotate_charsetARR = ();
		foreach my $charKEY ( keys %{$LOCAL_blueprint_ptr->{charTOword}} ) {
			my $charKEY = sprintf("%d",$charKEY);
			my @charVAL = @{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}};
			my $wordKEY = $charVAL[0];
			my $wordVAL_charsetKEY = $charVAL[1];
			my @wordVAL_charsetVAL = @{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY}};
			my $wordVAL_charsetVAL_lastchar = sprintf("%d",$wordVAL_charsetVAL[(@wordVAL_charsetVAL -1)]);
					
			my $new_charKEY = $charKEY;
			my @new_wordVAL_charsetVAL = @wordVAL_charsetVAL;
			for(my $delctr=0; $delctr<@delete_charKEYs_arr; $delctr++) {
				my $delete_charKEY = sprintf("%d",$delete_charKEYs_arr[$delctr]);
				
				if($charKEY>$delete_charKEY) {
					
					if($charKEY==$wordVAL_charsetVAL_lastchar) {
						
						for(my $ctr=0; $ctr<@wordVAL_charsetVAL; $ctr++) {
							my $wordVAL_charsetVAL_ctrchar = sprintf("%d",$wordVAL_charsetVAL[$ctr]);
							if($wordVAL_charsetVAL_ctrchar>$delete_charKEY) {
								$new_wordVAL_charsetVAL[$ctr] = $new_wordVAL_charsetVAL[$ctr] -1;
							}
						}
					}
					$new_charKEY = $new_charKEY - 1;
					
				}
				
			}
			if($charKEY==$wordVAL_charsetVAL_lastchar) { @{$new_wordTOannotate_charsetARR{$new_charKEY}} = @new_wordVAL_charsetVAL; }
			@{$new_charTOword{$new_charKEY}} = @{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}};
			
		} # end..charKEY in GLOBAL_JSONcharTOword
		
		# update global lesson charTOword hash
		%{$LOCAL_blueprint_ptr->{charTOword}} = %new_charTOword;

		# update global lesson wordTOannotate hash, charset arrays
		foreach my $charKEY ( keys %new_wordTOannotate_charsetARR ) {
			my @charVAL = @{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}};
			my $wordKEY = $charVAL[0];
			my $charsetKEY = $charVAL[1];
			@{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$charsetKEY}} = @{$new_wordTOannotate_charsetARR{$charKEY}};
		}
		
		# update global objTOchar hash
		my %new_objTOchar_afterID = ();
		foreach my $objKEY ( keys %{$LOCAL_blueprint_ptr->{objTOchar}} ) {
			my $afterID = sprintf("%d",$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{afterID});
			
			for(my $delctr=0; $delctr<@delete_charKEYs_arr; $delctr++) {
				my $delete_charKEY = sprintf("%d",$delete_charKEYs_arr[$delctr]);
				if($afterID>$delete_charKEY) {
					if(!(exists $new_objTOchar_afterID{$objKEY})) { $new_objTOchar_afterID{$objKEY} = $afterID; }
					$new_objTOchar_afterID{$objKEY} = $new_objTOchar_afterID{$objKEY} - 1;
				}
			}
		}
		foreach my $objKEY ( keys %new_objTOchar_afterID ) {
			my $new_afterID = $new_objTOchar_afterID{$objKEY};
			$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{afterID} = $new_afterID;
		}

		# update global lesson charSTR scalar
		$$LOCAL_blueprint_ptr{charSTR} = $charSTR_scalar;
		
		$return_status = 1;
		$return_msg = "deleteText successful";
		$return_data = encode_json(\%return_data_hash);
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "deleteText";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub newAnnotate {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (delete_charKEYs			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("delete_charKEYs")),
								add_charKEYs			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_charKEYs")),
								add_charVALi0s			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_charVALi0s")),
								add_charVALi1s			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_charVALi1s")),
								add_wordKEYs			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_wordKEYs")),
								add_annotateDICTs		=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_annotateDICTs")),
								add_annotatePRONOUNCEs	=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_annotatePRONOUNCEs")),
								add_annotateTEXTs		=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_annotateTEXTs")),
								add_annotateCHARSETs	=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_annotateCHARSETs")),
								add_annotatePATTERNs	=> decode_json($$LOCAL_server_ptr{CGIObj}->param("add_annotatePATTERNs"))
		);
		
		my @delete_charKEYs_arr = @{%return_data_hash->{delete_charKEYs}};
		my @add_charKEYs_arr = @{%return_data_hash->{add_charKEYs}};
		my @add_charVALi0s_arr = @{%return_data_hash->{add_charVALi0s}};
		my @add_charVALi1s_arr = @{%return_data_hash->{add_charVALi1s}};
		my @add_wordKEYs_arr = @{%return_data_hash->{add_wordKEYs}};
		my @add_annotateDICTs_arr = @{%return_data_hash->{add_annotateDICTs}};
		my @add_annotatePRONOUNCEs_arr = @{%return_data_hash->{add_annotatePRONOUNCEs}};
		my @add_annotateTEXTs_arr = @{%return_data_hash->{add_annotateTEXTs}};
		my @add_annotateCHARSETs_arr = @{%return_data_hash->{add_annotateCHARSETs}};
		my @add_annotatePATTERNs_arr = @{%return_data_hash->{add_annotatePATTERNs}};
				
		# delete mappings in charTOword, wordTOannotate
		for(my $ctr=0; $ctr<@delete_charKEYs_arr; $ctr++) {
			delete_charTOword($LOCAL_blueprint_ptr,$delete_charKEYs_arr[$ctr]);
		}
	
		# add mappings in charTOword
		for(my $ctr=0; $ctr<@add_charKEYs_arr; $ctr++) {
			add_charTOword($LOCAL_blueprint_ptr,$add_charKEYs_arr[$ctr],$add_charVALi0s_arr[$ctr],$add_charVALi1s_arr[$ctr]);
		}
	
		# add mappings in wordTOannotate
		for(my $ctr=0; $ctr<@add_wordKEYs_arr; $ctr++) {
			my $add_annotateDICT = $add_annotateDICTs_arr[$ctr];
			my $add_annotatePRONOUNCE = $add_annotatePRONOUNCEs_arr[$ctr];
			my $add_annotateTEXT = $add_annotateTEXTs_arr[$ctr];
			my $add_annotatePATTERN = $add_annotatePATTERNs_arr[$ctr];
			add_wordTOannotate($LOCAL_blueprint_ptr,$add_wordKEYs_arr[$ctr],$add_annotateDICT,$add_annotatePRONOUNCE,$add_annotateTEXT,$add_annotateCHARSETs_arr[$ctr],$add_annotatePATTERN);
		}
		
		$return_status = 1;
		$return_msg = "newAnnotate successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "newAnnotate";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub deleteAnnotate {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (delete_charKEYs			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("delete_charKEYs")) );
		
		my @delete_charKEYs_arr = @{%return_data_hash->{delete_charKEYs}};

		# delete mappings in charTOword, wordTOannotate
		for(my $ctr=0; $ctr<@delete_charKEYs_arr; $ctr++) {
			delete_charTOword($LOCAL_blueprint_ptr,$delete_charKEYs_arr[$ctr]);
		}

		$return_status = 1;
		$return_msg = "deleteAnnotate successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "deleteAnnotate";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub computerAnnotate {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $annotateLanguage = $$LOCAL_server_ptr{CGIObj}->param("annotateLanguage");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$annotateLanguage = forceAlphanumeric($annotateLanguage,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	elsif($annotateLanguage=~m/^$/) { $return_status = 0; $return_msg = "annotateLanguage ($annotateLanguage) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my $selected_charKEYs_ptr = decode_json($$LOCAL_server_ptr{CGIObj}->param("selected_charKEYs"));
		my @selected_charKEYs_arr = @{$selected_charKEYs_ptr};
				
		my @delete_charKEYs_arr = ();
		my @add_charKEYs_arr = ();
		my @add_charVALi0s_arr = ();
		my @add_charVALi1s_arr = ();
		my @add_wordKEYs_arr = ();
		my @add_annotateDICTs_arr = ();
		my @add_annotatePRONOUNCEs_arr = ();
		my @add_annotateTEXTs_arr = ();
		my @add_annotateCHARSETs_arr = ();
		my @add_annotatePATTERNs_arr = ();

		my @possibleNew_charKEYs_arr = ();
		my $parser_str = "";
		for(my $ctr=0; $ctr<@selected_charKEYs_arr; $ctr++) {
			my $selected_charKEY = sprintf("%d",$selected_charKEYs_arr[$ctr]);
			
			# build array of any existing mappings to delete in charTOword, wordTOannotate
			if(exists $LOCAL_blueprint_ptr->{charTOword}->{$selected_charKEY}) {
				push(@delete_charKEYs_arr,$selected_charKEY);
			}
			
			# build array of possible new charKEYs (remove all whitespace)
			#  and string to submit to parser (translate all whitespace to spaces)
			my $selected_char = substr($LOCAL_blueprint_ptr->{charSTR},$selected_charKEY,1);
			if(!($selected_charKEY=~m/\s|\n/)) {
				push(@possibleNew_charKEYs_arr,$selected_charKEY);
				$parser_str .= $selected_char;
			}
			else { $parser_str .= " "; }
		}
		
		#if (defined($$LOCAL_server_ptr{CGISession}->param("username")) && ($$LOCAL_server_ptr{CGISession}->param("username"))=~m/^unam11$/)
		$parser_str =~ s/\s| |　|\.|・/N/g;
		$parser_str =~ s/\n/N/sg;
		
		# submit to parser, build add mappings arrays
		for($annotateLanguage) {
			if(/^jpn$/) {
				parser_jpn($LOCAL_server_ptr,$LOCAL_blueprint_ptr,$parser_str,\@add_charKEYs_arr,\@add_charVALi0s_arr,\@add_charVALi1s_arr,\@add_wordKEYs_arr,\@add_annotateDICTs_arr,\@add_annotatePRONOUNCEs_arr,\@add_annotateTEXTs_arr,\@add_annotateCHARSETs_arr,\@add_annotatePATTERNs_arr,\@possibleNew_charKEYs_arr);
			}
			elsif(/^chn$/) {
				parser_chn($LOCAL_server_ptr,$LOCAL_blueprint_ptr,$parser_str,\@add_charKEYs_arr,\@add_charVALi0s_arr,\@add_charVALi1s_arr,\@add_wordKEYs_arr,\@add_annotateDICTs_arr,\@add_annotatePRONOUNCEs_arr,\@add_annotateTEXTs_arr,\@add_annotateCHARSETs_arr,\@add_annotatePATTERNs_arr,\@possibleNew_charKEYs_arr);
			}
		}

		# delete mappings in charTOword, wordTOannotate
		for(my $ctr=0; $ctr<@delete_charKEYs_arr; $ctr++) {
			delete_charTOword($LOCAL_blueprint_ptr,$delete_charKEYs_arr[$ctr]);
		}
	
		# add mappings in charTOword
		for(my $ctr=0; $ctr<@add_charKEYs_arr; $ctr++) {
			add_charTOword($LOCAL_blueprint_ptr,$add_charKEYs_arr[$ctr],$add_charVALi0s_arr[$ctr],$add_charVALi1s_arr[$ctr]);
		}
	
		# add mappings in wordTOannotate
		for(my $ctr=0; $ctr<@add_wordKEYs_arr; $ctr++) {
			my $add_annotateDICT = $add_annotateDICTs_arr[$ctr];
			my $add_annotatePRONOUNCE = $add_annotatePRONOUNCEs_arr[$ctr];
			my $add_annotateTEXT = $add_annotateTEXTs_arr[$ctr];
			my $add_annotatePATTERN = $add_annotatePATTERNs_arr[$ctr];
			add_wordTOannotate($LOCAL_blueprint_ptr,$add_wordKEYs_arr[$ctr],$add_annotateDICT,$add_annotatePRONOUNCE,$add_annotateTEXT,$add_annotateCHARSETs_arr[$ctr],$add_annotatePATTERN);
		}
		
		my %return_data_hash = (delete_charKEYs			=> \@delete_charKEYs_arr,
								add_charKEYs			=> \@add_charKEYs_arr,
								add_charVALi0s			=> \@add_charVALi0s_arr,
								add_charVALi1s			=> \@add_charVALi1s_arr,
								add_wordKEYs			=> \@add_wordKEYs_arr,
								add_annotateDICTs		=> \@add_annotateDICTs_arr,
								add_annotatePRONOUNCEs	=> \@add_annotatePRONOUNCEs_arr,
								add_annotateTEXTs		=> \@add_annotateTEXTs_arr,
								add_annotateCHARSETs	=> \@add_annotateCHARSETs_arr,
								add_annotatePATTERNs	=> \@add_annotatePATTERNs_arr
		);
		
		$return_status = 1;
		$return_msg = "computerAnnotate successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "computerAnnotate";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub saveStar {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (starKEYs			=> decode_json($$LOCAL_server_ptr{CGIObj}->param("starKEYs")) );
		
		my @starKEYs_arr = @{%return_data_hash->{starKEYs}};
		for(my $ctr=0; $ctr<@starKEYs_arr; $ctr++) {
			$LOCAL_blueprint_ptr->{star}->{$starKEYs_arr[$ctr]} = "";
		}
	
		$return_status = 1;
		$return_msg = "saveStar successful";
		$return_data = encode_json(\@starKEYs_arr);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "saveStar";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub searchSentence {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $searchTxt = $$LOCAL_server_ptr{CGIObj}->param("searchTxt");
	my $searchLanguage = $$LOCAL_server_ptr{CGIObj}->param("searchLanguage");

	# force valid characters
	$searchLanguage = forceAlphanumeric($searchLanguage,"");

	# strip leading,trailing whitespace
	#$searchTxt = stripWhitespace($searchTxt);
	
	# check fields not null
	if($searchTxt=~m/^$/) { $return_status = 0; $return_msg = "searchTxt ($searchTxt) invalid"; $return_data = ""; }
	elsif($searchLanguage=~m/^$/) { $return_status = 0; $return_msg = "searchLanguage ($searchLanguage) invalid"; $return_data = ""; }
	else {
		my %return_sentences = ();
		
		for($searchLanguage) {
			if(/^jpn$/) {
				sentenceLookup_jpn($LOCAL_server_ptr,Encode::decode("utf8",$searchTxt),\%return_sentences);
			}
			elsif(/^chn$/) {
				sentenceLookup_chn($LOCAL_server_ptr,Encode::decode("utf8",$searchTxt),\%return_sentences);
			}
		}
	
		$return_status = 1;
		$return_msg = "searchSentence successful";
		$return_data = encode_json(\%return_sentences);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "searchSentence";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub newImageObj {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (objID			=> $$LOCAL_server_ptr{CGIObj}->param("objID"),
								objURL			=> $$LOCAL_server_ptr{CGIObj}->param("objURL"),
								objHeight		=> $$LOCAL_server_ptr{CGIObj}->param("objHeight"),
								objWidth		=> $$LOCAL_server_ptr{CGIObj}->param("objWidth"),
								objStartKEY		=> $$LOCAL_server_ptr{CGIObj}->param("objStartKEY")
		);

		my $objKEY = $return_data_hash{objID};
		my %objVAL = (	afterID		=> $return_data_hash{objStartKEY},
						type		=> "image",
						URL			=> $return_data_hash{objURL},
						height		=> $return_data_hash{objHeight},
						width		=> $return_data_hash{objWidth}
		);

		# update object count in hashsizes
		if(!(exists $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY})) {
			$LOCAL_blueprint_ptr->{hashsizes}->{objTOchar} = $LOCAL_blueprint_ptr->{hashsizes}->{objTOchar} + 1;
		}

		# delete upload file if any
		if(exists $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}) {
			my $uploadURL = $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{URL};
			if(!($uploadURL=~m/^$objVAL{URL}$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
		}

		# update mapping in objTOchar
		%{$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}} = %objVAL;
		
		$return_status = 1;
		$return_msg = "newImageObj successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "newImageObj";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub deleteImageObj {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (objID			=> $$LOCAL_server_ptr{CGIObj}->param("objID"));

		my $objKEY = $return_data_hash{objID};
		
		# delete upload file if any
		deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{URL});
		
		# delete mapping in objTOchar
		delete $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY};
		
		$return_status = 1;
		$return_msg = "deleteImageObj successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "deleteImageObj";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub newAudioObj {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (objID			=> $$LOCAL_server_ptr{CGIObj}->param("objID"),
								objURL			=> $$LOCAL_server_ptr{CGIObj}->param("objURL"),
								objStartKEY		=> $$LOCAL_server_ptr{CGIObj}->param("objStartKEY")
		);

		my $objKEY = $return_data_hash{objID};
		my %objVAL = (	afterID		=> $return_data_hash{objStartKEY},
						type		=> "audio",
						URL			=> $return_data_hash{objURL}
		);

		# update object count in hashsizes
		if(!(exists $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY})) {
			$LOCAL_blueprint_ptr->{hashsizes}->{objTOchar} = $LOCAL_blueprint_ptr->{hashsizes}->{objTOchar} + 1;
		}

		# delete upload file if any
		if(exists $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}) {
			my $uploadURL = $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{URL};
			if(!($uploadURL=~m/^$objVAL{URL}$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
		}

		# update mapping in objTOchar
		%{$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}} = %objVAL;
		
		$return_status = 1;
		$return_msg = "newAudioObj successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "newAudioObj";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}

sub deleteAudioObj {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	else {
		# strip arguments from CGI object
		my %return_data_hash = (objID			=> $$LOCAL_server_ptr{CGIObj}->param("objID"));

		my $objKEY = $return_data_hash{objID};

		# delete upload file if any
		deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$LOCAL_blueprint_ptr->{objTOchar}->{$objKEY}->{URL});

		# delete mapping in objTOchar
		delete $LOCAL_blueprint_ptr->{objTOchar}->{$objKEY};
		
		$return_status = 1;
		$return_msg = "deleteAudioObj successful";
		$return_data = encode_json(\%return_data_hash);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "deleteAudioObj";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{return_data} = $return_data;
}


sub add_charTOword {

	my $LOCAL_blueprint_ptr = shift;
		
	my $charKEY = shift;
	my $charVALi0 = shift;
	my $charVALi1 = shift;
	
	if(!(exists $LOCAL_blueprint_ptr->{charTOword}->{$charKEY})) {
		$LOCAL_blueprint_ptr->{hashsizes}->{charTOword} = $LOCAL_blueprint_ptr->{hashsizes}->{charTOword} + 1;
	}
	
	@{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}} = ( $charVALi0, $charVALi1 );
}

sub add_wordTOannotate {

	my $LOCAL_blueprint_ptr = shift;

	my $wordKEY = shift;
	my $wordVAL_dict = shift;
	my $wordVAL_pronounce = shift;
	my $wordVAL_text = shift;
	my $wordVAL_charset = shift;
	my $wordVAL_pattern = shift;
	
	if(!(exists $LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY})) {
		$LOCAL_blueprint_ptr->{hashsizes}->{wordTOannotate} = $LOCAL_blueprint_ptr->{hashsizes}->{wordTOannotate} + 1;
	}
	
	%{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}} = (
			dict		=> $wordVAL_dict,
			pronounce	=> $wordVAL_pronounce,
			text		=> $wordVAL_text,
			charset		=> $wordVAL_charset,
			pattern		=> $wordVAL_pattern
	);
}

sub delete_charTOword {

	my $LOCAL_blueprint_ptr = shift;
	
	my $charKEY = shift;
	
	if(!(exists $LOCAL_blueprint_ptr->{charTOword}->{$charKEY})) { return; }
	
	my @charVAL = @{$LOCAL_blueprint_ptr->{charTOword}->{$charKEY}};
	my $wordKEY = $charVAL[0];
	my $wordVAL_charsetKEY = $charVAL[1];
	
	my %wordVAL_charset = %{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}};
	my @wordVAL_charsetVAL = @{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY}};
	
	# there are other chars in this charset val array
	if(@wordVAL_charsetVAL>1) {
		@{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY}} = grep {$_ ne $charKEY} @{$LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY}};
	}
	
	# there are other charset arrays in this word val
	elsif((keys %wordVAL_charset)>1) {
		delete $LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY}->{charset}->{$wordVAL_charsetKEY};
	}
	
	# this is the last character for this word
	else {
		delete_wordTOannotate($LOCAL_blueprint_ptr,$wordKEY);
	}
	
	delete $LOCAL_blueprint_ptr->{charTOword}->{$charKEY};
	
	$LOCAL_blueprint_ptr->{hashsizes}->{charTOword} = $LOCAL_blueprint_ptr->{hashsizes}->{charTOword} - 1;
}

sub delete_wordTOannotate {

	my $LOCAL_blueprint_ptr = shift;
	
	my $wordKEY = shift;
	
	if(!(exists $LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY})) { return; }
	
	delete $LOCAL_blueprint_ptr->{wordTOannotate}->{$wordKEY};
	
	#$LOCAL_blueprint_ptr->{hashsizes}->{wordTOannotate} = $LOCAL_blueprint_ptr->{hashsizes}->{wordTOannotate} - 1;
}


sub parser_jpn {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my $parser_str = shift;
	my $add_charKEYs_arr_ptr = shift;
	my $add_charVALi0s_arr_ptr = shift;
	my $add_charVALi1s_arr_ptr = shift;
	my $add_wordKEYs_arr_ptr = shift;
	my $add_annotateDICTs_arr_ptr = shift;
	my $add_annotatePRONOUNCEs_arr_ptr = shift;
	my $add_annotateTEXTs_arr_ptr = shift;
	my $add_annotateCHARSETs_arr_ptr = shift;
	my $add_annotatePATTERNs_arr_ptr = shift;
	my $possibleNew_charKEYs_arr_ptr = shift;

	# submit to parser : no arguments
	my $mecab = Text::MeCab->new("");
	my $parsernoarg_str = $parser_str;
	$parsernoarg_str =~ s/\n|\s|。|，|,|！|…|!|《|》|<|>|\"|\'|:|：|？|\?|、|\||“|”|‘|’|；|—|（|）|·|\(|\)|　/\./g;
	
	my $node = $mecab->parse($parsernoarg_str);
	$parsernoarg_str = undef;
	
	# set query encoding to utf-8 (?? not sure why still need this)
	my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare("SET NAMES 'utf8'") or die;
	$query_handle->execute();
	
	# prepare query for dictionary lookup
	my $query_str = "SELECT defn, pron FROM `dictionary_jpn` ";
	$query_str .= "WHERE `word` = ?;";
	$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
	
	# build add mappings arrays
	my $new_charIndex_ctr = 0;
	my $new_wordKEY = sprintf("%d",$LOCAL_blueprint_ptr->{hashsizes}->{wordTOannotate});
	for(; $node; $node = $node->next) {

		my $parser_output_str = Encode::decode("utf8",$node->surface);
		if(Encode::encode("utf8",$parser_output_str)=~m/\.|\n|\s|。|，|,|！|…|!|《|》|<|>|\"|\'|:|：|？|\?|、|\||“|”|‘|’|；|—|（|）|·|\(|\)|　/) {
			$new_charIndex_ctr = $new_charIndex_ctr + length($parser_output_str); next;
		}
		
		my $parser_output_feature = Encode::decode("utf8",$node->feature);
		my @parser_output_tags = split(/,/,$parser_output_feature);
		my $parser_ptspeech = $parser_output_tags[0];
		my $parser_numberindicator = $parser_output_tags[1];
		my $parser_dict = $parser_output_tags[6];
		my $parser_pronounce = $parser_output_tags[7];
		
		if(Encode::encode("utf8",$parser_ptspeech)=~m/記号|助動詞|助詞|NOFOUND|EOS|BOS/ || Encode::encode("utf8",$parser_numberindicator)=~m/数/ || @parser_output_tags<9 || $parser_dict=~m/\*/ || $parser_pronounce=~m/\*/) {
			$new_charIndex_ctr = $new_charIndex_ctr + length($parser_output_str); next;
		}
		
		push(@{$add_wordKEYs_arr_ptr},$new_wordKEY);
		push(@{$add_annotateDICTs_arr_ptr},$parser_dict);

		# lookup definition in database
		$query_handle->execute("$parser_dict");
		
		if($query_handle->rows>0) {
			my @query_arr = $query_handle->fetchrow_array();
			
			# replace parser pronunciation with dictionary pronunciation
			$parser_pronounce = Encode::decode("utf8",$query_arr[1]);
			
			push(@{$add_annotateTEXTs_arr_ptr},$query_arr[0]);
		}
		else {
			push(@{$add_annotateTEXTs_arr_ptr},"no definition found.");
			
			# don't show parser pronunciation
			#   (maybe instead should convert katakana -> hiragana and then display?)
			$parser_pronounce = "";
		}
		push(@{$add_annotatePRONOUNCEs_arr_ptr},$parser_pronounce);
		
		my @new_charsetARR = ();
		for(my $charset_ctr=0; $charset_ctr<length($parser_output_str); $charset_ctr++) {
			my $new_charKEY = @{$possibleNew_charKEYs_arr_ptr}[$new_charIndex_ctr];
			
			push(@{$add_charKEYs_arr_ptr},$new_charKEY);
			push(@{$add_charVALi0s_arr_ptr},$new_wordKEY);
			push(@{$add_charVALi1s_arr_ptr},0);
			push(@new_charsetARR,$new_charKEY);
			
			$new_charIndex_ctr++;
		}
		my %new_charsetHASH = ( 0 => \@new_charsetARR );
		push(@{$add_annotateCHARSETs_arr_ptr},\%new_charsetHASH);
		
		my %new_patternHASH = ( 0 => $parser_output_str );
		push(@{$add_annotatePATTERNs_arr_ptr},\%new_patternHASH);
		
		$new_wordKEY++;
	}

}

sub parser_chn {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my $parser_str = shift;
	my $add_charKEYs_arr_ptr = shift;
	my $add_charVALi0s_arr_ptr = shift;
	my $add_charVALi1s_arr_ptr = shift;
	my $add_wordKEYs_arr_ptr = shift;
	my $add_annotateDICTs_arr_ptr = shift;
	my $add_annotatePRONOUNCEs_arr_ptr = shift;
	my $add_annotateTEXTs_arr_ptr = shift;
	my $add_annotateCHARSETs_arr_ptr = shift;
	my $add_annotatePATTERNs_arr_ptr = shift;
	my $possibleNew_charKEYs_arr_ptr = shift;

	# submit to parser : no arguments
	my $segstr = $parser_str;
	$segstr =~ s/\n|\s|。|，|,|！|…|!|《|》|<|>|\"|\'|:|：|？|\?|、|\||“|”|‘|’|；|—|（|）|·|\(|\)|　/\./g;
	#$ENV{PATH} = "";
	my $parser_output = `/var/www/cgi-bin/parser_chn.py $segstr`;
	my @parser_output_lines = split(/\n/s,$parser_output);

	# set query encoding to utf-8 (?? not sure why still need this)
	my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare("SET NAMES 'utf8'") or die;
	$query_handle->execute();
	
	# prepare query for dictionary lookup
	my $query_str = "SELECT * FROM `dictionary_chn` ";
	$query_str .= "WHERE `simp` REGEXP ?;";
	$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;

	# build add mappings arrays
	my $new_charIndex_ctr = 0;
	my $new_wordKEY = sprintf("%d",$LOCAL_blueprint_ptr->{hashsizes}->{wordTOannotate});
	for(my $ctr=0; $ctr<@parser_output_lines; $ctr++) {
	
		my $parser_output_str = Encode::decode("utf8",$parser_output_lines[$ctr]);
		if(Encode::encode("utf8",$parser_output_str)=~m/\.|\n|\s|。|，|,|！|…|!|《|》|<|>|\"|\'|:|：|？|\?|、|\||“|”|‘|’|；|—|（|）|·|\(|\)|　/) {
			$new_charIndex_ctr = $new_charIndex_ctr + length($parser_output_str); next;
			next;
		}
		
		push(@{$add_wordKEYs_arr_ptr},$new_wordKEY);
		push(@{$add_annotateDICTs_arr_ptr},$parser_output_str);
		
		# lookup definition in database
		$query_handle->execute("^$parser_output_str\$");
		
		if($query_handle->rows>0) {
			my @query_arr = $query_handle->fetchrow_array();
			push(@{$add_annotatePRONOUNCEs_arr_ptr},Encode::decode("utf8",$query_arr[3]));
			push(@{$add_annotateTEXTs_arr_ptr},Encode::decode("utf8",$query_arr[5]));
		}
		else {
			push(@{$add_annotatePRONOUNCEs_arr_ptr},"");
			push(@{$add_annotateTEXTs_arr_ptr},"no definition found.");
		}
		
		my @new_charsetARR = ();
		for(my $charset_ctr=0; $charset_ctr<length($parser_output_str); $charset_ctr++) {
			my $new_charKEY = @{$possibleNew_charKEYs_arr_ptr}[$new_charIndex_ctr];
			
			push(@{$add_charKEYs_arr_ptr},$new_charKEY);
			push(@{$add_charVALi0s_arr_ptr},$new_wordKEY);
			push(@{$add_charVALi1s_arr_ptr},0);
			push(@new_charsetARR,$new_charKEY);
			
			$new_charIndex_ctr++;
		}
		my %new_charsetHASH = ( 0 => \@new_charsetARR );
		push(@{$add_annotateCHARSETs_arr_ptr},\%new_charsetHASH);
		
		my %new_patternHASH = ( 0 => $parser_output_str );
		push(@{$add_annotatePATTERNs_arr_ptr},\%new_patternHASH);
		
		$new_wordKEY++;
	}
	
}


sub sentenceLookup_jpn {

	my $LOCAL_server_ptr = shift;
	my $searchTxt = shift;
	my $return_sentences_ptr = shift;
	
	# set query encoding to utf-8 (?? not sure why still need this)
	my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare("SET NAMES 'utf8'") or die;
	$query_handle->execute();
	
	my $query_str = "SELECT * FROM sentences_jpn ";
	$query_str .= "WHERE japanese REGEXP \'$searchTxt\' OR english REGEXP \'$searchTxt\';";
	$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str);
	$query_handle->execute();
	while (my @data = $query_handle->fetchrow_array()) {
		my $sent_id = $data[0];
		my $sent_eng = Encode::decode("utf8",$data[1]);
		my $sent_jpn = Encode::decode("utf8",$data[2]);
		$return_sentences_ptr->{$sent_id} = $sent_jpn."<br>".$sent_eng;
	}
}

sub sentenceLookup_chn {

	my $LOCAL_server_ptr = shift;
	my $searchTxt = shift;
	my $return_sentences_ptr = shift;
	
	# set query encoding to utf-8 (?? not sure why still need this)
	my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare("SET NAMES 'utf8'") or die;
	$query_handle->execute();
	
	my $query_str = "SELECT * FROM sentences_chn ";
	$query_str .= "WHERE simp REGEXP \'$searchTxt\' OR trad REGEXP \'$searchTxt\' OR english REGEXP \'$searchTxt\';";
	$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str);
	$query_handle->execute();
	while (my @data = $query_handle->fetchrow_array()) {
		my $sent_id = $data[0];
		my $sent_eng = Encode::decode("utf8",$data[1]);
		#my $sent_trad = Encode::decode("utf8",$data[2]);
		my $sent_simp = Encode::decode("utf8",$data[3]);
		#my $sent_pinyin = Encode::decode("utf8",$data[4]);
		$return_sentences_ptr->{$sent_id} = $sent_simp."<br>".$sent_eng;
	}
}


sub deleteUploadFile {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $fileURL = shift;
		
	# check file URL is from this website
	my $webURL = $$LOCAL_state_ptr{webURL};
	if($fileURL=~m/^$webURL\/user\-(upload\-audio|record\-audio|upload\-image)\/(.*?)\.(.*)$/) {
		my $uploadType = $1;
		my $uploadID = $2;
		my $uploadExt = $3;

		# lookup in upload files db
		my $query_str = "DELETE FROM upload_files ";
		$query_str .= "WHERE blueprintid=? AND uploadid=? AND type=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($$LOCAL_state_ptr{blueprintid},$uploadID,$uploadType);
		
		# delete if found db record
		if($query_handle->rows==1) { unlink("/blueprints_volume/user-files/$uploadType/$uploadID.$uploadExt"); }
	}
}

sub checkCanEdit {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	
	# lookup files user owns, shares, or is sharing (by another user)
	my $query_str = "SELECT * FROM `share` sh ";
	$query_str .= "LEFT JOIN `user` us ON us.`userid`=sh.`userid` ";
	$query_str .= "WHERE sh.`blueprintid`=? AND us.`username`=?;";
	my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
	$query_handle->execute($$LOCAL_state_ptr{blueprintid},$$LOCAL_state_ptr{username});
	
	# if no, then set logged_in to 0 (editing will be disabled, but session is preserved)
	if($query_handle->rows<1) { $$LOCAL_state_ptr{logged_in} = 0; }
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


sub forceAlphanumeric {
	my $input_str = shift;
	my $allowed_chars = shift;

	my $output_str;
	if($input_str =~ m/([\w\d$allowed_chars]+)/) { $output_str = $1; }
	else { $output_str = ""; }
	
	return $output_str;
}

