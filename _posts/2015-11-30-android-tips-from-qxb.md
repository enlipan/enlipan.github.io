---
layout: post
title: Android Tips Part(1)
category: android
---

最近支援android开发，在自己独立负责一些模块的开发过程中，学习到一些Tips，这里对于Tips做一个总结记录：


###  Android：IMEOption 

 软键盘设定，下一个、搜索、完成、发送……



###  网络服务器错误数据的读取：

一般来说我们最关心的是 responseCode ==200 下的返回数据，某些情况下，服务器自定义了一些错误码与错误消息。那么当服务器返回这类数据我们如何读取呢？

如服务器自定义了一种错误码为code423，并且返回了对应的错误提示信息，我的读取需要：
connection.getErrorStream()，获取错误数据的输入流



###  应用程序中的：required与uses-feature，

我们推荐使用Feature来增加硬件特性，利用Required、
声明硬件需求将导致不具备该硬件特性的用户无法安装该App，而Feature则属于告知类型，Android系统不会在安装时Check设备特性。



###  Activity + Task + Handler 组合的使用对比 Activity + IntentService + LocalBroadCastReceiver 组合。

一般后者使用更加灵活，虽然前者更加好写，但是后者可以更加灵活的解耦，更加健壮，更加有效防止内存泄漏。


###  使用Handler 注意消息的解绑，防止Acttivity内存泄漏

Handler.removeCallBackAndMessages();


###  针对频繁的复杂线程情况，使用线程池管理可以获取更好的多线程性能。


###  Application中的 ActivityLifeCycleCallBack 接口

监听Activity生命周期，可以便于灵活获取管理当前Activity，同时也可以更加方便的检验App是否处于前台。



###  SharePreference的键值对，存放于xml文件中

系统默认Preference--存放在一个通用的默认xml文件中，这类范围下，注意键值对的冲突问题，不要对于同一个Key存入不同类型的值。会导致Crash

而对于利用各个Activity环境创建的私有环境下的Preference,会另外独占其他Xml文件。

文件位置：data/data/packagename/shared_prefs/xxx.xml


###  onNewIntent():

针对SingleTop模式下，当Activity处于栈顶，不重新创建Activity，直接调用栈顶Activity，此时触发onNewIntent();


###  RefreshLayout:

setRefreshing(true),不生效的解决方案，此问题源于Google Bug，且属于已知Issu。

利用View.post(refreshLayout.setRefreshing(true))、或handler.post()


###  ListView setEmptyView() 不生效的原因：

ListView与EmptyView必须处于同一图层，处于同一图层的情况下，则需要Check，是否是ListView的MatchParent挤占了EmptyView的显示空间。、

此类情形活用：FrameLayout可以解决此类问题。


###  ListView 子Item包含多个元素时，最下子View的MarginBottom（），很多时候不生效，需要设定整个Item的Pading。

`android:clipChildren`



###  RelativaLayout 中  Gravity 属性

设定转换为 layout_centerVertical = "true"

.......