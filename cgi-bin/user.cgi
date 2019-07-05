#!/usr/bin/perl -wT

# user functions (getUser, listLessons, renameLesson, deleteLesson, shareLesson, deleteShare, rearrangeLessons)

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;
use File::Glob ':glob';
use File::Copy;

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
		redirectURL		=> $GLOBAL_server{CGIObj}->param("redirectURL") ? $GLOBAL_server{CGIObj}->param("redirectURL") : "http://language-assistant.org/cgi-bin/user.cgi",
		logged_in		=> 0,
		
		action			=> $GLOBAL_server{CGIObj}->param("action") ? $GLOBAL_server{CGIObj}->param("action") : "",
		status			=> 0,
		message			=> ""
	);

# create GLOBAL blueprint list
my %GLOBAL_blueprintList = ();

# refresh session
refreshSession(\%GLOBAL_server,\%GLOBAL_state);

# connect to database
connectDatabase(\%GLOBAL_server,1);

# execute requested action
for($GLOBAL_state{action}) {
	if(/^getUser$/)						{ getUser(\%GLOBAL_state); }
	elsif(/^listLessons$/)				{ listLessons(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprintList); }
	elsif(!$GLOBAL_state{logged_in})	{ getUser(\%GLOBAL_state); }
	elsif(/^renameLesson$/)				{
											renameLesson(\%GLOBAL_server,\%GLOBAL_state);
											listLessons(\%GLOBAL_server,\%0,\%GLOBAL_blueprintList);
											$GLOBAL_state{action} = "listLessons";
										}
	elsif(/^deleteLesson$/)				{
											deleteLesson(\%GLOBAL_server,\%GLOBAL_state);
											listLessons(\%GLOBAL_server,\%0,\%GLOBAL_blueprintList);
											$GLOBAL_state{action} = "listLessons";
										}
	elsif(/^copyLesson$/)				{
											copyLesson(\%GLOBAL_server,\%GLOBAL_state);
											listLessons(\%GLOBAL_server,\%0,\%GLOBAL_blueprintList);
											$GLOBAL_state{action} = "listLessons";
										}
	elsif(/^shareLesson$/)				{
											shareLesson(\%GLOBAL_server,\%GLOBAL_state);
											listLessons(\%GLOBAL_server,\%0,\%GLOBAL_blueprintList);
											$GLOBAL_state{action} = "listLessons";
										}
	elsif(/^deleteShare$/)				{
											deleteShare(\%GLOBAL_server,\%GLOBAL_state);
											listLessons(\%GLOBAL_server,\%0,\%GLOBAL_blueprintList);
											$GLOBAL_state{action} = "listLessons";
										}
	elsif(/^rearrangeLessons$/)			{
											rearrangeLessons(\%GLOBAL_server,\%GLOBAL_state);
											listLessons(\%GLOBAL_server,\%0,\%GLOBAL_blueprintList);
											$GLOBAL_state{action} = "listLessons";
										}
	else								{ listLessons(\%GLOBAL_server,\%GLOBAL_state,\%GLOBAL_blueprintList); }
}

# disconnect from database
connectDatabase(\%GLOBAL_server,0);

# generate JSON string
my $GLOBAL_JSONstate = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_state);
my $GLOBAL_JSONblueprintList = $GLOBAL_server{JSON_utf8}->utf8(0)->encode(\%GLOBAL_blueprintList);

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
										print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,\$GLOBAL_JSONblueprintList);
									}
	}
	else						{
									print $GLOBAL_server{CGIObj}->header(-charset=>'utf-8',-cookie=>$GLOBAL_server{CGICookie});
									print generateHTML(\%GLOBAL_state,\$GLOBAL_JSONstate,\$GLOBAL_JSONblueprintList);
								}
}





