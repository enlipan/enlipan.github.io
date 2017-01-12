---
layout: post
title:  理解Rxjava lift 的链式过程
category: java
keywords: [improvement,java]
---

首先要理清核心概念Observable/OnSubscribe/Observer(Subscriber)

### lift










### SubscribeOn 、ObserveOn







### Lambda

Rx的优秀范例大多使用了lambda expressions,不能一直期待他人将其翻译为通用代码，要掌握第一手资料就要学习其规则，事实上对于Lambda表达式一直没有正视，但当真正开始了解之后发现其确实非常强大，可以借助其写出非常简洁的实现，尤其是其函数接口的实现方式，可以更好的面向接口编程；这就像不理解泛型不理解其重要性而无法正确使用泛型，而当真正理解泛型，知道其对于对象类型安全检查，对于烦人的显式强转问题，消除类型转换，精简代码，以及在编译阶段进行强类型检查(针对多态问题，编译器可以在编译器精确知道其类型)，排除可能的类型转换异常，而为针对父子类层次的问题，又引入了泛型有界类型指定上下边界问题，同样Lambda表达式也需要理解。

函数式接口：接口中只有一个抽象方法；

Lambda表达式语法：(int x,int y) -> {x + y},也就是定义形参 -> 实现的语法；



Android中对于 lambda表达式，函数式接口匿名类实现可直接使用，但对于高级流Stream等实现需要使用retrolambda进行支持

>   https://github.com/evant/gradle-retrolambda               
>  https://github.com/aNNiMON/Lightweight-Stream-API         

Java8 新特性之接口函数的默认实现-default关键字，解决接口与实现之间的耦合，接口每一个新增函数，其所有实现都必须强制实现；

虽然增加了该特性，看起来接口与抽象类似乎更像了，但是依旧还是有本质区别，接口无构造函数，无this指针，无实例字段，无对象状态，而抽象类有这些，同时抽象类无法配合Lambda表达式使用；

同时针对接口默认实现可能造成的与抽象类的函数冲突性问题，其准则为类实现优先级高于接口默认实现

---

Quote:

[给 Android 开发者的 RxJava 详解](https://gank.io/post/560e15be2dca930e00da1083#toc_19)

[RxJava基本流程和lift源码分析](http://blog.csdn.net/lzyzsd/article/details/50110355)

[自己动手实现 RxJava 理解其调用链](https://www.diycode.cc/topics/355)

[理解RxJava线程模型](https://blog.saymagic.tech/2016/08/20/understand-rxjava-threading-model.html)

[SubscribeOn 和 ObserveOn](http://blog.piasy.com/AdvancedRxJava/2016/09/16/subscribeon-and-observeon/)

[拆轮子系列：拆 RxJava](http://blog.piasy.com/2016/09/15/Understand-RxJava/)

[Operators Introduction](http://reactivex.io/documentation/operators.html)

[lambda expressions](http://www.oracle.com/webfolder/technetwork/tutorials/obe/java/Lambda-QuickStart/index.html)

[Java8 lambda表达式10个示例](http://www.importnew.com/16436.html)

[深入浅出 Java 8 Lambda 表达式](http://blog.oneapm.com/apm-tech/226.html)
