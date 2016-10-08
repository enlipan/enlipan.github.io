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


####  RxJava 优势

> A simple operation of transforming or filtering the information from the database would require new interfaces and restructuring code in order to respect the implemented architecture. With RxJava this is a lot easier, by simply creating an Observable which retrieves all the information and then you can use any of these methods to filter and retrieve only the information you want.



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


>  Functional transformations are transformations of data that don’t rely on any data outside of the function that does the transformation and that don’t have any side effects.

>  RxJava does perform completely functional transformations of asynchronous data.

####  观察者 Observer（接口）以及 Subsrciber(抽象类)

Subcription 代表了 可观察对象与观测者之间的联系；

从源码可以看到，本质上 Subsrciber是实现了 Observer接口以及 Subcription 接口的抽象类，所以可以说Subscriber是增加了功能函数的Observer，其增加的函数都是极为强大的，如：

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

OnSubscribe:

>  OnSubscribe 会被存储在返回的 Observable 对象中，它的作用相当于一个计划表，当 Observable 被订阅的时候，OnSubscribe 的 call() 方法会自动被调用，事件序列就会依照设定依次触发（对于上面的代码，就是观察者Subscriber 将会被调用三次 onNext() 和一次 onCompleted()）。这样，由被观察者调用了观察者的回调方法，就实现了由被观察者向观察者的事件传递，即观察者模式。


### 巧用数据转换减负Subscriber 业务逻辑

#### Operators

Map转换：

> We can chain as many map() calls as we want together, polishing the data into a perfect, consumable form for our end Subscriber.

* Map(): 不光可以用作数据逻辑处理，还可以做数据类型转换，这一点非常有用；

* flatMap(): Observable --> item emitted 转换 => 返回 订阅者需要的事件；同时与map() 不同的是， flatMap() 中返回的是个 Observable 对象

> 由于可以在嵌套的 Observable 中添加异步代码， flatMap() 也常用于嵌套的异步操作，例如嵌套的网络请求

这样嵌套的有序网络请求，去除了传统的CallBack中嵌套的繁琐代码，而保证了链式请求的清晰逻辑，确实是十分简洁有效的，优势非常强大

* filter(): 过滤器 Observable 所产生的事件，只有符合条件的事件才会被订阅者接收到

>  only emitting those that satisfy a specified predicate.

* take():

* doOnNext():


#### 变换核心

lift():

如果看源码就发现，其核心是lift()函数：

简单的解释：

> 在 Observable 执行了 lift(Operator) 方法之后，会返回一个新的 Observable，这个新的 Observable 会像一个代理一样，负责接收原始的 Observable 发出的事件，并在处理后发送给 Subscriber；类似代理机制，通过事件拦截和处理实现事件序列的变换。


###  OnError

OnError的优势在于，异常的统一化处理，而改变的原有的四处TryCatch:

> onError() is called if an Exception is thrown at any time.

> With callbacks, you have to handle errors in each callback. Not only does that lead to repetitious code, but it also means that each callback must know how to handle errors, meaning your callback code is tightly coupled to the caller.


### RxAndroid

RxAndroid 是基于RxJava的一个扩展库，适用于Android开发，包含了一些Android上的的特殊操作；如：

*  针对Handler

*  BindActivity  BindFragment

* ViewObservable

*  ...


### 已知可能出现的问题

*  Activity 旋转以及重建问题

> 当利用Retrofit 进行网络请求，并将请求结果发送到观察者，展示在UI上，这时用户旋转了屏幕，Activity重建，可以利用网络请求如OkHttp缓存，Activity重建后将缓存内容刷新到界面上

*  Observables 持有Contex 导致的内存泄漏问题

> 在OnDestroy 中及时 unsubscribe(),解除依赖，防止内存泄漏




### RxJava核心

RxJava如果不使用其异步处理机制，就没有使用到其真正优雅的地方，Rx的异步函数式处理机制真正做到了让异步处理逻辑线性化，可操纵化，更加形象的说法是数据流的形式做函数式处理；


#### Schedulers

* subscribeOn(): 指定 所观察者订阅 Observable.OnSubscribe(订阅事件) 被激活时所在的线程,Observable 创建所发生的线程 即事件创建发生所在的线程；

>  Asynchronously subscribes Observers to this Observable on the specified Scheduler.

* observeOn(): 指定 Observable 所发射事件以及通知发生在一个指定的线程Schedulers，消费事件所发生的线程；

>  Modifies an Observable to perform its emissions and notifications on a specified Scheduler

subscribeOn 与 observeOn 真正强大的地方在于用简单的方式控制了线程的执行顺序，你可以任意组合拼接则两个 Operator，而不用在以前繁琐的 Future或者CallBack中去小心的控制线程事件的嵌套，线程的嵌套也是多线程编程最容易出现问题的地方之一；



Schedulers:

*  Schedulers.immediate()                    
*  Schedulers.newThread()                         
*  Schedulers.io()                 
*  Schedulers.computation()                        
*  RxAndroid --> AndroidSchedulers.mainThread()             



{:.center}
![RxJava_Stream](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160830/rxjava_pic.jpg)

**图片来源于引用文章——RxAndroid Basics: Part 2**

---

[ReactiveX - intro](http://reactivex.io/intro.html)

[ReactiveX/RxJava文档中文版](https://mcxiaoke.gitbooks.io/rxdocs/content/)

[Alphabetical List of Observable Operators](https://github.com/ReactiveX/RxJava/wiki/Alphabetical-List-of-Observable-Operators)

[给 Android 开发者的 RxJava 详解](http://gank.io/post/560e15be2dca930e00da1083)

[RxAndroid Basics: Part 1](https://medium.com/@kurtisnusbaum/rxandroid-basics-part-1-c0d5edcf6850#.8tt6ccqfu)

[RxAndroid Basics: Part 2](https://medium.com/@kurtisnusbaum/rxandroid-basics-part-2-6e877af352#.yqf22uuvf)

[Grokking RxJava, Part 1: The Basics](http://blog.danlew.net/2014/09/15/grokking-rxjava-part-1/)

[Grokking RxJava, Part 2: Operator, Operator](http://blog.danlew.net/2014/09/22/grokking-rxjava-part-2/)

[Grokking RxJava, Part 3: Reactive with Benefits](http://blog.danlew.net/2014/09/30/grokking-rxjava-part-3/)

[Grokking RxJava, Part 4: Reactive Android](http://blog.danlew.net/2014/10/08/grokking-rxjava-part-4/)

[Why you should use RxJava in Android a short introduction to RxJava](http://blog.feedpresso.com/2016/01/25/why-you-should-use-rxjava-in-android-a-short-introduction-to-rxjava.html)

[Why should we use RxJava on Android](https://medium.com/@lpereira/why-should-we-use-rxjava-on-android-c9066087c56c#.w4hucpy2c)

[Airbnb：我们的安卓客户端是如何使用 RxJava 的](https://realm.io/cn/news/kau-felipe-lima-adopting-rxjava-airbnb-android/)