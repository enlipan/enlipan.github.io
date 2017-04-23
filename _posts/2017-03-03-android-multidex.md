---
layout: post
title:  Android MultiDex
category: android
keywords: [improvement,android]
---


### DexFile


随着应用的膨胀，尤其是如今三方库的泛滥，应用的开发飞速的会出现两个常见问题`Conversion to Dalvik format failed:Unable to execute dex: method ID not in [0, 0xffff]: 65536` 以及Apk 安装 INSTALL_FAILED_DEXOPT，该问题导致的缘由主要是由于Dex所**引用方法数**超过65536亦或是 Dexopt工具的LinearAlloc限制问题，在早先遇到该问题一般的解决方案是,精简app，去冗余函数，proguard优化，以及改Java method移动到 so文件调用native函数这些治标不治本的方式去解决，随着Google multiDex解决方案的出现，后续逐渐成了该问题的标准解决方案；

那么该 INSTALL_FAILED_DEXOPT 问题出现的原因是什么呢？ LinearAlloc 都是围绕 dexOpt 工具的两个问题，我们知道Java语言开发的应用在编译后，会转换成转为Dalvik虚拟机设计的专有压缩格式.dex，dex格式更加适合内存以及处理器速度优先的移动设备；应用在安装之后针对Dex文件的优化，dex to  ODEX 文件，这一预先提取可以加快程序的启动速度，应用的启动无需每次从apk文件中解压加载；

#### 两个问题缘由：

* dex生成过程中,将工程中的class文件合并压缩到一个Dex文件过程中，保存所引用的方法id存储到链表中，链表长度用short类型保存，这就是 方法id数不能超过65536的缘由    

>    method reference index (16 bits)   

>    I'd like to point out that the limitation is on the number of methods referenced, not the number of methods defined. If your DEX file has only a few methods, but together they call 70,000 different externally-defined methods, you're going to exceed the limit.

* dexOpt 使用 LinearAlloc 存储方法信息，LinearAlloc 作为方法缓存区，不同Android版本 其缓冲区大小有差异，方法数过多而导致方法信息超过缓冲区大小，造成 dexOpt崩溃；



#### 问题的解决思路：

* 精简应用？   

* 应用插件化？          

* 分割Dex文件？

这里主要探讨 Dex文件的分割，分割后的Dex文件在加载时如何还原？同样是一个需要解决的问题；


### 拆分方案    

*  官方方案：  启动MultiDex


问题：

无法控制哪些Class文件被打包进入主Dex文件，哪些被打包进入从Dex文件，但应用启动所必须的Class又都必须要被打包进入主Dex文件，否则在启动时会由于class not found 导致Crash，换句话说即无法保证类函数保证构建后，存在于主Dex，其可能引起的问题是：一些在从Dex文件加载之前,可能会被调用到的类(比如静态变量的类—— Application中的静态引用类),需要放在主Dex中.否则会ClassNotFoundError.

对于从Dex 文件的大小，如果大小控制不合适，过大的从Dex文件在启动时加载非常可能造成 ANR 无响应；需要注意的是ART虚拟机中ODEX的文件生成时间从前者的首次启动时优化生成，转移到了安装时生成ODEX文件，延长安装时间，这也就是也就是我们说的AOT技术，而到了Android 7.0时代则开始在二者之间取舍平衡，安装时不编译Odex文件，提升安装速度，运行时利用jit，识别hot method，并记录到profile文件，在chanrging 以及 idle(系统闲置)状态下系统会定时扫描profile文件，执行AOT即官方所说的 profile-guided compilation  

Google对于 主Dex文件的控制，在后续有了解决方案，build tools 21开始提供了相应的脚本文件来生成主Dex文件中的文件列表，该脚本通过调用 proguard文件的 shrink操作来生成临时jar包，该临时jar包结合输入的文件集合进而会生成对应的主Dex文件—— 也就是说，progard中keep的规则列表类以及相关成员都会被读取到主Dex文件列表中，进而打包进入主Dex文件；这就是我们会在很多时候使用multiDex时还能遇到class not found问题，其解决方案就是keep该class的原因；


