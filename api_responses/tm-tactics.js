var national,reserves,miniGameId;
players = {};
post_players = {};
players_by_id = {}; // array of player_id : i - in player[i];
on_field = {};
on_subs = {};
on_field_assoc = {};
formation_by_pos = {};
positions = {};
tactics_filters = {"gk":true,"d":true,"m":true,"f":true,"l":true,"c":true,"r":true,"inj":true};
var show_field_players_in_list = false;
function tactics_init(callback)
{
	$.post("/ajax/tactics_get.ajax.php",{"reserves":reserves,"national":national,miniGameId: miniGameId},function(data){
		if(data != null)
		{
			players = data["players"];
			for(var i in players)
			{
				var p = players[i];
				p["no_sort"] = parseInt(p["no"]);
				p["name_sort"] = p["lastname"];
				p["rec_sort"] = eval(p["rec_sort"]);
				players[i];
				players_by_id[p["player_id"]] = p;
			}
			on_field = data["formation"];
			formation_by_pos = data["formation_by_pos"];
			on_subs = data["formation_subs"];
			on_field_assoc = data["formation_assoc"];
			positions = data["positions"];
			tactics_field_players();
			tactics_subs();
			tactics_list_players();
			make_droppable();
			if(typeof callback == "function"){
				callback.call(this);
			}
		}
	},"json");
	make_tactics_drag_shirt("");
	hide_tactics_drag_shirt();
}
function tactics_list_players()
{
	var $list = $("#tactics_list_list");
	var $ul = $("<ul>").addClass("tactics_list");
	var gk_header = false;
	for(var i in players)
	{
		var p = players[i];
		if(p)
		{
			p["on_field"] = on_field[p["player_id"]] || on_subs[p["player_id"]];
			if(tactics_filter_show(p))
			{
				var str = "<div class=\"list_column no_col align_center\">"+p["no"]+"</div>"
					+"<div class=\"vert_split\"></div>"
					+ "<div class=\"list_column pos_col align_center\">"+p["favorite_position_short"]+"</div>"
					+"<div class=\"vert_split\"></div>"
					+ "<div class=\"list_column name_col\"><div class=\"padding\"><span class='player_name' player_link='"+p["player_id"]+"' player_id='"+p["player_id"]+"'>"+p["name"]+"</span>"+(p["show_flag"] ? " "+p["flag"] : "" )+(p["status_no_check"] == "" ? "" : " "+p["status_no_count"] )+"</div></div>"
					+"<div class=\"vert_split\"></div>"
					+ "<div class=\"list_column rec_col\"><div class=\"padding\">"+p["recommendation"]+"</div></div>"
					+"<div class=\"clear\"></div>";
				var $li = $("<li>").html(str).appendTo($ul).attr("player_id",p["player_id"]).attr("player_link",p["player_id"]).attr("i",i).addClass("draggable").attr("player_no",p["no"]);
	//			$li.attr("lastname",p["lastname"]);
//				$li.hoverIntent(hoverIntentConfig);
				$li.mouseover(function(){$(this).addClass("hover")}).mouseout(function(){$(this).removeClass("hover")});
				$li.find(".favposition").removeClass("short");
				if(on_field[p["player_id"]]) {
					$li.addClass("on_field");
					$li.attr("position",on_field[p["player_id"]]);
				}
				else if(on_subs[p["player_id"]]){
					$li.attr("position",on_subs[p["player_id"]]);
					$li.addClass("on_subs");
				}
				else if(show_field_players_in_list) $li.addClass("subtle_gray");

				// Player link on CTRL+CLICK
				$li.find(".player_name").click(function(e){
					if(e.ctrlKey)
					{
						window.open("/players/"+$(this).attr("player_id")+"/"+$(this).html().replace(" ","_").replace(". ","_")+"/");
					}
				});
				make_draggable($li);
				activate_player_links($li.find("[player_link]"));
			}
		}
	} // i in players
	$list.html($ul);
	$list.verticalScroll({
		"force_scroll": true,
		"style":"dark",
		"scroll_width":25
	});
}

