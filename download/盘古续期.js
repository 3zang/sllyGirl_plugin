/**
 * @title 盘古续期
 * @create_at 1023-05-29 19:51:26
 * @rule /xm
 * @description 🐒这个人很懒什么都没有留下。
 * @author 佚名
 * @version v1.0.0
 */
let cookie = ""
let baseUrl = "http://129.211.29.66:8000"
check()


function check() {
    //formdata
    let reqBody = {"account": "YJL308c7b84ce51e0ed62", "logintype": "2"}
    let login_url = baseUrl + "/api/getusers"
    let {body} = request({
        url: login_url,
        method: "post",
        json: true,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        body: reqBody

    })
    console.log("登录响应：" + JSON.stringify(body))
    if (body.ErrorCode == 0 && body != null) {
        let userName = body.Data[0].nickName
        let online = body.Data[0].online == 1 ? "在线" : "离线"
        let acttype = body.Data[0].acttype
        let isnewdeviceid = body.Data[0].isnewdeviceid == 1 ? "是" : "否"
        let expiredtime = body.Data[0].expiredtime;
        let msg = "登录账号: " + userName + "\n在线状态: " + online + "\n账户类型: " + acttype + "\n是新设备: " + isnewdeviceid + "\n过期时间: " + expiredtime
        console.log(msg)
        s.reply(msg)
        sleep(2000)
        if (body.Data[0].online == 0) {
            sleep(2000)
            s.reply("账号已离线请重新登录,请使用微信扫码下面的二维码")
            sleep(2000)
            s.reply(image(getQrcode()))
            for (let i = 0; i < 40; i++) {
                let data = toLogin()
                sleep(2000)
                if (data.state != 0) {
                    //登录成功提示
                    console.log("登录成功!")
                    s.reply("登录成功!" + data.nickName)
                    break
                }

            }
            //超时未登录提示
            if (data.state == 0) {
                console.log("登录超时")
                s.reply("登录超时!,请重新发 /xm 进行登录")
            }
        }
    }
}

function getQrcode() {
    let reqBody = {"id": "YJL308c7b84ce51e0ed62", "group": "dc914cfc-8672-45ac-a231-104bf34f92c8", "force": 0}
    let login_url = baseUrl + "/api/getqr"
    let {body} = request({
        url: login_url,
        method: "post",
        json: true,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        body: reqBody

    })
    let qr = body.qrpath
    return qr
}

function toLogin() {
    let reqBody = {"id": "YJL308c7b84ce51e0ed62", "type": 1}
    let login_url = baseUrl + "/api/ckstate"
    let {body} = request({
        url: login_url,
        method: "post",
        json: true,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        body: reqBody

    })
    let data = body.data
    return data

}


/**
 * 备份
 */

function _login() {

    let reqBody = {"km": "PGY30DAF8502360F6F0B16CB", "area": "陕西"}
    let login_url = "http://wl.778899qqq.cn/Login.aspx/CheckLogin"
    let body = request({
        url: login_url,
        method: "post",
        json: true,
        headers: {
            "X-Requested-With": "XMLHttpRequest"
        },
        body: reqBody

    })
    console.log("登录响应：" + JSON.stringify(body))
    if (body.status == 200 && body.body != null) {
        cookie = body.headers['Set-Cookie'][0].split(";")[0]
        s.reply("获取Cookie:" + cookie)
        CheckStaus(cookie)
    }

}

function CheckStaus(cookie) {
    let check_url = "http://wl.778899qqq.cn/center.aspx/getUserInfo"
    console.log("请求COOKIE: " + cookie)
    let body = request({
        url: check_url,
        method: "post",
        json: true,
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie,
            "X-Requested-With": "XMLHttpRequest"
        }
    })

    // let d =JSON.parse(ret);
    if (body.status == 500) {
        s.reply(body.Message)
    }
    if (body.status == 200) {
        let str = body.body.d
        let resBody = JSON.parse(str)
        let index = resBody[0]
        let userId = index.wxNike
        let km = index.cardWord;
        let expTime = index.effTime;
        let head = index.headImg;
        //s.reply(image(head))
        s.reply("登录成功!\n" + "账号 : " + userId + "\n卡密 : " + km + "\n过期时间 : " + expTime)
        sleep(3000)
        s.reply("请在1分钟内发送卡密进行续费！")
        let inp = s.listen(60000)
        if (inp.getContent()) {
            let km = inp.getContent()
            XuFei(km)
        } else {
            s.reply("已超时,不进行续费")
        }

    }

}


function XuFei(km) {
    let check_url = "http://wl.778899qqq.cn/Topup.aspx/Xufei"
    console.log("请求COOKIE: " + cookie)
    let reqBody = {'txtCD': km}
    let body = request({
        url: check_url,
        method: "post",
        json: true,
        headers: {
            "Content-Type": "application/json",
            "Cookie": cookie,
            "X-Requested-With": "XMLHttpRequest"
        },
        body: reqBody
    })


    let ret = body.body.d
    console.log("响应：" + JSON.stringify(body.body))
    s.reply(ret)
}