/**
 * @title ip变化🔃
 * @create_at 2099-10-08 21:24:43
 * @rule /ip
 * @rule /flush
 * @description 🐒这个人很懒什么都没有留下。 flush 是用于实时刷新
 * @author 三藏悠亚
 * @version v1.0.0
 * @cron 0 *\/4 * * *
 */

//0 0,4,8,12,16,20 * * *
// Bucket 存储器
const ipChange = new Bucket("ipchange")
const sillyGirl = new SillyGirl()
const s = sender
var content = s.getContent()
var now = time.now()
var timeStr = now.string().substr(0, 19);
if (content.match(/ip/) != null) {
    console.log("开始获取最近几次ip变化:")
    pushMsg()
} else {
    flushIp()
}

/**
 * 刷新ip
 */
function flushIp() {
    var ip_url="http://4.ipw.cn"   //  http://phus.lu/server/ip.php
    var regxp = /(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))/
    // Bucket set 设置值
    console.log(timeStr + " 开始刷新ip")
    let { body } = request({
        url: ip_url,
        method: "get",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }

    })
    //var test = "1.80.168.18 China Xi'an China Telecom SHAANXI Cable/DSL China Xi'an China Telecom SHAANXI Cable/DSL"
    //var curIP = body.substr(0, 12).trim().replace(/\./g, '-')

    var ipResult = body.match(regxp)
    if (ipResult) {
        var curIP = ipResult[0].replace(/\./g, '-')
        console.log("当前ip是:" + curIP)
        ipChange.set(curIP, timeStr)
        delOldData()
    } else {
        console.log("获取到了ipv6,不进行存储")
    }


}
/**
 * 删除多余数据
 */
function delOldData() {
    let keys = ipChange.keys().toString().split(",")
    if (keys.length < 300) {
        console.log("当前数据不足10条,不删除")
        return
    } else {
        for (let i = 0; i < keys.length - 10; i++) {
            console.log("开始删除10次之前的数据:" + keys[i])
            ipChange.delete(keys[i])
        }
    }
}
/**
 * 推送消息
 */
function pushMsg() {
    let keys = ipChange.keys().toString().split(",")
    //console.log(keys.toString())
    let timestamp = []
    let iparray = []
    let ip = "本监控已存储" + keys.length + "次IP变化\n本宽带最近10次ip变化为:\n"
    for (let i = 0; i < keys.length; i++) {
        let obj = {}
        //ip += "[" + (i + 1) + "]. " + ipChange.get(keys[i]) + "  " + keys[i].replace(/\-/g, '.') + '\n'
        obj["ip"] = keys[i].replace(/\-/g, '.')
        obj["time"] = ipChange.get(keys[i])
        iparray.push(obj)
        timestamp.push(ipChange.get(keys[i]))
    }

    //sillyGirl.push({platform: "tg",userId:"275642085",content: ip})
    timestamp.sort()
    //console.log("时间数组" + JSON.stringify(timestamp))
    iparray.sort((a, b) => {
        const timeA = a.time; // ignore upper and lowercase
        const timeB = b.time; // ignore upper and lowercase
        if (timeA < timeB) {
            return -1;
        }
        if (timeA > timeB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
    // console.log("ip对象" + JSON.stringify(iparray))
    var finalArray = []
    var length = iparray.length
    //只取后10个
    for (let i = length; i > 10; i--) {
        let obj = iparray[i - 1]
        //console.log("当前遍历:" + JSON.stringify(obj))
        //ip += "[" + (i) + "]." + obj.time + " " + obj.ip + '\n'
        finalArray.push(obj)
    }
    //console.log("ip对象" + JSON.stringify(finalArray))

    //后10个排序一下
    finalArray.sort((a, b) => {
        const timeA = a.time; // ignore upper and lowercase
        const timeB = b.time; // ignore upper and lowercase
        if (timeA < timeB) {
            return -1;
        }
        if (timeA > timeB) {
            return 1;
        }

        // names must be equal
        return 0;
    });
    for (let i = finalArray.length - 10; i < finalArray.length; i++) {
        let obj = finalArray[i]
        //console.log("当前遍历:" + JSON.stringify(obj))
        ip += "[" + (i + 11) + "]." + obj.time + " " + obj.ip + '\n'   //.replace("1.80","1.x")

    }
    s.reply(ip)
    console.log(ip)
    //delOldData()
}


