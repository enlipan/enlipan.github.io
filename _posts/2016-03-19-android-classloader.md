---
layout: post
title: Android 类加载
category: android
---


### 从Android Dex 分包说起：

随着业务逻辑的增加，`方法数 65536 —— Conversion to Dalvik format failed:Unable to execute dex: method ID not in [0, 0xffff]: 65536` 是难以绕过的坎，早期的时候的解决方案还是比较麻烦的，在比较紧急的时候衍生诸多治标不治本的方案，如ProGuard，lib冗余精简等，而后在Google multidex lib之后解决方案变得比较简单；目前解决的方案基本大多都是基于dex分包机制，根据apk build Tool 打包流程，在 apk编译打包dex阶段人为干预 dex打包编译过程，自定义指定类打包为哪一个指定dex包，进而生成多个dex文件；Google multidex lib 会根据需要自动分析哪些类需要打包到 主dex包，哪些打包到 secondary Dex包，根据实际情况生成 dex2 dex3等；如果这一过程完全自行判断就需要自己 分析好准确的业务逻辑等，并处理好在较低Android版本中，当类被调用 dex包还未被加载进入classloader的情况；具体情况分析可以查看美团团队给出的详细解决方案；

在 Lollipop以下版本multidex 可能会导致诸多问题，一者 Dex加载问题复杂度较高，多Dex加载时，若 Secondary Dex文件过大，可能会导致Application无响应，或者冷启动过慢的问题；Lollipop之后源于 ART的存在，ART 的AOT(Ahead of time)机制，系统在apk安装过程会利用 自带 dex2oat工具对apk中多 dex文件编译生成 .oat文件这一可在本地执行的文件，提高app启动速度；

> At install time, ART compiles apps using the on-device dex2oat tool. This utility accepts DEX files as input and generates a compiled app executable for the target device. The utility should be able to compile all valid DEX files without difficulty.


### ClassLoader：






#### 基于 ClassLoader 的热修复技术(Tencent)

特点：App下次启动有效，高通用性，适用性较好


### AndFix(Alipay)：




















---

Quote:


[Custom Class Loading in Dalvik](http://android-developers.blogspot.sg/2011/07/custom-class-loading-in-dalvik.html)

[Building Apps with Over 65K Methods](http://developer.android.com/tools/building/multidex.html)

[Under the Hood: Dalvik patch for Facebook for Android](https://www.facebook.com/notes/facebook-engineering/under-the-hood-dalvik-patch-for-facebook-for-android/10151345597798920)

[Android应用打破65K方法数限制](http://www.infoq.com/cn/news/2014/11/android-multidex)

[Android dex分包方案](http://my.oschina.net/853294317/blog/308583)

[美团Android DEX自动拆包及动态加载简介](http://tech.meituan.com/mt-android-auto-split-dex.html)

[Android动态加载技术 系列索引](https://segmentfault.com/a/1190000004086213)

[各大热补丁方案分析和比较](http://blog.zhaiyifan.cn/2015/11/20/HotPatchCompare/)