sub generateHTML {

	my $LOCAL_state_ptr = shift;
	my $LOCAL_JSONstate_ptr = shift;
	my $LOCAL_JSONblueprintList_ptr = shift;

my $pageHTML = <<END_HTML;
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="en-US" xml:lang="en">
	<head>
		<title>L-A User Pages</title>
	    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
	    <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/account.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/user.js"></script>

		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-1.9.1.js"></script>
		<script type="text/javascript" charset="utf-8" src="$$LOCAL_state_ptr{webURL}/js/jquery-ui-1.10.1.custom.js"></script>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/jquery-ui-1.10.1.custom.css"/>
		
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_style.css"/>
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/lookup.css" />
		<link rel="stylesheet" type="text/css" charset="utf-8" media="screen" href="$$LOCAL_state_ptr{webURL}/css/yoko_dokkai.css" />
	</head>

	<body onload='checkJS_account(); checkJS_user(); parseJSON_user();'>

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
				<h1><a id="site_title_button" href="$$LOCAL_state_ptr{webURL}/cgi-bin/user.cgi">L-A User Pages</a></h1>
				<h2 id="site_description">user home page</h2>
			</hgroup>
			<img src="$$LOCAL_state_ptr{webURL}/icons/ginko2.png" class="headerimage" width="1101" height="46" alt=""/>
		</header>
		<div id="wrap">
			<div class="content" class="full-width">

				<article id="index_article">
					<div class="single-entry-content" id="userpage_div">
					</div>
				</article>
			</div>
		</div>
		<span style='float:right;font-size:13px;color:#CCC'><a href="mailto:info\@language-assistant.org" style='color:#777'>Contact Us</a></span>
	</div>

	<script type='text/javascript'>
		var GLOBAL_JSONstate = $$LOCAL_JSONstate_ptr;
		var GLOBAL_JSONlessons = $$LOCAL_JSONblueprintList_ptr;
	</script>
	
	</body>
</html>

END_HTML

	return $pageHTML;
}


sub getUser {

	my $LOCAL_state_ptr = shift;

	$$LOCAL_state_ptr{action} = "getUser";
	$$LOCAL_state_ptr{status} = 1;
}

sub listLessons {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my $LOCAL_blueprintList_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI session object
	my $searchUsername = $$LOCAL_server_ptr{CGIObj}->param("username");
	my $sessionUsername = $$LOCAL_server_ptr{CGISession}->param("username");
	
	# force valid characters
	$searchUsername = forceAlphanumeric($searchUsername,"\.");
	$sessionUsername = forceAlphanumeric($sessionUsername,"\.");
	
	my $username = $searchUsername ? $searchUsername : $sessionUsername;
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
	else {
		
		# lookup files user owns, shares, or is sharing (by another user)
		my $query_str = "SELECT bp.`blueprintid`,bp.`name`,bp.`type`,usbp.`username` AS `owner`,ussh.`username`, ";
		$query_str .= "(sh.`userid`=bp.`ownerid`) AS `owner_bool`,(ussh.`username`=?) AS `user_bool`,sh.`listindex` ";
		$query_str .= "FROM `share` sh ";
		$query_str .= "LEFT JOIN `user` ussh ON ussh.`userid`=sh.`userid` ";
		$query_str .= "LEFT JOIN `blueprint` bp ON bp.`blueprintid`=sh.`blueprintid` ";
		$query_str .= "LEFT JOIN `user` usbp ON usbp.`userid`=bp.`ownerid` ";
		$query_str .= "WHERE usbp.`username`=? OR ussh.`username`=? ";
		$query_str .= "OR EXISTS ( SELECT * FROM `share` shei ";
		$query_str .= "LEFT JOIN `user` usei ON shei.`userid`=usei.`userid` ";
		$query_str .= "WHERE shei.`blueprintid`=bp.`blueprintid` AND usei.`username`=? );";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($username,$username,$username,$username);
		
		# if valid user, then return userid
		if($query_handle->rows<1) { $return_status = 0; $return_msg = "no records found"; }
		else {
			# [0 1 2 3 4 5 6 7] = [blueprintid name type owner username owner_bool user_bool listindex]
			my $record_ctr = 0;
			while (my @data = $query_handle->fetchrow_array()) {
				my @return_array = ( $data[0],$data[1],$data[2],$data[3],$data[4],$data[5],$data[6],$data[7] );
				$$LOCAL_blueprintList_ptr{$record_ctr} = \@return_array;
				$record_ctr++;
			}
			$return_status = 1; $return_msg = ""; # "found records"
		}
		
	} #end.. check fields not null
	
	# mask logged_in boolean if this is not user's own page
	if(!($sessionUsername=~m/^$username$/)) { $$LOCAL_state_ptr{logged_in} = 0; }
	
	$$LOCAL_state_ptr{action} = "listLessons";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
	$$LOCAL_state_ptr{session_username} = $sessionUsername;
}

