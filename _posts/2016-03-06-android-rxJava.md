---
layout: post
title: RxJava
category: android
---

是什么？

ReactiveX is a library for composing asynchronous and event-based programs by using observable sequences.

一个采用可观察对象序列组合而成的异步且基于响应事件编程的库；

ReactiveX is sometimes called “functional reactive programming” but this is a misnomer.

函数响应式编程所操作的对象是随着时间变化而连续不断的变化的；而 ReactiveX 的作用对象在时间变化线上是被观察者对象发出后就各自分离的；

为什么要用RxJava？有什么优势？

可以变复杂的异步事件序列为简介的事件序列，组合各类事件操作集合如同利用Array 组合数据元素一样简洁；同时可以精简繁杂的业务逻辑，提升代码可读性；

数据流与事件流？

RxJava 核心是基于观察者模式对observable数据流的操作变化；

如何用RxJava？

observable 对象 : 被观察对象 —— 事件的来源；当 observable 对象产生事件后，订阅其的 Observer 对象做出相应的响应；

observable 创建函数： create()  just()  from()



Subscribe 订阅者： Action、 Subscribe 。Observable 产生消息事件，Subscribe 消费事件二者对应；独立的Observable 并不产生消息，只有在被订阅之后才会对于整个系统产生作用；



Schedule 调度器：

利用 subscribeOn(Scheduler scheduler) 可以指定 observable 的事件源所执行线程；而通过执行 ObserveOn() 可以指定订阅者Subscribe 其回调函数OnNext()等执行线程；

>  Schedulers.from(executor)              
>
> Schedulers.io()            
>  
> Schedulers.newThread()          
>
> Schedulers.computation()           
>
> Schedulers.trampoline()


RxJava 函数 —— Operators： map() flatmap()












---

Quote:

[ReactiveX](http://reactivex.io/intro.html)

[给 Android 开发者的 RxJava 详解](http://gank.io/post/560e15be2dca930e00da1083#toc_20)

[RxJava 专题](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0430/2815.html)

[gitbooks- RxJava](https://asce1885.gitbooks.io/android-rd-senior-advanced/content/index.html)

[深入浅出RxJava（一：基础篇）](http://blog.csdn.net/lzyzsd/article/details/41833541)

[ReactiveX--响应式编程](http://frodoking.github.io/2015/09/08/reactivex/)

[ReactiveX异步处理数据流](http://www.soft6.com/news/201509/17/257895.html)
