/**
 * @title 定时发圈⏰❗️
 * @create_at 2023-10-08 21:24:33
 * @rule /toMoment
 * @rule /like
 * @rule sendTime
 * @description 🐒这个人很懒什么都没有留下。
 * @cron 0 9 * * *
 * @author 佚名
 * @priority 100000
 * @disable true
 * @version v1.0.0
 */
let mod = require("Mod1.0")

let time = new Date()
let hour = time.getHours()
let day = time.getDay()
main()
function main() {
    if (s.getContent().match(/sendTime/) || (hour == 9 && day % 7 == 0)) {
        //朋友圈进度
        timeDistance()
    } else {
        getMoments()
    }

}



function getMoments() {
    let body = mod.getMoments();
    let pyqs = body.ReturnJson.pyq_list
    //console.log("朋友圈:"+JSON.stringify(pyqs))
    let ids = []
    let msg = "点赞了:\n"
    pyqs.forEach(p => {

        let obj = p.object
        let content = obj.substr(obj.indexOf("<contentDesc>") + 13, obj.indexOf("</contentDesc>") - 133)
        if (content.length > 0) {
            //console.log("内容:" + content)
            msg += p.nickname + ": " + content + "\n"
        }

    })
    pyqs.forEach(p => ids.push(p.pyq_id))
    //console.log("IDS:" + JSON.stringify(ids))
    ids.forEach(i => mod.likeMoments(i))
    s.reply(msg)
    return body
}

/**
 * 年进度条他
 */

function timeDistance() {
    let month = new Date().getMonth() + 1
    let emoji = "+"// ▓
    let monthEmoji
    for (let i = 1; i < (new Date().getMonth() + 1) / 2; i++) {
        emoji = emoji + "+"
        monthEmoji = emoji + "++----"
    }
    let curYear = new Date(new Date().getFullYear() + "-01-01").getTime()//本年
    var now = new Date().getTime();
    //总毫秒 ÷ 一天的毫秒
    let passDay = ((now - curYear) / 86400000).toFixed(0)
    let fullDay = 365
    let lastDayMonth = getLastDay(new Date().getFullYear(), new Date().getMonth() + 1)
    let yearRate = " " + ((passDay / fullDay) * 100).toFixed(2) + "%"
    let monthRate = " " + ((new Date().getDate() / lastDayMonth) * 100).toFixed(2) + "%"
    let tips = "#当前时间: " + month + "月" + new Date().getDate() + "日" + "\n" + "#本年已经过去: " + passDay + "天\n"
    let msg = tips + "#本年进度:" + emoji + "----" + yearRate + "\n" + "#本月进度:" + monthEmoji + monthRate
    console.log(msg)
    mod.sendMoments_Txt("", msg)
    mod.sendText("wxid_0w5gogf4wa0k12", msg)
    s.reply(msg)
}




function getLastDay(year, month) {
    const date1 = new Date(year, month, 0)
    return date1.getDate()
}