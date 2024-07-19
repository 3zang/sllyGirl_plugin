/*
* @author 三藏
* @module true
 * @create_at 2023-12-09 19:55:30
* @description 一些通用函数和网络接口以及数据
* @version v1.0.0
* @title CoolMod
 * @public false
*/
//西瓜微信的地址
const addr = "http://192.168.1.160:8024/"
//console.log("Mod1.0已被加载!")
let botId = "wxid_0w5gogf4wa0k12"
let chatroom = "@chatroom"
let token = "7345fb7fc9cc7dccca99eff67b945aa2"  //kuv 的token
module.exports = {
    sendVoice,
    recallMsg,
    sendImage,
    sendText,
    sendVideo,
    sendMusic,
    sendMoments_Video,
    sendEmoji,
    sendMoments_Txt,
    sendMoments_Image,
    getMoments,
    likeMoments,
    sendMsgAt,
    getGroupUser,
    recallMsg,
    getMsgId
}


/**
 * 撤回消息
 */
function delMsg(msgId) {
    var senddata = {
        "token": token,
        "api": "WithdrawOwnMessage",
        "robot_wxid": botId,
        "to_wxid": botId,
        "msgid": msgId
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("给用户:----" + botId + "----自定义撤回消息发送响应:" + body.Result)
    console.log("删除撤回消息ID,完成:" + msgId)
}
/**
 * 撤回消息
 */
function recallMsg() {
    let msgId = getMsgId()
    var senddata = {
        "token": token,
        "api": "WithdrawOwnMessage",
        "robot_wxid": botId,
        "to_wxid": botId,
        "msgid": msgId
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("给用户:----" + botId + "----自定义撤回消息发送响应:" + body.Result)
    //删除缓存
    let msg_racall = new Bucket("wx_recall")
    msg_racall.deleteAll()
    console.log("删除撤回消息ID,完成:" + msgId)
}
/**
 * 获取消息id
 */
function getMsgId() {
    let recallConfig = new Bucket("wx_recall")
    let msg = recallConfig.get("msg_id")
    //console.log("取得配置:" +type)
    let json = JSON.parse(msg)
    let msgId = json.content.msg_id
    if (msgId) {
        return msgId
    } else {
        return 0
    }

}

/**
 * 获取群成员列表
 */
function getGroupUser(groupCode) {
    var senddata = {
        "token": token,
        "api": "GetGroupMember",
        "robot_wxid": botId,
        "group_wxid": groupCode
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    var { body } = request(options)
    console.log("获取群成员,完成:" + groupCode)
    return body


}

/**
 * 发消息@
 */
function sendMsgAt(data) {
    var senddata = {
        "token": token,
        "api": "SendGroupMsgAndAt",
        "robot_wxid": "wxid_w4cd5q07fiwy12",
        "group_wxid": data.groupCode,
        "member_wxid": data.wx_id,
        "member_name": data.wx_name,
        "msg": data.msg
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    var { body } = request(options)
    console.log("发送 艾特 消息,完成:" + JSON.stringify(data) + ",响应：" + body.Result)


}

/**
 * 修改群马甲
 */
function changeName(groupCode, nickName) {
    var senddata = {
        "token": token,
        "api": "SesNicknameInGroup",
        "robot_wxid": botId,
        "group_wxid": groupCode + chatroom,
        "name": nickName
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    var { body } = request(options)
    console.log("修改群马甲,完成:" + nickName + body.Result)
    return body

}

function sendRandomVoice(groupCode) {
    groupCode = groupCode.toString()
    let fileName = getVoices()
    let sendData = {
        "selfid": botId,
        "targetid": groupCode,
        "type": groupCode.match(/@/) ? "2" : "1",
        "Voicepath": fileName[0]
    }


    let options = {
        url: addr + "Sendvoice",
        method: 'post',
        body: sendData,
        json: true,
        headers: {
            "token": token
        }
    };
    //console.log("语音发消息参数: " + JSON.stringify(options))
    let { body } = request(options);
    //console.log("回调发消息响应:" + JSON.stringify(resp))

}


function sendVoice(groupCode, voiceName) {
    groupCode = groupCode.toString()
    let sendData = {
        "selfid": botId,
        "targetid": groupCode,
        "type": groupCode.match(/@/) ? "2" : "1",
        "Voicepath": voiceName
    }
    let options = {
        url: addr + "Sendvoice",
        method: 'post',
        body: sendData,
        json: true,
        headers: {
            "token": token
        }
    };
    //console.log("语音发消息参数: " + JSON.stringify(options))
    let { body } = request(options);
    //console.log("回调发消息响应:" + JSON.stringify(resp))

}

/**
 * 获取目录
 */
function getVoices() {
    let { body } = request({ url: "http://192.168.1.160:3000/voices", method: "get", json: true })
    return body

}


function sendData(data) {

}


/**
 * 发送视频
 */
function sendVideo(groupCode, url) {
    var senddata = {
        "token": token,
        "api": "SendVideoMsg",
        "robot_wxid": botId,
        "to_wxid": groupCode,
        "path": url
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log(groupCode + "----视频发送响应:" + body.Result)
}

/**
 * 发送文字
 */
function sendText(groupCode, txt) {
    var senddata = {
        "token": token,
        "api": "SendTextMsg",
        "robot_wxid": botId,
        "to_wxid": groupCode,
        "msg": txt
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("给用户:----" + groupCode + "----文本发送响应:" + body.Result)

}
/**
 * 发送图片
 */
function sendImage(groupCode, url) {
    var senddata = {
        "token": token,
        "api": "SendImageMsg",
        "robot_wxid": botId,
        "to_wxid": groupCode,
        "path": url
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("给用户:----" + groupCode + "----图片发送响应:" + body.Result)

}

/**
 * 发送音乐
 */
function sendMusic(groupCode, music) {
    var senddata = {
        "token": token,
        "api": "SendMusicLinkMsg",
        "robot_wxid": botId,
        "title": music.title,
        "desc": music.desc,
        "url": music.url,
        "dataurl": music.dataurl,
        "thumburl": music.thumburl,
        "to_wxid": groupCode
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("给用户:----" + groupCode + "----音乐发送响应:" + body.Result)

}

/**
 * 发送朋友圈视频
 */
function sendMoments_Video(groupCode, title, url) {
    var senddata = {
        "token": token,
        "api": "SendMoments_Video",
        "robot_wxid": botId,
        "content": title,
        "video": url
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("----开始发送朋友圈\n标题: " + title + "\n" + "视频地址: " + url + "\n----朋友圈[视频]发送响应:" + body.Result)
    //sendText("cuiyanchao18","朋友圈视频文案发送成功, "+title)
}

/**
 * 发送朋友圈文本
 */
function sendMoments_Txt(groupCode, title) {
    var senddata = {
        "token": token,
        "api": "SendMoments_Str",
        "robot_wxid": botId,
        "content": title
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("----开始发送朋友圈\n标题:" + title + "\n----朋友圈[文字]发送响应:" + body.Result)
    //sendText("cuiyanchao18","朋友圈视频文案发送成功, "+title)
}

/**
 * 发送朋友圈图片
 */
function sendMoments_Image(groupCode, title, img) {
    var senddata = {
        "token": token,
        "api": "SendMoments_Img",
        "robot_wxid": botId,
        "content": title,
        "img": img
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("----开始发送朋友圈:\n标题: " + title + "\n" + "图片地址:" + img + "\n----朋友圈[图片]发送响应:" + body.Result)
    //sendText("cuiyanchao18","朋友圈视频文案发送成功, "+title)
}
/**
 * 发送表情
 */
function sendEmoji(groupCode, path) {
    var senddata = {
        "token": token,
        "api": "SendEmojiMsg",
        "robot_wxid": botId,
        "path": path,
        "to_wxid": groupCode
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    //console.log("请求参数:" + JSON.stringify(senddata))
    var { body } = request(options)
    console.log("给用户:----" + groupCode + "----自定义表情发送响应:" + body.Result)

}

function recallMsg(targetid, Svrid) {
    let sendData = {
        "selfid": botId,
        "targetid": targetid,
        "Svrid": Svrid
    }

    let token = "7345fb7fc9cc7dccca99eff67b945aa2"  //kuv 的token
    let options = {
        url: addr + "Messagerecall",
        method: 'post',
        body: sendData,
        json: true,
        headers: {
            "token": token
        }
    };
    //console.log("语音发消息参数: " + JSON.stringify(options))
    let { body } = request(options);
    console.log("撤回发消息响应:" + body.errMsg)

}

/**
 * 获取朋友圈
 */

function getMoments(mid) {
    if (!mid) {
        mid = ""
    }
    var senddata = {
        "token": token,
        "api": "GetMoments",
        "robot_wxid": "wxid_w4cd5q07fiwy12",
        "pyq_id": mid,
        "num": 10
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    var { body } = request(options)
    console.log("获取朋友圈,完成:")
    return body

}

function likeMoments(mid) {
    var senddata = {
        "token": token,
        "api": "MomentsLike",
        "robot_wxid": "wxid_w4cd5q07fiwy12",
        "pyq_id": mid
    }
    let options = {
        url: addr,
        method: 'post',
        body: senddata,
        json: true
    };
    var { body } = request(options)
    console.log("点赞朋友圈,完成:" + mid)
    return body
}
