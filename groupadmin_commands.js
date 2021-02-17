
const warnsystem = require('./warnsystem');

var commands = [
	{
		name: "warn",
		usage: "warn [id] [reason]",
		args_req: 0,
		admin_req: true,
		execute: (args, msg)=> {
			var id;
			var reason;
			if(args.length >= 2) {
				if(!isNaN(args[1])) {
					id = Number(args[1]);
					reason = args.slice(2).join(' ');
				} else
					reason = args.slice(1).join(' ');
			}
			
			if(!id && !msg.reply_to_message)
				return "Who to warn, dude?\nReply to a person's message to warn them or put the user's id next to the command";
			var user;
			if(id)
				user = {id: id};
			else
				user = {id: msg.reply_to_message.from.id};
			var chat = msg.chat;
			warnsystem.addwarn(user, chat, reason, "mute");
		}
	}
];

module.exports = commands;