sub renameLesson {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI, session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $rename = $$LOCAL_server_ptr{CGIObj}->param("rename");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username invalid"; }
	elsif($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid invalid"; }
	elsif($rename=~m/^$/) { $return_status = 0; $return_msg = "rename invalid"; }
	else {
		
		# update blueprint only if username is owner
		my $query_str = "UPDATE `blueprint` bp ";
		$query_str .= "LEFT JOIN `user` us ";
		$query_str .= "ON bp.`ownerid`=us.`userid` ";
		$query_str .= "SET bp.`name`=? ";
		$query_str .= "WHERE us.`username`=? AND bp.`blueprintid`=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($rename,$username,$blueprintid);
		
		# if update failed, find out reason
		if($query_handle->rows<1) {
			
			# check if blueprint exists
			my %lookupBlueprintid_hash = lookupBlueprintid($LOCAL_server_ptr,$blueprintid);		
			if($lookupBlueprintid_hash{status}==0) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) not found"; }
			
			# else not owner of blueprint
			else {
				my $lookupBlueprintid_row_ptr = $lookupBlueprintid_hash{row};
				my @lookupBlueprintid_row = @$lookupBlueprintid_row_ptr;
				$return_status = 0; $return_msg = "only owner (@lookupBlueprintid_row[1]) can modify this record";
			}
		}
		else { $return_status = 1; $return_msg = "rename successful"; }
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "renameLesson";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}

sub deleteLesson {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI, session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username ($username) invalid"; }
	elsif($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	else {
		
		# update blueprint only if username is owner
		my $query_str = "DELETE bp FROM `blueprint` bp ";
		$query_str .= "LEFT JOIN `user` us ";
		$query_str .= "ON bp.`ownerid`=us.`userid` ";
		$query_str .= "WHERE us.`username`=? AND bp.`blueprintid`=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($username,$blueprintid);
		
		# if update failed, find out reason
		if($query_handle->rows<1) {
			
			# check if blueprint exists
			my %lookupBlueprintid_hash = lookupBlueprintid($LOCAL_server_ptr,$blueprintid);
			my $lookupBlueprintid_row_ptr = $lookupBlueprintid_hash{row};
			my @lookupBlueprintid_row = @$lookupBlueprintid_row_ptr;
			if($lookupBlueprintid_hash{status}==0) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) not found"; }
			
			# check if owner of blueprint
			elsif(!(@lookupBlueprintid_row[1]=~m/^$username$/)) {
				$return_status = 0; $return_msg = "only owner (@lookupBlueprintid_row[1]) can modify this record";
			}
			
			# else delete ignored because record doesn't exist
			else { $return_status = 0; $return_msg = ""; }
		}
		else {
			# delete all upload files
			$query_str = "SELECT * FROM upload_files ";
			$query_str .= "WHERE blueprintid=?;";
			$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($blueprintid);
			
			while (my @uploadFile = $query_handle->fetchrow_array()) {
				my $uploadID = $uploadFile[0];
				my $uploadType = $uploadFile[2];
				
				$uploadID = forceAlphanumeric($uploadID,"");
				$uploadType=~m/^(upload\-audio|record\-audio|upload\-image)$/;
				$uploadType = $1;
				
				if(!($uploadID=~m/^$/ || $uploadType=~m/^$/)) {
					my @glob_arr = glob("/blueprints_volume/user-files/$uploadType/$uploadID.*");
					if(@glob_arr==1) {
						if($glob_arr[0]=~m/^(\/blueprints_volume\/user\-files\/$uploadType\/$uploadID\..*?)$/) {
							my $fileURL = $1;
							unlink($fileURL);
						}
					}
				}
			}
			
			$query_str = "DELETE FROM upload_files ";
			$query_str .= "WHERE blueprintid=?;";
			$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($blueprintid);
			
			# delete all blueprint files
			unlink("/blueprints_volume/blueprint/drill/$blueprintid.json");
			unlink("/blueprints_volume/blueprint/reading/$blueprintid.json");
			unlink("/blueprints_volume/blueprint/reading/$blueprintid.txt");
					
			# remove all entries in share table
			$query_str = "DELETE FROM `share` ";
			$query_str .= "WHERE `blueprintid`=?;";
			$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($blueprintid);
		
			if($query_handle->rows<1) { $return_status = 0; $return_msg = "delete failed"; }
			else { $return_status = 1; $return_msg = "delete successful"; }
		}
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "deleteLesson";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}

sub copyLesson {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI, session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username ($username) invalid"; }
	elsif($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	else {
		
		# check if blueprint exists
		my %lookupBlueprintid_hash = lookupBlueprintid($LOCAL_server_ptr,$blueprintid);
		my $lookupBlueprintid_row_ptr = $lookupBlueprintid_hash{row};
		my @lookupBlueprintid_row = @$lookupBlueprintid_row_ptr;
		
		if($lookupBlueprintid_hash{status}==0) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) not found"; }
		else {
		
			# insert into blueprint table
			my $query_str = "INSERT INTO blueprint (ownerid,type,name) ";
			$query_str .= "SELECT us.userid,bp.type,CONCAT('COPY_',bp.name) FROM blueprint bp ";
			$query_str .= "LEFT JOIN user us on us.username=? ";
			$query_str .= "WHERE bp.blueprintid=?;";
			my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($username,$blueprintid);
			
			my $newBlueprintid = $query_handle->{mysql_insertid};
			$newBlueprintid = forceAlphanumeric($newBlueprintid,"");
		
			# copy all upload files
			$query_str = "SELECT * FROM upload_files ";
			$query_str .= "WHERE blueprintid=?;";
			$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($blueprintid);
			
			my @uploadFileIDs = (); my @uploadFileURLs = ();
			while (my @uploadFile = $query_handle->fetchrow_array()) {
				my $uploadID = $uploadFile[0];
				my $uploadType = $uploadFile[2];
				
				$uploadID = forceAlphanumeric($uploadID,"");
				$uploadType=~m/^(upload\-audio|record\-audio|upload\-image)$/;
				$uploadType = $1;
				
				if(!($uploadID=~m/^$/ || $uploadType=~m/^$/)) {
					my @glob_arr = glob("/blueprints_volume/user-files/$uploadType/$uploadID.*");
					if(@glob_arr==1) {
						if($glob_arr[0]=~m/^(\/blueprints_volume\/user\-files\/$uploadType\/$uploadID\..*?)$/) {
							my $fileURL = $1;
							
							push(@uploadFileIDs,$uploadID);
							push(@uploadFileURLs,$fileURL);
						}
					}
				}
			}
			
			$query_str = "INSERT INTO upload_files (blueprintid,type) ";
			$query_str .= "SELECT ?,uf.type FROM upload_files uf ";
			$query_str .= "WHERE uploadid=?;";
			$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			for(my $ctr=0; $ctr<@uploadFileIDs; $ctr++) {
				$query_handle->execute($newBlueprintid,$uploadFileIDs[$ctr]);
				my $newUploadid = $query_handle->{mysql_insertid};
			
				my $newfileURL = $uploadFileURLs[$ctr];
				$newfileURL =~ s/\/$uploadFileIDs[$ctr]/\/$newUploadid/;
				copy($uploadFileURLs[$ctr],$newfileURL);
			}
			
			# copy all blueprint files
			copy("/blueprints_volume/blueprint/drill/$blueprintid.json","/blueprints_volume/blueprint/drill/$newBlueprintid.json");
			copy("/blueprints_volume/blueprint/reading/$blueprintid.json","/blueprints_volume/blueprint/reading/$newBlueprintid.json");
			copy("/blueprints_volume/blueprint/reading/$blueprintid.txt","/blueprints_volume/blueprint/reading/$newBlueprintid.txt");
		
			# insert into share table
			$query_str = "INSERT INTO share (userid,blueprintid,listindex) ";
			$query_str .= "SELECT us.userid,?,";
			$query_str .= "(SELECT MAX(`listindex`)+1 FROM `share` sh1 ";
			$query_str .= "LEFT JOIN `user` us1 ON sh1.`userid`=us1.`userid` WHERE us1.`username`=?) ";
			$query_str .= "FROM user us ";
			$query_str .= "WHERE us.username=?;";
			$query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
			$query_handle->execute($newBlueprintid,$username,$username);
		
			$return_status = 1; $return_msg = "copy successful";
		}
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "copyLesson";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}

sub shareLesson {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI, session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $shareuser = $$LOCAL_server_ptr{CGIObj}->param("shareuser");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$shareuser = forceAlphanumeric($shareuser,"\.");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username ($username) invalid"; }
	elsif($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	elsif($shareuser=~m/^$/) { $return_status = 0; $return_msg = "username ($shareuser) invalid"; }
	else {
		
		# insert record into share table only if username is owner
		my $query_str = "INSERT IGNORE INTO `share` (`userid`,`blueprintid`,`listindex`) ";
		$query_str .= "SELECT us.`userid`,?,";
		$query_str .= "(SELECT MAX(`listindex`)+1 FROM `share` sh1 ";
		$query_str .= "LEFT JOIN `user` us1 ON sh1.`userid`=us1.`userid` WHERE us1.`username`=?) ";
		$query_str .= "FROM `user` us WHERE us.`username`=? ";
		$query_str .= "AND EXISTS ( ";
		$query_str .= "SELECT * FROM `blueprint` bp2 ";
		$query_str .= "LEFT JOIN `user` us2 ON bp2.`ownerid`=us2.`userid` ";
		$query_str .= "WHERE bp2.`blueprintid`=? AND us2.`username`=? );";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($blueprintid,$shareuser,$shareuser,$blueprintid,$username);
		
		# if insert failed, find out reason
		if($query_handle->rows<1) {

			# check if user exists
			my %lookupUsername_hash = lookupUsername($LOCAL_server_ptr,$shareuser);
			if($lookupUsername_hash{status}==0) { $return_status = 0; $return_msg = "username ($shareuser) does not exist"; }
			
			else {
				# check if blueprint exists
				my %lookupBlueprintid_hash = lookupBlueprintid($LOCAL_server_ptr,$blueprintid);
				my $lookupBlueprintid_row_ptr = $lookupBlueprintid_hash{row};
				my @lookupBlueprintid_row = @$lookupBlueprintid_row_ptr;

				if($lookupBlueprintid_hash{status}==0) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) not found"; }
				
				# check if owner of blueprint
				elsif(!(@lookupBlueprintid_row[1]=~m/^$username$/)) {
					$return_status = 0; $return_msg = "only owner (@lookupBlueprintid_row[1]) can modify this record";
				}
				
				# else insert ignored because duplicate
				else { $return_status = 0; $return_msg = "already shared with $shareuser"; }
			}
		}
		else { $return_status = 1; $return_msg = "share successful"; }
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "shareLesson";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}

sub deleteShare {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI, session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $blueprintid = $$LOCAL_server_ptr{CGIObj}->param("blueprintid");
	my $shareuser = $$LOCAL_server_ptr{CGIObj}->param("shareuser");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$blueprintid = forceAlphanumeric($blueprintid,"");
	$shareuser = forceAlphanumeric($shareuser,"\.");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username ($username) invalid"; }
	elsif($blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	elsif($shareuser=~m/^$/) { $return_status = 0; $return_msg = "username ($shareuser) invalid"; }
	else {
		
		# update share table only if username is owner
		my $query_str = "DELETE FROM `share` ";
		$query_str .= "WHERE `blueprintid`=? ";
		$query_str .= "AND `userid` IN ( SELECT `userid` FROM `user` WHERE `username`=? ) ";
		$query_str .= "AND EXISTS ( ";
		$query_str .= "SELECT * FROM `blueprint` bp2 ";
		$query_str .= "LEFT JOIN `user` us2 ON bp2.`ownerid`=us2.`userid` ";
		$query_str .= "WHERE bp2.`blueprintid`=? AND us2.`username`=? );";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($blueprintid,$shareuser,$blueprintid,$username);
		
		# if insert failed, find out reason
		if($query_handle->rows<1) {

			# check if user exists
			my %lookupUsername_hash = lookupUsername($LOCAL_server_ptr,$shareuser);
			if($lookupUsername_hash{status}==0) { $return_status = 0; $return_msg = "username ($shareuser) does not exist"; }
			
			else {
				# check if blueprint exists
				my %lookupBlueprintid_hash = lookupBlueprintid($LOCAL_server_ptr,$blueprintid);
				my $lookupBlueprintid_row_ptr = $lookupBlueprintid_hash{row};
				my @lookupBlueprintid_row = @$lookupBlueprintid_row_ptr;

				if($lookupBlueprintid_hash{status}==0) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) not found"; }
				
				# check if owner of blueprint
				elsif(!(@lookupBlueprintid_row[1]=~m/^$username$/)) {
					$return_status = 0; $return_msg = "only owner (@lookupBlueprintid_row[1]) can modify this record";
				}
				
				# else delete ignored because share record doesn't exist
				else { $return_status = 0; $return_msg = "delete share record does not exist"; }
			}
		}
		else { $return_status = 1; $return_msg = "share deleted"; }
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "deleteShare";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}

sub rearrangeLessons {

	my $LOCAL_server_ptr = shift;
	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg, $return_data);

	# strip arguments from CGI, session object
	my $username = $$LOCAL_server_ptr{CGISession}->param("username");
	my $newOrder = $$LOCAL_server_ptr{CGIObj}->param("newOrder");
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	$newOrder = forceAlphanumeric($newOrder,",");
	
	# check fields not null
	if($username=~m/^$/) { $return_status = 0; $return_msg = "username ($username) invalid"; $return_data = ""; }
	elsif($newOrder=~m/^$/) { $return_status = 0; $return_msg = "newOrder ($newOrder) invalid"; $return_data = ""; }
	else {
	
		my @newOrder_array = @{$$LOCAL_server_ptr{JSON_utf8}->utf8(0)->decode("[".$newOrder."]")};
	
		# update share table
		my @sqlVals = (); my $sqlCsvStr = '';
		my $query_str = "UPDATE `share` ";
		$query_str .= "SET `listindex` = CASE `blueprintid` ";
		for(my $newCtr=0; $newCtr<@newOrder_array; $newCtr++) {
			$query_str .= "WHEN ? THEN ? ";
			push(@sqlVals,$newOrder_array[$newCtr]);
			push(@sqlVals,$newCtr);
			$sqlCsvStr .= ($newCtr==0) ? "?" : " , ?";
		}
		$query_str .= "END ";
		$query_str .= "WHERE `blueprintid` IN ($sqlCsvStr) ";
		$query_str .= "AND `userid` IN ( SELECT `userid` FROM `user` WHERE `username`=? );";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute(@sqlVals,@newOrder_array,$username);
		
		# if update failed, return error message
		if($query_handle->rows<1) { $return_status = 0; $return_msg = "error rearranging records"; $return_data = ""; }
		else {
			$return_status = 1; $return_msg = "records rearranged";
			$return_data = $$LOCAL_server_ptr{JSON_utf8}->utf8(0)->encode(\@newOrder_array);
		}
		
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{return_data} = $return_data;
	$$LOCAL_state_ptr{action} = "rearrangeLessons";
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
	$$LOCAL_state_ptr{username} = $username;
}


sub lookupBlueprintid {

	my $LOCAL_server_ptr = shift;
	my $blueprintid = shift;
	my (@return_row, $return_status, $return_msg);
	
	# force valid characters
	$blueprintid = forceAlphanumeric($blueprintid,"");
	
	# check fields not null
	if($blueprintid=~m/^$/) { @return_row = (); $return_status = 0; $return_msg = "blueprintid invalid"; }
	else {
	
		# check blueprintid exists
		my $query_str = "SELECT bp.`blueprintid`,us.`username` ";
		$query_str .= "FROM `blueprint` bp ";
		$query_str .= "LEFT JOIN `user` us ";
		$query_str .= "ON bp.`ownerid`=us.`userid` ";
		$query_str .= "WHERE bp.`blueprintid`=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($blueprintid);
				
		# check valid blueprint
		if($query_handle->rows<1) { @return_row = (); $return_status = 0; $return_msg = "blueprint not found"; }
		else {
			# [0 1] = [blueprintid owner]
			@return_row = $query_handle->fetchrow_array();
			$return_status = 1; $return_msg = "found blueprint";
		}
		
	} #end.. check fields not null
	
	return (
		row				=> \@return_row, # [0 1] = [blueprintid owner]
		status			=> $return_status,
		message			=> $return_msg
	);
}

sub lookupUsername {

	my $LOCAL_server_ptr = shift;
	my $username = shift;
	my (@return_row, $return_status, $return_msg);
	
	# force valid characters
	$username = forceAlphanumeric($username,"\.");
	
	# check fields not null
	if($username=~m/^$/) { @return_row = (); $return_status = 0; $return_msg = "username invalid"; }
	else {
	
		# check username exists
		my $query_str = "SELECT * FROM user WHERE username=?;";
		my $query_handle = $$LOCAL_server_ptr{dbHandle}->prepare($query_str) or die;
		$query_handle->execute($username);
		
		# check valid user
		if($query_handle->rows<1) { @return_row = (); $return_status = 0; $return_msg = "username not found"; }
		else {
			# [0 1 2 3] = [userid username password email]
			@return_row = $query_handle->fetchrow_array();
			$return_status = 1; $return_msg = "found user";
		}
		
	} #end.. check fields not null
	
	return (
		row				=> \@return_row, # [0 1 2 3] = [userid username password email]
		status			=> $return_status,
		message			=> $return_msg
	);
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