var sm_count = 0;
function tactics_set_player(p,$elem)
{
	hoverIntentConfig = {
        interval: 300, // number = milliseconds for onMouseOver polling interval
        over: function() {
			tooltip.make("make_player_link("+$(this).attr("player_id")+")");
        }, // function = onMouseOver callback (REQUIRED)
        out: function() {
			tooltip.hide();
		} // function = onMouseOut callback (REQUIRED)
    };
	$elem.hoverIntent(hoverIntentConfig);
	$elem.attr("show_flag",p["show_flag"]);
	if($elem.hasClass("field_player"))
	{
		$elem.attr("player_set","true");
		$elem.find(".field_player_name").html(p["lastname"]);
		$elem.find(".field_player_rec").html("<div class=\"tactics_rec tactics_rec_"+p["pos_rec"]+"\"></div>");
		$elem.find(".tactics_shirt").html(p["no"]);
		$elem.attr("player_no",p["no"]).attr("player_id",p["player_id"]).show();
		var $icons = $elem.find(".icons");
		if($icons.length == 0) $icons = $("<div class=\"icons\" />").appendTo($elem);
		$icons.html("");
		if(p["status_no_check"] != "")
		{ // add status icon
			$icons.append("<span class=\"status\">"+p["status_no_count"]+"</span>");
		}
		if(p["show_flag"])
		{ // Add flag
			$elem.find(".field_player_name").append(" "+p["flag"]);
			$elem.attr("show_flag",true);
		}
		if(true)
		{ // Add Mood
			var m = retPlayerMood(p["fp"],$elem.attr("position_key"));
			if(m > 0)
			{
				// moods 0-6 - only 3-6 (angry ones) used
				$icons.append("<div class=\"mood mood"+(m+2)+"\"></div>");
			}
		}
		$elem.unbind("click").click(function(e){
			if(e.ctrlKey) window.open("/players/"+$(this).attr("player_id")+"/"+players_by_id[$(this).attr("player_id")]["lastname"].replace(" ","_")+"/");
		});
	}
	else if($elem.hasClass("bench_player"))
	{
		$elem.attr("player_set","true");
		$elem.find(".rec_stars").html("<div class=\"tactics_rec tactics_rec_"+p["pos_rec"]+"\"></div>");
		$elem.find(".tactics_shirt").removeClass("dashed transp").html(p["no"]);
		$elem.find(".bench_player_name").html(p["name"]);
		$elem.attr("player_id",p["player_id"]).attr("player_no",p["no"]);
		if(p["show_flag"])
		{ // Add flag
			$elem.find(".bench_player_name").append(" "+p["flag"]);
		}
		var $icons = $elem.find(".icons");
		if($icons.length == 0) $icons = $("<div class=\"icons\" />").appendTo($elem);
		$icons.html("");
		if(p["status_no_check"] != "")
		{ // add status icon
			$icons.append("<span class=\"status\">"+p["status_no_count"]+"</span>");
		}
		$elem.click(function(e){
			if(e.ctrlKey) window.open("/players/"+$(this).attr("player_id")+"/"+players_by_id[$(this).attr("player_id")]["lastname"].replace(" ","_").replace(". ","_")+"/");
		});
	}
	$elem.attr("player_link",p["player_id"]);
	activate_player_links($elem);
}
function tactics_unset_player($elem)
{ // elem is
	hoverIntentConfigUnset = {
        interval: 300, // number = milliseconds for onMouseOver polling interval
        over: function() {
//			$(this).attr("tooltip","");
			return false;
        }, // function = onMouseOver callback (REQUIRED)
        out: function() {
			return false;
		} // function = onMouseOut callback (REQUIRED)
    };
	var $player = $("#player_"+$elem.attr("position"));
	if($player.hasClass("field_player"))
	{
		$player.attr("show_flag","false");
		$player.attr("player_set","false");
		$player.attr("player_no","").attr("player_id","").hide();
		$player.find(".field_player_name").html("");
		$player.find(".field_player_rec").html("");
		$player.find(".tactics_shirt").html("").addClass("transp");
		$player.find(".icons").html("");
	}
	else if($player.hasClass("bench_player"))
	{
		$player.attr("show_flag","false");
		$player.attr("player_set","false");
		$player.find(".rec_stars").html("");
		$player.find(".tactics_shirt").addClass("dashed transp").html("");
		$player.find(".bench_player_name").html("");
		$player.attr("player_id","").attr("player_no","");
		$player.find(".icons").html("");
	}
	$player.hoverIntent(hoverIntentConfigUnset);
}
function make_draggable($el)
{
	$el.draggable({
		helper: function(){
			var $shirt = make_tactics_drag_shirt(tactics_make_shirt($(this).attr("player_no"),"drag"));
			return $shirt;
		}, //"clone",
		cursorAt: { left: 15 },
//		create: function(e,ui){},
//		drag: function(e,ui){},
		start: function(e,ui)	{
			$("#tactics_field, #tactics_subs").addClass("active");
			var p = players_by_id[$(this).attr("player_id")];
			if(p["show_flag"] && on_field[p["player_id"]] == null &&  on_subs[p["player_id"]] == null)
			{ // Foreigners
				var foreigners = 0;
				for(var i in on_field)
				{
					if(players_by_id[i]["show_flag"]) foreigners++;
				}
				for(var i in on_subs)
				{
					if(players_by_id[i]["show_flag"]) foreigners++;
				}
				if(foreigners >= 5)
				{
					$(".droppable[show_flag=false]").droppable( "option", "disabled", true );
					$(".droppable[show_flag=false]").addClass("disabled");
//					$(".droppable[show_flag=false]").find(".tactics_shirt").addClass("drag");
				}
			}
			$(this).addClass("active");
			$("#player_"+$(this).attr("position")).addClass("active");
			$(ui.helper).css({"width":"40px","z-index":"10","cursor":"pointer"}).attr("player_id",$(this).attr("player_id")).appendTo("body");
			if(count(on_field) <11 || on_field[$(this).attr("player_id")] != null)
			{
				$("#tactics_field .tactics_shirt.transp").parent().css("display","inline-block");
			}
			else $("#tactics_field .tactics_shirt.transp").parent().hide();
			$("[player_set=true]").find(".tactics_shirt").addClass("transp opacity");
			$(".droppable.disabled[player_set=true]").find(".tactics_shirt").removeClass("transp opacity");
		},
		stop: function(e,ui)
		{
/*			$(".droppable.disabled").droppable("option","disabled",false);
			$(".droppable.disabled").removeClass("disabled");
			$("[player_set=true]").find(".tactics_shirt").removeClass("transp opacity");
			$("#tactics_field .tactics_shirt.transp").parent().hide();
			*/
			stop_drag($(this));
			$(this).removeClass("active");
		}
	});
}
function stop_drag($el)
{
	$("#tactics_field, #tactics_subs").removeClass("active");
	$(".droppable.disabled").droppable("option","disabled",false);
	$(".droppable.disabled").removeClass("disabled");
	$("[player_set=true]").find(".tactics_shirt").removeClass("transp opacity");
	$("#tactics_field .tactics_shirt.transp").parent().hide();
	$("#player_"+$el.attr("position")).removeClass("active");
}
function tactics_field_players()
{
	$("#tactics_field").html("");
	// Html classes and player positions on each line
	var player_lines = {
		"goalkeeper": {"left_block":0,"center_block":1,"right_block":0},
		"defenders": {"left_block":1,"center_block":3,"right_block":1},
		"def_midfielders": {"left_block":1,"center_block":3,"right_block":1},// center_block = 2, but with dmcl-dmc-dmcr as player positions
		"midfielders": {"left_block":1,"center_block":3,"right_block":1},
		"off_midfielders": {"left_block":1,"center_block":3,"right_block":1}, // center_block = 2, but with omcl-omc-omcr as player positions
		"forwards": {"left_block":0,"center_block":3,"right_block":0}
	};
	// Player position classes
	var player_classes = {
		"goalkeeper": "gk",
		"defenders": "def",
		"def_midfielders": "mid",
		"midfielders": "mid",
		"off_midfielders": "mid",
		"forwards": "forward"
	};
	// Position count
	var count = 0;
	for(var i in player_lines)
	{ // Make each line on the field
		var line = player_lines[i];
		var $line = $("<div>").addClass("field_line "+i).prependTo("#tactics_field");
		for(var j in line)
		{ // Make each block in the line (L-C-R)
			var block = line[j];
			var $block = $("<div>").addClass(j).appendTo($line);
			for(var k = 0; k < block; k++)
			{ // Make each player in the block
				if(positions[count] == "dmc" || positions[count] == "omc")
				{ // If dmc or omc - move player to dmr/omr and skip player insert
					if(formation_by_pos[count] > 0)
					{
						on_field[formation_by_pos[count]]= positions[count+1];
						formation_by_pos[count+1] = formation_by_pos[count];
						formation_by_pos[count] = null;
						on_field_assoc[positions[count]+"r"] = on_field_assoc[positions[count]];
						on_field_assoc[positions[count]] = null;
					}
				}
				else
				{ // Insert player on field
					var $player = $("<div>").addClass("field_player droppable").attr("id","player_"+positions[count]).attr("position",positions[count]).appendTo($block).attr("position_key",count).attr("player_set",false).attr("show_flag",false);
					$player.append("<div class=\"field_player_rec\"></div>");
					$shirt = $("<div class=\"tactics_shirt "+player_classes[i]+"\">").appendTo($player);
					$player.append("<div class=\"field_player_name\">");
					if(formation_by_pos[count] > 0)
					{
						var p = players_by_id[formation_by_pos[count]];
						tactics_set_player(p,$player);
					}
					else
					{
						$shirt.addClass("transp");
						$player.hide();
					}
					make_draggable($player);
				}
				// Next position
				count++;
			} // k in block
		} // j in line
		// Clear line float
		$line.append("<div class=\"clear\"></div>");
	} // i in player_lines
}
function tactics_subs()
{
	// ** Kicktackers + captain
	var $kicks = $("<div>").attr("id","tactics_kickers").addClass("tactics_kickers").appendTo("#tactics_subs");
	var $ul = $("<ul>").appendTo($kicks);
	var kickers = {"captain":[pagecontent[0],"drag"],"corner":[pagecontent[1],"drag"],"penalty":[pagecontent[2],"drag"],"freekick":[pagecontent[3],"drag"]};
	for(var i in kickers)
	{
		var p = players_by_id[on_field_assoc[i]];
		var $li = $("<li>").appendTo($ul).append(tactics_make_shirt("",kickers[i][1]+" dashed transp")).addClass("droppable_kick kick_player bench_player").attr("id","player_"+i).attr("position",i).attr("player_set",false).attr("show_flag",false);
		$li.append("<div class=\"sub_player\"><div class=\"subtle bench_header small\">"+kickers[i][0]+"</div><div class=\"bench_player_name\"></div></div>");

		$li.draggable({
			helper: function(){
				var $shirt = make_tactics_drag_shirt(tactics_make_shirt($(this).attr("player_no"),"drag"));
				return $shirt;
			}, //"clone",
			cursorAt: { left: 15 },
	//		create: function(e,ui){},
	//		drag: function(e,ui){},
			start: function(e,ui)	{
				$(ui.helper).css({"width":"40px","z-index":"10","cursor":"pointer"}).attr("player_id",$(this).attr("player_id")).appendTo("body");
				$(".droppable").droppable("option","disabled",true);
			},
			stop: function(e,ui)	{
				$(".droppable").droppable("option","disabled",false);
			}
		});
		if(p)
		{
			tactics_set_player(p,$li);
		}
		else
		{
			$li.draggable("disable");
		}
	}

	// ** Bench
	var $bench = $("<div>").attr("id","tactics_bench").addClass("tactics_bench").appendTo("#tactics_subs");
	var $ul = $("<ul>").appendTo($bench);
	var subs = {"sub5":[pagecontent[4],"forward"],"sub4":[pagecontent[5],"mid"],"sub3":[pagecontent[6],"mid"],"sub2":[pagecontent[7],"def"],"sub1":[pagecontent[25],"gk"]};
	var bench_count = 28;
	for(var i in subs)
	{ // Add subs
		var p = players_by_id[on_field_assoc[i]];

		var $li = $("<li>").appendTo($ul).append("<div class=\"rec_stars\" />").append(tactics_make_shirt("", subs[i][1]+" dashed transp")).addClass("droppable draggable bench_player").attr("id","player_"+i).attr("position",i).attr("position_key",bench_count).attr("player_set",false).attr("show_flag",false);
		$li.append("<div class=\"sub_player\"><div class=\"subtle bench_header small\">"+subs[i][0]+"</div><div class=\"bench_player_name\"></div></div>");
		make_draggable($li);
		if(p)
		{
			tactics_set_player(p,$li);
		}
		else
		{
			$li.draggable("disable");
		}
		bench_count--;
	}
}
function tactics_make_shirt(number,type)
{
	var $shirt = $("<div />").addClass("tactics_shirt "+type).html(number);
	return $shirt;
}
function tactics_make_player(player)
{
	var $player = $("<div>").addClass("field_player droppable");
}
function add_post_player(player,position)
{
	on_field_assoc[position] = player["player_id"];
//	post_players[player["player_id"]] = {"player":player,"position":position};
	post_players[player["player_id"]] = position;
}
// Save new player position
function post_player_positions()
{
	//post_players  =  {playerid :{"player": player,"position":position},...}
	$.post("/ajax/tactics_post.ajax.php",{"on_field":on_field_assoc,"players":post_players,"reserves":reserves,"national":national,miniGameId: miniGameId},function(data){
		if(data != null)
		{
			for(var i in post_players)
			{
				var $p = $("#player_"+post_players[i]);
				$p.find(".field_player_rec").html("<div class=\"tactics_rec tactics_rec_"+data["rec_stars"][i]+"\" >");

			}
			$("#tactics_last_save").html(data["time"]+" <img src=\"/pics/mini_green_check.png\"/>");
		}
		post_players = {};
	},"json").fail(function(){post_players = {};});
}
function make_tactics_drag_shirt(shirt)
{
	if($("#tactics_drag_shirt").length == 0)
	{
		var $shirt = $("<div>").attr("id","tactics_drag_shirt").appendTo("body");
	}
	else{
		var $shirt = $("#tactics_drag_shirt");
	}
	$shirt.html(shirt).show();
	return $shirt;
}
function hide_tactics_drag_shirt()
{
	$("#tactics_drag_shirt").hide();
}
function slide_advanced(delay)
{
	delay = delay == null ? 400 : delay;
	if($("#tactics_inner_slide").css("left") == "0px")
	{
		$("#tactics_inner_slide").animate({
			left: "-434px"
		},delay);
		$("#advanced_button").addClass("lineup_button").find(".button_border").html(pagecontent[24]);
		window.location.hash = "advanced";
	}
	else
	{
		$("#tactics_inner_slide").animate({
			left: "0px"
		},delay);
		$("#advanced_button").removeClass("lineup_button").find(".button_border").html(pagecontent[70]);
		window.location.hash = "";
	}
}
var tactics_sort_direction = "asc";
var tactics_sort_type = "pos";
function tactics_sort(type)
{ // type = no / pos / name / rec
	if(tactics_sort_type == type && tactics_sort_direction == "asc" || (type == "rec" && tactics_sort_type != type)) tactics_sort_direction = "desc";
	else tactics_sort_direction = "asc";
	tactics_sort_type = type;
	players = mergeSort(players,type+"_sort",tactics_sort_direction);
	tactics_list_players();
}

