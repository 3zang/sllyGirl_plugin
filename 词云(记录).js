/**
 * @title 词云(记录)👨‍👩‍👧‍👧
 * @create_at 3033-04-19 14:04:23
 * @rule 词云统计
 * @rule raw ([\s\S]*)
 * @rule wc
 * @rule /ban ?
 * @rule /todo
 * @description 🐒 在群 发 /todo 开启该群 消息 记录  
 * @platform wx qq
 * @author 三藏
 * @priority 5
 * @disable false
 * @version v1.0.0
 */
const sillyGirl = new SillyGirl()
const s = sender
let word = s.param(1)
var content = s.getContent()
let chatId = s.getChatId();
let chatName = s.getChatName();
let userId = s.getUserId()
//获取配置的群
let storeGroup = new Bucket("listenGroup");
let groupIds = storeGroup.keys().toString().split(",")
let groups = []
for (let i = 0; i < groupIds.length; i++) {
    groups.push(parseInt(groupIds[i]))
}
let groupName = storeGroup.get(chatId);
let userName = s.getUserName()
let platform = s.getPlatform()
//当天的时间
let dayKey = "_" + (new Date().getMonth() + 1) + "_" + new Date().getDate();

init()

function init() {
    if (content.match(/ban/) != null) {
        banWords()
    }
    if (content.match(/todo/)) {
        setGoupName()
    }
    if (content.match(/reply/) || content.match(/listen/)) {
        s.continue
    } else {

        wordCloud()
    }

}

function wordCloud() {
    if (chatId != 0 && groups.includes(chatId)) {
        //xml消息
        if (content.indexOf("<?xml version=") != -1) {
            console.log("词云收到XML类信息不保存: xml Msg")
            return
        }
        if (content.match(/AV/) != null) {
            s.reply("本群: " + groupName + " 已禁止记录AV")
            return
        }
        if (content.match(/胖虎/) != null) {
            s.reply("本群: " + groupName + " 已禁止记录->胖虎")
            return
        }
        //@类消息
        else if (content.match(/at=/) != null) {
            console.log("词云收到@类信息不保存: " + content)
            return
        } else {
            //console.log("####词云收到" + chatName + "消息:" + content)
            saveMsg()
        }
    }
    else {
        s.continue()
    }
}
/**
 * 储存消息
 */
function saveMsg() {
    let key = "word_" + chatId + dayKey //消息记录
    let userKey = "user_" + chatId + dayKey  //用户消息数量
    let wc = new Bucket(key)
    let uKey = new Bucket(userKey)
    var now = time.now()
    const ban = new Bucket("ban_words")
    let banArray = ban.keys()
    let banKeys = banArray.toString().split(",")
    for (let i = 0; i < banKeys.length; i++) {
        if (content.match(banKeys[i]) != null) {
            content = content.replace(banKeys[i])
            console.log("------词云记录不存储违禁词汇: " + banKeys[i])
            s.reply("本群已禁止记录:" + banKeys[i])
        }
    }
    if (content == "undefined") {
        console.log(groupName + "-词云消息存储失败,包含违禁词: " + content)
    } else {
        wc.set(now.unixMilli(), content)
        let curIndex = uKey.get(userName)
        console.log("当前用户" + userName + "的数量--->" + curIndex + "条消息")
        if (curIndex == null) {
            userName.replace(",", "");
            wc.set(userName, 1)
        } else {
            curIndex++
            uKey.set(userName, curIndex)
            console.log(platform + "---##" + userName + "的消息数量为：" + curIndex)
        }
        console.log(platform + "---##" + groupName + "-词云消息存储成功: " + userName + " : " + content + ",key: " + key)
    }

}

/**
 * 禁止记录词汇
 */
function banWords() {
    const ban = new Bucket("ban_words")
    var now = time.now()
    if (s.isAdmin()) {
        word =word.replace("/ban","")
        word=word.replace(" ","")
        ban.set(word, now.unixMilli())
        s.reply(`"`+word +` "` + " 已禁止记录.")
    } else {
        s.reply("小叼毛,禁止操作")
    }
}

/**
 * 开启记录
 */
function setGoupName() {
    const gName = new Bucket("listenGroup")
    if (chatId > 0) {
        gName.set(chatId, chatName)
        console.log("开始记录群名:" + chatId + "::" + chatName)
        s.reply("已为此群开启词云分析")

    }

}