而对于启用multiDex之后导致的启动速度变慢的问题，可以在冷启动结束时做运行时检查，检测是否有位于从Dex文件中的class文件，在启动时被加载依赖，若有，则将该class文件移动至主dex文件中，使启动时无需加载从dex文件，加快启动速度；具体解决方案见[Android’s multidex slows down app startup](https://medium.com/groupon-eng/android-s-multidex-slows-down-app-startup-d9f10b46770f)


*  手动分包:

首先我们先看一下上古时期Android 开发google 的一篇文章—— 《Custom Class Loading in Dalvik》:

这个简单的Demo在assets文件夹下存放了一个jar包，作为second dex，先将该dex文件通过io操作拷贝到对应的cach目录下，然后模拟加载该cach目录下的dex文件，通过反射构建对象，并将对象转换为interface，完成函数的调用;(这种方式比通过利用反射找到method，并利用method的invoke函数，效率更高,这是个比较好的方式）

{%  highlight java %}

Class libProviderClazz = null;

try {
    // Load the library class from the class loader.
    libProviderClazz =
            cl.loadClass("com.example.dex.lib.LibraryProvider");

    // Cast the return object to the library interface so that the
    // caller can directly invoke methods in the interface.
    // Alternatively, the caller can invoke methods through reflection,
    // which is more verbose and slow.
    LibraryInterface lib = (LibraryInterface) libProviderClazz.newInstance();

    // Display the toast!
    lib.showAwesomeToast(view.getContext(), "hello");
} catch (Exception exception) {
    // Handle exception gracefully here.
    exception.printStackTrace();
}

{%  endhighlight %}

sourceCode:

[android-custom-class-loading-sample](https://github.com/rffffffff007/android-custom-class-loading-sample)

再来看看，在multiDex中Dex 文件加载的install 函数源码核心：

`expandFieldArray(dexPathList, "dexElements", makeDexElements(dexPathList,
           new ArrayList<File>(additionalClassPathEntries), optimizedDirectory,
           suppressedExceptions));`

其主要操作包括以下几个部分的逻辑：

* Apk zip文件的解压，寻找到除 classes.dex文件（该dex文件作为主dex文件在启动时会被加载）外的其他 classes2.dex，classes3.dex文件    
* dex 文件加载，并利用反射替代原有的 dexElements 对象   

对于该源码逻辑，我们能够很容易的想到几个着手的问题：

* 如何生成多Dex？如何分Dex，哪些class被分到主Dex，哪些分到从Dex(2.dex，3.dex...)？         
* 如何知道所跳转页面所涉及到的class文件是否被加载？如果在页面跳转时所涉及到的二级页面以及其所依赖的class未被加载，应用将产生Crash            




---

Quote:

[MultiDex工作原理分析和优化方案](https://zhuanlan.zhihu.com/p/24305296)

[美团Android DEX自动拆包及动态加载简介](http://tech.meituan.com/mt-android-auto-split-dex.html)

[当Field邂逅65535](http://jiajixin.cn/2015/10/21/field-65535/)

[dex分包变形记](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=193)

[Android分包原理](http://souly.cn/%E6%8A%80%E6%9C%AF%E5%8D%9A%E6%96%87/2016/02/25/android%E5%88%86%E5%8C%85%E5%8E%9F%E7%90%86/)

[Android Dex分包之旅](http://yydcdut.com/2016/03/20/split-dex/)

[Android傻瓜式分包插件](https://github.com/TangXiaoLv/Android-Easy-MultiDex)

---

[Custom Class Loading in Dalvik](https://android-developers.googleblog.com/2011/07/custom-class-loading-in-dalvik.html)

[Too many methods in main-dex?](http://blog.osom.info/2014/12/too-many-methods-in-main-dex.html)

[Android Multidex导致的App启动缓慢](https://github.com/hehonghui/android-tech-frontier/blob/master/issue-39/Android%20dex%E5%88%86%E5%8C%85%E5%AF%BC%E8%87%B4%E7%9A%84App%E5%90%AF%E5%8A%A8%E9%80%9F%E5%BA%A6%E4%B8%8B%E9%99%8D.md)

[Does the Android ART runtime have the same method limit limitations as Dalvik?——解释65536的原因](http://stackoverflow.com/questions/21490382/does-the-android-art-runtime-have-the-same-method-limit-limitations-as-dalvik/21492160#21492160)
