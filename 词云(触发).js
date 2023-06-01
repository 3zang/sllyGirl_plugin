/**
 * @title 词云(触发)🏄🏻‍♀️
 * @create_at 3033-04-19 14:04:22
 * @rule /see
 * @rule /sync
 * @rule /cls
 * @rule /docron
 * @admin false
 * @rule /lean
 * @rule /delKey
 * @description 发 /see 手动触发 ,每日会自动清理前一天的记录
 * @author 三藏
 * @cron 1,32 18,20 * * *
 * @priority 12
 * @version v1.0.3
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
/**
 *  今天
 */
let dayTime = new Date();//当天时间
let month = ("0" + (dayTime.getMonth() + 1)).slice(-2);//当前月
let curDay = ("0" + dayTime.getDate()).slice(-2); //当前天

/**
 *  昨天
 */
let preDayTime = new Date(dayTime - 24 * 60 * 60 * 1000) //前一天时间
let preMonth = ("0" + (preDayTime.getMonth() + 1)).slice(-2); //可能是当前月 或者是上月
let preDay = ("0" + preDayTime.getDate()).slice(-2);  //前一天


var minutes = dayTime.getMinutes();
var hour = dayTime.getHours()
let platform = s.getPlatform();
let sillyGirl = new SillyGirl()

//当天的key
let dayKey = "_" + month + "_" + curDay;
//前一天的时间
let pre_dayKey = "_" + preMonth + "_" + preDay;

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
    //手动发送key 清理 残余 key
    if (content.match(/\/delKey/)) {
        delKey()
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
        //发言数量
        let db = new Bucket("user_" + chatId + dayKey)
        let dbKeys = db.keys().toString().split(",")
        //处理排序
        rankName = popSort(db, dbKeys)
        let tips = "截至今天 " + hour + ":" + minutes + "分"
        let sendCode = chatId + chatSurfix;
        let allmsgs = []
        //群名
        let groupName = storeGroup.get(chatId);
        //上次的消息大小
        let groupLast = new Bucket("group_msgSize" + dayKey)
        let lastSize = groupLast.get(chatId)
        let total = "本群 " + dbKeys.length + " 位朋友共产生: " + lastSize + " 条发言"
        const wc = new Bucket("word_" + chatId + dayKey)
        let keys = wc.keys().toString().split(",")
        //组装整体消息
        let finamsg = title + "\n" + tips + "\n" + total + "\n" + rank + "\n" + rankName
        console.log("定时匹配到了-----" + groupName + "-----群的" + keys.length + "个消息")
        //获取词云图片
        for (let i = keys.length; i > 0; i--) {
            let msg_1 = wc.get(keys[i])
            allmsgs.push(msg_1)
        }
        let imgUrl = getImage(sendCode, allmsgs.toString())
        //这里默认微信,其他平台自己换,没法分开控制
        //发送提示
        sillyGirl.push({ platform: "wx", userId: "", groupCode: chatId, content: finamsg })
        //发送图片
        sillyGirl.push({ platform: "wx", userId: "", groupCode: chatId, content: image(imgUrl) })
        console.log("发送到群:" + groupName + "的词云分析完成!")
        //清理消息
        allmsgs = []
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
    //处理排序
    rankName = popSort(db, dbKeys)
    let tips = "截至今天 " + hour + ":" + minutes + "分"
    let sendCode = chatId + chatSurfix;
    let groupSizeKey = "group_msgSize" + dayKey  //总消息大小key
    let groupLast = new Bucket(groupSizeKey);
    let allmsgs = []
    //群名
    let groupName = storeGroup.get(chatId);
    //上次的消息大小
    let lastSize = groupLast.get(chatId)
    console.log(groupName + " 群的消息总数为: " + lastSize)
    //词云数组
    let wk = "word_" + chatId + dayKey
    const wc = new Bucket(wk)
    let keys = wc.keys().toString().split(",")
    console.log("获取Key:" + wk + ",大小:" + keys.length)
    let total = "本群" + dbKeys.length + "位朋友共产生: " + keys.length + " 条发言"
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
    groupLast.set(chatId, keys.length)
    console.log("手动触发,发送到群:" + groupName + "的词云分析完成!")
}


/**
 * 冒泡排序
 */

function popSort(db, dbKeys) {
    let userArray = []
    let rankName = ""
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
    //处理格式
    for (let i = 0; i < userArray.length; i++) {
        rankName += "#" + userArray[i].name + " 贡献: " + userArray[i].value + "\n"
    }
    return rankName;

}






/**
 * 清理数据库(昨日)
 */
function cleanWord() {
    for (let i = 0; i < groups.length; i++) {
        let chatId = groups[i]
        // 3 个key
        let wdKey = "word_" + chatId + pre_dayKey //词云key
        let groupSizeKey = "group_msgSize" + pre_dayKey  //总消息大小key
        let userKey = "user_" + chatId + pre_dayKey  //用户消息数量 key
        // 3个 存储
        let wc = new Bucket(wdKey)
        let groupLast = new Bucket(groupSizeKey);
        let userDb = new Bucket(userKey)
        let keys = wc.keys().toString().split(",")
        let groupName = storeGroup.get(chatId)
        let tips = "获取到" + "(" + groupName + ")" + chatId + "的" + keys.length + "个数据,准备清理"
        console.log(tips)
        s.reply(tips + "\n" + "wdKey: " + wdKey + "\n" + "gSizeKey: " + groupSizeKey + "\n" + "userKey: " + userKey)
        wc.deleteAll()//删除聊天记录
        groupLast.deleteAll()//删除指针
        userDb.deleteAll()//删除发言数量统计
        console.log("清理词云信息成功----")
        sleep(2000)
    }
}


/**
 * 清理数据库(今日)
 */
function cleanWordToday() {
    let id = chatId
    const wc = new Bucket("word_" + id + dayKey)
    let groupLast = new Bucket("group_msgSize" + dayKey);
    let keys = wc.keys().toString().split(",")
    console.log("获取到" + chatName + "的" + keys.length + "个数据,准备清理:" + JSON.stringify(keys))
    wc.deleteAll()
    groupLast.deleteAll()
    console.log("清理词云信息成功----")
    s.reply("本群今日的" + keys.length + "个词云数据已清空")
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


/**
 * 删除key
 */
function delKey() {
    s.reply("请输入要清除的Key")
    let inp = s.listen(5000)
    if (inp.getContent()) {
        const key = new Bucket(inp.getContent())
        console.log("key is :" + inp.getContent())
        key.deleteAll()
        s.reply("删除完成...")
    } else {
        s.reply("已超时...")
    }

}
