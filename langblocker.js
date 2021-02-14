const axios = require('axios');
const db = require('./db.js').db
var FormData = require('form-data');
const BOT_API_TOKEN = process.env.BOT_API;
const ch_accesskey = process.env.CH_ACCESSKEY; //coffee house access key

/*TODO:
* blocks languages not in langs array and not in whitelist
* whitelist object will have two arrays - users and words and for certain users certain words
* whitelist is optional, langs is required
* The message is deleted and the user is muted for 1 hour or something or maybe just report to admins
* TODO: add generalization too
*/
exports.filtermsg = async function(msg, langs, whitelist) {

    const tol = 50;
    
    if(whitelist) {
      if( whitelist.users && whitelist.users.includes(msg.from.id) )
        return;
      if(whitelist.words) {
        for(var i=0;i<whitelist.words.length;i++) {
          var ww = whitelist.words[i];
          if(msg.text.indexOf(ww) != -1 && ww.length/msg.text.length >= 0.35) { //whitelisted word >= 35% of message
            return;
          }
        }
      }
    }
	  var data = new FormData();
  	data.append('access_key', ch_accesskey);
  	data.append('input', msg.text);
	
  	var config = {
	  	method: 'post',
		  url: 'https://api.intellivoid.net/coffeehouse/v1/nlp/language_detection',
  		headers: { 
  		...data.getHeaders()
  		},
  		data : data
  	};
	  var response = await axios(config).catch((err)=>{
    	if(err.response)
  			console.log(err.response.data);
  		else console.log(err);
  	});
  	if(!response) {
  		console.log("ughlangbloc");
  		return;
  	}
  	var dlang = response.data.results.language_detection.language;
  	var preds = response.data.results.language_detection.predictions
  	var dprob = preds[dlang];
  	if(dprob < tol || msg.text.split(" ").length < 3) //not a good prediction or number of words too few so stop
  	  return;
  	  
  	if(langs.allowed)
    for(var i=0;i<langs.allowed.length;i++) {
      if(preds[langs.allowed[i]] > tol) { //allow it
        return;
      }
    }
    
    var toban = false;
    if(langs.banned)
    for(var i=0;i<langs.banned.length;i++) {
      if(preds[langs.banned[i]] > tol) {
        toban = true;
        break;
      }
    }
    if(!toban)
      return;
  
    //BAN or WARN or whatever
    var message = "Detected language that's not allowed in this chat: "+dlang+". @admin";
    axios.post('https://api.telegram.org/'+BOT_API_TOKEN+'/sendMessage',
        	{
        		chat_id: msg.chat.id,
        		text: message,
        		parse_mode: 'html',
      		disable_web_page_preview: true,
      	}).catch((e)=>{
        		if(e.response.data)
        			console.log(e.response.data)
        		else
            		console.log(e);
          });
}
