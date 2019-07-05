#!/usr/bin/perl -wT

# drill index page (openLesson, createLesson, editQuestion, rearrangeQuestions, deleteQuestion, editInstructions)

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;
use Encode;

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
		redirectURL		=> $GLOBAL_server{CGIObj}->param("redirectURL") ? $GLOBAL_server{CGIObj}->param("redirectURL") : "http://language-assistant.org/cgi-bin/drill.cgi",
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
	if(/^openLesson$/)					{ openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
	elsif(!$GLOBAL_state{logged_in})	{ openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
	elsif(/^createLesson$/)				{
											createDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^editQuestion$/)				{
											openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											editQuestion(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^rearrangeQuestions$/)		{
											openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											rearrangeQuestions(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^deleteQuestion$/)			{
											openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											deleteQuestion(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	elsif(/^editInstructions$/)			{
											openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											editInstructions(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint);
											if($GLOBAL_state{status}==1) { saveDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
										}
	else								{ openDrill(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprint); }
}

# disconnect from database
connectDatabase(\%GLOBAL_server,0);

# generate JSON string
my $GLOBAL_JSONstate = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_state);
my $GLOBAL_JSONblueprint = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_blueprint);

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
										print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,\$GLOBAL_JSONblueprint);
									}
	}
	else						{
									print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
									print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,\$GLOBAL_JSONblueprint);
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
		<title>L-A Drills</title>
	    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/account.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/openutils.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/opendrill.js"></script>

		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-1.9.1.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-ui-1.10.1.custom.js"></script>
		
		<script type="text/javascript" src="$$LOCAL_state_ptr{webURL}/js/jRecorder.js"></script>
		<script type="text/javascript" src="$$LOCAL_state_ptr{webURL}/js/recorder2.js"></script>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/jquery-ui-1.10.1.custom.css"/>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_style.css"/>
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/lookup.css" />
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_dokkai.css" />
	</head>

	<body onload='checkJS_account(); checkJS_opendrill(); parseJSON_opendrill();'>
	
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
			<!--<img src="$$LOCAL_state_ptr{webURL}/icons/ginko2.png" class="headerimage" width="1101" height="46" alt=""/>--!>
		</header>
		
		<div id="wrap">
			<div class="content" class="full-width">
			
				<article id="index_article">
					<div class="single-entry-content" id="opendrill_div">
					
					</div>
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
		var GLOBAL_JSONlesson = $$LOCAL_JSONblueprint_ptr;
	</script>
	
	</body>
</html>
END_HTML

	return $pageHTML;
}


