/**
 * @title 抖音解析🎥
 * @create_at 2100-02-04 12:44:49
 * @rule ^\d\.\d{2}\s[a-zA-Z]{3}:/\s.*$
 * @description 🐒直接抖音复制分享连接 发给机器人 ,整段文本,
 * @author 三藏悠亚
 * @version v1.0.0
 * @priority 100
 */
const sillyGirl = new SillyGirl()
const s = sender
var content = s.getContent()
let api = "http://api.rcuts.com/Video/DouYin.php" //解析接口a
let alt_api = "https://dy.nisekoo.com"   //解析接口b
//指定哪个api
var used_api = api
console.log("开始解析抖音短视频...")
douyinDownload()
function douyinDownload() {
    //提取url正则
    var reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
    var videoUrl = content.match(reg)
    console.log("提取到的url是:" + videoUrl)
    let { body } = request({
        url: used_api,
        method: "post",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "x-requested-with": "XMLHttpRequest"
        },
        body: `url=` + videoUrl,
        json: false
    })
        let result = JSON.parse(body)
        if (result.code == "4") {
            s.reply(result.msg)
        } else {
            //视频url 
            var downUrl = result.video_url[0]
            console.log("视频直链: " + downUrl)
            var title = result.video_name
            s.reply("[让我看看]->抖音正在解析,请稍后...")//等待时间取决于视频时长,可能发送失败
            s.reply(video(downUrl))
            }
            console.log("使用(rcuts)抖音解析发送成功")
        }
}
/**
 * 无效代码
 */
function httpString(s) {
    //var reg = /(https:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
    var reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
    s = s.match(reg);
    return (s)
}

