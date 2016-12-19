---
layout: post
title:  Custom Retrofit Converter 实践
category: android
keywords: [improvement,android,java]
---

事实上这部分内容之前用过，不过是分别写入了Retrofit与Gson的两篇文章之中，突然看到一篇比较好的文章合并了两块，并且比我之前的一些内容更加丰富，也弥补了一些知识盲点，所以这里重新总结一篇文章：


























附注：

Gson中应用了诸多反射，构建了如TypeToken这样的对象去辅助，刚开始看到是比较疑惑的：

Type是什么?

Type接口是随着Java1.5的泛型支持同时引入，Type接口位于 `java.lang.reflect`,其文档定义为：

> Type is the common superinterface for all types in the Java programming language. These include raw types, parameterized types, array types, type variables and primitive types.

在Type类型引入之时，考虑到向下兼容性，设计了Type接口，并让Class实现了Type，然后Class在JDK中已经被广泛使用，这导致Type被使用得非常少；


其层次结构图如下：

{:.center}
![Java_Type](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20161218/Java_Type.png)



Class 继承自Type，Class作为类的构建模板，在反射中用于保存类运行时的状态信息,Class是反射机制的基石：

>  For every type of object, the Java virtual machine instantiates an immutable instance of java.lang.Class which provides methods to examine the runtime properties of the object including its members and type information. Class also provides the ability to create new classes and objects. Most importantly, it is the entry point for all of the Reflection APIs.

{% highlight java %}

Class.forName()

Object.Class;

Object.getClass();

//基本类型--原始类型信息：
Integer.TYPE;


//////////////////////////////////////////////////////////////////////////////
// 一些有用的Hack 泛型Type函数

getGenericSuperclass()

getGenericInterfaces()

{% endhighlight %}





---

Quote：

[如何使用Retrofit请求非Restful API](http://www.jianshu.com/p/2263242fa02d)


---

关于反射：

[Handling Java Generic Types with Reflection](http://qussay.com/2013/09/28/handling-java-generic-types-with-reflection/)

[Java获得泛型类型](http://rednaxelafx.iteye.com/blog/586212)

[Why 'java.lang.reflect.Type' Just Does Not Cut It as Complete Type Definition](http://www.cowtowncoder.com/blog/archives/2010/12/entry_436.html)

[Super Type Tokens](http://gafter.blogspot.jp/2006/12/super-type-tokens.html)

[Reflecting generics](http://www.artima.com/weblogs/viewpost.jsp?thread=208860)
