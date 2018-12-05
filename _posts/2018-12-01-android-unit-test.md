---
layout: post
title:   Android Unit Test实践
category: android
keywords: [improvement,android]
---

# Android 单元测试 

开发人员的白盒测试.

优势: 

基于单测的实现,可以让你精简代码,以便能够更加符合目标,能够以更少的代码完成可测试通过的单元.

单测的设计让你直接面向 API 设计,以及代码整体结构设计.


原则: 

将模块分割成多个可测试的单元.通过设定假设,并设置预期结果,验证假定条件下是否得到预期结果. 

单测的构建应该从最小逻辑测试实现,逐步迭代完善,想清楚要做什么,目标是什么,然后基于目标逐步实现.

单测实际上讲究独立性与隔离性,需要屏蔽依赖对象的不确定行为,进而让单测对象的行为可被正确预测,一旦有多重原因能够导致同样的结果,则无法确定结果是否由单测对象的行为决定.也就是讲究科学的控制变量原则.

## Local Test 

本地JVM环境运行的测试用例, 不需要依赖 Android 设备.在本地测试中又分为依赖 Android Framework 的测试与 不依赖 AndroidFramework 的 JUnit 测试.
针对前者我们通常使用 Robolectric.

### Mockito  & PowerMock

利用 Mockito 与 JavaApi 可以迅速的构建本地测试.

Mockito 通常用于对象指定行为的 Mock,在依赖对象符合预期的情况下,被测试对象的行为结果是否符合预期? 


利用 Mockito 构建 Mock Object, 注入单测对象中隔离单测对象的外部依赖.

{% highlight  %} 

```
@spy 

@Mock 

```


{% endhighlight %}



而 PowerMock 可以用于 Mock 静态函数,比如: 

```
if(NetUtil.isNetWorkOK()) {
    //do something…
}

// 针对 NetUtil 如果需要 Mock 其实是比较麻烦的.
```

### Roboelectric

如果需要依赖 Android Framework 的测试实例,则利用 Roboelectric构建测试实现.

Roboelectric 提供 Android 运行沙盒环境用于应用 Test 运行.

单测: 
> 构建单测运行环境      
> 执行代码           
> 检测执行结果是否符合预期      


* Robolectric  Shadow  可以用于修改/覆盖 Framework 中的类,构建出自己所需的逻辑完成自己的测试目标. 

 Shadow 与 Mock 互为补充.

http://robolectric.org/extending/

```
@Config() 
配置验证 condition 

```


分清楚测试的层级, 越底层的服务越依赖于单测的实践.  


## Instrumentation Test 仪器测试

在 Android 设备或者模拟器上运行的测试用例.通常这类测试要比 LocalTest 更加高级.

### Expresso 

instrumentation Test: 构建 test apk .

```
<manifest> 
test instrumentation
</manifest>
```

集成 UI 测试: 页面间跳转逻辑的验证等处理.  

![](http://img.javaclee.com/20181204132236.png)

Android_JUnit_Runner 所有测试用例在一个 Android JUnit Runner 中运行,而 JUnitRunner 运行在同一个进程中,所有测试用例在同一个独立的设备调用.

利用 Android Test OrChestrator 拆分, 每一部分 Android TestCase 运行在自有容器中.


> Synchronization capabilities
Each time your test invokes onView(), Espresso waits to perform the corresponding UI action or assertion until the following synchronization conditions are met:
* The message queue is empty.
* There are no instances of AsyncTask currently executing a task.
* All developer-defined idling resources are idle.
By performing these checks, Espresso substantially increases the likelihood that only one UI action or assertion can occur at any given time. This capability gives you more reliable and dependable test results.


![](http://img.javaclee.com/20181204234443.png)


TestCase  : 独立(isolate) && 可测试.  针对依赖服务端状态的高级集成测试,如何编写更加独立可测单元.

Espresso 可以用于验证 UI 状态.  

{% highlight  %} 

Rule: https://developer.android.com/reference/android/support/test/rule/package-summary

ActivityRule: When launchActivity is set to true in the constructor, the Activity under test will be launched before each test annotated with Test and before methods annotated with Before, and it will be terminated after the test is completed and methods annotated with After are finished.



{% endhighlight %}


### 一些注意问题

#### Empty test suite when running unit tests in Android Studio

先构建了 Local Test , 然后将 Local Test 实例直接移动到 Instrumentation Test 中,就会出现这一问题.

解决方案: 重命名文件即可.

https://stackoverflow.com/questions/38056901/class-not-found-empty-test-suite-when-running-unit-tests-in-android-studio/41474392#41474392

#### Robolectric Mock 网路请求的问题  

android.security.NetworkSecurityPolicy  class method NPE 问题.

https://github.com/square/okhttp/issues/2533

两种解决方案: 

1. 在 android.security 包下新建同名类,用于覆盖加载.      

2. config sdk 版本升级至23以上.

#### AndroidTest 异步处理

异步线程处理.

1. 利用 Object.await 等待处理.(Native 方法)   

{% highlight  %} 

synchronized (syncObject){
                    syncObject.notify();
                }

{% endhighlight %}


2. 利用 Thread.sleep() 

{% highlight  %} 
 private void sleepObj(AtomicBoolean object) {
        while (object.get()) {
            try {
                Thread.sleep(100);
            } catch(InterruptedException ex) {
                Thread.currentThread().interrupt();
                UCLogger.devLog(ex.getCause());
            }
        }
    }


{% endhighlight %}



3. 利用 Expresso 中的 espresso-idling-resource 控制等待过程.


{% highlight  %} 

onView().perform().check();

* onView() return Espresso view interaction 

* perform() Action Click      

//LoopMainThreadUtilIdle


{% endhighlight %}

![](http://img.javaclee.com/20181205224032.png)



idle 的意义: 

* NoEvents in UI Thread MessageQueue     
* No Task in AsyncTask ThreadPool 

如果有其他异步任务,Espresso 无法正确感知异步任务的发生,通过自定义 idle Resource 注册. 

* CountingIdlingResource     



[Espresso Idling Resource An Introduction](https://caster.io/lessons/espresso-idling-resource-introduction)


---

Quote:

[Mockito](http://www.vogella.com/tutorials/Mockito/article.html)

[Google Android Unit Test Best Practice](https://developer.android.com/training/testing/)

[Google Android Test](https://developer.android.com/training/testing/unit-testing/local-unit-tests#mocking-dependencies)

[Google IO Unit Test](https://www.youtube.com/watch?v=pK7W5npkhho)

[Unit Test](https://android.jlelse.eu/the-basics-of-android-espresso-testing-activities-fragments-7a8bfbc16dc5)