var showing_list = 1;
function setup_cards() {

	// attach handlers for open menu buttons
	$("#list_button").unbind("click").click(function() { showListMenu(); });
	$("#flashcard_button").unbind("click").click(function() { showFlashcardMenu(); });

	//show uneditable list
	show_list(0);
}

function showListMenu() {

	// build html every time
	var showlist_html = "<div id='showmenu_content' class='content'>";
	showlist_html += "<header class='page-entry-header'><h1 class='entry-title'>list menu</h1></header>";
	showlist_html += "<div class='wpcf7'>";
	showlist_html += "<div id='showmenu_message_span' class='msg'></div>";
	showlist_html += "<div id='list_choices' class='instr_div' style='text-align:left; width:200px; float:left'>";
	showlist_html += "<span class='msg'>SHOW : </span><br>";
	showlist_html += "<input id='list_show_word' type='checkbox'>word<br>";
	showlist_html += "<input id='list_show_pron' type='checkbox'>pronunciation<br>";
	showlist_html += "<input id='list_show_defn' type='checkbox'>definition<br>";
	showlist_html += "</div>";
 	showlist_html += "<div id='list_buttons' class='instr_div' style='text-align:right; width:200px; float:right'>";
	showlist_html += "<span id='show_list_button' class='button_gp' style='text-align:center'>SHOW list</span><br><br>";
	showlist_html += "<span id='print_list_button' class='button_gp' style='text-align:center'>PRINT list</span><br><br>";
// 	showlist_html += "<span id='save_list_button' class='button_gp' style='text-align:center'>SAVE list</span><br><br>";
	showlist_html += "<span id='edit_list_button' class='button_gp' style='text-align:center'>EDIT list</span><br><br>";
	showlist_html += "<span id='add_word_button' class='button_gp' style='text-align:center'>ADD word</span>";
	showlist_html += "</div>";
	showlist_html += "<br><br>";
	showlist_html += "<button id='ok_button_list' name='ok'>ok</button>";
	showlist_html += "<br><br>";
	showlist_html += "</div>";
	showlist_html += "</div>";

	// open dialog
	$("#showmenu_dialog").dialog("close");
	$("body").append("<div id='showmenu_dialog' style='display:none; text-align:center'></div>");
	$("#showmenu_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:500,
		modal:true,
		close: function() { $("#showmenu_dialog").dialog("destroy"); $("#showmenu_dialog").remove(); }
	});

	$("#showmenu_dialog").html(showlist_html);

	//only check selected fields
	show_word==1 ? $("#list_show_word").attr("checked","checked") : $("#list_show_word").removeAttr("checked");
	show_pron==1 ? $("#list_show_pron").attr("checked","checked") : $("#list_show_pron").removeAttr("checked");
	show_defn==1 ? $("#list_show_defn").attr("checked","checked") : $("#list_show_defn").removeAttr("checked");
	
	show_list(0);

	// add click handler to buttons
	$("#show_list_button").unbind("click")
		.click(function() { show_list(2); show_list(0); $("#showmenu_dialog").dialog("close"); });
	$("#print_list_button").unbind("click")
		.click(function() { show_list(2); print_list(); $("#showmenu_dialog").dialog("close"); });
// 	$("#save_list_button").unbind("click")
// 		.click(function() { show_list(2); save_cards(1); $("#showmenu_dialog").dialog("close"); });
	$("#edit_list_button").unbind("click")
		.click(function() { show_list(2); show_list(1); $("#showmenu_dialog").dialog("close"); });
	$("#add_word_button").unbind("click")
		.click(function() { edit_word(0,4); show_list(2); show_list(1); $("#showmenu_dialog").dialog("close"); });
	$("#ok_button_list").button({icons:{primary:"ui-icon-check"}}).unbind("click")
		.click(function() { show_list(2); show_list(0); $("#showmenu_dialog").dialog("close"); });
}

