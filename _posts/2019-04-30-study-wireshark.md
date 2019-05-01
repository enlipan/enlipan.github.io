---
layout: post
title:  WireShark 学习
category: network
keywords: [improvement,android,network,java,js]
---

## WireShark 使用

网络协议的了解是基础.

如果用于分析 HTTP/HTTPS 相关使用 Fiddler/Charlse ,而 TCP/UDP 底层相关则使用 WireShark.

wireshark 捕获机器上某网卡的网络包,当机器有多网卡时需要手动选择指定网卡设备.为安全考虑, WireShark 只能查看封包, 而无法修改包以及发送封包.
WireShark 无法解 HTTPS 的内容,如果需要解密,需要导入密钥进行破解.


页面组成: 

* 过滤器       
* 封包列表         
* 封包详情         
* 16 进制数据信息         
* 地址栏

过滤器的使用:

* Capture 网络数据捕获过滤器: 用于决定什么数据被显示在捕捉结果中,捕捉前设置.    
* 显示过滤器: 捕捉结果中用于详细定位查找,可以随意更改.

显示过滤器规则: 

Protocol(ip/tcp/udp/arp…) & Direction(src/det) & Host & Value & Logical(and/or/not)

* 协议过滤: tcp  只显示 tcp 协议  
* ip host 102.168.1.1  
* tcp.port eq 130
* ip 过滤: ip.src == 192.168.0.1 只显示 ip 源地址为x 的连接.(ip.dst)     
* 端口过滤: tcp.port == 80   
* http.request.method == “GET” 


匹配表达式: 
* http.request.uri mathes “.gif$” 已 gif 结尾的 http 请求.  
* eth.addr[0:3] mac 地址前 3 个字节匹配   

封包详情: 
* Frame 物理层的帧数据情况       
* Ethernet II: 数据链路层以及以太网帧头部信息           
* Internet Protocol Version : 互联网层 IP 包头部信息        
* Transmission Control Protocol : 传输层的数据段头部信息, 如对应 TCP           
* Hypertext Transfer Protocol : 应用层信息. 如对应 Http

清晰的五层结构,层层解封.

设备间的通信过程: 
如果 A,B 设备在同一子网,ping 过程中,AB 直接通信,否则通过网关,ARP 协议广播查询定位设备,确定后由网关转发指令,最终设备直接回复.

#### 快捷模式: 

右键选择: 
Followed /  Prepared as a filter 


#### 分析与统计数据 

Analysis 获取信息的统计信息, expert infomation;  

Statistics 获取信息的静态分析信息,常用于性能分析;      


#### HTTP 协议

HTTP 基于 TCP, WireShark可以看到握手过程,  WireShark 可以探测明文 HTTP,但无法解密 HTTPS, 如果需要解密需要手动导入密钥.

#### 网络分层 

TCP/IP 中的分层与模块化思想, TCP/IP 完成了两件事:       
* 主机级别的端到端协议 : TCP 协议, 传输层协议完成
* 网络的分组以及路由协议: IP 协议, 网络层协议完成  

四层模型更为科学: 

* Application  Layer           
* Transport  Layer  : 数据传输行为封装,保障数据在通道中的传输        
* Internet  Layer   : 网络互联层   
* Network Access  Layer  : 网络接口层: MAC 地址添加,数据以接力形式在网络中传递


#### TCP 

最大传输单元. 通信双方 MTP 的探测感知,在三次握手过程中 mss 信息交换.

MTU 由网络传输中较小的一侧决定,巨帧方适配小 MTU 方.

一些的信息都在 Internet Protocol 信息中, 可以通过 Total Length
查看信息.


TCP 中的 Seq 序号维护逻辑: 

TCP 是双工, 双端都可发送, 两端各自维护了自己的 Seq 编号, 编号逻辑: 

Seq Next = Seq  + Len; 


ACK 确认回复: 

ACK = Seq + Len; 表示收到了 Seq + Len 之前的所有信息.  


TCP 乱序包的重排: 利用 Seq 编号重新构建有序字节数据.   

其他标志: 

SYN: 连接建立过程.   

FIN: 终止连接.  

RST: 重置混乱连接. 拒绝无效请求.   

三次握手:  
四次挥手: 全双工连接, 两方都要通知断开.

TCP 的滑动窗口机制: 

网络传输的影响因素:  发送端发送速度(发送窗口),  接受端负载能力(接收窗口), 网络承载能力等

发送窗口对于性能影响: 发送窗口为X MSS(TCP 最大传输数据量), 连续发送 若干个 MSS,无需等待确认,一旦窗口消耗完毕等待接受端ACK 反馈,决定是否丢包重传.TCP 允许累计确认,因而 ACK 确认包数量一般小于发送包数量,无需每一个发送消耗一个往返时间.

发送窗口决定能一次性发送多少字节, MSS 决定这些字节需要发送多少个包传输.  

Window Scale 最大接受窗口扩展方式, 可能被防火墙禁止.

#### TCP 重传机制 

慢启动 + 拥塞避免算法.  

慢启动初期指数级翻倍增加,基数较小,增量较大,慢启动到一定程度,基数到一定程度后,不再翻倍,此时进入临界点,称之为临界窗口值,进入拥塞避免过程, 每个启动时间增加 1MSS. 

一旦产生拥塞过程, 发出去的包得不到确认收到的反馈, 就进入了超时逻辑, 超时重传. 从原始包发送到超时重传的时间为 RTO. 
进入重传逻辑, 重新调整窗口大小,降低网络拥塞概率,RFC 设定重新设定窗口为 1MSS 进入慢启动过程. 
超时重传对于传输效率影响非常大,一方面由于等待时间无法传输数据,另一方面由于要重新进入慢启动.

临界窗口值大小,RFC5681建议将数据改为未被确认的数据量的 1/2.

快速重传,少量丢包的情况下, 后续的包正常 ACK 的同时,反馈所丢失的 Seq号,发送端连续收到 3 个同样的 Seq 时,进入快速重传阶段,无需像超时重传一样需要等待时间. 
在快速重传阶段,无需像超时重传一样重新进入慢启动,随后稍稍减慢后进入快速恢复过程.   

SACK 机制有利于快速提高重传效率.  

---

Quote:

WireShak 网络分析就这么简单 

WireShark 网络分析艺术


