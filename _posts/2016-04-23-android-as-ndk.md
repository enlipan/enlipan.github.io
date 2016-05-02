---
layout: post
title: Android Studio NDK
category: android
keywords: [android, ndk,c,sqlite3]
---


###  NDK JNI

是什么？解决什么问题？适用什么场景？

Java 通过 Java Native Interface 去支持与 Native代码（C/Cpp）之间的互相调用混合编程，常常适用于对于算法效率要求较高或突破Java性能限制方面，亦或是引用三方的 so库联合编程实现效果；利用JNI 可以实现Java与其他语言之间的通信，其实一般我们主要指 C亦或 Cpp；其实在Java或Android内部源码中，我们就经常看到方法头是Native的函数，这类函数只有方法签名而没有方法体的具体实现，典型的如 数组复制等等；


###  JNI 数据类型

Java数据类型与 jni定义别名 以及 native 代码数据类型的关联对应关系是很重要的：

尤其需要注意的是 Jva中的 int型数据 是 32位对应 C 中的 long 型变量，对应 JNI中的 jInt型数据；


JNI 与 C 的联合编程时，JNI也提供我们一些方式去构建使用Java对象，利用FindClass可以类似与 Java反射 class.forName（）获取到一个 jclass对象、而针对该jclass对象使用GetMethodID可以获取到该对象的方法，在JNI中 包括 构造函数都被当作 Method 来对待，每个 Method 有对应的 MethodID，利用该ID可以进而调用函数实现相应功能；

{% highlight java %}

jclass arrayClass =  (*env)->FindClass(env,"java/util/ArrayList");

jmethodID  array_init = (*env)->GetMethodID(env,arrayClass,"<init>","()V");

{% endhighlight %}  

V 表示 该方法的方法签名，我们知道Java有方法重载，利用方法签名去区分，而在JNI中则利用这种方式去进行方法签名；

*  boolean   Z            
*  byte      B      
*  char      C          
*  short     S                
*  int       I             
*  long      L              
*  float     F                
*  double    D                
*  void      V                
*  Object    L+完整类名，包中. 用/分割代替——如： Ljava/lang/String                  


另外一个需要注意的地方是：

C 实现函数与 Cpp实现的差异，如针对同一个函数：

{% highlight java %}

(*env)->FindClass(env,"java/util/ArrayList")；

{% endhighlight %}  

而 Cpp中则利用：

{% highlight java %}

env->FindClass("java/util/ArrayList")；

{% endhighlight %}  

###  从 GoogleSample HelloJNI 开始

从 HelloJNI 开始上手是比较合适的，简单的依赖用来熟悉 javah,mk 命令，迁移到 AS 后也可以用来结合 AS NDK Gradle文档熟悉 NDK Gradle写法；

项目地址：[Androidstudio-hello-jni](https://github.com/itlipan/android-ndk/tree/master/hello-jni)

从 HelloJNI 项目来看，NDK项目一般分为以下几个步骤：

*  编写 Native 函数，可以是 static的，当然也可以是 非Static,一般使用 static的会更加方便，但是也要注意 static特性，是程序最开始就会加载；           
*  Build生成 Native函数所在 Java源码的 class 文件；                   
*  利用 javah -jni 命令编译生成对应native函数头文件；                     
*  实现 native 函数，在 AS中 正确的对应的头文件，native函数以及native函数实现会自动关联起来；          


####  CMD  NDK-Build配置 MK命令

虽然说 目前 AndroidStudio已经弱化了 android.mk 文件，直接利用Gradle配置既可以生成so文件，嵌入到App中，但是mk文件依旧有理解的必要；一个典型的 android.mk 文件主要包含以下几个模块：

* module   模块名称，即是加载时利用的模块名称；    
* ldlibs   一些库名称，如 log输出库                 
* src      指定源码             

{% highlight bash %}

LOCAL_MODULE := hack042-native
LOCAL_LDLIBS := -L$(SYSROOT)/usr/lib -llog
LOCAL_SRC_FILES := \
	         main.cpp \
	         sqlite3.c

{% endhighlight %}  

####  Gradle 命令配置

Gradle的配置命令相对于使用 mk 命令就更加简单了，一般直接查阅文档可以解决问题，典型的Gradle配置如下：

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

Android 50 Hacks Hack 42 Demo：一个很好的NDK Demo，比HelloJNI复杂，但又不算太复杂，我将其从Eclipse迁移到AS，解决了一些小问题，更新了一些文件

项目地址：[Github —— AS Native Sqlite Demo](https://github.com/itlipan/hack042)



###  利用 NDK 预置Root权限命令


结合 `chmode 4777` 权限配置,利用 `system()` 执行预置命令,我们知道 4777权限对应的Linux权限是 -rwsrwxrwx, 4代表 sticky位，也就是可以在普通用户组执行系统命令时，以命令的所有者所拥有的权限执行，简单的解释就是 ：当某个命令的属于 root 用户，当其为sticky权限状态时，普通用户自行该命令，会以 root 用户所拥有的权限执行，利用这个我们可以干什么呢？很简单，某个时刻 当我们以 root 用户的模式将某个我们预定义好的执行命令内置到系统中，在 app 以普通用户的方式运行时，我们可以通过 system("command") 的方式调用该命令以 root 超级用户权限执行，干一些我们本来干不了的事；

如厂商Rom内置后，后期其他app调用；亦或某个时刻获取到了管理员权限，同时移植了该命令到 system/bin 目录下，后期再次执行就不需要管理员权限，这种方式属于 NDK 的一种拓展使用；


###  NdkDemo 实践

前面是一些系统的学习，自己边回顾边查找，边解决问题也写了一个小的Demo，其实只是简单的利用Native Sql查询语句，单纯的看起来比原生 SqliteDatabase查询快6倍的速度；回过头来复盘发现要注意的地方还挺多的，主要集中在 Gradle的配置，javah头文件的生成，以及 native C中资源的释放问题；


项目Github地址：[NdkDemoNativeSqlite](https://github.com/itlipan/NdkDemoNativeSqlite)


---

Quote:

《50 Android Hacks -- 42 Hack》

[Experimental Plugin User Guide --- AndroidStudio Info](http://tools.android.com/tech-docs/new-build-system/gradle-experimental)

[Java Native Interface Specification—Contents](http://docs.oracle.com/javase/7/docs/technotes/guides/jni/spec/jniTOC.html)

[C-language Interface Specification for SQLite —— SQLITE Doc](https://www.sqlite.org/c3ref/intro.html)


[Create Hello-JNI with Android Studio - Google Codelabs](https://codelabs.developers.google.com/codelabs/android-studio-jni/index.html?index=..%2F..%2Findex#0)

[Java programming with JNI -- IBM](http://www.ibm.com/developerworks/java/tutorials/j-jni/j-jni.html)

[Java Programming Tutorial  Java Native Interface (JNI)](https://www3.ntu.edu.sg/home/ehchua/programming/java/JavaNativeInterface.html)

[USING SQLITE NATIVELY ON ANDROID](http://blog.kdehairy.com/using-sqlite-natively-on-android/)

[JNI编程(二) —— 让C++和Java相互调用(1)](http://chnic.iteye.com/blog/228096)

[Android JNI--NDK](http://www.cnblogs.com/skywang12345/archive/2013/05/23/3092812.html)

[JNI系列教程之四——在NDK中使用第三方库](http://blog.whyun.com/posts/jnindk/use-thrid-part-library-in-ndk/)
