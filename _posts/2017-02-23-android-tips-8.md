---
layout: post
title:  Android Tips part (8)
category: android
keywords: [improvement,android,java]
---

###  App 捕获所有Crash

很有意思的想法，通过研究了Android Looper的源码，以及其消息处理机制，自行构建可TryCath的主线程Lopper.loop();

原文如下：

[构建永不Crash应用——原理](https://github.com/android-notes/Cockroach/blob/master/%E5%8E%9F%E7%90%86%E5%88%86%E6%9E%90.md)



### MVVM

在DataBinding最初遍根据googleDoc学习过一阵子，最近学习到iOS以及一些前端MVVM思想，事实上，MVVM的核心是ViewModel的如何建立，View的操作事件对于数据Model的改变以及Model数据的改变如何影响到View的显示的双向关系的建立；也就是双向绑定机制。

Android中的DataBinding就是这样的框架，其增强了XML对于View的表象能力，但是对于将逻辑表达式写入XML中，会导致项目结构以及规则不统一显得项目非常凌乱，显然，项目结构的清晰化更加重要，这也是我不喜欢DataBinding的原因，这是Google的一次好的尝试；

目前个人依旧比较推崇MVP，虽然其有这一类膨胀以及Presenter复杂化问题，但是如果使用得当依旧是一个组织结构清晰化的利器，我始终记得8000余行Activity给我带来的痛苦；

一些好的实践比如对于View层的层层ViewGroup封装，在无需Fragment生命周期时，封装ViewGroup往往比Fragment更加直观有效，丰富的Repository数据层封装简化Presenter逻辑，结合RX的异步逻辑简化可以极大的优化代码结构


### Dialog

Dialog依附于Activity，其作为Activity的一部分，其操作不会影响Activity生命周期，Dialog show Activity不执行 onPause

### adb

简单的输出重定向命令：

`adb logcat >  ~/Document/templogs.txt`

### Proguard

`consumerProguardFiles`生成带混淆配置文件的库：   

指定aar库ProGuard配置文件，在库生成aar的混淆过程中会自动使用该配置文件,且pro配置文件会被aar文件包含，同时该配置文件仅对该库生效；


[ProGuard在插件化里的应用](https://www.easydone.cn/2017/01/02/)
