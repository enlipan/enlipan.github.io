---
layout: post
title:  Android MultiDex
category: android
keywords: [improvement,android]
---


### DexFile


单DexFile问题: 65536  /  INSTALL_FAILED_DEXOPT


原因：

dexopt linearAlloc

method/field/class - short



问题原因：


解决： 精简 + 插件化 + 分割Dex


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
