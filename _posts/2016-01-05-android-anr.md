---
layout: post
title: Android ANR
category: android
---

### ANR

ANR： Application Not Responding

* ANR 产生原因

系统抛出 ANR 一般由于应用不能响应用户交互事件，通常是 耗时操作占有了 UI线程的资源，导致Android系统不能处理其他的应用GUI响应事件，最终抛出了ANR异常Dialog，影响用户体验；

需要注意的是 View.post(Runnable)以及RunUIThread()等函数是运行在UI线程中,过多耗时处理同样ANR；

我们知道ANR是由于 UI 响应超时引起那么为何会引起超时？Android中应用的响应事件受 Activity Manager 以及 Window Manager system services 监控，超时计数一般从UI事件分发给App开始，原因主要有：UI线程正忙导致当前事件无法处理，以及当前事件处理但长时间没有完成；

一般常见的有：

input Event 5s 无响应；

BroadcastReceiver 10s 内未完成；、

ServiceTimeOut： Service 在特定时间内未完成 —— 20s；


* 如何避免 ANR 

UI 的操作只能在UI线程中，所以UI 线程需要尽可能只Care UI相关交互工作


* ANR解决

开启  StrictMode 监控 UI线程中的网络 或数据库操作；

定位 /data/anr/traces.txt文件 分析；

taces文件追踪常见的 线程状态追踪：

常见的线程状态：

> running - executing application code                 
sleeping - called Thread.sleep()                   
monitor - waiting to acquire a monitor lock            
wait - in Object.wait()               
native - executing native code                 
vmwait - waiting on a VM resource               
zombie - thread is in the process of dying                
init - thread is initializing (you shouldn't see this)               
starting - thread is about to start (you shouldn't see this either)              

很多时候不是我们将 耗时操作放置到 Thread中就完全OK了，同样需要注意线程之间的状态；当UI线程与 工作线程需要持有同一锁，导致UI线程等待工作线程完成之后才能进入锁，这时候的等待时间同样会计入超时，引起ANR；






---

Quote:

[Keeping Your App Responsive](http://developer.android.com/intl/zh-cn/training/articles/perf-anr.html)

[Android - how do I investigate an ANR?](http://stackoverflow.com/questions/704311/android-how-do-i-investigate-an-anr)

[说说Android中的ANR](http://droidyue.com/blog/2015/07/18/anr-in-android/)

[ANR完全解析](http://blog.saymagic.cn/2014/09/25/ANR%E5%AE%8C%E5%85%A8%E8%A7%A3%E6%9E%90.html)
