var request = require('request');

module.exports = function (RED) {
    function easyMiraiMirai(n) {

        RED.nodes.createNode(this, n);
        let node = this;
        let global = node.context().global
        node.name = n.name;
        node.miraiDebug = n.miraiDebug
        node.miraiHost = n.miraiHost || "none"
        node.miraiPort = n.miraiPort || "none"
        node.miraiId = n.miraiId || "none"
        node.miraiKey = n.miraiKey || "none"
        // 部署后立即执行
        let msg = {payloads: n};
        // 检测是否参数填写完整
        if (node.miraiHost == "none" || node.miraiPort == "none" || node.miraiKey == "none" || node.miraiId == "none") {
            node.status({fill: "red", shape: "dot", text: "未配置节点1"});
        } else {
            global.set("miraiHost", n.miraiHost); // 设置全局变量
            global.set("miraiPort", n.miraiPort);
            global.set("miraiId", n.miraiId);
            global.set("miraiKey", n.miraiKey);

            let verify = {
                method: "POST",
                url: 'http://' + n.miraiHost + ':' + n.miraiPort + "/verify", // 组合地址
                headers: {},
                encoding: null,
                body: '{"verifyKey": "' + global.get("miraiKey") + '"}'
            };
            request(verify, function (error, response, body) {
                if (error) {
                    if (error.code === 'ETIMEDOUT') {
                        node.status({
                            fill: "yellow",
                            shape: "ring",
                            text: "连接超时"
                        });

                    } else if (error.code === 'ECONNREFUSED') {
                        node.status({
                            fill: "red",
                            shape: "ring",
                            text: "服务地址不存在"
                        });
                    } else {
                        node.status({
                            fill: "red",
                            shape: "ring",
                            text: "未知错误"
                        });
                    }
                } else {
                    msg.payload = body;
                    msg.payload = msg.payload.toString('utf8');
                    msg.payload = JSON.parse(msg.payload);
                    // node.send(msg)
                    global.set("miraiSession", msg.payload.session);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "服务器连接成功"
                    });

                }
            })


            // 绑定Session到指定botId
            let session = {
                method: "POST",
                url: 'http://' + n.miraiHost + ':' + n.miraiPort + "/bind", // 组合地址
                headers: {},
                encoding: null,
                body: '{"sessionKey": "' + global.get("miraiSession") + '","qq": ' + global.get("miraiKey") + '}',
            };
            request(session, function (error, response, body) {
                if (error) {
                    if (error.code === 'ETIMEDOUT') {
                        node.status({
                            fill: "yellow",
                            shape: "ring",
                            text: "连接超时"
                        });

                    } else if (error.code === 'ECONNREFUSED') {
                        node.status({
                            fill: "red",
                            shape: "ring",
                            text: "服务地址不存在"
                        });
                    } else {
                        node.status({
                            fill: "red",
                            shape: "ring",
                            text: "未知错误"
                        });
                    }
                } else {
                    msg.payload = body;
                    msg.payload = msg.payload.toString('utf8');
                    msg.payload = JSON.parse(msg.payload);
                    node.status({
                        fill: "green",
                        shape: "dot",
                        text: "服务器连接成功"
                    });

                }
            })
        }


        if (node.miraiDebug) {
            let info = {
                "msg": "服务器绑定成功",
                "host": global.get("miraiHost"),
                "port": global.get("miraiPort"),
                "botID": global.get("miraiId"),
                "verifyKey": global.get("miraiKey"),
                "session": global.get("miraiSession"),
            }
            node.warn(info)
        }
        global.set("miraiStatus", true); // 后续判断是否初始化
        // node.send(msg)
    }

    function easyMiraiGetMessage(n) {
        // 获取队列消息
        RED.nodes.createNode(this, n);
        let node = this;
        let getMode = n.getMode;
        let global = node.context().global;
        node.on('input', function (msg) {
            if (global.get("miraiStatus") === true) {
                // 主执行程序代码块
                let uri;
                if (getMode === "count") {
                    // 获取队列大小
                    uri = "/countMessage?sessionKey=" + global.get("miraiSession");
                } else if (getMode === "fetch") {
                    // 获取队列头部
                    uri = "/fetchMessage?sessionKey=" + global.get("miraiSession")+"&count=" + n.count;
                } else if (getMode === "fetchLatest") {
                    // 获取队列尾部
                    uri = "/fetchLatestMessage?sessionKey=" + global.get("miraiSession")+"&count=" + n.count;
                } else if (getMode === "peek") {
                    // 查看队列头部
                    uri = "/peekMessage?sessionKey=" + global.get("miraiSession")+"&count=" + n.count;
                } else if (getMode === "peekLatest") {
                    // 查看队列尾部
                    uri = "/peekLatestMessage?sessionKey=" + global.get("miraiSession")+"&count=" + n.count;
                } else {
                    // 自定义

                }
                uri = {
                    method: "GET",
                    url: 'http://' + global.get("miraiHost") + ':' + global.get("miraiPort") + uri, // 组合地址
                    headers: {},
                    encoding: null,
                }

                request(uri, function (error, response, body) {
                    if (error) {
                        if (error.code === 'ETIMEDOUT') {
                            node.status({
                                fill: "yellow",
                                shape: "ring",
                                text: "连接超时"
                            });

                        } else if (error.code === 'ECONNREFUSED') {
                            node.status({
                                fill: "red",
                                shape: "ring",
                                text: "服务地址不存在"
                            });
                        } else {
                            node.status({
                                fill: "red",
                                shape: "ring",
                                text: "未知错误"
                            });
                            node.send(error.code);
                        }
                    } else {
                        msg.payload = body;
                        msg.payload = msg.payload.toString('utf8');
                        msg.payload = JSON.parse(msg.payload).data;
                        node.send(msg);
                    }
                })
            } else {
                node.error("请先放置'Mirai'模块！");
            }
        });
    }

    function easyMiraiText(n) {
        // 发送文本编码
        RED.nodes.createNode(this, n);
        let node = this;
        let global = node.context().global;

        node.on('input', function (msg) {
            node.send(msg)
        });

    }


    RED.nodes.registerType("Mirai", easyMiraiMirai); // 绑定到节点
    RED.nodes.registerType("Get Message", easyMiraiGetMessage); // 绑定到节点
    RED.nodes.registerType("Text", easyMiraiText);

}

