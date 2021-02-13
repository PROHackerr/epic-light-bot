
const axios = require('axios')
const photoHandler = require('./photohandler');
const aichat = require('./aichat');
var db = require('./db.js').db;

var capturemode = true;

var BOT_API_TOKEN = process.env.BOT_API;
var light_id = 1472134637;//1032630842;
var thisbot = {username: "EpicLightBot"};
var cmdprefix = "!";
var adminpermerror = "You need to be an admin to run the command.\nIf you're already an admin, then send !lookaround for me to look at this chat's admins."
var helpstr = "You can execute commands using the prefix '"+cmdprefix+"' for this bot.\n"+
              "Following is the list of commands this bot supports: "+
              "\n<b>help</b> - see this message"+
              "\n<b>whois</b> - get information about yourself"+
              "\n<b>amiadmin</b> - check if you're admin in the chat"+
	      "\n<b>lmgtfy</b> - Replies with lmgtfy link"+
              "\n<b>random</b> - output a random number in the given range"+
              "\n<b>say</b> - Repeat whatever is provided as an argument"+
              "\n<b>scream</b> - Repeat whatever is given as argument or scream the name of user given as argument."+
              "\n<b>hug</b> - reply with this command to hug someone"+
              "\n<b>slap</b> - reply with this command to slap someone"+
              "\n<b>give</b> - give something to someone"+
              "\n<b>hifi</b> - give someone a hifi"+
              "\n[nopermission]<b>sayinchat</b> - Send a message in a chat"+
              "\n<b>getchatid</b> - Get the current chat id"+
              "\n<b>lookaround</b> - Gathers data about the chat"+
              "\n<b>kang</b> - add a sticker/image to your own sticker pack"+
              "\n<b>groups</b> - check out some cool groups to make friends"+
              "\n<b>contact</b> - find the developer"+
              "\n[admins only]<b>addping</b> - add a custom ping/mention to notify multiple people at once"+
              "\n[admins only]<b>addtoping</b> - add users to a custom ping by replying with this command or by the addping syntax"+
              "\n[admins only]<b>removefromping</b> - remove users from a custom ping. usage is the same as addtoping command"+
              "\n[admins only]<b>deleteping</b> - delete a custom ping from the group. the operation is irreversible."+
              "\n[admins only]<b>setfirstmsg</b> - set the message to reply to a new user's first message"+
              "\n[admins only]<b>firstmsg</b> - turn on first message service"+
              "\n[admins only]<b>undelbotmsg</b> - doesn't delete messages that are sent via bot"+
              "\n[admins only]<b>delbotmsg</b> - deletes messages that are sent via bot"+
              "\n\nYou can turn on/off a service by <b>"+cmdprefix+"servicename on/off</b>. Following are the services:"+
              "\n<b>firstmsg</b> - To reply to the first message of a user in a group."+
              "\n\t<b>!setfirstmsg &lt;some message&gt;</b> - customize the message in firstmsg service"+
              "\n<b>hilight</b> - (default: on)This service when enabled makes Light say \"Hi x! I'm Light!\" whenever someone types \"I'm x\""+
              "\n<b>delnsfw</b> - (default: off)This service when enabled deletes NSFW images using the CoffeeHouse API"+
              "\n<b>aichat</b> - (default: off)This service when enabled makes Light bot chat with a user when a message by Light is replied to using the CoffeeHouse API";

var startstr = "Hi! I'm Light - a fun bot to hang out with. Type \n"+cmdprefix+"help\n for a list of commands available\nand add me in a group so I can make new friends!\n";

var groupsinfo = [
  {
    name:"Friends Corner",
    mention: "@friendscorner", //this is fake for groups with no Lightbot.
    invite_link:"https://t.me/joinchat/PYyyOlkBs6c3cbA4slX-7g",
    chat_id: -1001493283751,
    desc: "Make friends and talk about random stuff",
    customats: [
      {at:"@5bishes",atlist:["@Tarbuja","@Nancy12nini","@justanotherlight","@Sarcasticsparrow","@KennyS04"]},
      {at:"@pingall",atlist:["@Tarbuja","@Nancy12nini","@justanotherlight","@Sarcasticsparrow","@KennyS04","@Ceo_of_Depression","@Only_me_pikachu","@Rebeka_mikelson",{id:1225126165,name:"Hell"},{id:1201637715,name:"Hope"}]}
    ]
  },
  /*{
    name:"𝒮𝑒𝒸𝓇𝑒𝓉𝒮𝑜𝒸𝒾𝑒𝓉𝓎",
    mention: "@secretsociety",
    invite_link:"https://t.me/joinchat/SfnLTFcoFaaaSR_lnudSMQ",
    chat_id: -1001462244774,
    desc:"Previously called heaven.. now a secret society. 🤫🤫🤫"
  },*/
  {
    name: "Friends Corner(game room and memes)",
    mention: "@fc_gameroom",
    invite_link:"https://t.me/joinchat/PYyyOlS2_64gQDEs3Hz9vg",
    chat_id: -1001421279150,
    desc: "Spam, games and memes. An offshoot of Friends corner",
    customats: [
      {at:"@5bishes",atlist:["@Tarbuja","@Nancy12nini","@justanotherlight","@Sarcasticsparrow","@KennyS04"]}
    ]
  }
];

