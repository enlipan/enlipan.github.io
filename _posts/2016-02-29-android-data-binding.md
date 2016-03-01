---
layout: post
title: Android Data Binding
category: android
---


说Data Binding 就离不开 `MVVM` 模式，`MVVM`即： Model ，View ， View-Model,与单纯的业务Model不同，View-Model 完成了与View的适配，为View而生；


### DataBinding

{% hightlight groovy %}

dependencies {

    classpath 'com.android.tools.build:gradle:1.3.0'
    classpath "com.android.databinding:dataBinder:1.0-rc1"
    
}

{% endhightlight %}


---

Quote:

[Data Binding Guide](https://developer.android.com/tools/data-binding/guide.html)

[来自官方的Android数据绑定（Data Binding）框架Read more](http://blog.chengyunfeng.com/?p=734)

[MVVM模式](https://github.com/xitu/gold-miner/blob/master/TODO%2Fapproaching-android-with-mvvm.md)

[MVC，MVP 和 MVVM 的图示](http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html)

[Android MVVM到底是啥](http://mp.weixin.qq.com/s?__biz=MzA4MjU5NTY0NA==&mid=401410759&idx=1&sn=89f0e3ddf9f21f6a5d4de4388ef2c32f#rd)

[Scaling Isomorphic Javascript Code](http://blog.nodejitsu.com/scaling-isomorphic-javascript-code/)

[Android App的设计架构](http://www.tianmaying.com/tutorial/AndroidMVC)
