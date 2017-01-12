---
layout: post
title:  Http 知识更新
category: others
keywords: [improvement,java]
---

### Http基础:

Http0.9：

Http1.0RFC：

Http1.1标准：

Http2.0性能：


###  Http安全:

Https： Http + SSL

Https解决的几大问题：

*  通信明文被窃听的问题      
*  通信双方身份确认的问题            
*  通信内容完整性，中间人攻击篡改内容的问题


###  Http数据缓存:   

客户端本地磁盘缓存


缓存服务器

缓存有效性校验：缓存的有效期限

Cache-Control首部字段：no-cache 与 no-store的差异


### Http的持久连接 与Cookie

Connection首部字段：


Cookie：


###  Http2.0相关:

Http2.0主要为解决Http1.1逐渐开始跟不上的性能需求问题，为追求更好的Web性能与速度；

*  SPDY协议：主要解决Http的几个短板：**无状态连接，一条连接一个请求，请求必须从客户端开始，请求响应头的无压缩，以及冗余首部信息，以及无强制压缩损耗可能的空间问题**


*  全双工通信-WebSocket：

> 在网络浏览器和服务器之间建立“套接字”连接。客户端和服务器之间存在持久的连接，而且双方都可以随时开始发送数据.



---

Quote:

《图解HTTP》

《Web性能权威指南-第三部分》

[Security with HTTPS and SSL](https://developer.android.com/training/articles/security-ssl.html)

[Http缓存](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=zh-cn)

[彻底弄懂 Http 缓存机制 - 基于缓存策略三要素分解法](http://mp.weixin.qq.com/s/qOMO0LIdA47j3RjhbCWUEQ)

[SSL/TLS原理详解](http://seanlook.com/2015/01/07/tls-ssl/)

[Introduction to HTTP/2](https://developers.google.com/web/fundamentals/performance/http2/?hl=zh-cn)


[HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)

[WebSockets 简介：将套接字引入网络](https://www.html5rocks.com/zh/tutorials/websockets/basics/#toc-usetoday)
