/**
 * @title 词云(触发)🏄🏻‍♀️
 * @create_at 3033-04-19 14:04:22
 * @rule /see
 * @rule /sync
 * @rule /cls
 * @rule /docron
 * @admin false
 * @rule /lean
 * @description 发 /see 手动触发 ,每日会自动清理前一天的记录
 * @author 三藏
 * @cron 1,32 18,20 * * 1-5
 * @priority 12
 * @version v1.0.1
 */

let storeGroup = new Bucket("listenGroup");
let groupIds = storeGroup.keys().toString().split(",")
let groups = []
for (let i = 0; i < groupIds.length; i++) {
    groups.push(parseInt(groupIds[i]))
}
let chatSurfix = "@chatroom"
const s = sender
var content = s.getContent()
let chatId = s.getChatId();
let chatName = s.getChatName();
var minutes = new Date().getMinutes();
var hour = new Date().getHours()
let platform = s.getPlatform();
let sillyGirl = new SillyGirl()
let month = new Date().getMonth() + 1
let curDay = new Date().getDate()
//当天的key
let dayKey = "_" + month + "_" + curDay;
//前一天的时间
let pre_dayKey = "_" + (new Date().getMonth() + 1) + "_" + (new Date().getDate() - 1);


main()
/**
 * 入口函数
 */
function main() {
    if (content.match(/see/)) {
        console.log("开始推送词云信息----")
        getChatIDMsg()
        return
    }
    //晚上8点分析  或者手动触发
    if (content.match(/docron/) || hour == 20) {
        cronTask()
        return
    }
    //手动清理  或定时清理
    if (content.match(/lean/) || (hour == 9 && minutes < 5)) {
        console.log("开始清理词云信息----")
        cleanWord()
    }
    //清理当天的消息
    if (content.match(/cls/)) {
        cleanWordToday()
        return
    }
}
/**
 * 定时任务
 */
function cronTask() {
    console.log("定时任务监控了:" + groups.length + "个群聊")
    for (let i = 0; i < groups.length; i++) {
        let chatId = groups[i]
        let title = "#今日话题词云" + month + "月" + curDay + "日"
        let rank = "---活跃用户排行榜---"
        let rankName = ""
        //发言数量
        let db = new Bucket("user_" + chatId + dayKey)
        let dbKeys = db.keys().toString().split(",")
        let userArray = [];
        //统计每个人发言数量
        for (let i = 0; i < dbKeys.length; i++) {
            let obj = {}
            obj["name"] = dbKeys[i]
            obj["value"] = parseInt(db.get(dbKeys[i]))
            if (obj.name.length > 0) {
                userArray.push(obj)
            }
        }
        //冒泡排序
        var max = userArray.length - 1
        for (let j = 0; j < max; j++) {
            var done = true
            for (let i = 0; i < max - j; i++) {
                if (userArray[i].value < userArray[i + 1].value) {
                    let temp = userArray[i];
                    userArray[i] = userArray[i + 1];
                    userArray[i + 1] = temp;
                    done = false
                }
            }
            if (done) {
                break
            }
        }
        //成员>5只取5个
        if (userArray.length > 5) {
            userArray = userArray.slice(0, 5);
        }
        for (let i = 0; i < userArray.length; i++) {
            rankName += "#" + userArray[i].name + " 贡献: " + userArray[i].value + "\n"
        }
        let tips = "截至今天 " + hour + ":" + minutes +"分"
        let sendCode = chatId + chatSurfix;
        let groupLast = new Bucket("group_" + chatId + dayKey);
        let allmsgs = []
        //群名
        let groupName = storeGroup.get(chatId);
        //上次的消息大小
        let lastSize = groupLast.get("lastSize")
        let total = "本群 " + dbKeys.length + " 位朋友共产生: " + lastSize + " 条发言"
        const wc = new Bucket("word_" + chatId + dayKey)
        let keys = wc.keys().toString().split(",")
        if (keys.length <= lastSize || keys.length == 1) {
            console.log("-----" + groupName + "-----最近没人说话,未产生新的消息.....")
            s.reply("最近一分钟没有产生新消息..")
            continue
        }

        //组装整体消息
        let finamsg = title + "\n" + tips + "\n" + total + "\n" + rank + "\n" + rankName
        console.log("定时匹配到了-----" + groupName + "-----群的" + keys.length + "个消息")

        //获取词云图片
        for (let i = keys.length; i > 0; i--) {
            let msg_1 = wc.get(keys[i])
            allmsgs.push(msg_1)
        }
        let img = getImage(sendCode, allmsgs.toString())

        if (keys.length <= lastSize || keys.length == 1) {
            console.log(groupName + "定时任务最近没人说话,未产生新的消息.....")
        } else {

            //这里默认微信,其他平台自己换,没法分开控制
            //发送提示
            sillyGirl.push({ platform: "wx", userId: "", groupCode: chatId, content: finamsg })
            //发送图片
            sillyGirl.push({ platform: "wx", userId: "", groupCode: chatId, content: image(img) })
            console.log("发送到群:" + groupName + "的词云分析完成!")
        }
        //清理消息
        allmsgs = []
        groupLast.set("lastSize", keys.length)
        sleep(10000)
    }

}
/**
 * 获取对应群聊的id
 */
