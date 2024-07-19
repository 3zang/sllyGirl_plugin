/**
 * @title 定时马甲⏰❗️
 * @rule /change
 * @create_at 2023-10-08 21:24:31
 * @description 🐒这个人很懒什么都没有留下。
 * @author 佚名
 * @cron 20 9-23\/8 * * *
 * @priority 90000
 * @admin true
 * @disable true
 * @version v1.0.0
 */
const mod = require("Mod1.0")
refresh()
function refresh() {
    const { body } = request({ url: "http://81.70.100.130/api/saohua.php" });
    let chatId="43046710939"
    let nickName=GetChinese(body)
    mod.changeName(chatId,nickName.substr(0,16))
    console.log("新的马甲:"+body)
    s.reply("马甲更新为:"+body)

}

//只提取汉字\u4e00-\u9fa5  韩文\uac00-\ud7ff . 日文 \u0800-\u4e00
function GetChinese(strValue) {
    if (strValue != null && strValue != "") {
        var reg = /[a-zA-Z0-9\u4e00-\u9fa5\uac00-\ud7ff\u0800-\u4e00,，。！？#?:"". /]/g;
        return strValue.match(reg).join("");
    }
    else
        return "";
}