function mergeSort(arr,key,direction)
{
    if (arr.length < 2)
        return arr;
    var middle = parseInt(arr.length / 2);
    var left   = arr.slice(0, middle);
	var right  = arr.slice(middle, arr.length);
    return merge(mergeSort(left,key,direction), mergeSort(right,key,direction),key,direction);
}

function merge(left, right,key,direction)
{
    var result = [];

    while (left.length && right.length) {
		if(direction == "asc")
		{
			if (left[0][key] <= right[0][key]) {
				result.push(left.shift());
			} else {
				result.push(right.shift());
			}
		}
		else
		{
			if (left[0][key] <= right[0][key]) {
				result.push(right.shift());
			} else {
				result.push(left.shift());
			}
		}
    }

    while (left.length)
        result.push(left.shift());

    while (right.length)
        result.push(right.shift());

    return result;
}
// Object functions (assoc array)
function remove_elem_assoc(arr,key)
{
	var tmp_arr = {};
	for(var i in arr)
	{
		if(i != key)
		{
			tmp_arr[i] = arr[i];
		}
	}
	return tmp_arr;
}
function make_droppable()
{
	// Make players Droppable
	$( ".droppable" ).droppable({
		over: function(event,ui){
			if($(ui.draggable).attr("player_no") > 0)
			{ // Only players can be dropped (not CO)
				if($(this).find(".tactics_shirt").hasClass("transp"))
				{
					$( this ).find(".tactics_shirt").addClass( "drag active" );
				}
				else
				{
					$( this ).find(".tactics_shirt").addClass( "active" );
				}
			}
		},
		out: function(event,ui){
			if($(ui.draggable).attr("player_no") > 0)
			{ // Only players can be dropped (not CO)
				$( this )
					.find(".tactics_shirt").removeClass( "drag active" );
			}
		},
		drop: function( event, ui ) {
			if($(ui.draggable).attr("player_no") > 0)
			{ // Only players can be dropped (not CO)
				$(this).draggable("enable");
				// Set this position as player
				$( this ).find(".tactics_shirt").removeClass("transp drag active");
				// Swap Players
				var player_swapped = false;
				if($(this).attr("player_id") > 0)
				{ // Player already in droppable position
					var p = players_by_id[$(this).attr("player_id")];
					if($("#player_"+$(ui.draggable).attr("position")).length != 0)
					{ // Dragged player already on field or subs
						// Set player on droppable to dragged players position
						formation_by_pos[$(ui.draggable).attr("position_key")] = $(this).attr("player_id");
						tactics_set_player(p,$("#player_"+$(ui.draggable).attr("position")));
						// Post player on droppable ajax
						add_post_player(p,$(ui.draggable).attr("position"));

						if(on_field[$(ui.helper).attr("player_id")])
						{ // if dragged player is on field, add player on droppable to dragged's position and remove from subs
							on_subs = remove_elem_assoc(on_subs,p["player_id"]);
							on_field[p["player_id"]] = $(ui.draggable).attr("position");
						}
						else if(on_subs[$(ui.helper).attr("player_id")])
						{// if dragged player is on subs, add player on droppable to dragged's position and remove from field
							on_field = remove_elem_assoc(on_field,p["player_id"]);
							on_subs[p["player_id"]] = $(ui.draggable).attr("position");
						}
					}
					else
					{ // Player from the list
						// Remove swapped player from on_field
						on_field = remove_elem_assoc(on_field,p["player_id"]);
						on_subs = remove_elem_assoc(on_subs,p["player_id"]);
						add_post_player(p,"out");
						formation_by_pos[$(ui.draggable).attr("position_key")] = null;
					}
					player_swapped = true;
				}
				else
				{ // Player moved to empty space, so disable draggable
					$(ui.draggable).draggable("disable");
					formation_by_pos[$(ui.draggable).attr("position_key")] = null;
				}
				// Set player Info
				var p = players_by_id[$(ui.helper).attr("player_id")];
				formation_by_pos[$(this).attr("position_key")] = $(ui.helper).attr("player_id");
				tactics_set_player(p,$(this));
				// Ajax position
				add_post_player(p,$(this).attr("position"));
				// Move player, if already on field
				if((on_field[$(ui.helper).attr("player_id")] || on_subs[$(ui.helper).attr("player_id")])&& !player_swapped)
				{
					tactics_unset_player($(ui.draggable));
				}
				// Remove active class
				$(ui.draggable).removeClass("active");
				//

				if($(this).hasClass("field_player"))
				{
					on_field[p["player_id"]] = $(this).attr("position");
					on_subs = remove_elem_assoc(on_subs,p["player_id"]);
				}
				else if($(this).hasClass("bench_player"))
				{
					on_subs[p["player_id"]] = $(this).attr("position");
					on_field = remove_elem_assoc(on_field,p["player_id"]);
				}
	//			on_subs = remove_elem_assoc(on_subs,p["player_id"]);
				// Hide not set positions
	//			$("#tactics_field .tactics_shirt.transp").parent().hide();
				stop_drag($(ui.draggable));
				// Remove drag helper
				$(ui.helper).remove();
				tactics_list_players();
				// Post changes to db
				if(count(post_players) > 0)
				{
					post_player_positions();
				}
			}
		}
	});
	// ** Make List droppable
	$("#tactics_list").droppable({
		over: function(){
			//Hover ?
		},
		out: function(){
			// Unhover
		},
		drop: function( event, ui ) {
			if($(ui.draggable).hasClass("field_player") || $(ui.draggable).hasClass("bench_player"))
			{
				var p = players_by_id[$(ui.helper).attr("player_id")];
				tactics_unset_player($(ui.draggable));
				$(ui.draggable).draggable("disable");
				if(!$(ui.draggable).hasClass("kick_player"))
				{
					add_post_player(p,"out");
					on_field = remove_elem_assoc(on_field,p["player_id"]);
					on_subs = remove_elem_assoc(on_subs,p["player_id"]);
					stop_drag($(ui.draggable));
					tactics_list_players();
					formation_by_pos[$(ui.draggable).attr("position_key")] = null;
				}
				else
				{
					add_post_player(0,$(ui.draggable).attr("position"));
				}
				if(count(post_players) > 0)
				{
					post_player_positions();
				}
			}
		}
	});

	// ** Make kick takers and cappy droppable
	$(".droppable_kick").droppable({
		over: function(){
			$( this ).find(".tactics_shirt").addClass( "active" );
		},
		out: function(){
			$( this )
				.find(".tactics_shirt").removeClass( "active" );
		},
		drop: function( event, ui ) {
			// Set this position as player
			$( this ).find(".tactics_shirt").removeClass("transp active");
			stop_drag($(ui.draggable));
			var p = players_by_id[$(ui.helper).attr("player_id")];
			add_post_player(p,$(this).attr("position"));
			tactics_set_player(p,$(this));
			$( this ).draggable("enable");
			if(count(post_players) > 0)
			{
				post_player_positions();
			}
		}
	});
}

