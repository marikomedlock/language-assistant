#!/usr/bin/perl

use strict;
use CGI;
use CGI::Carp qw (fatalsToBrowser);
use CGI::Session;
use File::Basename;
use FileHandle;

#create the CGI object
my $query = new CGI;

#pull arguments from query object if submitted
my $handle = $query->param("POSTDATA");
my $save_id = $query->url_param("save_id");
my $fetch_id = 1;#$query->param("fetch_id");
my $action = $query->param("action");


if($action && $action=~m/^id_fetch$/) { id_fetch($fetch_id); }
else { upload_audio($handle,$save_id); }


sub upload_audio() {
	my $handle = shift;
	my $save_id = shift;
	
	#upload to server
#	my $filename = "temp_".$save_id; #generate_filename(); #generate name for file
	open (UPLOADFILE, ">/blueprints_volume/user_audio/mariko.wav") or die "$!";
	binmode UPLOADFILE;
	print UPLOADFILE $handle;
	close UPLOADFILE;
	
	print $query->header(-charset=>'utf-8');
	print "audio uploaded";
	
	#convert to .mp3 file
#`/mit/outland/bin/lame saved/audio_temp/$filename.wav saved/audio_temp/$filename.mp3`;
	#delete .wav file
#`rm saved/audio_temp/$filename.wav`;
}


sub id_fetch() {
	my $fetch_id = shift;

	if(!(-e "/blueprints_volume/user_audio/mariko.wav")) { # too fast, not done writing yet
		#return message
		print $query->header(-charset=>'utf-8');
		print "{\"message\":\"id_fetch too fast\"}";
		return;
	}
	
# 	my $old_filename = "temp_".$fetch_id;
# 
# 	if(!(-e "saved/audio_temp/$old_filename.mp3")) { # too fast, not done writing yet
# 		#return message
# 		print $query->header(-charset=>'utf-8');
# 		print "{\"message\":\"id_fetch too fast\"}";
# 		return;
# 	}
# 
# 	my $new_filename = generate_filename(); #generate name for file
# 	$new_filename = $new_filename;
# 	
# 	#move to main audio file
# `mv saved/audio_temp/$old_filename.mp3 saved/audio/$new_filename.mp3`;
# 	#remove temp file
# #`rm saved/audio_temp/$old_filename.mp3`;
# 
	#return message
	print $query->header(-charset=>'utf-8');
# 	print "{\"message\":\"id_fetch successful\",\"filename\":\"$new_filename\"}";
	print "{\"message\":\"id_fetch successful\",\"filename\":\"mariko444\"}";
}

# sub generate_filename() {
# 	#generate random number for file
# 	my $filename = int(rand(1000000000000));
# 
# 	#check if file exists already
# 	if(-e "saved/audio/$filename.mp3") { return generate_filename(); }
# 	elsif(-e "saved/audio/$filename.wav") { return generate_filename(); }
# 	else { return $filename; }
# }
