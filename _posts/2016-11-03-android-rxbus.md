---
layout: post
title:  Android Rxbus
category: android
keywords: [anroid,java,rxbus]
---

简单的RxBus实现：

{% highlight java %}

/**
 * 组合MVP使用--将对于取消订阅的操作封装在MVP Base基础类中
 */
public class RxFCBus {

    /**
     * SerializedSubject 包装线程安全的Subject
     *
     * PublishSubject 订阅操作时间线之后的产生的事件才会发送给观测者
     */
    private final Subject<Object,Object>  FCBus = new SerializedSubject<>(PublishSubject.create());

    private static volatile RxFCBus sRxBusInstance = null;
    private RxFCBus(){}
    public static RxFCBus getDefaultInstance() {
        if (sRxBusInstance == null){
            synchronized (RxFCBus.class){
                if (sRxBusInstance == null) {
                    sRxBusInstance = new RxFCBus();
                }
            }
        }
        return sRxBusInstance;
    }

    public void postEvent(Object obj){
        FCBus.onNext(obj);
    }

    public <T> Observable<T> ofObserverable(Class<T> eventClazz){
        return FCBus.ofType(eventClazz);
    }

}

{% endhighlight %}

RxBus有其优劣性，其利用RxJava简单快速的实现，对比利用接口和通知其优势明显，但却并不像 EventBus那样功能强大，尤其对于StickEvent的处理RxBus是有些复杂麻烦的，当然如果自行构建缓存也是可以处理，不过涉及到缓存的构建与清除等复杂工作依旧是比较麻烦的。


#### 针对RxBus中可能出现的 backpressure 处理：

Backpressure 是用来描述，生产者生产数据的速度比消费者消费数据的速度快的一种情况。如果没有处理这种情况，则会出现 MissingBackpressureException.

使用Oprator处理：

*  buffer函数    
*  如果一些items事件可以安全的忽略，则可以选择利用 throttleFirst, throttleLast, throttleWithTimeout，sample等时间段函数

**注意：以上的一些函数处理只能降低MissingBackpressureException出现的概率，依旧有可能出现**

使用 backpressure 处理策略：

* onBackpressureBuffer—— 针对buffer 容量区分有界buffer和无界buffer(在JVM容量允许范围之类——JVM不崩溃)     
* onBackpressureDrop 等              




---

[backpressure](http://stackoverflow.com/documentation/rx-java/2341/backpressure#t=201609180656331698516)
