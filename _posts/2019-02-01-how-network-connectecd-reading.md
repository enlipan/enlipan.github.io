---
layout: post
title:  读-网络是如何连接的
category: others
keywords: [improvement,life]
---

# 网络是怎样连接的?

## 浏览器内部探索

探索从输入 URL 之后浏览器开始请求服务器数据, Client 发生的事件. 

Socket 组件本质是一种OS 网络服务调用的标准实现库,最初由 C 语言开发,参照此实现其他语言有类似实现.
Socket 库被用于上层实现调用操作系统的网络服务.


### 网络请求过程:

从输入网址到生成 Http 请求消息, 委托操作系统传递消息.

* URL 地址访问            
* URL 规则解析          
* 根据 URL 定义的协议, 构建消息 Http协议则构建 http 消息    
* Http 消息体传输        
* 消息委托传输     
* 利用 Socket 库传输消息数据, Socket 库是一套标准库, 用于让上层应用可以调用 OS 的网络服务      
* 调用 Socket 委托协议栈发送消息至 DNS 解析获取到的指定地址     



### 消息的传输:



### 服务器连接管理:

* Web 应用的部署 
    * 部署安全问题, 可用性问题, 高性能问题    
    * 防火墙防治         
    * 负载均衡解决单机性能问题    
        * 负载均衡算法, 如何分配客户端请求        
        * 跨页面请求分配问题,关联请求必须分配到同一机器       
    * 职责切分服务器, 构建缓存服务器分担负载         
        * Via 头部标识    
  * 代理  
      * 正向客户端代理    
          * 客户端设置,请求转发, 过滤, 分发, 缓存        
      * 反向服务端代理   
          * 透明代理, 缓存服务, 根据请求数据中的包头 ip 地址, 透明转发, 客户端无感知  
* 内容分发服务  
    * 客户端缓存 , web 应用无法灵活运营控制    
    * 服务端缓存, 无法减轻互联网网络压力     
    * 客户端运营商, 借助内容分发服务法提供的应用服务托管服务, 达到离用户近, web 服务可自行运营    
        * 缓存服务的寻址, 为客户端请求精准寻址最高效的服务器, 路由距离探测    
        * Location 重定向客户端请求服务到对应服务器        
        * 缓存的更新策略.动静分离,由于动态内容如果更新需要通知内容分发缓存服务, 频繁的变动会导致网络性能问题, 最后采取仅保存静态内容到缓存中, 如图片/视频等大流量内容.   


### 服务器应用的响应

Socket/ Tcp 通信的双端属于对称, 并没有明确的客户端和服务端, 唯一有明显区别的是连接过程, 一方需要等待连接,另一方才能去建立连接.
因此最终认定发起连接的一方是客户端,等待连接的是服务端.
       
Socket 标识: 
* 客户端 IP  
* 客户端端口     
* 服务端 IP  
* 服务端端口 

以上信息在 IP 头部和 TCP 头部包含.  


* 网卡电信号/光信号 还原数字信号 
    * 网卡mac模块, 将数字信号还原, 同时校验报头和 FCS包尾一致性, 最后将数据存入网卡内部缓冲区,同时利用中断通知 CPU 处理  
    * 操作系统调用协议栈执行数据的接受操作.   
    * IP 模块接受校验处理        
    * TCP 模块处理包数据     
    * Web 服务器解释请求消息处理响应    
    * 响应消息分包通过电信号在线路中传递,进而客户端接受到数据后, 网卡还原数据, 操作系统协议栈处理.



*** 


## HTTP负载均衡

HTTP 集群负载均衡设计: 高性能系统优化   

**没有一种解决方案能够解决所有问题,因地制宜,合适的才是最好的**


用户的扩张, 从早期的单机器负载到机器集群负载的变化.

#### Q1:多服务器之间如何均衡流量,为用户选择合适的服务器进行响应处理? 如何组成高性能集群的?

负载均衡: 将用户访问流量通过负载均衡器,根据某种转发策略, 均匀分发到多端后台服务器上.后台的服务器均可以独立响应与处理用户请求,从而实现分散负载目的.  



#### 负载均衡方案

*  基于 DNS    
*  基于硬件  如: F5     
*  基于软件  如:  Nginx/Squid            



##### DNS 方案优劣:

优势: 配置简单,实现成本低        
劣势: 配置修改后,由于 DNS 多级缓存存在,IP 变更不及时,时效性上影响负载均衡效果.     

DNS 实现方式: 基于地域/ IP 轮询 

##### 基于硬件:

优势: 简单,性能强大     
劣势: 成本高昂

实现方式: 通过网络硬件设备(类似交换机),通过硬件来进行流量压力



##### 软件负载均衡:


实现方式:        
* 传输层负载均衡方案:  LVS        
* 应用层负载均衡方案:  Nginx          



#### 均衡算法

*  轮询算法:        
> 不关注服务器本身状态,利用轮询轮流转发请求.(顺序轮询/随机轮询/权重轮询)   


*  负载度策略:       
>  转发前评估后端服务器状态,根据负载压力的计算来进行动态分配流量          

*  响应策略   
>  收集所有服务器响应速度,进行排行榜,永远最优先选择最快响应的服务器响应用户请求.  


*  哈希策略   
>  将请求信息中的某个值进行 hash 运算, 根据后端服务器台数取模,得到对应策略值,如果相同值的请求被转发到同一台服务器上.

---

[HTTP负载均衡](https://zhuanlan.zhihu.com/p/44267640)

*** 

## WebSocket 协议

另一个上层应用协议,与 Http 协议的差异在于 Http 属于单向请求协议,但当服务端数据连续变化时,就需要客户端轮询处理,非常麻烦.

WebSocket 协议建立在 Tcp 之上,协议与Http 协议有较好兼容性,且握手阶段采用 Http 协议.

协议标识: ws/wss;  


WebSocket 看起来更像是为了解决双端主动通信的一种基于 Http 协议的补丁协议, 实现了真全双工长链接.

WebSocket 协议利用 Http 做连接协商,然后独立运行在TCP传输层上的应用协议.WebSocket 的传输本质是依赖TCP的长链接进行处理.HTTP协议的无状态是因为协议每次处理完成之后,自动关闭 Socket.

WebSocket 的链接建立后,服务端保持了与 Client 的连接, 同时二者之间不停发送心跳包,验证在线状态.进而在二者可以确定互相在线状态下进行消息的全双工推送处理.


![](https://file.oncelee.com/20190310135127.png)

* ws.onopen()  
* ws.onmessage()     
* ws.onerror()          
* ws.onclose()        


客户端握手请求利用 Http 协议, 标识字段 Upgrade: websocket. 

服务端返回: 
```
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept:
```

其中 Sec-WebSocket-Accept 是服务端采用与客户端一致的秘钥计算之后返回到客户端的.

> 一个使用WebSocket应用于视频的业务思路如下：
    使用心跳维护websocket链路，探测客户端端的网红/主播是否在线
    设置负载均衡7层的proxy_read_timeout默认为60s
    设置心跳为50s，即可长期保持Websocket不断开
    

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

