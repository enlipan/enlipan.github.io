---
layout: post
title:  Android Tips part (20)
category: android
keywords: [improvement,android,java,js]
---



### ExceptionInInitializerError  

静态资源初始化异常.

> ExceptionInInitializerError is thrown when an error occurs within the static initializer of a class or object. 
> 
 

通常发生在静态代码块执行代码未被初始化导致. 

静态代码块: 静态代码块事实上是一个在类加载时被执行的普通代码块.   

类变量:类变量的加载有其顺序,类变量的加载分为类变量加载内存分配与类变量顺序初始化(按照类变量定义顺序初始化)两个过程.  

> Just as importantly, since ExceptionInInitializerErrors aren’t ever going to cause a problem themselves, catching such an exception always contains an actual causal exception, which is the error that was thrown within a static initializer that led to the caught ExceptionInInitializerError.


[ExceptionInInitializerError](https://airbrake.io/blog/java/exceptionininitializererror)


### Android Profile   

优化度量校验指标: 性能检测指标通过系统检测工具的性能度量工具可以快速获取一致性数据.同时可以获得其他 App 优化数据做横向对比分析.

如: 冷启动时间优化,利用系统 ActivityManager Log 做数据对比:  

{% highlight java %} 

Displayed com.souche.fengche/.ui.activity.MainActivity: +247ms

{% endhighlight %}


Quote : 

[What does “I/ActivityManager: Displayed…activity…+850ms” ?](https://stackoverflow.com/questions/32844566/what-does-i-activitymanager-displayed-activity-850ms-comprised-of/33821515#33821515)

[知乎安卓客户端启动优化 - Retrofit 代理](https://zhuanlan.zhihu.com/p/40097338)
