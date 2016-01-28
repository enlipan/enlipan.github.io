---
layout: post
title: Android Activity LaunchMode
category: android
---
### Standard

标准模式:对应每一个Intent，无论任务栈中有无实例，都生存一个新的实例，放入Task栈中；




### SingleTop

说来与标准模式差别不大，顾名思义，Top —— 栈顶复用，若Intent要启动的Activity处于Task栈顶，则不新建Activityu实例，直接复用Activity，同时触发SingleTop 模式 Activity中的 onNewIntent()；

使用实例：搜索Activity —— 参照 Android权威指南

只有在调用者和目标Activity在同一Task中，并且目标Activity位于栈顶才会复用Activity实例，除此之外都会新建，新建Activity实例放在哪个栈中呢？

当调用自身所在应用的Activity，不用说，同一个Task；

若调用外部引用的Activity，5.0之前，外部应用的新Activity会位于发起调用的Activity所在的Task栈中，而5.0之后则会位于不同 Task，外部应用的目标Activity会新建Task；

### SingleTask:

SingleTask有一个特性，可以清除Task中位于其上面的Activity实例；

栈中只保存一个实例，时刻注意SingleTask所在的Task究竟与调用者是否在同一个Task，也就是调用SingleTask可以达到切换 Task 栈的效果；

活用 taskAffinity 属性；




Note —— StartActivityForResult:

> Note that this method should only be used with Intent protocols that are defined to return a result. In other protocols (such as ACTION_MAIN or ACTION_VIEW), you may not get the result when you expect. For example, if the activity you are launching uses the singleTask launch mode, it will not run in your task and thus you will immediately receive a cancel result.

### SingleInstance:

Task栈中只存在该实例;




### IntentFlag：

使用`IntentFlag ：intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);`可以实现类似的launchMode效果；



taskAffinity属性：任务栈标识，默认应用包名，这就是同一应用标准模式下位于同一Task的原因；




附带一个很常见的Exception：

Caused by: android.util.AndroidRuntimeException: Calling startActivity() from outside of an Activity  context requires the FLAG_ACTIVITY_NEW_TASK flag. 

异常产生正如源于所描述的，Activity之外的Context启动Activity时，新产生的Activity实例无法定位正确的所应该放置Task栈

---

Quote:

[Understand Android Activity's launchMode: standard, singleTop, singleTask and singleInstance](http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en)