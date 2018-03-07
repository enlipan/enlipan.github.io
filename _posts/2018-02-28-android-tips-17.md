---
layout: post
title:  Android Tips part (17)
category: android
keywords: [improvement,android,java]
---

### 反射

反射使用: 老生常谈,略过;


为甚么需要反射? 反射作用在哪里? 反射的优势在哪里?

Loader 加载编译生成的 class 文件构建 class 对象,而 class 对象则被直接用来构建对象实例;

按照 JVM 标准, 利用 class.forName 直接加载类名时,Loading 将对应 class 文件加载到 jvm 虚拟机中,那么 class 对象中的类信息是如何获取的呢? 实际上 class 文件以二进制流的形式被加载到虚拟机过程中(loader 读取 class 文件获取二进制刘,字节码流转化为 class,class 进行链接 - 验证 class,最后进行 class 的初始化), class 文件的实际物理结构是确定的, 构造函数在 class 文件中的什么位置,属性在什么位置,这样 class 文件被加载到 jvm 虚拟机中之后,这个 class 对象的所有信息也就可以获取到了;

为什么需要反射? 反射的优势就在于灵活,程序可以在运行时去加载类文件,调用方法属性;比如常用的 jdbc 驱动就是典型,驱动这么多在编译时程序是不知道具体的数据库是什么数据库,利用反射则可以实现按需加载,什么类型的数据库加载什么类型的驱动,都是在运行时确定的;

此外, ORM 框架,智能IDE 的属性或者方法联想等等都会用到反射;而反射的主要用途也的确在通用框架;

[Java反射原理简析](http://www.fanyilun.me/2015/10/29/Java%E5%8F%8D%E5%B0%84%E5%8E%9F%E7%90%86/)

### 链接

文件与模块之间的互相调用

静态链接: 内存浪费,编译时确定链接的互相引用,多模块对某个模块调用则需要被调用模块在内存中存在多份拷贝;

动态链接: 被调用模块延迟加载进入内存,而调用模块需要在实际运行调用时才能确定被调用模块的地址,当然在运行时确定地址也就不需要被调用模块的多份拷贝,内存中总是只有一份拷贝;Java 的链接方式属于这一类;


### Instumentation 

事实上 Instrumentation 是 Java 提供的一个 JVM 接口,提供了查看与操作 Java 类定义的方法,借助 Instrumentation 可以完成类字节码修改(类加载时作出拦截),在 ClassLoader 的 classpath 下加入 jar 文件;


在 Android 中, 通过将主程序与 Instumentation框架构建的 测试 apk 运行在同一进程中实现对于主程序的精确控制,可以在正常的程序声明周期之外控制 Android 组件的运行状态;

Instumentation在运行时,会先于主程序中的所有代码进行初始化,可以实现对于应用与系统之间的交互联系的监听,应用调试运行时就会构建默认的 Instumentation,而我们也可以在 manifest 文件中注入自定义 Instumentation用于完成自定义的测试控制行为;

### Android 增量更新

利用二进制工具,进而差异化新旧 apk,进一步得到差异化 patch, 将 patch 与旧 apk 合并生成新的 apk 文件进而得到完整的新 apk;

一般市场使用较多 - 后台也可以在更新时生成补丁,更新时直接下载补丁进而利用原有 apk 与下载 patch 完成更新;


### InstanceRun 原理


instrumentation 的 class 文件以及 APPServer class 文件被插入打包进入 APP 中,同时插入新的 minifest 文件,代理原有 Application;

Hot,Warm,Code: 简单的方法修改 \ 资源改动 \ 结构修改抑或方法签名变换

AS 利用 gradle Task 生成差异化 dex 文件,as 比对所生成差异的 dex 文件被发布到 appserver, 进而在已安装的 app 中运行;

由于原有 class 文件已存在并运行于当前 App 中,如何覆盖原有 class 文件?  利用 CustomLoader,考虑到双亲委托机制(类加载时,先委托 Parent 加载, Parent 无法加载进而自行加载,防止被外部同名类 Hack),自定义的 ClassLoader 作为 pathClassLoader 的 Parent 注入,并作为 BootClassLoader 的 Chidren 构成新的 loader 链;

Hot 交换: 在方法执行时,instrumentation 查看原有 class 函数是否需要被发布APPserver 中的 class$Override 修改部分代理执行,根据方法签名运行 $Overrid 类中的同名函数;

Warm 交换不能更改 manifest 中的资源变动, manifest 中的 Value 是在 apk 安装过程中被系统读取;

Code 交换: 注解的增删改,属性,静态类,静态函数,静态实例等修改以及父类修改这类都需要应用的重启;冷交换在 art 虚拟机与 dalvik 虚拟机之间的差异(差异dex 发布与完整 apk 的发布);

注: 

随着 as gradle 插件的升级 instantrun 也有了升级从 instant-run.jar构建到了多 apk 模式,构建了 slice.apk;

[Instant Run: How Does it Work?!](https://medium.com/google-developers/instant-run-how-does-it-work-294a1633367f)

[Instant Run 浅析
](http://jiajixin.cn/2015/11/25/instant-run/)

[深度理解 Instant Run](https://yq.aliyun.com/articles/58517)

