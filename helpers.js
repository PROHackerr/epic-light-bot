
const axios = require('axios');
const config = require('./config');
const db = require('./db').db

helpers = {
	getUserFullName: function (user) {
		var name = "";
		if (user.first_name)
			name += user.first_name;
		if (user.last_name && user.first_name)
			name += " ";
		if (user.last_name)
			name += user.last_name;
		return name;
	},
	getUserLink: function (user) {
		var text = this.getUserFullName(user);
		var id = user.id;
		if (text.length == 0)
			text = "" + id;
		//MarkdownV2 syntax:  return "["+text+"](tg://user?id="+id+")";
		return "<a href='tg://user?id=" + id + "'>" + text + "</a>";
	},

	parseTemplate: function (text, objs) {
		//for now objs is an array whose first element is the new user joined.
		//improve this model or write documentation.
		var self = this;
		var bracks = "%";
		var tstrs = [
			{
				key: "NAME",
				replacer: function (user) {
					return self.getUserFullName(user)
				}
			}
		];
		tstrs.forEach((tstr) => {
			if (text.indexOf(tstr.key) != -1)
				text = text.replace(bracks + tstr.key + bracks, tstr.replacer(objs[0]));
		});

		return text;
	},

	//TODO: check if the user is an admin in the chat
	isAdmin: function (chatid, user) {
		;
	},

	//API call to tg
	callMethod: function (mname, options, cb) {
		var url = "https://api.telegram.org/" + config.BOT_TOKEN + "/" + mname;
		axios.post(url, options).then(function (res) {
			if (cb)
				cb(null, res);
		}).catch(function (err) {
			console.log(err);
			if (cb)
				cb(err, null);
		});
	},

	sendAction: async function (chatid, action) {
		var options = {
			chat_id: chatid,
			action: action
		};
		this.callMethod("sendChatAction", options);
	},

	//sendMethod
	sendMessage: function (chatid, msg, reply_to, inlinekeyboard) {
		var options = {
			chat_id: chatid,
			text: msg,
			parse_mode: 'HTML'
		};
		if (reply_to)
			options.reply_to_message_id = reply_to;
		if (inlinekeyboard)
			options.reply_markup = { inline_keyboard: inlinekeyboard };
		this.callMethod("sendMessage", options);
	},

	generateHelpResponse: function (chatid, menuname, message_id) {

		var callbackstr = "helpmenu," + chatid;
		if (message_id)
			callbackstr += ",m" + message_id + ",";
		else {
			var uid = Math.floor(Math.random() * 10000)
			callbackstr += ",u" + uid + ",";
		}
		var response = { chat_id: chatid, parse_mode: "html" };


		/**MAYBE TAKE THIS FROM A DIFFERENT FILE OR STHING*/
		var services = {
			"firstmsg": {
				name: "First Message",
				text: "Replies to the first message of a new user."
					+ "\n\n<b>!firstmsg on</b> to start the service"
					+ "\n<b>!setfirstmsg \"Welcome %NAME%!\nTell us about yourself.\"</b> - To customize the message",
				adminreq: false
			},
			"hilight": {
				name: "Hi back!",
				text: "Replies to messages of the form: I'm X. with Hi X! I'm Light."
					+ "\n\nIf you prefer to have the service disabled, you can put <b>!hilight off</b>"
			},
			"langblocker": {
				name: "LangBlocker",
				text: "Block certain languages or only allow a few languages."
					+ "\n\n<b>!langblocker on</b> to start the service"
					+ "\nYou can either allow only a few languages in your chat or you can allow all languages but block specific languages"
					+ "\nTo allow only a few languages, put the command <b>!addlang langcode</b>.\ne.g. put the commands:\n!addlang en\n!addlang de\n"
					+ "to allow only English and German languages in your chat, and block other languages. Use <b>!dellang langcode</b> to remove a certain language from this list.\n"
					+ "\nSimilarly, you can use <b>!banlang langcode</b> to ban a few languages and allow all others.\ne.g. put the commands:\n!banlang en\n!banlang den\n"
					+ "to ban English and German but allow all the other languages. Use <b>!unbanlang langcode</b> to remove a certain language from this list.",
				adminreq: true
			},
			"delnsfw": {
				name: "Block NSFW",
				text: "Delete NSFW content"
					+ "\n\n<b>!delnsfw on</b> to start the service"
					+ "\nDeletes NSFW content and warns the user posting it. After 3 warns, a user is muted",
				adminreq: true
			},
			"aichat": {
				name: "AI Chat",
				text: "Want Light to talk with you? Just put <b>!aichat on</b>"
					+ "\n\nLight uses the CoffeeHouse API to talk with you."
			},
		};

		if (menuname == "outermenu") {
			var text = "<b>Help</b>\n\nI'm a group management bot with a fun side!\nYou can hug or slap people as well as ban and warn them.\n Click on one of the buttons below to find out more.";
			var inlinekeyboard = [
				[
					{
						text: "Basic",
						callback_data: callbackstr + "basic"
					},
					/*TODO: add this part and put pinggroups thing in it and add info about deleting whisper bot
					{
					text: "Advanced",
					callback_data: callbackstr+"advanced"
					},*/
					{
						text: "Services",
						callback_data: callbackstr + "services"
					},
				],
				[
					{
						text: "See the code",
						url: "https://github.com/maheshbansod/epic-light-bot"
					},
				]
			];
			response.text = text;
			response.reply_markup = { inline_keyboard: inlinekeyboard };
			if (!message_id) {
				this.callMethod("sendMessage", response, function (err, res) {
					var message_id = res.data.result.message_id;

					var dbref = db.ref("helpmenu/" + chatid + "/");
					var setobj = {};
					setobj[uid] = { message_id: message_id };
					dbref.set(setobj);
				});
				return;
			}

		} else {
			if (menuname == "basic") {



				var text = "<b>Basic</b>I have some fun commands like scream, hifi, random! check em out by clicking on fun.\nOr see some basic group administration commands by clicking on the right side button";
				var inlinekeyboard = [
					[
						{
							text: "Fun",
							callback_data: callbackstr + "fun"
						},
						{
							text: "Group administration",
							callback_data: callbackstr + "groupadmin"
						},
					],
					[
						{
							text: "Back",
							callback_data: callbackstr + "outermenu"
						}
					],
				];
				response.text = text;
				response.reply_markup = { inline_keyboard: inlinekeyboard };

			} else if (menuname == "fun") {
				response.text = "These are just some fun commands!\nReply to a friend's message with one of these commands.\n"
					+ "\n<b>!give</b> <i>something</i> - Give <i>something</i> to the person you reply"
					+ "\n<b>!hug</b> <i>message</i> - Hug the person you reply to and optionally show a message"
					+ "\n<b>!scream</b> <i>message</i> - Scream out the message!"
					+ "\n<b>!hifi</b> <i>message</i> - Hifi the person you reply to and optionally show a message"
					+ "\n<b>!slap</b> <i>message</i> - Slap the person you reply to and optionally show a message"
					+ "\n<b>!random</b> <i>upperlimit</i> <i>lowerlimit</i>- Gives you a random number between upperlimit and lowerlimit (both inclusive)";
				var inlinekeyboard = [
					[
						{
							text: "Back",
							callback_data: callbackstr + "basic"
						}
					],
				];
				response.reply_markup = { inline_keyboard: inlinekeyboard };
			} else if (menuname == "groupadmin") {
				response.text = "[WIP]You can use the following commands for basic group administration stuff.\nSee services for more."
					+ "\n<b>warn</b> <i>@/username/id</i> <i>reason</i> - Warn a chat member of the username/id specified. You can also reply to a user's message with this command instead of specifying the username"
					+ "\n<b>mute</b> <i>@/username/id</i> <i>reason</i> - Mute a chat member of the username/id specified. You can also reply to a user's message with this command instead of specifying the username"
					+ "\n<b>tmute</b> <i>@/username/id</i> <i>reason</i> - Temporarily mute a chat member of the username/id specified. You can also reply to a user's message with this command instead of specifying the username"
					+ "\n<b>ban</b> <i>@/username/id</i> <i>reason</i> - Ban a chat member of the username/id specified. You can also reply to a user's message with this command instead of specifying the username"
					+ "\n<b>tban</b> <i>@/username/id</i> <i>reason</i> - Temporarily ban a chat member of the username/id specified. You can also reply to a user's message with this command instead of specifying the username"
					+ "\n[WIP]<b>report</b> <i>reason</i> - Non-admins can reply to a user's message with this command to report them to the administrators.";
				var inlinekeyboard = [
					[
						{
							text: "Services",
							callback_data: callbackstr + "services"
						}
					],
					[
						{
							text: "Back",
							callback_data: callbackstr + "basic"
						}
					],
				];
				response.reply_markup = { inline_keyboard: inlinekeyboard };
			} else if (menuname == "services") {
				response.text = "<b>Services</b>\n"
					+ "\nYou can turn on/off a service using !servicename on/off\nYou must be an admin to turn on/off a service.\nLight needs to be an admin for some of the services.\nSelect one of the services to find out more about it.";
				var inlinekeyboard = [];
				var servs = Object.keys(services);
				var rowlen = 3;
				var row = [];
				for (var i = 0; i < servs.length; i++) {
					row.push({
						text: services[servs[i]].name,
						callback_data: callbackstr + "service_" + servs[i]
					})
					if ((i + 1) % rowlen == 0) {
						inlinekeyboard.push(row);
						row = [];
					}
				}
				if (row.length != 0)
					inlinekeyboard.push(row);
				inlinekeyboard.push([
					{
						text: "Back to help menu",
						callback_data: callbackstr + "outermenu"
					}
				]);
				response.reply_markup = { inline_keyboard: inlinekeyboard };
			} else if (menuname.startsWith("service_")) {
				var serv = menuname.substring(8);
				if (services[serv])
					response.text = "<b>" + services[serv].name + "</b>\n(Light is " + (services[serv].adminreq ? "" : "<b>not</b> ") + "required to be admin for this service)\n" + services[serv].text;
				else
					response.text = "No such service. That's weird.";
				var inlinekeyboard = [
					[
						{
							text: "Back to services",
							callback_data: callbackstr + "services"
						},
						{
							text: "Back to main menu",
							callback_data: callbackstr + "outermenu"
						}

					],
				];
				response.reply_markup = { inline_keyboard: inlinekeyboard };
			} else {
				response.text = "You're in an unimplemented zone omg!";
			}
		}

		return response;
	}
};


module.exports = helpers;
