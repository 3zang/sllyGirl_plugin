/**
 * @title 基金加仓榜
 * @create_at 2022-10-14 14:10:40
 * @rule 加仓
 * @description 🐒这个人很懒什么都没有留下。
 * @author 佚名
 * @version v1.0.0
 */
const s = sender


flushIp()
/**
 * 刷新ip
 */
function flushIp() {
    const auth = "mwxapp:977566e3-2d21-454d-954d-1b43c85325ab"//不变
    //42b19a859f78a3b40661bd8d5676e212
    const sign = "f4762ce170c049ed450f43d0179b972b"
    //1665727129
    const timeStamp = "1665977056"
    /**
     * /fund_buy_ranking  //买入
     * /fund_hold_ranking  //持有
     * /fund_sell_ranking  //卖出
     */
    var fund_buy_ranking = "/fund_buy_ranking"  //买入
    var fund_hold_ranking = "/fund_hold_ranking"  //持有
    var fund_sell_ranking = "/fund_sell_ranking"   //卖出
    var tab = fund_buy_ranking //持有

    let msg = "#养鸡宝今日基金加仓榜：\n"
    // Bucket set 设置值
    console.log(" 获取排行榜")
    let { body } = request({
        url: "https://wxapp-api.yangjibao.com" + tab + "?page=1&per_page=50",
        method: "get",
        headers: {
            "Authorization": auth,
            "Request-Sign": sign,
            "Request-Time": timeStamp
        }

    })

    console.log("基金响应数据是:" + JSON.stringify(body))
    let foundData = JSON.parse(body).data.list
    let time = "生成时间：" + JSON.parse(body).data.time + "\n"
    let data = ""
    for (let i = 0; i < 10; i++) {
        data += "[" + (i + 1) + "]. " + foundData[i].name.substr(0, 5) + "*****" + " 代号：" + foundData[i].code + "\n"
    }

    s.reply(msg + data + time)
}