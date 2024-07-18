/**
 * @title 西瓜微信❗️
 * @origin 傻妞官方
 * @on_start true
 * @create_at 1023-11-22 14:21:00
 * @description 👠It‘s a simple adapter of xYo_httpApi_WeChat.
 * @author Leechee
 * @version v0.0.4
 * @public false
 * @icon https://cdn5.telegram-cdn.org/file/ZNlUp3XoWGujI1_QwzOXcG_Tv6THZ0ATvafqHcJR0eUF6w53uWF_9BsgKhyOKWy0tQDWmDZ4ugDdGsWLkQ_JjwjUzxyjDP35RtQj7he0r0wBSF1pGpPr5I1iRcoxl6QoKC3DqOB4YA7B1rbC2NX_R4rroZRTD6VdfA7q285mE8dNKfxpw9e359B8DehlLx2evANHQm4gdKfb6iZ6HTVVoms-vWMS-e7zmHi-OY_BbPINg48ltrvGZ3B2BKjvkAIEF7L0ZDjk19OzLEBl5Su2lzkgLZEtz_O7NvVm5NxC25vs1zlujCqL7FJSh0o54FVCjni4d0XTamAObJ-k4HKifQ.jpg
 * @disable true
 */

//🧧🧧🧧 自行将第十行 disable true 改为 false

const wechat = new Sender("wx")
const server = require("express")
const wx = new Bucket("wx")
let addr = wx.get("xyo_addr", "http://192.168.1.4:4321");//🧧 设置xyo地址，指令：set wx xyo_addr ?
let token = wx.get("xyo_token");//🧧 设置xyo鉴权，指令：set wx xyo_token ?
let sddr = wx.get("xyo_sddr");//此处设置xyo远程处理接口，如果不设置会可能会无法处理来自QQ服务器的图片，指令：set wx xyo_sddr ?
let wxid = wx.get("xyo_wxid");//设置机器人wxid，自动设置
let suffix = "@chatroom"
let qy = "R:"
const cq = require("CQ码")
let mod = require("Mod1.0")

//🧧 请在XYO配置远程处理接口 http://傻妞地址:端口/bot/xyo
server.post("/bot/xyo", function (req, res) {
    const params = req.json()
    if (!wxid && params.content.robot_wxid != wxid) {//
        wxid = params.content.robot_wxid
        console.log("已默认设置XYO机器人%s", wxid)
        wx.set("xyo_wxid", wxid)
    }
    if (["1", "49", "2002"].indexOf("" + params.content.type) != -1) {
        if (params.content.robot_type && suffix != qy) {
            suffix = qy
        }
        let msg = {}
        msg["user_id"] = params.content.from_wxid
        msg["user_name"] = params.content.from_name
        msg["chat_id"] = strings.replace(params.content.from_group, suffix, "")
        msg["chat_name"] = params.content.from_group_name
        msg["content"] = cq.toJdLink ? cq.toJdLink(qx2nm(params.content.msg)) : qx2nm(params.content.msg)
        if (msg["user_id"] != wxid) {//忽略自身消息
            wechat.receive(msg)
        } else {
            console.log("西瓜自身消息:" + JSON.stringify(params))
        }
        //处理消息回调
        //console.log("消息类型: "+JSON.stringify(params))
        if (params.Event == "EventDeviceCallback") {
            console.log("西瓜自身消息发送回调ID:" + params.content.msg_id + "\n")//+"内容:"+JSON.stringify(params))
            let to_wxid = params.content.to_wxid
            let msg_recall = new Bucket("msg_racall");
            let msgId = params.content.msg_id
            //msg_recall.set(time.now().unixMilli(), msgId)
            //全局recall
            let wx_recall = new Bucket("wx_recall")
            wx_recall.set("msg_id", msgId)
            console.log("------------------")
        }
        res.json({code: "-1"})
    }
    req.continue()
})

server.get("/bot/xyo", (_, res) => {
    res.send("你好，我是xyo。")
})

