---
layout: post
title:  Android Instant Run 及热更新
category: android
keywords: [improvement,android]
---

热更新解决的问题：

传统发版的代价高，流程长，Bug修复慢，用户体验差，而热更新就是为解决这一问题而生,实现高效修复，用户无感知的修复流程；

### 阿里 Sophix 

底层替换方案 组合 类加载方案的综合

Dex 全量替换


AndFix 的即时生效: 底层替换, Native 方式替换方法所有信息,但具体每一个版本的虚拟机信息替换都需要对应的适配;

对应类加载机制原理的重启生效,使用ClassLoader 调整加载顺序,将热修复的类加载到原始类之前


正由于 AndFix 高度依赖 Artmethod 信息,而各个厂商又极大可能定制该信息,修改虚拟机结构,导致该ArtMethod 与 AndFix 的信息不匹配;

从 Method 信息的一一替换,到 Method 的整体替换,进而达到忽略局部信息;那细节问题忽略之后,问题变成了新的 method 与旧 method 的 Size 对应问题;

针对 Artmethod 的线性 List 构造,自行构造Method 信息集合,获取 Method Size 地址空间,从而带入 Artmethod 的替换过程中;

权限:

同包名下的类间访问-  同 ClassLoader 校验;

### 微信 Tinker  

类加载方案

App 启动利用 ClassLoader加载新的类




### Instant Run 

AssetManager 的构造,重新设置资源 Path ,然后反射全量替换前面所有使用 AssetManger 的地方;

别人对问题的解决方式不是问题的定义! -- From 你的灯亮着吗?

Sophix 独辟蹊径,新增 增量 ID path 



---

Quote:

[Android热更新方案Robust- 美团](http://tech.meituan.com/android_robust.html)

[微信Android热补丁实践演进之路](http://mp.weixin.qq.com/s?__biz=MzAwNDY1ODY2OQ==&mid=2649286306&idx=1&sn=d6b2865e033a99de60b2d4314c6e0a25&scene=0#wechat_redirect)

[安卓App热补丁动态修复技术介绍- Qzone](http://mp.weixin.qq.com/s?__biz=MzI1MTA1MzM2Nw==&mid=400118620&idx=1&sn=b4fdd5055731290eef12ad0d17f39d4a&scene=25#wechat_redirect)

[深度理解Android InstantRun原理以及源码分析](https://github.com/nuptboyzhb/AndroidInstantRun)

[Instant Run工作原理及用法](http://www.jianshu.com/p/2e23ba9ff14b)
