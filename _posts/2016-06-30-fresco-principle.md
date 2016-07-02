---
layout: post
title: Fresco 源码研究
category: android
keywords: [image, android]
---

图片管理是Android开发中一个很重要的点，从早先自己造轮子写过Image加载，到目前很多的图片加载框架，这里选择Fresco，对其做一点原理探索，步骤主要是从FaceBook的现身说法确定一些大纲级别的原理，以及进一步看看源码去了解其如何加载管理图片：


#### 大纲

####  各种内存管理区的一些对比分析：

**Java Heap**

内存的管理回收便利但又系统性的内存大小限制

**Native Heap**

有更多内存可用，但是没有好用的内存管理，C式编程，手动开启释放

**ashmem**   —— unpin / pins    

像Native Heap，有较大空间操控，同时对于Native的回收机制有更加系统性管理机制； —— " lazy free"： Android can “unpin” the memory rather than freeing it


>   If we pinned the memory in advance, off the UI thread, and made sure it was never unpinned, then we could keep the images in ashmem but not suffer the UI stalls.

PS:通过对比逐步确定思路方案，加入合理的猜想，这一思考过程还是很重要的，值得学习；—— 具体参考引用文章《Introducing Fresco: A new image library for Android》

**Drawee MVC**

DraweeHierarchy —— model：applies a specific function — imaging, layering, fade-in, or scaling

DraweeControllers —— They control what the DraweeHierarchy actually displays

DraweeViews —— They listen for Android system events that signal that the view is no longer being shown on-screen.

MVC 肢解了复杂的图片管理系统： Calling code need only instantiate a DraweeView, specify a URI, and, optionally, name some other parameters.


###  Fresco源码



---

Quote：

[Introducing Fresco: A new image library for Android](https://code.facebook.com/posts/366199913563917/introducing-fresco-a-new-image-library-for-android/)

[Fresco-Source-Analysis](https://github.com/desmond1121/Fresco-Source-Analysis)