function showFlashcardMenu() {

	// build html every time
	var showflashcard_html = "<div id='showmenu_content' class='content'>";
	showflashcard_html += "<header class='page-entry-header'><h1 class='entry-title'>flashcard menu</h1></header>";
	showflashcard_html += "<div class='wpcf7'>";
	showflashcard_html += "<div id='showmenu_message_span' class='msg'></div>";
	showflashcard_html += "<div id='flashcard_choices_prompt' class='instr_div' style='text-align:left; width:200px; float:left'>";
	showflashcard_html += "<span class='msg'>PROMPT : </span><br>";
	showflashcard_html += "<input id='flashcard_prompt_word' type='checkbox'>word<br>";
	showflashcard_html += "<input id='flashcard_prompt_pron' type='checkbox'>pronunciation<br>";
	showflashcard_html += "<input id='flashcard_prompt_defn' type='checkbox'>definition<br>";
	showflashcard_html += "</div>";
	showflashcard_html += "<div id='flashcard_choices_ans' class='instr_div' style='text-align:left; width:200px; float:left'>";
	showflashcard_html += "<span class='msg'>ANSWER : </span><br>";
	showflashcard_html += "<input id='flashcard_ans_word' type='checkbox'>word<br>";
	showflashcard_html += "<input id='flashcard_ans_pron' type='checkbox'>pronunciation<br>";
	showflashcard_html += "<input id='flashcard_ans_defn' type='checkbox'>definition<br>";
	showflashcard_html += "</div>";
	showflashcard_html += "<div style='width:100%; height:15px;'>&nbsp</div><br><br>";
	showflashcard_html += "<button id='cancel_button_flashcard'>cancel</button>";
	showflashcard_html += "&nbsp&nbsp&nbsp&nbsp";
	showflashcard_html += "<button id='show_flashcard_button'>START</button>";
	showflashcard_html += "<br><br>";
	showflashcard_html += "</div>";
	showflashcard_html += "</div>";

	// open dialog
	$("#showmenu_dialog").dialog("close");
	$("body").append("<div id='showmenu_dialog' style='display:none; text-align:center'></div>");
	$("#showmenu_dialog").dialog({
		autoOpen:true, position:["center","top"],
		width:500,
		modal:true,
		close: function() { $("#showmenu_dialog").dialog("destroy"); $("#showmenu_dialog").remove(); }
	});

	$("#showmenu_dialog").html(showflashcard_html);

	//only check selected fields
	prompt_word==1 ? $("#flashcard_prompt_word").attr("checked","checked") : $("#flashcard_prompt_word").removeAttr("checked");
	prompt_pron==1 ? $("#flashcard_prompt_pron").attr("checked","checked") : $("#flashcard_prompt_pron").removeAttr("checked");
	prompt_defn==1 ? $("#flashcard_prompt_defn").attr("checked","checked") : $("#flashcard_prompt_defn").removeAttr("checked");
	
	ans_word==1 ? $("#flashcard_ans_word").attr("checked","checked") : $("#flashcard_ans_word").removeAttr("checked");
	ans_pron==1 ? $("#flashcard_ans_pron").attr("checked","checked") : $("#flashcard_ans_pron").removeAttr("checked");
	ans_defn==1 ? $("#flashcard_ans_defn").attr("checked","checked") : $("#flashcard_ans_defn").removeAttr("checked");
	
	show_flashcard(0);

	//make sure not collisions in prompt/answer
	$("#flashcard_prompt_word").change(function() { show_flashcard(1); });
	$("#flashcard_prompt_pron").change(function() { show_flashcard(1); });
	$("#flashcard_prompt_defn").change(function() { show_flashcard(1); });
	$("#flashcard_ans_word").change(function() { show_flashcard(2); });
	$("#flashcard_ans_pron").change(function() { show_flashcard(2); });
	$("#flashcard_ans_defn").change(function() { show_flashcard(2); });

	// add click handler to buttons
	$("#show_flashcard_button").button({icons:{primary:"ui-icon-check"}})
		.unbind("click").click(function() { show_flashcard(5); prompting = 1; show_flashcard(0); $("#showmenu_dialog").dialog("close"); });
	$("#cancel_button_flashcard").button({icons:{primary:"ui-icon-close"}})
		.unbind("click").click(function() { $("#showmenu_dialog").dialog("close"); });
}


