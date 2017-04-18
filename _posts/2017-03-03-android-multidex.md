---
layout: post
title:  Android MultiDex
category: android
keywords: [improvement,android]
---


### DexFile


随着应用的膨胀，尤其是如今三方库的泛滥，应用的开发飞速的会出现一个常见问题INSTALL_FAILED_DEXOPT，该问题导致的安装失败问题主要是由于方法数超过65536亦或是 Dexopt工具的LinearAlloc限制问题，在早先遇到该问题一般的解决方案是,精简app，去冗余函数，proguard优化，以及改Java method移动到 so文件调用native函数这些方式去解决，随着Google multiDex解决方案的出现，后续逐渐成了该问题的标准解决方案；

那么该 INSTALL_FAILED_DEXOPT 问题出现的原因是什么呢？ 65536问题以及 LinearAlloc 都是围绕 dexOpt 工具的两个问题，我们知道Java语言开发的应用在编译后，会转换成转为Dalvik虚拟机设计的专有压缩格式.dex，dex格式更加适合内存以及处理器速度优先的移动设备；应用在安装之后针对Dex文件的优化，dex to  ODEX 文件，这一预先提取可以加快程序的启动速度，应用的启动无需每次从apk文件中解压加载；

#### 两个问题缘由：

* dexOpt 保存每个类文件中的方法id存储到链表中，链表长度用short类型保存，这就是 方法id数不能超过65536的缘由     

* dexOpt 使用 LinearAlloc 存储方法信息，LinearAlloc 作为方法缓存区，不同Android版本 其缓冲区大小有差异，方法数过多而导致方法信息超过缓冲区大小，同样造成 dexOpt崩溃；



#### 问题的解决思路：

* 精简应用？   

* 应用插件化？          

* 分割Dex文件？

这里主要探讨 Dex文件的分割，分割后的Dex文件在加载时如何还原？同样是一个需要解决的问题；


### 拆分方案    

*  官方方案：  启动MultiDex


问题：

无法控制哪些Class文件被打包进入主Dex文件，哪些被打包进入从Dex文件，但应用启动所必须的Class又都必须要被打包进入主Dex文件，否则在启动时会由于class not found 导致Crash；

对于从Dex 文件的大小，如果大小控制不合适，过大的从Dex文件在启动时加载非常可能造成 ANR 无响应；

Google对于 主Dex文件的控制，在后续有了解决方案，build tools 21开始提供了相应的脚本文件来生成主Dex文件中的文件列表，该脚本通过调用 proguard文件的 shrink操作来生成临时jar包，该临时jar包结合输入的文件集合进而会生成对应的主Dex文件—— 也就是说，progard中keep的规则列表类以及相关成员都会被读取到主Dex文件列表中，进而打包进入主Dex文件；这就是我们会在很多时候使用multiDex时还能遇到class not found问题，其解决方案就是keep该class的原因；

*  手动分包





问题：

Mutidex的 Second Dex加载顺序问题 —— Application中静态引用未加载的问题

Seceond Dex运行时加载 —— 文件过大时的ANR问题

无法保证类函数保证构建后，存在于主Dex，其可能引起的问题是：一些在二级Dex加载之前,可能会被调用到的类(比如静态变量的类),需要放在主Dex中.否则会ClassNotFoundError.


手动分包:



---

Quote:

[MultiDex工作原理分析和优化方案](https://zhuanlan.zhihu.com/p/24305296)

[Android分包原理](http://souly.cn/%E6%8A%80%E6%9C%AF%E5%8D%9A%E6%96%87/2016/02/25/android%E5%88%86%E5%8C%85%E5%8E%9F%E7%90%86/)

[Android Dex分包之旅](http://yydcdut.com/2016/03/20/split-dex/)

[美团Android DEX自动拆包及动态加载简介](http://tech.meituan.com/mt-android-auto-split-dex.html)

[dex分包变形记](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=193)
