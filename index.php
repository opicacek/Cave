<html>
    <head>
        <title>Cave</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style type="text/css">
		body {
			background-color: #999;
			margin: 0px;
			padding: 0px;
			text-align: center;
			font: 70%/1.5 Verdana, Tahoma, Arial, Helvetica, sans-serif;
			color: #000;
		}
		canvas{
			outline: 0;
			border: 0px solid #000;
			margin-left: auto;
			margin-right: auto;
		}
		a {
			color: #55DD55;
			text-decoration: none;
		}
		a:hover {
			color: #11AA11; 
		}
		.help {
			margin: auto;
			padding-top: 20px;
			padding-bottom: 10px;
			position: relative;
			text-align: left;
			width: 550px;
			display: table;
		}
		.help img {
			margin: 0 15 15 0;
			float: left;
		}
		.help div {
			clear: both;
		}
		#help_right {
			position: absolute;
			top: 75px;
			left: 275px;
		}
		a img {
			border: none;
		}
		#opigames {
			float: left;
		}
		#credits {
			float: right;
		}
		#footer {
			margin: 0px 20px;
		}
    </style>
    </head>

    <body onload="play()">

		<div id="fb-root"></div>
		<script>

			var access_token;
			var score = 0;
			var best_score = 0;
			var top_score = 0;
			var top_user = "";
			fb_app_id = 174275439420577;

			window.fbAsyncInit = function() {

				// init the FB JS SDK
				FB.init({
					appId      : fb_app_id,								// App ID from the app dashboard
					channelUrl : 'jan.danihelka.net/facebook/cave/', 	// Channel file for x-domain comms
					cookie     : true,									// enable cookies to allow the server to access the session
					status     : true,									// Check Facebook Login status
					xfbml      : true									// Look for social plugins on the page
				});

				// Additional initialization code such as adding Event Listeners goes here
				FB.login(function(response) {
					// handle the response
					if (response.authResponse) {

						// user token
						access_token = response.authResponse.accessToken;

						// get user's score
						FB.api('/me/scores/', 'get', {access_token: access_token}, function(response) {
							for (var i = 0; i < response.data.length; i++) {
								if (response.data[i].application.id == "174275439420577") {
									//console.log(response.data[i].score);
									best_score = response.data[i].score;
									break;
								}
							}
						});

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

					} else {
						// do something...maybe show a login prompt
						//console.log('User cancelled login or did not fully authorize.');
						//top.location.href = "https://www.facebook.com/uttest/app_" + fb_app_id; //TODO redirect
					}
				}, {scope: 'publish_actions, user_games_activity'});

			};

			// Load the SDK asynchronously
			(function(d, s, id){
				var js, fjs = d.getElementsByTagName(s)[0];
				if (d.getElementById(id)) {return;}
				js = d.createElement(s); js.id = id;
				js.src = "//connect.facebook.net/en_US/all.js";
				fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		</script>


        <canvas id="c" width="760" height="400" ></canvas>
        <script type="text/javascript" src="images.js"></script>
        <script type="text/javascript" src="puff.js"></script>
        <script type="text/javascript" src="cave.js"></script>

        <!-- <p><b>Controls:</b> Left mouse button</p> /-->

        <div class="help">
            <div><img src="img/monkey_action.png" alt="Monkey" />Press and hold <b>left mouse button</b> to fire engine on your jetpack.</div>
			<div id="help_left">
				<div><img src="img/banana.png" alt="Banana" />Additional score points.</div>
				<div><img src="img/pill.png" alt="Pill" />Become smaller for 16 seconds.</div>
			</div>
			<div id="help_right">
				<div><img src="img/boost.png" alt="Boost" />Turbo speed for 8 seconds.</div>
				<div><img src="img/psycho.png" alt="Psycho" />????</div>
			</div>
        </div>

		<div id="footer">
			<a id="opigames" target="_blank" href="http://jan.danihelka.net"><img alt="Opi-games" src="img/opigames.png" /></a>
			<div id="credits">Coding: <b>Opi Danihelka</b><br/> Graphics: <b>Jakub 'Mortales' Březík</b></div>
		<div>
    </body>
</html>
