---
layout: post
title: Android Data Binding
category: android
---


说Data Binding 就离不开 `MVVM` 模式，`MVVM`即： Model ，View ， View-Model,与单纯的业务Model不同，View-Model 完成了与View的适配，为View而生；

### MVVM

从MVC中View 与 Model的耦合性过强而引申出 View与 Model彼此绝对独立之 —— MVP架构，利用中间者 Presenter隔离 View 与Model，弱化View层功能性，View层没有任何业务逻辑相关同时也不再主动监听Model数据更新，View层完全被动，也成为了所谓的——被动视图，Activity被解放出来，原生MVC中 Activity充当 Controller 随着业务逻辑以及需求增加导致其繁琐的代码结构问题被解决；

关于 MVP 中 View 接口 IView的存在必要性，最初其实写第一个MVP Demo并没有采用这一层，写着写着发现耦合度其实还是比较高的，事实上一个View至少对应一个Presenter，无接口定义会二者强耦合在一起，当采用接口定义 View行为之后，明显发现一方面通过接口定义行为可以便于模拟单元测试控制View展示逻辑，另一方面 IView的存在进一步降低了与 Presenter之间的耦合度；

进一步的引申进化，考虑到View 与Presenter之间的紧密联系，进一步改进Presenter模式，View与ViewModel二者双向关联，View与ViewModel互相之间的交互利用框架实现——DataBinding；ViewModel涵盖了关于View的Option以及相关Data属性，View一旦改变直接通过 框架影响 ViewModel，而ViewModel的变化同时也通过DataBinding直接映射到View的状态变化上去；

不过框架的东西说了这么多，重要的还是要强调工程性，实践性，先实现需求，先实现后重构，边实现边重构，终身实践终身重构，而不能说要先计划好所有，再去实现，需要知道重构有顶层架构与底层抽象之分；

### DataBinding

表达式： `@{}`



{% highlight groovy %}

dependencies {

    classpath 'com.android.tools.build:gradle:1.3.0'
    classpath "com.android.databinding:dataBinder:1.0-rc1"

}

{% endhighlight %}


{% highlight java %}

//Bean 类型中支持值域引用的函数方式：

// getXXX形式
public String getFirstName() {
    return this.firstName;
}

// 或者属性名和方法名相同
public String lastName() {
    return this.lastName;
}

{% endhighlight %}



DataBinding 支持多种表达式语言，写起来很有种写 JSTL 的感觉，其种类基本涵盖基本运算符:数学运算符、字符串连接、逻辑运算符、一二三元操作符、比较、以及值域引用、函数调用，甚至还有 Cast 、instanceof、Grouping ()等




---

Quote:

[Data Binding Guide](https://developer.android.com/tools/data-binding/guide.html)

[来自官方的Android数据绑定（Data Binding）框架Read more](http://blog.chengyunfeng.com/?p=734)

[MVVM模式](https://github.com/xitu/gold-miner/blob/master/TODO%2Fapproaching-android-with-mvvm.md)

[MVC，MVP 和 MVVM 的图示](http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html)

[Android MVVM到底是啥](http://mp.weixin.qq.com/s?__biz=MzA4MjU5NTY0NA==&mid=401410759&idx=1&sn=89f0e3ddf9f21f6a5d4de4388ef2c32f#rd)

[Scaling Isomorphic Javascript Code](http://blog.nodejitsu.com/scaling-isomorphic-javascript-code/)

[Android App的设计架构](http://www.tianmaying.com/tutorial/AndroidMVC)
