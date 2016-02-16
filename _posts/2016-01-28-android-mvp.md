---
layout: post
title: Android MVP回顾
category: android
---


### MVP 是什么？

Modle /  View / Presenter

MVP 就本质上来说并不是什么高深的东西，但是确实极大的改善了Android 程序的代码结构清晰度，我们知道 Android 程序其实是天然的 MVC 架构，只是其 C 对应的 Controller 是Activity，Activity控制 View状态，Activity 调用业务逻辑；当然，我们知道 Controller在MVC中的核心地位，同样Android的天然 MVC 造成的第一个大问题就是 Activity 业务逻辑的急速膨胀，当项目不断变得复杂起来之后，Activity相互之间的复杂业务逻辑更是让项目交接，代码阅读与业务梳理难上加难，想想核心的名片识别Activity 竟然写出了 8K 行，Base优化版，我去接手优化性能的时候，看的我心都碎了；

那么MVP 有什么区别呢？ MVP 其实 实际上来说是 MVC 的变种，只是一来角色做出了变化，二者来说 V M 之间不再联系，二者通过 P 中介直接完成解耦，事实上 P —— Presenter 其实很大程度上是充当 MVC中Contler的角色，当然也是事实上，Presenter 也是很容易膨胀起来的，但是一来 基于接口 组合编程实践，二者 Activity 核心逻辑变得更加清晰，我们一般看Android都是找对应Activity入手，也就是Activity的逻辑结构精简了，同时由于接口约束会使业务逻辑更好梳理，后期维护以及扩展当然也会更加简单，纵然由于接口的存在造成类数量上的膨胀，但综合看来优势依旧还是非常明显的；

### UML图：




### Code 实战

这种对应于项目结构的问题，我始终认为一定要自己分析，然后对照自己设定的结构写出来才能真正理解，虽然androidmvp源码结构已经很清晰，但是纸上得来终觉浅；


明天把写的代码贴上来 :)

**todo**




---

[antoniolg/androidmvp -- GitHub](https://github.com/antoniolg/androidmvp)

[ 浅谈 MVP in Android](http://blog.csdn.net/lmj623565791/article/details/46596109)

[几种常见Android代码架构分析](http://mobile.51cto.com/abased-386212.htm)