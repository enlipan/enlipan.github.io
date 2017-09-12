---
layout: post
title:  Android Tips part (14)
category: android
keywords: [improvement,android,java]
---

### HttpUrlConnection  

Android 4.4之后系统通过 URLStreamHandler 的bridge 过渡到了 okhttp 进行请求,但由于系统中内置 okhttp 的版本各不相同,因而如果直接使用 HttpUrlConnection 会在网络请求中诞生 client 碎片化的问题,OkHttp 的众多 issue 都有可能被碰到;如 dns 的问题,无限请求问题等等,因而较好的实践是直接使用指定版本的 okhttp 达到一致的开发使用体验,当然后期排查问题也更好解决;   

> URL.setupStreamHandler()
> 
> URLStreamHandler.openConnection()    
> 
> HttpHandler.openConnection()     
> 
> HttpEngine........

