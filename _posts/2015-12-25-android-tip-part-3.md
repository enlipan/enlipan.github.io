---
layout: post
title: Android-tips-part-3
category: android
---

1.  Fragment.getString() 函数：

直接使用该函数依赖于该Fragment所依赖的Activity，若Fragment未Attach到Activity，函数出现异常，需要注意，一般不会直接使用该函数，是最近偷懒中偶然发现的错误；

2.  在内部类尤其是内部线程中尤其注意内存泄漏：

就算是静态内部类也需要注意，一些集合类的引用传递也可能导致内存泄漏；


3.Java 的值传递类型：

很多人认为Java只有值传递是将Java的对象引用传递，回归本质的指针传递，进而划分到地址传递，也就是值传递；当然计算机底层也无法区分引用还是值，只有地址码值才是永恒，所以如果进一步说，如果是复制传递，如Java栈区中基本类型值复制传递，就是一般意义上的值传递，而如果是共享传递，如Java中的引用对象传递，通过传递地址值进行内存共享，一般是指针地址值传递，所以根本上Java只有值传递；




---

Quote：

[Java内存泄露的理解与解决 ](http://www.blogjava.net/zh-weir/archive/2011/02/23/345007.html)