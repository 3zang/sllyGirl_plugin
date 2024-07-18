/**
 * @author cdle
 * @create_at 2022-09-12 17:36:36
 * @description ⏰插件中内置时间相关的方法，理解靠悟性。
 * @version v1.0.0
 * @title 时间处理
 * @rule 时间处理
 * @public false
 * @icon https://hi.kejiwanjia.com/wp-content/uploads/2022/03/1.png
 */

var now = time.now().add(1200 * 60 * 1000)

console.log("1. " + now.string())
console.log("2. " + now.unix())
console.log("3. " + now.before(time.now().add(time.day)))
console.log("4. " + now.after(time.now().add(time.second)))
console.log("5. " + now.unixMilli())
console.log("6. " + now.format("2006-01-02"))
console.log("7. " + now.format("2006-01-02 15:04:05"))
console.log("8. 格式化:" + time.unixMilli(1692330574000))
console.log("9. " + time.unix(1662979463))
console.log("9. 格式化时间:" + time.unixMilli(1692330574000))
console.log("10. " + time.parse("2024/12/12", "2006/01/02"))
console.log("11. " + time.parse("2024/12/12 10:11:12", "2006/01/02 15:04:05"))
console.log("12. " + time.parse("2024/12/12 10:11:12", "2006/01/02 15:04:05", "America/Los_Angeles"))
console.log("13. " + time.parse("2024/12/12 10:11:12", "2006/01/02 15:04:05", "Asia/Shanghai"))

console.log("14. " + "当前时间: " + time.now().string().substr(0, 19))

console.log("15. " + "下次时间: " + now.add(3000).format("2006-01-02 15:04:05"))
//new Bucket("fruit_record").set("updateTime",time.now().string().substr(0, 19))

console.log(JSON.stringify(time),new Date(now.unix()))

var date =new Date(1719270950000)

console.log(date)