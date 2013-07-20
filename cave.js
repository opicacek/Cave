function play() {	
	
	// Frame rate definition
	var fps = 100;
	var now;
	var then = Date.now();
	var interval = 1000 / fps;
	var delta;
		
	// Init
	var c = document.getElementById('c');
	var ctx = c.getContext('2d');

	c.width = 760;
	c.height = 400;

	var screen_w = c.width;
	var screen_h = c.height;

	var block_size = 10;
	var map = [];

	var gravity = 3;

	var hero_x = 100;

	var dead = true;

	//var score = 0;
	//var best_score = Math.max(0, fb_top_score);
	var banana_bonus = 0;


	var scroll_speed = 0;
	var total_move = 0;
	var counter = 0;
	var cc = 1;

	var hero_pos = Math.floor(screen_h/2)-30;
	var hero_speed = 0;
	var hero_acc = 0.2;

	var busy = false;

	var items = ["banana", "pill", "boost", "psycho"];
	var item = "";
	var psycho = false;
	var psycho_colors = ["#f29", "#ff2", "#2ff", "#afa", "#f8f"];
	var boost = false;
	var pill = false;

	var puffs = [];

	var colors_orig = ["#0a0a0a", "#999", "#777", "#888", "#222"];
	var colors = colors_orig;

	// generates new colors for psycho state
	function generatePsycho() {
		
		function c() {
			return Math.floor(150+Math.random()*106).toString(16)
		}
		
		for (var i = 0; i < psycho_colors.length; i++) {
			psycho_colors[i] = "#"+c()+c()+c();
		}
	}

	// returns game to virgin contidions
	function restart() {
		var old = counter;
		colors = colors_orig;
		dead = false;
		scroll_speed = 4;
		total_move = 0;
		counter = 0;
		cc = 1;
		hero_pos = Math.floor(screen_h/2)-30;
		hero_speed = -2; // ??
		hero_acc = 0.2;
		
		busy = false;
		spikes_on = false;
		rock_on = false;
		fg_on = false;
		
		if (score > best_score) {
			best_score = score;
		}
		
		score = 0;
		banana_bonus = 0;
		
		item = "";
		psycho = false;
		boost = false;
		pill = false;
		
		puffs = [];
		
		if (old != 0) {
			createMap();
		}
	}

	// mouse click
	var gas = true;

	document.onmousedown = mouseDown;
	function mouseDown(event) {
		// restart
		if (dead) {
			restart();
		}
		
		// jetpack on
		if (event.button == 0) { // left click
			gas = true;
		}
	}

	document.onmouseup = mouseup;
	function mouseup(event) {
		// jetpack off
		if (event.button == 0) { // left click
			gas = false;
		}
	}

	// Foreground
	var fg_last = 1;
	var fg_limit = 24;
	var fg_reached = false;
	var fg_on = false;

	function doFG(col) {
		var fg = fg_last + 3 + Math.floor(Math.random()*3);
		if (fg_reached) {
			fg = fg_last - 3 - Math.floor(Math.random()*3);
		}

		if (fg >= fg_limit) {
			fg_reached = true;
			
		} else if (fg <= 0) {
			fg_reached = false;
			fg_on = false;
			fg_limit = 24;
		}
		fg_last = fg;
		
		for (var i = 0; i < fg; i++) {
			col[i] = -1;
			col[col.length-1-i] = -1;
		}
	}

	// Rock
	var rock_last = 1;
	var rock2_last = 1;

	var rock_limit = 4 + Math.floor(Math.random()*4);
	var rock_reached = false;
	var rock_on = false;

	function doRock(col) {
		busy = true;
		var rock = rock_last + Math.floor(Math.random()*4);
		var rock2 = rock2_last + Math.floor(Math.random()*4);

		if (rock_reached) {
			rock = rock_last - Math.floor(Math.random()*4);
			rock2 = rock2_last - Math.floor(Math.random()*4);
		}
		
		if (Math.max(rock, rock2) >= rock_limit) {
			rock_reached = true;
		} else if (Math.min(rock, rock2) <= 0) {
			rock_reached = false;
			busy = false;
			rock_on = false;
			rock_limit = 4 + Math.floor(Math.random()*4);
		}
		rock_last = rock;
		rock2_last = rock2;

		for (var i = 0; i < rock; i++) {
			col[20+i] = 1;
		}
		for (var i = 0; i < rock2; i++) {
			col[col.length-21-i] = 1;
		}
	}

	// Spikes
	var spikes_direction = 1; // 1 = down
	var spikes_last = 1;
	var spikes_limit = 12 + Math.floor(Math.random()*8);
	var spikes_reached = false;
	var spikes_on = false;

	function doSpike(col) {
		busy = true;
		var spikes = spikes_last + 3 + Math.floor(Math.random()*3);
		if (spikes_reached) {
			spikes = spikes_last - 3 - Math.floor(Math.random()*3);
		}
		if (spikes >= spikes_limit) {
			spikes_reached = true;
			
		} else if (spikes <= 0) {
			spikes_reached = false;
			busy = false;
			spikes_on = false;
			spikes_direction = Math.floor(Math.random()*2);
			spikes_limit = 12 + Math.floor(Math.random()*8);
		}
		spikes_last = spikes;
		
		for (var i = 0; i < spikes; i++) {
			if (spikes_direction) {
				col[i] = 2;
			} else {
				col[col.length-1-i] = 2;
			}
		}
	}

	// generating of column
	var col_last = [6, 6]
	var col_limit = [15, 15]
	var col_history = [];

	// randomly generate one column of map
	function generateCol(col) {
		for (var i = 0; i < col.length; i++) {
			col[i] = 0;
		}
		
		// background
		if (fg_on) {
			doFG(col);
		} else if (cc%350 == 0) {
			fg_on = true;
			fg_last = 1;
		}
		
		// spikes
		if (spikes_on) {
			doSpike(col);
		} else if (busy == false && cc%200 == 0) {
			spikes_on = true;
			spikes_last = 1;
		}
		
		// rock
		if (rock_on) {
			doRock(col);
		} else if (busy == false && col_last[0]+col_last[1] < 8 && cc > 200) {
			rock_on = true;
			rock_last = 1;
			rock2_last = 1;
		}

		// items
		if (busy == false && cc%250 == 0) {
			item = items[Math.floor(Math.random()*items.length)];
			col[17+Math.floor(Math.random()*6)] = -2;
		}
		
		// ceiling
		var ceiling = col_last[0] - 1 + Math.floor(Math.random()*3);
		if (ceiling > 1 && ceiling < col_limit[0]) {
			col_last[0] = ceiling;
		}
		
		for (var i = 0; i < ceiling; i++) {
			col[i] = 1;
		}

		// ground
		var ground = col_last[1] - 1 + Math.floor(Math.random()*3);
		if (ground > 1 && ground < col_limit[1]) {
			col_last[1] = ground;
		}
		
		for (var i = 0; i < ground; i++) {
			col[col.length-1-i] = 1;
		}
		
		col_history.push([ceiling, ground]);

		cc++;
	}

	// creating of map
	function createMap() {
		map = []
		for (var i = 0; i < Math.floor(screen_w/block_size)+1; i++) { // rows
			map.push([]);
			for (var j = 0; j < Math.floor(screen_h/block_size); j++) { // columns
				map[i].push(0);
			}
			generateCol(map[i]);
		}
	}
	createMap();

	// move World
	function moveWorld() {

		total_move += scroll_speed;
		
		if (Math.floor(counter%(10/scroll_speed)) == 0) {
			col_history.shift();
			var col = map.shift();
			map.push(col);
			generateCol(map[map.length-1]);
		}

		// adding speed
		if (counter%1500 == 0) {
			scroll_speed++;
			counter = 0;
		}
	}

	// move hero
	function moveHero() {
		if (gas) {
			if (hero_speed > -6) {
				hero_speed -= hero_acc;
			}
		}
		
		hero_pos += hero_speed + gravity;
		
		if (hero_speed < 0) {
			hero_speed += 0.1;
		}
	}

	function die() {
		gameOver();
		dead = true;
		drawHero();
	}

	// eating item
	function eat() {
		if (item == "banana") {
			banana_bonus += 10000;
		} else if (item == "pill") {
			pill = true;
			setTimeout( function() {pill = false;}, 16000);
		} else if (item == "boost") {
			scroll_speed = scroll_speed*2;
			setTimeout( function() {if (scroll_speed > 4) {scroll_speed = Math.round(scroll_speed/2);}}, 8000);
		} else if (item == "psycho") {
			psycho = true;
			setTimeout( function() {psycho = false;}, 10000);
		}
	}

	// check hit
	function checkHit() {
		var hero_size = Math.floor((hero_img.height+10)/block_size);
		if (pill) {
			hero_size = Math.floor(hero_size/2);
		}
		
		for (var i = 0; i < hero_size; i++) {
			var xx = Math.floor((hero_x+5+(5*!pill))/block_size);
			var yy = Math.floor((hero_pos+(10*i))/block_size)
			
			var map_pixel = map[xx][yy];
			
			if (map_pixel > 0 ) {
				die();
			} else if (map_pixel == -2) {
				map[xx][yy] = 0;
				eat();
			}
		}
	}


	// drawing forest
	function drawWorld() {
		
		// psycho pill
		if (psycho) {
			if (counter % 20 == 0) {
				generatePsycho();
			}
			colors = psycho_colors;
			document.body.style.background = psycho_colors[1];
		} else {
			colors = colors_orig;
			document.body.style.background = colors_orig[1];
		}
		
		// background 
		ctx.fillStyle = colors[0];
		ctx.fillRect(0, 0, screen_w, screen_h);
		
		var moved = Math.floor(counter%(10/scroll_speed))*scroll_speed;
		
		for (var i = 0; i < map.length; i++) {
			for (var j = 0; j < map[i].length; j++) {
				if (map[i][j] == 0) { // air

				} else if (map[i][j] == 1) { // wall
					ctx.fillStyle = colors[1];
					ctx.fillRect(i*block_size-moved, j*block_size, block_size, block_size);
				} else if (map[i][j] == 2) { // spikes
					ctx.fillStyle = colors[2];
					ctx.fillRect(i*block_size-moved, j*block_size, block_size, block_size);
				//} else if (map[i][j] == 3) { // rock
				} else if (map[i][j] == 1) { // rock
					ctx.fillStyle = colors[3];
					ctx.fillRect(i*block_size-moved, j*block_size, block_size, block_size);
				} else if (map[i][j] == -1) { // foreground
					ctx.fillStyle = colors[4];
					ctx.fillRect(i*block_size-moved, j*block_size, block_size, block_size);
				} else if (map[i][j] == -2) { // item
					var item_img_show;
					if (item == "banana") {
						item_img_show = items_img[0];
					} else if (item == "pill") {
						item_img_show = items_img[1];
					} else if (item == "boost") {
						item_img_show = items_img[2];
					} else if (item == "psycho") {
						item_img_show = items_img[3];
					}
					ctx.drawImage(item_img_show, i*block_size-moved-5, j*block_size-5);
				} 
			}
		}
	}
	drawWorld();

	// drawing hero
	function drawHero() {
		var hero_show = hero_img;
		if (gas) {
			hero_show = hero_action_img;
		}
		
		// dead
		if (dead) {
			hero_show = hero_crash_img;
		}
		
		// start
		if (counter == 0) {
			hero_show = hero_action_img;
		}

		if (pill) {
			var scale = 0.5;
			ctx.save();
			ctx.scale(scale, scale);
			ctx.drawImage(hero_show, (hero_x-block_size)/scale, (hero_pos)/scale);
			ctx.restore();
		} else {
			ctx.drawImage(hero_show, hero_x-block_size, hero_pos);
		}
		
	}
	//setTimeout(drawHero, 100);
	drawHero();

	function drawScore() {
		score = total_move+banana_bonus;
		
		ctx.font = "bold 13pt Verdana";
		ctx.textAlign = "left";
		
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillText("Score: "+score, 20+2, screen_h-10+2);
		ctx.fillStyle = "#fff"
		ctx.fillText("Score: "+score, 20, screen_h-10);
		
		// Best
		ctx.font = "bold 13pt Verdana";
		ctx.textAlign = "right";
		
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillText("Your Best: "+best_score, screen_w-20+2, screen_h-10+2);
		ctx.fillStyle = "#fff"
		ctx.fillText("Your Best: "+best_score, screen_w-20, screen_h-10);
		
		// Top
		if (top_user != "") {
			ctx.font = "bold 13pt Verdana";
			ctx.textAlign = "right";
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillText("King of the Cave: "+top_user, screen_w-20+2, 20+2);
			ctx.fillStyle = "#fff"
			ctx.fillText("King of the Cave: "+top_user, screen_w-20, 20);
			
			ctx.font = "bold 13pt Verdana";
			ctx.textAlign = "right";
			
			ctx.fillStyle = "rgba(0,0,0,0.5)";
			ctx.fillText("Top score: "+top_score, screen_w-20+2, 40+2);
			ctx.fillStyle = "#fff"
			ctx.fillText("Top score: "+top_score, screen_w-20, 40);
		}
	}

	function gameOver() {
		
		// posting score
		FB.api('/me/scores/', 'post', { score: best_score, access_token: access_token }, function(response) {
			//console.log("Score posted to Facebook", response);
	
			// getting scores from all users	
			FB.api('/' + fb_app_id + '/scores/', 'get', {access_token: access_token}, function(response) {
				//console.log("got score", response);
				for (var i = 0; i < response.data.length; i++) {
					if (response.data[i].score > top_score) {
						top_score = response.data[i].score; 
						top_user = response.data[i].user.name;
					}
				}
				//console.log(top_score, top_user);
			});
			
		});
		
		
		ctx.font = "bold 40pt Verdana";
		ctx.textAlign = "center";
		
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillText("Score: "+score, screen_w/2+3, screen_h/2+3);
		ctx.fillStyle = "#fff"
		ctx.fillText("Score: "+score, screen_w/2, screen_h/2);
		
		// restart
		ctx.font = "bold 25pt Verdana";
		ctx.textAlign = "center";
		
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillText("Click to Restart", screen_w/2+3, screen_h/2+70+3);
		ctx.fillStyle = "#ff0"
		ctx.fillText("Click to Restart", screen_w/2, screen_h/2+70);
	}

	function start() {
		ctx.font = "bold 30pt Verdana";
		ctx.textAlign = "center";
		
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillText("Click to Start", screen_w/2+3, screen_h/2+3);
		ctx.fillStyle = "#ff0"
		ctx.fillText("Click to Start", screen_w/2, screen_h/2);
		
		//ctx.drawImage(opigames, 10, screen_h-opigames.height-10);
	}
	//setTimeout(start, 100);
	start();

	// main loop
	var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	window.requestAnimationFrame = requestAnimationFrame;

	var elem_timer = 50;

	var mainLoop = function(e) {

		requestAnimationFrame(mainLoop);
		
		now = Date.now();
		delta = now - then;
		
		if (delta > interval) {

			if (dead == false) {
				//console.log("alive");
				counter++;
				
				// Move world
				moveWorld();
				
				// Move hero
				moveHero();
				
				// Drawing
				drawWorld();
				
				// Draw hero
				drawHero();
				
				// Draw score
				drawScore();
				
				// Check hit
				checkHit();
				
				// puffs
				if (gas && counter > 1 && counter%(10*Math.floor(Math.random()*3)) == 0) {
					puffs.push( new Puff(hero_x-hero_img.height/2, hero_pos+hero_img.height, pill) );
				}
			} else if (puffs.length) {
				// Drawing
				drawWorld();
				
				// Draw hero
				drawHero();
				
				// Draw score
				drawScore();
				gameOver();
			}
			
			
			for (var p = 0; p < puffs.length;) {
				puffs[p].move();
				puffs[p].draw(ctx);
				
				if (puffs[p].x < -puffs[p].img.width) {
					puffs.splice(p, 1);
				} else {
					p++;
				}
			}
		
			// update time stuffs
			then = now - (delta % interval);
		
		}
		
	}
	mainLoop();

}