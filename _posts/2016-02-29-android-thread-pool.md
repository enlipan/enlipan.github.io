---
layout: post
title: Android 线程池
category: android
---


Android 中线程的概念主要有

> AsyncTask                  
> Thread                
> IntentService        
> HandlerThread            




HandlerThread 与 普通 Thread 差异：

HandlerThread 由于内部自动创建了`消息队列`，所以可以利用传递Handler传递消息的方式去指定完成进行具体的 Job，而区别于普通的 Thread单纯的执行任务；

IntentService 与 其他Thread 有什么差异呢？ 当APP在后台运行时，我们知道当系统资源紧张时，Android系统会回收后台进程资源，也就是销毁后台App，而销毁时是有优先级的，IntentService 本质是一种服务，在后台运行时能够更加安全的运行后台服务，可以尽可能保证任务的执行，避免被系统杀死 —— 降低应用被杀死导致任务执行中断的概率；

本质上 IntentService 内部是封装了HandlerThread 完成消息的处理；



主线程 即 UI线程，用于处理用户交互任务，实时响应用户事件，为了较好的用户体验，避免界面无响应以及卡顿现象，UI线程必须专注于UI相关事件，故而引申出子线程，也就是工作线程，一般用于异步处理IO，网络等耗时操作，分担UI线程的处理压力；


线程池：利用线程池缓存一定数量线程，避免频繁创建和销毁线程所带来的系统性能开销；同时可以控制线程数量，避免线程无止境的消耗系统资源，当线程数量大于CPU核心数量之后，系统通过时间片轮转法去调度线程执行，线程数量过多时容易导致互相抢占资源而导致阻塞；同时线程池也能够对线程进行一定程度上的管理；


线程池核心概念：

CorePoolSize： 核心线程数量，默认情况下，一直存活在线程池中，除非设定 allowCoreThreadTimeOut()，允许核心线程闲置超时回收；

keepAliveTime: 上述的 闲置超时回收相关的时间概念—— 超过这个时间就回收闲置线程；


线程池种类：

FixedThreadPool： 指定数量的线程池，只有核心线程，没有超时限制概念

CachedThreadPool： 无核心线程，全部为非核心线程，适用于大量耗时少的任务，当整个线程池全部处于闲置状态，超时后所有线程全部回收，几乎不占用系统资源；

SingleThreadExecutor： 单线程池，仅有一个核心线程，保证所有任务在同一线程中依次顺序执行；

ScheduledThreadPool： 核心线程数固定，而非核心线程数无限制，且非核心线程闲置立即回收，顾名思义一般适用于固定周期重复任务；

---

Quote：


《Android开发艺术探索》
