/**
 * @title 随机骂人❗️
 * @create_at 2023-12-09 19:55:30
 * @create 2023-06-14 21:47:12
 * @description 当群友@人的时候触发。
 * @author 佚名
 * @version v1.0.0
 * @rule raw (at=|骂|lucky|彩虹屁)
 * @cron 0 8 * * *
 * @rule 脏话
 * @priority 12000
 * @disable true
 */

let name = s.param(1)
let mod = require("Mod1.0")
let base = require("Mod4.0")
let chatId = s.getChatId() + "@chatroom"
let botId = "wxid_w4cd5q07fiwy12"
let words = base.hello()
let date = new Date()
let miniutes = date.getMinutes()
let hour = date.getHours();
let at_user = s.getContent()
let follow_id = at_user.substr(at_user.indexOf("at=") + 3, at_user.indexOf("]") - 4)
console.log("群友艾特的用户: " + follow_id)
main()


/**
 * 彩虹屁
 */
function rainBow() {

    let { body } = request({ url: "https://api.shadiao.pro/chp",method:"get" ,json:true})

    console.log("彩虹屁响应:"+body.data.text)
    let text =body.data.text
    let user =randomUser()
    let wx_id =user.wx_id
    let req={}
    req.wx_id=wx_id
    req.msg=text
    req.groupCode=chatId
    mod.sendMsgAt(req)

}


function main() {
    let con = s.getContent()
    if (con.match(/骂/) || con.match(/at=/)) {
        sleep(20 * 1000)
        atUser(follow_id)
        //3 选一
        sayHello()
    }
    if (con.match(/lucky/) || hour == 8) {
        luckBoy("lucky")
    }
    if (con.match(/彩虹屁/)) {
        rainBow()
    }
}
function sayHello() {
    let req = {}
    if (!mod.checkspeak()) {
        console.log("骂人暂时禁用....")
        return null
    }
    if (!mod.coolDown("sayHello")) {
        return null
    }
    if (miniutes % 7 == 0) {
        req = luckyUser()
        console.log("开始幸运骂一个群友~" + "用户:" + req.nickname + "," + req.msg)
    } else if (miniutes % 8 == 0) {
        req = followUser()
        console.log("开始跟随骂一个群友~" + "用户:" + req.nickname + "," + req.msg)
    } else if (miniutes % 9 == 0) {
        req = randomUser()
        console.log("开始随机骂一个群友~" + "用户:" + req.nickname + "," + req.msg)
    }
    //mod.sendMsgAt(req)
    rainBow()
}

/**
 * 是否艾特机器人 ? 是 就 骂回去
 */

function atUser(wx_id) {
    let req = {}
    req["wx_id"] = wx_id;
    req["groupCode"] = s.getChatId() + "@chatroom";
    if (wx_id == botId) {
        req.wx_id = s.getUserId();
        req.msg = " 你个吊毛!"
        //mod.sendMsgAt(req)
    }

}

function luckBoy(type) {
    if (mod.checkspeak() == false) return
    //检查冷却
    if (mod.coolDown(type) == false) return
    let luck = new Bucket("luck_boy")
    let chatIds = [34509359404, 19523075294, 12383218606, 27113710945, 34460605013, 43046710939]
    chatIds.forEach(id => {
            if (s.getChatId() == id) {
                let cId = id + "@chatroom";
                let user = getUserBy(cId)
                console.log("选择的用户:" + JSON.stringify(user))
                luck.set(cId, JSON.stringify(user))
                const curValue = new Date().getTime() + 1800000
                luck.set(s.getChatId() + "_next", curValue)
                let tips = "幸运用户是: #" + user.nickname
                s.reply(image(user.avatar))
                let req = {}
                req["wx_id"] = user.wxid;
                req["groupCode"] = cId
                req["msg"] = ",恭喜你成为今天的幸运用户!"
                mod.sendMsgAt(req)
            } else {
                console.log("暂不处理:" + id)
            }
        }
    )


}

function getUserBy(chatId) {
    let res = mod.getGroupUser(chatId)
    let r = []
    let members = res.ReturnJson.member_list
    console.log(JSON.stringify(members))
    members.forEach(m => {
        if (m.wxid != "cuiyanchao18") {
            r.push(m)
        }
    })
    var filtered = r.filter(function (value, index, arr) { return value.wxid != "wxid_w4cd5q07fiwy12"; });
    //console.log("移除后:" + JSON.stringify(filtered))
    let index = Math.round(Math.random() * (filtered.length))
    //console.log("骂人完成~"+JSON.stringify(members))
    let randomUser = members[index];
    console.log("INDEX:" + index + ",User:" + JSON.stringify(randomUser))
    return randomUser;
}
/**
 * 随机用户
 */

function randomUser() {
    let res = mod.getGroupUser(chatId)
    let members = res.ReturnJson.member_list
    let index = Math.round(Math.random() * (members.length))
    let randomUser = members[index];
    let wx_id = randomUser.wxid;
    let nickname = randomUser.nickname;
    console.log("随机选择用户：" + nickname)
    let msg = words[Math.round(Math.random() * 2000)]
    let req = {}
    req["wx_id"] = wx_id;
    req["groupCode"] = chatId
    req["msg"] = msg
    req["nickname"] = nickname
    return req
}
/**
 * 幸运用户
 */

function luckyUser() {
    let luck = new Bucket("luck_boy")
    let msg = words[Math.round(Math.random() * 2000)]
    let wxStr = luck.get(chatId)
    let user = JSON.parse(wxStr)
    console.log("获取Lucky用户: " + user.nickname)
    wx_id = user.wxid
    console.log("WX_ID: " + wx_id)
    let req = {}
    req["wx_id"] = wx_id;
    req["groupCode"] = chatId
    req["msg"] = msg
    req["nickname"] = user.nickname
    return req
}
/**
 * 跟随用户
 */
function followUser() {
    console.log("跟随骂人:" + follow_id)
    let msg = words[Math.round(Math.random() * 2000)]
    let req = {}
    req["wx_id"] = follow_id;
    req["groupCode"] = chatId
    req["msg"] = msg
    req["nickname"] = follow_id
    return req
}











