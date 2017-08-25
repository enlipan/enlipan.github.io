---
layout: post
title:  ReactNative 原理 
category: android
keywords: [improvement,android]
---

**凡你能说的，你说清楚；凡你不能说清楚的，留给沉默 - 维特根斯坦**

Java 与 Native 的 JNI单向通信, Java - Native - jscore 的异步通信过程,异步回调形式得到调用结果;

先来回顾一下 JNI 的相关:

> JNI 中 Native 调用 Java 函数通过类名反射找到 class, 进而依据函数名寻找函数标识 ID ,从而调用该method;值得注意的是若函数属于非静态函数,我们需要构建类实例对象才能进一步调用函数;















---

Quote:

[主流程及 Java 与 JS 双边通信](http://blog.csdn.net/yanbober/article/details/53157456)

[ReactNativeAndroid源码分析-Js如何调用Native的代码](https://zhuanlan.zhihu.com/p/20464825)

[React-Native系列Android](http://blog.csdn.net/MegatronKings/article/details/51138499)

[JNI 原理](http://gityuan.com/2016/05/28/android-jni/)

[JNI Tips](https://developer.android.com/training/articles/perf-jni.html)