var prompt_word = 1, prompt_pron = 0, prompt_defn = 0;
var ans_word = 0, ans_pron = 1, ans_defn = 1;
var prompting = 1; var card_ctr = 0;
var card_index = -1; var notdel_word_ctr = 0;
function show_flashcard(card_option) {
	if(card_option == 5) { //update show options
		prompt_word = $("#flashcard_prompt_word").is(":checked");
		prompt_pron = $("#flashcard_prompt_pron").is(":checked");
		prompt_defn = $("#flashcard_prompt_defn").is(":checked");
		
		ans_word = $("#flashcard_ans_word").is(":checked");
		ans_pron = $("#flashcard_ans_pron").is(":checked");
		ans_defn = $("#flashcard_ans_defn").is(":checked");
	}
	else if(card_option == 4) { //choose next card index
		if(notdel_word_ctr==0 || word_ctr==0) { //need to know maximum index
			word_ctr = 0; var this_word = words[word_ctr];
			while(this_word) {
				if(this_word["defn"] != "----DELETED----DELETED") { notdel_word_ctr++; }
				word_ctr++; this_word = words[word_ctr];
			}
		}
		
		//return error if no cards to choose from
		if(notdel_word_ctr==0 || word_ctr==0) { alert('ERROR: no words in the list '+notdel_word_ctr); card_index = -1; return; }
		
		//choose random integer 0:word_ctr
		card_index = Math.floor(Math.random()*word_ctr);
		//keep choosing until card is valid
		if(words[card_index]["defn"] == "----DELETED----DELETED") { show_flashcard(4); }
	}
	else if(card_option == 3) { //show next card
		if(prompting == 1) {
			show_flashcard(4); //choose card index
			$("#ans_div").html(""); //clear answer of previous flashcard
			
			//display prompt
			var defn = words[card_index]["defn"]; defn = defn.replace(/\n/ig,"<br>");
			var prompt_html = (prompt_word==1 ? words[card_index]["word"]+"<br>" : "");
			prompt_html += (prompt_pron==1 ? words[card_index]["pron"]+"<br>" : "");
			prompt_html += (prompt_defn==1 ? defn+"<br>" : "");
			$("#prompt_div").html(prompt_html);
			
			prompting = 0; //swap state
		}
		else {
			card_ctr++; //increment total done so far
			$("#done_ctr").text(card_ctr);
			
			//display answer
			var defn = words[card_index]["defn"]; defn = defn.replace(/\n/ig,"<br>");
			var ans_html = (ans_word==1 ? words[card_index]["word"]+"<br>" : "");
			ans_html += (ans_pron==1 ? words[card_index]["pron"]+"<br>" : "");
			ans_html += (ans_defn==1 ? defn+"<br>" : "");
			$("#ans_div").html(ans_html);
			
			prompting = 1; //swap state
		}
	}
	else if(card_option==1 || card_option==2) { //check collisions in prompt/answer checkboxes
		if($("#flashcard_prompt_word").is(":checked") && $("#flashcard_ans_word").is(":checked")) {
			card_option==1 ? $("#flashcard_ans_word").attr("checked",false) : $("#flashcard_prompt_word").attr("checked",false);
		}
		if($("#flashcard_prompt_pron").is(":checked") && $("#flashcard_ans_pron").is(":checked")) {
			card_option==1 ? $("#flashcard_ans_pron").attr("checked",false) : $("#flashcard_prompt_pron").attr("checked",false);
		}
		if($("#flashcard_prompt_defn").is(":checked") && $("#flashcard_ans_defn").is(":checked")) {
			card_option==1 ? $("#flashcard_ans_defn").attr("checked",false) : $("#flashcard_prompt_defn").attr("checked",false);
		}
	}
	else { //start flashcards
		showing_list = 0;
		
		//select flashcard button
		$("#flashcard_button").css("color","#D16587").css("border-bottom","#D16587 solid 5px");
		$("#list_button").css("color","darkgray").css("border-bottom","#FFFFFF solid 5px");
		
		//build flashcard in toggle_view div
		var flashcard_html = "<div style='width:100%; height:15px'>&nbsp</div>";
		flashcard_html += "<div id='counter_div' style='width:95%; padding:4px; text-align:right'>";
		flashcard_html += "<span id='total_ctr'>"+word_ctr+"</span>&nbsp&nbsp<span style='color:#6495ED; font-size:16pt'>total</span>&nbsp&nbsp&nbsp&nbsp";
		flashcard_html += "<span id='done_ctr'>0</span>&nbsp&nbsp<span style='color:#6495ED; font-size:16pt'>cards done</span></div>";
		flashcard_html += "<div id='prompt_div' style='width:95%; height:135px; padding:4px; text-align:center; border:4px solid #483D8B; background-color:#E6E6FA; font-size:16pt; color:#2F4F4F'></div>";
		flashcard_html += "<div style='width:95%; height:40px; padding:4px; text-align:right'>";
		flashcard_html += "<button id='next_button_flashcard'>NEXT</button></div>";
		flashcard_html += "<div id='ans_div' style='width:95%; height:135px; padding:4px; text-align:center; border:4px solid #FFD700; background-color:#FFFACD; font-size:16pt; color:#2F4F4F'></div>";
		$("#toggle_view").html(flashcard_html);
		
		$("#next_button_flashcard").button({icons: {secondary:"ui-icon-arrowthick-1-e"}})
			.click(function() { show_flashcard(3); });
		
		show_flashcard(3); //goto next card
	}
}