wechat.send(function (msg) {
    let wxid = msg.chat_id ? msg.chat_id + suffix : msg.user_id
    let items = cq.toItems(msg.content)
    //console.log("微信开始发送消息:" + JSON.stringify(msg))
    for (let item of items) {
        if (item.type == "text") {
            sendMessage({
                "api": "SendTextMsg",
                "to_wxid": wxid,
                "msg": nm2qx(item.value),
            })
        }
        if (item.type == "image") {
            let url = item.value
            if (sddr) {
                // if (strings.contains(url, "qpic.cn")) {
                url = fmt.sprintf("%s/relay?url=%s", sddr, encodeURIComponent(url))
                // }
            }
            sendMessage({
                "api": "SendImageMsg",
                "to_wxid": wxid,
                "path": url,
            })
        }
        if (item.type == "video") {
            sendMessage({
                "api": "SendVideoMsg",
                "to_wxid": wxid,
                "path": item.value,
            })
        }
    }
})

//发送消息
function sendMessage(senddata) {
    senddata["token"] = token
    senddata["robot_wxid"] = wxid
    if (suffix == qy) {
        senddata["api"] += "Enterprise"
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        goroutine: true,
    };
    // console.log(JSON.stringify(options))
    let resp = request(options);
    // let wx_recall = new Bucket("wx_recall")
    // let msgId =wx_recall.get("msg_id")
    // console.log("微信回调读取存储的Msg-id:"+msgId)
    // return msgId
}


let _ = (s) => {
    if (s) {
        let v = s.match("http[s]?://[\\w.]+:?\\d*")
        if (v) {
            return v[0]
        }
    }
    return ""
}

sddr = _(sddr)//

wx.watch("xyo_token", function (old, now) {
    token = now
})


wx.watch("xyo_sddr", function (old, now) {
    sddr = _(now)
})

wx.watch("xyo_wxid", function (old, now) {
    wxid = now
})

wx.watch("xyo_addr", function (old, now) {
    addr = _(now)//
})

