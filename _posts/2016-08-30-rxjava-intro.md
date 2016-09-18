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













---

[ReactiveX - intro](http://reactivex.io/intro.html)

[ReactiveX/RxJava文档中文版](https://mcxiaoke.gitbooks.io/rxdocs/content/)
