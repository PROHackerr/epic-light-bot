const axios = require('axios');
const config = require('./config');
const db = config.db;
const helpers = require('./helpers')
const ch_accesskey = process.env.CH_ACCESSKEY; //coffee house access key

exports.addwarn = async function(user, chat, reason, warn3action) {
	var dbref = db.ref("chats/"+chat.id+"/warns/"+user.id);
	var snapshot = await dbref.once("value");
	var nw = 0;
	var warnlist = []
	if(!reason)
		reason = "Not stated";
	if(snapshot.exists()) {
		warnlist = snapshot.val();
		var nw = warnlist.length; //no of warns
		if(nw >= 2) {
			//send message about all warns and do warn3action
			var message = "User "+helpers.getUserLink(user)+" has been ";
			var method = "";
			if(!warn3action || warn3action == "mute") { //default is mute
				message += "muted";
				var permissions = {
					can_send_messages: false,
					can_send_media_messages: false,
					can_send_polls: false,
					can_send_other_messages: false,
					can_add_web_page_previews: false,
					can_change_info: false,
					can_invite_users: false,
					can_pin_messages: false,
				};
				var h=3; //mute for 'h' hours
				message += " for "+h+" hour(s).\n";
				var until_date = ((new Date()).getTime()+h*60*60*1000)/1000;
				helpers.callMethod("restrictChatMember", {chat_id:chat.id,user_id:user.id, permissions, until_date});
			} else if(warn3action == "ban") {
				message += "banned";
				helpers.callMethod("kickChatMember",{chat_id: chat.id, user_id: user.id});
			} else {
				//Maybe throw exception??
				return;
			}
			message += "Reasons:\n";
			message += warnlist.map(({reason},i)=>(i+1)+": "+reason).join("\n");
			message += "\n"+(warnlist.length+1)+": "+reason;
			dbref.set({}); //clear warns
			helpers.sendMessage(chat.id, message);
			return;
		}
	}
	var uid = Math.random()*1000;
	var warn = {reason: reason};
	
	var inlinekeyboard = [
		[
			{
				text: "Remove warn",
				callback_data: "warnsystem,"+chat.id+","+user.id+","+uid+",rem,"+(warnlist.length-1)
			}
		]
	];
	//send message about the currect warn with reason
	var options = {
		chat_id: chat.id,
		text: "warn("+(warnlist.length+1)+"/3) to "+helpers.getUserLink(user)+"\n\n<b>Reason:</b>"+reason,
		reply_markup: {inline_keyboard: inlinekeyboard},
		parse_mode: 'html'
	};
	helpers.callMethod("sendMessage", options, function(err, res) {
		if(err) {
			return;
		}
		warn.message_id = res.data.result.message_id;
		warnlist.push(warn);
		dbref.set(warnlist);
		/*var dbref = db.ref("warnsystem/warnmessages/"+msg.chat.id);
		var sobj = {};
		sobj[uid] = {message_id: };*/
	});	
}

exports.removewarn = async function (user, chat, n) {
	var dbref = db.ref("chats/"+chat.id+"/warns/"+user.id);
	var snapshot = await dbref.once("value");
	if(!snapshot.exists() || snapshot.val().length == 0) {
		return {err:"User already has zero warns"};
	}
	var warnlist = snapshot.val();
	if(!n)
		warnlist.pop();
	else
		warnlist.splice(n, 1);
	
	dbref.set(warnlist);
	return {ok: true, res: "ok"};
}

exports.handleQuery = async function(chatid, userid, uid, cmd, args) {
	if(cmd == "rem") {
		var dbref = db.ref("chats/"+chatid+"/warns/"+userid);
		var wn = Number(args[0]);
		var snapshot = await dbref.once('value');
		if(!snapshot.exists())
			return {msg:"Warning doesn't exist."};
		var warnlist = snapshot.val();
		console.log(wn,"list",warnlist);
		if(wn >= warnlist.length)
			return {msg: "Warning already removed"};
		var warn = warnlist[wn];
		var message_id = warn.message_id;
		var res = await exports.removewarn({id: userid},{id: chatid}, wn); //maybe just directly remove instead of this call
		if(res.ok) {
			this.callMethod("editMessageText", {chat_id: chatid, message_id: message_id, text: "<i>warn removed</i>\nReason:"+warn.reason, parse_mode: 'html'});
			return {msg: "Done!"};
		}
		return {msg: "Unknown error occured. Couldn't remove the warning."};
	}
}
