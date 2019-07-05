# language-assistant

This repository contains all the code files used on the language-assistant.org website.
----------------------------------------------------------------

Below are some notes about setting up the website
----------------------------------------------------------------

For the server, I used an AWS EC2 instance of type t1.micro. I don't think the type is important, it was just the most basic available when I setup the EC2 instance.

For the data files, I used an AWS EBS volume of type standard and 10GB. Note that this is an additional EBS volume, not the same one that backs the EC2 server instance. The CGI scripts assume that this data files volume is mounted under "/blueprints_volume" on the server machine. I modified the /etc/fstab file on the server to automatically re-mount the data files volume on machine reboot. This fixed the website going down every time AWS did server maintenance and rebooted the machine.

For the web-server, I used Apache (https://httpd.apache.org/).

For the database, I used MySQL (https://www.mysql.com/).

Regarding additional software packages, I also installed the Mecab Japanese parser (https://taku910.github.io/mecab/). The parser was used to try and automatically parse a reading text when first creating it. The site should work without the parser installed, except for that particular feature.

Below are more details about each of the downloadable files.

1. codeFiles.tar.gz
	This file contains all the sub-directories under the web-server directory and a copy of the web-server config file. I chose the default directory when installing Apache webserver, so all these sub-directories were under /var/www. Below are brief descriptions of the six sub-directories.

	A. cgi-bin
	These are the CGI script files. They are written in Perl and assume that the data files are mounted in a volume called "blueprints_volume".
	
	B. css
	These are the stylesheets for all the pages. They are from JQuery UI (https://jqueryui.com/), JQuery QTip (https://qtip1.com/), and the Yoko Wordpress Theme (https://wordpress.org/themes/yoko/). I made several modifications, particularly to the Yoko Wordpress Theme, and all three have undoubtedly been updated since I used them, so it is very likely that they won't match what you see on those sites today.
	
	C. html
	This sub-directory was created by the web-server default installation. I did not use it except for testing purposes.
	
	D. icons
	These are all open-source icons, as far as I know. There is a README.html included in the top-level directory that has more details. Many of these icons are not used, but I haven't gone through and figured out exactly which ones are used, so I left them all there. This sub-directory could probably be significantly pared down.
	
	E. js
	These are the Javascript files. Most of the page functionality works on the client-side and then uses AJAX calls to update the server when something is saved. For this reason, a significant chunk of the site logic is contained in these files.
	
	F. swf
	This is the Adobe Flash audio recorder. I think it may have permissions issues in some browsers and regardless, likely needs to be updated to use a more recent version of Flash or something else entirely. Note that this should not affect audio playback. This recorder was used for teachers to record audio. They should still be able to upload audio recorded on a local machine, which I think is how the site was most commonly used anyway.

	G. httpd.conf
	This is the Apache web-server configuration file. I mostly just selected the default options when installing, but uploaded here just in case this is useful to compare with.

2. blueprint.tar.gz
	This file contains all the files in the "blueprint" sub-directory under the "blueprints_volume" data volume. It includes JSON files for the drills and JSON and TXT files for the readings.

3. user-files.tar.gz
	This file contains all the files in the "user-files" sub-directory under the "blueprints_volume" data volume. It includes WAV and MP3 audio files and PNG and JPG image files.

4. mysqldump.tar.gz
	This file contains the output of the msqldump command (https://dev.mysql.com/doc/refman/5.7/en/mysqldump-definition-data-dumps.html). I didn't use any flags when running the command, so the dump file contains both the schema and data. I typically accessed the database using the MySQL command line interface ("mysql mm87 --user=root -p" where mm87 is the name of the database, and entering "honopuHI" when prompted for the password).
