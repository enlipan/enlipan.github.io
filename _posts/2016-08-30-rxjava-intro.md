---
layout: post
title:  RxJava
category: android
---

>  RxJava is a Java VM implementation of ReactiveX (Reactive Extensions): a library for composing asynchronous and event-based programs by using observable sequences.

> ReactiveX is a library for composing asynchronous and event-based programs by using observable sequences.     
> The ReactiveX Observable model allows you to treat streams of asynchronous events with the same sort of simple, composable operations that you use for collections of data items like arrays. It frees you from tangled webs of callbacks, and thereby makes your code more readable and less prone to bugs.

>  In reactive programming the consumer reacts to the data as it comes in. This is the reason why asynchronous programming is also called reactive programming. Reactive programming allows to propagates event changes to registered observers.

> RxJava provides Observables and Observers. Observables can send out values. Observers, watch Observables by subscribing to them. Observers are notified when an Observable emits a value, when the Observable says an error has occurred. They are also notified when the	Observable sends the information that it no longer has any values to emit.

#### Observable Create

*  Observable.just()

* Observable.from()

* Observable.fromCallable()

### Rx 优势

当异步处理以及嵌套的业务逻辑逐渐增加之后，其代码可读性呈现断崖式下降，给后期维护带来巨大困难，同时异步操作之间的嵌套也难以控制，处理，而是用RX，可以从数据流的理念去处理异步逻辑，简化复杂的业务逻辑，消除多重嵌套，提升程序逻辑清晰度，以及代码可读性；除此之外，Rx还支持Lambda表达式，可以进一步精简各类繁琐冗余的匿名内部嵌套类；

将异步条件下的，多逻辑线处理情形，变换为以数据流形式的单条主线下的串联，

### 概念

观察者模式：


*  可观察者

*  观察者   

*  订阅行为

*  观测事件


事件序列：

*  onNext()

*  onComplete()

*  onError();


####  观察者 Observer（接口）以及 Subsrciber(抽象类)

从源码可以看到，本质上 Subsrciber是实现了 Observer接口以及Subcription接口的抽象类，所以可以说Subscriber是增加了功能函数的Observer，其增加的函数都是极为强大的，如：

unsubscribe();

unsubscribe 函数重要性在于，由于观察者与可观测对象之间的注册后的依赖关系，若不进行一些对象间的依赖的清楚，则可能造成内存泄漏，所以在不需要使用的情况下，应该尽快解除对象的依赖引用关系；

isUnsubscribed();

用于Check 观察者与可观察对象之间的依赖关系是否解除

onStart();

订阅开始时，发生于订阅者所在的线程之中，且无法指定函数的线程，只能处在改订阅者所在线程中，适用于一些准备工作或者初始化工作；


###  可观测对象 Observable

Observable对象的创建：


{% highlight java %}

/**
 * Returns an Observable that will execute the specified function when a {@link Subscriber} subscribes to
 * it.
 * /
observable.Create();

/** To convert any object into an Observable that emits that object, pass that object into the {@code just}
  * method.
  * /
observable.just([]);

observable.from(List);

/**
* just 与 from 的差异
* /
just(List) //发送一个事件，将List作为对象发射

from(List); //发送 List.size()个事件

just(T1,T2,T3)//发送多个事件

from(T[])//发送多个事件

{% endhighlight %}

###  订阅Subscribe（即观察者模式中的注册）





---

[ReactiveX - intro](http://reactivex.io/intro.html)

[ReactiveX/RxJava文档中文版](https://mcxiaoke.gitbooks.io/rxdocs/content/)
