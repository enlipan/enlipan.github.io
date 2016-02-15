---
layout: post
title: Android Token 相关
category: android
---

Token 是Android  网络请求中经常用到的一个概念，但到底是什么东西感觉自己懵懵懂懂，只知道是身份校验，但具体是什么其实还不能完全说上来；

Token一般与Session 放到一起比较，其主要区别是 Session 位于被存储于服务器端，客户端仅仅持有 Session ID，而 Token 是保存在客户端，一般加入请求提交服务器作用户请求身份验证；

Session 的存在源于 Http 无状态，其是一种Http存储机制，Session 由客户端首次访问服务器时由服务器端生成并持有，同时在响应中将SessionID以报文方式交由客户端，客户端只有session id，通过校验SessionID 去保持会话；

Token的产生源于减轻服务器在验证用户请求有效性时而带来的用户名密码的数据库查询校验压力，为了减轻这种压力，服务器产生一组令牌字符串，用于提供客户端请求有效性的认证与授权，也就是说当请求带有合法有效的Token时才会去校验返回数据；Token的状态是存储在客户端 ；

而就安全性而言因为状态信息全部是放在客户端，为了避免被篡改，一般需要用密码学的相关方法来签名进一步保证安全性，而与之对比 Session ID产生的随机性以及其时效性，因而一般情况下认定Sessio ID是安全的；

Session 只提供一种简单的认证，即一旦拥有SID ，也就拥有 User 的全部权限，故而SID是需要严格保密的，这个数据应该只保存在站方，不应该共享给其它网站或者第三方App。

参考以上的SessionID安全性问题考虑，如果服务器用户数据可能需要和第三方共享，或者允许第三方调用 API 接口，一般采用Token 校验机制更合适。


---

[Android客户端和服务端如何使用Token和Session](http://wyong.blog.51cto.com/1115465/1553352)

[为什么 APP 要用 token 而不用 session 认证？ —— V2EX  ](https://www.v2ex.com/t/148426)


[10 Things You Should Know about Tokens](https://auth0.com/blog/2014/01/27/ten-things-you-should-know-about-tokens-and-cookies/)