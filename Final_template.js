// paste your bot token given by the botfather here
var token = 'yourownbotTOKEN';

var telegramUrl = "https://api.telegram.org/bot" + token;

// after your first deployment copy your web app url and paste it here and deploy again! 
var webAppUrl = 'your-webapp-url';

// after updating the token and the Web App Url, run setWebhook() once!!!! 
function setWebhook() {
  var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
  var response = UrlFetchApp.fetch(url);
  Logger.log("Telegram URL: " + telegramUrl)
  Logger.log("Webhook URL: " + url)
  Logger.log(response.getContentText())
}



// based on sendMessage method of the bot API. refer to this link for more details on other available parameters https://core.telegram.org/bots/api#sendmessage (Ctrl + Click the link)

function sendMessage(chat_id, text, keyBoard) {
  var data = {
    method: "post",
    payload: {
      method: "sendMessage",
      chat_id: String(chat_id),
      text: text,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(keyBoard)
    }
  };
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}

// based on sendPhoto method of the bot API. refer to this link for more details on other available parameters https://core.telegram.org/bots/api#sendphoto  (Ctrl + Click the link)

function sendPhoto(chat_id, photo_url, caption) {
  var payload = {
    'method': 'sendPhoto',
    'chat_id': String(chat_id),
    'photo': photo_url,
    'caption': caption,
  }

  var data = {
    "method": "post",
    "payload": payload
  }
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/', data);
}


function sendRedditPicture(chat_id) {
  var subreddit = "aww"
  var meme_api =
    `https://meme-api.herokuapp.com/gimme/${subreddit}`; //https://meme-api.herokuapp.com/gimme/aww
  var rawdata = UrlFetchApp.fetch(meme_api);
  var data = JSON.parse(rawdata);
  var pic_url = data.url
  var caption = data.title
  Logger.log(data)
  //need to call sendPhoto
  sendPhoto(chat_id, pic_url, caption)
}


var mainSSID = "your google sheets id only"

function saveToDo(todo) {
  var todo_sheet = SpreadsheetApp.openById(mainSSID).getSheetByName("todo"); //looks for the sheet named "todo"
  var lastRow = todo_sheet.getLastRow();
  todo_sheet.getRange(lastRow + 1, 1, 1, 2).setValues([[new Date(), todo]]) //adds in new item below

  //         getRange(Current Row, Current Col, extend, extend)
}



function viewToDo() {
  var todo_sheet = SpreadsheetApp.openById(mainSSID).getSheetByName("todo");
  var lastRow = todo_sheet.getLastRow();
  Logger.log(todo_sheet.getRange(2, 2, lastRow, 1).getValues().join(',').split(','))
  var todoList = todo_sheet.getRange(2, 2, lastRow, 1).getValues().join(',').split(",")
  todoList.pop()

  var todoText = "-- My to do list --\n"
  todoList.forEach((todoItem, index) => { todoText += "\n" + (index + 1) + ". " + todoItem })

  Logger.log(todoText)
  return todoText
}


function saveID(chat_id) {
  var user_sheet = SpreadsheetApp.openById(mainSSID).getSheetByName("user-data");
  var lastRow = user_sheet.getLastRow();
  //must check first if exist anot
  Logger.log(user_sheet.getRange(2, 1, lastRow, 1).getValues().join(",").split(","))
  var current_ids = user_sheet.getRange(2, 1, lastRow, 1).getValues().join(",").split(",")

  if (!current_ids.includes(String(chat_id))) {
    //does not include chat_id
    user_sheet.getRange(lastRow + 1, 1, 1, 1).setValues([[chat_id]])
  }
}



function massMessage() {
  var user_sheet = SpreadsheetApp.openById(mainSSID).getSheetByName("user-data");
  var lastRow = user_sheet.getLastRow();
  //must check first if exist anot
  Logger.log(user_sheet.getRange(2, 1, lastRow, 1).getValues().join(",").split(","))
  var current_ids = user_sheet.getRange(2, 1, lastRow, 1).getValues().join(",").split(",")
  current_ids.pop()

  //var message_sheet = SpreadsheetApp.openById(mainSSID).getSheetByName("mass-message");
  //var mass_message = message_sheet.getRange(2, 1).getValue()
  //Logger.log(mass_message)
  var mass_message = "hello theere"


  current_ids.forEach(chat_id =>
    sendMessage(chat_id, mass_message)
  )
}



// test() is just for us to do a quick test on other functions in our code
function test() {
  saveID(errorChatID)
}

//CHANGE THIS TO YOUR GRP ID 
var errorChatID = "-749925847" //we create a telegram group with the bot to send us error details since i dont have money to subscribe to google cloud logs :3 


function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    //sendMessage(errorChatID, "Contents: \n\n" + JSON.stringify(contents,null,'\t'))

    if (contents.message) {
      var chat_id = contents.message.chat.id
      var user_text = contents.message.text
      //sendMessage(chat_id,contents.message)


      if (user_text == "/sendpic") {
        sendRedditPicture(chat_id)
      } else if (user_text.substring(0, 6) == "/todo " && user_text.length > 6) {
        saveToDo(user_text.substring(6))
        sendMessage(chat_id, "todo list updated")
      } else if (user_text == "/todo") {
        sendMessage(chat_id, viewToDo())
      } else if (user_text == "/start") { //whenever someone initates our bot in a private message we save their chat_id however for grps its different and we wld require a different way to check for it refer to the bottom if you would like to explore!!
        saveID(chat_id)
        sendMessage(chat_id, "Hello there, try using my commands /todo and /sendpic")
      } else {
        sendMessage(chat_id, user_text) //repeats user message 
      }

    }
  } catch (err) {
    //do smth w error
    sendMessage(errorChatID, "ERROR: " + err)
  }
}

//to check if bot as been added to a new grp or not; we can check messages.new_chat_member and then check if the new member added is our bot by checking the username as shown below
/*

if (contents.message) {
      //check if its a message
      var chat_id = contents.message.chat.id
      if (contents.message.new_chat_member != undefined) {   // check any new chat members has been added
        if (contents.message.new_chat_member.username == "garage_workshop_bot") {   //is the bot the newly added member?
          // send a welcome message
          sendMessage(chat_id, "Hello there, you have added ze Telegram Workshop Bot to your grp! Play around with my commands")
          saveID(chat_id)
        }
      } else {
        //normal messages
        var userCommand = contents.message.text

*/


