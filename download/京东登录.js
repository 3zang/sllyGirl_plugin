/**
 * @author https://t.me/sillyGirl_Plugin
 * @version v1.0.0
 * @origin
 * @version v1.3.0
 * @create_at 2022-09-19 15:06:22
 * @description 京东登陆插件，已对接nolanPro与rabbitPro，需安装qinglong与something模块
 * @title 京东登陆
 * @rule raw ^(短信)?登(陆|录)$
 * @rule raw ^扫码登(陆|录)$
 * @rule raw ^口令登(录|陆)
 * @rule raw ^(打开|关闭)扫码$
 * @rule raw ^登(陆|录)检(测|查)$
 * @priority 9
 * @public false
 * @disable false
 */

/***************配置****************** */
/* @rule raw [\S ]*pin=[^;]+; ?wskey=[^;]+;[\S ]*
* @rule raw [\S ]*pt_key=[^;]+; ?pt_pin=[^;]+;[\S ]*/

//允许上车的群聊白名单id,非白名单群禁止上车
const GroupWhiteList=["758657899"]

//客户黑名单，黑名单客户禁止上车，例:["123213","1434234"]
const BlackList=[]

//聚合容器序号，用于检查绑定账号有效性
const DefaultQL=1

//【Nolan】
//对接nark--本功能已删除
//set jd_cookie nolan_addr ?
//例：set jd_cookie nolan_addr http://127.0.0.1:5710

//对接nolan Pro
//设置nolan Pro地址
//set jd_cookie nolanPro_addr ?
//设置nolan Pro对接机器人的token
//set jd_cookie nolanPro_token ?


//【rabbit】
//对接rabbitPro:set jd_cookie rabbitPro_addr ?
//设置rabbitPro上车容器:set jd_cookie rabbitPro_ql ? (rabbitPro后台容器序号)

//【提交ck】--本功能已删除
//短信登陆后上传ck的容器(对应“青龙管理”的容器序号，若将ck交由芝士处理，本项设置为0)
//注1：若将ck交由芝士处理，便于ck分发以及可以即时查询账号信息，若由本插件上传ck，将无法即时更新账号状态，即虽然ck有效但查询仍旧提示无效，需过几分钟才能正常查询
//注2：本项设置与扫码无关,nolan Pro扫码ck分发由Pro负责，rabbit扫码ck分发见上文【rabbit】设置
const qlc=1

//【短信登陆优先级】
//依次为nolanPro、rabbitPro，不可用的方式填0
//例:[2,1]表示优先调用nolanPro登陆，nolanPro不可用时自动切换至rabbitPro
//例:[0,1]表示仅使用rabbitPro登陆
const SP=[0,1]

//【扫码登陆优先级】
//依次为nolanPro、rabbitPro,其他同上
const QP=[0,1]

//【是否禁止未失效客户重复登陆】仅适用扫码
const CheckBefore=true

//【其他说明】
//口令登陆等同于扫码登陆，扫码登陆为将登陆链接转换为二维码（基于pwmqr.com），而口令登陆为将登陆链接转换为京东口令(基于nolan公益api)
//感谢以上服务提供者

//本插件等同于网页登陆
//nolanPro获取的wskey存储于nolanPro并由其负责分发及维护ck的更新，qrabbbit获取的wskey由其上传至青龙(与本插件无关)，并由其负责维护ck的更新
//本插件也不负责wskey更新ck的维护
/************************************** */


const ql=require("qinglong")
const st=require("something")
const jddb=new Bucket("jd_cookie")
const s = sender
const pins=st.GetBind(s.getPlatform(),s.getUserId())	//获取用户已绑定的pin
const QLS=ql.QLS()	//获取芝士对接的青龙
const sillyGirl=new SillyGirl()
const WAIT=3*60*1000	//输入等待时长
const VerifyTimes=3	//验证重试次数
const nolanPro=jddb.get("nolanPro_addr")
const rabbitPro=jddb.get("rabbitPro_addr")
const ql_server=jddb.get("rabbitPro_ql")


