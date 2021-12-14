---
layout: post
title: Java 模式- 观察者
category: java
---

### 观察者模式：

一般来说，我们要实现对于某个数据对象提供者(Subject)相关的业务逻辑，不考虑模式的情况下，从业务逻辑的角度，针对具体业务编程，那么我们会定义一个类 (Reader)去从 Subject中获得数据，然后进行具体的业务逻辑操作；

OK，这样就必然带来一个问题，那就是两者被紧密的耦合在了一起，你中有我我中有你，一旦后期有业务需求上的改动(事实上实际中改是必然，不改是不可能的),那么两者就需要同步修改，牵一发而动全身，这就是紧耦合带来的系统低扩展弹性；

回到模式上来，模式的根本在我理解看来都是为了解耦抽象封装服务，为了可扩展可维护服务；

对于观察者模式来说，就是如何设计更好的 Subject 与 Reader组合模型结构，一种比较合适的比较模型就是RSS订阅机制，一旦注册订阅了源站内容，只要源站内容有更新，就会利用推送机制自动推送到读者手上，这种注册订阅机制就是观察者模式的核心；

当有多个订阅读者时，只要都注册订阅了，那么Subject 只需利用合适的数据结构存放读者列表，但一旦内容更新，一一推送即可；一旦不再不再关心这个订阅内容，订阅者可以取消订阅，Subject从订阅列表中删除该用户，不再推送；

观察者模式的定义：

定义对象之间的一种一对多关系，当一个数据对象发生变化，多个以来其的对象都得到通知并更新自身状态；

进一步分析，若是直接利用这一规则，构建具体的实例，仔细想想，如果画出类图对象之间依旧有直接耦合，利用怎样的方式去变直接耦合为间接松耦合呢？

针对接口编程实现可以变强耦合为松耦合，接口编程的实现，使观察者与目标之间变为了抽象层的耦合，目标与观察者只是在抽象层层面的耦合，目标（内容）只主要关注其实现接口，而无须关注具体的观察者实现问题；

{:.center}
![observe](http://res.oncelee.com/assets%2Fimg%2F20160117%2Fobserve.png)


### 单向依赖

在观察者模式中，所存在的依赖只是单向的，具体的说就是 观察者依赖目标内容的更新，被动依赖通知获取；而目标却并不依赖于观察者，对目标而言，所有的观察者都一视同仁，所有订阅者都一一主动发送广播通知

一种观察者模式的变种，通过目标控制，有意识的控制特殊情况的通知对象，特殊状态变化通知特殊订阅者，如RSS分主题推送，订阅了特殊主题的订阅者才会在该主题更新时，收到通知，而不是整个站点所有的更新都推送；

### 推模式

所谓的推模式与拉模式都是针对于观察者的，推模式是指观察者被以广播通信推送的方式直接获取了内容读取全部或者部分更新，而不管观察者是否真正需要；

 
### 拉模式

而拉模式则区别，是指目标对象只简单的传递内容更新的信号，通过把自身对象，或者其目标内容对象传递过去，当观察者需要内容时直接根据传递过来的内容对象的引用获取需要的内容；这样的方式一般是 目标对象设定了对应内容的 获取函数，如 `Content.getName();` 之类的Getter函数；



两种模式代码示例：

{%  highlight java%}
    
    @Override
    public void update(Content content) {
        System.out.println("content.name:" + content.name);
        System.out.println("content.age:" + content.age);
    }

    @Override
    public void update(String content) {
        //do something
        System.out.println("String content :" + content);
    }

{% endhighlight %}

可以看出两种模式上，一种是Subject准备好全部的内容，按照相应内容格式广播推送过来，另一种则是传递内容引用，由观察者主动获取，需要哪方面内容就取哪方面内容；

### Java中的Observe接口

Java中已经定义了合适的 观察者模式相应接口：

`util.Observer`

`util.Ovservable`


仔细研究一下主要的 Observable 类中几个主要核心函数：

{%  highlight java%}

public class Observable {
    private boolean changed = false;
    private Vector<Observer> obs;

    ......

    public synchronized void addObserver(Observer o) {
        if (o == null)
            throw new NullPointerException();
        if (!obs.contains(o)) {
            obs.addElement(o);
        }
    }


     public synchronized void deleteObserver(Observer o) {
        obs.removeElement(o);
    }

     public void notifyObservers(Object arg) {
        /*
         * a temporary array buffer, used as a snapshot of the state of
         * current Observers.
         */
        Object[] arrLocal;

        synchronized (this) {
            /* We don't want the Observer doing callbacks into
             * arbitrary code while holding its own Monitor.
             * The code where we extract each Observable from
             * the Vector and store the state of the Observer
             * needs synchronization, but notifying observers
             * does not (should not).  The worst result of any
             * potential race-condition here is that:
             * 1) a newly-added Observer will miss a
             *   notification in progress
             * 2) a recently unregistered Observer will be
             *   wrongly notified when it doesn't care
             */
            if (!changed)
                return;
            arrLocal = obs.toArray();
            clearChanged();
        }

        for (int i = arrLocal.length-1; i>=0; i--)
            ((Observer)arrLocal[i]).update(this, arg);
    }


     protected synchronized void setChanged() {
        changed = true;
    }


{% endhighlight %}

从上面可以看到 为了适用多线程场景，Java内置为同步函数，同时将我们一般使用的List，改为了Vector向量实现，但是本质思想都是一样的；除此之外 在加入观察者时，利用了 Contains函数，也就是我们如果重写了 equals函数就需要小心了，写的不好造成冲突将会收不到推送；



### Android中典型应用

观察者接口回调




---

Quote:

《HeadFirst 设计模式》

《研磨设计模式》


