const request = require("request");
module.exports = function (RED) {
    let request = require('request');
    const config = {
        "verify": "/verify",
        "bind": "/bind",
    }

    function mirai(n) {
        RED.nodes.createNode(this, n);
        let node = this;
        let msg = {};
        let data;
        let global = node.context().global // 设置全局变量调用函数
        node.name = n.name;
        node.miraiDebug = n.miraiDebug
        node.miraiHost = n.miraiHost || "none"
        node.miraiPort = n.miraiPort || "none"
        node.miraiId = n.miraiId || "none"
        node.miraiKey = n.miraiKey || "none"
        global.set("miraiInit", false); // 设置初始化状态
        if (node.miraiHost !== "none" || node.miraiPort !== "none" || node.miraiKey !== "none" || node.miraiId !== "none") {
            global.set("miraiHost", n.miraiHost); // 基本信息设置全局变量
            global.set("miraiPort", n.miraiPort);
            global.set("miraiId", n.miraiId);
            global.set("miraiKey", n.miraiKey);

            // 获取Session码

            data = {
                "verifyKey": global.get("miraiKey")
            }
            data = {
                method: "POST",
                url: 'http://' + global.get("miraiHost") + ':' + global.get("miraiPort") + config.verify,
                body: JSON.stringify(data) // 转成String格式
            }
            request(data, function (error, response, body) {
                if (~error) {
                    if (response.statusCode === 200) {
                        // 信息请求正常
                        body = body.toString('utf8');
                        body = JSON.parse(body);
                        if (body.code === 0) {
                            msg.payload = body;
                            node.status({fill: "green", shape: "dot", text: "配置节点完成"});
                        } else {
                            msg.payload = {
                                "code": body.code,
                                "msg": body.msg
                            }
                        }
                    } else {
                        // 请求成功但有错误状态码
                        msg.payload = {
                            "code": 1,
                            "msg": response.statusCode
                        }
                        node.status({fill: "yellow", shape: "dot", text: response.statusCode});
                    }
                } else {
                    // 出现请求错误的时候
                    msg.payload = {
                        "code": 2,
                        "msg": error.code
                    }
                    node.status({fill: "yellow", shape: "dot", text: error.code});
                }
                node.send(msg)
            })

            data = {
                "verifyKey": global.get("miraiKey")
            }
            data = {
                method: "POST",
                url: 'http://' + global.get("miraiHost") + ':' + global.get("miraiPort") + config.verify,
                body: JSON.stringify(data) // 转成String格式
            }
            request(data, function (error, response, body) {
                if (~error) {
                    if (response.statusCode === 200) {
                        // 信息请求正常
                        body = body.toString('utf8');
                        body = JSON.parse(body);
                        if (body.code === 0) {
                            msg.payload = body;
                            node.status({fill: "green", shape: "dot", text: "配置节点完成"});
                        } else {
                            msg.payload = {
                                "code": body.code,
                                "msg": body.msg
                            }
                        }
                    } else {
                        // 请求成功但有错误状态码
                        msg.payload = {
                            "code": 1,
                            "msg": response.statusCode
                        }
                        node.status({fill: "yellow", shape: "dot", text: response.statusCode});
                    }
                } else {
                    // 出现请求错误的时候
                    msg.payload = {
                        "code": 2,
                        "msg": error.code
                    }
                    node.status({fill: "yellow", shape: "dot", text: error.code});
                }
                node.send(msg)
            })


        } else {
            node.status({fill: "red", shape: "dot", text: "未配置节点"});
        }


    }

    RED.nodes.registerType("Mirai", mirai); // 绑定到节点
}

