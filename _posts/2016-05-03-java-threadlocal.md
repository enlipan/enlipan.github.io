---
layout: post
title: ThreadLocal 的一些说明
category: java
keywords: [android, java,os]
---


对于ThreadLocal 并不陌生，J2EE ，Looper以及 EventBus 里面都能够看到 ThreadLocal 的身影，ThreadLocal 如其名，常常伴随 Thread一起出现，同时简单的了解其存储线程变量独立副本的特性之后，很多人认为其是为了解决 **竞态条件(打印机问题)**而出现的一个解决方案 ，然而**其实并不是**。


###  ThreadLocal 与 Thread Local  Storage

ThreadLocal 本身是为了解决操作系统中的 TLS 问题而生，所谓的 TLS 也就是 Thread Local Storage 概念，即线程本地存储，Java中将该变量抽象了出来，有点混淆概念的感觉，尽管 操作系统线程在Java线程中被用于诸多部分，但是在 Java TLS 中 并没有使用 native 的  TLS 实现，而转而用 线程与属性值的映射实现了 TLS；


进程中，线程之间共享地址空间，进而进程之间共享全局变量；突然想起了 Volatile 解决线程之间共享变量时的 CPU 缓存以及代码重排序问题，这里只提一下，不作引申；共享全局变量的一个问题就是 多线程共同协作时一个线程更改该变量会导致其他线程该变量同步修改，有些时候我们并不希望一个线程运行时改变其他线程的上下文环境，利用TLS 完成多线程中的该上下文变量互不影响；TLS 解决了线程之间访问同一环境时的，线程对于环境操作后的，线程之间的环境污染问题；


####  线程本地存储与线程之间竞态问题处理的差异


当线程之间访问同一全局变量时，我们为了防止多线程操作时导致该全局变量的状态不可控，进而引入互斥规范化线程之间的协作，典型的如生产消费者机制；互斥的结果并没有改变线程之间对于该属性变量的共享机制；

而对于 TLS 我们希望将一个属性变量设置为全局共享，也就是不仅仅只是线程内部可以访问的局部变量，而是其他线程都可以访问的，而又不想上升到进程全局都可以随意修改该共享属性影响其他线程的层级，线程对于该属性的操作之间无污染；TLS 为解决这一问题而引申出来，解决了在线程局部环境中可以全局访问属性，而又营造了一种线程之间的隔离环境；

针对 ThreadLocal 的这种线程之间的隔离特性，很多人发现他可以解决某些情况下的互斥问题，进而就理解为 ThreadLocal 为此而诞生，舍弃本质，是有问题的；


###  ThreadLocal 差异

对于 ThreadLocal 的实现，JDK 与 Android 所用的 OpenJDK 是有差异的，先来看看 JDK：


{% highlight java %}

/**
 * Returns the value in the current thread's copy of this
 * thread-local variable.  If the variable has no value for the
 * current thread, it is first initialized to the value returned
 * by an invocation of the {@link #initialValue} method.
 *
 * @return the current thread's value of this thread-local
 */
public T get() {
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null) {
        ThreadLocalMap.Entry e = map.getEntry(this);
        if (e != null)
            return (T)e.value;
    }
    return setInitialValue();
}

/**
 * Variant of set() to establish initialValue. Used instead
 * of set() in case user has overridden the set() method.
 *
 * @return the initial value
 */
private T setInitialValue() {
    T value = initialValue();
    Thread t = Thread.currentThread();
    ThreadLocalMap map = getMap(t);
    if (map != null)
        map.set(this, value);
    else
        createMap(t, value);
    return value;
}

{% endhighlight %}  

而 OpenJDK 的对应函数以及属性：

{% highlight java %}

public T get() {
    // Optimized for the fast path.
    Thread currentThread = Thread.currentThread();
    Values values = values(currentThread);
    if (values != null) {
        Object[] table = values.table;
        int index = hash & values.mask;
        if (this.reference == table[index]) {
            return (T) table[index + 1];
        }
    } else {
        values = initializeValues(currentThread);
    }

    return (T) values.getAfterMiss(this);
}

{% endhighlight %}  

可以看到 JDK 中利用 ThreadLocalMap 类存储线程 TLS 属性，而 Android 源码中对应的 则是利用 Valus 内部类使用 Object数组 做属性构建存储；


---

Quote:

[A Painless Introduction To Java’s ThreadLocal Storage](https://www.appneta.com/blog/introduction-to-javas-threadlocal-storage/)


[Thread-local storage —— WIKI](https://en.wikipedia.org/wiki/Thread-local_storage)
