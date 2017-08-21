---
layout: post
title:  Java 集合相关
category: java
keywords: [improvement,android,java]
---

### 集合相关  


#### HashMap   

知识点:

* HashMap   
* hash 算法,hash 计算    
* put   
* hash 碰撞       
* resize 扩容       
* get         
* 并发      

[Java HashMap工作原理及实现](http://yikun.github.io/2015/04/01/Java-HashMap%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86%E5%8F%8A%E5%AE%9E%E7%8E%B0/)

[Java 8：HashMap的性能提升](http://www.importnew.com/14417.html)

[关于Java集合的小抄](http://calvin1978.blogcn.com/articles/collection.html)

#### LinkedHashMap   

LRU算法实现:

* 限制大小    
* 移除least 使用     
* 提升最近使用的 Cache Level

#### ConcurrentLinkedQueue

非阻塞线程安全队列   

#### 原子操作的实现原理

[CAS](https://zh.wikipedia.org/wiki/%E6%AF%94%E8%BE%83%E5%B9%B6%E4%BA%A4%E6%8D%A2)

[原子操作的实现原理](http://www.infoq.com/cn/articles/atomic-operation)

 sun.misc.Unsafe 相关CAS操作的方法，compareAndSwapInt，compareAndSwapLong等
本质是将内存值与预期值作比较，判断是否相等，相等的话，写入数据，不相等不做操作，返回旧数据；

校验利用循环检测变量是否被其他线程更改,如果被更改则进入下一次循环操作;

除此之外,利用锁机制也能实现原子操作

#### LinkedBlockingQueue   

阻塞队列

生产消费者: 通过容器解耦生产者消费者的强耦合关系,二者不再直接通信,进而通过容器得到彼此之间的联系; - 这也是借助第三者完成二者解耦的典型应用