---
layout: post
title: Java 模式- 单例
category: java
---

### 从模式说起

模式是针对一些特殊问题的公认的合适的实践方法集合，这些特殊问题往往在开发过程中重复多次出现，因为只有总结重复出现的问题的解决方案才有意义咧，一辈子出现一次的问题，方案总结出来了，大家没机会用，也就不会如Gof这样流传开来，所以这些通用的设计模式的理解与实践是有重要意义的；

通过学习模仿设计模式，并总结自己的一套使用规则可以有效的提升自己的视野，便于从更高的角度去看待代码结构；同时设计模式已经开始成为软件开发行业的一些高级交流术语，也是有必要了解的；

模式的学习不是一蹴而就的，模式需要反复学习，反复总结，当然这些都是勉励我自己的，只有知道学习一样东西的意义才会更加有动力去学习；

 
### 单例模式

保证在应用运行时期，在*整个JVM*中，一个类永远只存在一个实例对象，一般用于处理大型重度使用对象，比如读取配置文件的AppConfig类等；

要想一个类只有一个实例，我们当然首先要屏蔽外部实例构造，也就是 将构造函数私有化；


`private Singleton(){} `

利用这样的方式使外部无法创建对象New实例，同时转化思路，只需要内部创建一个对象暴露给外部使用即可达到目的；进一步思考如何只维护一个对象呢？多各类都使用同一个对象，顺理成章的，静态对象就可以印出来了；

关于内部创建实例，又有两种常用模式，一种懒加载模式，一种是直接创建模式；

关于懒加载：

懒加载是很多地方都常用的一种加载模式，用于在对象真正被用到的时候才去加载创建对象实例，当然在对象被使用之前的内存占用就省去了。

{% highlight java %}
private static Singleton instance;
public static Singleton newInstance(){
    
    if(instance == null){
        instance = new Singleton();
    }
    return instance;
}
{% endhighlight %}   

那么这种传统懒加载模式有什么劣势呢？当然，如果我们仔细分析，可以看出，如果存在多个线程同时 通过 `newInstance()` 获取对象，而对象还没有的情况，若线程A已运行通过 `instance == null ` 准备执行 创建对象而对象还没创建好的时候，线程B 执行 instance 是否为空的检验，我们可以看到这时候检验也为 null ,所以线程B也会创建新对象，这时线程A 线程B 所拥有的对象是不一样的，也就是单例模式失败了，存在两个对象；

这时我们引入 直接创建模式，如果说懒加载 null 校验存在多线程问题，那么是不是我们直接 最开始就创建好，直接获取会比较好呢？

{% highlight java %}
private static Singleton instance = new Singleton();
public static Singleton getInstance(){
    return instance;
} 

{% endhighlight %}    

诚然这种方式解决了多线程问题，但是我们考虑一种情况，如果这个对象实在程序执行的末尾做清理工作的，而且对象很重，这种模式我们不是在程序运行初始就创建并且伴随程序整个生命周期，无法释放吗？这样实在浪费；


最后我们引入 Double Check 单例模式：

关于 Double check 我们先要理解 Volatile 关键字；

我们知道 Cpu内部有缓存，而且Cpu缓存的速度是最快的，所以我们经常看到什么内部二级缓存L2，三级缓存L3，同时多核心Cpu中，各线程读取值会缓存到各自的Cpu缓存中，进而在多线程共享变量时造成`内存一致性`错误，Volatile 就是为此而生的一种轻量级同步机制，其作用原理是强制cpu在读取值时都直接读取主内存中的真正的值，而不是先前的cpu读取主内存值并且缓存到cpu缓存这样的缓存模式；

需要知道的是，在Jvm内部编译的内部优化中有一种叫做代码重排序的操作，就是一些代码执行的先后顺序在Jvm中会变化，而利用了 Volatile 关键字后，会直接影响代码重排序，为了保证状态的正确性，Volatile 变量读取修改之前的代码是绝对不是到 放到读取修改之后执行；所以我们可以想象 Volatile 关键字对于性能是有一些影响的，当然比起同步锁 synchroniz 就要好得多了。

到这里我们可以进一步开始将 Double Check单例模式：

{% highlight java %}
private volatile  static Singleton instance;
public static Singleton getInstance(){
    if(instance == null){
        synchroniz{
            if(instance == null){
                instance = new Singleton();
            }
        }
    }
    return instance;
} 

{% endhighlight %}    


下面分析一下双重锁的意义：

volatile 关键字用于多线程实例执行时，当 instance对象 null 状态发生变化及时通知各个线程 instance 真实状态的正确获取，进而可以减少竞争进入 synchroniz 锁区的线程数量，而synchroniz的内部校验状态，则是仿制 万一同时有多个线程 一个在锁区正在创建对象，有其他线程却完成了 null 状态校验，进入锁区等待获取锁进行下一步对象创建；

一旦对象创建完成，由于volatile  的作用，后面的其他线程的 instance 状态都将是正确的，无需再进入锁区等候二轮校验；

双重校验的使用必然是影响性能的，所以需要慎重使用；

根据Effective Java一书中指出，枚举若是定义合适的构造函数就是最合适天然单例；

枚举保证了绝对的防止多次实例化，并且由JVM从根本上提供保证：

{% highlight java %}

    enum Single{
        INSTANCE("instance");

        private String values;
        Single(String str){
            values = str;
        }

        public void singleOption(){
            System.out.printf(values);
        }
    }
{% endhighlight %}  

这就是完整的单例模式思路；
