
const axios = require('axios');
const config = require('./config');
const db = require('./db').db

helpers = {
    getUserFullName: function(user) {
        var name = "";
        if(user.first_name)
            name+=user.first_name;
        if(user.last_name && user.first_name)
            name+=" ";
        if(user.last_name)
            name+=user.last_name;
        return name;
        },
    getUserLink: function(user) {
        var text = this.getUserFullName(user);
        var id = user.id;
        
    //MarkdownV2 syntax:  return "["+text+"](tg://user?id="+id+")";
        return "<a href='tg://user?id="+id+"'>"+text+"</a>";
    },

    parseTemplate: function(text, objs) {
        //for now objs is an array whose first element is the new user joined.
        //improve this model or write documentation.
        var self = this;
        var bracks ="%";
        var tstrs = [
            {
                key: "NAME",
                replacer: function(user) {
                    return self.getUserFullName(user)
                }
            }
        ];
        tstrs.forEach( (tstr) => {
            if(text.indexOf(tstr.key) != -1)
                text = text.replace(bracks+tstr.key+bracks, tstr.replacer(objs[0]));
        } );

        return text;
    },

    //TODO: check if the user is an admin in the chat
    isAdmin: function(chatid, user) {
        ;
    },

    //API call to tg
    callMethod: function(mname, options, cb) {
      var url = "https://api.telegram.org/"+config.BOT_TOKEN+"/"+mname;
      axios.post(url, options).then(function(res) {
        if(cb)
          cb(null, res);
      }).catch(function(err) {
        console.log(err);
        if(cb)
        	cb(err, null);
      });
    },
    
    sendAction: async function(chatid, action) {
      var options = {
        chat_id: chatid,
        action: action
      };
      this.callMethod("sendChatAction", options);
    },

    //sendMethod
    sendMessage: function(chatid, msg, reply_to) {
      var options = {
        chat_id:chatid,
        text: msg,
        parse_mode: 'HTML'
      };
      if(reply_to)
        options.reply_to_message_id = reply_to;
      this.callMethod("sendMessage", options);
    },
    
    generateHelpResponse: function(chatid, menuname, message_id) {
    
    	var response = {chat_id: chatid, parse_mode: "html"};
    	if(menuname == "outermenu") {
    		var text = "This is the help command!";
    		var uid = Math.floor(Math.random()*10000)
    		var inlinekeyboard = [
    			[
          			{
            			text: "Basic",
            			callback_data: "helpmenu,"+chatid+",u"+uid+",basic"
          			},
          			{
            			text: "Advanced",
            			callback_data: "helpmenu,"+chatid+",u"+uid+",advanced"
          			},
          			{
            			text: "Services",
            			callback_data: "helpmenu,"+chatid+",u"+uid+",services"
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
    		response.reply_markup = {inline_keyboard:inlinekeyboard};
    		
    		this.callMethod("sendMessage",response, function(err, res) {
    			var message_id = res.data.result.message_id;
    			
    			var dbref = db.ref("helpmenu/"+chatid+"/"+uid);
    			dbref.set({message_id: message_id});
    		});
    		return;
    	} else if(menuname == "basic") {
    		var text = "Some basic commands here";
    		var inlinekeyboard = [
    			[
          			{
            			text: "Fun",
            			callback_data: "helpmenu,"+chatid+",m"+message_id+",fun"
          			},
          			{
            			text: "Group administration",
            			callback_data: "helpmenu,"+chatid+",m"+message_id+",groupadmin"
          			},
          		],
    		];
    		response.text = text;
    		response.reply_markup = {inline_keyboard:inlinekeyboard};
    		
    	} else if(menuname == "fun") {
    		response.text = "These are just some fun commands!\nReply to a friend's message with one of these commands.\n"
    						+"\n<b>!give</b> <i>something</i> - Give <i>something</i> to the person you reply"
    						+"\n<b>!hug</b> <i>message</i> - Hug the person you reply to and optionally show a message"
    						+"\n<b>!scream</b> <i>message</i> - Scream out the message!";
    	} else if(menuname == "groupadmin") {
    		response.text = "You're in pinggroups menu!"
    	} else {
    		response.text = "You're in an unimplemented zone omg!";
    	}
    	
    	return response;
    }
};


module.exports = helpers;
