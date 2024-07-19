/**
 * @title 微博定时⏰❗️
 * @rule 同步老胡
 * @create_at 2023-10-08 21:24:31
 * @description 🐒这个人很懒什么都没有留下。
 * @author 佚名
 * @cron 10,30,50 6-22\/1 * * *
 * @disable true
 * @priority 90000
 * @version v1.0.0
 */
let mod = require("Mod1.0")
let weibo = new Bucket("app_weibo")
const bot =new SillyGirl()
weiboMonitor()
console.log("开始执行微博定时推送服务...")
function weiboMonitor() {
    let userName = "胡锡进"
    let { body } = request({ url: "http://127.0.0.1:9000/weibo/" + encodeURI(userName), method: "get", json: true })
    console.log("获取到:" + userName + "的: " + body.data.length + "条微博数据")
    let data = body.data
    if (data.length == 0) {
        console.log("没有微博数据")
        return
    }
    let current = data[0];
    let time = current.created_at.substring(0, 19).replace(/\ /g, "").replace(/\:/g, "").replace(/\-/g, "")
    let dbTime = weibo.get("sendTime")
    console.log("最后一条微博发送时间:" + dbTime)
    if (time > dbTime) {
        console.log("胡锡进发新微博了...")
        weibo.set("sendTime", time)
        syncGroup(current)
    } else {
        if (s.isAdmin) {
            syncGroup(current)
        } else {
            s.reply("老胡目前没有最新的动态...")
        }

    }

}

function syncGroup(weibo) {
    let xinzang = 43046710939; //我没有三克心脏
    let tbxyj = 34460605013  //投币洗衣机
    let shylc = 19523075294    //::生活就是一个游乐场
    let small = 22915566756 // smallplane
    let xh = 27113710945
    let groups = [tbxyj,xinzang]//
    let desc="#老胡又发微博了\n" + "#发布时间:" + weibo.created_at.substring(5, 19) + "\n"
    let text =  weibo.text;
    let detail ="详情: https://weibo.com/"+weibo.user_id+"/"+weibo.bid
    if (s.getChatId() > 0) {
        sendWeibo(weibo)
    } else {
        groups.forEach(group => { bot.push({ platform: "wx", groupCode: group, content:text+detail})})
    }
}


function sendWeibo(weibo) {
    const chunkSize = 250;
    let text = "#老胡又发微博了\n " + "#发布时间:" + weibo.created_at.substring(5, 19) + "\n" + weibo.text;
    let topics = weibo.topics
    let video_url = weibo.video_url
    let source = weibo.source
    let pics = weibo.pics
    console.log("图片信息:" + pics)
    if (topics) {
        s.reply("#" + "话题:" + topics)
        sleep(2000)
    }
    if (text) {
        const chunks = chunkText(text, chunkSize);
        // 遍历每一个分片并发送
        chunks.forEach((chunk, index) => {
            // 这里模拟发送操作，你可以替换为实际的发送代码
            console.log(`Sending chunk ${index + 1}: ${chunk}`);
            sleep(2000)
            s.reply(`${chunk}`)
        });

    }
    if (video_url) {
        if (s.getPlatform() == "wx") {
            bot.push({ platform: "wx", groupCode: group, content:video(video_url)})
        } else {
            s.reply(video(video_url))
        }
    }
    if (pics) {
        let allpics = pics.split(",")
        if (allpics.length > 0) {
            for (let i = 0; i < allpics.length; i++) {
                console.log("图片: - - - > " + allpics[i])
                if (s.getPlatform() == "wx") {
                    let cid = s.getChatId() + "@chatroom"
                    console.log("群号:" + cid)
                    mod.sendImage(cid, allpics[i])
                } else {
                    s.reply(image(allpics[i]))
                    console.log("*************************")
                }
            }
        } else {
            console.log("只有一个图片文件:")
            if (s.getPlatform() == "wx") {
                mod.sendImage(s.getChatId() + "@chatroom", pics)
            } else {
                s.reply(image(pics))
            }

        }

    }
    sleep(6000)
    if (source) {
        //s.reply("来源:" + source)
    }

}



function chunkText(str, size) {
    let chunks = [];
    let index = 0;
    while (index < str.length) {
        chunks.push(str.substring(index, index + size));
        index += size;
    }

    return chunks;
}