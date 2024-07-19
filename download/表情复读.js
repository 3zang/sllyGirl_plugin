/**
 * @author 复读机
 * @create_at 2023-12-09 19:55:32
 * @title 表情复读📻
 * @priority 8
 * @public false
 * @description 😊随机复读消息
 * @version v2.0.0
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/02/110_f5529d6c831867c6c65ddce19568b7df_con.png
 * @disable true
 * @platform  wx
 */

const mod = require("Mod1.0")
var content = s.getContent()
var hour = new Date().getHours()
var minutes = new Date().getMinutes();
var user = s.getUserName()
var chatId = s.getChatId();
let chatSurfix = "@chatroom"
//是否开启debug
let debug = new Bucket("sillyGirl").get("debug") ? true : false
if (chatId > 0) {
    chatId = chatId + chatSurfix;
} else {
    chatId = s.getUserId()
}
let emoji_url = "http://192.168.0.47:5001/emoji/"

let emojis = ["偷着乐吧", "没有压迫", "纠缠有意思吗", "我能看的出来", "dog"]
repeater()
function repeater() {
    //console.log("CHATID: ",chatId)
    if (chatId != 0) {
        let size = emojis.length
        let emoji = emojis[Math.round(Math.random() * size)] + ".gif"
        var chatName = s.getChatName();
        if (debug) console.log(`表情复读收到- -` + chatName + `- - 的 - -` + user + `- -的消息:` + s.param(1))
        if (minutes % hour == 5) {
            if (content.startsWith("<?xml ")) {
                console.log("复读机监测到引用类消息,不复读")
            } else {
                // mod.sendEmoji(chatId, "偷着乐吧你" + ".gif")
                s.reply(emoji_url + emoji)
            }

        } else {
            //console.log("不在时间范围,不复读")
            s.reply(emoji_url + emoji)
            s.continue()
        }
    } else {
        //console.log(user+"----非群聊,不复读")
        s.continue()
    }
}