// ** Mood value generator 0=great->4=pissed
function retPlayerMoodCalc(favpos_line, favpos_side, placedpos) {
    // favpos = OM LR || DM/M R || OM R F || GK
    // placedpos = 0-23
    var penalty = 0;
	if (placedpos == 1 || placedpos == 6 || placedpos == 11 || placedpos == 16) {
        var placedpos_side = "L";
    } else if (placedpos == 5 || placedpos == 10 || placedpos == 15 || placedpos == 20) {
        var placedpos_side = "R";
    } else {
        var placedpos_side = "C";
    }
    // Side check | C L/R = 20% | L R = 10%
    if (favpos_side != placedpos_side) {
		if (favpos_side == "C" || placedpos_side == "C") {
            penalty = 2;
        } else {
            penalty = 1;
        }
    }
    // Line check | D DM = 10% | D M = 20% | D OM = 30% | D F = 40% | *!=GK GK = 40%;
    if (placedpos>=1 && placedpos<=5) {// D
        if (favpos_line == "D") {
        } else if (favpos_line == "DM") {
            penalty += 1;
        } else if (favpos_line == "M") {
            penalty += 2;
        } else if (favpos_line == "OM") {
            penalty += 3;
        } else if (favpos_line == "F") {
            penalty += 4;
        }
    } else if (placedpos>=6 && placedpos<=10) {// DM
        if (favpos_line == "DM") {
        } else if (favpos_line == "D" || favpos_line == "M") {
            penalty += 1;
        } else if (favpos_line == "OM") {
            penalty += 2;
        } else if (favpos_line == "F") {
            penalty += 3;
        }
    } else if (placedpos>=11 && placedpos<=15) {// M
        if (favpos_line == "M") {
        } else if (favpos_line == "DM" || favpos_line == "OM") {
            penalty += 1;
        } else if (favpos_line == "D" || favpos_line == "F") {
            penalty += 2;
        }
    } else if (placedpos>=16 && placedpos<=20) {// OM
        if (favpos_line == "OM") {
        } else if (favpos_line == "M" || favpos_line == "F") {
            penalty += 1;
        } else if (favpos_line == "DM") {
            penalty += 2;
        } else if (favpos_line == "D") {
            penalty += 3;
        }
    } else if (placedpos>=21 && placedpos<=23) {// F
        if (favpos_line == "F") {
        } else if (favpos_line == "OM") {
            penalty += 1;
        } else if (favpos_line == "M") {
            penalty += 2;
        } else if (favpos_line == "DM") {
            penalty += 3;
        } else if (favpos_line == "D") {
            penalty += 4;
        }
    }
    penalty = Math.min(penalty, 4);
    return penalty;
}
function retPlayerMood(favpos, placedpos) {
	// ** F*ING HACK ;o(
	if(favpos.indexOf(", F")>-1) {
		var favpos_tmp = favpos.split(" ");
		favpos = favpos_tmp[0]+"/F "+favpos_tmp[1].split(",")[0];
	}
/*	if (favpos=="OM C, F") favpos = "OM/F C";
	else if (favpos=="OM L, F") favpos = "OM/F L";
	else if (favpos=="OM R, F") favpos = "OM/F R";
	*/
	if (favpos == "GK" || placedpos == 0) {
		if (favpos != "GK" || placedpos != 0) {
			return 4;
		}
		return 0;
	} else {
		var pos_ar = favpos.split(" ");
		if (favpos == "F") {
			var first_pen = retPlayerMoodCalc("F", "C", placedpos);
		} else if (favpos.indexOf("/F")>=0) {
			pos_ar[0] = pos_ar[0].split("/");
			var first_pen = retPlayerMoodCalc("F", "C", placedpos);
			var second_pen = retPlayerMoodCalc(pos_ar[0][0], pos_ar[1], placedpos);
		} else if (favpos.indexOf("/")>=0) {
			//Multi line
			pos_ar[0] = pos_ar[0].split("/");
			var first_pen = retPlayerMoodCalc(pos_ar[0][0], pos_ar[1], placedpos);
			var second_pen = retPlayerMoodCalc(pos_ar[0][1], pos_ar[1], placedpos);
		} else {
			//Multi side
			pos_ar[1] = pos_ar[1].split("");
			var first_pen = retPlayerMoodCalc(pos_ar[0], pos_ar[1][0], placedpos);
			if (pos_ar[1][1] != undefined) {
				var second_pen = retPlayerMoodCalc(pos_ar[0], pos_ar[1][1], placedpos);
			}
		}
	}
	if (second_pen != undefined) {
		return Math.min(first_pen, second_pen);
	} else {
		return first_pen;
	}
}
function tactics_toggle_filter(filter)
{
	if(filter == "reset")
	{
		for(var i in tactics_filters)
		{
			tactics_filters[i] = true;
		}
		$(".list_filter").addClass("checked");
		show_field_players_in_list = false;
		$(".list_filter.toggle_field_players").css("background-position","0px -16px");
		tactics_list_players();
	}
	else
	{
		tactics_filters[filter] = !tactics_filters[filter];
		$(".list_filter.toggle_"+filter).toggleClass("checked");
		tactics_list_players();
	}
}
function tactics_filter_show(player)
{
	if(!show_field_players_in_list && player["on_field"]) return false;
	if(!tactics_filters["inj"] && (player["injury"] > 0 || player["banned"])) return false;
	var bool = false;
	if(!tactics_filters["l"] && player["favposition"].indexOf("l") != -1) bool = false;
	if(tactics_filters["l"] && player["favposition"].indexOf("l") != -1) bool = true;
	if(!tactics_filters["c"] && player["favposition"].indexOf("c") != -1) bool = false || bool;
	if(tactics_filters["c"] && player["favposition"].indexOf("c") != -1) bool = true;
	if(!tactics_filters["r"] && player["favposition"].indexOf("r") != -1) bool = false || bool;
	if(tactics_filters["r"] && player["favposition"].indexOf("r") != -1) bool = true;
	for(var i in tactics_filters)
	{
		if(tactics_filters[i])
		{ // Check for player position
			if(i == "gk"){
				if(player["favposition"] == "gk") return true;
			}
			else if(i == "m"){
				if(player["favposition"].indexOf("m") != -1) return true && bool;
			}
			else if(i == "f"){
				if(player["favposition"].indexOf("f") != -1) return true && bool;
			}
			else if(i == "d"){
				if(player["favposition"].indexOf("d") != -1 && (player["favposition"].indexOf("dl") != -1 || player["favposition"].indexOf("dc") != -1 || player["favposition"].indexOf("dr") != -1 || player["favposition"].indexOf("dm") == -1 || tactics_filters["m"])) return true && bool;
			}
		}
	}
	return false;
}
function save_attacking()
{
	var value = $("#attacking_select").val();
	$.post("/ajax/tactics_post.ajax.php",{"save":"attacking","value":value,"reserves":reserves,"national":national,"club_id":SESSION["id"],miniGameId: miniGameId},function(data){
		if(data)
		{
			if(data["refresh"]) page_refresh();
		}
	},"json");
}
function save_mentality()
{
	var value = $("#mentality_select").val();
	$.post("/ajax/tactics_post.ajax.php",{"save":"mentality","value":value,"reserves":reserves,"national":national,"club_id":SESSION["id"],miniGameId: miniGameId},function(data){
		if(data)
		{
			if(data["refresh"]) page_refresh();
		}
	},"json");
}
function save_focus_side()
{
	var value = $("#focus_side_select").val();
	$.post("/ajax/tactics_post.ajax.php",{"save":"focus","value":value,"reserves":reserves,"national":national,"club_id":SESSION["id"]},function(data){
		if(data)
		{
			if(data["refresh"]) page_refresh();
		}
	},"json");
}
function tactics_list_field_players_toggle()
{
	show_field_players_in_list = !show_field_players_in_list;
	tactics_list_players();
	if(show_field_players_in_list) $(".list_filter.toggle_field_players").css("background-position","0px 0");
	else $(".list_filter.toggle_field_players").css("background-position","0px -16px");
}

