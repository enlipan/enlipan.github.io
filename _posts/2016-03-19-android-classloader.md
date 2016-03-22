---
layout: post
title: Android 类加载
category: android
---

以下一些内容多是基于网络知识的研究以及大脑过滤整理，局部夹带私货，所涉及内容大多均在Quote连接引用有所提及，尤其感谢 [segmentfault —— 中二病也要开发ANDROID] 专栏；


### 从Android Dex 分包说起：

`方法数 65536 —— Conversion to Dalvik format failed:Unable to execute dex: method ID not in [0, 0xffff]: 65536` 随着业务逻辑的增加是难以绕过的坎，早期的时候的解决方案还是比较麻烦的，在比较紧急的时候衍生诸多治标不治本的方案，如ProGuard，lib冗余精简等，而后在Google multidex lib之后解决方案变得比较简单；目前解决的方案基本大多都是基于dex分包机制，根据apk build Tool 打包流程，在 apk编译打包dex阶段人为干预 dex打包编译过程，自定义指定类打包为哪一个指定dex包，进而生成多个dex文件；Google multidex lib 会根据需要自动分析哪些类需要打包到 主dex包，哪些打包到 secondary Dex包，根据实际情况生成 dex2 dex3等；如果这一过程完全自行判断就需要自己 分析好准确的业务逻辑等，并处理好在较低Android版本中，当类被调用 dex包还未被加载进入classloader的情况；具体情况分析可以查看美团团队给出的详细解决方案；

在 Lollipop以下版本multidex 可能会导致诸多问题，一者 Dex加载问题复杂度较高，多Dex加载时，若 Secondary Dex文件过大，可能会导致Application无响应，或者冷启动过慢的问题；Lollipop之后源于 ART的存在，ART 的AOT(Ahead of time)机制，系统在apk安装过程会利用 自带 dex2oat工具对apk中多 dex文件编译生成 .oat文件这一可在本地执行的文件，提高app启动速度；

> At install time, ART compiles apps using the on-device dex2oat tool. This utility accepts DEX files as input and generates a compiled app executable for the target device. The utility should be able to compile all valid DEX files without difficulty.


### ClassLoader：

  动态加载：用户不重新安装apk而达到应用升级功能，程序运行时加载可执行文件，并在加载后执行相应的逻辑；觉得与PC动态链接库有点类似，dll文件提供模块化的共享库，在程序运行时将动态链接库加载到程序中运行，进而执行加载dll后的特定功能逻辑；同样Java程序的运行依赖于 JVM 的Classloader 加载 Jar文件，Eclipse 的插件化扩展就是基于JVM扩展的典型实例，所以Java程序同样可以利用这一模块化思想完成动态加载；

  在Android虚拟机 Dalvik/ART 中其插件则变为 Dex包，依据在前面的提到分包机制，虚拟机是可以加载多个Dex包运行的，我们则进一步思考是否可以在程序运行时，利用网络从服务器获取新的 Dex包完成动态加载以及程序功能及时修复或重大更新，这也构成了Android动态加载思想的核心 —— 即动态加载调用外部Dex文件；




#### 基于 ClassLoader 的热修复技术(Tencent)

特点：App下次启动有效，高通用性，适用性较好

腾讯是较早线上利用Classloader动态加载机制的，其对于Classloader动态加载的研究比较完善，利用Classloader的动态加载 dex、jar文件完成功能更新，较早的时候我发现微信下，选择语言非简体中文后，重启微信后朋友圈tab下的京东购物会消失，猜测可能是利用动态加载做的这一功能模块，联想到该Tab下多为游戏入口，可能大部分功能都是利用动态加载实现；

其实热修复目前在国外并不是很感冒，这和GooglePlay的一些规定有关 —— “除了通过Google Play的更新机制外，从Google Play下载的应用不得以其他任何方式修改、替换或升级自己的APK二进制代码” ，但是了解这些原理对于Android虚拟机运行机制会有一些更加充分的认知，还是很有必要的；