var word_ctr = 0;
function show_list(show_option) {
	if(show_option == 3) { //save all edits
		//loop words, saving edits
		word_ctr = 0; var this_word = words[word_ctr];
		while(this_word) {
			edit_word(word_ctr,2);
			word_ctr++; this_word = words[word_ctr];
		}
	}
	else if(show_option == 2) { //update show options
		show_word = $("#list_show_word").is(":checked");
		show_pron = $("#list_show_pron").is(":checked");
		show_defn = $("#list_show_defn").is(":checked");
	}
	else if(show_option == 1) { //display list editable
		//select button
		$("#list_button").css("border-bottom","#D16587 solid 5px");
		$("#flashcard_button").css("border-bottom","#FFFFFF solid 5px");
		
		//build table in toggle_view div
		var list_html = "<div style='width:100%; height:15px'>&nbsp</div>";
		list_html += "<table id='card_header' style='width:80%; height:15%;'><tr>";
		list_html += "<td class='vocab_row' style='width:20%'>word</td>";
		list_html += "<td class='vocab_row' style='width:20%'>pronunciation</td>";
		list_html += "<td class='vocab_row' style='width:30%'>definition</td>";
		list_html += "</tr></table>";
		list_html += "<br><button id='save_button_edit'>Save Changes</button>&nbsp&nbsp&nbsp&nbsp&nbsp";
		list_html += "<button id='cancel_button_edit'>Cancel</button><br>";
		$("#toggle_view").html(list_html);
		$("#save_button_edit").button({icons: {primary:"ui-icon-check"}})
			.click(function() { show_list(3); show_list(0); });
		$("#cancel_button_edit").button({icons: {primary:"ui-icon-close"}})
			.click(function() { show_list(0); });
	
		//loop words, adding to list
		word_ctr = 0; var this_word = words[word_ctr];
		while(this_word) {
			edit_word(word_ctr,1);
			word_ctr++; this_word = words[word_ctr];
		}
	}
	else { //display list not editable
		showing_list = 1;
		
		//select list button
		$("#list_button").css("color","#D16587").css("border-bottom","#D16587 solid 5px");
		$("#flashcard_button").css("color","darkgray").css("border-bottom","#FFFFFF solid 5px");
		
		//build table in toggle_view div
		var list_html = "<div style='width:100%; height:15%'>&nbsp</div>";
		list_html += "<table id='card_header' style='width:80%; height:15%;'><tr>";
		if(show_word==1) { list_html += "<td class='vocab_row' style='width:20%'>word</td>"; }
		if(show_pron==1) { list_html += "<td class='vocab_row' style='width:20%'>pronunciation</td>"; }
		if(show_defn==1) { list_html += "<td class='vocab_row' style='width:30%'>definition</td>"; }
		list_html += "</tr></table>";		
		$("#toggle_view").html(list_html);
	
		//loop words, adding to list
		word_ctr = 0; var this_word = words[word_ctr];
		while(this_word) {
			edit_word(word_ctr,0);
			word_ctr++; this_word = words[word_ctr];
		}
	}
}

function print_list() {
	var print_html = "";
	
	//loop words, adding to html string
	word_ctr = 0; var this_word = words[word_ctr];
	while(this_word) {
		if(this_word["defn"] == "----DELETED----DELETED") { continue; }
		
		print_html += "<br>"+edit_word(word_ctr,5)+"<br>";
		word_ctr++; this_word = words[word_ctr];
	}
	
	//open new window, write to DOM, call print function
	var vocab_print_win = window.open("","","width=500,height=500");
	vocab_print_win.document.write(print_html);
	vocab_print_win.focus();
	vocab_print_win.print();
}

