// ** Enable rec styling on selectmenu ** //
// ************************************** //
function get_rec_string_selecmenu(value) {
    let rec = parseInt(value);
    if (rec>20) return '<span>' + number_format(rec/2) + '</span>';
    var str = "";
    for(var i = 0 ; i < 5; i++) {
        if(rec > 1) str += "<img src=\"/pics/star.png\" class='rec_star'/>";
        else if(rec > 0) str += "<img src=\"/pics/half_star.png\" class='rec_star'/>";
        else str += "<img src=\"/pics/dark_star.png\" class='rec_star' />";
        rec -= 2;
    }
    return str;
}
$(document).ready(function() {
	$.widget( "custom.recselectmenu", $.ui.selectmenu, {
	    _renderItem: function( ul, item ) {
	        var li = $( "<li>" ),
	            wrapper = $( "<div>" ).css('text-align', 'center');
	 
	        const str = get_rec_string_selecmenu(item.label)
	        
	        $(str).appendTo( wrapper );
	 
	        return li.append( wrapper ).appendTo( ul );
	    },
	    _renderButtonItem: function( item ) {
	        var buttonItem = $( "<span>", {
	            "class": "ui-selectmenu-text",
	            text: '',
	        });
	        const str = get_rec_string_selecmenu(item.label)
	        this._setText( buttonItem, '' );
	        buttonItem.append(str);

	        return buttonItem;
	    },
	});
	$.widget( "custom.flagselectmenu", $.ui.selectmenu, {
	    _renderItem: function( ul, item ) {
	        var li = $( "<li>" ),
	            wrapper = $( "<div>" ).css('text-align', 'center');
	 
			const str = item.label.replace(/\[([a-z]+?)\]/g, '<img src="/pics/flags/gradient/$1.png" style="margin-left: 5px;height: 10px;"/>')
// console.log('Inside1 ',str, item.label);
	        
	 		wrapper.append(str);
	        return li.append( wrapper ).appendTo( ul );
	    },
	    _renderButtonItem: function( item ) {
	        var buttonItem = $( "<span>", {
	            "class": "ui-selectmenu-text",
	            text: '',
	        });
			const str = item.label.replace(/\[([a-z]+?)\]/g, '<img src="/pics/flags/gradient/$1.png" style="margin-left: 5px;height: 10px;"/>')

// console.log('Inside2 ',str, item);
	        this._setText( buttonItem, '' );
	        buttonItem.append(str);

	        return buttonItem;
	    },
	});
	console.log('Widgety Flag');
});

// function flag_style_selects() {
// 	console.log('Flags Select');
// 	$("select#country").flagselectmenu({
// 		"style":"dropdown",
// 		"maxHeight":"250",
// 		"width": "100%",
// 	});
// }

// *** functions.js *** //
// ************************** //
var tabindex=400;
function js_error(str) {
	try	{
		console.log(str);
	} catch(err) {
		var element = $("<div />");
		element.html(str);
		element.addClass("js_error");
		$("body").prepend(element);
	}
}
function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.

	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') { //Array/Hashes/Objects
		for(var item in arr) {
			var value = arr[item];
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}

function $e(ele) {
	return document.getElementById(ele);
}

function array_search(needle, haystack) {
	for (var i = 0; i < haystack.length; i++) {
		if (haystack[i] == needle) {
			return i;
		}
	};
	return -1;
}