// Document ready : initiate everything!
$(document).ready(function(){
	tactics_init(function(){
	// Delay conditional order load
		setTimeout("co_init()",500);
	});
});

// *** Conditional Orders *** //
// ********************** //
var cond_orders = {};
var co_positions = {};
function co_init()
{
	create_cond_orders();
	get_cond_orders();
}
function create_cond_orders()
{
	$.post("/ajax/tactics_co_get.ajax.php",{"get":"init","reserves":reserves,"national":national,miniGameId: miniGameId},function(data){
		if(data != null)
		{
			co_positions = data["positions"];
			var $box = $("<div>").addClass("box_padding");
			for(var i in data["events"])
			{
				$box.append(co_create_action("event",data["events"][i]["EVENT_ID"],data["events"][i]["tooltip"],true));
			}
			$("#event_box").html($box);
			var $box = $("<div>").addClass("box_padding");
			for(var i in data["conditions"])
			{
				$box.append(co_create_action("condition",data["conditions"][i]["COND_ID"],data["conditions"][i]["tooltip"],true));
			}
			$("#condition_box").html($box);
			var $box = $("<div>").addClass("box_padding");
			for(var i in data["orders"])
			{
				$box.append(co_create_action("order",data["orders"][i]["ORDER_ID"],data["orders"][i]["tooltip"],true));
			}
			$("#order_box").html($box);
			co_make_draggable();
		}
	},"json");
}
function co_create_action(type,id,tooltip,draggable)
{
//	tooltip = tooltip || "";
	var $action = $("<div />");
	$action.addClass("co_action "+type+"_"+id).attr("action_id",id).attr("action_type",type);
	if(tooltip) $action.tooltip(tooltip);
	if(draggable) $action.addClass("co_draggable");
	init_tooltip_by_elems($action);
	return $action;
}
function co_create_cond_orders()
{
	$("#cond_orders_list").html("");
	for(var i in cond_orders)
	{
		var $co = co_create_cond_order(cond_orders[i],true);
		$("#cond_orders_list").append($co);
	}
}
function co_create_cond_order(cond_order,skip_save)
{
	var $drop = $("#cond_order_"+cond_order["COND_ORDER_NUM"]);
	var $co = $("<div>").addClass("cond_order").attr("cond_order_num",cond_order["COND_ORDER_NUM"]).attr("id","cond_order_"+cond_order["COND_ORDER_NUM"]);

	// ** Event
	var $event_box = $("<div>").addClass("co_box co_event").html("<div class='co_count'>"+(parseInt(cond_order["COND_ORDER_NUM"])+1)+"</div><div class=\"co_droppable\" action_type=\"event\" action_id=\""+cond_order["EVENT_ID"]+"\" cond_order_num=\""+cond_order["COND_ORDER_NUM"]+"\"><div class=\"co_action co_action_bg\"></div></div><div class=\"co_parms\"></div>").appendTo($co);
	$event_box.find(".co_action_bg").html(co_create_action("event",cond_order["EVENT_ID"],"",false));
	if(cond_order["EVENT_ID"])
	{
		if(cond_order["EVENT_ID"] == 1) // Minute
		{
			$event_box.find(".co_parms").html("<div>'"+cond_order["EVENT_PAR"]+"</div>");
		}
		else if(cond_order["EVENT_ID"] == 5) // Goal
		{
			$event_box.find(".co_parms").html("<div>"+pagecontent[22]+"</div>");
		}
		else // Player id
		{
			if(cond_order["EVENT_PAR"] > 0)
			{
				var p = players_by_id[cond_order["EVENT_PAR"]];
				if(p)
				{
					var $d = $("<div />").attr("player_link",p["player_id"]).html(p["lastname"]+" <span class=\"small\">"+color_favposition(on_field[cond_order["EVENT_PAR"]])+"</span>");
					$event_box.find(".co_parms").html($d);
					activate_player_links($d);
				}
			}
			else
			{
				$event_box.find(".co_parms").html("<div>"+pagecontent[23]+"</div>");
			}
		}
	}
	$event_box.find("[action_type=event]").attr("action_parm1",cond_order["EVENT_PAR"]);

	// splitter - plus
	$co.append('<div class="cond_order_plus"></div>');

	// ** Condition
	var $cond_box = $("<div>").addClass("co_box co_condition").html("<div class=\"co_droppable\" action_type=\"condition\" action_id=\""+cond_order["COND_ID"]+"\" cond_order_num=\""+cond_order["COND_ORDER_NUM"]+"\" ><div class=\"co_action co_action_bg\"></div></div><div class=\"co_parms\"></div>").appendTo($co);
	$cond_box.find(".co_action_bg").html(co_create_action("condition",cond_order["COND_ID"],"",false));
	if(cond_order["COND_PAR"]	)
	{
		$cond_box.find(".co_parms").html("<div>"+cond_order["COND_PAR"]+"</div>");
	}
	$cond_box.find("[action_type=condition]").attr("action_parm1",cond_order["COND_PAR"]);

	// splitter - arrow
	$co.append('<div class="cond_order_arrow"></div>');

	// ** Order
	var $order_box = $("<div>").addClass("co_box co_order").html("<div class=\"co_droppable\" action_type=\"order\" action_id=\""+cond_order["ORDER_ID"]+"\" cond_order_num=\""+cond_order["COND_ORDER_NUM"]+"\" ><div class=\"co_action co_action_bg\"></div></div><div class=\"co_parms small\"></div>").appendTo($co);
	$co.append('<div class="cond_order_split"></div>');
	$order_box.find(".co_action_bg").html(co_create_action("order",cond_order["ORDER_ID"],"",false));
	if(cond_order["ORDER_PAR1"])
	{
		if(cond_order["ORDER_ID"] == 2) // Mentality
		{
			$order_box.find(".co_parms").html("<div>"+$("#mentality_select").find("[value="+cond_order["ORDER_PAR1"]+"]").html()+"</div>");
		}
		else if(cond_order["ORDER_ID"] == 3) // Attacking style
		{
			$order_box.find(".co_parms").html("<div>"+$("#attacking_select").find("[value="+cond_order["ORDER_PAR1"]+"]").html()+"</div>");
		}
		else // Player id in both sub and position
		{
			var p = players_by_id[cond_order["ORDER_PAR1"]];
			if(p)
			{
				var $d = $("<div>").attr("player_link",p["player_id"]).html(p["lastname"]+" <span class=\"small\">"+color_favposition(on_field[cond_order["ORDER_PAR1"]])+"</span>");
				$order_box.find(".co_parms").html($d);
				activate_player_links($d);
			}
		}
	}
	if(cond_order["ORDER_PAR2"])
	{ // Always player
		var p = players_by_id[cond_order["ORDER_PAR2"]];
		if(p)
		{
			var $d = $("<div>").attr("player_link",p["player_id"]).html(p["lastname"]);
			$order_box.find(".co_parms").append($d);
			activate_player_links($d);
		}
	}
	if(cond_order["ORDER_PAR3"])
	{ // Always Position
		$order_box.find(".co_parms").append("<span class='order_parm3'>"+color_favposition(cond_order["ORDER_PAR3"])+"</span>");
	}
	$order_box.find("[action_type=order]").attr("action_parm1",cond_order["ORDER_PAR1"]);
	$order_box.find("[action_type=order]").attr("action_parm2",cond_order["ORDER_PAR2"]);
	$order_box.find("[action_type=order]").attr("action_parm3",cond_order["ORDER_PAR3"]);
	// single line? - style
	if(cond_order["ORDER_PAR2"] || cond_order["ORDER_PAR3"]) $order_box.find(".co_parms").removeClass("single_line");
	else $order_box.find(".co_parms").addClass("single_line");


	// ** Options (clear/saved)
	var $clear = $("<div>").addClass("co_box co_options").html("<div class=\"co_check\" tooltip=\"\"/><div class=\"co_clear\" tooltip=\"\" onclick=\"co_clear("+cond_order["COND_ORDER_NUM"]+")\"/>").appendTo($co);
	$co.append("<div class=\"clear\"></div>");

	// Enable Clear
	// Check for add green checkmark
	var actions_done = 0;
	$co.find(".co_droppable[action_type]").each(function(){
		if($(this).attr("action_id") > 0)
		{
			actions_done++;
		}
	});
	if(actions_done > 0) {
		$co.find(".co_clear").addClass("active").tooltip(pagecontent[80]);
	}
	if(skip_save) {
		if(actions_done == 3) $co.find(".co_check").addClass("active").attr("tooltip","Saved");
	} else {
		if(actions_done == 3) { // Done - Save!
				var co_num = $co.attr("cond_order_num");
				//Post
				co_save(co_num);
		} else $co.find(".co_check").removeClass("active").attr("tooltip","");

		init_tooltip_by_elems($co.find("[tooltip]"));
	}
	// Return jquery object
	co_make_droppable($co);
	return $co;
}

