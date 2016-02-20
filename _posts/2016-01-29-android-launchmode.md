---
layout: post
title: Android Activity LaunchMode
category: android
---

### Standard

标准模式:对应每一个Intent，无论任务栈中有无实例，都生存一个新的实例，放入Task栈中；




### SingleTop

说来与标准模式差别不大，顾名思义，Top —— 栈顶复用，若Intent要启动的Activity处于Task栈顶，则不新建Activityu实例，直接复用Activity，同时触发SingleTop 模式 Activity中的 onNewIntent()；

使用实例：搜索Activity —— 参照 Android权威指南：**在搜索界面启动搜索操作，触发新的搜索操作**；

只有在调用者和目标Activity在同一Task中，并且目标Activity位于栈顶才会复用Activity实例，除此之外都会新建，新建Activity实例放在哪个栈中呢？

当调用自身所在应用的Activity，不用说，同一个Task；

若调用外部引用的Activity，5.0之前，外部应用的新Activity会位于发起调用的Activity所在的Task栈中，而5.0之后则会位于不同 Task，外部应用的目标Activity会新建Task；

### SingleTask:

了解 SingleTask 属性 需要了解 taskAffinity：

当系统启动 SingleTask属性的 Activity 时，会对照该 Activity 的 taskAffinity 属性，利用该属性值匹配系统中的 Task栈，若匹配到，则确定了该Activity应该位于的任务栈，若未匹配到直接新建任务栈，将新建Activity放置在任务栈中；

确定了任务栈后，会查找该任务栈中 是否有该Activity实例，若没有则新建 Activity放置于栈顶，若有该实例则，复用该Activity实例，并清除该任务栈中位于Activity之上的其他Activity，同时触发其 OnNewIntent()，获取新的Intent传递参数；


SingleTask特性

> 可以清除Task中位于其上面的Activity实例；


> 栈中只保存一个实例，时刻注意SingleTask所在的Task究竟与调用者是否在同一个Task，也就是调用SingleTask并灵活配置 taskAffinity 属性 可以达到切换 Task 栈的效果；






Note —— StartActivityForResult:

> Note that this method should only be used with Intent protocols that are defined to return a result. In other protocols (such as ACTION_MAIN or ACTION_VIEW), you may not get the result when you expect. For example, if the activity you are launching uses the singleTask launch mode, it will not run in your task and thus you will immediately receive a cancel result.



### SingleInstance:

Task栈中只存在该 Activity 实例，标记为SingleInstance 的 Activity启动时会产生新的 任务栈；

应用： 来电 Activity




### IntentFlag：

使用`IntentFlag ：intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);`可以实现类似的launchMode效果；


taskAffinity属性：任务栈标识，优先查找 Activity 属性，若Activity该属性未配置，则向上查找应用 Application 中 taskAffinity 属性，若依旧没有则使用应用包名，这就是同一应用标准模式下位于同一Task的原因；




附带一个很常见的Exception：

Caused by: android.util.AndroidRuntimeException: Calling startActivity() from outside of an Activity  context requires the FLAG_ACTIVITY_NEW_TASK flag. 

异常产生正如源于所描述的，Activity之外的Context启动Activity时，新产生的Activity实例无法定位正确的所应该放置Task栈

---

Quote:

[Understand Android Activity's launchMode: standard, singleTop, singleTask and singleInstance](http://inthecheesefactory.com/blog/understand-android-activity-launchmode/en)


[Android 启动模式](https://www.zybuluo.com/linux1s1s/note/91224)


[解开Android应用程序组件Activity的"singleTask"之谜](http://blog.csdn.net/luoshengyang/article/details/6714543)