const handle=function(s){
    if(s.getChatId())
        s.recallMessage(Number(s.getMessageId()).toString())
    sleep(400)
}

function notifyMasters(msg){
    sleep(2000)
    //if(!s.isAdmin())
    sillyGirl.notifyMasters(msg)
}
function main(){
    if(BlackList.indexOf(s.getUserId().toString())!=-1){
        // s.reply("禁止上车，请联系管理员")//不需要通知请注释本行
        return
    }
    else if(s.getChatId() && GroupWhiteList.indexOf(s.getChatId().toString())==-1){
        // s.reply("本群禁止上车")//不需要通知请注释本行
        return
    }
    // if(!s.isAdmin()){
    // 	s.reply("维护中...")
    // 	return
    // }
    if(s.getContent().match(/^(短信)?登(陆|录)$/)){
        //检查绑定账号是否失效
        // if(!NeedLogin(pins,QLS[DefaultQL-1])){
        // 	s.reply("您的账号尚未失效，无需重新登陆")
        // 	return
        // }
        s.reply("京东呆瓜助手为您服务，请输入手机号码(可回复q退出):")
        let inp=s.listen(handle,WAIT)
        if(inp==null){
            s.reply("输入超时，请重新登陆")
            return
        }
        else if(inp.getContent()=="q"){
            s.reply("已退出")
            return
        }
        else if(inp.getContent().length!=11){
            s.reply("手机号码错误，请重新登陆")
            return
        }
        else
            Tel=inp.getContent()

        let tipid=s.reply("请稍候...")
        let Login=[
            {method:NolanProSms,weight:SP[0]},
            {method:RabbitProSms,weight:SP[1]}
        ]
        Login.sort((a,b)=>b.weight-a.weight)
        if(!Login.find(login=>{
            if(login.weight)
                return login.method(Tel)
            return false
        }))
            s.reply("短信登陆暂时不可用，您可以尝试'扫码登陆'登陆或者手动抓取ck")
    }
    else if(s.isAdmin() && s.getContent().match(/^登(陆|录)检(测|查)$/)){
        const rabbitPro=jddb.get("rabbitPro_addr")
        const nolanPro=jddb.get("nolanPro_addr")
        const rabbit=jddb.get("qrabbit_addr")
        const token=jddb.get("nolanPro_token")
        let message=""
        let Tel="138"+Math.floor(Math.random()*9e8).toString()	//随机手机号
        let data=null
        s.reply("请稍候...")
        console.log("生成随机手机号码:"+Tel)
        if(SendSMS(Tel,nolanPro+"/sms/SendSMS",token))
            message+="★NolanPro短信：正常\n"
        else
            message+="☆NolanPro短信：失败\n"
        if(SendSMS(Tel,rabbitPro+"/api/sendSMS"))
            message+="★rabbitPro短信：正常\n"
        else
            message+="☆rabbitPro短信：失败\n"
        data=getQR(nolanPro+"/qr/GetQRKey",token)
        if(data && data.success)
            message+="★NolanPro扫码：正常\n"
        else
            message+="☆NolanPro扫码：失败\n"
        data=getQR(rabbit+"/api/GenQrCode")
        if(data && data.code==0)
            message+="★rabbitPro扫码：正常\n"
        else
            message+="☆rabbitPro扫码：失败\n"
        message+="\n若提示失败，请查看日志，可能原因包括但不限于未对接、对接失败、面板已挂等"
        s.reply(message)
        return
    }
    else if(s.isAdmin() && s.getContent()=="打开扫码"){
        jddb.set("qr_switch",1)
        s.reply("ok")
        return
    }
    else if(s.isAdmin() && s.getContent()=="关闭扫码"){
        jddb.set("qr_switch",0)
        s.reply("ok")
        return
    }
    else if(s.getContent().match(/^(扫码|口令)登(录|陆)$/)){
        if(!s.isAdmin() && jddb.get("qr_switch")==0){
            s.reply('维护中...')
            return
        }
        //检查绑定账号是否失效
        if(!s.isAdmin()&&CheckBefore  && pins.length && !NeedLogin(pins,QLS[DefaultQL-1])){
            s.reply("您的账号尚未失效，无需重新登陆\n若需添加新账号，请联系管理员或者使用短信登陆")
            return
        }
        let tipid=s.reply("请稍候...")
        let Login=[
            {method:NolanProQR,weight:QP[0]},
            {method:RabbitProQR,weight:QP[1]}
        ]
        Login.sort((a,b)=>b.weight-a.weight)
        if(!Login.find(login=>{
            if(login.weight)
                return login.method()
            return false
        }))
            s.reply("扫码暂时不可用,您可以发送“呆瓜”获取其他登陆方式或者稍后再试")


        //更新变量
        //Update_JDCOOKIE(QLS[DefaultQL-1])
        return
    }
    else if(s.getContent().indexOf("wskey")!=-1){	//提交wskey
        s.recallMessage(Number(s.getMessageId()).toString())
        sleep(400)
        env.name="JD_WSCK"
        env.value=s.getContent().match(/pin=[^;]+; ?wskey=[^;]+;/)[0]
    }
    else{	//提交ck
        let ck=s.getContent().match(/pt_key=[^;]+; ?pt_pin=[^;]+;/)[0]
        if(st.JD_UserInfo(ck) || JD_isLogin(ck)){	//检查ck有效性
            s.recallMessage(Number(s.getMessageId()).toString())
            sleep(400)
            env.name="JD_COOKIE"
            env.value=ck
        }
        else{
            s.reply("cookie无效")
            return
        }
    }
}



