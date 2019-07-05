#!/usr/bin/perl -w

# upload functions (uploadImage, uploadAudio, recordIDFetch, uploadRecord)
# !! need to add back -T taint option in shebang (removed because fails on uploadRecord POSTDATA write to file)

use strict;
use CGI qw(:standard :cgi-lib :param);
use CGI::Carp qw ( fatalsToBrowser );
use CGI::Session;
use DBI;
use JSON;
use File::Basename;
use FileHandle;

my $CGIObj = new CGI;
my $CGISession = CGI::Session->load() or die CGI::Session->errstr;
my $CGICookie = '';

# create GLOBAL state hash
my %GLOBAL_state = (
		webURL			=> "http://language-assistant.org",
		redirectURL		=> "http://language-assistant.org/cgi-bin/reading.cgi",
		logged_in		=> 0,		
		username		=> (!$CGISession->param("username")) ? "" : $CGISession->param("username"),
		
		action			=> (!$CGIObj->param("action") && !$CGIObj->url_param("action")) ? "" : ($CGIObj->param("action") ? $CGIObj->param("action") : $CGIObj->url_param("action")),
		status			=> 0,
		message			=> ''
	);

# refresh session
refreshSession(\%GLOBAL_state);

# execute requested action
for($GLOBAL_state{action}) {
 	if(/^uploadImage$/)					{ uploadImage(\%GLOBAL_state); }
 	elsif(/^uploadAudio$/)				{ uploadAudio(\%GLOBAL_state); }
	elsif(/^recordIDFetch$/)			{ recordIDFetch(\%GLOBAL_state); }
	else								{ uploadRecord(\%GLOBAL_state); }
}

# generate JSON string
my $GLOBAL_JSONstate = generateJSON(\%GLOBAL_state);

# execute requested display
# my $CGIDisplay = (!$CGIObj->param("display")) ? "" : $CGIObj->param("display");
# for($CGIDisplay) {
# 	if(/^ajax$/)				{
									print $CGIObj->header(-charset=>'utf-8',-cookie=>$CGICookie);
									print $GLOBAL_JSONstate;
# 	}
# 	elsif(/^redirect$/)			{
# 									print $CGIObj->header(-charset=>'utf-8',-cookie=>$CGICookie,-location=>$GLOBAL_state{redirectURL});
# 	}
# }



sub generateJSON {

	my $LOCAL_state_ptr = shift;
	
	my $LOCAL_JSONstr = '';
	
	my $first_pair = 1;
	while(my ($key,$val) = each %$LOCAL_state_ptr) {
		if($first_pair==0) { $LOCAL_JSONstr .= " , "; }
		else { $first_pair = 0; }
		
		$LOCAL_JSONstr .= "\"$key\":\"$val\"";
	}

	return "{ $LOCAL_JSONstr }";
}


sub uploadImage {

	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg, $return_url);

	# limit size to 5MB
	$CGI::POST_MAX = 1024 *5000; #5MB

	# strip arguments from CGI object
	my $blueprintid = $CGIObj->param("blueprintid");
	my $uploadfilestr = $CGIObj->param("uploadfilestr");

	# strip leading,trailing whitespace
	$blueprintid = stripWhitespace($blueprintid);
	$uploadfilestr = stripWhitespace($uploadfilestr);

	# get file extension
	$uploadfilestr = stripToExtension($uploadfilestr);
	
	# check alpha-numeric
	$blueprintid = forceAlphanumeric($blueprintid,"\.");
	$uploadfilestr = forceAlphanumeric($uploadfilestr,"");
	
	# check fields not null
	if(!$blueprintid || $blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_url = ""; }
	elsif(!$uploadfilestr || $uploadfilestr=~m/^$/) { $return_status = 0; $return_msg = "uploadfilestr ($uploadfilestr) invalid"; $return_url = ""; }