function space_to_nbsp(str) { return str.replace(" ", "&nbsp;"); }
function html_escape(str) {
    return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function clear_arrows() {
	$(".tut_arrow").remove();
};

function add_arrow_to_element(element,direction) {
	if(!$(element).length) return;
	if(direction=="all")
	{
		add_arrow_to_element(element,"left");
		add_arrow_to_element(element,"up");
		add_arrow_to_element(element,"down");
		add_arrow_to_element(element,"right");
		return;
	}
	var atop = $(element).offset().top+$(element).height()/2-16;
	var aleft = $(element).offset().left-37;
	var aclass = "tut_arrow_right";
	if(direction=="down")
	{
		var atop = $(element).offset().top-37;
		var aleft = $(element).offset().left+$(element).width()/2-16;
		var aclass = "tut_arrow_down";
	}
	else if(direction=="left")
	{
		var atop = $(element).offset().top+$(element).height()/2-16;
		var aleft = $(element).offset().left+$(element).width();
		var aclass = "tut_arrow_left";
	}
	else if(direction=="up")
	{
		var atop = $(element).offset().top+$(element).height();
		var aleft = $(element).offset().left+$(element).width()/2-16;
		var aclass = "tut_arrow_up";
	}
	var arrow = $("<div>").addClass("tut_arrow "+aclass).css({
		"top":atop+"px",
		"left":aleft+"px"
	}).effect("pulsate",{times:10000},500).appendTo("body");

}

/* usage 1:
	int words, amount of words to return
	int plus_minus, random amount of words to add/subtract
usage 2:
	string words, shorthand for int vals
	can be used as lorem("10") or lorem("20, 1")
*/
function lorem(words, plus_minus) {

	// Word list
	var word_list_ar = ["lorem","ipsum","dolor","sit","amet","consectetur","adipisicing","elit","sed","do","eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim","ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi","ut","aliquip","ex","ea","commodo","consequat","duis","aute","irure","dolor","in","reprehenderit","in","voluptate","velit","esse","cillum","dolore","eu","fugiat","nulla","pariatur","excepteur","sint","occaecat","cupidatat","non","proident","sunt","in","culpa","qui","officia","deserunt","mollit","anim","id","est","laborum","sed","ut","perspiciatis","unde","omnis","iste","natus","error","sit","voluptatem","accusantium","doloremque","laudantium","totam","rem","aperiam","eaque","ipsa","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt","explicabo","nemo","enim","ipsam","voluptatem","quia","voluptas","sit","aspernatur","aut","odit","aut","fugit","sed","quia","consequuntur","magni","dolores","eos","qui","ratione","voluptatem","sequi","nesciunt","neque","porro","quisquam","est","qui","dolorem","ipsum","quia","dolor","sit","amet","consectetur","adipisci","velit","sed","quia","non","numquam","eius","modi","tempora","incidunt","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem","ut","enim","ad","minima","veniam","quis","nostrum","exercitationem","ullam","corporis","suscipit","laboriosam","nisi","ut","aliquid","ex","ea","commodi","consequatur","quis","autem","vel","eum","iure","reprehenderit","qui","in","ea","voluptate","velit","esse","quam","nihil","molestiae","consequatur","vel","illum","qui","dolorem","eum","fugiat","quo","voluptas","nulla","pariatur","at","vero","eos","et","accusamus","et","iusto","odio","dignissimos","ducimus","qui","blanditiis","praesentium","voluptatum","deleniti","atque","corrupti","quos","dolores","et","quas","molestias","excepturi","sint","obcaecati","cupiditate","non","provident","similique","sunt","in","culpa","qui","officia","deserunt","mollitia","animi","id","est","laborum","et","dolorum","fuga","harum","quidem","rerum","facilis","est","et","expedita","distinctio","nam","libero","tempore","cum","soluta","nobis","est","eligendi","optio","cumque","nihil","impedit","quo","minus","id","quod","maxime","placeat","facere","possimus","omnis","voluptas","assumenda","est","omnis","dolor","repellendus","temporibus","autem","quibusdam","aut","officiis","debitis","aut","rerum","necessitatibus","saepe","eveniet","ut","et","voluptates","repudiandae","sint","molestiae","non","recusandae","itaque","earum","rerum","hic","tenetur","a","sapiente","delectus","aut","reiciendis","voluptatibus","maiores","alias","consequatur","aut","perferendis","doloribus","asperiores","repellat"];

	var lorem_ar = [];
	var next_sentence_ar = [];

	var generate_base = 0;
	var generate_mod = 0;

	if (isNaN(words)) {

		words = words.split(",");
		generate_base = parseInt(words[0]);
		generate_mod = parseInt(words[1]);

	} else {

		generate_base = parseInt(words);
		generate_mod = plus_minus || 0;

	}

	words_to_generate = Math.max(1, (generate_base+generate_mod)-Math.round(Math.random()*(generate_mod*2)));

	for(i=0; i<words_to_generate; i++) {

		// Get random word
		var rnd = Math.floor(Math.random() * (word_list_ar.length - 1));
		var next_word = word_list_ar[rnd];

		// Capitalize first word
		if (next_sentence_ar.length == 0) {
			next_word = capitalize(next_word);
		}
		// Add word
		next_sentence_ar.push(next_word);

		// Roll for ending sentance
		if ((next_sentence_ar.length >= 2 && Math.random() > 0.7) || i==(words_to_generate-1)) {

			// Roll for adding comma
			if (next_sentence_ar.length >= 4 && Math.random() > 0.3) {
				var rnd = Math.floor(Math.random() * (next_sentence_ar.length - 3)+1);
				next_sentence_ar[rnd] = next_sentence_ar[rnd]+",";
			}

			lorem_ar.push(next_sentence_ar.join(" "));
			next_sentence_ar = [];
		}

	}

	lorem_ar = lorem_ar.join(". ")+".";

	return lorem_ar;
}

function setActiveStyleSheet(title, mode) {
	// Mode: "remove" or undefined
	// Define list of stylesheets, arrays are mutually exclusive
//	console.log(title);
//	console.log(mode);
	var stylesheets_ar = [
		["large_text","medium_text","small_text"],
		["colorblind"],
		["rtl"]
	];

	var css = readCookie("trophymanager[css]") || "";
	css = css.split(",");

	for (var i in stylesheets_ar) {
		if (array_search(title, stylesheets_ar[i]) >= 0) {
			css[i] = (mode == "remove") ? "" : title;
		}
	}

	// Clean up array
	for (i in css) {
		if (css[i] == "") {
			css.splice(i, i+1);
		}
	}

	$("link").each(function(){
		if ($(this).attr("alternate_css") == "true") {
			if (array_search($(this).attr("style_title"), css) >= 0) {
				$(this).attr("rel", "stylesheet");
				$(this).attr("disabled", false);
			} else {
				$(this).attr("rel", "altenate");
				$(this).attr("disabled", true);
			}
		}
	});

	css = css.join(",");
	createCookie("trophymanager[css]", css, 365);
}

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function content_menu_expand(ele) {
	//$(".content_menu div").not("#"+id).slideUp(200);
	var tmp = $(ele).attr("sub_show");
	$("#"+tmp).toggle();
//	console.log("!!");
//	if($("#"+tmp).is(":hidden")) $("#"+tmp).show();
//	else $("#"+tmp).hide();
	$(ele).find(":first-child").toggleClass("minus");
}

function enable_expandable_content2()
{
	var $tmp = $("<div>").attr("id","expandable_temp").css({"overflow":"hidden"}).appendTo("body");
	var i = 0;
	$(".expandable").each(function(){
		if($(this).is(":hidden"))
		{
			$tmp.html("");
			var $clone = $(this).clone(true).appendTo($tmp).show();
//			var $clone = $(this).clone(true).appendTo($tmp).show().end();
			$(this).attr("expand_start_height",$clone.height());
			$clone.remove();
		}
		else
		{
			$(this).attr("expand_start_height",$(this).height());
		}
		var h = $(this).attr("expand_height") || "300";
		$(this).attr("id","expand"+i);
		if($(this).attr("expand_start_height") > h)
		{
			$(this).height(h);
			var div = $("<div/>");
			div.html("<span class='bold' style='position: relative; top: 5px;'>&darr; &darr; &darr;</span>");
//			div.mouseover(function(){$(this).css("background","#343")}).mouseout(function(){$(this).css("background","#477219")});
			div.css({
				"cursor":"pointer",
				"text-align":"center",
				"margin-top":"-25px",
				"position":"relative",
				"z-index":"1",
				"height":"25px",
				"color":"#fff",
				"line-height":"25px",
				"background-color":"transparent",
				"background-image":"url(/pics/expandable_fade.png)",
				"background-repeat":"repeat-x",
				"box-shadow":"0 -8px 15px #578229", //#578229
				"background-position":"left top"
			}).mouseover(function(){$(this).css("color","#cf0")}).mouseout(function(){$(this).css("color","#fff")});
			div.attr("expand_id",i);
			div.attr("expand_time",$("#expand"+$(this).attr("expand_start_height")-h));
			div.click(function(){
				$(this).hide();
				$("#expand"+$(this).attr("expand_id")).animate({
					"height": $("#expand"+$(this).attr("expand_id")).attr("expand_start_height")+"px"
				},$(this).attr("expand_time"), function(){
					$(this).css("height","100%");
				});
			});
			$(this).after(div);
			i++;
		}
	}).css("overflow","hidden");
	$tmp.remove();
}
function enable_expandable_content()
{
	var t = setTimeout("enable_expandable_content2()",50);
}

// Suggestion box global vars
var suggest_clubs_current = "";
var suggest_clubs_blur = true;

// ** Get suggestions ** //
// ****************** //
function suggest_clubs(limit,suggest_input_id)
{
	// Set standard attrs
	suggest_input_id = suggest_input_id || "suggest_clubs";
	limit = limit || 10;

	if($("#"+suggest_input_id).is(":hidden")) return false;
	// Disable autocomplete
	$("#"+suggest_input_id).attr("autocomplete","off");
	// Enabled keydown-function on first type-in
	if($("#"+suggest_input_id).attr("keydown_set") != "true"){
		suggest_clubs_set_keydown(limit,suggest_input_id);
		$("#"+suggest_input_id).attr("keydown_set","true")
	}
	// Enable box remove on blur
	$("#"+suggest_input_id).blur(function(){
		if(suggest_clubs_blur)
		{
			suggest_clubs_clear(suggest_input_id);
		}
	});

	// Get search query
	var q_str = $("#"+suggest_input_id).val();
	if(q_str != "" && q_str != suggest_clubs_current)
	{
		suggest_clubs_current = q_str;
		// Get suggestion box
		$suggest = $("#suggest_clubs_box");
		if($suggest.length == 0){
			var $suggest = $("<div id='suggest_clubs_box'/>").appendTo("body").hide();
		}
		var $pos = $("#"+suggest_input_id).offset();
		$suggest.css({
			"border-radius":"0px 0px 4px 4px",
			"border":"1px solid #41631F",
//			"border-top": "none",
			"background":"#578229",
			"position": "absolute",
			"min-width":"200px",
			"z-index": "100",
			"top": ($pos.top + $("#"+suggest_input_id).outerHeight())+"px",
			"left": ($pos.left)+"px"
		});
		$suggest.html(get_loading_img()).slideDown();
		var settings = "{}";
		if($("#"+suggest_input_id+"_settings").length > 0)
		{
			settings = $("#"+suggest_input_id+"_settings").val();
		}
		// Do ajax
		$.post("/ajax/suggest_clubs.ajax.php",{"q_string":q_str,"limit":limit,"settings":settings},function(data){
			if(data != null)
			{
				// Set selected suggestion to none
				$("#"+suggest_input_id).attr("suggestion_id",0);

				//Get href
				var club_href = $("#"+suggest_input_id+"_href").val() == "" ? "/club/" : $("#"+suggest_input_id+"_href").val();

				$suggest.html("");

				// Get input position and place suggestion box

//				$("body").append($suggest);

				if(data[0] == undefined)
				{ // Nothing found (obviously)
					$suggest.html("<div class='align_center'>* Nothing found *</div>");
				}
				else {
					var j = 1;
					// Loop data and put them in suggestion box
					for(var i in data)
					{
						var clubnick = data[i]["clubnick"] == "" ? "" : " ("+data[i]["clubnick"]+")";
						var country = get_flag(data[i]["country"])+' '+data[i]["division"]+'.'+data[i]["group"];
						var $suggestion = $("<div class='suggestion' />");
						$suggestion.css({
							"cursor":"pointer",
							"padding":"2px 3px 2px 3px"
						});
						$suggestion.append(data[i]["clubname"]+clubnick+' '+country);

						// Set attributes for selection (counter and club_id)
						$suggestion.attr("i",j);
						$suggestion.attr("club_id",data[i]["id"]);
						$suggestion.attr("country",data[i]["country"]);
						$suggestion.attr("id","suggestion_id_"+j);
						//Set hover and click functions
						$suggestion.mouseover(function(){
							suggest_clubs_blur = false;
							$(".suggestion").css({"background":"transparent","white-space":"nowrap"});
							$(this).css("background","#6C9922");
							$("#"+suggest_input_id).attr("suggestion_id",$(this).attr("i"));
						}).mouseout(function(){
							suggest_clubs_blur = true;
							$(this).css("background","transparent");
						});
						$suggestion.click(function(){
							suggest_clubs_select(club_href,$(this));
						});
						// append to box
						$suggest.append($suggestion);
						j++;
					}
				}
				// Place box
				var box_top = ($pos.top +$("#"+suggest_input_id).outerHeight());
				var box_left = $pos.left;
				box_top = box_top + $suggest.outerHeight(true) > $(window).height()  ? $pos.top - $suggest.outerHeight(true) : box_top;
				box_top = box_top < 0 ? ($pos.top +$("#"+suggest_input_id).outerHeight()) : box_top;
				box_left = box_left + $suggest.outerWidth(true) > $(window).width() ? $(window).width() - $suggest.outerWidth(true): box_left;
				$suggest.css({
					"top": box_top+ "px",
					"left":  box_left+"px"
				});
			} //data != null
		},"json");
	}
	else if(q_str == "")
	{
		// Clear box, if search query is empty
		suggest_clubs_clear(suggest_input_id);
	}
}

// Clear suggestion box
function suggest_clubs_clear(suggest_input_id){
	suggest_clubs_current = "";
	$("#suggest_clubs_box").remove();
	$("#"+suggest_input_id).attr("suggestion_id",0);
}

// Excecute select suggestion (go to url/run js)
function suggest_clubs_select(club_href,$suggestion){
	club_href = club_href || "/club/";
	if(club_href.indexOf("javascript:") != -1){
		var func = club_href.split("javascript:");
		var eval_str = func[1]+"('"+$suggestion.attr("club_id")+"','"+$suggestion.attr("i")+"')";
		try	{
			eval(eval_str);
		}
		catch(err){
			//			return false;
		}
	}
	else{
		var locat = "";
		if(club_href.indexOf("XYZ") != -1)
		{
			 locat =  club_href.replace("XYZ",$suggestion.attr("club_id"));
		}
		else
		{
			locat =  club_href+$suggestion.attr("club_id");
		}
		window.location = locat;
	}
}

// Set keyboard functions for selections
function suggest_clubs_set_keydown(limit,suggest_input_id){
	suggest_input_id = suggest_input_id || "suggest_clubs";
	var club_href = $("#"+suggest_input_id+"_href").val() == "" ? "/club/" : $("#"+suggest_input_id+"_href").val();
	$("#"+suggest_input_id).keydown(function(event){
		if(event.keyCode == 40)
		{  // Arrow down
			var new_id = parseInt($(this).attr("suggestion_id"))+1;
			if($("#suggestion_id_"+new_id).length > 0)
			{
				$("#suggestion_id_"+$(this).attr("suggestion_id")).css("background","transparent");
				$(this).attr("suggestion_id",new_id);
				$(".suggestion").css("background","transparent");
				$("#suggestion_id_"+new_id).css("background","#6C9922");
			}
			else if(new_id == 1){
				suggest_clubs_clear(suggest_input_id);
				suggest_clubs(limit,suggest_input_id);
			}
			return false;
		}
		else if(event.keyCode == 38)
		{ // Arrow up
			var new_id = parseInt($(this).attr("suggestion_id"))-1;
			var size = $("#"+suggest_input_id).length;
			if($("#suggestion_id_"+new_id).length > 0)
			{
				$("#suggestion_id_"+$(this).attr("suggestion_id")).css("background","transparent");
				$(this).attr("suggestion_id",new_id);
				$("#suggestion_id_"+new_id).css("background","#6C9922");
			}
			return false;
		}
		else if(event.keyCode == 13 || event.keyCode == 9)
		{// Enter OR Tab
			if($("#suggestion_id_"+$("#"+suggest_input_id).attr("suggestion_id")).length != 0)
			{
				suggest_clubs_select(club_href,$("#suggestion_id_"+$("#"+suggest_input_id).attr("suggestion_id")));
			}
			if(event.keyCode == 13)
			{ // tab possible without selecting club
				return false;
			}
		}
		else if(event.keyCode == 27)
		{ // Escape
			suggest_clubs_clear(suggest_input_id);
			suggest_clubs_current = $("#"+suggest_input_id).val();
			return false;
		}
		else{
			//			console.log(event.keyCode);
		}
	});
}

function create_fundiv() {
	if ($("#fundiv").length == 0) {
		$("<div/>").attr("id","fundiv")
		.css({
			"width":"100%",
			"height" : "100%",
			"background-color" : "#000000",
			"z-index" : "2",
			"position" : "fixed",
			"opacity" : " 0.7",
			"-moz-opacity" : "0.7",
			"cursor" : "pointer",
			"display":"none",
			"left":"0",
			"top":"0"
		}).appendTo("body");
	}
}

function create_overdiv() {
	if (!document.getElementById('overdiv')) {
		var newDiv = document.createElement("div");
		newDiv.id = "overdiv";
		document.body.appendChild(newDiv);
	}
}

function placeElement(name, x, y,ignore_vertical) {
//	console.log(ignore_vertical);
	var elem = document.getElementById(name);
	if (elem) {
//		elem.style.left = x + 'px';
//		if(ignore_vertical ==null || ignore_vertical == false) elem.style.top = y + 'px';
	}
}

function place_element_center(name,ignore_vertical){
	if($e(name)) {
		var myWidth = 0, myHeight = 0;
		if( typeof( window.innerWidth ) == 'number' ) {
			myWidth = window.innerWidth;
			myHeight = window.innerHeight;
		} else if( document.documentElement && ( document.documentElement.clientWidth ||document.documentElement.clientHeight ) ) {
			myWidth = document.documentElement.clientWidth;
			myHeight = document.documentElement.clientHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
			myWidth = document.body.clientWidth;
			myHeight = document.body.clientHeight;
		}
		var elem = $e(name);
		//		alert(myHeight+" "+$(elem).outerHeight());
		var top = myHeight/2-($(elem).outerHeight()/2);
		top = (top < 5) ? 5 : top;
		var left = myWidth/2-300;
		left = (left < 5) ? 5 : left;
		var y = $("body").scrollTop();
		$(elem).css({
			"left":parseInt(left)+"px"
		});
		if(ignore_vertical ==null || ignore_vertical == false)
		{
			$(elem).css({
				"top": (top+y)+"px"
			});
		}
		$("#echo").css({
			"left":"0px",
			"top": "0px"
		});
		$("#fundiv").css({
			"left":"0px",
			"top": "0px"
		});
//		placeElement(name,left,(top+y),ignore_vertical);
//		placeElement("fundiv",0,0);
//		placeElement("echo",0,0);
	}
}
delay_vars_ar=[];
function delay(func,msecs)
{
	var i = delay_vars_ar.length;
	msecs = msecs || 500;
	delay_vars_ar[i] = true;
	setTimeout(function(){
		delay_run(func,i)
	},msecs);

}
var  hoverIntentConfig = {
sensitivity: 3, // number = sensitivity threshold (must be 1 or higher)
interval: 100, // number = milliseconds for onMouseOver polling interval
timeout: 0, // number = milliseconds delay before onMouseOut
over: function() {
//		tooltip.make("make_player_link("+$(this).attr("player_link")+")");
	}, // function = onMouseOver callback (REQUIRED)
out: function() {
		tooltip.hide();
	} // function = onMouseOut callback (REQUIRED)
};
function delay_run(func,i)
{
	if(delay_vars_ar[i] && typeof func == "function")
	{
		func.call();
	}
}
// ** Player Links ** //
function activate_player_links($el)
{
	$el.each(function(){
		var id = $(this).attr("player_link");
		var minigame = $(this).attr('minigame');
		$(this).tooltip(function(){
			make_player_link(id, minigame);
		});
	});
}
players_by_id = {};
function make_player_link(player_id, minigame)
{
	var ajax = false;
	if(players_by_id[player_id])
	{
		if(players_by_id[player_id]["skills"])
		{
			var $player = make_player_tooltip_content(players_by_id[player_id]);
			tooltip.content($player);
		}
		else ajax=true;
	}
	else ajax = true;
	if(ajax)
	{
		$.post("/ajax/tooltip.ajax.php",{"player_id":player_id, minigame: minigame},function(data){
			if(data != null)
			{
				var p = data["player"];
				var $player = make_player_tooltip_content(p);
				tooltip.content($player);
				tooltip.repos();
				if(players_by_id[player_id])
				{
					if(players_by_id[player_id]["plot"])
					{
						var plot = players_by_id[player_id].plot;
						if(SESSION.is_pro) {
							var plot2 = [];
							var ymax=0,xmax=plot.length+1, ymin=0;
							var start_months = p.age*12+Number(p.months)-plot.length+1;
							var months=start_months;
							var start_years = Math.floor(start_months/12);
							var xmax = Number(p.age)+1;
							var xmin = start_months%12>0?start_years:start_years-1;
							var xinterval = 1;
							if(plot.length>12*15) xinterval=2; // more than 15 years of plots
							for(var i in plot) {
								ymax = Math.max(plot[i],ymax);
								ymin = Math.min(plot[i],ymin);
								plot2.push([(months/12),Number(plot[i]),plot[i]]);
								months++;
							}
							var yinterval=Math.ceil((ymax-ymin)/5);
							if(yinterval<1) yinterval=1;
							ymax = 5 * yinterval + ymin;
							$("#tooltip_training_plot").attr("style","height:130px");
							var plot1 = $.jqplot ('tooltip_training_plot', [plot2],{
								grid:{
									background:"transparent",
									borderColor:"#444",
									gridLineColor:"#444",
									shadow:false
								},
								axes: {
									xaxis: {
										tickOptions:{formatString:'%.0f'},
										pad: 0,
										min:xmin,
										tickInterval: xinterval,
										max:xmax,
										label: global_content.age+""
									},
									yaxis: {
										tickOptions:{formatString:'%.0f'},
										min:ymin,
										tickInterval: yinterval,
										max:Math.ceil(ymax),
										pad: 0
									},
								},
								axesDefaults: {
									base: 10,
									tickDistribution: 'even'
								 },
								series:[{
								lineWidth:1,
								markerOptions: {size:1,style:"circle"}
								}],
								seriesColors:["#ffffff"]
								});
						}
						else
						{
							$("#tooltip_training_plot").append(
								$("<img />").addClass("float_right").attr("src","/pics/training_graph_player_tooltip.png?").css("border","1px solid #fff"),
								$("<p />").html(global_content[534]+plot[0]),
								$("<p />").html(global_content[535]+" <img src='/pics/pro_icon.png' />")
							);
						}
					}
				}
			}
			else
			{
				tooltip.content("An error occured...");
			}
		},"json");
	}
}
function make_player_tooltip_content(p)
{
	var $player = $("<div />").addClass("player_tooltip");
	if(p)
	{
		var retire = " <img src='/pics/icons/retire.gif' title='This player is retiring after this season'>";
		// General info
		var $div = $("<div />").appendTo($player);
		if(p["retired"])
		{
			$div.append("<div class='large align_center'>"+p["name"]+"</div>");
		}
		else
		{
			$div.append("<div class='large align_center'>"+p["no"]+". "+p["name"]+" "+p["flag"]+"</div>");
			$div.append("<div class='align_center'>"+p["favorite_position"]+"</div>");
			var $table = $("<table />").appendTo($player);
			var image = p["appearance"];
			var skill_index = p["show_asi"] ? "<td class='align_left'>"+global_content["skill_index"]+"</td><td>"+p["skill_index"]+"</td>" : "<td></td><td></td>";
			$table
			.append("<tr><td rowspan='8'>"+image+"</td><td></td><td></td></tr>")
			.append("<tr><td class='align_left'>"+global_content["club"]+"</td><td>"+p["club_name"]+"</td></tr>")
			.append("<tr><td class='align_left'>"+global_content["age"]+"</td><td>"+p["age"]+" "+global_content["years"]+" "+p["months"]+" "+global_content["months"]+"</td></tr>")
			.append("<tr><td class='align_left'>"+global_content["status"]+"</td><td>"+p["status"]+(p["isretirering"]==1?retire:"")+"</td></tr>")
			.append("<tr><td class='align_left'>"+global_content["routine"]+"</td><td>"+p["routine"]+"</td></tr>")
			.append("<tr><td class='align_left'>"+global_content["recommendation"]+"</td><td>"+p["recommendation"]+"</td></tr>")
			.append("<tr>"+skill_index+"</tr>")
			.append("<tr><td></td><td></td></tr>");

			// Skills
			var $table = $("<table />").appendTo($player).addClass("padding");
			for(var i = 0; i < p["skills"].length; i+=2)
			{
				var skill1 = p["skills"][i];
				var skill2 = p["skills"][i+1];
				skill1 = skill1["value"] == null ? {"value":"&nbsp;","name":"&nbsp;"} : {"value":skill1["value"],"name":global_content[skill1["key"]]};
				skill2 = skill2["value"] == null ? {"value":"&nbsp;","name":"&nbsp;"} : {"value":skill2["value"],"name":global_content[skill2["key"]]};
				$table.append("<tr><td style=\"width:40%\">"+skill1["name"]+"</td><td class=\"align_right\">"+skill1["value"]+"</td><td class=\"split\">&nbsp;</td><td style=\"width:40%\">"+skill2["name"]+"</td><td class=\"align_right\">"+skill2["value"]+"</td></tr>");
			}
			// Rec
			table_zebra($table);
			$player.append($("<div />").attr("id","tooltip_training_plot"));
		}
	}
	return $player;
}
function activate_match_links($el)
{
	$el.each(function(){
		var id = $(this).attr("id");
		$(this).tooltip(function(){
			make_match_link(id);
		});
	});
}
function make_match_link(link_id)
{
	var $link = $("#"+link_id);
	tooltip.content(get_loading_img("small"));
	var data = {};
	if($link.attr("match_link") == "-1")
	{
		data = jQuery.parseJSON($link.attr("match_json"));
		make_match_data(data);
	}
	else
	{
		$.post("/ajax/tooltip.ajax.php",{"type":"match","match_id":$link.attr("match_link"),"season":$link.attr("match_season")},function(json_data){
			if(data != null)
			{
				data = json_data;
				make_match_data(data);
			}
		},"json");
	}
	// make match info
}
function make_match_data(data)
{
	var $div = $("<div>").addClass("match_tooltip");
	var $table = $("<table />").addClass("zebra").appendTo($div);
	var $tbody = $("<tbody>").appendTo($table);
	var $tr = $("<tr>").html("<th class=\"align_center\">Minute</th><th class=\"align_right\" style=\"100px;\">"+data["hometeam_name"]+"</th><th class=\"align_center\">"+data["result"]+"</th><th class=\"align_left\">"+data["awayteam_name"]+"</th>").appendTo($tbody);
	$tbody.append("<tr>");
	$tbody.append("<tr><th colspan=\"4\"><hr class=\"dotted\"></th></tr>");
	for(var i in data["report"])
	{
		var row = data["report"][i];
		if(row)
		{
			var $tr = $("<tr>").appendTo($tbody);
			if(row["minute"] > 0 || row["minute"]=='x')
			{ // Regular action: cards/scores
				var home = "", away="",score ="";
				if(row["team_scores"] == data["hometeam"])
				{
					home = row["score"] == "yellow" ? "<img src='/pics/icons/yellow_card.gif'>"
					: (row["score"] == "red" ? "<img src='/pics/icons/red_card.gif'>"
					: (row["score"] == "orange" ? "<img src='/pics/icons/yellow_red_card.gif'>"
					: " <img src='/pics/feed/feed_icons/12.gif'>"));
					home += " "+row["scorer_name"];
				}
				if(row["team_scores"] == data["awayteam"])
				{
					away = row["scorer_name"]+" ";
					away += row["score"] == "yellow" ? "<img src='/pics/icons/yellow_card.gif'>"
					: (row["score"] == "red" ? "<img src='/pics/icons/red_card.gif'>"
					: (row["score"] == "orange" ? "<img src='/pics/icons/yellow_red_card.gif'>"
					: " <img src='/pics/feed/feed_icons/12.gif'>"));
				}
				score = row["score"] == "yellow" || row["score"] == "red" || row["score"] == "orange" ? " " : row["score"];
				if(row["minute"]=='x')
				{ // Pen Shoot Out
					$tr
						.append("<td class=\"align_center\">"+global_content["pen"]+"</td>");
				}
				else
				{
					$tr
						.append("<td class=\"align_center\">'"+zeros(row["minute"],2)+"</td>");
				}
				$tr
					.append("<td class=\"align_right\">"+home+"</td>")
					.append("<td class=\"align_center\">"+score+"</td>")
					.append("<td class=\"align_left\">"+away+"</td>");
			}
		}
	}
	$div.append("<div class=\"align_center\"><span class=\"small\">Attendance:</span> <strong>"+data["attendance_format"]+"</strong></div>");
	$div.append("<div class=\"align_center\"><span class=\"small\">Man of the Match:</span> <strong>"+data["report"]["mom_name"]+"</strong></div>");
	table_zebra($table);
	tooltip.content($div);
}
// ** Club Links ** //
function activate_club_links($el)
{
	$el.each(function(){
		var id = $(this).attr("club_link");
		$(this).tooltip(function(){
			make_club_link(id);
		});
	});
}

function make_club_link(club_id)
{

	tooltip.content(get_loading_img());
	$.post("/ajax/tooltip.ajax.php",{"club_id":club_id},function(data){
		if(data != null)
		{ // Club Name, flag, Division Name (3.17), Position, Logo, Economy, Created, Last login, online indicato
			var club = data["club"];
			var online = online_indicator(club["online"]);
			if(club["status"] == "b")
			{
				if (club["created"] == 'inactive') online = "<img src='/pics/icons/lg_ina.gif' />";
				else online = "<img src='/pics/icons/lg_ban.gif' />";
			}
			var html = "<div style='padding-bottom: 10px;'>"+"<img src='"+club["logo_url"]+"' style='width: 60px' class='float_right'>"+"<span class='very_large bold'>"+club["club_name"]+"</span> "+online
			+"<div>"+club["pro_icon"]+" "+club["b_team_icon"]+" "+get_flag(club["country"])+"</div>"
			+"<ul class='clean zebra' style='margin-top:15px; margin-right: 70px;'>"
			+"<li style='padding: 3px;'>"+"<span class='bold'>"+club["league_name"]+"</span> ("+club["division"]+"."+club["group"]+")"+"</li>";
			if(club["main_team"] !="")
			{
				html += "<li style='padding: 3px;'>"+global_content[473]+" "+club["main_team"]+"</li>";
			}
			html += "<li style='padding: 3px;'>"+global_content[469]+" "+club["created"]+"</li>"
			+"<li style='padding: 3px;'>"+global_content[470]+" "+club["economy"]+"</li>"
			+"<li style='padding: 3px;'>"+global_content[471]+" "+club["last_seen"]+"</li>"
//			+"<li>"+"League position"+"</li>"
			+"</ul>"
			+"</div>";
			tooltip.content(html);
			ul_zebra($("#tooltip").find(".zebra"));
			tooltip.repos();
		}
	},"json");
}
// ** League Links ** //
function activate_league_links($el)
{
	$el.each(function(){
		var id = $(this).attr("league_link");
		var div = $(this).attr("division");
		$(this).tooltip(function(){
			make_league_link(id,div);
		});
	});
}
function make_league_link(country,division)
{
	tooltip.content(get_loading_img());
	$.post("/ajax/tooltip.ajax.php",{"league_country":country},function(data){
		if(data != null)
		{
			var html = "<div class='align_center' style='padding-bottom: 5px;'><div class='very_large bold' style='padding-bottom: 5px;'>"+global_content[468]+" "+get_flag(country)+"</div>";
			for(var i in data["divisions"])
			{
				var div = data["divisions"][i];
				if(div)
				{
					var odd = i % 2 == 0 ? "" : "odd";
					if(parseInt(div["division"]) == division)
					{
						html += "<div class='large bold "+odd+"'>&raquo; "+div["name"]+" &laquo;</div>";
					}
					else
					{
						html += "<div class='"+odd+"'>"+div["name"]+"</div>"; //(div["division"]>1 ? " ("+div["groups"]+" groups)" : "")+"</div>";
					}
				}
			}
			html += "</div>";
			tooltip.content(html);
			tooltip.repos();
		}
		else
		{
			tooltip.content("An error occured.");
		}
	},"json");
}

function slide_toggle(id,update)
{
	$("#"+id).slideToggle(200);
	$("#"+id+"_arrow").toggleClass("slide_toggle_closed");
	$("#"+id+"_arrow").toggleClass("slide_toggle_open");
	$("#"+id).removeClass("display_none");
	if(update)
	{
		var bool = $("#"+id+"_arrow").hasClass("slide_toggle_open") ? 1 : 0;
		update_settings(id,bool);
	}
}
function update_settings(setting,show)
{
	$.post("/ajax/settings_set.ajax.php",{"setting":"home_"+setting,"show":show},null,"raw");
}

// ** Loading image ** //
function get_loading_image(size) {
	if (size == "big") return $('<img class="loading" src="/pics/big_loading.gif" alt="loading..." title="loading..." />');
	return $('<img class="loading" src="/pics/small_circular_loading.gif" alt="loading..." title="loading..." />');
}
function get_loading_img(size)
{
	var img;
	if(size == "big") img = '<img class="loading" src="/pics/big_loading.gif" alt="loading..." title="loading..." />';
	else if(size == "hori") img = '<img class="loading" src="/pics/five_horizontal_loading.gif" alt="loading..." title="loading..." />';
	else img = '<img class="loading" src="/pics/small_circular_loading.gif" alt="loading..." title="loading..." />';
	return img;
}
function show_loading_image($obj,size)
{
	hide_loading_image();
	$("<div />").css({"background":"#000","position":"absolute", "top":$obj.offset().top+"px","left":$obj.offset().left+"px","text-align":"center","z-index":"4","opacity":".3","width":$obj.outerWidth(true)+"px","height":$obj.outerHeight(true)+"px"}).html("").attr("id","loading_image_background").appendTo("body");
	var img_top = $obj.offset().top+parseInt($obj.outerHeight(true)/4);
	var img_left = $obj.offset().left+parseInt($obj.outerWidth(true)/2);
	var $img = $(get_loading_img(size)).css({"position":"absolute", "top":img_top+"px","left":img_left+"px","z-index":"5"}).attr("id","loading_image").appendTo("body");
}
function hide_loading_image()
{
	$("#loading_image").remove();
	$("#loading_image_background").remove();
}
function error_loading_image()
{
	var $img = $("#loading_image");
	var $error = $("<div><strong>An error occured..</strong></div>").css({"position":"absolute", "top":$img.offset().top+"px","left":$img.offset().left+"px","z-index":"5"}).attr("id","loading_image");
	//	$error.css($img.css());
	$img.replaceWith($error);
	var t = setTimeout("hide_loading_image()",3000);
}

// Radio input
function make_radio(id)
{
	var $el = $("#"+id);
	if($el.is("input[type=radio]"))
	{ // Convert input tags
		var $ul = $("#"+id+"_radio_ul");
		if($ul.length == 0) $ul = $("<ul />").attr("id",id+"_radio_ul").addClass("radio_buttons");
		// For re-make_radio of the already make_radioed radio buttons
		$("[radio_name="+$el.attr("name")+"]").remove();
		// Make radiobuttons
		$("[name="+$el.attr("name")+"]").each(function(){
			var $li = $("<li />").addClass("radio").addClass($(this).attr("class")).attr("radio_val",$(this).val()).attr("input_id",$(this).attr("id")).attr("radio_name",$(this).attr("name"));
			$("<div />").addClass("hover_text").addClass($("label[for="+$(this).attr("id")+"]").attr("class")).html($("label[for="+$(this).attr("id")+"]").html()).appendTo($li);
			$li.attr("tabindex",$(this).attr("tabindex"));
			if($(this).is(":checked")) $li.addClass("selected");
			if($(this).is(":disabled")) $li.addClass("disabled");
			//			if($(this).is(":checked") && $(this).is(":disabled")) $li.addClass("disabled_selected");
			//hide input tag
			$(this).hide();
			$("label[for="+$(this).attr("id")+"]").hide();
			// append
			$li.appendTo($ul);
		});
		$el = $ul.insertAfter($el);
	}
	$el.find(".radio").each(function(){
		$(this).unbind();
		if($(this).find(".radio_label").length == 0)
		{
			$(this).html("<div class=\"radio_label\">"+$(this).html()+"</div>");
			$(this).prepend("<div class=\"radio_img\"></div>");
		}
		$(this)
		.mouseover(function(){
			$(this).addClass("hover");
		})
		.focus(function(){
			$(this).addClass("hover");
		})
		.mouseout(function(){
			$(this).removeClass("hover");
		})
		.blur(function(){
			$(this).removeClass("hover");
		})
		.click(function(){
			$el.find(".radio").removeClass("selected");
			$(this).addClass("selected");
			eval($(this).attr("event"));
			$el.attr("radio_val",$(this).attr("radio_val"));
			$("#"+$(this).attr("input_id")).attr("checked",true).trigger("change");
		})
		.keypress(function(){
			$(this).click();
		}).bind('keydown',function(e){
			if(e.which == 38)
			{ // Arrow up
				$(this).prev().focus().click();
				return false;
			}
			else if(e.which == 40)
			{ // Arrow down
				$(this).next().focus().click();
				return false;
			}
		});
		//		if($(this).hasClass("selected")) ($(this).click());
		// Unbind and stuff for disabled
		if($(this).hasClass("disabled")) $(this).unbind();
	});
}
function make_checkbox(id,no_hash)
{
	no_hash = no_hash || false;
	if(!no_hash)
	{
		var $els = $("#"+id);
	}
	else
	{
		var $els = $(id);
	}
	$els.each(function(){
		$el = $(this);
		if($el.is("input[type=checkbox]"))
		{

			var $checkbox = $("<div />").attr("id",$(this).attr("id")+"_checkbox").addClass("checkbox").attr("input_id",$(this).attr("id"));
			$checkbox.append("<div class=\"checkbox_img\"></div>").append("<div class=\"checkbox_label\">"+$("[for="+$(this).attr("id")+"]").html()+"</div>");
			$checkbox.attr("event",$el.attr("onchange"));
			$checkbox.attr("check_val",$el.val());
			$checkbox.attr("tabindex",$el.attr("tabindex"));
			if($el.is(":checked")) $checkbox.addClass("selected");
			if($el.is(":disabled")) $checkbox.addClass("disabled");
			$el.hide();
			$("[for="+$(this).attr("id")+"]").hide();
			$el = $checkbox.insertAfter($el);
		}
		if($el.find(".checkbox_label").length == 0)
		{
			$el.append("<div class=\"checkbox_img\"></div>").append("<div class=\"checkbox_label\"></div>");
		}
		$el
		.mouseover(function(){
			$(this).addClass("hover");
		})
		.focus(function(){
			$(this).addClass("hover");
		})
		.mouseout(function(){
			$(this).removeClass("hover");
		})
		.blur(function(){
			$(this).removeClass("hover");
		})
		.click(function(){
			$(this).toggleClass("selected");
			if($(this).hasClass("selected")) $("#"+$(this).attr("input_id")).attr("checked",true).val($(this).attr("check_val"));
			else  $("#"+$(this).attr("input_id")).attr("checked",false).val(0);
			eval($(this).attr("event"));
			$el.attr("radio_val",$(this).attr("radio_val"));
			$("#"+$(this).attr("input_id")).trigger("change");
		})
		.keydown(function(e){
			if(e.keyCode == 13 || e.keyCode==32)
			{
				$(this).click();
			}
		});
		if($el.hasClass("disabled")) $el.unbind();
	}); // els each
}
// zebra table
function fix_tables() { $("table").attr("cellspacing","0").attr("cellpadding","0"); }
function zebra() {
	// Table fixes
	$("table.zebra").each(function(){table_zebra($(this));});
	$("ul.zebra").each(function(){ul_zebra($(this));});
}
function table_zebra($table)
{
	fix_tables();
	$table.find("tr:nth-child(even)").addClass("odd"); // godt lavet
	$table.find("tr:nth-child(odd)").removeClass("odd"); // godt lavet
}
// zebra List
function ul_zebra($ul)
{
	$ul.find("li:nth-child(even)").addClass("odd"); // godt lavet
	$ul.find("li:nth-child(odd)").removeClass("odd"); // godt lavet
}
function sortable_tables()
{
	$("table.tablesorter").tablesorter({
		  textExtraction: function(node) {
			return $(node).attr('sortvalue') || $(node).text();
		  }
	});
	$("table.tablesorter").bind("sortEnd",function() {
        if($(this).hasClass("zebra")) table_zebra($(this));
    });
}
function get_flag(country)
{
	if (country == "") return "";
	return "<img src=\"/pics/flags/gradient/"+country+".png\" />";
}

function make_text_fade($obj,type)
{
	if(type == "forum")
	{
		var img = $obj.parent().hasClass("hover") ? "forum/hover_background_fade.png" : "forum/background_fade.png";
		$obj.parent()
		.mouseover(function(){
			$obj.find(".text_fade_overlay").css("background","url(/pics/forum/hover_background_fade.png)").addClass("hover");
		})
		.mouseout(function(){
			$obj.find(".text_fade_overlay").css("background","url(/pics/forum/background_fade.png)").removeClass("hover");
		});
	}
	else
	{
		var img = $obj.hasClass("message_unread") || $obj.parent().hasClass("message_unread") || $obj.hasClass("odd") || $obj.parent().hasClass("odd")  ? "green_fade_right_light.png" : "green_fade_right.png";
	}
	if($obj.css("position") == "" || $obj.css("position") == "static") $obj.css("position","relative");
//	var pos = $obj.position();
	var border = parseInt($obj.css("border-top-width"));
	var innerHeight = $obj.innerHeight();
	var $div = $("<div />").addClass("text_fade_overlay").css({
		"position":"absolute",
//		"z-index":"2",
//		"left":(pos.left-23+$obj.width()+parseInt($obj.css("padding-left")))+"px",
//		"top":($obj.position().top+border)+"px",
		"margin-left":($obj.width()-23+parseInt($obj.css("padding-left")))+"px",
//		"top":(border)+"px",
		"height":innerHeight-2+"px",
		"width":"23px",
		"background":"url(/pics/"+img+") repeat-y top right"
	}).prependTo($obj);
}

// ** Countdown
function make_countdown(elem_id,seconds_count,text_array)
{
	if($(elem_id).length == 0) return false;
	text_array = text_array || ["days","hours","minutes","seconds"];
	// Calculate days/hours/minutes/seconds
	var days = hours = minutes = seconds = 0;
	days = Math.floor(seconds_count / (60*60*24));
	hours = Math.floor((seconds_count - (days * 60*60*24)) / (60*60));
	minutes = Math.floor((seconds_count - (days * 60*60*24) - (hours * 60*60)) / (60));
	seconds = seconds_count - (days * 60*60*24) - (hours * 60*60) - (minutes * 60);
	if(days < 0 || hours < 0 || minutes < 0 || seconds < 0) days = hours = minutes = seconds = 0;
	// Add stylesheet if it doesn't exist
	if($("link#countdown_styles").length == 0)
	{
		$("head").append("<link rel=\"stylesheet\" href=\"/css/countdown.css\" id=\"countdown_styles\" />");
	}
	// Add count divs
	var $count = $("<div />").addClass("countdown_outer")
	.append("<div class=\"days\">"+zeros(days,2)+"</div>")
	.append("<div class=\"hours\">"+zeros(hours,2)+"</div>")
	.append("<div class=\"minutes\">"+zeros(minutes,2)+"</div>")
	.append("<div class=\"seconds\">"+zeros(seconds,2)+"</div>")
	.appendTo($(elem_id));
	// Add text divs
	var $text = $("<div />").addClass("countdown_text")
	.append("<div class=\"days\">"+text_array[0]+"</div>")
	.append("<div class=\"hours\">"+text_array[1]+"</div>")
	.append("<div class=\"minutes\">"+text_array[2]+"</div>")
	.append("<div class=\"seconds\">"+text_array[3]+"</div>")
	.appendTo($(elem_id));
	// Start count
	var t = setTimeout(function(){countdown($count);},1000);
}
function countdown($elem) {
	var continue_update = true;
	var days = eval($elem.find(".days").html());
	var hours = eval($elem.find(".hours").html());
	var minutes = eval($elem.find(".minutes").html());
	var seconds = eval($elem.find(".seconds").html());
	if(seconds == 0)
	{
		seconds = "59";
		if(minutes == 0)
		{
			minutes = "59";
			if(hours == 0)
			{
				hours = "23";
				if(days == 0)
				{
					days = hours = minutes = seconds = 0;
					continue_update = false;
				}
				else	days--;
			}
			else hours--;
		}
		else 	minutes--;
	}
	else	seconds--;

	$elem.find(".days").html(zeros(days,2));
	$elem.find(".hours").html(zeros(hours,2))
	$elem.find(".minutes").html(zeros(minutes,2))
	$elem.find(".seconds").html(zeros(seconds,2))
	if(continue_update)
	{
		var t = setTimeout(function(){countdown($elem);},1000);
	}
}
function zeros(val,digits){
	val = ""+val;
	var length = val.length;
	if(length < digits)
	{
		for(var i=length; i <digits;i++)
		{
			val = "0"+val;
		}
	}
	return val;
}

// Function include js and styles
function include_pop_message()
{
	if($("link.pop_message_include").length == 0)
	{
		$("<link />")
		.attr("rel","stylesheet")
		.attr("type","text/css")
		.attr("href","/css/pop_message.css")
		.attr("class","pop_message_include")
		.appendTo("head");
	}
	if($("script.pop_message_include").length == 0)
	{
		$("<script />")
		.attr("type","text/javascript")
		.attr("src","/js/pop_message.js")
		.attr("class","pop_message_include")
		.appendTo("head");
	}
}

function make_highlighted_tr($table)
{
	console.log("Deprecated function: make_highlighted_tr()");
/*	$table.find("tr").each(function(){
		$(this).children(":first").css("border-left","2px solid #578229").parent().children(":last").css("border-right","5px solid #578229");
	});
	$table.find(".highlighted_row").each(function(){
		$(this).children().css({"border-top":" 2px solid #cf0","border-bottom":"2px solid #cf0"}).parent().children(":first").css("border-left","2px solid #cf0").parent().children(":last").css("border-right","5px solid #cf0");
	}); */
}
function make_highlighted_rows()
{
	$(".highlighted_row").each(function(){
		$tr = $(this);
		$tr.siblings("tr").each(function(){
			if($tr != $(this))
			{
				$(this).children(":first").addClass("highlight_td_left_std");
				$(this).children(":last").addClass("highlight_td_right_std");
			}
		});
		$tr.children().addClass("highlight_td");
		$tr.children(":first").addClass("highlight_td_left");
		$tr.children(":last").addClass("highlight_td_right");

		$tr.removeClass("highlighted_row").addClass("highlighted_row_done");
	});
}

// *** Message Box (lightbox) *** //
// ** Message pop-up ** //
// ****************** //
function show_message_box(callback){
	$("#fundiv").fadeIn(200);
	$("#fundiv").click(function(){
		close_message_box();
	});
	$msg = $("#msg");
	$msg.css("visibility","hidden");
	$msg.show();
	place_element_center("msg",true);
	$msg.css("margin-top",$(document).scrollTop()+"px");
	$msg.hide();
	$msg.css("visibility","visible");
	add_close_button();
	$msg.fadeIn(300,function(){
		if(typeof callback == "function"){
			callback.call(this);
		}
	});
}
function add_close_button()
{
	if($("#msg").find(".close_btn").length == 0)
	{
		var $b = $('<div class="close_btn" style="position: absolute; top: -10px; left: auto; right: -10px; " onclick="close_message_box();"></div>');
		$b.mouseover(function(){$(this).addClass("hover")}).mouseout(function(){$(this).removeClass("hover")});
		$msg.append($b);
	}
}
function show_echo_box(text,icon)
{
	//	create_echo_box();
	var $echo = $("#echo");
	if(icon == "loading")
	{
		text += " "+get_loading_img();
	}
	else if(icon == "check")
	{
		text += " <img src=\"/pics/green_check.png\" />";
	}
	else if(icon == "fail")
	{
		text += " <span class='error'>fail</span>";
	}
	$echo.html(text).slideDown(200);
}

function hide_echo_box(text)
{
	$("#echo").slideUp(200);
}

function close_message_box(){
	$("#msg").fadeOut(200);
	$("#fundiv").fadeOut(200);
	$("#echo").hide();
	$("#msgreply").html("");
}
function create_echo_box()
{
	var $echo = $("#echo");
	if ($echo.length == 0) {
		$echo = $("<div id=\"echo\" />");
		$("body").append($echo);
	}
	$echo.css({
		"position" : "fixed",
		"top":"0",
		"left":"0",
		"margin-top" : "2px",
		"text-align" : "center",
		"font-weight" : "bold",
		"z-index" : "3",
		"width" : "100%",
		"height" : "auto",
		"display" : "none",
		"padding-bottom" : " 3px",
		"background" : " #222"
	});
}
function create_message_box(){
	create_fundiv();
	create_echo_box();
	var $msg = $("#msg");
	if ($msg.length == 0) {
		$msg = $("<div/>").attr("id","msg").appendTo("body");
	}
	$msg.attr("style","");
}

function button_disable($button)
{
	if(!$button.hasClass("disabled") && $button.length > 0)
	{
		var onclick_str = $button.attr("onclick") || "";
		var href_str = $button.attr("href") || "";
		$button
		.addClass("disabled")
		.attr("hrefref",href_str)
		.attr("href","javascript:void(0)")
		.attr("onclickref",onclick_str)
		.attr("onclick","")
		.unbind("click")
		.unbind("keypress");
	}
}
function button_enable($button)
{
	if($button.hasClass("disabled") && $button.length > 0)
	{
		var href_str = $button.attr("hrefref") || "";
		var onclick_str = $button.attr("onclickref") || "";
		$button
		.removeClass("disabled")
		.attr("href",href_str)
		.attr("hrefref","#")
		.attr("onclick",onclick_str)
		.attr("onclickref","");
	}
}
// Flag format for selectmenu

var flag_format = function(text){
	var newText = text;
	//array of find replaces
	var findreps = [
	{find:/\[([a-z]+?)\]/g, rep: '<img src="/pics/flags/gradient/$1.png" style="margin-left: 5px;height: 10px;"/>'},
	];
	for(var i in findreps){
		newText = newText.replace(findreps[i].find, findreps[i].rep);
	}
	return newText;
};
var mousemove_scroll;
// ** Vertical Scroll Jquery Plugin (by Jonas ;o)) ** //
//  Must include the vertical scroll styles and the mousewheel plugin (since firefox is weird)
// Vertical Scroll
(function($) {
	$.fn.verticalScroll = function(settings)
	{
		var default_settings = {
			force_scroll: false,
			style:"normal",
			scroll_width:20
		};
		settings = $.extend({}, default_settings, settings);
		$(this).each(function(){
			var $content = $(this);
			if(!$(this).parent().hasClass("vertical_scroll"))
			{
				var w = $(this).width();
				var h = $(this).height();
				var $box = $("<div />").addClass("vertical_scroll");
				//	$(".vertical_scroll:first").each(function(){

				$content.addClass("vertical_scroll_content");
				$box.css({
					"overflow":"hidden",
					"height":h+"px",
					"width":w+"px",
					"margin-top":$(this).css("margin-top"),
					"margin-right":$(this).css("margin-right"),
					"margin-bottom":$(this).css("margin-bottom"),
					"margin-left":$(this).css("margin-left"),
					"border-top-color":$(this).css("border-top-color"),
					"border-top-width":$(this).css("border-top-width"),
					"border-top-style":$(this).css("border-top-style"),
					"border-right-color":$(this).css("border-right-color"),
					"border-right-width":$(this).css("border-right-width"),
					"border-right-style":$(this).css("border-right-style"),
					"border-bottom-color":$(this).css("border-bottom-color"),
					"border-bottom-width":$(this).css("border-bottom-width"),
					"border-bottom-style":$(this).css("border-bottom-style"),
					"border-left-color":$(this).css("border-left-color"),
					"border-left-width":$(this).css("border-left-width"),
					"border-left-style":$(this).css("border-left-style")
				});
				$content.css({
					"height":h+"px",
					"width":w+"px",
					"margin":"auto",
					"top":"0",
					"border":"none"
				});
				$box.insertBefore($content);
				$box.html($content);
				$box.width(w).height(h);
				$content.width(w-settings["scroll_width"]-1);
				$content.css("height","auto");
				// Check for scroll
				if($content.height() - h <= 0 && !settings["force_scroll"]) return false;
				var $scroll = $("<div>").addClass("vertical_scroll_bar").width(settings["scroll_width"]+1).height(h).appendTo($box);
				if(settings["style"] == "dark") $scroll.addClass("dark_scroll");
				$(this).append("<div class=\"clear\"></div>");
				var $button = $("<div class=\"vertical_button\"><div class=\"button_border\"></div></div>").appendTo($scroll);
			}
			else // hasClass
			{
				var $box = $content.parent();
				var w = $box.width();
				var h = $box.height();
				var $button = $box.find(".vertical_button");
				var $scroll = $box.find(".vertical_scroll_bar");
				$content.css("top",0);
				$button.css("top",0);
			}
			var move;
			var mx;
			var my;
			if($content.height() - h <= 0) $button.addClass("disabled");
			else $button.removeClass("disabled");
			if(!$button.hasClass("disabled"))
			{
				$button
				.mousedown(function(e){
					mx = e.pageX;
					my = e.pageY;
					var pos = parseInt($button.css("top"));
					var pos_content = parseInt($content.css("top")) * -1;
					$(this).addClass("active");
					var move_height = $content.height() - h;
					var scroll_height = h - $(this).outerHeight(true);
					var pixel_scale = scroll_height/move_height;
					var mousemove_scroll = function(ev){
						var y = ev.pageY;
						var top_content = pos_content+parseInt((y-my) / pixel_scale);
						var top = pos+y-my;
						top = top < 0 ? 0 : top;
						var max_pos = $button.parent().height() - $button.outerHeight(true);
						top = top > max_pos ? max_pos : top;
						top_content = top_content > move_height ? move_height : top_content;
						top_content = top_content < 0 ? 0 : top_content;
						$button.css({
							"top": top+"px"
						});
						$content.css({
							"top": "-"+top_content+"px"
						});
					};
					$(document).bind("mousemove",mousemove_scroll)
					.mouseup(function(){
						$button.removeClass("active");
						$(this).unbind("mousemove",mousemove_scroll);
					});
					return false;
				})
				/*				.mouseup(function(){
$(this).removeClass("active");
move.unbind("mousemove");
}) */
				.click(function(){
					$box.focus()
				});
				var pixels = 13;
				function do_mousewheel(e){
					e = e.originalEvent;
					var max_pos = $button.parent().height() - $button.outerHeight(true);
					var move_height = $content.height() - h;
					var scroll_height = h - $button.outerHeight(true);
					var pixel_scale = scroll_height/move_height;
					if(e.wheelDelta) var y = e.wheelDelta / -120 * (pixels * 3);
					else var y = e.detail * pixels;
					// Button Position
					var pos = parseInt($button.css("top"));
					var top = pos+parseInt(y*pixel_scale);
					top = top < 0 ? 0 : top;
					top = top > max_pos ? max_pos : top;
					// Content Position
					var pos_content = parseInt($content.css("top"));
					var top_content = (pos_content*-1)+parseInt(y);
					top_content = top_content > move_height ? move_height : top_content;
					top_content = top_content < 0 ? 0 : top_content;
					$button.css({
						"top": top+"px"
					});
					$content.css({
						"top": "-"+top_content+"px"
					});
					//			if(top < max_pos && top > 0)
					return false;

				}
				$box.bind("DOMMouseScroll",do_mousewheel); /// Weeee FFF..!!! (Fucking Fire Fucks)
				$box.bind("mousewheel",do_mousewheel);
				var key_down;
				$box.attr("tabindex","-1").focus(function(){
					key_down = $(this).keydown(function(e){
						var move;
						if(e.which == 40)
						{// Down
							move = 1;
						}
						else if(e.which == 38)
						{ // Up
							move = -1;
						}
						else if(e.which == 34)
						{// page down
							move = parseInt((h-pixels)/pixels);
						}
						else if(e.which == 33)
						{// page up
							move = parseInt((h-pixels)/pixels) *-1;
						}
						if(move)
						{
							var max_pos = $button.parent().height() - $button.outerHeight(true);
							var move_height = $content.height() - h;
							var scroll_height = h - $button.outerHeight(true);
							var pixel_scale = scroll_height/move_height;
							var y = move*pixels;
							// Button Position
							var pos = parseInt($button.css("top"));
							var top = pos+parseInt(y*pixel_scale);
							top = top < 0 ? 0 : top;
							top = top > max_pos ? max_pos : top;
							// Content Position
							var pos_content = parseInt($content.css("top"));
							var top_content = (pos_content*-1)+parseInt(y);
							top_content = top_content > move_height ? move_height : top_content;
							top_content = top_content < 0 ? 0 : top_content;
							$button.css({
								"top": top+"px"
							});
							$content.css({
								"top": "-"+top_content+"px"
							});
							return false;
						}
					});
				})
				.blur(function(){
					key_down.unbind("keydown");
				});
			}
			else// disabled
			{
				$box.unbind();
				$button.unbind();
			}
		});

	};
})(jQuery);

(function($) {
	$.fn.get_player_link = function(settings)
	{
		//	settings = $.extend({}, $.fn.verticalScroll.defaults, settings);
		$(this).each(function(){
			if($(this).is(":visible"))
			{
				var $p = $(this);
				var player_id = $p.attr("player_id");
				var name = $p.attr("name");
				var tooltip = $p.attr("tooltip");
				var auto_tooltip = $p.attr("auto_tooltip");
				var icon = $p.attr("icon");
				var flag = $p.attr("flag");
				var html = get_player_link({"flag":flag,"icon":icon,"auto_tooltip":auto_tooltip,"tooltip":tooltip,"name":name,"id": player_id});
				$p.after(html);
				$p.hide();
				$p.remove();
			}
		});
	};
})(jQuery);

function get_player_link(array) {
	if(typeof array == "object")
	{
		var $a = $("<a />");
		if(array["tooltip"]) $a.attr("tooltip",array["tooltip"]);
		if(array["auto_tooltip"]) $a.attr("player_link",array["id"]);
		$a.attr("href","/player/"+array["id"]+"/"+(array["name"] ? array["name"]+"/" : ""));
		$a.html(array["name"]);
		return $a;
	}
	return false;
}

/* BUGGER fjerner for the time being...
// Clock takes an element with date(H:i:s)
(function($) {
$.fn.make_time = function()
{
var $time = $(this);
var time = $time.html();
//	time = time.split(" ");
//	var date = time[0].split("-");
//	time = time[1].split(":");
time = time.split(":");
//	var y = parseInt(date[0]);
//	var m = parseInt(date[1]);
//	var d = parseInt(date[2]);
var h = eval(time[0]);
var i = eval(time[1]);
var s = eval(time[2]);
if(s == 59)
{
s = 0;
if(i == 59)
{
i = 0;
if(h == 23)
{
h = 0;
}
else h++;
}
else i++;
}
else s++;

//	time = y+"-"+m+"-"+d+" "+h+":"+i+":"+s;
time = zeros(h,2)+":"+zeros(i,2)+":"+zeros(s,2);
setTimeout(function(){
$time.html(time);
$time.make_time();
},1000);
}
})(jQuery);
*/
function capitalize(string) {
	return string.charAt(0).toUpperCase()+string.slice(1);
}




/* Emboss */
function emboss() {
	$(".emboss").each(function() {
		var outer_class = $(this).attr("wrap_class");
		$(this)
			.removeClass("emboss")
			.addClass("embossed")
			.wrap(
				$("<div class='emboss_outer'>").addClass(outer_class)
			);
	});
}

/* Raise */
function raise() {
	$(".raise").each(function() {
		var outer_class = $(this).attr("wrap_class");
		$(this)
			.removeClass("raise")
			.addClass("raised")
			.wrap(
				$("<div class='raise_outer'>").addClass(outer_class)
			);
	});
}


function chars_left(chars_id,max_chars,input_id)
{
	var $chars = $("#"+chars_id);
	var $input = $("#"+input_id);
	if($input.val().length > max_chars)
	{
		var val = $input.val().substr(0,max_chars);
		$input.val(val);
	}
	chars = max_chars - $input.val().length;
	$chars.html(chars);
}

// ** Page content replace **//
function pc_replace(pagecontent,ar)
{
	// Takes pagecontent string, and array of { "[CLUB]" : "AC Packers" }
	var pc = pagecontent;
	for(var i in ar)
	{
		pc = pc.replace(""+i,""+ar[i]);
	}
	return pc;
}
// Tut vars
var tutorial_youth_report,tutorial_youth_hire,this_is_tutorial,tutorial_facility_upgrade,tutorial_transfer_player,tutorial_transferbid_made;

// ** Transfer List Player Boxes ** //
function forceBank(price) {
	if($("#bank").is(":checked")) { 
		$("#min_price").val(price); 
		$("#min_price").prop('disabled', true);
		console.log('cc');
		$("#min_price").attr('style', 'width:250px;color:#92ae74;background-color:#578229');
		console.log('dd');
	} else {
		$("#min_price").prop('disabled', false);
		$("#min_price").attr('style', 'width:250px');
	}
}

// @TODO copy to non-mini then minify 
function pop_transferlist_player(player_id, bid_id, player_name, bid_value) {
	var loading = "<div class='std align_center'>" + get_loading_img() + "</div>";
	button_disable($("#transfer_submit_button"));
	modal.html(loading).show();
	$.post("/ajax/transferlist_player.ajax.php", {
		"type": "get",
		"player_id": player_id,
		"bid_id": bid_id
	}, function(data) {
		if (data != null) {
			player_name = data["player_name"];
			var $html = $("<div class='std'>");
			if (data["error"] != "") {
				$html.html("<span class='large'>" + data["error"] + "</span><div style='padding-top:10px' class='align_center'><span onclick='javascript:modal.hide()' class='button'><span class='button_border'>" + global_content["ok"] + "</span></span></div>");
			} else {
				$html.append($("<div />").addClass("float_right").html(data["player_image"]));
				$html.append("<h2>" + pagecontent[9] + "</h2>");
				$html.append("<div class='very_large bold' style='margin-bottom:5px;'>" + player_name + "</div>");
				var $form = $("<form>").append($("<input type='hidden' id='player_name' />").val(player_name)).appendTo($html);
				if (this_is_tutorial) {
					$form.append("<p>" + pagecontent[102] + "</p>");
					$form.append("<input type='hidden' id='min_price' name='min_price' style='width:250px' class='emboss' value='" + data["min_price_string"] + "' /><input type='hidden' id='max_price' name='max_price' value='" + data["max_price"] + "' />");
				} else {
					if (data["bid"] > 0) {
						$form.append(pc_replace(pagecontent[10], {
							"[AMOUNT]": "<strong>" + bid_value + "</strong>",
							"[PLAYER_NAME]": "<span class='very_large'><strong>" + player_name + "</strong></span>"
						}));
						$form.append("<input type='hidden' id='bid_id' value='" + bid_id + "' /><input type='hidden' id='min_price' name='min_price' style='width:250px' class='emboss' value='" + bid_value + "' />");
					} else {
						$form.append("<p>" + pagecontent[103] + "</p><h3>" + pagecontent[104] + "</h3><div>" + pc_replace(pagecontent[105], {
							"[player]": "<strong>" + player_name + "</strong>",
							"[max_price]": "<strong>" + data["max_price_string"] + "</strong>"
						}) + "</div><br /><label for='min_price'>" + pagecontent[11] + " </label><input type='text' id='min_price' name='min_price' style='width:250px' class='emboss' value='" + data["min_price_string"] + "' /><input type='hidden' id='max_price' name='max_price' value='" + data["max_price"] + "' />");
						$form.append("<input type='checkbox' tabindex='27' name='bank' id='bank' value='bank' onchange='javascript:forceBank(\"" + data["bank_price_string"] + "\")' /><label for='bank'>" + pagecontent["new_tr_80"] + "</label>");
					}
					var select_time = "<select id='exp_time1'>"
					for (var i = 0; i < 24; i++) {
						var t = zeros(i, 2) + ":" + data["expiry_min"];
						var sel = zeros(i, 2) == data["expiry_hour"] ? " selected" : "";
						select_time += "<option value='" + t + "'" + sel + ">" + t + "</option>";
					}
					select_time += "</select>";
					var select_time2 = "<select id='exp_time2'>"
					for (var i = 0; i < 24; i++) {
						var t = zeros(i, 2) + ":" + data["expiry_min"];
						var sel = zeros(i, 2) == data["expiry_hour"] ? " selected" : "";
						select_time2 += "<option value='" + t + "'" + sel + ">" + t + "</option>";
					}
					select_time2 += "</select>";
					var select_days = "<select id='exp_days'>"
					for (var i = 2; i < 10; i++) {
						var sel = i == 5 ? " selected" : "";
						select_days += "<option value='" + i + "'" + sel + ">" + i + "</option>";
					}
					select_days += "</select>";
					$form.append("<h3>" + pagecontent[12] + "</h3>");
					$form.append("<input tabindex='1' class='less_space' type='radio' name='transfer_expiry' exp_type='1' id='transfer_expiry1' value='1' checked onchange='transfer_pimp_disable(this)'/><label for='transfer_expiry1'>" + data["pimp_exp1"] + " " + data["pimp_tmtime"] + "</label>");
					$form.append("<input tabindex='2' class='less_space' type='radio' name='transfer_expiry' exp_type='2' id='transfer_expiry2' value='1' " + data["pimp_exp2_disabled"] + " onchange='transfer_pimp_disable(this)'/><label for='transfer_expiry2'>" + data["pimp_exp2_1"] + " " + select_time + " " + data["pimp_tmtime"] + " <strong>" + data["pimp_exp2_2"] + "</strong></label>");
					$form.append("<input tabindex='3' class='less_space' type='radio' name='transfer_expiry' exp_type='3' id='transfer_expiry3' value='1' " + data["pimp_exp3_disabled"] + " onchange='transfer_pimp_disable(this)'/><label for='transfer_expiry3'>" + data["pimp_exp3_1"] + " " + select_days + " " + data["pimp_exp3_2"] + " " + select_time2 + " " + data["pimp_tmtime"] + " <strong>" + data["pimp_exp3_3"] + "</strong></label>");
					$form.append("<h3>" + pagecontent[13] + "</h3>");
					$form.append("<input tabindex='4' class='less_space' type='radio' name='transfer_pimp' pimp_type='1' id='transfer_pimp1' value='1' checked /><label for='transfer_pimp1'>" + data["pimp_text1"] + "</label>");
					$form.append("<input tabindex='5' class='less_space' type='radio' name='transfer_pimp' pimp_type='2' id='transfer_pimp2' value='1' " + data["pimp_text2_disabled"] + "/><label for='transfer_pimp2'>" + data["pimp_text2"] + "</label>");
					$form.append("<input tabindex='6' class='less_space' type='radio' name='transfer_pimp' pimp_type='3' id='transfer_pimp3' value='1' " + data["pimp_text3_disabled"] + "/><label for='transfer_pimp3'>" + data["pimp_text3"] + "</label>");
					$form.append("<input type='checkbox' tabindex='7' name='transfer_text' id='transfer_text' " + data["pimp_textarea_disabled"] + "/><label for='transfer_text'>" + data["pimp_textarea_1"] + " <span id='chars_left'>255</span> " + data["pimp_textarea_2"] + "</label><input type='text' tabindex='8' name='transfer_textarea' id='transfer_textarea' class='stdwidth emboss' " + data["pimp_textarea_disabled"] + " onkeyup='chars_left(\"chars_left\",255,\"transfer_textarea\")' onfocus='transfer_text_focus(\"focus\");' onblur='transfer_text_focus(\"blur\");' />");
				}
				$html.append("<div style='padding-top:10px' class='align_center'><span onclick='submit_transferlist_player(" + player_id + ")' class='button big_button large button_icon primary_button' tabindex='9'  id='transfer_submit_button'><span class='button_border'>" + global_content["sell"] + "</span></span> <span onclick='javascript:modal.hide()' class='button' tabindex='10' ><span class='button_border'>" + global_content["cancel"] + "</span></span></div>");
			}
			modal.transition($html, function() {
				make_radio("transfer_expiry1");
				make_radio("transfer_pimp1");
				make_checkbox("transfer_text");
				make_checkbox("bank");
				emboss();
				$("#exp_days").selectmenu({
					"style": "dropdown",
					"maxHeight": "200",
					"width": "55"
				});//.selectmenu("disable");
				$("#exp_time1").selectmenu({
					"style": "dropdown",
					"maxHeight": "200",
					"width": "80"
				});//.selectmenu("disable");
				$("#exp_time2").selectmenu({
					"style": "dropdown",
					"maxHeight": "200",
					"width": "80"
				});//.selectmenu("disable");
			});
		}
	}, "json");
}

/*function pop_transferlist_player(player_id,bid_id,player_name,bid_value)
{
	var loading = "<div class='std align_center'>"+get_loading_img()+"</div>";
	button_disable($("#transfer_submit_button"));
	modal.html(loading).show();
	$.post("/ajax/transferlist_player.ajax.php",{"type":"get","player_id":player_id,"bid_id":bid_id},function(data){
		if(data != null)
		{
			player_name = data["player_name"];
			var $html = $("<div class='std'>");
			if(data["error"] != "")
			{
				$html.html("<span class='large'>"+data["error"]+"</span><div style='padding-top:10px' class='align_center'><span onclick='javascript:modal.hide()' class='button'><span class='button_border'>"+global_content["ok"]+"</span></span></div>");
			}
			else
			{  // <img src='/pics/profile_mockup.png' class='float_right' style='margin: 10px 20px 5px 5px;'>
				$html.append($("<div />").addClass("float_right").html(data["player_image"]));
				$html.append("<h2>"+pagecontent[9]+"</h2>");
				$html.append("<div class='very_large bold' style='margin-bottom:5px;'>"+player_name+"</div>");
				var $form = $("<form>").append($("<input type='hidden' id='player_name' />").val(player_name)).appendTo($html);
				if(this_is_tutorial)
				{ // For tutorial only show
					$form.append("<p>"+pagecontent[102]+"</p>");
					$form.append("<input type='hidden' id='min_price' name='min_price' style='width:250px' class='emboss' value='"+data["min_price_string"]+"' /><input type='hidden' id='max_price' name='max_price' value='"+data["max_price"]+"' />");
				}
				else
				{
					if(data["bid"] > 0)
					{
						$form.append(pc_replace(pagecontent[10],{"[AMOUNT]":"<strong>"+bid_value+"</strong>","[PLAYER_NAME]":"<span class='very_large'><strong>"+player_name+"</strong></span>"}));
						$form.append("<input type='hidden' id='bid_id' value='"+bid_id+"' /><input type='hidden' id='min_price' name='min_price' style='width:250px' class='emboss' value='"+bid_value+"' />");
					}
					else
					{
						$form.append("<p>"+pagecontent[103]+"</p><h3>"+pagecontent[104]+"</h3><div>"+pc_replace(pagecontent[105],{"[player]":"<strong>"+player_name+"</strong>","[max_price]":"<strong>"+data["max_price_string"]+"</strong>"})+"</div><br /><label for='min_price'>"+pagecontent[11]+" </label><input type='text' id='min_price' name='min_price' style='width:250px' class='emboss' value='"+data["min_price_string"]+"' /><input type='hidden' id='max_price' name='max_price' value='"+data["max_price"]+"' />");
					}
					var select_time = "<select id='exp_time1'>"
					for(var i=0;i<24;i++)
					{
						var t = zeros(i,2)+":"+data["expiry_min"];
						var sel = zeros(i,2) == data["expiry_hour"] ? " selected":"";
						select_time += "<option value='"+t+"'"+sel+">"+t+"</option>";
					}
					select_time +="</select>";
					var select_time2 = "<select id='exp_time2'>"
					for(var i=0;i<24;i++)
					{
						var t = zeros(i,2)+":"+data["expiry_min"];
						var sel = zeros(i,2) == data["expiry_hour"] ? " selected":"";
						select_time2 += "<option value='"+t+"'"+sel+">"+t+"</option>";
					}
					select_time2 +="</select>";
					var select_days = "<select id='exp_days'>"
					for(var i=2;i<10;i++)
					{
						var sel = i == 5 ? " selected":"";
						select_days += "<option value='"+i+"'"+sel+">"+i+"</option>";
					}
					select_days +="</select>";
					$form.append("<h3>"+pagecontent[12]+"</h3>");
					$form.append("<input tabindex='1' class='less_space' type='radio' name='transfer_expiry' exp_type='1' id='transfer_expiry1' value='1' checked onchange='transfer_pimp_disable(this)'/><label for='transfer_expiry1'>"+data["pimp_exp1"]+" "+data["pimp_tmtime"]+"</label>");
					$form.append("<input tabindex='2' class='less_space' type='radio' name='transfer_expiry' exp_type='2' id='transfer_expiry2' value='1' "+data["pimp_exp2_disabled"]+" onchange='transfer_pimp_disable(this)'/><label for='transfer_expiry2'>"+data["pimp_exp2_1"]+" "+select_time+" "+data["pimp_tmtime"]+" <strong>"+data["pimp_exp2_2"]+"</strong></label>");
					$form.append("<input tabindex='3' class='less_space' type='radio' name='transfer_expiry' exp_type='3' id='transfer_expiry3' value='1' "+data["pimp_exp3_disabled"]+" onchange='transfer_pimp_disable(this)'/><label for='transfer_expiry3'>"+data["pimp_exp3_1"]+" "+select_days+" "+data["pimp_exp3_2"]+" "+select_time2+" "+data["pimp_tmtime"]+" <strong>"+data["pimp_exp3_3"]+"</strong></label>");

					$form.append("<h3>"+pagecontent[13]+"</h3>");
					$form.append("<input tabindex='4' class='less_space' type='radio' name='transfer_pimp' pimp_type='1' id='transfer_pimp1' value='1' checked /><label for='transfer_pimp1'>"+data["pimp_text1"]+"</label>");
					$form.append("<input tabindex='5' class='less_space' type='radio' name='transfer_pimp' pimp_type='2' id='transfer_pimp2' value='1' "+data["pimp_text2_disabled"]+"/><label for='transfer_pimp2'>"+data["pimp_text2"]+"</label>");
					$form.append("<input tabindex='6' class='less_space' type='radio' name='transfer_pimp' pimp_type='3' id='transfer_pimp3' value='1' "+data["pimp_text3_disabled"]+"/><label for='transfer_pimp3'>"+data["pimp_text3"]+"</label>");
					$form.append("<input type='checkbox' tabindex='7' name='transfer_text' id='transfer_text' "+data["pimp_textarea_disabled"]+"/><label for='transfer_text'>"+data["pimp_textarea_1"]+" <span id='chars_left'>255</span> "+data["pimp_textarea_2"]+"</label><input type='text' tabindex='8' name='transfer_textarea' id='transfer_textarea' class='stdwidth emboss' "+data["pimp_textarea_disabled"]+" onkeyup='chars_left(\"chars_left\",255,\"transfer_textarea\")' onfocus='transfer_text_focus(\"focus\");' onblur='transfer_text_focus(\"blur\");' />");
					}
				$html.append("<div style='padding-top:10px' class='align_center'><span onclick='submit_transferlist_player("+player_id+")' class='button big_button large button_icon primary_button' tabindex='9'  id='transfer_submit_button'><span class='button_border'>"+global_content["sell"]+"</span></span> <span onclick='javascript:modal.hide()' class='button' tabindex='10' ><span class='button_border'>"+global_content["cancel"]+"</span></span></div>");
			}
			modal.transition($html,function(){
				make_radio("transfer_expiry1");
				make_radio("transfer_pimp1");
				make_checkbox("transfer_text");
				emboss();
				$("#exp_days").selectmenu({
					"style":"dropdown",
					"maxHeight":"200",
					"width": "55"
				}).selectmenu("disable");
				$("#exp_time1").selectmenu({
					"style":"dropdown",
					"maxHeight":"200",
					"width": "80"
				}).selectmenu("disable");
				$("#exp_time2").selectmenu({
					"style":"dropdown",
					"maxHeight":"200",
					"width": "80"
				}).selectmenu("disable");
			});
		}
	},"json");
}*/


function  transfer_pimp_disable(el)
{
	/*
console.log('tr pmp dis ... ');
	if($(el).is(":checked"))
	{
		$("#exp_days").selectmenu("disable");
		$("#exp_time1").selectmenu("disable");
		$("#exp_time2").selectmenu("disable");
console.log('tr pmp ds id: ',$(el).attr("id"),' ... each: ');
		$("label[for="+$(el).attr("id")+"]").find("select").each(function(){
			var id = $(this).attr("id");
console.log('id ',id);
			$("#"+id).selectmenu("enable");
		});
	}
	*/
}
function transfer_text_focus(type)
{
	if(type=="focus" && !$("#transfer_text").is(":checked")) $("#transfer_text_checkbox").click();
	if(type=="blur" && $("#transfer_text").is(":checked") && $("#transfer_textarea").val() == "") $("#transfer_text_checkbox").click();
}
function submit_transferlist_player(player_id)
{
	var $pimp = $("[name=transfer_pimp]:checked");
	var $exp = $("[name=transfer_expiry]:checked");
	var min_price = $("#min_price").val();
	var max_price = $("#max_price").val();
	min_price = min_price.replace(/,/g, "");
	min_price = min_price.replace(/\./g, "");
	if(parseInt(min_price) > parseInt(max_price))
	{
		$("#min_price").closest(".emboss_outer").after("<p class='error'>"+pagecontent[106]+"</p>");
		$("#min_price").focus();
		return false;
	}
	button_disable($("#transfer_submit_button"));
	var exp_time = "", exp_days= "";
	if($exp.attr("exp_type") == 2)
	{
		exp_time = $("#exp_time1").val();
	}
	else if($exp.attr("exp_type") == 3)
	{
		exp_time = $("#exp_time2").val();
		exp_days = $("#exp_days").val();
	}
    var bank = false;
    if ($("#bank").is(":checked")) bank = true;
	var text = "";
	if($("#transfer_text").is(":checked") && $("#transfer_textarea").val() != "") text = $("#transfer_textarea").val();
//	/*
	$.post("/ajax/transferlist_player.ajax.php",{"type":"list","player_id":player_id,"text":text,"pimp":$pimp.attr("pimp_type"),"expiry_time" : exp_time,"expiry_days": exp_days, "bid_id":$("#bid_id").val(),"min_price":min_price,"bank": bank},function(data){
		if(data != null)
		{
			if(typeof tutorial_transfer_player == "function")
			{
				tutorial_transfer_player();
			}
			var $html = $("<div class='std'>");
			var player_name = $("#player_name").val();
			if(data["error"] == "")
			{
				$html.append("<p class='large'><strong>"+player_name+"</strong> "+data["text"]+"</span>");
			}
			else
			{
				 $html.html(data["error"]);
			}
			$html.append("<div class='align_center' style='padding-top: 10px'><a href='javascript:page_refresh()' class='button'><span class='button_border'>"+global_content["ok"]+"</span></a></div>");
			modal.transition($html,function(){
				modal.banner();
			});
			body_refresh();
		}
	},"json");
// */
}
function pop_withdraw_bid(bid_id,player,bid,player_name)
{
	var player_name = player_name || $("#player_"+player).attr("player_name");
	modal.html("<div class='std'><form method='post' action='' id='withdraw_bid_form'><input type='hidden' name='withdraw_bid_id' value='"+bid_id+"' /><input type='hidden' name='player_name' value='"+player_name+"' /></form> <h2>"+pagecontent[3]+"</h2> "+pc_replace(pagecontent[4],{"[BID_AMOUNT]":"<strong>"+bid+"</strong>","[PLAYER_NAME]":"<strong>"+player_name+"</strong>"})+" <div style='padding-top:10px' class='align_center'><a href='javascript:transfer_bid(\"withdraw_bid\")' class='button'><span class='button_border'>"+global_content["withdraw"]+"</span></a> <span onclick='javascript:modal.hide()' class='button'><span class='button_border'>"+global_content["cancel"]+"</span></span></div></div>").show();
}
function pop_reject_bid(bid_id,player,bid,bidder_id,b_team)
{
	var bid_value = bid || "";
	bid_value = bid_value.replace(/,/g, "").replace(/\./g, "");
	var html = "<div class='std'><h2>"+pagecontent[5]+"</h2>"+pc_replace(pagecontent[6],{"[BID_AMOUNT]":bid,"[PLAYER_NAME]":$("#player_"+player).attr("player_name")})+"<br /><form method='post' action='' id='reject_bid_form'><input type='hidden' name='reject_bid' value='"+bid_id+"' /><input type='hidden' name='player_id' value='"+player+"' /><input type='hidden' name='player_name' value='"+$("#player_"+player).attr("player_name")+"' /><input type='hidden' name='bidder_id' value='"+bidder_id+"' /><input type='hidden' value='"+bid_value+"' name='bid_value'><input type='hidden' name='b_team' value='"+b_team+"' /><label for='comment'>"+global_content[496]+"</label><textarea class='emboss' name='comment' id='comment' rows='3' cols='70' ></textarea></form><div style='padding-top:10px' class='align_center'><span onclick='javascript:transfer_bid(\"reject_bid\")' class='button'><span class='button_border'>"+global_content["reject"]+"</span></span> <span onclick='javascript:modal.hide()' class='button'><span class='button_border'>"+global_content["cancel"]+"</span></span></div></div>";
	modal.html(html).show();
	emboss();
}
function pop_accept_bid(bid_id,player,bid,bidder_id,b_team)
{
	var html = "<div class='std'><h2>"+pagecontent[7]+"</h2>"+pc_replace(pagecontent[8],{"[BID_AMOUNT]":bid,"[PLAYER_NAME]":$("#player_"+player).attr("player_name")})+"<br /><form method='post' action='' id='accept_bid_form'><input type='hidden' name='accept_bid' value='"+bid_id+"' /><input type='hidden' name='player_id' value='"+player+"' /><input type='hidden' name='player_name' value='"+$("#player_"+player).attr("player_name")+"' /><input type='hidden' name='bidder_id' value='"+bidder_id+"' /><input type='hidden' name='b_team' value='"+b_team+"' /></form><div style='padding-top:10px' class='align_center'><span onclick='javascript:pop_transferlist_player("+player+","+bid_id+",\""+$("#player_"+player).attr("player_name").replace("'","-").replace("&#39;","-")+"\",\""+bid+"\")' class='button' id='transfer_submit_button'><span class='button_border'>"+global_content["next"]+"</span></span> <span onclick='javascript:modal.hide()' class='button'><span class='button_border'>"+global_content["cancel"]+"</span></span></div></div>";
	modal.html(html).show();
	emboss();
}

function pop_delete_agent(agent_id,player_name)
{

	modal.html("<div class='std'><h2>"+pagecontent[16]+"</h2>"+pc_replace(global_content[495],{"[player]":player_name})+"<form method='post' action='' id='delete_agent'><input id='agent_id' type='hidden' name='agent_id' value='"+agent_id+"' /><input type='hidden' name='player_name' value='"+player_name+"' /></form><div style='padding-top:10px' class='align_center'><span onclick='javascript:transfer_bid(\"delete_agent\")' class='button' tabindex='1' ><span class='button_border'>"+global_content["delete"]+"</span></span> <span onclick='javascript:modal.hide()' class='button' tabindex='2' ><span class='button_border'>"+global_content["cancel"]+"</span></span></div></div>").show();
}

function transfer_bid(type)
{
	var $html = $("<div/>");
	var arr = {};
	var succes_text = "";
	var error_text = "";
	var header = $("#modal h2");
	if(type=="delete_agent")
	{
		arr["agent_id"] = $("#agent_id").val();
		arr["player_name"] = $("#delete_agent [name=player_name]").val();
		error_text = "Too Late!";
//		succes_text = "Agent on "+arr["player_name"]+" deleted."; // 494
		succes_text = pc_replace(global_content[494],{"[player]":arr["player_name"]});
	}
	else if(type=="reject_bid")
	{
		arr["reject_bid"] = $("#reject_bid_form [name=reject_bid]").val();
		arr["bid_value"] = $("#reject_bid_form [name=bid_value]").val();
		arr["player_id"] = $("#reject_bid_form [name=player_id]").val();
		arr["player_name"] = $("#reject_bid_form [name=player_name]").val();
		arr["bidder_id"] = $("#reject_bid_form [name=bidder_id]").val();
		arr["b_team"] = $("#reject_bid_form [name=b_team]").val();
		arr["comment"] = $("#reject_bid_form [name=comment]").val();
//		succes_text = "Bid on "+arr["player_name"]+" rejected."; //492
		succes_text = pc_replace(global_content[492],{"[player]":arr["player_name"]});
	}
	else if(type=="withdraw_bid")
	{
		arr["withdraw_bid_id"] = $("#withdraw_bid_form [name=withdraw_bid_id]").val();
		arr["player_name"] = $("#withdraw_bid_form [name=player_name]").val();
//		succes_text = "Bid on "+arr["player_name"]+" withdrawn."; // 493
		succes_text = pc_replace(global_content[493],{"[player]":arr["player_name"]});
	}
	else
	{
		return false;
	}
	modal.html(get_loading_img());
	$.post("/ajax/transfer_bids.ajax.php",{"type":type,"value":arr},function(data)
	{
		if(data != null)
		{
			if (data["error"]==1)
			{
				$html.html(header).append(error_text).append("<div class='align_center' style='padding-top:10px'>"+make_button(global_content["ok"],"javascript:page_refresh()","")+"</div>");
			}
			else
			{
				$html.html(header).append(succes_text).append("<div class='align_center' style='padding-top:10px'>"+make_button(global_content["ok"],"javascript:page_refresh()","")+"</div>");
			}
			modal.transition($html).banner();
			body_refresh();
		}
	},"json");
}

function short_list_player(player_id,in_transferlist)
{
	in_transferlist = in_transferlist || false;
	modal.html(get_loading_img()).show();
	$.post("/ajax/players_shortlist.ajax.php",{"player_id":player_id},function(data){
		if(data != null)
		{
			var $html = $("<div>");
			$html.append("<h2>"+global_content[474]+"</h2><p>"+global_content[475]+"</p>");
			if(in_transferlist)
			{
				$html.append("<div class='msgbuttons'>"+make_button(global_content["ok"],"javascript:modal.hide()","")+"</div>");
			}
			else
			{
				$html.append("<div class='msgbuttons'>"+make_button(global_content["ok"],"javascript:page_refresh()","")+"</div>");
				body_refresh();
			}
			modal.html($html).banner();
		}
	},"json");
}

function remove_short_list_player(player_id,callback)
{
//	create_message_box();
//	$("#msg").html("<div class='std align_center'>"+get_loading_img()+"</div>");
//	show_message_box();

	if(typeof callback != "function")
	{
		modal.html(get_loading_img()).show();
	}
	$.post("/ajax/players_shortlist.ajax.php",{"type":"remove","player_id":player_id},function(data){
		if(data != null)
		{
			if(typeof callback == "function")
			{
				callback.call(this,player_id);
				return false;
			}
			var $html = $("<div class='std'>");
			$html.append("<h2>"+pagecontent["remove_shortlist_1"]+"</h2><p>"+pagecontent["remove_shortlist_2"]+"</p>");
			$html.append("<div class='msgbuttons'>"+make_button(global_content["ok"],"javascript:page_refresh()","")+"</div>");
			body_refresh();
//			$("#msg").html($html);
//			add_close_button();
			modal.html($html).show();
		}
	},"json");
}
function pop_transfer_bid(bid_old,pro_old,player_id,name_old)
{
	modal.html(get_loading_img()).show();
	$.post("/ajax/transfer_bids.ajax.php",{"type":"get_transfer_bid","player_id":player_id,"session_id":SESSION["id"]},function(data){
	//	pro = 0;
		if(data["wrong_session"])
		{
			modal.html($("<div />").append(
				$("<p />").addClass("error").html(data["error"]+"<br />"+data["error1"]),
				$("<div />").addClass("msgbuttons").append(make_button(global_content["ok"],"page_refresh()"))
				));
				body_refresh();
			return;
		}
		if(data["transfer"]["expired"])
		{ // Transfer expired
			modal.html($("<div />").append(
				$("<h2 />").html(global_content["make_bid"]),
				$("<p />").text(data["expired_text"]),
				$("<div />").addClass("msgbuttons").append(make_button(global_content["ok"],"modal.hide()"))
				));
			return;
		}
		var bid = data["transfer"]["next_bid"];
		var player_name = data["transfer"]["player_name"];
		var pro = data["is_pro"];
		var html = "<div class='std'>"+$("<div />").html($("<div />").addClass("float_right").html(data["player_image"])).html()+"<h2>"+global_content["make_bid"]+"</h2>"
		 +"<form method='' action='' id=''>"
		 +"<input type='hidden' value='"+bid+"' name='min_bid' id='min_bid' />"
		+"<input type='radio' transfer='bid' name='transfer_method' id='transfer_method' checked value='"+bid+"'/>"
		+"<input type='hidden' value='"+player_name+"' id='bid_player_name' />"
		+"<label for='transfer_method'>"+pc_replace(global_content["bid_on_player"],{"[span]":"<strong class='large'>","[/span]":"</strong>","[player]":player_name})+"<br /><input type='text' name='transfer_bid' id='transfer_bid' value='"+bid+"' class='emboss' style='width:250px;' onkeyup='update_transfer_radio(this)'/>"+money_big()+"<p class='subtle' style='padding:0'>"+pc_replace(global_content["min_bid_is"],{"[bid]":"<strong>"+money_big(bid)+"</strong>"})+".</p></label>";
		if(!this_is_tutorial)
		{
			html += "<input type='radio' transfer='agent' name='transfer_method' id='transfer_method2' "+(pro==1 ? "":" disabled")+" value='"+bid+"' onkeyup='update_transfer_radio(this)' />"
			+"<label for='transfer_method2'>"+pc_replace(global_content["agent_on_player"],{"[span]":"<strong class='large'>","[/span]":"</strong>","[player]":player_name})+" <img src='/pics/pro_icon.png' class='pro_icon'> *<br /><input type='text' name='transfer_agent' id='transfer_agent' value='"+bid+"' "+(pro==1 ? "":" disabled")+" class='emboss' style='width:250px;' onkeyup='update_transfer_radio(this)'/>"+money_big()+"</label>";
			html += "<p class='subtle' style='padding-left: 35px;'>* "+global_content[467]+"</p>";
			if(pro == 0)
			{
				html += "<p class='error'>"+global_content["requires_tm_pro"]+"</p>";
			}
			html +="<div class='bold'>"+data["bidder_text"]+"</div>";
		}
		html += "<div class='msgbuttons'>"+make_button("<img src='/pics/auction_hammer.png' style='' class='hammer_icon'> "+global_content["make_bid"]+" ","post_transfer_bid("+player_id+");click_action_log(32,SESSION['tutorial']>0);","button big_button large button_icon primary_button","bid_button")+" "+make_button(global_content["cancel"],"modal.hide();click_action_log(33,SESSION['tutorial']>0);")+"</div>";
		modal.html(html).show();
		make_radio("transfer_method");
		emboss();
	},"json");
}
function update_transfer_radio(el)
{
	$("[name=transfer_method]:checked").val($(el).val());
}
function post_transfer_bid(player_id)
{
	var $transfer = $("[name=transfer_method]:checked");
	var bid = $transfer.val();
	var min_bid = $("#min_bid").val();
	var player_name = $("#bid_player_name").val();
	if(parseInt(bid.replace(/,/g, "").replace(/\./g, "")) < parseInt(min_bid.replace(/,/g, "").replace(/\./g, "")))
	{
		//error
		var $error = $("#transfer_method").siblings(".error");
		if($error.length == 0) $error = $("<p class='error' />").insertAfter("#transfer_method");
		$error.html("Minimum bid not met");
		return false;
	}
	button_disable($("#bid_button"));
	$("#transfer_method").siblings(".error").remove();
	var $html = $("<div />");
	modal.transition(get_loading_img(),function(){
		$.post("/ajax/transfer_bids.ajax.php",{"type":"transfer_bid","player_id":player_id,"transfer_type":$transfer.attr("transfer"),"bid":bid,"session_id":SESSION["id"]},function(data){
			if(data != null)
			{
				$html.html("<h2>"+global_content["make_bid"]+"</h2>");
				if(data["error"] != "")
				{
					$html.append("<p class='error'>"+data["error"]+"</p>");
				}
				else
				{
					// Tutorial
					if(typeof tutorial_transferbid_made == "function") tutorial_transferbid_made();

					$html.append("<p>"+data["succes"]+"</p>");
					if(data["agent"] !="")
					{
						$html.append("<p>"+data["agent"]+"</p>");
					}
				}
				if(!this_is_tutorial) $html.append("<p>"+get_player_link({"player":{"id":player_id,"name":player_name}})+"</p>");
				$html.append("<div class='msgbuttons'>"+make_button(global_content["ok"],"javascript:page_refresh()","")+"</div>");
				modal.html($html).banner();
				body_refresh();
			}
		},"json");
	});
}


function make_button(name,action,classname,id,tabind)
{
	if(!tabind) tabind = tabindex++;
	classname = classname || "";
	id = id || "";
	if(action.indexOf("href:") != -1)
	{
		return "<a href=\""+action.replace("href:","")+"\" class=\"button "+classname+"\" id=\""+id+"\" tabindex='"+tabindex+"'><span class='button_border'>"+name+"</span></a>";
	}
	return "<span onclick=\""+action+"\" onkeypress=\""+action+"\" class=\"button "+classname+"\" id=\""+id+"\" tabindex='"+tabindex+"'><span class='button_border'>"+name+"</span></span>";
}
function page_refresh()
{
	window.location.reload();
}
function body_refresh()
{
	$(window).unbind();
	$("body").click(function(){page_refresh()});
}
function submit_form(id)
{
	$("#"+id).submit();
}
// Length of assoc Arr (object)
function count(arr)
{
	var count = 0;
	for(var i in arr)
	{
		count++;
	}
	return count;
}

function number_format(number)
{
	number += '';
	x = number.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function cookie_set_ajax(type)
{
	$.post("/ajax/cookie_set.ajax.php",{"type":type},null,"json");
}

function ignore_bteam_reminder()
{
	cookie_set_ajax('reserves_expiry');
	$("#bteam_reminder").hide(200);
}

// Player notes
function player_note(player_id)
{
	modal.html("<div class='std align_center'>"+get_loading_img()+"</div>").show();
	$.post("/ajax/players_note.ajax.php",{"type":"get_note","player_id":player_id},function(data){
		if(data != null)
		{
			var $html = $("<div>");
			$html.append("<h2>"+global_content[449]+"</h2>");
			if(data["text"] != "")
			{
				$html.append("<p class='dark rounded' style='padding: 10px;'><span class='subtle'>"+global_content[450]+"</span> "+data["note"]+"</p>");
			}
			$html.append("<form><label for='player_note'>"+global_content[451]+"</label><br /><textarea rows='7' cols='70' class='emboss' id='player_note' tabindex='"+(tabindex++)+"'>"+data["text"]+"</textarea><div class='msgbuttons'>"+make_button("<img src='/pics/icons/clips2.gif' style='position:relative;top: 2px;'> "+global_content["save"],"save_player_note("+player_id+")","button big_button large button_icon primary_button","",tabindex++)+" "+make_button(global_content["cancel"],"modal.hide();","","",tabindex++)+"</div>");
			modal.html($html);
			emboss();
		}
	},"json");
}
function save_player_note(player_id)
{
	var note = $("#player_note").val();
	modal.transition(get_loading_img(),function(){
		$.post("/ajax/players_note.ajax.php",{"type":"save_note","player_id":player_id,"note":note},function(data){
			if(data != null)
			{
				var $html = $("<div>");
				$html.append("<h2>"+global_content[449]+"</h2>");
				if(data["error"] == "")
				{
					$html.append("<p>"+global_content[452]+"</p>");
				}
				else
				{
					$html.append("<p>"+data["error"]+"</p>");
				}
				$html.append("<div class='msgbuttons'>"+make_button(global_content["ok"],"javascript:page_refresh()","","","",tabindex++)+"</div>");
				body_refresh();
				modal.html($html).banner();
			}
		},"json");
	});
}
function pop_player_number(player_id, player_number, player_name, reserves)
{
	modal.html(get_loading_img());
	modal_inner().addClass("align_center");
	modal.show();//.banner();
	$.post("/ajax/players_get_number.ajax.php",{"type":"get","player_id":player_id,"page":this_page},function(data){
		if(data != null)
		{
			modal.html("<h2>"+global_content["player_no"]+"</h2>"+global_content["player_no_change"]+" <strong class='large'>"+player_number+". "+player_name+"</strong>: ");
			if(data.length == 0)
			{
				modal_inner().append("<p class='error'>"+global_content["requires_tm_pro"]+"</p>"+make_button(global_content["ok"],"modal.hide()","","",tabindex++));
			}
			else
			{
				var $select = $("<select id='player_numbers_select'>");
				for(var i = 0; i < data.length; i++)
				{
					var sel = player_number == data[i] ? " selected":"";
					$select.append("<option value='"+data[i]+"'"+sel+">"+data[i]+"</option>");
				}
				modal_inner().append($select);
				modal_inner().append("<div class='msgbuttons'>"+make_button(global_content["save"],"save_player_number("+player_id+",'"+player_name+"',"+reserves+")","","",tabindex++)+" "+make_button(global_content["cancel"],"modal.hide()","","",tabindex++)+"</div>");
				$select.selectmenu({
					"type":"dropdown",
					"width":"75",
					"maxHeight":"250"
				});
			}
		}
	},"json");
}
function save_player_number(player_id,player_name,reserves)
{
	var no = $("#player_numbers_select").val();
	modal.transition(get_loading_img(),function(){
		$.post("/ajax/players_get_number.ajax.php",{"type":"save","player_id":player_id,"reserves":reserves,"no":no,"page":this_page},function(data){
			if(data != null)
			{
				modal_inner().html("<h2>"+global_content["player_no"]+"</h2><p><strong class='large'>"+player_name+"</strong> "+global_content["player_no_confirm"]+" <strong class='large'>"+no+"</strong></p>");
				modal_inner().append("<div class='msgbuttons'>"+make_button(global_content["ok"],"javascript:page_refresh()","","","",tabindex++)+"</div>");
				body_refresh();
				modal.banner();
			}
		},"json");
	});
}
var rec_format = function(text){
	var rec = parseInt(text);
	//array of find replaces
/*			var findreps = [

	];
	for(var i in findreps){
		newText = newText.replace(findreps[i].find, findreps[i].rep);
	} */

	if (rec>20) return number_format(rec/2);

	var str = "";
	for(var i = 0 ; i < 5; i++)
	{
		if(rec > 1) str += "<img src=\"/pics/star.png\" class='rec_star'/>";
		else if(rec > 0) str += "<img src=\"/pics/half_star.png\" class='rec_star'/>";
		else str += "<img src=\"/pics/dark_star.png\" class='rec_star' />";
		rec -= 2;
	}
	return str;
};
function get_rec_string_selecmenu(value) {
	let rec = parseInt(value);
	if (rec>20) return '<span>' + number_format(rec/2) + '</span>';
	var str = "";
	for(var i = 0 ; i < 5; i++) {
		if(rec > 1) str += "<img src=\"/pics/star.png\" class='rec_star'/>";
		else if(rec > 0) str += "<img src=\"/pics/half_star.png\" class='rec_star'/>";
		else str += "<img src=\"/pics/dark_star.png\" class='rec_star' />";
		rec -= 2;
	}
	return str;
}


/* Money */
function money(cash) {
	cash = cash || "";
	cash = cash+"";
	cash = cash.replace(/\./g,"").replace(/,/g,"");
	return "<span class='coin'>"+number_format(cash)+"</span>";
}
function money_big(cash) {
	cash = cash || "";
	cash = cash+"";
	cash = cash.replace(/\./g,"").replace(/,/g,"");
	return "<span class='coin_big'>"+number_format(cash)+"</span>";
}

// ** Get links - player/club/match/weeee ** //
function get_player_link(ar)
{
	ar["class"] = ar["class"] || "";
	var player = ar["player"];
	var auto_tooltip = ar["auto_tooltip"] ? "player_link='"+player["id"]+"'" : "";
	var tooltip = ar["tooltip"] ? "tooltip='"+ar["tooltip"]+"'" : "";
	var url = "/players/"+player["id"]+"/"+player["name"].replace(". ","_").replace(" ","_")+"/";
	if(ar["only_url"]) return url;
	return "<a href='"+url+"'"+auto_tooltip+"class='"+ar["class"]+"'>"+player["name"]+"</a>";
}

function get_club_link(ar)
{
	ar["class"] = ar["class"] || "";
	var club = ar["club"];
//	var auto_tooltip = ar["auto_tooltip"] ? "player_link='"+player["id"]+"'" : "";
	var tooltip = ar["tooltip"] ? "tooltip='"+ar["tooltip"]+"'" : "";
	var flag = ar["flag"] && club["country"] != "" ? " "+get_flag(club["country"]) : "";
	var url = "/club/"+club["id"]+"/";
	var club_link = "club_link='"+club["id"]+"'";
	if(ar["only_url"]) return url;
	return "<a href='"+url+"'"+"class='"+ar["class"]+"' "+club_link+">"+club["name"]+flag+"</a>";
}

/* Time */
function time_split(sec) {
	var s = sec%60;
	var m = Math.floor(sec/60);
	return {"m":m, "s":s}
}
function time_format(time) {
	time = (typeof time == "number" || typeof time == "string") ? time_split(parseInt(time)) : time;
	s = (time.s<10) ? "0"+time.s : time.s;
	m = (time.m<10) ? "0"+time.m : time.m;
	return m+":"+s;
}

/* Club logo */
function draw_club_logo(club_id, size) {

	club_id = club_id || "default";
	logo_type = (size == "small") ? "_25" : ((size == "large") ? "_140": "");

	file = (club_id != "default") ? "/pics/club_logos/"+club_id+logo_type+".png" : "/pics/club_logos/default"+logo_type+".png";

	return $("<img src='"+file+"' class='club_logo'>");
}

/* preload */
function preload(img_url) {
	$("body").append(
		$("<img src='"+img_url+"' class='hidden'>").hide()
	)
}

// ** Captcha ** //
function captcha_post(type,ids,callback)
{
	ids = ids || [];
	var vars = {};
	for(var i=0;i<ids.length;i++)
	{
		vars[ids[i]] = $("#"+ids[i]).val();
	}
	$.post("/ajax/captcha_post.php", {"cap":$("#captcha_input").val(),"type":type,"vars":vars}, callback, "json");
	return false;
 }
function change_captcha()
{
	$('#captcha_image').attr("src","/ajax/captcha_image.php?rnd=" + Math.random());
}

// ** Function for show Youth Megastars! ** //
function show_youth_rec(rec,potential) {
	str = "";
	for(i = 0; i < 5;i++) {
		rec = rec < 0 ? 0 : rec;
		potential = potential < 0 ? 0 : potential;

		if(rec == 0) {
			if(potential == 0) {
				str += '<span class="megastar empty"></span>';
			} else if(potential == 0.5)	{
				str += '<span class="megastar potential_half"></span>';
			} else {
				str += '<span class="megastar potential"></span>';
			}
		} else if(rec == 0.5) {
			if(potential == 0 || potential == 0.5) {
				str += '<span class="megastar recomendation_half"></span>';
			} else {
				str += '<span class="megastar recomendation_potential"></span>';
			}
		} else {
			str += '<span class="megastar recomendation"></span>';
		}

		rec--;
		potential--;

	}
	return str;
}

function color_favposition(pos,ignore_side)
{
	ignore_side = ignore_side || false;
	pos = pos || "";
	var str = "";
	var side = ["",""];
	pos = pos.toLowerCase();
	if(pos.indexOf("sub") != -1) return "<span class=\"favposition short\"><span class=\"sub\">"+global_content["substitute_abbr"]+"</span></span>";
	if(pos == "gk")
	{
		side = pos.split("gk");
		str = "<span class=\"gk\">"+global_content["gk_xxx"]+"</span>";
	}
	else if(pos.indexOf("dm") != -1)
	{
		side = pos.split("dm");
		str = "<span class=\"m\">"+global_content["dm_xxx"]+"</span>";
	}
	else if(pos.indexOf("d") != -1)
	{
		side = pos.split("d");
		str = "<span class=\"d\">"+global_content["d_xxx"]+"</span>";
	}
	else if(pos.indexOf("om") != -1)
	{
		side = pos.split("om");
		str = "<span class=\"om\">"+global_content["om_xxx"]+"</span>";
	}
	else if(pos.indexOf("m") != -1)
	{
		side = pos.split("m");
		str = "<span class=\"m\">"+global_content["m_xxx"]+"</span>";
	}
	else if(pos.indexOf("f") != -1)
	{
		side = pos.split("f");
		str = "<span class=\"f\">"+global_content["f_xxx"]+"</span>";
	}
	else return "";
	if(pos.indexOf("f") != -1) side = "";
	else if(side[1].indexOf("c") != -1) side = "c";
	else side = side[1];
	side = side.replace("l",global_content["left_abbr"]).replace("r",global_content["right_abbr"]).replace("c",global_content["center_abbr"]);
	var side_html = ignore_side ? "" : " "+"<span class=\"side\">"+side+"</span>";
	return "<span class=\"favposition short\">"+str+side_html+"</span>";
}

function time_left_abs(secs) {
	if (secs <= 0) {
		return "...";
	}
	var ret = "";
	var tmp_d = tmp_h = tmp_m = tmp_s = 0;
	if (secs > 86400) {
		tmp_d = Math.floor(secs/86400);
		tmp_h = Math.floor((secs-(tmp_d*86400))/3600);
		ret = tmp_d+"d&nbsp;"+tmp_h+"h";
	} else if (secs > 3600) {
		tmp_h = Math.floor(secs/3600);
		tmp_m = Math.floor((secs-tmp_h*3600)/60);
		ret = tmp_h+"h&nbsp;"+tmp_m+"m";
	} else {
		tmp_m = Math.floor(secs/60);
		tmp_s = secs-(tmp_m*60);
		ret = tmp_m+"m&nbsp;"+tmp_s+"s";
	}
	return ret;
}

function time_left_abs_ignore_secs(secs) {

	if (secs <= 0) {
		return "...";
	}
	var ret = "";
	var tmp_d = tmp_h = tmp_m = tmp_s = 0;
	if (secs > 86400) {
		tmp_d = Math.floor(secs/86400);
		tmp_h = Math.floor((secs-(tmp_d*86400))/3600);
		ret = tmp_d+global_content["days_abbr"]+"&nbsp;"+tmp_h+global_content["hours_abbr"];
	} else if (secs > 3600) {
		tmp_h = Math.floor(secs/3600);
		tmp_m = Math.floor((secs-tmp_h*3600)/60);
		ret = tmp_h+global_content["hours_abbr"]+"&nbsp;"+tmp_m+global_content["minutes_abbr"];
	} else {
		tmp_m = Math.floor(secs/60);
		tmp_s = secs-(tmp_m*60);
		ret = tmp_m+global_content["minutes_abbr"];
	}
	return ret;
}

function time_left(secs) {
	if (secs <= 0) {
		return "Expired";
	}
	var ret = "";
	var tmp_d = tmp_h = tmp_m = tmp_s = 0;
	if (secs > 86400) {
		tmp_d = Math.floor(secs/86400);
		tmp_h = Math.floor((secs-(tmp_d*86400))/3600);
//		ret = tmp_d+"d&nbsp;"+tmp_h+"h";
		ret = tmp_d+global_content["days_abbr"]+"&nbsp;"+tmp_h+global_content["hours_abbr"];
	} else if (secs > 3600) {
		tmp_h = Math.floor(secs/3600);
		tmp_m = Math.floor((secs-tmp_h*3600)/60);
//		ret = tmp_h+"h&nbsp;"+tmp_m+"m";
		ret = tmp_h+global_content["hours_abbr"]+"&nbsp;"+tmp_m+global_content["minutes_abbr"];
	} else if (secs > 120) {
		tmp_m = Math.floor(secs/60);
		tmp_s = secs-(tmp_m*60);
//		ret = tmp_m+"m&nbsp;"+tmp_s+"s";
		ret = tmp_m+global_content["minutes_abbr"];
	} else {
//		ret = "<&nbsp;2m";
		ret = "<&nbsp;2"+global_content["minutes_abbr"];
	}
	return ret;
}

function pro_update()
{
	$(".top_user_info .pro_block .pro_days").html(get_loading_img());
	$.post("/ajax/pro_update.ajax.php",{},function(data){
		$("#buddy_list_pro").find(".pro_days").text(data["days"]);
		setTimeout(function(){
			$(".top_user_info .pro_block .pro_days").text(data["days"]);
		},200);
	},"json").fail(function(){$(".top_user_info .pro_block .pro_days").text("error")});
}
function online_indicator(online)
{
	if(online) return "<img src='/pics/icons/online.gif' tooltip='Online' />";
	else return "<img src='/pics/icons/offline.gif' tooltip='Offline' />";
}
function club_change(club_id,change)
{
	$.post("/ajax/club_change.ajax.php",{"change":change,"club_id":club_id},function(data){
		if(data!=null)
		{
			if(data["success"]) page_refresh();
		}
	},"json");
}

// # FUN ;o)
jQuery.jQueryRandom = 0;
jQuery.extend(jQuery.expr[":"],
{
    random: function(a, i, m, r) {
        if (i == 0) {
            jQuery.jQueryRandom = Math.floor(Math.random() * r.length);
        };
        return i == jQuery.jQueryRandom;
    }
});
function marquee()
{
	var $el = $("body").find(":random");
	while(!$el.is(":visible"))
	{
		$el = $("body").find(":random");
	}
	$el.wrap("<marquee scrollamount='14' style='margin:0;padding:0;display:inline-block;'/>");
}

function click_action_log(id,check)
{
	if(check === false) return;
	$.post("/ajax/click_action_log.ajax.php",{"action_id":id},null);
}
function jqclublink(ar)
{
	ar = ar || {};
	var wrap = $("<span />");
	var link = $("<a />").attr("href","/club/"+ar["id"]+"/").appendTo(wrap);
	if(ar["auto_tooltip"]) activate_club_links(link.attr("club_link",ar["id"]+""));
	if(ar["class"]) link.addClass(ar["class"]);
	if(ar["tooltip"]) link.tooltip(ar["tooltip"]);
	if(ar["name"]) link.html(ar["name"]);
	if(ar["html"]) link.append(ar["html"]);
	if(ar["flag"] && ar["country"]) wrap.append($("<span/>").text(" "),jqcountrylink({"country":ar["country"]}));
	if(ar["attr"])
	{
		for(var i in ar["attr"])
		{
			if(ar["attr"][i]) link.attr(i,ar["attr"][i]);
		}
	}
	if(ar["get_text"]) return $("<div />").html(wrap).html();
	return wrap;
}
function jqcountrylink(ar)
{
	if(!ar["country"])
	{
		if(ar["get_text"]) return "";
		return [];
	}
	var link = $("<a />").attr("href","/national-teams/"+ar["country"]+"/");
	if(ar["name"]) link.append(ar["name"]+" ");
	if(!ar["no_flag"]) link.append(get_flag(ar["country"]));
	if(ar["get_text"]) return $("<div />").html(link).html();
	return link;
}
function jqplayerlink(ar)
{
	ar = ar || {};
	var wrap = $("<span />");
	var link = $("<a />").attr("href","/players/"+ar["id"]+"/").appendTo(wrap);
	if(ar["name"]) link.append(ar["name"]);
	if(ar["flag"] && ar["country"]) wrap.append($("<span/>").text(" "),jqcountrylink({"country":ar["country"]}));
	if(ar["class"]) link.addClass(ar["class"]);
	if(ar["tooltip"]) link.tooltip(ar["tooltip"]);
	if(ar["auto_tooltip"]) activate_player_links(link.attr("player_link",ar["id"]+""));
	if(ar["attr"])
	{
		for(var i in ar["attr"])
		{
			if(ar["attr"][i]) link.attr(i,ar["attr"][i]);
		}
	}
	if(ar["get_text"]) return $("<div />").html(wrap).html();
	return wrap;
}
function jqclublogo(ar)
{
	if(ar["default"])
	{
		var logo_id = (club_id%25+1)+"";
		if(logo_id.length==1) logo_id="0"+logo_id;
		var url = "/pics/logos_nonpro/"+logo_id;
	}
	else 	var url = "/pics/club_logos/"+ar["id"];
	if(ar["size"]=="small") url+="_25";
	else if(ar["size"]=="large") url+="_140";
	url+=".png";
	if(ar["md5"]) url+="?img="+ar["md5"];
	var img = $("<img />").attr("src",url).addClass("club_logo");
	if(ar["class"]) img.addClass(ar["class"]);
	if(ar["attr"])
	{
		for(var i in ar["attr"])
		{
			if(ar["attr"][i]) img.attr(i,ar["attr"][i]);
		}
	}
	return img;
}

// *** banners.js *** //
// ************************** //
function banners_somthing(type)
{
	// var vist til phillip era ads 2018-2019.08
	return;
	/*console.log('b',type);
	if (type == 'rectangle' || type == 'rectangle_small') {
		console.log('R');
		return banners_old(type);
	} else {
		return;
	}*/
}
function banners(type) {
	if (type == 'top') {
		var i="<div data-fuse='22060510777'></div>";
	} else if (type == 'rectangle') {
		var i="<div data-fuse='22060509947'></div>";
	} else if (type == 'rectangle_small') {
		var i="<div data-fuse='22067003231'></div>";
	} else if (type == 'skyscraper') {
		var i=""; // new sticky stuff in bottom.php
	} else if (type == 'footer') {
		var i="<div data-fuse='22060508657'></div>";
	} else {
		var i="<iframe src='/banners1.php?type="+type+"&tier=t"+SESSION["banners"]["tier"]+"&ttt=1&112' frameborder='0' style='width: 100%; height: 100%'></iframe>";
	}
//	console.log('ob',type,i);
	return i;
}


$(document).ready(function(){
	$(".banner_placeholder[type=top]").html(banners("top"));
	$(".banner_placeholder[type=footer]").html(banners("footer"));
	$(".banner_placeholder[type=rectangle]").html(banners("rectangle"));
	$(".banner_placeholder[type=rectangle_small]").html(banners("rectangle_small"));
	$(".banner_placeholder[type=skyscraper]").html(banners("skyscraper"));
});

// *** tooltip.js *** //
// ************************** //
$.fn.tooltip = function(str, insert_mode) {
	insert_mode = insert_mode || false;
	if (str) tooltip.vars.init_tooltip_by_element_and_content(this, str, insert_mode);
	return $(this);
}

var tooltip = {

	"repos":function () {
		// Position the tooltip
		// Overflow check
		var tooltip_width = $("#tooltip").outerWidth();
		var tooltip_height = $("#tooltip").outerHeight();

		var new_x = (MOUSE.x + 24 + tooltip_width > $(window).width()) ? $(window).width()-tooltip_width-12 : MOUSE.x+12;
		var y_max = $(document).scrollTop()+$(window).height();

		var new_y;
		// Flip tooltip down or up
		if (MOUSE.y + 24 + tooltip_height > y_max) {
			new_y = MOUSE.y-tooltip_height-12;
			tooltip.outer().addClass("down");
		} else {
			tooltip.outer().removeClass("down");
			new_y = MOUSE.y+12;
		}

		// Place tooltip
		tooltip.outer().css({"position":"absolute", "left": new_x, "top": new_y});

	},

	"hide":function () {
		if (!tooltip.vars.override_tooltip_hide) {
			tooltip.outer().empty().hide();
		}
	},
	"show":function () { tooltip.outer().show(); },
	"inner":function() { return $("#tooltip") },
	"outer":function() { return $("#tooltip") },

	// Populate tooltip
	"content":function(str, insert_mode) {

		insert_mode = insert_mode || false;

		if (str) {

			// Hide tooltip
			if (typeof str == "string" && str.length == 0) {

				tooltip.hide();

			} else if (insert_mode == "text") {

				tooltip.inner().text(str);

			// Function? Run it!
			} else if (typeof str == "function") {

				tooltip.inner().html(str);

			} else {

				try {

					// Test if str is a var
					tooltip.inner().html(eval(str));

				} catch(e) {

					// ... If not, just write the content as HTML
					tooltip.inner().html(str);

				}
			}
		} else {

			tooltip.hide();

		}
		try {
			fix_tables();
		} catch(e) {
			// You need fix_tables in functions...
		}
		tooltip.repos();
	},

	// Constructs and populate tooltip
	"make":function (str, insert_mode) {

		insert_mode = insert_mode || false;

		// Check for tooltip div
		if(!$e("tooltip")) {

			// Make one if it's missing
			$("<div>").attr("id", "tooltip").click(function() {
				tooltip.hide();
			}).mouseleave(function() {
				tooltip.hide();
			}).appendTo("body");

		}

		// Initial loading animation, used for AJAX (possibly heavy js var)
		tooltip.content("<img src='/pics/small_circular_loading.gif' />");

		// Add content
		tooltip.content(str, insert_mode);

		//Show the tooltip
		tooltip.show();

	},

	"initiate":function() {
		$("[tooltip]").each(function() {
			var insert_mode = $(this).attr("content") || false;
			$(this).unbind("hoverIntent").hoverIntent(
				function() { tooltip.make($(this).attr("tooltip"), insert_mode); },
				function() { tooltip.hide(); }
			);
		})
	},

	"vars":{
		"init_tooltip_by_element_and_content":function(element, content, insert_mode) {
			insert_mode = insert_mode || false;
			element.unbind("hoverIntent").hoverIntent(
				function() { tooltip.make(content, insert_mode); },
				function() { tooltip.hide(); }
			);
		},
		"override_tooltip_hide":false
	}
}

// Lazy fix ;)
function init_tooltip_by_elems(elems) {
	tooltip.initiate();
}

// Adds events to tooltips
$(function() { tooltip.initiate(); });

// *** pm_new.js *** //
// ************************** //
var pm_lists = {};
var pm_settings_std = {"place":"inbox","per_page":10,"page":1,"show_pages":true,"current":0,"show_headers":true,"show_fade":true}; // Places: inbox/sent/trash
var pm_settings = {};
var tabindex=200;
function pm_get(id)
{
	if(!pm_settings[id]) pm_settings[id] = copy_of(pm_settings_std);
	$(id).find(".pm_container").remove();
	var $container = $("<div />").addClass("pm_container").appendTo(id);
	$container.html(get_loading_img());
	$.post("/ajax/pm_get_messages.ajax.php",{"place":pm_settings[id]["place"]},function(data){
		if(data != null)
		{
			pm_lists[id] = data["messages"];
			setTimeout(function(){
				pm_show(id);
			},500);
			if(pm_settings[id]["place"] == "inbox")
			{
				button_enable($("#mark_read_button"));
				button_enable($("#trash_all_button"));
				pm_update_unread_counters(id);
			}
			else
			{
				button_disable($("#mark_read_button"));
				button_disable($("#trash_all_button"));
			}
		}
	},"json");
}
function copy_of(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
function pm_show(id)
{
	var html = pm_html(id);
	var $container = $(id).find(".pm_container");
	$container.html(html);
	if(pm_settings[id]["show_fade"])
	{
		setTimeout(function(){ $(id).find(".text_fade").each(function(){make_text_fade($(this))})},1);
	}
	if(pm_settings[id]["show_pages"])
	{
		$container.append(pm_pages(id));
	}
}
function pm_filter(id)
{
	var filtered_list = [];
	var list = pm_lists[id];
	list = list || [];
	for(var i=0,j=0;i<list.length;i++,j++)
	{
		if(list[i])
		{
			if(true) // Whatever filters
			{
				filtered_list[j] = list[i];
				filtered_list[j]["list_id"] = i;
			}
		}
	}
	return filtered_list;
}
function pm_send()
{
	var recipient = $("#pm_to").val();
	var subject = $("#pm_subject").val();
	var message = $("#pm_text").val();
	var conversation_id = $("#pm_conversation_id").val();
	if(recipient == "" || subject == "" || message == "")
	{
		modal.inner().find(".pm_pop_errors").remove();
		modal.inner().find(".msgbuttons").before("<p class='error pm_pop_errors'>"+global_content["pm_specify_recipient_subject_message"]+"</p>");
		return false;
	}
	modal.transition(get_loading_img(),function(){
		$.post("/ajax/pm_send_message.ajax.php",{"recipient":recipient,"subject":subject,"message":message, "conversation_id":conversation_id,"club_id":SESSION["id"]},function(data){
			if(data != null)
			{
				if(data["refresh"])
				{
					page_refresh();
					return;
				}
				if (data["banned"]>0) modal.html("<h2>"+global_content["pm_not_allowed_to_pm"]+"</h2><div class='msgbuttons'>"+make_button(global_content["ok"],"modal.hide()")+"</div>");
				else modal.html("<h2>"+global_content["pm_send_message"]+"</h2><p>"+global_content["pm_message_sent"]+"</p>"+"<div class='msgbuttons'>"+make_button(global_content["ok"],"modal.hide()","","",tabindex++)+"</div>");
			}
			else
			{
				modal.html("<h2>"+global_content["pm_send_message"]+"</h2><p class='error'>"+global_content["pm_error_occurred"]+"</p>"
				+"<div class='msgbuttons'>"+make_button(global_content["ok"],"modal.hide()","","",tabindex++)+"</div>");
			}
			modal.banner();
			modal.inner().find(".button").focus();
		},"json");
	});
}

function pm_pop(id)
{
	var current = pm_settings[id]["current"];
	var pm = pm_lists[id][current];
	// Set as read
	if(pm["status"] == "unread") pm_set_status(id,current,"read");
	modal.html(get_loading_img()).show();
	if(!pm_settings[id]["responsive_width"]) modal.outer().css({"width":"600px"});
	$.post("/ajax/pm_get_message_text.ajax.php",{"id":pm["id"],"conversation_id":pm["conversation_id"]},function(data){
		if(data != null)
		{
			var club_link = get_club_link({"club":{"name":pm["sender_name"],"id":pm["sender_id"]},"class":""});
			if(pm["sender_id"] == 0) club_link = pm["sender_name"];
			var html = "<div class='alert'>"+global_content[514]+"</div>"
				+"<h2 tabindex='"+(tabindex++)+"'>"+pm["subject"]+"</h2>"
				+"<p class='bold'>"+club_link+" - <span class='subtle'>"+pm["long_time"]+"</span></p>";
			var forward_text = "";
			html +="<div id='pm_message'>";
			for(var i in data["conversation"])
			{
				var msg =data["conversation"][i];
				if(msg && typeof msg != "function")
				{
					html += "<hr /><p class='subtle'>"+msg["sender_name"]+" - "+msg["long_time"]+"</p><p>"+msg["message"]+"</p>";
					forward_text += "--\n[subtle]"+global_content["pm_from_colon"]+" "+msg["sender_name"]+" - "+msg["long_time"]+":[/subtle]\n"+msg["message_text"]+"\n\n";
				}
			}
			html +="</div>";
			pm_lists[id][current]["forward_text"] = "\n\n\n"+forward_text;
			var buttons = "<div class='msgbuttons'>";
			if(pm["sender_id"] != 0)
			{
				buttons += make_button("<img src='/pics/msg_reply.png' /> "+global_content["pm_reply"],"pm_new('"+id+"','reply')","","",tabindex++)+" ";
			}
			else
			{
				buttons += make_button("<img src='/pics/msg_reply.png' /> "+global_content["pm_reply"],"","disabled","","",tabindex++)+" ";
			}
			buttons += make_button("<img src='/pics/msg_forward.png' /> "+global_content["pm_forward"],"pm_new('"+id+"','forward')","","",tabindex++)+" ";
			buttons += make_button("<img src='/pics/small_red_x.png' /> "+global_content["pm_trash"],"pm_set_status('"+id+"',"+current+",'trash');modal.hide();","","",tabindex++)+" ";
			buttons += make_button("<img src='/pics/msg_unopened.png' /> "+global_content["pm_mark_unread"],"pm_set_status('"+id+"',"+current+",'unread');modal.hide();","","",tabindex++)+" ";
			buttons += make_button(global_content["close"],"modal.hide()","","",tabindex++);
			buttons += "</div>";
			modal.html(html+buttons).inner().find("h2").focus();
			activate_club_links(modal.inner().find("[club_link]"));
			if(data["update_pro"]) pro_update();
		}
	},"json");
}
// ** Pop new Message ** //
function pm_new(id,type,club_id)
{
	if (SESSION["pm_ban"]>0)
	{
		var html = "<div class=\"error\">"+global_content["pm_not_allowed_to_pm"]+"</div><div class='msgbuttons'>" + make_button("Ok","modal.hide()","","",tabindex++) + "</div>";
		modal.html(html).show().inner().attr("tabindex",-1).focus();
		return false;
	}
	if(id != "")
	{
		var current = pm_settings[id]["current"];
		var pm = pm_lists[id][current];
		if (pm)
		{
			var subject = pm["subject"].replace(/re: /g,"").replace(/fwd: /,"");
			var conversation_id = pm["conversation_id"] == 0 ? pm["id"] : pm["conversation_id"];
		}

	}
	if(type == "reply")
	{
		var $prev_message = $("#pm_message");
		subject = "re: "+subject;
		var html = "<h2>"+global_content[399]+"</h2>"
			+"<div class='pm_input'><label for='pm_to'>"+global_content["pm_to_colon"]+"</label> <span class='bold large'>"+pm["sender_name"]+"</span><input type='hidden' id='pm_to' value='"+pm["sender_id"]+"'/></div>"
			+"<div class='pm_input'><label for='pm_subject'>"+global_content["pm_subject_colon"]+"</label><input type='text' class='stdwidth emboss' id='pm_subject' value='"+subject+"' tabindex='"+(tabindex++)+"'/></div>"
			+"<input id='pm_conversation_id' type='hidden' value='"+conversation_id+"' />"
			+"<label>"+global_content["pm_message_colon"]+" </label><textarea class='emboss' focus rows='8' cols='70' id='pm_text' tabindex='"+(tabindex++)+"'></textarea>";
		var buttons = buttons = "<div class='msgbuttons'>"
			+ make_button(global_content["send"],"pm_send()","","",tabindex++)+" "
			+ make_button(global_content["cancel"],"modal.hide()","","",tabindex++)
			+ "</div>";
		modal.transition(html+buttons,function(){
			modal.inner().append(
				$("<span/>").html(global_content[498]).addClass("faux_link").css("color","#B8D988").attr("id","show_prev_messages").click(function(){$("#pm_message").toggle();}),
				$prev_message.hide()
			);
			emboss();
			$("#pm_text").focus();
		});
		return false;
	}
	if(type == "forward")
	{
		subject = "fwd: "+subject;
		var html = "<h2>"+global_content["pm_forward"]+"</h2>"
		var forward_text = pm["forward_text"];
	}
	else if(type == "new")
	{
		subject = "";
		var html = "<h2>"+global_content["pm_new_message"]+"</h2>";
		var forward_text = "";
	}
	html += "<div class='pm_input'>"
			+"<label for='pm_to'>"+global_content["pm_to_colon"]+" </label><input type='text' class='stdwidth emboss' id='pm_to' autocomplete='off' onkeyup='suggest_clubs(10,\"pm_to\")' value='"+(club_id> 0 ? club_id : "")+"' tabindex='"+(tabindex++)+"'/>"
			+"<span id='pm_to_name' class='bold large'></span><input id='pm_to_href' type='hidden' value='javascript:select_club' />"
			+"<input id='pm_conversation_id' type='hidden' value='0' />"
		+"</div>"
		+"<div class='pm_input'><label for='pm_subject'>"+global_content["pm_subject_colon"]+" </label><input type='text' class='stdwidth emboss' id='pm_subject' value='"+subject+"' tabindex='"+(tabindex++)+"'/></div>"
		+"<label>"+global_content["pm_message_colon"]+" </label><textarea class='emboss' rows='8' cols='70' id='pm_text' tabindex='"+(tabindex++)+"'>"+forward_text+"</textarea>";
	var buttons = "<div class='msgbuttons'>"
		+ make_button(global_content["send"],"pm_send()","","",tabindex++)+" "
		+ make_button(global_content["cancel"],"modal.hide()","","",tabindex++)
		+ "</div>";
	if(type == "forward")
	{
		modal.transition(html+buttons,function(){
			emboss();
			setTimeout(function(){$("#pm_to").focus()},300);
		});
	}
	else if(type=="new")
	{
		modal.html(html+buttons).show();
		emboss();
		if(club_id > 0) $("#pm_subject").focus();
		else $("#pm_to").focus();
	}
}
function pm_set_status(id,list_id,status,confirm)
{
	if(list_id == "all")
	{
		pm_status_ajax(status,"all");
		if(status == "read")
		{
			for(var i in pm_lists[id])
			{
				if(pm_lists[id][i]["status"] == "unread") pm_lists[id][i]["status"] = "read";
			}
		}
		else if(status == "trash")
		{
			if(!confirm)
			{
				var $html = $("<div />").html("<strong class='large'>"+global_content[507]+"</div>").append(
					$("<div />").addClass("msgbuttons").append(
						$(make_button(global_content["ok"],"pm_set_status('"+id+"','"+list_id+"','"+status+"',true)")).attr("tabindex",tabindex++),
						$(make_button(global_content["cancel"],"modal.hide()")).attr("tabindex",tabindex++)
						)
					);
				modal.html($html).show();
				$html.attr("tabindex","-1").focus();
				return;
			}
			else
			{
				modal.hide();
				pm_lists[id].splice(0,pm_lists[id].length);
			}
		}
	}
	else
	{
		pm_status_ajax(status,pm_lists[id][list_id]["id"]);
		if(status == "trash" || status == "inbox")
		{
			pm_lists[id].splice(list_id,1);

		}
		else if(status == "read" || status == "unread")
		{
			pm_lists[id][list_id]["status"] = status;
		}
	}
	pm_update_unread_counters(id);
	pm_show(id);
}
function pm_update_unread_counters(id)
{
	if(pm_settings[id]["place"] != "inbox") return;
	var count_unread = 0;
	for(var i in pm_lists[id])
	{
		if(pm_lists[id][i]["status"] == "unread") count_unread++;
	}
	if(count_unread == 0)
	{
		$(".top_user_info .pm_block").removeClass("new").find(".count").html("0");
//		$("#buddy_msg").find(".buddy_bar_notification_frame").removeClass("new").find(".count").text(0);
		$("#tabprivate_messages_main div .tab_notification").text(0).hide();
		SESSION["new_pm"] = 0;
	}
	else
	{
		$(".top_user_info .pm_block").addClass("new").find(".count").html(count_unread > 8 ? "9+" : count_unread);
//		$("#buddy_msg").find(".buddy_bar_notification_frame").addClass("new").find(".count").html(count_unread > 8 ? "9+" : count_unread);
		$("#tabprivate_messages_main div .tab_notification").text(count_unread).show();
		SESSION["new_pm"] = count_unread;
	}
}
function pm_status_ajax(status,id)
{
	$.post("/ajax/pm_set_message_status.ajax.php",{"status":status,"message_id":id},function(data){},"json");
}
function pm_html(id)
{//	view
	var list = pm_filter(id);
	var page = pm_settings[id]["page"];
	var per_page = pm_settings[id]["per_page"];
	per_page = per_page == 0 ? list.length : per_page; // if 0 , show all
	var $ul = $("<ul class='pm_list border_bottom'>");
	if(pm_settings[id]["show_headers"])
	{
		var subject = pm_settings[id]["subject_first"] ? "" : "<span class='pm_subject text_fade'>"+global_content["pm_subject"]+"</span>";
		var subject_first = pm_settings[id]["subject_first"] ? "<span class='pm_subject text_fade'>"+global_content["pm_subject"]+"</span>" : "";

		if(pm_settings[id]["place"] == "sent") var from_col = global_content["pm_to"];
		else var from_col = global_content["pm_from"];
		$("<li class='list_header pm_message' >"
			+subject_first
			+"<span class='pm_icon'></span>"
			+"<span class='pm_name text_fade'>"+from_col+"</span>"
			+subject
			+"<span class='pm_time'>"+global_content["pm_time"]+"</span>"
			+"<span class='pm_options'>"+pm_options+"</span>"
			+"<div class='clear'></div>"
			+"</li>").appendTo($ul);
	}
	for(var i=(page-1)*per_page;i<(page)*per_page && i<list.length;i++)
	{
		var m = list[i];
		if(m && typeof m != "function")
		{
			//  Message options string
			var pm_options = "";
			if(pm_settings[id]["place"] == "inbox")
			{
				if(m["status"] == "read"){
					pm_options = "<img src='/pics/msg_unopened.png' onclick='pm_set_status(\""+id+"\","+m["list_id"]+",\"unread\")'> ";
				}
				else {
					pm_options = "<img src='/pics/msg_check.png' onclick='pm_set_status(\""+id+"\","+m["list_id"]+",\"read\")'> ";
				}
				pm_options += "<img src='/pics/small_red_x.png' onclick='pm_set_status(\""+id+"\","+m["list_id"]+",\"trash\")'>";
			}
			else if(pm_settings[id]["place"] == "trash")
			{
				pm_options = "<img src='/pics/msg_restore.png' onclick='pm_set_status(\""+id+"\","+m["list_id"]+",\"inbox\")'>";
			}
			else {
				pm_options = m["time"];
			}
			var replies = m["reply_count"] > 0 ? "<span class='subtle unbold very_small'>("+(m["reply_count"]+1)+")</span>" : "";
			var status = pm_settings[id]["place"] == "sent" ? "read" : m["status"];
			var name = pm_settings[id]["place"] == "sent" ? m["recipient_name"] : m["sender_name"];
			var subject = pm_settings[id]["subject_first"] ? "" : "<span class='pm_subject text_fade'>"+replies+m["subject"]+"</span>";
			var subject_first = pm_settings[id]["subject_first"] ? "<span class='pm_subject text_fade'>"+replies+m["subject"]+"</span>" : "";

			var $li = $("<li class='pm_"+status+" pm_message' pm_id='"+m["id"]+"' conv_id='"+m["conversation_id"]+"' list_id='"+m["list_id"]+"'>"
				+subject_first
				+"<span class='pm_icon'></span>"
				+"<span class='pm_name text_fade'>"+name+"</span>"
				+subject
				+"<span class='pm_time'>"+m["time"]+"</span>"
				+"<span class='pm_options'>"+pm_options+"</span>"
				+"<div class='clear'></div>"
				+"</li>").appendTo($ul);
			$li.find(".pm_icon, .pm_name, .pm_subject").click(function(){
				pm_settings[id]["current"] = parseInt($(this).parent().attr("list_id"));
				pm_pop(id);
			});
			$li .mouseover(function(){
					$(this).find(".pm_time").hide();
					$(this).find(".pm_options").show();
				})
				.mouseout(function(){
					$(this).find(".pm_options").hide();
					$(this).find(".pm_time").show();
				});
		}
	}
//	ul_zebra($ul);
	return $ul;
}
function pm_pages(id)
{
	var list = pm_lists[id];
	var settings = pm_settings[id];

	var $pages = $("<div />").addClass("align_right").css("padding","6px 0");
	var max_pages = Math.ceil(list.length / settings["per_page"]);
	var dots_first = 0, dots_last = 0;
	for(var m = 1; m <= max_pages ; m++)
	{
		var $page = "";
		if(m == max_pages || m == 1 || m == settings["page"] || m == settings["page"]-1 || m == settings["page"]+1)
		{
			$page = $('<a href="javascript:pm_change_page(\''+id+'\','+m+')" class=\"weight_normal page_navigation\">'+m+'</a>');
			if(settings["page"] == m) $page.addClass("selected");
		}
		else if((dots_first == 0 && m < settings["page"])|| (dots_last == 0 &&m > settings["page"]))
		{
			$page = $("<span> ... </span>");
			if(m < settings["page"]) dots_first++;
			else dots_last++;
		}
		$pages.append($page);
	}
	return $pages;
}
function pm_change_place(id,place)
{
	pm_settings[id]["place"] = place;
	pm_get(id);
}
function pm_change_page(id,page)
{
	pm_settings[id]["page"] = page;
	pm_show(id);
}
// Auto suggest select
function select_club(club_id,suggestion_id){
	$("#pm_to").val(club_id).hide().closest(".emboss_outer").hide();
	$("#pm_to_name").html(" "+$("#suggestion_id_"+suggestion_id).html()).show();
	$("#pm_to_name").unbind("click").click(function(){
		$(this).hide();
		$("#pm_to").show().closest(".emboss_outer").show();
		$("#pm_to").focus();
	});
	suggest_clubs_clear();
	$("#pm_subject").focus();
}


// *** custom_jquery_plugins.js *** //
// ************************** //
$.fn.changeIn = function(html, settings) {

	settings = settings || {};

	// Selector for objects to compare
	var selector = settings["selector"] || "li";

	// Effect to illustrate change
	var effect = settings["effect"] || function(e) { e.effect("pulsate") };

	// Search for elements or iterate over them
	var search = settings["search"] || false;

	// Mode to use
	var mode = settings["mode"] || false;

	// Scope
	var old_content = $(this);

	if (html) {

		if (mode == "static") {

			var i = 0;
			html.find(selector).each(function() {
				var old_elem = $(old_content).find(selector+':eq('+i+')');
				if (old_elem) {
					if (old_elem.html() != $(this).html() || old_elem.attr("class") != $(this).attr("class")) {
						old_elem.replaceWith($(this));
						effect($(this));
					}
				}
				i++;
			})

		// Search mode
		} else if (mode == "search" ) {

			html.find(selector).each(function() {
				var new_elem = $(this);
				var found = false;
				$(old_content).find(selector).each(function() {
					if (new_elem.html() == $(this).html() && new_elem.attr("class") == $(this).attr("class")) {
						found = true;
					}

				})
				if (!found) effect($(this));
			})
			$(this).html(html);

		// Normal mode
		} else {
			var i = 0;
			html.find(selector).each(function() {
				var new_elem = $(old_content).find(selector+':eq('+i+')');
				if (new_elem) {
					if (new_elem.html() != $(this).html() || new_elem.attr("class") != $(this).attr("class")) {
						effect($(this));
					}
				}
				i++;
			})
			$(this).html(html);
		}



		return $(this);
	}
}

// *** top_menu.js *** //
// ************************** //
var top_menu = {
	"change":function (index, skip_animation) {

		$("[top_menu='"+index+"']").parent("li").siblings().removeClass("selected");
		$("[top_menu='"+index+"']").parent("li").addClass("selected");

		if (index != top_menu["vars"]["selected_menu"]) {
			if (top_menu["vars"]["menu_data"] != null) {
				top_menu["vars"]["selected_menu"] = index;
				var new_sub_div = $("<div class='top'>");
				var delay = 0;
				for (var i=0; i<top_menu["vars"]["menu_data"][index]["items"].length; i++) {
					var row = top_menu["vars"]["menu_data"][index]["items"][i];

					// Add selected?
					var selected = "";
					var page = PAGE.split(".")[0];
					var selected = (page == row["link"] || SUBPAGE == row["link"]) ? "selected" : "";
					//var url = row["https"] ? "https://"+location.host+"/"+row["link"]+"/" : "http://"+location.host+"/"+row["link"]+"/";
					var url = "/"+row["link"]+"/";
					var a = $("<a>").attr("sub_menu_a", i).addClass(selected).text(row["title"]).attr("href", url);
					if(row.class) a.addClass(row.class);
					if (!skip_animation) a.css("opacity",0).delay(delay).animate({"opacity":1}, 300)
					new_sub_div.append(a);
					delay += 100;

				}
				$("#top_menu_sub").html(new_sub_div);
			}
			return false;

		} else {
			return true;
		}


	},
	"toggle_mega_menu":function() {
		if (!$("#mega_menu_items")[0]) {
			$("#mega_menu").html(top_menu.vars.html_make_mega_menu());
		}
		$("#mega_menu").removeClass("hide").fadeToggle(150);
	},
	"lock_all":function() {

		$("[top_menu]").unbind("click").removeAttr("href").addClass("disabled").css({"opacity":0.2});

		$("[sub_menu_a]").unbind("click").removeAttr("href").addClass("disabled").css({"color":"#555"});

	},
	"lock":function(over_menu, sub_menu, skip_arrow) {

		top_menu["vars"]["selected_menu"] = 99;
		top_menu.change(over_menu, true);

		$("[sub_menu_a]").not("[sub_menu_a='"+sub_menu+"']").unbind("click").removeAttr("href").addClass("disabled").css({"color":"#555"});

		$("[top_menu='"+over_menu+"']").removeClass("disabled").animate({
			"opacity":1
		}, 400);

		if (!skip_arrow) {

			add_arrow_to_element("[top_menu='"+over_menu+"']");

			setTimeout(function() {

				clear_arrows();
				add_arrow_to_element("[sub_menu_a='"+sub_menu+"']");

				$("[sub_menu_a]").not("[sub_menu_a='"+sub_menu+"']").animate({
					"color":"#555"
				}, 400);

			}, 2000)

		}

	},
	"vars":{
		"html_make_mega_menu":function() {
			var div = $("<div id='mega_menu_items'>");
			for (var i=0; i<top_menu["vars"]["menu_data"].length; i++) {
				var sub_div = $("<div>");
				for (var j=0; j<top_menu["vars"]["menu_data"][i]["items"].length; j++) {
					var row = top_menu["vars"]["menu_data"][i]["items"][j];
					var url = row["https"] ? "https://"+location.host+"/"+row["link"]+"/" : "http://"+location.host+"/"+row["link"]+"/";
					var a = $("<a>").text(row["title"]).attr("href", url);
					sub_div.append(a);
				}
				div.append(sub_div);
			}
			return div;
		},
		"selected_menu":null,
		"menu_data":null,
		"pop":function() {

			var mega_found = false;
			$("[top_menu]").each(function() {

				var index = $(this).attr("top_menu");

				var page = PAGE.split(".")[0];

				var found = false;
				if (page == top_menu["vars"]["menu_data"][index]["link"]) {
					found = true;
				}
				for (var i in top_menu["vars"]["menu_data"][index]["items"]) {
					var row = top_menu["vars"]["menu_data"][index]["items"][i];
					if (page == row["link"]) {
						found = true;
					}
				}

				if (found) {
					mega_found = true;
					$(this).parent("li").addClass("selected");
					top_menu.change(index, true);
				}

			})
			.click(function() {
				return top_menu.change($(this).attr("top_menu"));
			});
			if (!mega_found) {
				$("[top_menu=0]").parent("li").addClass("selected");
				top_menu.change(0, true);
			}

		}
	}

}

$(function() {
	top_menu["vars"].pop();
	$("#toggle_mega_menu").click(function() {
		$(this).toggleClass("open");
		top_menu.toggle_mega_menu();
		//if($(this).hasClass("open")) click_action_log(1); // Log mega menu toggling
	});

})

// *** date_format.js *** //
// ************************** //
var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
	return dateFormat(this, mask, utc);
};

// *** onload.js *** //
// ************************** //
var MOUSE = {"x":0, "y":0};

$(document).ready(function(){
		// Update tooltip pos on mousemove
		$(document).mousemove(function(e) { MOUSE = {"x":e.pageX, "y":e.pageY}; });

		// Text Size Stylesheet via Cookie
		//setActiveStyleSheet((readCookie("style") || "Medium Text"));
		if (readCookie("bidi") == "true") { $("#bidi").removeAttr("disabled"); }


		// Tab fix
		$(".tabs").addClass("clearfix");

		// Hide elements
		$(".hide").hide();

		// fix_tables cellspacing/padding
		fix_tables();

		// Zebra tables and lists
		zebra();

		// Content menu fix
		$("div.content_menu a:first-child").css("border", "none");

		// Tabs
		$(".tabs").find("*:first").addClass("active_tab");			// Activate first tab
		$(".tab_container").children().hide();						// Hide all content...
		$(".tab_container *:first-child").show();					// ... Then show first tab content
		// Tabs On Click Event
		$(".tabs").children().click(function() {
			if ($(this).attr("set_active")) {
				$(this).siblings().removeClass("active_tab");	// Remove any "active" class
				$(this).addClass("active_tab");					// Add "active" class to selected tab
				var activeTab = $(this).attr("set_active");		// Find the set_active attribute value to identify the active tab + content

				$("#"+activeTab).siblings().hide();				// Hide all tab content
				$("#"+activeTab).show();						// Show tab
			}
		});
		// If tab is set as selected, click it!
		$(".tabs").find("[selected]").click();


		// NEW Tabs
		// Tabs On Click Event
		$(".tabs_content").children().hide();
		$(".tabs_new").children().click(function() {
			if ($(this).attr("tab_active")) {
				$(this).siblings().removeClass("active_tab");	// Remove any "active" class
				$(this).addClass("active_tab");					// Add "active" class to selected tab
				var activeTab = $(this).attr("tab_active");		// Find the set_active attribute value to identify the active tab + content

				$("#"+activeTab).siblings().hide();				// Hide all tab content
				$("#"+activeTab).show();						// Show tab
			}
		});
		// If tab is set as selected, click it!
		$(".tabs_new").each(function(){
			if($(this).find("[selected]").length > 0) $(this).find("[selected]").click();
			else $(this).find(":first").click();
		});

		// Sortable tables
		sortable_tables();

		enable_expandable_content();
		//$("span[type=player]").get_player_link();
		activate_player_links($("[player_link]"));
		activate_match_links($("[match_link]"));
		activate_club_links($("[club_link]"));
		activate_league_links($("[league_link]"));

		// Highlighted rows in tables
		make_highlighted_rows()
		// Embossed/Raised input and textareas
		emboss();
		raise();

		/* Lorem */
		$("[lorem]").each(function() {
			$(this).text(lorem($(this).attr("lorem")));
		});

		// Close message box on escape
		$(window).keyup(function(e){
			if(e.keyCode == 27)
			{ // Esc
				close_message_box();
				modal.hide();
			}
		});

		// Focus input/textarea
		$("[focus]").focus();
	}
);