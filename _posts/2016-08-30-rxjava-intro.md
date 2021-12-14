---
layout: post
title:  RxJava
category: android
keywords: [framework]
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

将异步条件下的，多逻辑线处理情形，变换为以数据流形式的单条主线下的串联，即 在异步操作下组合工作流而不用组合多重嵌套，精简逻辑

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

引用抛物线的简单的解释：

> 在 Observable 执行了 lift(Operator) 方法之后，会返回一个新的 Observable，这个新的 Observable 会像一个代理一样，负责接收原始的 Observable 发出的事件，并在处理后发送给 Subscriber；类似代理机制，通过事件拦截和处理实现事件序列的变换。


详细的解释有一些复杂，这里借助 [谜之RxJava（二）—— Magic Lift](https://segmentfault.com/a/1190000004049841)一文以及RxJava源码重新解读一下所引用结论：

lift 涉及到 2个 Subscriber, 2个 OnSubscribe ，2个 Observable，也就有了目标与中间之分，源码及其解释如下

{% highlight java %}

......
return new Observable<R>(new OnSubscribe<R>() {
    @Override
    // Lift 操作后新生成的 Observable 被订阅后触发了该OnSubscribe进而通知原 OnSubscribe，发出事件交由代理Subscriber预处理，进而转交 目标Subscriber
    public void call(Subscriber<? super R> o) {
        try {
            // 通过该OperatorMap 生了一个新的 Subscriber 作为 原目标订阅者的代理
            Subscriber<? super T> st = hook.onLift(operator).call(o);
            try {
                // new Subscriber created and being subscribed with so 'onStart' it
                st.onStart();
                onSubscribe.call(st);//这个onSubscribe是Observable的OnSubScribe属性对象
            } catch (Throwable e) {
                // localized capture of errors rather than it skipping all operators
                // and ending up in the try/catch of the subscribe method which then
                // prevents onErrorResumeNext and other similar approaches to error handling
                if (e instanceof OnErrorNotImplementedException) {
                    throw (OnErrorNotImplementedException) e;
                }
                st.onError(e);
            }
        } catch (Throwable e) {
            if (e instanceof OnErrorNotImplementedException) {
                throw (OnErrorNotImplementedException) e;
            }
            // if the lift function failed all we can do is pass the error to the final Subscriber
            // as we don't have the operator available to us
            o.onError(e);
        }
    }
});

/////////////////////////////////////////////////////////////////////////////////
Subscriber<? super T> st = hook.onLift(operator).call(o);
// st 实质上是 o的代理，关键在于 transformer.call(t)，执行了 list转换：
@Override
public Subscriber<? super T> call(final Subscriber<? super R> o) {
    return new Subscriber<T>(o) {

        @Override
        public void onCompleted() {
            o.onCompleted();
        }

        @Override
        public void onError(Throwable e) {
            o.onError(e);
        }

        @Override
        public void onNext(T t) {
            try {
                o.onNext(transformer.call(t));
            } catch (Throwable e) {
                Exceptions.throwIfFatal(e);
                onError(OnErrorThrowable.addValueAsLastCause(e, t));
            }
        }

    };
}

{% endhighlight %}

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
![RxJava_Stream](http://res.oncelee.com/assets/img/20160830/rxjava_pic.jpg)

**图片来源于引用文章——RxAndroid Basics: Part 2**


### RxJava + Retrofit + Mvp

几个框架的结合使用需要解决几个问题：

*  如何在一些View Destroy的Case下解除订阅，防止内存泄漏，如何管理这些观察者

*  如何处理Error，由于事件的过程中的Error都被处理到onError函数中处理，如何区分网络以及后台异常，亦或是处理特殊后台错误码事件的针对性处理


第一个问题，我们知道observable.subscribe()返回 Subcription对象，这个问题的关键就在于管理改对象，适当的时候完成解除订阅：借助CompositeSubscription对象管理可以完成

第二个问题，可以借助 onError中的Error类别处理，如Retrofit中转换Adapter中的error类别为：httpException,可以通过类别判断后做类型转换，得到对应的errorCode，进行细分处理；

* error处理函数： onErrorReturn()、retry()

#### RxJava中请求的取消问题

在Retrofit中，构建的Call对象可以利用cancel取消，而结合Rxjava之后retrofitApi构建的对象是Observable，如何取消这个请求呢？

查阅 RxJavaCallAdapterFactory 源码我们看看 Call对象是如何构建为 Observable对象：

{% highlight java %}

////////////////////////////////////////////////////////////////////
//Observable 构建依赖该对象
static final class CallOnSubscribe<T> implements Observable.OnSubscribe<Response<T>> {
    private final Call<T> originalCall;

    CallOnSubscribe(Call<T> originalCall) {
      this.originalCall = originalCall;
    }

    @Override public void call(final Subscriber<? super Response<T>> subscriber) {
      // Since Call is a one-shot type, clone it for each new subscriber.
      Call<T> call = originalCall.clone();

      // Wrap the call in a helper which handles both unsubscription and backpressure.
      RequestArbiter<T> requestArbiter = new RequestArbiter<>(call, subscriber);
      subscriber.add(requestArbiter);
      subscriber.setProducer(requestArbiter);
    }
  }

/////////////////////////////////////////////////////////////////////////

static final class RequestArbiter<T> extends AtomicBoolean implements Subscription, Producer {
  private final Call<T> call;
  private final Subscriber<? super Response<T>> subscriber;

  RequestArbiter(Call<T> call, Subscriber<? super Response<T>> subscriber) {
    this.call = call;
    this.subscriber = subscriber;
  }

  @Override public void request(long n) {
    if (n < 0) throw new IllegalArgumentException("n < 0: " + n);
    if (n == 0) return; // Nothing to do when requesting 0.
    if (!compareAndSet(false, true)) return; // Request was already triggered.

    try {
      Response<T> response = call.execute();
      if (!subscriber.isUnsubscribed()) {
        subscriber.onNext(response);
      }
    } catch (Throwable t) {
      Exceptions.throwIfFatal(t);
      if (!subscriber.isUnsubscribed()) {
        subscriber.onError(t);
      }
      return;
    }

    if (!subscriber.isUnsubscribed()) {
      subscriber.onCompleted();
    }
  }

  /**
  * 关键函数，该封装了Call的subcription集合体 被Add到subcriber对象中，当解除注册的时候，请求取消
  */
  @Override public void unsubscribe() {
    call.cancel();
  }

  @Override public boolean isUnsubscribed() {
    return call.isCanceled();
  }
}


{% endhighlight %}

可以看出这里可以放入上述 View Destroy的Case下解除订阅一起解决问题；



### 常用 Oprator

#### compose VS  flatMap  VS concatMap

flatMap将发射的序列转换成另外一种对象的 Observable 序列，注意：其合并时允许事件之间的交叉，即 flatMap() 不保证最终生成的 Observable 和源 Observable 发射序列相同。

concatMap 保留事件的顺序



conpose 实际是利用 Transformer,而该Transformer实际上就是一个Func1<Observable<T>, Observable<R>>，同样的 Observable 转换，与flatMap不同的是:

>  If the operator you are creating is designed to act on the individual items emitted by a source  Observable, use {@link #lift}. If your operator is designed to transform the source Observable as a whole (for instance, by applying a particular set of existing RxJava operators to it) use {@code compose}.

compose 能够从数据流中获取到原始 Observable，从而对其操作，改变整个数据流，同时其生效的时机是原始 Observable 流创建之时，对整个数据流改变，而flatMap则是对于 Observable的发射事件作出改变，其效率相对较低；更重要的是 compose 保留了整个数据流的链式结构


#### first VS  takeFirst


> The difference between the two calls is that first() will throw a NoSuchElementException if none of the sources emits valid data, whereas takeFirst() will simply complete without exception.


#### defer vs create

defer 利用 Observerable工厂构建 Observerable，在被订阅时开始构建，对比 create完成了延迟构建，可以在构建时获取到最新的构建变量值，而不同于create的预先初始化；





#### concat /  mergeWith / ofType等


#### backpressure


Backpressure 是用来描述，生产者生产数据的速度比消费者消费数据的速度快的一种情况。如果没有处理这种情况，则会出现 MissingBackpressureException 。

[Backpressure](http://stackoverflow.com/documentation/rx-java/2341/backpressure#t=201609180656331698516)


### Subject

*  AsyncSubject：当事件序列完成（onComplete之后）发送最后一个事件给观察者    
*  BehaviorSubject：发送订阅时间之前的最后一个事件给观察者以及其订阅之后的事件              
*  PublicshSubject:只会将被订阅之后的事件发送给观察者              
*  ReplaySubject:无论该Subject何时被订阅，其所有已产生的事件都会发送给观察者                     
*  SerializeSubject: 封装实现线程安全的Subject                   


---

[Advanced Reactive Java](http://akarnokd.blogspot.hu/)

[ReactiveX - intro](http://reactivex.io/intro.html)

[ReactiveX/RxJava文档中文版](https://mcxiaoke.gitbooks.io/rxdocs/content/)

[Alphabetical List of Observable Operators](https://github.com/ReactiveX/RxJava/wiki/Alphabetical-List-of-Observable-Operators)

[给 Android 开发者的 RxJava 详解](http://gank.io/post/560e15be2dca930e00da1083)

[The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754)

[Error handling in RxJava](http://blog.danlew.net/2015/12/08/error-handling-in-rxjava/)

[RxAndroid Basics: Part 1](https://medium.com/@kurtisnusbaum/rxandroid-basics-part-1-c0d5edcf6850#.8tt6ccqfu)

[RxAndroid Basics: Part 2](https://medium.com/@kurtisnusbaum/rxandroid-basics-part-2-6e877af352#.yqf22uuvf)

[Grokking RxJava, Part 1: The Basics](http://blog.danlew.net/2014/09/15/grokking-rxjava-part-1/)

[Grokking RxJava, Part 2: Operator, Operator](http://blog.danlew.net/2014/09/22/grokking-rxjava-part-2/)

[Grokking RxJava, Part 3: Reactive with Benefits](http://blog.danlew.net/2014/09/30/grokking-rxjava-part-3/)

[Grokking RxJava, Part 4: Reactive Android](http://blog.danlew.net/2014/10/08/grokking-rxjava-part-4/)

[Why you should use RxJava in Android a short introduction to RxJava](http://blog.feedpresso.com/2016/01/25/why-you-should-use-rxjava-in-android-a-short-introduction-to-rxjava.html)

[Why should we use RxJava on Android](https://medium.com/@lpereira/why-should-we-use-rxjava-on-android-c9066087c56c#.w4hucpy2c)

[Airbnb：我们的安卓客户端是如何使用 RxJava 的](https://realm.io/cn/news/kau-felipe-lima-adopting-rxjava-airbnb-android/)

[RxJava 的周末狂欢](http://gold.xitu.io/entry/5695c3ba60b2d6907c9081ef)

[RxJava变换操作符：.concatMap( )与.flatMap( )的比较](http://www.jianshu.com/p/6d16805537ef)