var show_word = 1, show_pron = 1, show_defn = 1;
function edit_word(id,edit_option) {
	if(edit_option == 5) { //return string for printing
		//return if word is deleted
		if(words[id]["defn"] == "----DELETED----DELETED") { return ""; }	
	
		//only show selected fields. strip newlines from defn
		var word = show_word==1 ? words[id]["word"] : "";
		var pron = show_pron==1 ? words[id]["pron"] : "";
		var defn = show_defn==1 ? words[id]["defn"] : ""; defn = defn.replace(/\n/ig,"<br>");
		
		var print_str = word+"  ["+pron+"]    "+defn;
		return print_str;
	}
	else if(edit_option == 4) { //add new blank word
		words[""+word_ctr] = {"word":"","pron":"","defn":""}
		word_ctr++;		
	}
	else if(edit_option == 3) { //delete word (really just hiding, only deleted when save all edits)
		$("#vocab_defn_"+id).val("----DELETED----DELETED");
		$("#vocab_"+id).hide();
	}
	else if(edit_option == 2) { //save edited word
		function safe_string(str) {
			var regex = /^(.*?)((\s| |　)+)?$/; var parsed_str = regex.exec(str); str = parsed_str[1];
			str = str.replace(/\[/g,"("); str = str.replace(/\]/g,")"); str = str.replace(/\n/g,""); str = str.replace(/\"/g,"'");
			return str;
		}

		//only save selected fields. strip newlines from defn
		if(show_word == 1) { words[id]["word"] = safe_string($("#vocab_word_"+id).val()); }
		if(show_pron == 1) { words[id]["pron"] = safe_string($("#vocab_pron_"+id).val()); }
		if(show_defn == 1) { words[id]["defn"] = safe_string($("#vocab_defn_"+id).val()); }
	}
	else if(edit_option == 1) { //make word editable
		//return if word is deleted
		if(words[id]["defn"] == "----DELETED----DELETED") { return; }
	
		//always show all fields for editing. strip newlines from defn
		var word = words[id]["word"];
		var pron = words[id]["pron"];
		var defn = words[id]["defn"]; defn = defn.replace(/<br>/ig,"\n");
	
		if($("#vocab_"+id).html()) { $("#vocab_"+id).html(""); } //clear row if already exists
		else { $("#card_header").append("<tr id=\"vocab_"+id+"\"></tr>"); } //else append new row to end of table
		
		//create editable cells in row
		$("#vocab_"+id)
			.append("<th width='20%'><input id=\"vocab_word_"+id+"\" type='text' style='width:20%' value=\""+word+"\"></th>") // word
			.append("<th width='20%'><input id=\"vocab_pron_"+id+"\" type='text' style='width:95%; float:left' value=\""+pron+"\"></th>") // pronunciation
			.append("<th width='30%'><input id=\"vocab_defn_"+id+"\" type='text' style='width:95%; float:left' value=\""+defn+"\"></th>"); // definition
	}
	else { //display word (not editable)
		//return if word is deleted
		if(words[id]["defn"] == "----DELETED----DELETED") { return; }
	
		//only show selected fields. strip newlines from defn
		var word = show_word==1 ? words[id]["word"] : "";
		var pron = show_pron==1 ? words[id]["pron"] : "";
		var defn = show_defn==1 ? words[id]["defn"] : ""; defn = defn.replace(/<br>/ig,"\n");
	
		if($("#vocab_"+id).html()) { $("#vocab_"+id).html(""); } //clear row if already exists
		else { $("#card_header").append("<tr id=\"vocab_"+id+"\"></tr>"); } //else append new row to end of table
		
		//create cells in row
		if(show_word==1) { $("#vocab_"+id).append("<th width='20%'>"+word+"</th>"); } //word
		if(show_pron == 1) { $("#vocab_"+id).append("<th width='20%'>"+pron+"</th>"); } //pronunciation
		if(show_defn == 1) { $("#vocab_"+id).append("<th width='30%'>"+defn+"</th>"); } //definition
	}
}