#	elsif(!($uploadfilestr=~m/^(jpg|jpeg|png|bmp)$/)) { $return_status = 0; $return_msg = "image format ($uploadfilestr) not recognized"; $return_url = ""; }
	else {
		# create database entry
		my $uploadid = insertUploadDB($blueprintid,"upload-image",0);
	
		#strip arguments from CGI object
		my $filehandle = $CGIObj->upload("uploadfile");

		# upload to server
		open(UPLOADFILE,">/blueprints_volume/user-files/upload-image/$uploadid.$uploadfilestr") or die "$!";
		binmode UPLOADFILE;
		while(<$filehandle>) { print UPLOADFILE; }
		close UPLOADFILE;
		
		# set PATH and remove some environment variables for running in taint mode
		$ENV{ 'PATH' } = '/bin:/usr/bin:/usr/local/bin';
		delete @ENV{ 'IFS', 'CDPATH', 'ENV', 'BASH_ENV' };
		
		# create symbolic link
`ln -s /blueprints_volume/user-files/upload-image/$uploadid.$uploadfilestr /var/www/user-files/upload-image/$uploadid.$uploadfilestr`;
		
		$return_status = 1; $return_msg = "image upload successful $uploadid.$uploadfilestr";
		$return_url = "user-upload-image/$uploadid.$uploadfilestr";

	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "uploadImage";
 	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{url} = $return_url;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub uploadAudio {

	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg, $return_url);

	# limit size to 5MB
	$CGI::POST_MAX = 1024 *5000; #5MB

	# strip arguments from CGI object
	my $blueprintid = $CGIObj->param("blueprintid");
	my $uploadfilestr = $CGIObj->param("uploadfilestr");

	# strip leading,trailing whitespace
	$blueprintid = stripWhitespace($blueprintid);
	$uploadfilestr = stripWhitespace($uploadfilestr);

	# get file extension
	$uploadfilestr = stripToExtension($uploadfilestr);
	
	# check alpha-numeric
	$blueprintid = forceAlphanumeric($blueprintid,"\.");
	$uploadfilestr = forceAlphanumeric($uploadfilestr,"");
	
	# check fields not null
	if(!$blueprintid || $blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_url = ""; }
	elsif(!$uploadfilestr || $uploadfilestr=~m/^$/) { $return_status = 0; $return_msg = "uploadfilestr ($uploadfilestr) invalid"; $return_url = ""; }
# 	elsif(!($uploadfilestr=~m/^(wav|mp3|ogg)$/)) { $return_status = 0; $return_msg = "audio format ($uploadfilestr) not recognized"; $return_url = ""; }
	else {
		# create database entry
		my $uploadid = insertUploadDB($blueprintid,"upload-audio",0);
	
		#strip arguments from CGI object
		my $filehandle = $CGIObj->upload("uploadfile");

		# upload to server
		open(UPLOADFILE,">/blueprints_volume/user-files/upload-audio/$uploadid.$uploadfilestr") or die "$!";
		binmode UPLOADFILE;
		while(<$filehandle>) { print UPLOADFILE; }
		close UPLOADFILE;
		
		# set PATH and remove some environment variables for running in taint mode
		$ENV{ 'PATH' } = '/bin:/usr/bin:/usr/local/bin';
		delete @ENV{ 'IFS', 'CDPATH', 'ENV', 'BASH_ENV' };
		
		# create symbolic link
`ln -s /blueprints_volume/user-files/upload-audio/$uploadid.$uploadfilestr /var/www/user-files/upload-audio/$uploadid.$uploadfilestr`;
		
		$return_status = 1;
		$return_msg = "audio upload successful $uploadid.$uploadfilestr";
		$return_url = "user-upload-audio/$uploadid.$uploadfilestr";

	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "uploadAudio";
 	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{url} = $return_url;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub uploadRecord {

	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg);

	# strip arguments from CGI object
	my $blueprintid = $CGIObj->url_param("blueprintid");

	# strip leading,trailing whitespace
	$blueprintid = stripWhitespace($blueprintid);
	
	# check alpha-numeric
	$blueprintid = forceAlphanumeric($blueprintid,"\.");
	
	# check fields not null
	if(!$blueprintid || $blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; }
	else {
		my $handle = $CGIObj->param("POSTDATA");
		
		# upload to server
		open (UPLOADFILE, ">/blueprints_volume/user-files/TEMP__record-audio/$blueprintid.wav") or die "$!";
		binmode UPLOADFILE;
		print UPLOADFILE $handle;
		#while(<$handle>) { print UPLOADFILE; }
		close UPLOADFILE;
		
		# create database entry
		my $uploadid = insertUploadDB($blueprintid,"TEMP__record-audio",1);
		
		$return_status = 1;
		$return_msg = "upload successful ($blueprintid) ($uploadid)";
	
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "uploadRecord";
 	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}

sub recordIDFetch {

	my $LOCAL_state_ptr = shift;
	my ($return_status, $return_msg, $return_url);
	
	my $blueprintid = $CGIObj->param("blueprintid");

	# strip leading,trailing whitespace
	$blueprintid = stripWhitespace($blueprintid);
	
	# check alpha-numeric
	$blueprintid = forceAlphanumeric($blueprintid,"\.");
	
	# check fields not null
	if(!$blueprintid || $blueprintid=~m/^$/) { $return_status = 0; $return_msg = "blueprintid ($blueprintid) invalid"; $return_url = ""; }
	else {
	
		# connect to database
		my $db_handle = DBI->connect("DBI:mysql:mm87;","mm87","honopuHI") or die;
		#my $db_handle = DBI->connect("DBI:mysql:mm87;","root","honopuHI") or die;
	
		# lookup record in upload_files table
		my $query_str = "SELECT * FROM upload_files WHERE blueprintid='$blueprintid' AND type='TEMP__record-audio';";
		my $query_handle = $db_handle->prepare($query_str) or die;
		$query_handle->execute();

		# found record
		if($query_handle->rows==1 && (-e "/blueprints_volume/user-files/TEMP__record-audio/$blueprintid.wav")) {
			# [0 1 2] = [uploadid blueprintid type]
			my @data = $query_handle->fetchrow_array();
			my $uploadid = $data[0];
			
			# set PATH and remove some environment variables for running in taint mode
			$ENV{ 'PATH' } = '/bin:/usr/bin:/usr/local/bin';
			delete @ENV{ 'IFS', 'CDPATH', 'ENV', 'BASH_ENV' };
			
			# move file from TEMP directory
`mv /blueprints_volume/user-files/TEMP__record-audio/$blueprintid.wav /blueprints_volume/user-files/record-audio/$uploadid.wav`;

			# create symbolic link
`ln -s /blueprints_volume/user-files/record-audio/$uploadid.wav /var/www/user-files/record-audio/$uploadid.wav`;

			$query_str = "UPDATE upload_files SET type='record-audio' WHERE uploadid='$uploadid';";
			$query_handle = $db_handle->prepare($query_str) or die;
			$query_handle->execute();
			
			$return_status = 1;
			$return_msg = "recordIDFetch successful";
			$return_url = "user-record-audio/$uploadid.wav";
		}
		
		else { $return_status = 0; $return_msg = "recordIDFetch failed"; $return_url = ""; }
			
	} #end.. check fields not null
	
	$$LOCAL_state_ptr{action} = "recordIDFetch";
	$$LOCAL_state_ptr{blueprintid} = $blueprintid;
	$$LOCAL_state_ptr{url} = $return_url;
	$$LOCAL_state_ptr{status} = $return_status;
	$$LOCAL_state_ptr{message} = $return_msg;
}


sub insertUploadDB {

	my $blueprintid = shift;
	my $recordtype = shift;
	my $updateDuplicate = shift;
	
	# connect to database
	my $db_handle = DBI->connect("DBI:mysql:mm87;","root","honopuHI") or die;
	#my $db_handle = DBI->connect("DBI:mysql:mm87;","root","honopuHI") or die;
	my ($query_str, $query_handle, $uploadid);

	# search for duplicate
	if($updateDuplicate==1) {
		$query_str = "SELECT * FROM upload_files WHERE blueprintid='$blueprintid' AND type='$recordtype';";
		$query_handle = $db_handle->prepare($query_str) or die;
		$query_handle->execute();
	}

	# insert new record
	if($updateDuplicate==0 || $query_handle->rows==0) {
		$query_str = "INSERT INTO upload_files (blueprintid,type) VALUES('$blueprintid','$recordtype');";
		$query_handle = $db_handle->prepare($query_str) or die;
		$query_handle->execute();
		$uploadid = $query_handle->{mysql_insertid};
	}
	else {
		# [0 1 2] = [uploadid blueprintid type]
		my @data = $query_handle->fetchrow_array();
		$uploadid = $data[0];
	}
	
	# return uploadid
	return $uploadid;
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

sub stripWhitespace {
	my $input_str = shift;
	
	my $output_str = $input_str;
	$output_str =~ s/^((\xE3\x80\x80|\s)+)//;
	$output_str =~ s/((\xE3\x80\x80|\s)+)$//;

	return $output_str;
}

sub forceAlphanumeric {
	my $input_str = shift;
	my $allowed_chars = shift;

	my $output_str = $input_str;
	$output_str =~ s/[^\w$allowed_chars]//g;
	
	return $output_str;
}

sub stripToExtension {
	my $input_str = shift;
	
	my $output_str = $input_str;
	$output_str =~ m/\.(.*)(\s+)?$/;
	$output_str = $1;
	
	return $output_str;
}
