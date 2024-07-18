/**
 * @title 天眼查
 * @create_at 1023-04-21 10:19:28
 * @rule /tyc ?
 * @description 🐒这个人很懒什么都没有留下。
 * @author 三藏
 * @priority 50
 * @version v1.0.0
 */

const mod = require("Mod1.0")
let sendTimes = [30, 0];
let chatSurfix = "@chatroom"
let xinzang = 24341650374; //我没有三克心脏
let test = 27113710945    //小号交流
let tbxyj = 34509359404  //投币洗衣机
let shylc = 19523075294    //::生活就是一个游乐场
let pter = 17470333368     //::电影丨PT 丨NAS  ②
let small = 22915566756 // smallplane
let groups = [xinzang, test, tbxyj, shylc, pter, small]
const s = sender
var content = s.getContent()
let chatId = s.getChatId();
let chatName = s.getChatName();
var minutes = new Date().getMinutes();
var hour = new Date().getHours()
let storeGroup = new Bucket("listenGroup");

let token = Bucket("tyc")
let companyName = s.param(1);
//API

let base = "http://open.api.tianyancha.com/";
function tianYan() {

}

baseInfo()
/**
 * 基本工商信息
 */
function baseInfo() {

    if(!s.isAdmin()){
        s.reply("已关闭查询了,叼毛")
        return
    }
    s.reply("正在查询："+companyName+" 的企业信息...")
    sleep(10000)
    let ret = ""
    let { body } = request({
        url: base + "services/open/ic/baseinfoV2/2.0?keyword=" + encodeURI(companyName),
        method: "get",
        json: true,
        headers: {
            "Authorization": token,
            "Host": "open.api.tianyancha.com"
        }

    })

    console.log("天眼查请求" + base + "services/open/ic/baseinfoV2/2.0?keyword=" + companyName)
    console.log("天眼查响应： " + JSON.stringify(body))
    let msg = body.result
    let errCode =body.error_code
    if(errCode==300000){
        s.reply("无 "+companyName+" 数据,建议补全公司全名")
        return
    }
    ret = ret + "企业状态：" + msg.regStatus + "\n"
        + "注册资本：" + msg.regCapital + "\n"
        + "企业地址：" + msg.city + "\n"
        + "企业行业：" + msg.industry + "\n"
        + "法人名称：" + msg.legalPersonName + "\n"
        + "信用代码：" + msg.creditCode + "\n"
        + "注册机构：" + msg.regInstitute + "\n"
        + "注册地址：" + msg.regLocation + "\n"
        + "商业范围：" + msg.businessScope + "\n"

    s.reply(ret)
    sleep(3000)
    s.reply("是否继续查询？,请输入：是/否 ")
    let inp = s.listen(10 * 1000)
    if (inp != null) {
        s.reply("还没开发完...")
    } else {
        //s.reply("超时了...")
    }


}

/**
 * 体脂秤数据
 */
function bodyData() {
    let url = "https://lsprod3.laisitech.com/balance/share/h5/data/share?memberId=1084828&measureId=99846917&userId=10077183"
    let { body } = request({
        url: url,
        method: "get",
        json: true,
        headers: {
            "Host": "lsprod3.laisitech.com"
        }

    })

    let data = body.data
    let errCode = body.code
    if (errCode != 0) {
        s.reply("历史体重查询失败!")
        return
    }
    let createTime = data.createTime
    let weight = data.weight
    ret = "当前体重: " + weight + "Kg" + "\n" + "记录时间: " + createTime
    s.reply(ret)
}