let emojis = `🙈🙉🙊🐵🐒🐶🐕🐩🐺🐱😺😸😹😻😼😽🙀😿😾🐈🐯🐅🐆🐴🐎🐮🐂🐃🐄🐷🐖🐗🐽🐏🐑🐐🐪🐫🐘🐭🐁🐀🐹🐰🐇🐻🐨🐼🐾🐔🐓🐣🐤🐥🐦🐧🐸🐊🐢🐍🐲🐉🐳🐋🐬🐟🐠🐡🐙🐚🐌🐛🐜🐝🐞🦋💐🌸💮🌹🌺🌻🌼🌷🌱🌲🌳🌴🌵🌾🌿🍀🍁🍂🍃🌍🌎🌏🌐🌑🌒🌓🌔🌕🌖🌗🌘🌙🌚🌛🌜☀🌝🌞⭐🌟🌠☁⛅☔⚡❄🔥💧🌊💩🍇🍈🍉🍊🍋🍌🍍🍎🍏🍐🍑🍒🍓🍅🍆🌽🍄🌰🍞🍖🍗🍔🍟🍕🍳🍲🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🍡🍦🍧🍨🍩🍪🎂🍰🍫🍬🍭🍮🍯🍼☕🍵🍶🍷🍸🍹🍺🍻🍴😀😁😂😃😄😅😆😉😊😋😎😍😘😗😙😚☺😇😐😑😶😏😣😥😮😯😪😫😴😌😛😜😝😒😓😔😕😲😷😖😞😟😤😢😭😦😧😨😬😰😱😳😵😡😠😈👿👹👺💀👻👽👦👧👨👩👴👵👶👱👮👲👳👷👸💂🎅👰👼💆💇🙍🙎🙅🙆💁🙋🙇🙌🙏👤👥🚶🏃👯💃👫👬👭💏💑👪💪👈👉☝👆👇✌✋👌👍👎✊👊👋👏👐✍👣👀👂👃👅👄💋👓👔👕👖👗👘👙👚👛👜👝🎒💼👞👟👠👡👢👑👒🎩🎓💄💅💍🌂🎪🎭🎨🎰🚣🛀🎫🏆⚽⚾🏀🏈🏉🎾🎱🎳⛳🎣🎽🎿🏂🏄🏇🏊🚴🚵🎯🎮🎲🎷🎸🎺🎻🎬👾🌋🗻🏠🏡🏢🏣🏤🏥🏦🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪⛲🌁🌃🌆🌇🌉🌌🎠🎡🎢🚂🚃🚄🚅🚆🚇🚈🚉🚊🚝🚞🚋🚌🚍🚎🚏🚐🚑🚒🚓🚔🚕🚖🚗🚘🚚🚛🚜🚲⛽🚨🚥🚦🚧⚓⛵🚤🚢✈💺🚁🚟🚠🚡🚀🎑🗿🛂🛃🛄🛅💌💎🔪💈🚪🚽🚿🛁⌛⏳⌚⏰🎈🎉🎊🎎🎏🎐🎀🎁📯📻📱📲☎📞📟📠🔋🔌💻💽💾💿📀🎥📺📷📹📼🔍🔎🔬🔭📡💡🔦🏮📔📕📖📗📘📙📚📓📃📜📄📰📑🔖💰💴💵💶💷💸💳✉📧📨📩📤📥📦📫📪📬📭📮✏✒📝📁📂📅📆📇📈📉📊📋📌📍📎📏📐✂🔒🔓🔏🔐🔑🔨🔫🔧🔩🔗💉💊🚬🔮🚩🎌💦💨💣☠♠♥♦♣🀄🎴🔇🔈🔉🔊📢📣💤💢💬💭♨🌀🔔🔕✡✝🔯📛🔰🔱⭕✅☑✔✖❌❎➕➖➗➰➿〽✳✴❇‼⁉❓❔❕❗©®™🎦🔅🔆💯🔠🔡🔢🔣🔤🅰🆎🅱🆑🆒🆓ℹ🆔Ⓜ🆕🆖🅾🆗🅿🆘🆙🆚🈁🈂🈷🈶🈯🉐🈹🈚🈲🉑🈸🈴🈳㊗㊙🈺🈵▪▫◻◼◽◾⬛⬜🔶🔷🔸🔹🔺🔻💠🔲🔳⚪⚫🔴🔵♈♉♊♋♌♍♎♏♐♑♒♓⛎💘❤💓💔💕💖💗💙💚💛💜💝💞💟❣🌿🚧💒☎📟💽⬆↗➡↘⬇↙⬅↖↕↔↩↪⤴⤵🔃🔄🔙🔚🔛🔜🔝🔀🔁🔂▶⏩◀⏪🔼⏫🔽⏬📱📶📳📴♻🏧🚮🚰♿🚹🚺🚻🚼🚾⚠🚸⛔🚫🚳🚭🚯🚱🚷🔞🍇🍈🍉🍊🍋🍌🍍🥭🍎🍏🍐🍑🍒🍓🫐🥝🍅🫒🥥🥑🍆🥔🥕🌽🌶️🫑🥒🥬🥦🧄🧅🍄🥜🌰🍞🥐🥖🫓🥨🥯🥞🧇🧀🍖🍗🥩🥓🍔🍟🍕🌭🥪🌮🌯🫔🥙🧆🥚🍳🥘🍲🫕🥣🥗🍿🧈🧂🥫🍱🍘🍙🍚🍛🍜🍝🍠🍢🍣🍤🍥🥮🍡🥟🥠🥡🦪🍦🍧🍨🍩🍪🎂🍰🧁🥧🍫🍬🍭🍮🍯🍼🥛☕🫖🍵🍶🍾🍷🍸🍹🍺🍻🥂🥃🥤🧋🧃🧉🧊🥢🍽️🍴🥄🚣🗾🏔️⛰️🌋🗻🏕️🏖️🏜️🏝️🏞️🏟️🏛️🏗️🛖🏘️🏚️🏠🏡🏢🏣🏤🏥🏦🏨🏩🏪🏫🏬🏭🏯🏰💒🗼🗽⛪🕌🛕🕍⛩️🕋⛲⛺🌁🌃🏙️🌄🌅🌆🌇🌉🎠🎡🎢🚂🚃🚄🚅🚆🚇🚈🚉🚊🚝🚞🚋🚌🚍🚎🚐🚑🚒🚓🚔🚕🚖🚗🚘🚙🛻🚚🚛🚜🏎️🏍️🛵🛺🚲🛴🚏🛣️🛤️⛽🚨🚥🚦🚧⚓⛵🚤🛳️⛴️🛥️🚢✈️🛩️🛫🛬🪂💺🚁🚟🚠🚡🛰️🚀🛸🪐🌠🌌⛱️🎆🎇🎑💴💵💶💷🗿🛂🛃🛄🛅🙈🙉🙊💥💫💦💨🐵🐒🦍🦧🐶🐕🦮🐕‍🦺🐩🐺🦊🦝🐱🐈🐈‍⬛🦁🐯🐅🐆🐴🐎🦄🦓🦌🦬🐮🐂🐃🐄🐷🐖🐗🐽🐏🐑🐐🐪🐫🦙🦒🐘🦣🦏🦛🐭🐁🐀🐹🐰🐇🐿️🦫🦔🦇🐻🐻‍❄️🐨🐼🦥🦦🦨🦘🦡🐾🦃🐔🐓🐣🐤🐥🐦🐧🕊️🦅🦆🦢🦉🦤🪶🦩🦚🦜🐸🐊🐢🦎🐍🐲🐉🦕🦖🐳🐋🐬🦭🐟🐠🐡🦈🐙🐚🐌🦋🐛🐜🐝🪲🐞🦗🪳🕷️🕸️🦂🦟🪰🪱🦠💐🌸💮🏵️🌹🥀🌺🌻🌼🌷🌱🪴🌲🌳🌴🌵🌾🌿☘️🍀🍁🍂🍃🍄🌰🦀🦞🦐🦑🌍🌎🌏🌐🪨🌑🌒🌓🌔🌕🌖🌗🌘🌙🌚🌛🌜☀️🌝🌞⭐🌟🌠☁️⛅⛈️🌤️🌥️🌦️🌧️🌨️🌩️🌪️🌫️🌬️🌈☂️☔⚡❄️☃️⛄☄️🔥💧🌊🎄✨🎋🎍😀😃😄😁😆😅🤣😂🙂🙃😉😊😇🥰😍🤩😘😗☺️😚😙🥲😋😛😜🤪😝🤑🤗🤭🤫🤔🤐🤨😐😑😶😏😒🙄😬🤥😌😔😪🤤😴😷🤒🤕🤢🤮🤧🥵🥶🥴😵🤯🤠🥳🥸😎🤓🧐😕😟🙁☹️😮😯😲😳🥺😦😧😨😰😥😢😭😱😖😣😞😓😩😫🥱😤😡😠🤬😈👿💀☠️💩🤡👹👺👻👽👾🤖😺😸😹😻😼😽🙀😿😾💋👋🤚🖐️✋🖖👌🤌🤏✌️🤞🤟🤘🤙👈👉👆🖕👇☝️👍👎✊👊🤛🤜👏🙌👐🤲🤝🙏✍️💅🤳💪🦾🦿🦵🦶👂🦻👃🧠🫀🫁🦷🦴👀👁️👅👄👶🧒👦👧🧑👱👨🧔👨‍🦰👨‍🦱👨‍🦳👨‍🦲👩👩‍🦰🧑‍🦰👩‍🦱🧑‍🦱👩‍🦳🧑‍🦳👩‍🦲🧑‍🦲👱‍♀️👱‍♂️🧓👴👵🙍🙍‍♂️🙍‍♀️🙎🙎‍♂️🙎‍♀️🙅🙅‍♂️🙅‍♀️🙆🙆‍♂️🙆‍♀️💁💁‍♂️💁‍♀️🙋🙋‍♂️🙋‍♀️🧏🧏‍♂️🧏‍♀️🙇🙇‍♂️🙇‍♀️🤦🤦‍♂️🤦‍♀️🤷🤷‍♂️🤷‍♀️🧑‍⚕️👨‍⚕️👩‍⚕️🧑‍🎓👨‍🎓👩‍🎓🧑‍🏫👨‍🏫👩‍🏫🧑‍⚖️👨‍⚖️👩‍⚖️🧑‍🌾👨‍🌾👩‍🌾🧑‍🍳👨‍🍳👩‍🍳🧑‍🔧👨‍🔧👩‍🔧🧑‍🏭👨‍🏭👩‍🏭🧑‍💼👨‍💼👩‍💼🧑‍🔬👨‍🔬👩‍🔬🧑‍💻👨‍💻👩‍💻🧑‍🎤👨‍🎤👩‍🎤🧑‍🎨👨‍🎨👩‍🎨🧑‍✈️👨‍✈️👩‍✈️🧑‍🚀👨‍🚀👩‍🚀🧑‍🚒👨‍🚒👩‍🚒👮👮‍♂️👮‍♀️🕵️🕵️‍♂️🕵️‍♀️💂💂‍♂️💂‍♀️🥷👷👷‍♂️👷‍♀️🤴👸👳👳‍♂️👳‍♀️👲🧕🤵🤵‍♂️🤵‍♀️👰👰‍♂️👰‍♀️🤰🤱👩‍🍼👨‍🍼🧑‍🍼👼🎅🤶🧑‍🎄🦸🦸‍♂️🦸‍♀️🦹🦹‍♂️🦹‍♀️🧙🧙‍♂️🧙‍♀️🧚🧚‍♂️🧚‍♀️🧛🧛‍♂️🧛‍♀️🧜🧜‍♂️🧜‍♀️🧝🧝‍♂️🧝‍♀️🧞🧞‍♂️🧞‍♀️🧟🧟‍♂️🧟‍♀️💆💆‍♂️💆‍♀️💇💇‍♂️💇‍♀️🚶🚶‍♂️🚶‍♀️🧍🧍‍♂️🧍‍♀️🧎🧎‍♂️🧎‍♀️🧑‍🦯👨‍🦯👩‍🦯🧑‍🦼👨‍🦼👩‍🦼🧑‍🦽👨‍🦽👩‍🦽🏃🏃‍♂️🏃‍♀️💃🕺🕴️👯👯‍♂️👯‍♀️🧖🧖‍♂️🧖‍♀️🧘🧑‍🤝‍🧑👭👫👬💏👩‍❤️‍💋‍👨👨‍❤️‍💋‍👨👩‍❤️‍💋‍👩💑👩‍❤️‍👨👨‍❤️‍👨👩‍❤️‍👩👪👨‍👩‍👦👨‍👩‍👧👨‍👩‍👧‍👦👨‍👩‍👦‍👦👨‍👩‍👧‍👧👨‍👨‍👦👨‍👨‍👧👨‍👨‍👧‍👦👨‍👨‍👦‍👦👨‍👨‍👧‍👧👩‍👩‍👦👩‍👩‍👧👩‍👩‍👧‍👦👩‍👩‍👦‍👦👩‍👩‍👧‍👧👨‍👦👨‍👦‍👦👨‍👧👨‍👧‍👦👨‍👧‍👧👩‍👦👩‍👦‍👦👩‍👧👩‍👧‍👦👩‍👧‍👧🗣️👤👥🫂👣🧳🌂☂️🎃🧵🧶👓🕶️🥽🥼🦺👔👕👖🧣🧤🧥🧦👗👘🥻🩱🩲🩳👙👚👛👜👝🎒🩴👞👟🥾🥿👠👡🩰👢👑👒🎩🎓🧢🪖⛑️💄💍💼🩸💌🕳️💣🛀🛌🔪🏺🗺️🧭🧱💈🦽🦼🛢️🛎️🧳⌛⏳⌚⏰⏱️⏲️🕰️🌡️⛱️🧨🎈🎉🎊🎎🎏🎐🧧🎀🎁🤿🪀🪁🔮🪄🧿🕹️🧸🪅🪆🖼️🧵🪡🧶🪢🛍️📿💎📯🎙️🎚️🎛️📻🪕📱📲☎️📞📟📠🔋🔌💻🖥️🖨️⌨️🖱️🖲️💽💾💿📀🧮🎥🎞️📽️📺📷📸📹📼🔍🔎🕯️💡🔦🏮🪔📔📕📖📗📘📙📚📓📒📃📜📄📰🗞️📑🔖🏷️💰🪙💴💵💶💷💸💳🧾✉️📧📨📩📤📥📦📫📪📬📭📮🗳️✏️✒️🖋️🖊️🖌️🖍️📝📁📂🗂️📅📆🗒️🗓️📇📈📉📊📋📌📍📎🖇️📏📐✂️🗃️🗄️🗑️🔒🔓🔏🔐🔑🗝️🔨🪓⛏️⚒️🛠️🗡️⚔️🔫🪃🛡️🪚🔧🪛🔩⚙️🗜️⚖️🦯🔗⛓️🪝🧰🧲🪜⚗️🧪🧫🧬🔬🔭📡💉🩸💊🩹🩺🚪🪞🪟🛏️🛋️🪑🚽🪠🚿🛁🪤🪒🧴🧷🧹🧺🧻🪣🧼🪥🧽🧯🛒🚬⚰️🪦⚱️🗿🪧🚰🕴️🧗🧗‍♂️🧗‍♀️🤺🏇⛷️🏂🏌️🏌️‍♂️🏌️‍♀️🏄🏄‍♂️🏄‍♀️🚣🚣‍♂️🚣‍♀️🏊🏊‍♂️🏊‍♀️⛹️⛹️‍♂️⛹️‍♀️🏋️🏋️‍♂️🏋️‍♀️🚴🚴‍♂️🚴‍♀️🚵🚵‍♂️🚵‍♀️🤸🤸‍♂️🤸‍♀️🤼🤼‍♂️🤼‍♀️🤽🤽‍♂️🤽‍♀️🤾🤾‍♂️🤾‍♀️🤹🤹‍♂️🤹‍♀️🧘🧘‍♂️🧘‍♀️🎪🛹🛼🛶🎗️🎟️🎫🎖️🏆🏅🥇🥈🥉⚽⚾🥎🏀🏐🏈🏉🎾🥏🎳🏏🏑🏒🥍🏓🏸🥊🥋🥅⛳⛸️🎣🎽🎿🛷🥌🎯🎱🎮🎰🎲🧩♟️🎭🎨🧵🧶🎼🎤🎧🎷🪗🎸🎹🎺🎻🥁🪘🎬🏹💘💝💖💗💓💞💕💟❣️💔❤️🧡💛💚💙💜🤎🖤🤍💯💢💬👁️‍🗨️🗨️🗯️💭💤💮♨️💈🛑🕛🕧🕐🕜🕑🕝🕒🕞🕓🕟🕔🕠🕕🕡🕖🕢🕗🕣🕘🕤🕙🕥🕚🕦🌀♠️♥️♦️♣️🃏🀄🎴🔇🔈🔉🔊📢📣📯🔔🔕🎵🎶💹🛗🏧🚮🚰♿🚹🚺🚻🚼🚾⚠️🚸⛔🚫🚳🚭🚯🚱🚷📵🔞☢️☣️⬆️↗️➡️↘️⬇️↙️⬅️↖️↕️↔️↩️↪️⤴️⤵️🔃🔄🔙🔚🔛🔜🔝🛐⚛️🕉️✡️☸️☯️✝️☦️☪️☮️🕎🔯♈♉♊♋♌♍♎♏♐♑♒♓⛎🔀🔁🔂▶️⏩⏭️⏯️◀️⏪⏮️🔼⏫🔽⏬⏸️⏹️⏺️⏏️🎦🔅🔆📶📳📴♀️♂️✖️➕➖➗♾️‼️⁉️❓❔❕❗〰️💱💲⚕️♻️⚜️🔱📛🔰⭕✅☑️✔️❌❎➰➿ 〽️✳️✴️❇️©️®️™️#️⃣*️⃣0️⃣1️⃣2️⃣3️⃣4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟🔠🔡🔢🔣🔤🅰️🆎🅱️🆑🆒🆓ℹ️🆔Ⓜ️🆕🆖🅾️🆗🅿️🆘🆙🆚🈁🈂️🈷️🈶🈯🉐🈹🈚🈲🉑🈸🈴🈳㊗️㊙️🈺🈵🔴🟠🟡🟢🔵🟣🟤⚫⚪🟥🟧🟨🟩🟦🟪🟫⬛⬜◼️◻️◾◽▪️▫️🔶🔷🔸🔹🔺🔻💠🔘🔳🔲🏁🚩🎌🏴🏳️🏳️‍🌈🏳️‍⚧️🏴‍☠️🇦🇨🇦🇩🇦🇪🇦🇫🇦🇬🇦🇮🇦🇱🇦🇲🇦🇴🇦🇶🇦🇷🇦🇸🇦🇹🇦🇺🇦🇼🇦🇽🇦🇿🇧🇦🇧🇧🇧🇩🇧🇪🇧🇫🇧🇬🇧🇭🇧🇮🇧🇯🇧🇱🇧🇲🇧🇳🇧🇴🇧🇶🇧🇷🇧🇸🇧🇹🇧🇻🇧🇼🇧🇾🇧🇿🇨🇦🇨🇨🇨🇩🇨🇫🇨🇬🇨🇭🇨🇮🇨🇰🇨🇱🇨🇲🇨🇳🇨🇴🇨🇵🇨🇷🇨🇺🇨🇻🇨🇼🇨🇽🇨🇾🇨🇿🇩🇪🇩🇬🇩🇯🇩🇰🇩🇲🇩🇴🇩🇿🇪🇦🇪🇨🇪🇪🇪🇬🇪🇭🇪🇷🇪🇸🇪🇹🇪🇺🇫🇮🇫🇯🇫🇰🇫🇲🇫🇴🇫🇷🇬🇦🇬🇧🇬🇩🇬🇪🇬🇫🇬🇬🇬🇭🇬🇮🇬🇱🇬🇲🇬🇳🇬🇵🇬🇶🇬🇷🇬🇸🇬🇹🇬🇺🇬🇼🇬🇾🇭🇰🇭🇲🇭🇳🇭🇷🇭🇹🇭🇺🇮🇨🇮🇩🇮🇪🇮🇱🇮🇲🇮🇳🇮🇴🇮🇶🇮🇷🇮🇸🇮🇹🇯🇪🇯🇲🇯🇴🇯🇵🇰🇪🇰🇬🇰🇭🇰🇮🇰🇲🇰🇳🇰🇵🇰🇷🇰🇼🇰🇾🇰🇿🇱🇦🇱🇧🇱🇨🇱🇮🇱🇰🇱🇷🇱🇸🇱🇹🇱🇺🇱🇻🇱🇾🇲🇦🇲🇨🇲🇩🇲🇪🇲🇫🇲🇬🇲🇭🇲🇰🇲🇱🇲🇲🇲🇳🇲🇴🇲🇵🇲🇶🇲🇷🇲🇸🇲🇹🇲🇺🇲🇻🇲🇼🇲🇽🇲🇾🇲🇿🇳🇦🇳🇨🇳🇪🇳🇫🇳🇬🇳🇮🇳🇱🇳🇴🇳🇵🇳🇷🇳🇺🇳🇿🇴🇲🇵🇦🇵🇪🇵🇫🇵🇬🇵🇭🇵🇰🇵🇱🇵🇲🇵🇳🇵🇷🇵🇸🇵🇹🇵🇼🇵🇾🇶🇦🇷🇪🇷🇴🇷🇸🇷🇺🇷🇼🇸🇦🇸🇧🇸🇨🇸🇩🇸🇪🇸🇬🇸🇭🇸🇮🇸🇯🇸🇰🇸🇱🇸🇲🇸🇳🇸🇴🇸🇷🇸🇸🇸🇹🇸🇻🇸🇽🇸🇾🇸🇿🇹🇦🇹🇨🇹🇩🇹🇫🇹🇬🇹🇭🇹🇯🇹🇰🇹🇱🇹🇲🇹🇳🇹🇴🇹🇷🇹🇹🇹🇻🇹🇼🇹🇿🇺🇦🇺🇬🇺🇲🇺🇳🇺🇸🇺🇾🇺🇿🇻🇦🇻🇨🇻🇪🇻🇬🇻🇮🇻🇳🇻🇺🇼🇫🇼🇸🇽🇰🇾🇪🇾🇹🇿🇦🇿🇲🇿🇼🏴󠁧󠁢󠁥󠁮󠁧󠁿🏴󠁧󠁢󠁳󠁣󠁴󠁿🏴󠁧󠁢󠁷󠁬󠁳󠁿🏴󠁵󠁳󠁴󠁸󠁿󠁵󠁳󠁴󠁸󠁿`

let map = {}

for (let emoji of emojis) {
    let vs = unicode(emoji)
    //console.log(vs.length)
    if (vs == "[emoji=\\uFE0F]") {
        continue
    }
    if (vs.length != 15 && vs.length != 21) {
        continue
    }
    map[emoji] = vs
}

function unicode(str) {
    let value = "";
    for (let i = 0; i < str.length; i++)
        value += "\\u" + str.charCodeAt(i).toString(16).toUpperCase()
    return fmt.sprintf(`[emoji=%s]`, value);
}

function qx2nm(str) {
    for (let key in map) {
        str = strings.replace(str, map[key], key)
    }
    return str
}

function nm2qx(str) {
    for (let key in map) {
        str = strings.replace(str, key, map[key])
    }
    //console.log("处理消息:" + JSON.stringify(map))
    return str
}

//微信撤回消息
wechat.recall(function () {
    let message_id = new Bucket("wx_recall").get("msg_id")
    if (message_id) {
        mod.delMsg(message_id)
    }
})
