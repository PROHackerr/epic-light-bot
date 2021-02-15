const axios = require('axios');
const config = require('./config');
const db = config.db;
const helpers = require('./helpers')
const ch_accesskey = process.env.CH_ACCESSKEY; //coffee house access key

exports.addwarn = async function(user, chat, reason, warn3action) {
	var dbref = db.ref("chats/"+chat.id+"/warns/"+user.id);
	var snapshot = await dbref.once("value");
	var nw = 0;
	if(snapshot.exists()) {
		warnlist = snapshot.val();
		var nw = warnlist.length; //no of warns
		if(nw >= 2) {
			//send message about all warns and do warn3action
			return;
		}
	}
	warnlist.push({reason: reason});
	
	dbref.set(warnlist);
	
	//send message about the currect warn with reason
}