sub openDrill {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	else {
				
		# open JSON file
		my $jsonfile_str;
		{
			local $/; #Enable 'slurp' mode
			open my $fh, "<:utf8", "/blueprints_volume/blueprint/drill/$blueprintid.json" or die "$!";
			$jsonfile_str = <$fh>;
			close $fh;
		}
		
		# decode_json returns a hash (or object) reference
		my $decodedjson_hashref = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->decode($jsonfile_str);

		# LOCAL_blueprint_ptr is a reference to GLOBAL_blueprint_ptr,
		# so need to set the value pointed at by GLOBAL_blueprint_ptr, to the value pointed at by decodedjson_hashref.
		# $LOCAL_blueprint_ptr = $decodedjson_hashref does not work because it doesn't affect the GLOBAL_ variable
		# passed as an argument to this subroutine.
		%$LOCAL_blueprint_ptr = %$decodedjson_hashref;
		
		$return_status = 1;
		$return_msg = "opened drill";
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	
	# mask logged_in boolean if user doesn't own or share this blueprint
	checkCanEdit($LOCAL_server_ptr,$LOCAL_state_ptr);
	
	$$LOCAL_state_ptr{action} = "openDrill";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub createDrill {

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
		$query_str .= "SELECT us.`userid`,'drill','untitled drill' ";
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
		my %empty_blueprint = ( instructions => { text=>"", audio=>"", image=>{URL=>"",height=>0,width=>0} } );

		$return_status = 1;
		$return_msg = "created drill";
		
		$$LOCAL_state_ptr{blueprintid} = $blueprintid;
		%$LOCAL_blueprint_ptr = %empty_blueprint;
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "createDrill";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub saveDrill {

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
		# build blueprint JSON
		my $blueprint_JSONstr = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode($LOCAL_blueprint_ptr);
	
		# write JSON file
		open(DRILLFILE,">:utf8","/blueprints_volume/blueprint/drill/$blueprintid.json") or die "$!";
		print DRILLFILE $blueprint_JSONstr;
		close DRILLFILE;

		$return_status = 1;
		$return_msg = $$LOCAL_state_ptr{message};
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}


sub editQuestion {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $drillid = $$LOCAL_server_ptr{CGIObj}->param("drillid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$drillid = forceAlphanumeric($drillid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	elsif($drillid=~m/^$/) { $return_status = 0; $return_msg = "drillid ($drillid) invalid"; $return_data = ""; }
	else {
		
		# strip fields from CGI object
		my $Q_text = $$LOCAL_server_ptr{CGIObj}->param("Q-text");
		my $Q_image_url = $$LOCAL_server_ptr{CGIObj}->param("Q-image-url");
		my $Q_image_height = $$LOCAL_server_ptr{CGIObj}->param("Q-image-height");
		my $Q_image_width = $$LOCAL_server_ptr{CGIObj}->param("Q-image-width");
		my $Q_audio = $$LOCAL_server_ptr{CGIObj}->param("Q-audio");
		
		my $R_na = $$LOCAL_server_ptr{CGIObj}->param("R-na");
		my $R_text_show = $$LOCAL_server_ptr{CGIObj}->param("R-text-show");
		my $R_text_answer = $$LOCAL_server_ptr{CGIObj}->param("R-text-answer");
		my $R_audio_show = $$LOCAL_server_ptr{CGIObj}->param("R-audio-show");
		my $R_mc_show = $$LOCAL_server_ptr{CGIObj}->param("R-mc-show");
		my $R_mc_choices = $$LOCAL_server_ptr{CGIObj}->param("R-mc-choices");
		my $R_mc_answer = $$LOCAL_server_ptr{CGIObj}->param("R-mc-answer");

		my $E_na = $$LOCAL_server_ptr{CGIObj}->param("E-na");
		my $E_text = $$LOCAL_server_ptr{CGIObj}->param("E-text");
		my $E_image_url = $$LOCAL_server_ptr{CGIObj}->param("E-image-url");
		my $E_image_height = $$LOCAL_server_ptr{CGIObj}->param("E-image-height");
		my $E_image_width = $$LOCAL_server_ptr{CGIObj}->param("E-image-width");
		my $E_audio = $$LOCAL_server_ptr{CGIObj}->param("E-audio");
		
		# build new hash
		my %Q_image = ( URL=>$Q_image_url, height=>$Q_image_height, width=>$Q_image_width );
		
		$R_na = ($R_na=~m/^0$/) ? 0 : 1;
		$R_text_show = ($R_text_show=~m/^0$/) ? 0 : 1;
		$R_audio_show = ($R_audio_show=~m/^0$/) ? 0 : 1;
		$R_mc_show = ($R_mc_show=~m/^0$/) ? 0 : 1;
		my %R_text = ( show=>$R_text_show, answer=>$R_text_answer );
		my %R_audio = ( show=>$R_audio_show );
		my @R_mc_choices_array = split(/::SPLIT::/,$R_mc_choices);
		my %R_mc = ( show=>$R_mc_show, choices=>\@R_mc_choices_array, answer=>$R_mc_answer );
		
		$E_na = ($E_na=~m/^0$/) ? 0 : 1;
		my %E_image = ( URL=>$E_image_url, height=>$E_image_height, width=>$E_image_width );
		
		my %Q_hash = ( text=>$Q_text, image=>\%Q_image, audio=>$Q_audio );
		my %R_hash = ( na=>$R_na, text=>\%R_text, audio=>\%R_audio, mc=>\%R_mc );
		my %E_hash = ( na=>$E_na, text=>$E_text, image=>\%E_image, audio=>$E_audio );
		
		my %QRE_hash = ( QUESTION=>\%Q_hash, RESPONSE=>\%R_hash, EXPLAIN=>\%E_hash );
		
		# delete upload files if any
		if(exists $LOCAL_blueprint_ptr->{$drillid}) {
		
			my $uploadURL = $LOCAL_blueprint_ptr->{$drillid}->{QUESTION}->{image}->{URL};
			if(!($uploadURL=~m/^$Q_hash{image}->{URL}$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
			
			$uploadURL = $LOCAL_blueprint_ptr->{$drillid}->{QUESTION}->{audio};
			if(!($uploadURL=~m/^$Q_hash{audio}$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }

			$uploadURL = $LOCAL_blueprint_ptr->{$drillid}->{EXPLAIN}->{image}->{URL};
			if(!($uploadURL=~m/^$E_hash{image}->{URL}$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
			
			$uploadURL = $LOCAL_blueprint_ptr->{$drillid}->{EXPLAIN}->{audio};
			if(!($uploadURL=~m/^$E_hash{audio}$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
		}
		
		# update global lesson hash
		%{$LOCAL_blueprint_ptr->{$drillid}} = %QRE_hash;
		
		$return_status = 1;
		$return_msg = "editQuestion successful";
		$return_data = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode(\%QRE_hash);
		
	} #end.. check fields not null

	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{drillid} = $drillid;
	$$LOCAL_state_ptr{return_data} = $return_data;	
	$$LOCAL_state_ptr{action} = "editQuestion";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub rearrangeQuestions {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $newOrder = $$LOCAL_server_ptr{CGIObj}->param("newOrder");
	
	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$newOrder = forceAlphanumeric($newOrder,"\[\],");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	elsif($newOrder=~m/^$/) { $return_status = 0; $return_msg = "newOrder ($newOrder) invalid"; $return_data = ""; }
	else {
	
		my @newOrder_array = @{$$LOCAL_server_ptr{JSON_utf8}->utf8(0)->decode($newOrder)};
		
		my %rearrange_lesson_hash = ();
		$rearrange_lesson_hash{instructions} = $LOCAL_blueprint_ptr->{instructions};
		
		my $ctr = 0;
		foreach my $rearrange_ctr (@newOrder_array) {
			$rearrange_lesson_hash{$ctr} = $LOCAL_blueprint_ptr->{$rearrange_ctr};
			$ctr = $ctr +1;
		}
		
		# update global lesson hash
		%$LOCAL_blueprint_ptr = %rearrange_lesson_hash;
		
		$return_status = 1;
		$return_msg = "rearrangeQuestions successful";
		$return_data = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode(\@newOrder_array);
	
	} #end.. check fields not null

	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{return_data} = $return_data;
	$$LOCAL_state_ptr{action} = "rearrangeQuestions";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub deleteQuestion {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprint_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI object
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $drillid = $$LOCAL_server_ptr{CGIObj}->param("drillid");

	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$drillid = forceAlphanumeric($drillid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_data = ""; }
	elsif($drillid=~m/^$/) { $return_status = 0; $return_msg = "drillid ($drillid) invalid"; $return_data = ""; }
	else {
	
		my $num_questions = keys(%$LOCAL_blueprint_ptr) -1;
	
		my %delete_lesson_hash = ();
		$delete_lesson_hash{instructions} = $LOCAL_blueprint_ptr->{instructions};
		
		my @delete_keys_array = ();
		
		my $delete_ctr = 0;
		for(my $ctr=0; $ctr<$num_questions; $ctr++) {
			if($drillid=~m/^$ctr$/) { next; }
			else {
				$delete_lesson_hash{$delete_ctr} = $LOCAL_blueprint_ptr->{$ctr};
				$delete_ctr = $delete_ctr +1;
				
				push(@delete_keys_array,$ctr);
			}
		}
		
		# delete upload files if any
		if(exists $LOCAL_blueprint_ptr->{$drillid}) {
			deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$LOCAL_blueprint_ptr->{$drillid}->{QUESTION}->{image}->{URL});
			deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$LOCAL_blueprint_ptr->{$drillid}->{QUESTION}->{audio});
			deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$LOCAL_blueprint_ptr->{$drillid}->{EXPLAIN}->{image}->{URL});
			deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$LOCAL_blueprint_ptr->{$drillid}->{EXPLAIN}->{audio});
		}
		
		# update global lesson hash
		%$LOCAL_blueprint_ptr = %delete_lesson_hash;
		
		$return_status = 1;
		$return_msg = "deleteQuestion successful";
		$return_data = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode(\@delete_keys_array);
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{return_data} = $return_data;
	$$LOCAL_state_ptr{action} = "rearrangeQuestions";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub editInstructions {

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
		
		# strip fields from CGI object
		my $I_text = $$LOCAL_server_ptr{CGIObj}->param("I-text");
		my $I_image_url = $$LOCAL_server_ptr{CGIObj}->param("I-image-url");
		my $I_image_height = $$LOCAL_server_ptr{CGIObj}->param("I-image-height");
		my $I_image_width = $$LOCAL_server_ptr{CGIObj}->param("I-image-width");
		my $I_audio = $$LOCAL_server_ptr{CGIObj}->param("I-audio");
		
		# build new hash
		my %I_image = ( URL=>$I_image_url, height=>$I_image_height, width=>$I_image_width );

		my %I_hash = ( text=>$I_text, image=>\%I_image, audio=>$I_audio );
		
		# delete upload files if any
		if(exists $LOCAL_blueprint_ptr->{instructions}) {
		
			my $uploadURL = $LOCAL_blueprint_ptr->{instructions}->{image}->{URL};
			if(!($uploadURL=~m/^$I_image_url$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
			
			$uploadURL = $LOCAL_blueprint_ptr->{instructions}->{audio};
			if(!($uploadURL=~m/^$I_audio$/)) { deleteUploadFile($LOCAL_server_ptr,$LOCAL_state_ptr,$uploadURL); }
		}
		
		# update global lesson hash
		%{$LOCAL_blueprint_ptr->{instructions}} = %I_hash;
		
		$return_status = 1;
		$return_msg = "editInstructions successful";
		$return_data = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode(\%I_hash);	
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{return_data} = $return_data;
	$$LOCAL_state_ptr{action} = "editInstructions";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
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