exports.handleQuery = async (query) => {
  var {from, message, data, id} = query;

  if(data) {
    var q = data.split(',');
    if(q[0] == 'replytochat') {
      var sendtochat = Number(q[1]);
      var reply_to_message_id = Number(q[2]);

      db.ref("msgpasser/").set({chat_id: sendtochat, message_id: reply_to_message_id, cmd: q[0]});
    }
  }

  await axios.post('https://api.telegram.org/'+BOT_API_TOKEN+'/answerCallbackQuery',
                  {callback_query_id: id, text: "Done! (maybe)"}).catch((e)=>{
              console.log(e);
            });
 
}

exports.handlePhoto = photoHandler.handlePhoto;

exports.handleMessage = async (msg) => {

  if(capturemode) {
      captureChatData(msg.chat.id);   
  }

  //if(msg.chat.title != 'testgroup') //only test group
  //  return null;
  if(msg.new_chat_members) {
    msg.new_chat_members = msg.new_chat_members.filter( (x)=>!x.is_bot );
    if(msg.new_chat_members.length == 0)
      return null;
    msg.new_chat_members = msg.new_chat_members.map( (x)=> x.id );
    var dbref = db.ref('chats/'+msg.chat.id+'/isfirstmsg');
    var snapshot = await dbref.once('value');
    if(snapshot.exists()) {
      if(snapshot.val() == 'off')
        return null;
    } else return null;
    var members = msg.new_chat_members;
    var dbref = db.ref('chats/'+msg.chat.id+'/firstmsgcandidates');
    var snapshot = await dbref.once('value');
    var val = [];
    if(snapshot.exists()) {
      val = snapshot.val();
    }
    val = val.concat(members);
    dbref.set(val);
    return null;
  }

  if(msg.via_bot) {
    var dbref = db.ref('chats/'+msg.chat.id+'/delviabots/'+msg.via_bot.username);
    var snapshot = await dbref.once('value');
    if(snapshot.exists()) {
      //deleteMessage(msg.chat.id, msg.message_id);

      await axios.post('https://api.telegram.org/'+BOT_API_TOKEN+'/deleteMessage',{chat_id: msg.chat.id, message_id: msg.message_id}).catch((e)=>{
              console.log(e);
            });
    }
    return null;
  }


  if(msg.chat.id == light_id && msg.text) {
    var snapshot = await db.ref("msgpasser").once('value');
    if(snapshot.exists()) {
      var msgobj = snapshot.val();
      var {cmd} = msgobj;
      if(cmd == 'replytochat') {
        var {chat_id, message_id} = msgobj;
        var postbody = {};
        postbody.parse_mode = 'html';
        postbody.text = msg.text;
        postbody.chat_id = chat_id;
        postbody.reply_to_message_id = message_id;
        postbody.allow_sending_without_reply = true;
        await axios
            .post(
              'https://api.telegram.org/'+BOT_API_TOKEN+'/sendMessage',
              postbody
            )
            .catch(err => {
              // ...and here if it was not
              console.log('Error :', err)
            });
      }
      db.ref('msgpasser').set(null);
    }
  }
  else if(msg.reply_to_message || (msg.chat.type == 'private'&& msg.chat.id != light_id)) {
    if(msg.chat.type == 'private' || msg.reply_to_message.from.username == thisbot.username) {//message sent to bot. send to light.
        var postbody = {chat_id: light_id};
        if(msg.chat.type == 'supergroup' || msg.chat.type == 'channel') {
        var msglink = 't.me/c/'+msg.chat.id.toString().slice(4)+'/'+msg.message_id;
        msglink = "<a href='"+msglink+"'>"+msglink+"</a>";
        } else var msglink = "Not available";
        var chat_type = msg.chat.type;
        if(msg.chat.type != 'private')
          var chattitle = msg.chat.title;
        else
          var chattitle = getUserFullName(msg.from);
        var inlinekeyboard = [
          [
          {
            text: "Reply",
            callback_data: "replytochat,"+msg.chat.id+","+msg.message_id
          }
          ]
        ];
        postbody.reply_markup = {inline_keyboard: inlinekeyboard};
        if(msg.text) {
          postbody.text = mentionUserWithName(msg.from) + ": " + msg.text + "\n\n=====\nMessage link: "+msglink+"\nChat title: "+chattitle+"\nChat type: "+chat_type
                                    + "\nChat ID: "+msg.chat.id;
          postbody.parse_mode = 'html';
          await axios
            .post(
              'https://api.telegram.org/'+BOT_API_TOKEN+'/sendMessage',
              postbody
            )
            .catch(err => {
              // ...and here if it was not
              console.log('Error :', err)
            });
       }
    }
  }

  if(!msg.text) {
    if(msg.edited_text) {
      msg.text = msg.edited_text;
    } else
      return null;
  }
  
  
  
  var text = msg.text;
  
//  if(msg.chat.id != light_id) return;

  var capgrp;
  if(text[0]!=cmdprefix) {
    //check firstmsg on first
    var dbref = db.ref('chats/'+msg.chat.id+'/isfirstmsg');
    var snapshot = await dbref.once('value');
    if(snapshot.exists()) {
      var val = snapshot.val();
      if(val == 'on') {
        var dbref = db.ref('chats/'+msg.chat.id+'/firstmsgcandidates');
        var snapshot = await dbref.once('value');
        if(snapshot.exists()) {
          var val = snapshot.val();
          var index = val.indexOf(msg.from.id);
          if(index != -1) {
            val = [...new Set(val)];
            val.splice(index,1);
            dbref.set(val);
            var dbref = db.ref('chats/'+msg.chat.id+'/firstmsg');
            var snapshot = await dbref.once('value');
            var stemplate;
            if(snapshot.exists()) {
              stemplate = snapshot.val();
            } else {
              stemplate = "Welcome %NAME%!\nTell us about yourself." //default template
            }
            return parseTemplateStr(stemplate, msg);
          }
        }
      }
    }
    if(text == "/start")
     return startstr;
    else if((/who.+ad+ed.+me/i).test(text))
      return "Maybe I did ❤️. Say hi! or join in a random conversation. Follow the rules and remember to have fun. :D";
    else if(capgrp=text.match(/^(i m|i’m|i iz|i is|im|i'm|i am|m|am) (\w+)\W*$/ui)) {
      //check hilightmsg service
      var dbref = db.ref('chats/'+msg.chat.id+'/ishilight');
      var snapshot = await dbref.once('value');
      if(snapshot.exists()) {
        if(snapshot.val() == 'off')
          return null;
      } //continue if service unset
      //now greet
      var noun = capgrp[2];
      if(noun != "sad" && noun != "depressed" && noun != "depress")
        return "Hi "+noun+"!\n I'm Light.";
    } else if(text.indexOf('@') != -1) {
      var custmentions = await getMentionsFromCustomMentions(text, msg.chat.id);
      if(custmentions.length > 0) {
        var i = 0;
        while(custmentions.length > 15) {
          var postbody = {
            chat_id: msg.chat.id,
            parse_mode: 'html',
            text: "<b>"+getUserFullName(msg.from)+"</b>: "+text+"\n\n"+custmentions.slice(0,15).join(' ')+"\n(contact the admin of the chat if you want your name removed from this list)",
            disable_web_page_preview: true,
          };
          setTimeout( ()=>{
            axios
            .post(
              'https://api.telegram.org/'+BOT_API_TOKEN+'/sendMessage',
              postbody
            )
            .then(response => {
               // We get here if the message was successfully posted
            console.log('Message posted')
              })
            .catch(err => {
              // ...and here if it was not
              console.log('Error :', err)
            })},
            1005+1000*i
          );
          custmentions = custmentions.slice(15);
          i++;
        }
        return "<b>"+getUserFullName(msg.from)+"</b>: "+text+"\n\n"+custmentions.join(' ')+"\n(contact the admin of the chat if you want your name removed from this list)";
      }
    } else if((/^(hi+|he+y+|he+l+o+)(\W+|$)/i).test(text)) {
      if(msg.reply_to_message) {
        if(msg.reply_to_message.from.username == thisbot.username) {
          return "How's your day been so far?";
        }
      }
    } else if(msg.reply_to_message) {
        if(msg.reply_to_message.from.username == thisbot.username || msg.chat.type == "private") { //check if AIchat and then reply

            var dbref = db.ref("chats/"+msg.chat.id+"/isaichat");
            var snapshot = await dbref.once('value');
            if(snapshot.exists() && snapshot.val() != 'off') { //default is on
                return await aichat.replyto(msg);
            }
        }
    }
  } else if(text[0] == cmdprefix) { //means it's a command
    var args = text.split(' ');
    handleQuotesInArgs(args);
    var cmd = args[0].slice(1);
    if(cmd == "help") {
      return helpstr;
    } else if(cmd=='args') { //for debugging
      return args.join('\n');
    } else if(cmd == "addtodb") {
      if(args.length < 4) return "not enough args. addtodb ref uid data";
      var ref = args[1];
      var data = args[3];
      var uid = args[2]
      db.ref(ref+'/'+uid).set({data: data});
      return "check if done.";
    } else if(cmd == "groups") {
      return getGroupsInfoFormattedStr();
    } else if(cmd == "contact") {
      return "This bot was developed by @justanotherlight .\nDrop a message to say thanks or leave angry feedback.\nI won't read anyway.\nJk if something wrong or want me to add a feature, just tell me and I'll consider it if it's good.\n\n\nHere's my website: <a href='http://www.justanotherlight.tech'>www.justanotherlight.tech</a>(down rn :( will update later.)\nYou may check out these cool groups:\n"+getGroupsInfoFormattedStr(); 
    } else if(cmd == "whois") { //display who is info of sender
        var user = msg.from;
        var response = "<b>ID:</b> "+user.id+"\n<b>first_name:</b> "+user.first_name+"\n<b>last_name:</b> "+user.last_name+"\n<b>username:</b> "+user.username+"\n<b>languagetag:</b> "+user.language_code;
        return response;
    } else if(cmd == "amiadmin") {
      if(await isAdminMessage(msg))
        return "You are admin.";
      else return "You are not admin.";
    } else if(cmd == "say") {
      if(args.length > 1)
        return {text:"<b>"+getUserFullName(msg.from)+"</b>: "+args.slice(1).join(' '),isselfmsg: true};
      else
        return "usage: "+cmdprefix+"say <i>something</i>";
    } else if(cmd == "unironick") {
      if(msg.from.first_name == "Kalpana") {
        return {text: "<b>"+getUserFullName(msg.from)+"</b>: hi daddy pin me against a wall anyone", isselfmsg: true};
      } else return "What?";
    } else if(cmd == "scream") {
      var ts = ""; //to scream
      if(args.length <= 1) {
        //check if is a reply otherwise show usage
        if(msg.reply_to_message) {
          ts = msg.reply_to_message.text;
        } else {
          return {text:mentionUserWithName(msg.from)+": AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", isselfmsg: true};
        }
      } else {
        //if arg is ping then convert all pings to name and store pings.

        ts = args.slice(1).join(' ');
      }

      var reply = msg.reply_to_message;

      return {text: await screamOut(ts), reply_msg_id: reply?reply.message_id:false};

    } else if(cmd == "setfirstmsg") {
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      if(args.length < 2) {
        return "Usage: "+cmdprefix+"setfirstmsg <MESSAGE>\nuse "+cmd+"firstmsg on/off to turn on or off the first message.";
      }
      var fmsg = args.slice(1).join(' ' );
      var dbref = db.ref('chats/'+msg.chat.id+'/firstmsg/');
      dbref.set(fmsg);
      return "Done. You may have to turn the service on using\n!firstmsg on\nif the service is off or if this is the first time you are doing this.";
    } else if(cmd=='firstmsg') {
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      var usage = "Usage: firstmsg on/off\nUse !setfirstmsg to set a custom message.";
      if(args.length < 2) {
        return usage;
      }
      var dbref = db.ref('chats/'+msg.chat.id+'/isfirstmsg');
      args[1] = args[1].toLowerCase();
      if(args[1]=='on' || args[1] == 'off') {
        dbref.set(args[1]);
      } else {
        return usage;
      }
      return "Done.\n";
    } else if(cmd=='hilight') {
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      var usage = "Usage: hilight on/off\nThis command enables or disables Light from saying Hi x! I'm Light! whenever someone writes \"I'm x\"";
      if(args.length < 2) {
        return usage;
      }
      var dbref = db.ref('chats/'+msg.chat.id+'/ishilight');
      args[1] = args[1].toLowerCase();
      if(args[1]=='on' || args[1] == 'off') {
        dbref.set(args[1]);
      } else {
        return usage;
      }
      return "Done.\n";
    } else if(cmd=="aichat") {
    	//return "disabled temporarily";
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      var usage = "Usage: aichat on/off\nThis command enables or disables Light from aichat mode";
      if(args.length < 2) {
        return usage;
      }
      var dbref = db.ref('chats/'+msg.chat.id+'/isaichat');
      args[1] = args[1].toLowerCase();
      if(args[1]=='on' || args[1] == 'off') {
        dbref.set(args[1]);
      } else {
        return usage;
      }
      return "Done.\n";
    } else if(cmd=='delnsfw') {
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      var usage = "Usage: delnsfw on/off\nThis command enables or disables Light from deleting nsfw images";
      if(args.length < 2) {
        return usage;
      }
      var dbref = db.ref('chats/'+msg.chat.id+'/isdelnsfw');
      args[1] = args[1].toLowerCase();
      if(args[1]=='on' || args[1] == 'off') {
        dbref.set(args[1]);
      } else {
        return usage;
      }
      return "Done.\n";
    } else if(cmd == "checkallgroups") {
      return "Command disabled. WIP\n";
      if(light_id != msg.from.id)
        return "You're not allowed to run this command";
      var alives = "";
      var deads = "";
      var galive;
      var dbref = db.ref('chats/');
      var snapshot = await dbref.once('value');
      if(!snapshot.exists())
        return "Something wrong! Snapshot doesn't exist.";
      var allchats = snapshot.val();
      
      for(var i=0;i<Object.keys(allchats).length;i++) {
        var chat_id = Object.keys(allchats)[i];
        var chat = allchats[chat_id];
        if(!chat)
          continue;
        chat.id = Number(chat_id);
        if(!chat.details)
          galive = false;
        else {
        if(chat.details.type == "private")
          continue;
        var postbody = {
            chat_id: chat.id,
            parse_mode: 'html',
            text: "flickers",
            disable_web_page_preview: true,
          };
          try {
        var response = await axios.post(
              'https://api.telegram.org/'+BOT_API_TOKEN+'/sendMessage',
              postbody
            ); 
               // We get here if the message was successfully posted
         response = response.data;
         if(response.ok) {
            var smsg = response.result;
            console.log(smsg);

            await axios.post('https://api.telegram.org/'+BOT_API_TOKEN+'/deleteMessage',{chat_id: chat.id, message_id: smsg.message_id}).catch((e)=>{
              isalive = false;
              deads += chat.details.title+"\n";
              console.log(e);
            });
            alives += chat.details.title+"\n";

  //          dbstats.pus({chat_id: chat.id, alive: true});
            galive = true;
           } else {
          // if(chat.details)
            deads += chat.details.title+"\n";
          // else deads += "id: "+chat.id +"\n";
//          dbstats.push({chat_id: chat.id, alive: false});
           galive = false;
          }
         }
         catch( e) {
            if(chat.details)
            deads += chat.details.title+"\n";
            galive = false;
           };

         }
         var gref = db.ref('chats/'+chat.id+'/alive');
         gref.set(galive);
      }

      return "Alive:\n"+alives +"Dead:\n"+deads;
    } else if(cmd == "addping") {
      var usagestr = "usage: "+cmdprefix+"addping @customping user1/{id,name}/id @user2/{id,name}/id ...\nsee "+cmdprefix+"help addping (not implemented yet :( )";
      if(args.length < 3)
        return usagestr;
      
      var chatid = msg.chat.id;
      
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      
      var ping = args[1];
      if(ping[0] != '@')
        return "The custom ping should start with @\n"+usagestr;
      
      /*for(var i=2;i<args.length;i++) {
        if(!((args[i][0] == '{' && args[i][args[i].length -1]=='}') || args[i].length >= 2))
          return "mention for user should be @user or {id,name} and length of customping > 1\n"+usagestr;
      }*/
      
      if(/\W/.test(ping.slice(1)))
        return "Invalid ping '"+ping+"'. please use only alphanumeric characters. Thanks.";
      var pingref = db.ref('chats/'+chatid+'/customats/'+ping)
      var toping = args.slice(2).map((x)=>{
        var arr;
        if(x[0]=='{') {
          arr = x.split(',');
          var id = Number(arr[0].slice(1));
          var name = arr[1].slice(0,arr[1].length-1);
          return {id:id, name:name}
        } else if(!isNaN(x)) { //it's an id ig
          return {id:Number(x)};
        } else if(x[0] != '@') {
          return '@'+x;
        }
        return x;
      });
      pingref.set(toping);
      
      return ping+" created/replaced successfully.";
    } else if(cmd=='addtoping') {
      /* TODO: check if user already exists in the ping and prevent readding. */
      var usagestr = "usage: "+cmdprefix+"addtoping @pinggroup @user1 @user2 ...\n";

      var toadd = [];
      if(args.length < 2)
        return usagestr;
      if(args.length < 3) {
        if(msg.reply_to_message)
          toadd = [(msg.reply_to_message.from.username)?msg.reply_to_message.from.username:('{'+msg.reply_to_message.from.id+','+getUserFullName(msg.reply_to_message.from)+'}')];
        else
          return "You can reply to a message with this command to add the user to a pinglist or do this:\n"+usagestr;
      }
      
      toadd = toadd.concat(args.slice(2));
      
      var ping = args[1];
      if(ping[0] != '@')
        return "The custom ping should start with @\n"+usagestr;
      
      if(toadd.length==0)
        return "Weird. No one to ping. Aborted.";
      
      
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      
      var chatid=msg.chat.id;
      
      if(/\W/.test(ping.slice(1))) {
        return "only use alphanumeric character in ping name.\n"+usagestr;
      }
      
      var pingref = db.ref('chats/'+chatid + '/customats/'+ping);
      
      var toping = toadd.map((x)=>{
        var arr;
        if(x[0]=='{') {
          arr = x.split(',');
          var id = Number(arr[0].slice(1));
          var name = arr[1].slice(0,arr[1].length-1);
          return {id:id, name:name}
        } else if(!isNaN(x)) { //it's an id ig
          return {id:Number(x)};
        } else if(x[0] != '@') {
          return '@'+x;
        }
        return x;
      });
      
      var snapshot = await pingref.once('value');
      var newadded = 0;
      if(snapshot.exists()) {
        ;
        toping = [...new Set(toping.concat(snapshot.val()))];
        newadded = toping.length - snapshot.val().length;
      } else newadded = toping.length;
      
      pingref.set(toping);
      
      return "Added "+newadded+" new users to "+ping+".";
    } else if(cmd == 'removefromping') {
      var usagestr = 'usage: '+cmdprefix+'removefromping @pinggroup @usertoremove';
      
      var argusers=[];
      if(args.length < 2) {
        return usagestr;
      }
      if(args.length <3) {
        if(msg.reply_to_message)
          argusers = [(msg.reply_to_message.from.username)?msg.reply_to_message.from.username:msg.reply_to_message.from.id];
        else
          return "You can reply to a message with this command to remove the user from a pinglist or do this:\n"+usagestr;
      }
      argusers = argusers.concat(args.slice(2));
      
      
      var ping = args[1];
      if(ping[0] != '@')
        return "The custom ping should start with @\n"+usagestr;
      
      
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      
      var chatid=msg.chat.id;
      var ping = args[1];
      if(/\W/.test(ping.slice(1))) {
        return "only use alphanumeric character in ping name.\n"+usagestr;
      }
      
      var pingref = db.ref('chats/'+chatid + '/customats/'+ping);
      
      argusers = argusers.map((x)=>{
        var arr;
        if(x[0]=='{') {
          arr = x.split(',');
          var id = Number(arr[0].slice(1));
          var name = arr[1].slice(0,arr[1].length-1);
          return {id:id, name:name}
        } else if(!isNaN(x)) { //it's an id ig
          return {id:Number(x)};
        } else if(x[0] != '@') {
          return '@'+x;
        }
        return x;
      });
      
      var snapshot = await pingref.once('value');
      var deli = new Set();
      if(!snapshot.exists()) {
        return "It seems the ping doesn't exist. I can't remove someone from nothing. Yet.\n"+usagestr;
      }
      var pinglist = snapshot.val();
      for(var i=0;i<argusers.length;i++) {
        for(var j=0;j<pinglist.length;j++) {
          if(argusers[i]==pinglist[j] || (argusers[i].id && pinglist[i].id && argusers[i].id==pinglist[i].id) ) {
            deli.add(j);
          }
        }
      }
        
      pinglist = pinglist.filter( (x,i) => !deli.has(i) );
      
      if(pinglist.length == 0)
        pinglist = null;
      
      pingref.set(pinglist);
      
      return deli.size + " users removed from ping.";
      
    } else if(cmd == 'deleteping') {
    
      var usagestr = "usage: "+cmdprefix+"deleteping @pingname";
      
      if(args.length != 2)
        return usagestr;
      
      var ping = args[1];
      if('@' != ping[0])
        return "pings start from @.\n"+usagestr;
      
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      
      var pingref = db.ref("chats/"+msg.chat.id+"/customats/"+ping);
      
      pingref.set(null);
      
      return "It was deleted(i guess). I don't remember if it even existed in the first place.";
      
    } else if(cmd == "undelbotmsg") {
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      var usagestr = "usage: "+cmdprefix+"undelbotmsg @botusername\n Stops deleting messages that are sent via a bot with username botusername";
      if(args.length < 2)
        return usagestr;
      if(args[1][0]!="@")
        return "second argument must be a mention e.g. @ExampleBot\n"+usagestr;
      args[1] = args[1].slice(1);
      var dbref = db.ref('chats/'+msg.chat.id+'/delviabots/'+args[1]);
      dbref.set(null);
      return "Done.";
    } else if(cmd == "delbotmsg") {
      if(!(await isAdminMessage(msg)))
        return adminpermerror;
      var usagestr = "usage: "+cmdprefix+"delbotmsg @botusername\nDeletes messages that are sent via a bot with username botusername";
      if(args.length < 2) {
        return usagestr;
      }
      if(args[1][0] != "@")
        return "second argument must be a mention e.g. @ExampleBot\n"+usagestr;
      args[1] = args[1].slice(1);
      var chat_id = msg.chat.id;
      var dbref = db.ref('chats/'+msg.chat.id+'/delviabots');
      var snapshot = await dbref.once('value'); //change this to avoid reading all and just adding only the bot instead
      var setobj = {};
      if(snapshot.exists())
        setobj = snapshot.val();
      setobj[args[1]] = true;
      dbref.set(setobj);
      var response = "I will delete messages sent <i>via</i> "+args[1]+".";
      //TODO: add autocheck self admin status
      return response + "\n(I need to be an admin to delete messages for everyone. Otherwise, I will be deleting messages for myself only.. which would be kinda useless tbh)";
    } else if(cmd == "lmgtfy") {
	    if(args.length < 2) {
	    	return "Enter a search query along with it.";
	    }
	    var response = "https://lmgtfy.com/?q="+args.slice(1).join('+');
	    var reply = msg.reply_to_message;
	    
	    return {text:response, reply_msg_id: reply?reply.message_id:false};

    } else if(cmd == "hifi") {
      var hifier = "<a href='tg://user?id="+msg.from.id+"'>";
      var hifname = getUserFullName(msg.from);
      hifier += hifname;
      hifier+="</a>";
      var hified = "";
      var reply = msg.reply_to_message;
      if(reply) {
        hified = "<a href='tg://user?id="+reply.from.id+"'>";
        hified += getUserFullName(reply.from);
        hified += "</a>";
      } else if(args.length == 2 && (args[1]=="everyone" || args[1]=="@everyone")) {
        hified = "everyone";
        args[1] = "I have enough hands to hifi everyone here";
      } else {
        hified = hifier;
        hifier = "<a href='tg://user?username=epiclightbot'>LightBot</a>";
      }

      var response = hifier + " gives "+hified+"a high five!\n*friendship intensifies*";
      if(args.length > 1) {
        response += "\n<b>"+hifname+"</b>: "+args.slice(1).join(' ');
      }
      return {text: response, reply_msg_id: reply?reply.message_id:false};
    } else if(cmd == "hug") {
      var hugger = "<a href='tg://user?id="+msg.from.id+"'>";
      var huggername = getUserFullName(msg.from);
      hugger+=huggername;
      hugger+="</a>";
      var hugged = "";
      var reply = msg.reply_to_message;
      if(msg.reply_to_message) {
        hugged = "<a href='tg://user?id="+reply.from.id+"'>";
        hugged += getUserFullName(reply.from);
        hugged += "</a>";
      } else if(args.length == 2 && (args[1]=="everyone" ||
                args[1]=="@everyone") ) {
        hugged = "everyone";
        args[1] = "I have long enough hands to hug everyone here";
      } else { //the bot hugs sender if it wasn't a reply
        hugged = hugger;
        hugger = "<a href='tg://user?username=epiclightbot'>LightBot</a>";
      }
      var response = hugger+" gives "+hugged+" a warm hug. ❤️\n";
      if(args.length > 1) {
        response += "\n<b>"+huggername+"</b>: "+args.slice(1).join(' ');
      }
      return {text:response, reply_msg_id: reply?reply.message_id:false};
    } else if(cmd == "slap") {
      var slapper = "<a href='tg://user?id="+msg.from.id+"'>";
      var slappername = getUserFullName(msg.from);
      slapper+=slappername;
      slapper+="</a>";
      var slapped = "";
      if(msg.reply_to_message) {
        var reply = msg.reply_to_message;
        slapped = "<a href='tg://user?id="+reply.from.id+"'>";
        slapped += getUserFullName(reply.from);
        slapped += "</a>";
      } else if(args.length == 2 && (args[1]=="everyone" ||
                args[1]=="@everyone") ) {
        slapped = "@everyone";
        args[1] = "I have enough hands to slap everyone here";
      } else {
        return "LightBot would never slap "+slapper+". You too special ❤️";
      }
      var response = slapper + " slaps "+slapped+" with the force of a thousand stars.\nYour HP drops by -1000x⭐️\n" ;
      if(args.length > 1) {
        response += "\n<b>"+slappername+"</b>: "+args.slice(1).join(' ');
      }
      return {text:response, reply_msg_id: reply?reply.message_id:false};
    } else if(cmd == "give") {
      if(args.length < 2) return "usage: give object text";
      var object = args[1];
      var giver = getUserFullName(msg.from);
      var recver = "";
      if(msg.reply_to_message) {
        reply = msg.reply_to_message;
        recver = "<a href='tg://user?id="+reply.from.id+"'>";
        recver += getUserFullName(reply.from);
        recver += "</a>";
      } else {
        recver = "Someone 👀";
      }
      var response = recver+" gets "+object+". Yayyy! 🥳🥳🥳\n";
      if(args.length > 2) {
        response += "\n<b>"+giver+":</b>"+args.slice(2).join(' ');
      }
      return {text:response, reply_msg_id: reply?reply.message_id:false};
    } else if(cmd == "sayinchat") {
      if(msg.from.id != light_id) return "You do not have permission to run this command.";
      if(args.length < 3) return "usage: sayinchat chatid/mention message";

      var chat_id = getChatId(args[1]);

      var text = args.slice(2).join(' ');
      return {chat_id, text, isselfmsg:true};
    } else if(cmd == "lookaround") {
        
        var chatid;
        if(args.length < 2) chatid = msg.chat.id;
        else chatid = args[1];
        
        var postbody = {chat_id: Number(chatid)};
        try {
      var response = await axios
        .post(
          'https://api.telegram.org/'+BOT_API_TOKEN+'/getChatAdministrators',
          postbody
        );
       } catch(error) {
        return "Yea no. I don't wanna get too personal rn.\nTry the command in a group chat.";
       }
        //.then(response => {
          // We get here if the message was successfully posted
          var response = response.data;
          if(response.ok) {
            var adminids = response.result.map((x)=>x.user.id);
            var adminpath = 'chats/'+chatid+'/admins';
            var dbref = db.ref(adminpath);
            dbref.set(adminids);
            console.log('done ig?');
            return "Number of (nonbot) admins: "+adminids.length;
          }
          return "I might be blind";
    } else if(cmd == 'kang')  {
      return "WIP.\n";
      var sticker = msg.reply_to_message.sticker;
      if(!sticker) { //handle pic
      return null;
      }
      var snapshot = await db.ref('chats/'+msg.from.id+'/stickerpack').once('value');
      if(!snapshot.exists()) { //sticker pack doesn't exist
        //so create one
        //first download the sticker
        var resp = await axios.post('https://api.telegram.org/'+BOT_API_TOKEN+'/getFile', {file_id:sticker.file_id}).catch( (err)=> {console.log(err)});
        if(!resp || !resp.data || !resp.data.ok)
          return "Error occured while cloning the sticker";
        var filepath = resp.data.result.file_path;
        //console.log(filepath);
        var stickerlink = "https://api.telegram.org/file/"+BOT_API_TOKEN+'/'+filepath;
        var resp = await axios.post('https://api.telegram.org/'+BOT_API_TOKEN+'/createNewStickerSet',
          {
            user_id: msg.from.id,
            name: (msg.from.username||('lightsticker'+msg.from.id))+'_by_epiclightbot',
            title: getUserFullName(msg.from)+'\'s epic sticker pack',
            emojis: '💡', //it's the light bulb emoji for now. change this by taking from user's argument
            png_sticker: stickerlink
          }).catch( (err)=> {
            console.log("error");
            console.log(err);
          });
        if(!resp) {
          return "Error occured";
        }
        if(!resp.data || !resp.data.ok || !resp.data.result) {
          return "Error occurred";
        }

        return "Done.\n";
      }

      return "something wrong this is WIP.";

    } else if(cmd == "getchatid") {
        return msg.chat.id;
    } else if(cmd=='random') {
      if(args.length < 3)
        return "usage: random lowerlimit upperlimit\n(both limits are inclusive)";
      var ll = Number(args[1]);
      var ul = Number(args[2]);
      if(ll >= ul)
        return "arguments not good. upperlimit must be strictlygreater than lower limit";
      return "After rolling my many sided die, I got the number <b>"+Math.floor(Math.random()*(ul-ll+1)+ll)+"</b>";
    }
    else { //default case - invalid command
      //return "Are you high? I don't think that's even a command.";
      return null; ///ignore invalid commands
    }
  }
}

async function captureChatData(chat_id) {
  /**
  * Takes every message that comes and stores group info.
  * Group info includes: chat id, chat name, chat desc, chat admins, number of participants
  */
    var chatref = db.ref('chats/'+chat_id + '/details');
    var postbody = {chat_id: Number(chat_id)};
    try {
  
      var response = await axios
        .post(
          'https://api.telegram.org/'+BOT_API_TOKEN+'/getChat',
          postbody
        );
      
     } catch(error) {
        console.log("Error with request lel\nerror: "+error);
        return null;
    }
      var response = response.data;
      if(!response.ok) {
        console.log("Response not ok lel");
        return null;
      }
      response = response.result;
      var dets = {};
      if(response.type == 'private') {
        if(response.first_name)
        dets.first_name = response.first_name;
        if(response.last_name)
        dets.last_name = response.last_name;
      } else {
        dets.title = response.title;
        if(response.description)
        dets.description = response.description;
        if(response.invite_link)
          dets.invite_link = response.invite_link;
      }

      dets.lastmsgat = Date();
      
      if(response.username)
        dets.username = response.username;
      dets.type = response.type;
      chatref.set(dets);
}

async function getMentionsFromCustomMentions(str, chatid) {

  var mentions = [];
  for(var i=0;i<str.length;i++) {
    if(str[i++]=='@') {
      var mention = "@";
      while(i < str.length && /\w/.test(str[i])) {
        mention+=str[i];
        i++;
      }
      if(mention.length > 2)
        mentions.push(mention);
    }
  }
  if(mentions.length == 0) return "";
  
  var mentionsarr = [];
  
  for(var i=0;i < mentions.length;i++) {
    var snapshot = await db.ref('chats/'+chatid+'/customats/'+mentions[i]).once('value');
    if(snapshot.exists()) {
      mentionsarr = mentionsarr.concat(snapshot.val().map((x)=>toMentionStr(x)));
    }
  }
  
  return mentionsarr;
}

async function isAdminMessage(msg) {
      var chatid = msg.chat.id;
      var uid = msg.from.id;
      
      var adminlist = await db.ref("chats/"+chatid+"/admins").once('value');
      if(!adminlist.exists() || !adminlist.val().includes(uid))
        return false;
      
      
      return true;
}

function toMentionStr(x) {
  if(x.id)
    return "<a href='tg://user?id="+x.id+"'>"+(x.name?x.name:x.id)+"</a>";
  if(x[0]=="@") return x;
}

function parseTemplateStr(stemplate, msg) {
  var ts = "%NAME%"
//  var index = stemplate.indexOf(ts);
//  if(index != -1) {
   stemplate = stemplate.replace(ts, getUserFullName(msg.from));
//  }
  
  return stemplate;
}

async function screamOut(text) {
  var res = "";

  for(var i=0;i<text.length;i++) {
    if(text[i] == '@') {
      var mention = "";
      while(text.length > i && text[i]!=' ') {
        mention +=  text[i];
        i++;
      }
      var postbody = {chat_id: mention};
      try {
      //RESOLVING NAME USING USERNAME DOESN"T WORK. SEE MTPROTO in the future
      var response = await axios
        .post(
          'https://api.telegram.org/'+BOT_API_TOKEN+'/getChat',
          postbody
        );

        response = response.data;
        if(!response.ok) {
          console.log("weird af response lel");
          console.log(response);
          res += mention;
        }
        response = response.result;
        var sp = screamOut(getUserFullName(response));
        res += "<a href='tg://user?id="+response.id+"'>"+sp+"</a>";
       } catch(error) {
        res += mention;
        console.log(error)
       }
       if(i<text.length) res += text[i];
    } else
    if(['a', 'e', 'i', 'o', 'u'].indexOf(text[i].toLowerCase()) !== -1) {
      res += text[i].toUpperCase().repeat(4+(Math.random()*10)%3);
    } else
      res +=text[i].toUpperCase();
  }
  return res;
}

function getChatId(id) {
  for(var i=0;i<groupsinfo.length;i++) {
    if(groupsinfo[i].mention == id)
      return groupsinfo[i].chat_id;
  }
  return id;
}

function getGroupsInfoFormattedStr() {
  var infostr = "";
  for(var i=0;i<groupsinfo.length;i++) {
    infostr += "\n<a href='"+groupsinfo[i].invite_link+"'>";
    infostr += groupsinfo[i].name;
    infostr += "</a> - "+groupsinfo[i].desc;
  }
  return infostr;
}

function mentionUserWithName(user) {
  return "<a href='tg://user?id="+user.id+"'>"+getUserFullName(user)+"</a>";
}

function getUserFullName(user) {
  var name = "";
  if(user.first_name) name+=user.first_name;
  if(user.last_name && user.first_name) name+=" ";
  if(user.last_name) name+=user.last_name;
  return name;
}

function handleQuotesInArgs(args) {
  for(var i=1;i<args.length;i++) {
    if(args[i][0] == '"') {
      args[i] = args[i].slice(1); //removing the quote character
      var j=i+1;
      while(j<args.length && args[j-1][args[j-1].length-1] != '"') {
        args[i] += " "+args[j];
        args.splice(j, 1);
      }
      if(args[j-1][args[j-1].length-1] == '"') {
        args[j-1] = args[j-1].slice(0,-1); //removing end quote character
      }
    }
  }
}