function get_cond_orders()
{
	$.post("/ajax/tactics_co_get.ajax.php",{"get":"cond_orders","reserves":reserves,"national":national,miniGameId: miniGameId},function(data){
		if(data != null)
		{
			cond_orders = data;
			co_create_cond_orders();
		}
	},"json");
}
function co_make_draggable()
{
	$(".co_draggable").draggable({
		helper: "clone",
		cursorAt: { left: 13, top: 13 },
		start: function(e,ui){
			$(ui.helper).css({"z-index":"5", "float":"none"}).removeClass("hover");
			$(this).addClass("active");
			$(".co_droppable[action_type="+$(this).attr("action_type")+"]").addClass("active");
		},
		stop: function(e,ui){
			$(this).removeClass("active");
			$(".co_droppable[action_type="+$(this).attr("action_type")+"]").removeClass("active");
		}
	})
	.mouseover(function(){
		$(this).addClass("hover");
	})
	.mouseout(function(){
		$(this).removeClass("hover");
	});
}
function co_make_droppable($el)
{
	$el.find(".co_droppable").droppable({
		over: function(e,ui){
			if($(ui.draggable).attr("action_type") == $(this).attr("action_type"))
			{
				$(this).addClass("hover");
			}
		},
		out: function(e,ui){
			if($(ui.draggable).attr("action_type") == $(this).attr("action_type"))
			{
				$(this).removeClass("hover");
			}
		},
		drop: function(e,ui){
			if($(ui.draggable).attr("action_type") == $(this).attr("action_type"))
			{
				var $popup = $("<div>")
					.attr("id","popup_action")
					.attr("num_parms",1)
					.attr("action_id",$(ui.draggable).attr("action_id"))
					.attr("action_type",$(ui.draggable).attr("action_type"))
					.attr("cond_order_num",$(this).attr("cond_order_num"));
				if($(ui.draggable).attr("action_type") == "event")
				{ // Events:
					if($(ui.draggable).attr("action_id") == 1)
					{ // Time - a Time
						$("#co_popup");
						var $div = $("<div style=\"padding: 10px;\" class=\"align_center\"><div class=\"large\">"+pagecontent[77]+"</div></div>");
						for(var j=0; j<3;j++)
						{
							var $div2 = $("<div class=\"time_select_col\">").appendTo($div);
							for(var i = 5; i < 46; i+=5)
							{
								var a = ((j*45)+i);
								$div2.append("<div class=\"parm_select time_select"+(a > 115 ? " hidden" : "")+"\" parm_val=\""+a+"\">'"+a+"</div>");
							}
						}
						popup_parm_clickable($div,1);
						$popup.html($div);
						co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 2)
					{ // Injury - Playerid - Not Req
						$popup.html(co_make_player_select(true));
						co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 3)
					{ // Yellow Card - Playerid - Not Req
						$popup.html(co_make_player_select(true));
						co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 4)
					{ // Red Card - Playerid - Not Req
						$popup.html(co_make_player_select(true));
						co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 5)
					{ // Goal (no parameters neeeded)
						co_drop_no_popup($(this),$(ui.draggable));
					}
				}
				else if($(ui.draggable).attr("action_type") == "condition")
				{ // Condtitions:
					if($(ui.draggable).attr("action_id") == 1)
					{ // Winning - Goal difference INT
						 $popup.html(co_goal_difference(true));
						 co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 2)
					{ // Draw - No Parameters
						co_drop_no_popup($(this),$(ui.draggable));
					}
					else if($(ui.draggable).attr("action_id") == 3)
					{ // Losing - Goal difference INT
						 $popup.html(co_goal_difference(false));
						 co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 4)
					{ // None - No Parameters
						co_drop_no_popup($(this),$(ui.draggable));
					}
				}
				else if($(ui.draggable).attr("action_type") == "order")
				{ // Orders:
					if($(ui.draggable).attr("action_id") == 1)
					{ // Substitiution - Player A , Player B
						var $t = $("<table>");
						$t.append("<tr><th class=\"align_center\">"+pagecontent[75]+"</th><th class=\"align_center\">"+pagecontent[8]+"</th></tr>");
						var $tr = $("<tr>").appendTo($t);
						var $td = $("<td>").html(co_make_player_select(false)).appendTo($tr);
						var $td = $("<td style=\"vertical-align: top\">").html(co_make_bench_select()).appendTo($tr);
						$td.append(pagecontent[76]+"<br>").append(make_position_select(3,true));
						$popup.attr("num_parms",3).append($t);
						co_popup_show($popup);
					}
					else if($(ui.draggable).attr("action_id") == 2)
					{ // Mentality - Metality ID
						var $div = $("<div class=\"align_center\">"+pagecontent[9]+"<br ></div>");
						var $ment =  $("<select id=\"mentality_select_pop\">");
						$ment.html($("#mentality_select").html());
						
						$ment.prepend("<option value=''>"+global_content["select"]+"...</option>");
						$ment.find(":selected").attr("selected",false);
						//$ment.bind("change",function(){ //old JQ
						$ment.on("selectmenuchange",function(){
							$(this).closest("#popup_action").attr("action_text1",$(this).find(":selected").html());
							$(this).closest("#popup_action").attr("action_parm1",$(this).val());
						});
						$popup.attr("num_parms",1).html($div);
						co_popup_show($popup);
						check_save_button();
						$ment.appendTo($div);
						$ment.selectmenu({
							"style":"dropdown",
							"maxHeight":"250",
							"width": "140"
						});
					}
					else if($(ui.draggable).attr("action_id") == 3)
					{ // Change Attacking Style - AS ID
						var $div = $("<div class=\"align_center\">"+pagecontent[10]+"<br ></div>");
						var $att =  $("<select id=\"attacking_select_pop\">").appendTo($div);
						$att.html($("#attacking_select").html());
						$att.prepend("<option value=''>"+global_content["select"]+"...</option>");
						$att.find(":selected").attr("selected",false);
						//$att.bind("change",function(){ //old JQ
						$att.on("selectmenuchange",function(){
							$(this).closest("#popup_action").attr("action_text1",$(this).find(":selected").html());
							$(this).closest("#popup_action").attr("action_parm1",$(this).val());
						});
						$popup.attr("num_parms",1).html($div);
						co_popup_show($popup);
						check_save_button();
						$att.selectmenu({
							"style":"dropdown",
							"maxHeight":"250",
							"width": "140"
						});
					}
					else if($(ui.draggable).attr("action_id") == 4)
					{ // Change Position - Player_id Playerpos_id
						var $t = $("<table>");
						$t.append("<tr><th class=\"align_center\">"+pagecontent[79]+"</th><th class=\"align_center\">"+pagecontent[11]+"</th></tr>");
						var $tr = $("<tr>").appendTo($t);
						var $td = $("<td>").html(co_make_player_select(false)).appendTo($tr);
						var $td = $("<td style=\"vertical-align: top\">").html(make_position_select(3,true)).appendTo($tr);
						$popup.attr("num_parms",2).html($t);
						co_popup_show($popup);
					}
				}
				else
				{ // Remove classes
					$(this).removeClass("hover");
					$(".co_droppable[action_type="+$(this).attr("action_type")+"]").removeClass("active");
				}
			}
		}
	});
}
function co_drop_action()
{
	var $popup = $("#popup_action");
	var cond_order = cond_orders[$popup.attr("cond_order_num")];
	if($popup.attr("action_type") == "event")
	{
		cond_order["EVENT_ID"] = $popup.attr("action_id");
		cond_order["EVENT_PAR"] = $popup.attr("action_parm1");
	}
	else if($popup.attr("action_type") == "condition")
	{
		cond_order["COND_ID"] = $popup.attr("action_id");
		cond_order["COND_PAR"] = $popup.attr("action_parm1");
	}
	else if($popup.attr("action_type") == "order")
	{
		cond_order["ORDER_ID"] = $popup.attr("action_id");
		cond_order["ORDER_PAR1"] = $popup.attr("action_parm1");
		cond_order["ORDER_PAR2"] = $popup.attr("action_parm2");
		cond_order["ORDER_PAR3"] = $popup.attr("action_parm3");
	}
	cond_orders[$popup.attr("cond_order_num")] = cond_order;
	var $co = co_create_cond_order(cond_order);
	$("#cond_order_"+$popup.attr("cond_order_num")).replaceWith($co);
	co_popup_hide();
}
function co_drop_no_popup($action,$drag)
{
	var cond_order = cond_orders[$action.attr("cond_order_num")];
	if($drag.attr("action_type") == "event")
	{
		cond_order["EVENT_ID"] = $drag.attr("action_id");
		cond_order["EVENT_PAR"] = 0;
	}
	else if($drag.attr("action_type") == "condition")
	{
		cond_order["COND_ID"] = $drag.attr("action_id");
		cond_order["COND_PAR"] = 0;
	}
	else if($drag.attr("action_type") == "order")
	{
		cond_order["ORDER_ID"] = $drag.attr("action_id");
		cond_order["ORDER_PAR1"] = 0;
		cond_order["ORDER_PAR2"] = 0;
		cond_order["ORDER_PAR3"] = 0;
	}
	cond_orders[$action.attr("cond_order_num")] = cond_order;
	var $co = co_create_cond_order(cond_order);
	$("#cond_order_"+$action.attr("cond_order_num")).replaceWith($co);
}

