---
layout: post
title:  网络长链接
category: android
keywords: [improvement,android,network,java,js]
---

{:center}
![Socket 长连接](https://file.oncelee.com/20190501224256.png)

## TCP 长链接

通信的双端维护虚拟的TCP 通道.  

TCP 自带维护链接的机制(TCP 默认设置基本不可用),TCP keep-alive ,自动清除死链接,尝试探测是否有数据通信,没有数据通信的链接将被清理.客户端心跳包发送, 服务端检测客户端在线状态, 用于缓存数据清理. 

实现的方案一: 探知 tcp的链接中断状态判断. socket 流数据获取最终状态.  

方案的问题: 

tcp 的链接状态无法瞬时探知,如果没有触发4次挥手的 tcp 断开过程, 服务端无法得知前端的网络断开状态. 而一旦依赖于 tcp 的 keep-alive 机制, 服务端网络会变得无法控制,一则 keep-alive 的时间难以平衡. 
tcp alive 面向清除回收死亡时间长的连接, 不适用于高实时性场景, 连接断开一段时间之后依旧无感知.  

服务端探测客户端状态,存在以下几种 Case:  

* 客户端活跃

* 客户端崩溃, 主机探测失败    

* 客户端崩溃重启   

* 客户端存在, 但主机网络通道不可达. 等同客户端崩溃. 

tcp 的半开/半闭连接状态, 网络信道异常中断,导致一方知道断开, 另一方不知道.tcp 的 keep-alive 的问题, 引入应用层心跳包解决问题;

keep Tcp Alive: 

*  能够感知 Socket 连接的存活状态,了解 Socket 当前是否依旧运行或是中断


那如何实现通信连接的保活? 

* 构建绑定了定时器的 tcp 连接, 这些定时器调度任务用于处理 tcp 连接的保活, 每当定时器调度时间到达, 发送另一端一个无实际数据的探测包,同时受到一个 ACK 确认.一旦探测包受到回复的ACK数据,就表示连接依旧存活有效.

* 机制被用于校验连接有效性, 同时清理本机状态.    

核心目标: 
* 清理本机死链,优化资源          
    * 经过三次握手建立的全双工连接,一旦一方等待接受另一方数据, 而另一方因为异常问题崩溃, 如网线断开之类, 后续另一方网络重连之后, 等待方无法得知, 解决问题的关键就在于,等待方在发送探测包之后,重连方回复复位标志, 等待方进而知道状态的异常, 主动申请进入四次挥手流程关闭连接.
* 阻止闲置状态下的连接异常断开       

---

## Socket

### 什么是 Socket?

[socket 的解释](https://stackoverflow.com/questions/152457/what-is-the-difference-between-a-port-and-a-socket)

Socket 本身并不代表 connection , Socket 代表着特定 Connection 的端点对象, 由特定 TCP 连接或者侦听状态这些场景下的IP 地址和端口定义.  

**对于给定的地址与端口组合, 只能有一个监听状态下的 Socket.** 


> A TCP connection is defined by two endpoints aka sockets.
    
> An endpoint (socket) is defined by the combination of a network address and a port identifier. Note that address/port does not completely identify a socket (more on this later).

*** 

> A connection is fully specified by the pair of sockets at the ends. A local socket may participate in many connections to different foreign sockets.

一个连接由其端点一对特定的 Socket 指定.Socket 由其对应 ip 地址,段对端协议(TCP/UDP),端口号所确定.

Socket 本质是一个抽象的概念, 应用借助 Socket 传递或者接受数据.


![](https://file.oncelee.com/20190215015117.png)


![](https://file.oncelee.com/20190215015547.png)

针对点对点 Socket 链接的双方, 服务端 Socket 等待 Client 连接,并响应 Client 请求.   而 Client Socket 根据服务端 IP 地址与端口发起建立连接.

![](https://file.oncelee.com/20190215015914.png)

[](https://www.csd.uoc.gr/~hy556/material/tutorials/cs556-3rd-tutorial.pdf)

### 基于 TCP 的消息传递

Client Socket 建立连接  Service Socket 

---

## Socket.io

Socket.io 实现了 WebSocket 的封装. Sockt.io 默认的 transport 为了保持兼容性,先探测使用 longpolling, 进而在 handshake 过程中借助 upgrade将支持 ws 的双端连接通道升级为 WS;  

{% highlight javascript %} 

Socket.io 配置: 
* 重发超时时间: 心跳响应时间超时       
* 连接超时时间: 连续多少次心跳无响应.

heartbeat interval: 服务端每隔多久发送心跳包到客户端,客户端直接响应, 没有收到心跳包探测响应,认为客户端断开连接.

heartbeat timeout: 客户端多久没有从服务端收到心跳探测包,认为服务端断开连接.

* 动态修改 socket 共享配置参数:
socket.heartbeatTimeout = 20000; // reconnect if not received heartbeat for 20 seconds

* socket.io 1.x

pingInterval: 每隔多长时间发送一个ping心跳包.
pingTimeout: 最长时间多久没有收到客户端 pong 响应.

{% endhighlight %}


> As far as I can tell, there are 2 values that matter here: the server sends heartbeats to the client every heartbeat interval seconds; the client responds directly, if there is no response, the server decides the client is dead. The client waits for a heartbeat from the server for heartbeat timeout seconds since the last heartbeat (which should obviously be higher than the heartbeat interval). If it hasn't received word from the server in heartbeat timeout seconds, it assumes the server is dead (and will start disconnecting / reconnecting based on the other options you have set.

{% highlight java %} 

Android Socket 设置

Socket.keepAlive 默认使用 Linux 默认设置: 

# cat /proc/sys/net/ipv4/tcp_keepalive_time
7200
# cat /proc/sys/net/ipv4/tcp_keepalive_intvl
75
# cat /proc/sys/net/ipv4/tcp_keepalive_probes
9

{% endhighlight %}

### 应用层心跳设置:

1. 应用层发送自定义心跳数据  

2. socket.sendUrgent()   

> 微信的心跳策略: 微信自从登录成功后,创建的业务链接每隔2分钟即会向服务器发送一个82字节的心跳包。由于Android系统允许程序在后台运行,当微信被 切入后台后,微信的业务链接并没有断开,将继续以此频次发送心跳包。也就是说,Android版本的微信只要运行并登录成功后,将24小时不间断地发送心跳包,这样, 即使对微信不进行任何操作,微信 每天将发送24x30=720个数据包, 数据量为24x30x82=59K字节,按月计算折合每月22 320个数据包或 1.83M字节数据。


### 问题:

1. 服务器重启,大面积长链接掉线, 瞬时大面积长链接重连,造成网络阻塞,服务器崩溃         
2. 长链接数量过多影响服务端性能和并发数量.   

### Socket.io 源码

forceNew/ multiPlex 配置: 

{% highlight javascript %} 


// 是否使用 Socket 缓存通道,开启通道复用逻辑.
boolean newConnection = opts.forceNew || !opts.multiplex || sameNamespace;

if (newConnection) {
    logger.fine(String.format("ignoring socket cache for %s", source));
    io = new Manager(source, opts);
} else {
    if (!managers.containsKey(id)) {
        logger.fine(String.format("new io instance for %s", source));
        managers.putIfAbsent(id, new Manager(source, opts));
    }
    io = managers.get(id);
}

{% endhighlight %}


Socket 开启与配置过程: Socket.open().

> Socket.IO never assumes that WebSocket will just work, because in practice there’s a good chance that it won’t. Instead, it establishes a connection with XHR or JSONP right away, and then attempts to upgrade the connection to WebSocket. Compared to the fallback method which relies on timeouts, this means that none of your users will have a degraded experience.
> 默认开启 polling 模式,然后启动升级模式至 WS 模式.

自定义控制设置 transport 列表为 WS;

{% highlight java %} 
EVENT_PACKET = "packet"; //触发事件

private void onHandshake(HandshakeData data) {
    this.emit(EVENT_HANDSHAKE, data);
    this.id = data.sid;
    this.transport.query.put("sid", data.sid);
    this.upgrades = this.filterUpgrades(Arrays.asList(data.upgrades));
    this.pingInterval = data.pingInterval;
    this.pingTimeout = data.pingTimeout;
    this.onOpen();
    // In case open handler closes socket
    if (ReadyState.CLOSED == this.readyState) return;
    this.setPing();

    this.off(EVENT_HEARTBEAT, this.onHeartbeatAsListener);
    this.on(EVENT_HEARTBEAT, this.onHeartbeatAsListener);
}


{% endhighlight %}


---

Quote: 

Socket.io

[TCP Keepalive HOWTO](http://www.tldp.org/HOWTO/html_single/TCP-Keepalive-HOWTO/)