function getChatIDMsg() {
    let title = "#今日话题词云" + month + "月" + curDay + "日"
    let rank = "---活跃用户排行榜---"
    let rankName = ""   //用户发言 示例
    //发言数量
    let db = new Bucket("user_" + chatId + dayKey)
    let dbKeys = db.keys().toString().split(",")
    let userArray = [];
    //统计每个人发言数量
    for (let i = 0; i < dbKeys.length; i++) {
        let obj = {}
        obj["name"] = dbKeys[i]
        obj["value"] = parseInt(db.get(dbKeys[i]))
        if (obj.name.length > 0) {
            userArray.push(obj)
        }
    }
    //冒泡排序
    var max = userArray.length - 1
    for (let j = 0; j < max; j++) {
        var done = true
        for (let i = 0; i < max - j; i++) {
            if (userArray[i].value < userArray[i + 1].value) {
                let temp = userArray[i];
                userArray[i] = userArray[i + 1];
                userArray[i + 1] = temp;
                done = false
            }
        }
        if (done) {
            break
        }
    }
    //成员>5只取5个
    if (userArray.length > 5) {
        userArray = userArray.slice(0, 5);
    }
    for (let i = 0; i < userArray.length; i++) {
        rankName += "#" + userArray[i].name + " 贡献: " + userArray[i].value + "\n"
    }
    let tips = "截至今天 " + hour + ":" + minutes +"分"
    let sendCode = chatId + chatSurfix;
    let groupLast = new Bucket("group_" + chatId + dayKey);
    let allmsgs = []
    //群名
    let groupName = storeGroup.get(chatId);
    //上次的消息大小
    let lastSize = groupLast.get("lastSize")
    let total = "本群" + dbKeys.length + "位朋友共产生:" + lastSize + "条发言"


    //词云数组
    let wk = "word_" + chatId + dayKey

    const wc = new Bucket(wk)
    let keys = wc.keys().toString().split(",")
    console.log("获取Key:" + wk + ",大小:" + keys.length)
    if (keys.length <= lastSize || keys.length == 1) {
        console.log("-----" + groupName + "-----最近没人说话,未产生新的消息.....")
        s.reply("最近一分钟没有产生新消息..")
        return
    }


    let finamsg = title + "\n" + tips + "\n" + total + "\n" + rank + "\n" + rankName


    console.log("手动触发,匹配到了-----" + groupName + "-----群的" + keys.length + "个消息")

    //获取词云数据
    for (let i = keys.length; i > 0; i--) {
        let msg_1 = wc.get(keys[i])
        allmsgs.push(msg_1)
    }
    let imgUrl = getImage(sendCode, allmsgs.toString())
    //WX通知群友
    s.reply(finamsg)
    s.reply(image(imgUrl))
    groupLast.set("lastSize", keys.length)
    console.log("手动触发,发送到群:" + groupName + "的词云分析完成!")
}

/**
 * 清理数据库
 */
function cleanWord() {
    for (let i = 0; i < groups.length; i++) {
        let chatId = groups[i]
        const wc = new Bucket("word_" + chatId + pre_dayKey)
        let groupLast = new Bucket("group_" + chatId + pre_dayKey);
        let userDb = new Bucket("user_" + chatId + pre_dayKey)
        let keys = wc.keys().toString().split(",")
        let groupName= storeGroup.get(chatId)
        let tips ="获取到" +"("+ groupName+")"+chatId + "的" + keys.length + "个数据,准备清理"
        console.log(tips)
        s.reply(tips)
        wc.deleteAll()//删除聊天记录
        groupLast.deleteAll()//删除指针
        userDb.deleteAll()//删除发言数量统计
        console.log("清理词云信息成功----")
    }
}


/**
 * 清理数据库
 */
function cleanWordToday() {
    let id = chatId
    const wc = new Bucket("word_" + id + dayKey)
    let groupLast = new Bucket("group_" + id + dayKey);
    let keys = wc.keys().toString().split(",")
    console.log("获取到" + chatName + "的" + keys.length + "个数据,准备清理:" + JSON.stringify(keys))
    wc.deleteAll()
    groupLast.deleteAll()
    console.log("清理词云信息成功----")
    mod.sendText(id, "本群今日的" + keys.length + "个词云数据已清空")
}

/**
 * 没有合适的API地址 以下地址是我的 ,反代的 很慢
 */
function getImage(groupCode, words) {
    console.log("开始获取图片,群号:" + groupCode)
    let { body } = request({
        url: "http://webapi.fillme.ml",
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "content=" + words + "&groupCode=" + groupCode,
        json: false

    })

    console.log("词云响应" + body)
    return body

}