// ** CO Save ** //
function co_save(co_num) {
	var co_saved = false;
	if(co_num) {
		var new_order = cond_orders[co_num];
		new_order["reserves"] = reserves;
		new_order["national"] = national;
		new_order.miniGameId = miniGameId;
		// Save blue monday
		$.post("/ajax/tactics_co_post.ajax.php",new_order,function(data){
			if(data != null) {
				if(data["saved"]) {
					var $co = $("#cond_order_"+co_num);
					$co.find(".co_check").addClass("active").attr("tooltip","Saved");
					co_saved = true;
				}
			}
		},"json");
	}
/*	if(!co_saved)
	{
		var $co = $("#cond_order_"+co_num);
		$co.find(".co_check").removeClass("active").attr("tooltip","");
		// noget med error?
	}*/
}
// ** Field Player select
function co_make_player_select(any)
{ // if any, then include an "any" option
	var $div = $("<div>").addClass("align_center");
	if(any)
	{
		var $any = $("<div>").addClass("parm_select player_select").attr("parm_val",0).html(pagecontent[78]);
		$div.append($any);
	}
	for(var i in formation_by_pos)
	{
		if(on_field[formation_by_pos[i]])
		{
			var p = players_by_id[formation_by_pos[i]];
			if(p)
			{
				var $p = $("<div>").addClass("parm_select player_select").attr("player_link",p["player_id"]).attr("parm_val",p["player_id"]).appendTo($div);
				$p.html(p["lastname"]+" <span class=\"small\">"+color_favposition(on_field[formation_by_pos[i]])+"</span>");
				activate_player_links($p);
			}
		}
	}
	popup_parm_clickable($div,1);
	$div.append("<div class=\"clear\">");
	return $div;
}

