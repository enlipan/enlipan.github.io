---
layout: post
title: Android性能优化之内存分析
category: android
---

不同于Web项目的开发，Android开发性能提升中内存的使用情况分析需要时刻注意，一者 时刻需要警惕OOM 引起的 FC，这是体验最差的，就算不引起 OOM，  开发过程中内存的错误开销将导致内存抖动，频繁的 GC，将导致界面的卡顿，5.0以后的ART 虚拟机对应 GC 的表现还好一点，而若是Dalvik虚拟机，GC大量占用虚拟机资源，同时GC的 pause延时，将会用户体验降低到不敢想象的地步，无论如何优秀的开发是必然需要关注性能优化，而性能优化就绕不开内存优化与内存分析；

其实很多内存问题其根源都是内存泄漏问题，所以内存的分析主要情况就围绕内存泄漏展开；

Google提供了大量的 内存分析工具，尤其是 AS之后，各种图形化界面，让内存分析变得越来越简单，一般常用的内存分析工具有：


* AS : Android Monitor 中 Memory 使用情况以及 虚拟机GC情况的图形化监控工具；



*  AS : Android Monitor 中 Allocation Tracker Walkthrough  跟踪内存分配情况


* DDM 中 Heap Viewer 查看堆区内存实时信息，每次GC后 堆区信息会刷新，同时利用该工具可以dump hprof文件转换后可用于 MAT 内存分析 ；


*  ** MAT ——Memory Analyzer Tool** 堆内存分析工具，用于分析标准 dump hprof文件，需要注意的是 使用DDMS 直接导出的 dump 文件 需要 android\platform-tools\hprof-conv.exe 工具转换成标准 dump文件，导入到MAT后可以清晰的查看对象的全部引用情况，是内存分析的高级神器，虽然上手有门槛，但确实是必须要了解的工具；

本来自己还想着写点东西，绕来绕去其实 MAT 常用点并不那么多，多实践即可，引用的几篇文章已经讲的非常清楚，MAT的内存泄漏分析是一个实践与分析结合的过程，一般是 查看源码，观察内存监控图，dump文件，MAT分析，然后再次回到源码分析的循环过程；

需要注意的几个概念是：

Retained Heap 

List objects：       
with outgoing references  被该对象的引用对象列表                      
with incoming references  引用该对象的对象列表 

GC root                         






其他开源工具：


*  LeakCanary  简洁易用的用于检测内存泄漏的工具库

Gradle 依赖：


{% highlight groovy %}

dependencies {
    compile fileTree(dir: 'libs', include: ['*.jar'])
    debugCompile 'com.squareup.leakcanary:leakcanary-android:1.3'
    releaseCompile 'com.squareup.leakcanary:leakcanary-android-no-op:1.3'
}


{% endhighlight %}

---

Quote：

[Performance Profiling Tools - Android](https://developer.android.com/intl/zh-cn/tools/performance/index.html#rendering-tools)

[Android内存优化之OOM](http://hukai.me/android-performance-oom/)

[Android内存优化之一：MAT使用入门](http://androidperformance.com/2015/04/11/AndroidMemory-Usage-Of-MAT.html)

[Android内存优化之二：MAT使用进阶](http://androidperformance.com/2015/04/11/AndroidMemory-Usage-Of-MAT-Pro.html)

[Android内存优化之三：打开MAT中的Bitmap原图](http://androidperformance.com/2015/04/11/AndroidMemory-Open-Bitmap-Object-In-MAT.html)

[MAT - Memory Analyzer Tool 使用进阶](http://www.lightskystreet.com/2015/09/01/mat_usage/)

[Android内存优化杂谈](https://mp.weixin.qq.com/s?__biz=MzAwNDY1ODY2OQ==&mid=400656149&idx=1&sn=122b4f4965fafebf78ec0b4fce2ef62a&scene=0&key=ac89cba618d2d9769bc3006ae6f052433e9addebbf0099674296838d889f7d2c4098d859550e3bf2f6b53b3483336fec&ascene=7&uin=MTgxNDQ2NzkyMg%3D%3D&devicetype=android-19&version=26030832&nettype=ctlte&pass_ticket=LuET1X%2BVwvmFOKoypeaRevizrPu8nav3c69WqE2ynS2F%2BUBstsQr9bD%2FYhH3gEAj)

[Android内存使用分析和程序性能分析](http://www.liaohuqiu.net/cn/posts/memory-and-profile-analysis-in-android/)

[10 Tips for using the Eclipse Memory Analyzer](http://eclipsesource.com/blogs/2013/01/21/10-tips-for-using-the-eclipse-memory-analyzer/)

[Eclipse Memory Analyzer, 10 useful tips/articles](http://kohlerm.blogspot.sg/2009/07/eclipse-memory-analyzer-10-useful.html)

[Memory Profiling 101 (100 Days of Google Dev) AS 内存使用分析](https://www.youtube.com/watch?v=P--rg1o7Cz4&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=20&feature=iv&src_vid=GajI0uKyAGE&annotation_id=annotation_343990853)

[Android Performance Patterns: Memory Churn and Performance 内存抖动](https://www.youtube.com/watch?v=McAvq5SkeTk&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=60)

[Android Performance Patterns: Garbage Collection in Android](https://www.youtube.com/watch?v=pzfzz50W5Uo&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=61)

[LeakCanary 中文使用说明](http://www.liaohuqiu.net/cn/posts/leak-canary-read-me/)