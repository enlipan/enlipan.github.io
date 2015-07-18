---
layout: post
title: Android Context小结
category: android
---

###`Context`究竟是什么：

以下内容翻译自`Stackoverflow`：          

> 定义：`Context`代表上下文数据环境；类似于数据库一样能够存储一些数据
> 
> 简单的比喻：X是一个初创软件公司的CEO，同时公司当前还有另一位技术经理，他创建并且管理着包含数据库以及UI界面等全部技术性事务。现在CEO新招聘了一位开发者，这位技术经理要告诉这位新来的，他要怎么工作在哪里工作是负责UI还是数据库等等
> 
> 同样类似于：安卓的`Activity`访问应用程序资源。类似于当你进入一家酒店，你想要在合适的时间吃早餐中餐或者晚餐。在你停留的这些时间，你有很多其他各种各样想吃的，你准备怎么办？于是你请酒店的客房服务人员将这些东西送过来。如果把你当作单一的`Activity`，酒店当作应用程序，早中晚餐当作程序资源，那么酒店的客房服务人员就是`Context`。
> 
> 一般我们将`Context`用于：加载资源，启动Activity，创建View，获取系统Service。
> 
> `Context`还是`Activity，Service，Application`的基类。
> 
> 另一个描述是将`Context`比作电视的遥控器，在电视里面当然装载各类信息资源，`Service`， 可用的Intent等，遥控器作为将各种不同的资源传递到前台展示的通道。因而，遥控器能够控制访问电视频道去访问`resources, services, using intents`等。同样，无论是谁只要能够控制或者得到遥控器自然能够获取其他的这些资源。
> 
> 一些常见的获取Context的方式：
> `getApplicationContext()`；`getContext()`；`getBaseContext()`；or `this (when in the activity class)`
> 




关于Android中的Context的一些理解,`Context`提供一种上下文环境，可以很方便的让新组件对象知道自己所处位置，这有点像Web开发中Jsp内置的`ApplicationContext`，可以很方便的往里面放入一些常用轻便数据，也可以很方便的在其他地方获取到，进而进行数据的传递，从而减轻代码重量。

在网上经常看到有人问怎么随时随地的获取`Context`构建工具类，个人认为工具类一般可以自己重新利用构造函数注入，在`Activity`等控制器中直接构造注入Context，而不是写蹩脚的单例等获取方式，一般情况下构造器注入已经足够用了，而且很轻便灵活。

###Google定义

> Interface to global information about an application environment. This is an abstract class whose implementation is provided by the Android system. It allows access to application-specific resources and classes, as well as up-calls for application-level operations such as launching activities, broadcasting and receiving intents, etc 
> 
> > Context提供上下文应用环境，Android系统提供了具体的Context实现。Context提供了一种获取Android系统指定资源的通道，同时能够调用应用(application-level)级别的操作，例如启动Activity等。

> Consider for example how this interacts with registerReceiver(BroadcastReceiver, IntentFilter):

> If used from an Activity context, the receiver is being registered within that activity. This means that you are expected to unregister before the activity is done being destroyed; in fact if you do not do so, the framework will clean up your leaked registration as it removes the activity and log an error. Thus, if you use the Activity context to register a receiver that is static (global to the process, not associated with an Activity instance) then that registration will be removed on you at whatever point the activity you used is destroyed.

> If used from the Context returned here, the receiver is being registered with the global state associated with your application. Thus it will never be unregistered for you. This is necessary if the receiver is associated with static data, not a particular component. However using the ApplicationContext elsewhere can easily lead to serious leaks if you forget to unregister, unbind, etc.

简答的说就是在注册BroadcastReceiver的时候，如果利用的是ActivityContext，那么当Activity被销毁的时候Receiver也会被自动销毁回收，也就是执行Unregister，但是如果利用ApplicationContext(getApplicationContext ())注册，则不会自动回收，必须手动回收，否则会导致严重的内存泄漏问题。



---

[What is Context in Android?-SOF](http://stackoverflow.com/questions/3572463/what-is-context-in-android)

[全面理解Context](http://www.cnblogs.com/android100/p/Android-Context.html)

[你所不知道的Context](http://blog.csdn.net/qinjuning/article/details/7310620)