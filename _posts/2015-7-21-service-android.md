---
layout: post
title: Service小结
category: android
---

###Service

Service是什么？

> A Service is an application component representing either an application's desire to perform a longer-running operation while not interacting with the user or to supply functionality for other applications to use. Each service class must have a corresponding <service> declaration in its package's AndroidManifest.xml. Services can be started with Context.startService() and Context.bindService(). 

> Note that services, like other application objects, run in the main thread of their hosting process. This means that, if your service is going to do any CPU intensive (such as MP3 playback) or blocking (such as networking) operations, it should spawn its own thread in which to do that work. More information on this can be found in Processes and Threads. The IntentService class is available as a standard implementation of Service that has its own thread where it schedules its work to be done.
> 

首先，明确一点作为Android四大组件之一的Service，并不单独运行于独立线程，其运行依然依附于UI线程，当Service运行长时间的高耗(CPU)资源的动作时，也依然会阻塞前台UI线程，产生ANR。此类动作应该利用Service单开Thread独立后台完成，并最后借助于线程通信反馈结果。

同时利用Service绑定机制可以建立Service与其他组件的长期联系，进而长期影响组件运行状态。

Service的启动需要在组件中注册使用，经过测试，不注册不会像Activity一样Crash，而是无反应，不启动。

开启后台线程通信的机制主要有几种解决方案，一是利用Handler，再是利用remote线程机制。

关于使用Handler机制不再赘述，类似于Activity的Handler混合编程。

关于remote Service:

> If the name assigned to this attribute begins with a colon (':'), a new process, private to the application, is created when it's needed and the service runs in that process. If the process name begins with a lowercase character, the service will run in a global process of that name, provided that it has permission to do so. This allows components in different applications to share a process, reducing resource usage. 

建立了远程线程之后就不能简单的通过绑定机制反馈信息给其他线程了，利用AIDL技术完成线程间通信。

**AIDL 在Android Studio的引入问题：**

>  Project目录级别下：src/main/aidl/程序包名(com.package.xxx)/XXXXAIDL.aidl 文件，文件建立完成之后————**Build---Rebuild Project**,此时再看build/generated/source/aidl/debug目录下，生成了同名Java文件。
>  

**android:exported**

> Whether or not components of other applications can invoke the service or interact with it — "true" if they can, and "false" if not. When the value is "false", only components of the same application or applications with the same user ID can start the service or bind to it. 

**Service生命周期**

注意从StartService启动与bindService启动的差异问题

![Service Lifecycle](\assets\img\20150721\service_lifecycle.png)

Service高级使用一般用于混合Activity、Service、BroadcastReceiver使用建立高级任务链。

###IntentService

一种更加高效常用的Service，启动会自动启动后台线程完成逻辑任务而不会阻塞UI线程。




---

[Service-Google](http://developer.android.com/guide/components/services.html   "Service-Google-Dev")

[LocalBroadcastManager结合IntentService](http://hukai.me/android-training-course-in-chinese/background-jobs/run-background-service/report-status.html)

[Android Service完全解析，关于服务你所需知道的一切(上) ](http://blog.csdn.net/guolin_blog/article/details/11952435)

[Android Process](http://developer.android.com/guide/topics/manifest/service-element.html)