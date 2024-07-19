/**
 * @title 降级助手
 * @create_at 1023-11-17 10:51:34
 * @description 🐒这个人很懒什么都没有留下
 * @author 佚名
 * @version v1.0.0
 * @rule 查历史
 * @priority 50
 * @rule /query
 */


let content = s.getContent()
let userName = s.getUserName()
if (content.match(/start/)) {
    tips()
}

if (content.match(/查历史/)) {
    queryAppHistory()
}

function tips() {
    s.reply("您好!,欢迎使用此机器人!,本机器人收录了大部分软件的历史版本号,可能有部分版本缺失,自行在你想要的版本号加减版本")
}

function queryAppHistory() {
    let appName = ""
    sleep(1000)
    s.reply("请在20秒内输入应用名称:")
    let inp = s.listen(20000)
    if (inp != null) {
        appName = inp.getContent()
    } else {
        s.reply("已超时..")
    }
    let appleUrl = "https://itunes.apple.com/search?term=" + appName + "&country=cn&entity=software&explicit=no&limit=5"
    let { body } = request({ url: appleUrl, method: "get", json: true })
    let data = body.results;
    let trackName = ""
    let trackId = ""
    for (let i = 0; i < data.length; i++) {
        trackName = data[i].trackName
        trackId = data[i].trackId;
        if (trackName.match(appName)) {
            break;
        }
    }
    if (trackName != null) {
        console.log("开始查询==>" + trackName + "的历史版本号")
        queryBytrackId(trackId, trackName)
    } else {
        s.reply("没有找到应用!")
    }

}

function queryBytrackId(trackId, appName) {
    let appUrl = "https://api.timbrd.com/apple/app-version/index.php?id=" + trackId
    let { body } = request({ url: appUrl, method: "get", json: true })
    let max = body.length - 1
    if (body) {
        let lasest = body[body.length - 1]
        let recent = "#最近的五个版本号是:\n"
        for (let i = max - 5; i < body.length; i++) {
            recent += "- " + body[i].bundle_version + " -> " + body[i].external_identifier + "\n"
        }
        s.reply("找到:#" + appName + " 的 " + body.length + " 条历史记录,\n#最新的版本号是: " + lasest.bundle_version + "\n#发布日期: " + lasest.created_at + "\n" + recent)
    }
    sleep(2000)
    s.reply("请在100秒内回复你想降级的版本号,格式如: " + body[body.length - 1].bundle_version)
    let inp = s.listen(100000)
    let version = ""
    if (inp != null) {
        version = inp.getContent()
    } else {
        s.reply("已超时..")
        return
    }
    let dbversion = ""
    let versionId = ""
    for (let i = 0; i < body.length; i++) {
        dbversion = body[i].bundle_version
        if (version == dbversion) {
            versionId = body[i].external_identifier;
            s.reply("应用名: "+appName + "-" + version + "\n版本ID: " + versionId + "\n请自行通过降级工具下载")
            break;
        }
    }
    if (versionId.length < 1) {
        s.reply("没有找到: " + version + " 对应的版本ID")
    }
    let notifyUrl = "http://192.168.0.47:8080/down-notify"
    let req = { "name": appName,"version":version }
    let res = request({ url: notifyUrl, method: "post", json: true, body: req })

}