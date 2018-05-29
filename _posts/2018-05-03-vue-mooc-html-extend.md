---
layout: post
title:  HTML 拓展知识
category: js
keywords: [improvement,web,js]
---


补习一些 H5相关知识;

#### WebStorage 



##### sessionStorage

数据通常在客户端存储,无关服务端;其特点是在当前会话过程中将数据保存,所存储数据在页面关闭时清空,数据的存储大小有一定限制(5M)

##### localStorage  

类似于 sessionStorage ,与之不同的是如果数据不被手动清空则数据会永久保存

##### IndexDB 



##### Cookies  

Cookies 用于客户端与服务端交互,通常由服务端生成,设置过期时间客户端在请求服务端数据时携带Cookie 信息,当 Cookie 数据过多时,可能会造成性能问题;

就 Cookie 而言,由于其请求全局性,所有请求均会携带这些信息,故而 Cookie 信息的数据量宜少不宜多,通常利用 Cookie 做用户身份认证,通常 Cookie 默认在浏览器关闭后失效;



#### WebSockets  




#### XMLHTTPRequest 

* ajax            
* jquery
* axios


#### Canvas  


#### 多媒体相关 