function NolanProSms(Tel){
    //const token=jddb.get("nolanPro_token")
    if(!nolanPro){
        console.log("未对接nolanPro！")
        // if(!token){
        // 	s.reply("未设置对接nolanPro对接机器人的token，请使用命令'set jd_cookie nolanPro_token ?'设置token进行对接")
        // }
        return false
    }
    if(SendSMS(Tel,nolanPro+"/sms/SendSMS")){
        console.log("nolanPro在线")
        let result=VerifyCode(Tel,nolanPro)
        if(result && result!==true){	//登陆成功
            console.log(result)
            let pin=decodeURI(result)==result?encodeURI(result):result
            s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
            if(pins.indexOf(pin)!=-1)
                notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：NolanPro短信")
            else
                notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：NolanPro短信")

        }
        return result
    }
    else{
        notifyMasters("报告老板，nolanPro疑似挂了！")
        return false
    }
}

function RabbitProSms(Tel){
    if(!rabbitPro){
        console.log("未对接rabbitPro！")
        return false
    }
    if(SendSMS(Tel,rabbitPro+ "/sms/sendSMS")){
        console.log("rabbitPro在线")
        let result=VerifyCode(Tel,rabbitPro)
        if(result && result!==true){	//登陆成功
            console.log(result)
            let pin=decodeURI(result)==result?encodeURI(result):result
            UpdateUserData(pin)	//更新账号数据
            s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
            if(pins.indexOf(pin)!=-1)
                notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：rabbitPro短信")
            else
                notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：rabbitPro短信")

        }
        return result
    }
    else{
        notifyMasters("报告老板，rabbitPro疑似挂了！")
        return false
    }
}


