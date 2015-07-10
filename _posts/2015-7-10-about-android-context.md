---
layout: post
title: Android Context小结
category: android
---
`Context`究竟是什么：

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







---

[What is Context in Android?-SOF](http://stackoverflow.com/questions/3572463/what-is-context-in-android)

[全面理解Context](http://www.cnblogs.com/android100/p/Android-Context.html)