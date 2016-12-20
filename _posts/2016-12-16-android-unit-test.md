---
layout: post
title:  Android 单元测试
category: android
keywords: [improvement,android,java]
---

TDD的优劣势这里不再赘述，一方面Android的单元测试自己了解并不多，虽然自己写测试函数会常用JUnit，但对于Android的各类Mock框架却并没有深入了解，再者前段时间刚刚看完的烂代码系列文章，对于单元测试描述较多，其关于模块构造如不能构建比较全面的单元测试，以及单元测试覆盖率直接反应模块的好坏的观点也很是经典，所以这里抽时间做专题研究；


### 单元测试

>  Unit tests are the fundamental tests in your app testing strategy. By creating and running unit tests against your code, you can easily verify that the logic of individual units is correct. Running unit tests after every build helps you to quickly catch and fix software regressions introduced by code changes to your app.


>  在计算机编程中，单元测试（英语：Unit Testing）又称为模块测试, 是针对程序模块（软件设计的最小单位）来进行正确性检验的测试工作。程序单元是应用的最小可测试部件。在过程化编程中，一个单元就是单个程序、函数、过程等；对于面向对象编程，最小单元就是方法，包括基类（超类）、抽象类、或者派生类（子类）中的方法。

即，单元测试是针对程序模块中目标函数输入与输出状态的检测从而确定函数逻辑的正确与否；单元测试可以为重构的代码质量提供质量支撑，为了构建单元测试可以降低模块间的代码网状耦合程度，提升代码可维护性；

在Android中由于其运行环境与普通Java程序的差异，导致单元测试的构建也有所不同；

被测试目标函数Case：

*  函数有明确返回值则测试函数返回值是否符合预期值               
*  函数没有返回值，改变对象内部属性状态，则验证对象内部属性状态           
*  函数未改变对象状态且无返回值，函数仅有对应的行为，则验证行为的触发                
*  函数具有以上三种Case的混合，针对混合问题，一般需要对三种Case分离编写测试用例，逐一测试验证影响

前面说到Android运行环境的特殊性，除了需要JUnit的支持，还需要其他的支持，诸如AndroidTest与Robolectric，其中AndroidTest运行于Android环境上，而后者框架直接引入了android依赖环境，且可直接运行于JVM，相较于运行于真机效率更高；除此之外，我们还可以借助Mock用于解除依赖；除此之外还有Google御用Espresso框架，该框架同样功能强大，且有完善的Google文档；

Android Unit Test Type:

*  Local unit tests

{% highlight xml%}

Located at module-name/src/test/java/.

// Required for local unit tests (JUnit 4 framework)
testCompile 'junit:junit:4.12'

{% endhighlight %}

*  Instrumented tests

{% highlight xml%}

Located at module-name/src/androidTest/java/.

// Required for instrumented tests
androidTestCompile 'com.android.support:support-annotations:24.0.0'

{% endhighlight %}


这里主要使用通用型框架组合：**JUnit + Mockito**

JUnit作为通用Javatest框架，属于基础，没什么好讲的，主要是其他的两个框架；

### Mockito

接口代理：





### Robolectric










---

Quote：

[Test your app](https://developer.android.com/studio/test/index.html#add_a_new_test)

[Building Effective Unit Tests](https://developer.android.com/training/testing/unit-testing/index.html)

[使用Spock框架进行单元测试](http://blog.2baxb.me/archives/1398)

[基于 Appium 的 Android UI 自动化测试](https://zhuanlan.zhihu.com/p/24177554?refer=c_63840855)

[Android单元测试 - 如何开始？](http://www.jianshu.com/p/bc99678b1d6e)

[Android单元测试研究与实践](http://tech.meituan.com/Android_unit_test.html)

[蘑菇街支付金融Android单元测试实践](http://www.infoq.com/cn/articles/mogujie-android-unit-testing)

[Why Android Unit Testing is so Hard (Pt 1)](http://www.philosophicalhacker.com/2015/04/17/why-android-unit-testing-is-so-hard-pt-1/)

[Unit Testing with Robolectric](https://guides.codepath.com/android/Unit-Testing-with-Robolectric)

[Developing Android unit and instrumentation tests - Tutorial](http://www.vogella.com/tutorials/AndroidTesting/article.html)

[使用强大的 Mockito 测试框架来测试你的代码](https://gold.xitu.io/entry/578f11aec4c971005e0caf82)
