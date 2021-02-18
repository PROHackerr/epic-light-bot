
const warnsystem = require('./warnsystem');
const helpers = require('./helpers');

var commands = {

	"warn": {
		usage: "warn [id] [reason]",
		args_req: 0,
		admin_req: true,
		execute: (args, msg) => {
			performAdminAction(args, msg, "warn", function (user, chat, reason, action) {
				warnsystem.addwarn(user, chat, reason, "mute");
			});
		}
	},
	"mute": {
		usage: "mute [id] [reason]",
		args_req: 0,
		admin_req: true,
		execute: (args, msg) => {
			performAdminAction(args, msg, "mute", function (user, chat, reason, action) {
				warnsystem.mute(user, chat, reason, action);
			});
		}
	}
};

function performAdminAction(args, msg, action, cb) {
	var id;
	var reason;
	if (args.length >= 2) {
		if (!isNaN(args[1])) {
			id = Number(args[1]);
			reason = args.slice(2).join(' ');
		} else
			reason = args.slice(1).join(' ');
	}

	if (!id && !msg.reply_to_message)
		return "Who to " + action + ", dude?\nReply to a person's message to " + action + " them or put the user's id next to the command";
	var user;
	if (id)
		user = { id: id };
	else
		user = msg.reply_to_message.from;
	var chat = msg.chat;
	cb(user, chat, reason, action);
}

module.exports = commands;