//nolanPro扫码登陆与口令登陆，服务失效返回false，登陆成功返回pin，超时返回true
function NolanProQR(){
//	const token=jddb.get("nolanPro_token")
    if(!nolanPro){
        console.log("未设置nolan扫码地址")
        return false
    }
    // else if(!token){
    // 	s.reply("未设置nolan扫码token")
    // 	return false
    // }
    let data=getQR(nolanPro+"/qr/GetQRKey")
    if(!data || !data.success){
        let tip="报告老板,NolanPro面板疑似挂了\n"
        tip+=data ? JSON.stringify(data) : ""
        notifyMasters(tip)
        return false
    }
    else if(!data.data.key){
        console.log("未知错误\n"+JSON.stringify(data))
        return false
    }
    //console.log(data.data.key)
    console.log("NolanPro在线")
    let loginkey=data.data.key
    let loginurl="https://qr.m.jd.com/p?k="+loginkey
    let qrurl="https://api.pwmqr.com/qrcode/create/?url="+loginurl
    //回复登陆二维码
    s.reply(s.getPlatform()=="qq"?st.CQ_Image(qrurl):image(qrurl))
    s.reply("请使用京东app扫码\n")

    //轮询是否登陆成功
    let limit=100
    while(limit-->0){
        sleep(2000)
        let option={
            url:nolanPro+"/qr/CheckQRKey",
            headers:{"Content-Type":"application/json"},
            method:"post",
            body:{"qrkey":loginkey}
        }
        // if(token){	//bot验证，添加后将入Pro bot容器，并在登陆成功后返回wskey，需自行维护wskey转换与ck分发
        // 	option.headers["Authorization"]="Bearer "+token
        // 	option.body["botApitoken"]=token
        // }
        resp=request(option)
        console.log(resp.body)
        data=JSON.parse(resp.body)
        if(data.success){	//登陆成功
            let pin=decodeURI(data.data.username)==data.data.username ? encodeURI(data.data.username) : data.data.username	//分析pin是否已经过编码，未编码则进行编码，以防中文pin
            if(pins.indexOf(pin)!=-1)
                notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：nolanPro扫码")
            else
                notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：nolanPro扫码")

            UpdateUserData(pin)	//更新账号数据
            s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
            return pin
        }
        else if(data.message=="请先获取二维码"){	//二维码失效
            s.reply("扫码超时")
            return true
        }
        else if(data.message=="二维码已取消授权"){
            s.reply(data.message)
            return true
        }
    }
    s.reply("扫码超时")
    return true
}

//登陆成功返回pin
function RabbitProQR(){
    if(!rabbitPro){
        console.log("未设置rabbitPro扫码地址")
        return false
    }
    else if(!ql_server){
        s.reply("未设置rabbitPro上车服务器！\nset jd_cookie rabbitPro_ql ?\n")
        return false
    }
    let data=getQR(rabbitPro+ "/api/GenQrCode")
    if(!data || data.code!=0){
        let tip="报告老板,rabbit扫码面板疑似挂了\n"
        tip+=data ? JSON.stringify(data) : ""
        sillyGirl.notifyMasters(tip)
        return false
    }
    else if(!data.QRCodeKey){
        console.log("未知错误\n"+JSON.stringify(data))
        return false
    }
    console.log("qrabbit在线")
    let loginkey=data.QRCodeKey
    let loginurl="https://qr.m.jd.com/p?k="+loginkey
    let qrurl="https://api.pwmqr.com/qrcode/create/?url="+loginurl
    //回复登陆二维码
    s.reply(s.getPlatform()=="qq"?st.CQ_Image(qrurl):image(qrurl))
    s.reply("请使用京东app扫码\n或者复制本段文字后进入京东APP（需开启京东app读取剪切板权限）:\n\n"+data.jcommond)

    //轮询是否登陆成功
    let limit=100
    while(limit-->0){
        sleep(2000)
        resp=request({
            url:rabbitPro+"/api/QrCheck",
            headers:{"Content-Type":"application/json"},
            method:"post",
            body:{
                "token": "",
                "container_id": Number(ql_server),
                "QRCodeKey": loginkey
            }
        })
        data=JSON.parse(resp.body)
        console.log(unescape("轮询响应 ===> "+resp.body.replace(/\\u/g,"%u")))
        if(data.code==200){	//登陆成功
            let pin=decodeURI(data.pin)==data.pin ? encodeURI(data.pin):data.pin
            if(pins.indexOf(pin)!=-1)
                notifyMasters("报告老板，[ "+pin+" ]更新账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：rabbit扫码")
            else
                notifyMasters("报告老板，[ "+pin+" ]添加账号！\n绑定客户："+s.getUserId()+"("+s.getPlatform()+")\n登陆方式：rabbit扫码")

            UpdateUserData(pin)	//更新账号数据
            s.reply("登陆成功，账号更新中...\n请等待几分钟后再查询账号信息")
            return pin
        }
        else if(data.code==503){	//扫码后取消登陆
            s.reply(data.msg)
            return true
        }
        else if(data.code==502){	//二维码失效
            s.reply("扫码超时")
            return true
        }
        else if(data.code==220){	//您的账号存在安全风险，请使用其他方式登
            s.reply(data.msg)
            return true
        }
        //其他code 56:未扫码 57:扫码未确认 503:取消扫码
    }
    s.reply("扫码超时")
    return true
}

