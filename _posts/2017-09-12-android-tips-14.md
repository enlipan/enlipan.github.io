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

[Http(s)URLConnection 源码流程](https://zhuanlan.zhihu.com/p/29205566)

### EventBus  3

Index 加速引擎将原来的在注册时利用反射搜寻观察者的逻辑,优化到了源码过程中,通过 apt 等源码扫描工具,扫描源码中的特定注解获取到对应的观察者,进而生成了对应的观察者缓存 Index,加速后期观察者的对应搜寻速度事实上也是非常有效的;从问题的解决角度去看源码也更加清晰;

或许这也就是大 V 们所说的 Android 的核心在 Android 之外,立足于问题看实现;

利用 processAnnotation 扫描源码注解,对于注解函数缓存构建 IndexMap,而如果未使用 Index 构建缓存,则依旧使用反射机制运行时获取;

