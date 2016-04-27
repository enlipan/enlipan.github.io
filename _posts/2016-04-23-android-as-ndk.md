---
layout: post
title: Android Studio NDK
category: android
keywords: [android, ndk,c,sqlite3]
---


###  NDK JNI

...


###  JNI 数据类型

...


###  从 GoogleSample HelloJNI 开始

...


####  CMD  NDK-Build配置 MK命令


{% highlight bash %}

LOCAL_MODULE := hack042-native
LOCAL_LDLIBS := -L$(SYSROOT)/usr/lib -llog
LOCAL_SRC_FILES := \
	         main.cpp \
	         sqlite3.c

{% endhighlight %}  

####  Gradle 命令配置

{% highlight groovy %}

ndk {
    moduleName = 'hacksqlite-native'
    ldLibs = ['android','log']
}

buildTypes {
    debug {
        jniDebuggable true
    }
}

{% endhighlight %}  

###  加速数据库Native Sqlite


Sqlite 的底层自定义函数，亦或底层读取数据以及高效大数据操作：

{% highlight sql %}

sqlite3_open();

sqlite3_create_function();

{% endhighlight %}  


NDK 的调试在模拟器上往往容易出各种问题，无法进入调试modle，而在使用真机调试后，则解决了这一问题；

[Github —— AS Native Sqlite Demo](https://github.com/itlipan/hack042)



###  利用 NDK 预置Root权限命令


结合 `chmode 4777` 权限配置,利用 `system()` 执行预置命令,我们知道 4777权限对应的Linux权限是 -rwsrwxrwx, 4代表 sticky位，也就是可以在普通用户组执行系统命令时，以命令的所有者所拥有的权限执行，简单的解释就是 ：当某个命令的属于 root 用户，当其为sticky权限状态时，普通用户自行该命令，会以 root 用户所拥有的权限执行，利用这个我们可以干什么呢？很简单，某个时刻 当我们以 root 用户的模式将某个我们预定义好的执行命令内置到系统中，在 app 以普通用户的方式运行时，我们可以通过 system("command") 的方式调用该命令以 root 超级用户权限执行，干一些我们本来干不了的事；

如厂商Rom内置后，后期其他app调用；亦或某个时刻获取到了管理员权限，同时移植了该命令到 system/bin 目录下，后期再次执行就不需要管理员权限，这种方式属于 NDK 的一种拓展使用；



**待完善**

---

Quote:

《50 Android Hacks -- 42 Hack》

[Experimental Plugin User Guide --- AndroidStudio Info](http://tools.android.com/tech-docs/new-build-system/gradle-experimental)

[Java Native Interface Specification—Contents](http://docs.oracle.com/javase/7/docs/technotes/guides/jni/spec/jniTOC.html)

[Java Programming Tutorial
Java Native Interface (JNI)](https://www3.ntu.edu.sg/home/ehchua/programming/java/JavaNativeInterface.html)

[C-language Interface Specification for SQLite —— SQLITE Doc](https://www.sqlite.org/c3ref/intro.html)


[Create Hello-JNI with Android Studio - Google Codelabs](https://codelabs.developers.google.com/codelabs/android-studio-jni/index.html?index=..%2F..%2Findex#0)

[Java programming with JNI -- IBM](http://www.ibm.com/developerworks/java/tutorials/j-jni/j-jni.html)

[Java Programming Tutorial  Java Native Interface (JNI)](https://www3.ntu.edu.sg/home/ehchua/programming/java/JavaNativeInterface.html)

[USING SQLITE NATIVELY ON ANDROID](http://blog.kdehairy.com/using-sqlite-natively-on-android/)

[JNI编程(二) —— 让C++和Java相互调用(1)](http://chnic.iteye.com/blog/228096)

[Android JNI--NDK](http://www.cnblogs.com/skywang12345/archive/2013/05/23/3092812.html)

[JNI系列教程之四——在NDK中使用第三方库](http://blog.whyun.com/posts/jnindk/use-thrid-part-library-in-ndk/)
