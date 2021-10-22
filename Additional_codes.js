//the function helps us to convert the options from an array into json
function getKeyBoard(keyboardOptions, callbackOptions) {

  //ensures that number of keyboard Options match the number of callback Options
  if (keyboardOptions.length !== callbackOptions.length) {
    Logger.log("ERROR keyboard options mismatch" + "keyboard: " + keyboardOptions.length + "but" + callbackOptions.length)
    sendText(errorChatID, "ERROR keyboard options mismatch" + "keyboard: " + keyboardOptions.length + "but" + callbackOptions.length)
    return 0
  }
  // from the keyboard and callback options we have set is in the form of arrays, for the api to read it we need to convert it to JSON format as shown below. 
  var jsonTxt = []
  keyboardOptions.forEach(function (opt, i) {
    jsonTxt.push(`[{ "text": "${opt}","callback_data": "${callbackOptions[i]}"}]`)
  })

  var keyBoard = JSON.parse(`{"inline_keyboard":[${jsonTxt}]}`)
  Logger.log(JSON.stringify(keyBoard))
  return keyBoard
}

function testKeyboard(){
  // define our keyboard [These are the options the user will see] and this is callback received by bot when user presses a button
  var keyBoard = getKeyBoard(["Send Reddit Pic", "View To Do", "Another option"], ['sendpic',   'view-todo', 'another']);

  sendMessage(chat_id, "Would you like to do?", keyBoard);
}


//HOWEVER TO READ THE DATA FROM AN INLINE KEYBOARD, THE contents of the message received will be different from your normal chat messages hence we cannot use contents.message to check for it we need to use contents.callback_query as shown below

/*
    if (contents.callback_query) {

      var chat_id = contents.callback_query.message.chat.id
      var chat_name = contents.callback_query.message.chat.title
      var message_id = contents.callback_query.message.message_id
      var user_input = String(contents.callback_query.data);
      
 */