//获取登陆二维码
function getQR(addr,token){
    let option={
        url:addr,
        headers:{"Content-Type":"application/json"},
        method:"post",
        body:{}
    }
    if(token){
        option.headers["Authorization"]="Bearer "+token
        option.body["botApitoken"]=token
    }
    let limit=3
    while(limit-->0){
        let resp=request(option)
        if(resp.status==200)
            return JSON.parse(resp.body)
        else {
            console.log(JSON.stringify(resp))
        }
    }
    return null
}



//检查pins中是否存在失效账号
function NeedLogin(pins,QL){
    if(!pins.length)	//新用户，尚未未绑定账号
        return true
    let envs=ql.Get_QL_Envs(QL.host,QL.token)
    if(!envs){
        console.log("获取青龙变量失败")
        return false
    }
    for(let i=0;i<pins.length;i++){
        let env=envs.find(env=>env.name=="JD_COOKIE" && pins[i]==env.value.match(/(?<=pin=)[^;]+/)[0])
        if(!env){
            console.log("无"+pins[i])
            return true
        }
        else if(!JD_isLogin(env.value)){
            console.log(pins[i]+"可能已失效")
            return true
        }
    }
    return false
}



//更新用户数据
function UpdateUserData(pin){
    //更新用户更新时间
    let now=(new Date()).toISOString()
    let userData={
        "ID":pin,
        "Pet":false,
        "Fruit":false,
        "DreamFactory":false,
        "Note":"",
        "LoginedAt":now,
        "ClientID":""
    }
    let jdNotify=new Bucket("jdNotify")
    let data=jdNotify.get(pin)
    if(data){
        userData=JSON.parse(data)
        userData.LoginedAt=now
    }
    jdNotify.set(pin,JSON.stringify(userData))
    //更新绑定关系
    let bind=new Bucket("pin"+s.getPlatform().toUpperCase())
    bind.set(pin,s.getUserId())//用户绑定
}

function JD_isLogin(ck){
    try{
        return Number(JSON.parse(request({
            url:"https://plogin.m.jd.com/cgi-bin/ml/islogin",
            headers:{
                "Cookie": ck,
                "User-Agent": "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1"
            }
        }).body).islogin)
    }
    catch(err){
        return null
    }
}


