---
layout: post
title:   一个Cookie 同名key问题
category: js
keywords: [improvement,web,js]
---

先来看直接的问题, 抓包请求的Cookie 中带入了同名的key `_security_token`: 

{% highlight javascript %} 

// 看一个抓包的请求
-H 'Accept-Language: zh-CN,en-US;q=0.8'      
-H 'Cookie: _security_token=1PKzd_5ac7RW9awS; TT=1PKzd_5ac7RW9awS; JSESSIONID=80EA080E5712305C0E375DACA455A874; _security_token=1ZsI4_5ac7RW9awS'

{% endhighlight %}


为啥会允许携带同名的 key? 来直接看看 RFC2965 的标准:  

> If multiple cookies satisfy the criteria above, they are ordered in
   the Cookie header such that those with more specific Path attributes
   precede those with less specific.  Ordering with respect to other
   attributes (e.g., Domain) is unspecified."

也就是说 针对 Cookie 设置时的不同 Path/Domain 是允许多个设置 Cookie 拥有同名 key 的,在请求对应 Domain 时,按照匹配规则的匹配度从高到低排序,也就是 Path 越完整排序越靠前:  

对比.souche.com 与 www.souche.com Path 在匹配到同一domain 时越匹配key 值排序越靠前,也即是完整的 Path 会排序在前.


#### Cookie  回顾

我们知道 Http 协议的无状态特性,为了处理重复性身份验证的问题,维护会话状态引入了 Cookie/Session/Token 等,用以让服务器区分客户端身份状态.  

Cookie 由服务端设置,而被浏览器检测到保存在客户端,在后续的请求中匹配到对应 Path 时在请求中带入所设置的 Cookie信息: 

其设置是浏览器在检测到 Response 中的 SetCookie Header 后将对应的名/值/ Path-路径&域信息/ 过期时间等信息保存下来;  

利用 Cookie 保存用户信息的问题在于安全性问题: 由于 Cookie 保存在客户端,用户可以自行修改操作.也就是说 Cookie 信息时可以随意篡改的,如果依赖 Cookie 信息做身份验证服务端很容易被欺骗.   

为了解决这个问题引入了 Session 会话机制,避免了在客户端储存敏感用户信息,而只保存 SessionID 在 Cookie 中,服务端收到 SessionID 后通过 SessionID 查询到完整的用户信息,并进行安全校验,验证通过取出用户身份信息进行后续的业务逻辑处理.

故而可以看出,Session是基于 Cookie的持久化机制的一种会话机制.

最后来看看请求中的 JSESSIONID,JSESSIONID是 Tomcat 中对于 SessionID 的别名.


---

[How to handle multiple cookies with the same name?
](https://stackoverflow.com/questions/4056306/how-to-handle-multiple-cookies-with-the-same-name)


[Cookie/Session的机制与安全](https://harttle.land/2015/08/10/cookie-session.html)

[cookie、session、sessionid 与jsessionid](https://www.cnblogs.com/fnng/archive/2012/08/14/2637279.html)