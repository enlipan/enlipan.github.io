---
layout: post
title:  看Retrofit 2
category: android
keywords: [framework]
---

Retrofit完成结构化数据转换，Data to  DataBean之间的转换，以便于开发专注对Java对象的OO类型操作；Retrofit将 网络API请求转换为Java接口的形式，其定义的针对REST API的注解声明网络请求操作，形式类似 SpringMVC的注解操作；利用注解描述HTTP请求，从实际上来看有些类似ORM（数据库结构数据与JavaBean）框架做的事情；

Retrofit 支持请求时Object对象到 request 请求体之间的转换，而数据返回时自动转化数据到Object，同事支持 MultiPart 请求体（多个请求对象）以及文件upload；

Retrofit 自动为所定义的针对 API的接口生成对应的网络实现；简化网络请求实现；同时提供了插件化形式的高度可自定义度；

Retrofit支持5中RESTful请求注解：GET,POST,PUT,DELETE,HEAD(获取头信息，可高效检测链接有效性)；

Retrofit可以结合 OkHttp（一个处理Http通信的强大库，用所配置的形式高效Http请求，接受服务端返回数据）使用；

Retrofit 的链接设定格式支持多种：但是有一些奇怪的 链接拼接，如：






---

Quote:

[Retrofit Doc](http://square.github.io/retrofit/)

[Retrofit – Java(Android) 的REST 接口封装类](http://blog.chengyunfeng.com/?p=491&utm_source=tuicool&utm_medium=referral)

[Retrofit 2.0](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0915/3460.html)

[OkHttp使用教程](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0106/2275.html)