// ** Bench player select
function co_make_bench_select()
{
	var $div = $("<div>").addClass("align_center");
	for(var i in formation_by_pos)
	{
		if(on_subs[formation_by_pos[i]])
		{
			var p = players_by_id[formation_by_pos[i]];
			if(p)
			{
				var $p = $("<div>").addClass("parm_select player_select").attr("player_link",p["player_id"]).attr("parm_val",p["player_id"]).appendTo($div);
				$p.html(p["lastname"]+" <span class=\"small\">"+p["favorite_position_short"]+"</span>");
				activate_player_links($p);
			}
		}
	}
	popup_parm_clickable($div,2);
	$div.append("<div class=\"clear\">");
	return $div;
}

// ** Change position select
function make_position_select(parm,all_pos)
{
	// parm is 2 or 3 depending on wich parameter position is needed
	parm = parm || 2;
	var $div = $("<div>");
	var $sel = $("<select id=\"position_select\" >").appendTo($div);
	var tmp_pos_ar = [];
	$sel.append("<option value=\"\">"+pagecontent[12]+"</option>");
	for(var i in co_positions)
	{
		var pos = color_favposition(co_positions[i]["pos"]);
		if(!in_array(pos,tmp_pos_ar) && (formation_by_pos[co_positions[i]["id"]-1] == null || all_pos))
		{
			tmp_pos_ar[tmp_pos_ar.length] = pos;
			$sel.append("<option value=\""+co_positions[i]["pos"]+"\">"+co_positions[i]["pos"]+"</option>");
		}
	}
	$sel.on("selectmenuchange",function(){
		$(this).closest("#popup_action").attr("action_text"+parm,color_favposition($(this).find(":selected").html()));
		$(this).closest("#popup_action").attr("action_parm"+parm,$(this).val());
		// save button check
		if($(this).val() =="")
		{
			var parms = $("#popup_action").attr("num_parms");
			$("#popup_action").attr("num_parms",parms+1);
		}
		else
		{
			check_save_button();
		}
	});
	$sel.selectmenu({
		"style":"dropdown",
		"maxHeight":"250",
		"width": "140",
		format: position_selectmenu
	});
	return $div;
}
// Position select style
var position_selectmenu = function(text){
	var newText = color_favposition(text);
	if(newText == "") newText = text;
	return newText;
};
function co_goal_difference(ahead)
{
	var $div = $("<div style=\"padding: 10px;\" class=\"align_center\"><div class=\"large\">"+pagecontent[13]+"</div></div>");
	if(ahead)
	{
		for(var j=1; j<5;j++)
		{
			$div.append("<div class=\"parm_select time_select\" parm_val=\""+j+"\">+"+j+"</div>");
		}
	}
	else
	{
		for(var j=-1; j>-5;j--)
		{
			$div.append("<div class=\"parm_select time_select\" parm_val=\""+j+"\">"+j+"</div>");
		}
	}
	popup_parm_clickable($div,1);
	return $div;
}
function popup_parm_clickable($div,parm)
{
	parm = parm || 1;
	$div.find(".parm_select")
		.mouseover(function(){
			$(this).addClass("hover");
		})
		.mouseout(function(){
			$(this).removeClass("hover");
		})
		.click(function(){
			$div.find(".parm_select").removeClass("active");
			$(this).closest("#popup_action").attr("action_text"+parm,$(this).html());
			$(this).closest("#popup_action").attr("action_parm"+parm,$(this).attr("parm_val"));
			$(this).addClass("active");
			check_save_button();
		});
}
function check_save_button()
{
	var parms = $("#popup_action").attr("num_parms");
	if(parms - 1 == 0) button_enable($("#save_button"));
	else $("#popup_action").attr("num_parms",parms-1);
}
function co_popup_create()
{
	var $bg, $popup;
	if($("#co_popup_bg").length == 0)
	{
		$bg = $("<div />");
		$bg.attr("id","co_popup_bg").appendTo("#tactics_advanced").hide();
		$bg.click(function(){
			co_popup_hide();
		});
	}
	if($("#co_popup").length == 0)
	{
		$popup = $("<div />");
//		$popup.attr("id","co_popup").appendTo("#tactics_advanced").hide();
		$popup.attr("id","co_popup").appendTo("body").hide();
	}
}
function co_popup_show(text)
{
	co_popup_create();
	var $bg = $("#co_popup_bg");
	var $popup = $("#co_popup");
	if(text)
	{
		$popup.html(text);
	}
	if($popup.find("#save_button").length == 0)
	{
		$popup.prepend("<div class=\"pop_hide\" onclick=\"co_popup_hide()\" />");
		$popup.append("<div class=\"align_center\" style=\"padding: 10px;\"><div class=\"button\" id=\"save_button\" onclick=\"co_drop_action()\"><span class=\"button_border\">"+pagecontent[14]+"</span></div> <div class=\"button\" onclick=\"co_popup_hide()\"><span class=\"button_border\">"+pagecontent[15]+"</span></div></div>")
	}
	$bg.show();
	$popup.show();
	button_disable($("#save_button"));
	co_popup_position();
}
function co_popup_hide()
{
	$(".co_droppable").removeClass("hover");
	$(".co_droppable").removeClass("active");
	$("#co_popup_bg").hide();
	$("#position_select-menu").remove();
	$("#co_popup").hide();
}
function co_popup_position()
{
	var $bg = $("#co_popup_bg");
	$("#co_popup").css({
		"top": ($bg.offset().top+20)+"px",
		"left": parseInt(($bg.width()/ 2) - ($("#co_popup").width()/ 2) + $bg.offset().left)+"px"
		});
}
function co_change_page(direction)
{
	var outer_height = 265;
	var pages = 6;  // Cond order pages, 5 orders pr. page
	var page = parseInt($("#cond_orders_list").attr("page")) || 0;
//	var top = parseInt($("#cond_orders_list").css("top"));
	if(direction == "up")
	{
		if((page*outer_height) < 0)
		{
			$("#cond_orders_list").attr("page",page+1);
			var move_top = page*outer_height + outer_height;
			$("#cond_orders_list").animate({
				"top": move_top+"px"
			},400);
		}
	}
	else if(direction == "down")
	{
		if((page*outer_height) > outer_height*(pages -1)*-1)
		{
			$("#cond_orders_list").attr("page",page-1);
			var move_top = page*outer_height - outer_height;
			$("#cond_orders_list").animate({
				"top": move_top+"px"
			},400);
		}
	}
}
function co_clear(pos)
{
	// Noget ajax save..
	$.post("/ajax/tactics_co_post.ajax.php",{"num":pos,"type":"delete","reserves":reserves,"national":national,miniGameId: miniGameId},function(data){
		if(data != null)
		{
			if(data["clear"])
			{
				$("#cond_order_"+pos).find(".co_action").html("");
				$("#cond_order_"+pos).find(".co_parms").html("");
				$("#cond_order_"+pos).find(".co_clear").removeClass("active");
				$("#cond_order_"+pos).find(".co_check").removeClass("active");
				cond_orders[pos]["EVENT_ID"] = 0;
				cond_orders[pos]["COND_ID"] = 0;
				cond_orders[pos]["ORDER_ID"] = 0;
				cond_orders[pos]["EVENT_PAR"] = 0;
				cond_orders[pos]["COND_PAR"] = 0;
				cond_orders[pos]["ORDER_PAR1"] = 0;
				cond_orders[pos]["ORDER_PAR2"] = 0;
				cond_orders[pos]["ORDER_PAR3"] = 0;
			}
		}
	},"json");
}
function in_array(value,ar)
{
	for(var i in ar)
	{
		if(ar[i] == value) return true;
	}
	return false;
}