//短信验证
function VerifyCode(Tel,addr,token){
    let resp=null
    let option={
        url:addr+"/sms/VerifyCode",
        headers:{"Content-Type":"application/json"},
        method:"post",
        body:{
            "Phone": Tel,
            "container_id": Number(ql_server)
        }
    }
    if(token){
        option.headers["Authorization"]="Bearer "+token
        option.body["botApitoken"]=token
    }
    let TryAgain=function (i,data){
        if(data.message){
            if(data.message.indexOf("错误")!=-1){	//身份证号验证错误
                if(i==VerifyTimes-1){
                    s.reply("错误次数过多，退出")
                }
                else{	//再次提交验证码
                    s.reply(data.message)
                    return true
                }
            }
            else if(data.message.indexOf("账号存在风险")!=-1){
                s.reply("该账号受京东风控，请晚上8点后重试或者使用其他登陆方式")
            }
            else
                s.reply(data.message)
        }
        else
            s.reply("未知错误，请联系管理员\n"+JSON.stringify(data))
        return false
    }
    for(let i=0;i<VerifyTimes;i++){
        s.reply("请输入验证码：")
        let inp=s.listen(handle,WAIT)
        if(inp==null){
            s.reply("您已超时，请重新登录")
        }
        else if(inp.getContent()=="q"){
            s.reply("已退出")
            return true
        }
        if(inp.getContent().length!=6){
            s.reply("验证码错误，请重新输入")
            continue
        }
        option.body["Code"]=inp.getContent()
        resp=request(option)
        if(resp.status!=200){
            s.reply("登陆失败:"+resp.status)
            console.log(JSON.stringify(option)+"\n\n"+JSON.stringify(resp))
            return false
        }
        let data=JSON.parse(resp.body)
        if(data.success)	//登陆成功
            return data.pin?data.pin:data.data.username
        //二验
        else if(data.data.status==555){
            if(data.data.mode=="USER_ID")
                s.reply("该账号需验证身份,请输入您的身份证号前2位与后4位:")
            else if(data.data.mode=="HISTORY_DEVICE")
                s.reply("该账号需验证设备，请在三分钟内前往京东APP>设置>账户安全 新设备登录>确认登录\n\n请在完成如上操作后,回复“已确认”")
            else if(data.data.mode=="DANGEROUS_UP"){
                let info=data.data.message
                let tip="该账号需进行短信验证，请在三分钟内使用手机"+info.phone+"编辑短信“"+info.uplink_tocontent+"”发送至"+info.uplink_tophone
                tip+="\n请在完成如上操作后,回复“已确认”"
                s.reply(tip)
            }
            else{
                s.reply("未知验证，请联系管理员！\n\n"+JSON.stringify(data))
                return true
            }
            for(let j=0;j<VerifyTimes;j++){
                inp=s.listen(handle,WAIT)
                if(!inp){
                    s.reply("超时退出")
                    return true
                }
                else if(inp.getContent()=="q"){
                    s.reply("已退出")
                    return true
                }
                option.url=addr+"/sms/VerifyCard"
                option.body["Code"]=inp.getContent()
                resp=request(option)
                data=JSON.parse(resp.body)
                if(data.success)	//登陆成功
                    return data.pin?data.pin:data.data.username
                else if(TryAgain(j,data))
                    continue
                else
                    return true
            }
        }
        else if(TryAgain(i,data))
            continue
        else
            return true
    }
    return true
}

//获取验证码
function SendSMS(Tel,addr,token){
    let option={
        url:addr,
        headers:{"Content-Type":"application/json"},
        method:"post",
        body:{
            "Phone": Tel,
            "container_id": Number(ql_server)
        }
    }
    if(token){
        option.headers["Authorization"]="Bearer "+token
        option.body["botApitoken"]=token
    }
    let resp=request(option)
    if(resp.status==200){
        let data=JSON.parse(resp.body)
        if(data.message)
            s.reply(data.message)
        return data.success
    }
    return false
}


//获取二维码，基于自建服务
function QR_Gene(host,base64){
    let resp=request({
        url:host,
        method:"post",
        body:{
            image:base64
        }
    })
    if(resp.status==200)
        return true
    else{
        console.log(JSON.stringify(resp))
        return false
    }
}

//上传ck至青龙
function Submit_QL(host,token,env){
    let pin=env.value.match(/(?<=pin=)[^;]+/)
    if(pin==null)
        return false
    else
        pin=pin[0]
    let envs=ql.Get_QL_Envs(host,token)
    if(envs==null)
        return false

    let e=envs.find(Ele => Ele.name == env.name && Ele.value.match(/(?<=pin=)[^;]+/)[0] == pin)	//检查是青龙内是否已存在该ck
    if(!e){	//添加新ck
        env.remarks=s.getPlatform()+":"+s.getUserId()
        return ql.Add_QL_Envs(host,token,[env])
    }
    else{	//更新ck
        let id=e.id?e.id:e._id
        let remarks=e.remarks?e.remarks:s.getPlatform()+":"+s.getUserId()
        return  ql.Update_QL_Env(host,token,id,env.name,env.value,remarks) && ql.Enable_QL_Envs(host,token,[id])
    }
}

main()