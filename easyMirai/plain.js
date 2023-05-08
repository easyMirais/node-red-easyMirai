module.exports = function (RED) {
    function plain(n) {
        RED.nodes.createNode(this, n);
        let node = this;
        let global = node.context().global // 设置全局变量调用函数
        node.name = n.name;
        node.plan = n.plan || "Hello world!"
        node.conditionMode = n.conditionMode;


        // 获取初始化状态
        node.on("input", function (msg) {
            if (global.get("miraiInit")) {
                if (node.conditionMode === "customization") {
                    node.target = n.target;
                } else {
                    node.target = msg.target;
                }
                msg.payload = {
                    "sessionKey": global.get("miraiSession"),
                    "target": Number(node.target),
                    "messageChain": [
                        {
                            "type": "Plain",
                            "text": node.plan
                        }
                    ]
                }
                node.status({});
                node.send(msg);
            } else {
                node.status({fill: "red", shape: "dot", text: "请先放置Mirai模块！"});
            }
        })

    }

    RED.nodes.registerType("Plain", plain); // 绑定到节点
}




