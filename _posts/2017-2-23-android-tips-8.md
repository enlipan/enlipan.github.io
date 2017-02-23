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