基于安全问题的考虑，我们知道Android系统对于mount加载的外部存储空间是具有 noexec 标记，不具备可执行权限；

参见：[adb “Permission denied” to run a “./configure” file](http://android.stackexchange.com/questions/35658/adb-permission-denied-to-run-a-configure-file)

因而，动态加载过程中，对于这些需要加载执行的文件，在Android引用加载执行前，需要copy到  data/packagename/应用内部存储文件路径；进而通过系统权限管理机制屏蔽三方应用的恶意修改拦截，而后加载到Application运行环境并且调用相应的函数，完成具体业务逻辑；事实上这种屏蔽对于Root权限获取的应用依然无效，所以说Root是一项威力强大的武器，随便使用是可能被黑的；或许这也是Google不推荐应用不通过GooglePlay完成更新的一个考虑吧

动态加载的一般过程：

>  执行文件网络下载与应用目录拷贝 、可执行文件加载、业务逻辑函数调用


#### 类加载器

之前做Web开发的时候研究ClassLoader，但并不深入，仅仅在了解反射相关知识时，简单的研究了一些机制，如Classloader的树状组织结构及其代理模式(双亲委派，递归调用父加载器检查，加载)，了解了怎么样的Class对象是等同的（同一loader加载同一Class文件）；Classloader 作为类加载的核心组件，也是此处要学习的重点知识，故而重新学习总结一番：

Java程序的执行过程，虚拟机加载所需要的Class对象创建对象实例，完成业务逻辑构建，若对象无法正确加载，则抛出异常 Class not Found，这一系列加载关键过程在Classloader中完成，这一点Android虚拟机与JVM虚拟机工作机制是类似的；

系统启动时创建的根 BootClassLoader 与 应用启动时用于加载的 PathClassLoader；

从Classloader的构造函数看Loader树状结构以及从ClassLoader的 loadClass 类加载机制看其Class代理加载机制；

[ClassLoader](https://android.googlesource.com/platform/libcore/+/a7752f4d22097346dd7849b92b9f36d0a0a7a8f3/libdvm/src/main/java/java/lang/ClassLoader.java)



{% highlight java %}


ClassLoader(ClassLoader parentLoader, boolean nullAllowed) {
    if (parentLoader == null && !nullAllowed) {
        throw new NullPointerException("parentLoader == null && !nullAllowed");
    }
    parent = parentLoader;
}

///////////////////////////////////////////////////////////////////////

protected Class<?> loadClass(String className, boolean resolve) throws ClassNotFoundException {
        Class<?> clazz = findLoadedClass(className);

        if (clazz == null) {
            ClassNotFoundException suppressed = null;
            try {
                clazz = parent.loadClass(className, false);
            } catch (ClassNotFoundException e) {
                suppressed = e;
            }

            if (clazz == null) {
                try {
                    clazz = findClass(className);
                } catch (ClassNotFoundException e) {
                    e.addSuppressed(suppressed);
                    throw e;
                }
            }
        }

        return clazz;
    }


{% endhighlight %}

从源码可以看到利用构造函数指定parent构造ClassLoader树，而loaderClass则loader递归调用至顶级loader，可以看出一个Class在整个应用生命周期中，有且仅加载一次，一旦被加载后续不再会被重新加载；需要注意的要明确在虚拟机中怎么样的Class被认定为 *同一Class —— 相同ClassName + 相同PackageName + 相同ClassLoader*，若需要通过动态加载新类替代旧类，若旧类已经被加载则虚拟机会持续使用旧类，原因如上 loadClass，所以尽可能保证新的Class加载在旧Class之前，若无法完成该顺序，则可以利用自定义一个与该旧类无父子继承关系的Loader完成新类的加载，但是需要注意这两个同一类型的类却被虚拟机当作不同类型Class，所以可能出现新类替换旧类使用时的类型转换异常；

#### [DexClassLoader 与 PathClassLoader](https://android.googlesource.com/platform/libcore-snapshot/+/ics-mr1/dalvik/src/main/java/dalvik/system)：

DexClassLoader 使用更加灵活，可以自定义存储路径，进而加载外部Dex文件，因而也是我们常用的;而在一般我们在自定义ClassLoader也会选用继承自 ClassLoader 利用复写其  loadClass 关键函数，根据其双亲代理机制的先查找后加载的过程，去指定寻找加载我们需要的指定类，完成类自定义加载；

当类加载后就需要进一步考虑Android环境下的两个棘手问题，**一是如何不预先注册Activity 启动 动态加载Activity，二是如何在动态加载后 动态获取相应的运行环境，获取Apk运行的资源等文件**；

#### Dex文件加载与函数调用：

> Dex文件生成： jar包转换 Dex包文件； `sdk\build-tools\23.0.2\dx.bat` 工具生成 Dex文件；                 

> 构造 DexClassLoader对象加载指定 Dex文件；

> 利用反射 或 接口抽象调用 Dex下动态注册函数；

反射不用说，都理解，利用反射找到对应函数，设定函数访问域进而访问；那么抽象接口多态调用，需要理解一下：

首先将动态加载Dex包内函数抽象为接口，且与其具体实现一齐打包封装在需要动态加载的Dex包中，接口首先存在于 Dex 中；为了在主项目代码逻辑中能利用接口，将接口复制一份到主项目中，将反射所得到的Dex类实例，强转换为主项目中这些与 Dex包内等同的接口，进而利用多态调用接口的函数，触发具体业务逻辑；



{% highlight java %}

interface IFunction{
  void func();
}

////////////////////
Class  clazz = dexClassLoader.loadClass("me.kaede.dexclassloader.Loader");
IFunction iFunc = (IFunction)class.newInstance();
iFunc.func();


{% endhighlight %}

函数的调用之后则下一问题，如何动态加载界面，也就是布局 UI等生成，根据 *kaedea* 的说法，腾讯有比较好的一套从底层生成，以及解析XML的机制，当然想想也是可以理解的，估计其复杂度也是相当之高，同时需要兼顾考虑动态兼容屏幕特性，由于无法利用系统性兼容行为，如 dpi分级这类机制，需要自行根据屏幕特性适配，具体的还是有机会要去大厂了解下；

#### 代理Activity模式：

解决Activity 启动问题，Activity的启动需要附加Context环境同时以标准Intent形式启用，且在Manifest文件注册标记；通过Dex动态直接加载的Activity被实例化之后会退化为普通实例，丧失环境以及生命周期；未解决这类问题而采用代理Activity模式，在主项目中设置一个对应的代理Activity，同时在代理Activity的生命周期函数内触发Dex包中Activity对象的其对应的生命周期函数，二者匹配而生成一个完整的Activity实例；


### AndFix(Alipay)：




















---

Quote:

[Do You Really Get Classloaders?](http://zeroturnaround.com/rebellabs/rebel-labs-tutorial-do-you-really-get-classloaders/)

[Custom Class Loading in Dalvik](http://android-developers.blogspot.sg/2011/07/custom-class-loading-in-dalvik.html)

[Building Apps with Over 65K Methods](http://developer.android.com/tools/building/multidex.html)

[Under the Hood: Dalvik patch for Facebook for Android](https://www.facebook.com/notes/facebook-engineering/under-the-hood-dalvik-patch-for-facebook-for-android/10151345597798920)

[Android应用打破65K方法数限制](http://www.infoq.com/cn/news/2014/11/android-multidex)

[Android dex分包方案](http://my.oschina.net/853294317/blog/308583)

[美团Android DEX自动拆包及动态加载简介](http://tech.meituan.com/mt-android-auto-split-dex.html)

[Android动态加载技术 系列索引](https://segmentfault.com/a/1190000004086213)

[各大热补丁方案分析和比较](http://blog.zhaiyifan.cn/2015/11/20/HotPatchCompare/)
