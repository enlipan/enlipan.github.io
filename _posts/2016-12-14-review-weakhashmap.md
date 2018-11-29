---
layout: post
title:  Review WeakHashMap
category: java
keywords: [improvement,android,java]
---


缓存是开发过程中最常见的实现，SoftRefrence 和 WeakReference使用尤其多，而其中对于 WeakHashMap 的使用细节则尤其丰富，今天看到知乎专栏的一篇翻译文章，看了一下原文发现自己对这个使用的Case有一些模糊，回忆了一下发现自己过去有一些不正规的使用，这里做一个回顾总结，事实上引用的几个链接将该问题讲的非常清晰；


* 缓存引用常见的使用形式有 LinkList<WeakReference<Obj>> |  List<SoftRefrence<Obj>> 等构件形式

* 弱引用的存在可以减轻在构件缓存时，时刻需要注意的对象的添加删除问题，如果只添加不删除则会导致内存泄漏问题，若删除时机控制不得当又可能造成对象还在引用使用却被强制删除的尴尬，非常难以处理，基本相当于需要自行实现一套类似JVM的GC逻辑，去控制对象是否应该存在于内存之中；对比之下弱引用的作用就凸显出来了，符合JVM的GC生命周期，需要注意的是弱引用和软引用的使用并不能让我们随心所欲的控制JVM，而是配合JVM


以上这些并不在我这次总结的重点，我这里主要总觉所看到的和所想明白的WeakHashMap的一些知识和使用：

* WeakHashMap 使用时 其Key为 WeakReference，而不是Value，当WeakHashMap所存储的Key，不存在其他的强引用引用该对象时该Key键值WeakReference<Key>所引用对象被回收时，其对应Value<>也将从 Map中Remove；

一些StackOverFlow提到的使用场景：


{% highlight java %}
//1
//利用 WeakHashMap 做接口注册监听管理组件，事实上一般接口的注册常常对应着合适的解除注册监听
//利用WeakHashMap则可以避免繁琐的解除观察，解除注册的构建问题
ObserverManager.registerListener(listenerImpl);

//2
//构建WeakRefrenceHashSet >>nice
Set<ListenerType> listenerSet = Collections.newSetFromMap(new WeakHashMap<ListenerType, Boolean>());

//3
//Value 在WeakHashMap中属于强引用
WeakHashMap<Mutex, WeakReference<Mutex>>

// 引申,在Android开发常用
// WeakHashMap常常用于跟踪对象的轨迹，可以用于防止该对象的内存泄漏
WeakHashMap<Activity,ExtraInfoMation>

{% endhighlight %}


{:.center}
![Java References](http://img.javaclee.com/assets/img/20161214/Java_obj_refrence_weak.png)




---

Quote:

[When would you use a WeakHashMap or a WeakReference? -- stackOF](http://stackoverflow.com/questions/154724/when-would-you-use-a-weakhashmap-or-a-weakreference)


[Understanding Weak References Blog](https://community.oracle.com/blogs/enicholas/2006/05/04/understanding-weak-references)

[Finally understanding how references work in Android and Java](https://medium.com/google-developer-experts/finally-understanding-how-references-work-in-android-and-java-26a0d9c92f83#.g2npyahmx)
