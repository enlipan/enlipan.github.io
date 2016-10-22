---
layout: post
title:  RecyclerView ScrollView Nested
category: android
keywords: [anroid,View]
---

### Android Touch事件处理

dispatchTouchEvent、onInterceptTouchEvent、onTouchEvent

如果是来自ViewParent的Touchdown事件，子View不处理，会上抛给父的onTouchEvent处理。子View如果不处理Down事件（不关心），后续的move等事件也不会传递到子View；而如果子View处理了down事件，下一个move事件到来子不处理，那父也不会处理，此事件被丢弃
也就是父View就无法再次得到事件的回传，也就是父View层级就要决定好事件的处理问题，而事件本身却需要根据情况由子View决定父View是否也要处理该事件

### 嵌套RecyclerView的简单处理：
1.嵌套 RecyclerView 设定具体高度


2.嵌套 RecyclerView 不设定高度，但禁用其获取滚动事件，滑动交给 ScrollView处理，但是该问题在于RecyclerView的View无法重用，所有Item会在初始时全部加载

###  NestedScrolling 特性

eg: Md中的滚动隐藏Toolbar过程





















---

[Android 嵌套滑动机制（NestedScrolling）](https://segmentfault.com/a/1190000002873657)
