var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
const axios = require('axios')
var telehandler = require('../telehandler');
const BOT_API_KEY = process.env.BOT_API;

router.post('/new-message', async (req, res) => {
  const {message } = req.body;
  
  //res.send(req.body);
  //console.log(req.body);

  //Each message contains "text" and a "chat" object, which has an "id" which is the chat id

  if(req.body.callback_query) { //handle callback queries
    await telehandler.handleQuery(req.body.callback_query);
    return res.end();
  }

   if (!message) {
    return res.end();
  }
  
  if(message.photo) {
    await telehandler.handlePhoto(message.photo, message);
    return res.end();
  }


  var response = {};
  var resp = await telehandler.handleMessage(message);
  if(!resp)
    return res.end();

  if(resp.chat_id) {
    response.chat_id = resp.chat_id;
  } else response.chat_id = message.chat.id;
  if(resp.text) {
    response.text = resp.text;
  } else response.text = resp;

  var postbody = {
        chat_id: response.chat_id,
        parse_mode: 'html',
        text: response.text,
        disable_web_page_preview: true,
  };

  if(resp.isselfmsg) {
  } else if(resp.reply_msg_id) {
    postbody.reply_to_message_id = resp.reply_msg_id;
  } else {
    postbody.reply_to_message_id = message.message_id;
  }
  
  axios
    .post(
      'https://api.telegram.org/'+BOT_API_KEY+'/sendMessage',
      postbody
    )
    .then(response => {
      // We get here if the message was successfully posted
      console.log('Message posted')
      res.end('ok')
    })
    .catch(err => {
      // ...and here if it was not
      console.log('Error :', err)
      res.end('Error :' + err)
    });
});


router.get('/', async (req, res) => {
  res.end("yay!");
});

module.exports = router;
