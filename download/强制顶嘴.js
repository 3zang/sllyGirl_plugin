/**
 * @author 三藏优雅
 * @create_at 2023-12-09 19:55:30
 * @title 强制顶嘴🈲 ❗️
 * @priority 0
 * @public false
 * @description 😊召唤小爱同学陪聊，干啥都行。
 * @version v2.0.0
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/02/110_f5529d6c831867c6c65ddce19568b7df_con.png
 * @disable false
 * @platform tg
 */

const s = sender
var message = s.param(1)
var chatID = s.getChatId()
var platform = s.getPlatform()
var userID = s.getUserId()
var username = s.getUsername()
var hour = new Date().getHours()
var minutes = new Date().getMinutes();
var par = s.param(1)
var msg = s.getContent();
reply()
function reply() {


    if (msg.startsWith("<?xml ")) {
        console.log("###################################监测到引用类消息,不复读")
        s.continue()
    }
    console.log("*******收到消息:" + msg)
    // 不能  返回 能
    if (msg.match(/胖虎/) != null) {
        s.reply("胖虎过滤")
        return
    }

    // 不能  返回 能
    if (msg.match(/能不能/) != null) {
        let subMsg = msg.substring(msg.indexOf('能不能') + 2, 8)
        s.reply("不" + subMsg + "?")
        return
    }
    // 不能  返回 能
    if (msg.match(/不能/) != null) {
        let subMsg = msg.substring(msg.indexOf('不能') + 1, 8)
        s.reply(subMsg + "")
        return
    }

    //能返回 不能
    if (msg.match(/能/) != null) {
        let subMsg = msg.substring(msg.indexOf('能') + 1, 8)
        s.reply("不能" + subMsg + "?")
        return
    }

    // 不能  返回 能
    if (msg.match(/要不要/) != null) {
        let subMsg = msg.substring(msg.indexOf('要不要') + 2, 10)
        s.reply("不" + subMsg + "?")
        return
    }
    // 不能  返回 能
    if (msg.match(/不要/) != null) {
        let subMsg = msg.substring(msg.indexOf('不要') + 1, 8)
        s.reply(subMsg + "")
        return
    }

    //能返回 不能
    if (msg.match(/要/) != null) {
        let subMsg = msg.substring(msg.indexOf('要') + 1)
        s.reply("不要" + subMsg)
        return
    }


    // 不能  返回 能
    if (msg.match(/会不会/) != null) {
        let subMsg = msg.substring(msg.indexOf('会不会') + 1)
        s.reply("" + subMsg + "?")
        return
    }
    // 不能  返回 能
    if (msg.match(/不会/) != null) {
        let subMsg = msg.substring(msg.indexOf('不会') + 1)
        s.reply(subMsg + "")
        return
    }

    //能返回 不能
    if (msg.match(/会/) != null) {
        let subMsg = msg.substring(msg.indexOf('会') + 1)
        s.reply("不会" + subMsg)
        return
    }

    //能返回 不能
    if (msg.match(/不加班/) != null) {
        s.reply("你必加班!")
        return
    }
    //能返回 不能
    if (msg.match(/加班/) != null) {
        s.reply("加班的是傻B!")
        return
    }
    //能返回 不能
    if (msg.match(/羡慕/) != null) {
        s.reply("不要羡慕,你不会有的~")
        return
    }

    else {
        s.continue()
    }

}

