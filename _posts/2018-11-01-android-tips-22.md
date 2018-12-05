---
layout: post
title:  Android Tips part (22)
category: android
keywords: [improvement,android,java,js]
---

### Headless Fragment 


利用 Fragment 处理 Activity 旋转销毁重建等问题.  

> Calling Fragment#setRetainInstance(true) allows us to bypass this destroy-and-recreate cycle, signaling the system to retain the current instance of the fragment when the activity is recreated.

https://www.androiddesignpatterns.com/2013/04/retaining-objects-across-config-changes.html

— 

利用 baseActivity 带来的高侵入性获取声明周期与利用 Headlessfragment 的便利性.  


> A headless Fragment is simply a Fragment that does not have a layout or View to render. 



https://medium.com/@ali.muzaffar/use-headless-fragment-for-android-m-run-time-permissions-and-to-check-network-connectivity-b48615f6272d


—

注意:不经意的传入了一些 Activity 中的 View 对象或者其他匿名内部类之类对象给 HeadlessFragment,但又忘记了在 Fragment destroy 时清空引用. 

一旦遗忘容易导致内存泄漏.

https://medium.com/@ghbhatt/my-experiments-with-headless-fragments-20606c5180ab


### 硬件加速问题

花屏

* 硬件加速级别精细化控制: 

android:hardwareAccelerated

应用级别 && Activity页面级别 && Window 级别 && View 级别  

```

Window.setFlags();


View.setlayerType();

```


硬件加速Google 建议: 

> Reduce the number of views in your application
> Avoid overdraw
> Don't create render objects in draw methods
> Don't modify shapes too often
> Don't modify bitmaps too often  


硬件加速可能引起问题的原因:   

> 硬件加速属于双缓冲机制，使用显存进行页面渲染（使用较少的物理内存），导致更频繁的显存操作，可能引起以下现象：白屏、花屏、闪屏；低RAM内存配置手机上闪退。虽然新出的Android5.0的手机整体配置较高（显存较大），但是如果页面中使用大量图片或者过于复杂的CSS样式时同样容易出现白屏、花屏、闪屏现象。            
> 解决硬件加速造成的问题有2个思路，1.降低页面的内存占用，给硬件加速腾出RAM；2.在适当的地方关闭硬件加速。

https://www.cnblogs.com/devilyouwei/articles/6296606.html

### 移动端日志上传

1. 剔除无效数据减少无效流量
> 无效数据:   
> > URL 冗余/ KEY 冗余 / 上报频率   

2. 优化非实时上报的时效性与实时上报的性能损耗,寻找平衡

> 非实时上报是主流, 能够做本地数据整理,批量上传,减少请求.  
> * 特殊时间点实时上报:APP 打开时, 关闭时  
> * 按照时间间隔定时上报         
> * 按照累计数据量上报       

上述策略结合,获取上报平衡点.

3. 数据压缩



### Android 开发 

* git flow https://github.com/nvie/gitflow

> bisect

* git extra https://github.com/tj/git-extras

* square CodeStyle https://github.com/square/java-code-styles

* Android debugDrawer https://github.com/palaima/DebugDrawer

* android-best-practices

### Android 图片处理 

http://www.52im.net/thread-1208-1-3.html

* 质量压缩         

```
bitmap.compress()

// 最终调用 native 函数, 利用 skia 引擎对图片进行编码压缩

```



### Android Dialog 样式

```

<style name="dialogTransparent" parent="@android:style/Theme.Dialog">
        <item name="android:windowFrame">@null</item> <!--边框-->
        <item name="android:windowIsFloating">true</item> <!--是否浮现在activity之上-->
        <item name="android:windowIsTranslucent">true</item> <!--半透明-->
        <item name="android:windowNoTitle">true</item> <!--无标题-->
        <item name="android:background">@android:color/transparent</item> <!--背景透明-->
        <item name="android:windowBackground">@android:color/transparent</item> <!--背景透明-->
        <item name="android:backgroundDimEnabled">true</item> <!--模糊-->
        <item name="android:backgroundDimAmount">0.6</item>  <!--背景透明度-->
        
```



###  Maven 

```
    <groupId>cc.mzone</groupId>
    <artifactId>m1</artifactId>
    <version>0.1-SNAPSHOT</version>
    <packaging>jar</packaging>
```

* Snapshot 

开发过程中的不稳定版本,版本号后添加 -SNAPSHOT, 快照版本 maven deploy 时会发布到快照版本库中,会覆盖老的快照版本,而在使用快照版本的模块,在不更改版本号的情况下, maven 每次自动从镜像服务器下载最新时间戳的快照版本. 

而与之相对,如果是正式发布版本,maven deploy 发布部署到正式版本仓库中,使用正式版本的模块在不更改版本号的情况, 编译打包时如果本地存在该版本的模块则**不主动**去镜像服务器下载. 

Snapshot 不是一个特定版本,是一系列版本集合,其中的 HEAD 永远指向最新时间戳的快照, 外界可见是最新版本,以至于给人一种版本覆盖的假象.所带来的优势在于重新构建可以拉取最新的代码. 

依赖的透明性传达, 开发过程中这种特性非常便捷,也很重要.

但与之对应的是构建结果的不确定性. 如果不加以限制会导致各种无法预知的问题.

**不确定性需要被加以控制**,软件如果依赖于不确定的 Snapshot 会导致自身同样处于不确定之中.  

* release 

相对 snapshot 的一系列版本, release 是一个稳定的版本. 

**一个对应一系列**

release 在 maven 的配置中可以配置成 redeploy , 这样的 release 就成为了 snapshot, 伪装的 snapshot 会产生更多的坑. 

合理的规约: **release 一经发布就不可变更**

* 合理的抉择

开发与生产环境特性: 开发环境与开发过程中开发的效率至上,方便性高于稳定性.   

生产环境: 稳定性至上,一切不稳定因素需要得到控制.  

### MakeFile

Makefile 构建工具 基于 Makefile 配置语言进行项目构建 

语法: 

目标: 预置条件            
<TAB> 步骤

项目构建文件名: 

```
Makefile: 

hello: 
          echo "Hello"

```

默认 Makefile 中第一个目标作为默认目标,可以利用 `.DEFAULT_GOAL` 定义一个伪目标.    

而利用  all 则可以定义多个伪目标.


```
clean 目标
```

clean 通常用于构建清理, 不应该放入 all 中,而应该在需要时手动通过 `make clean ` 触发清理.

[Makefile 构建过程](https://zhuanlan.zhihu.com/p/44267123)

### Java 8 处理 NPE check 

尤其对于 Object.getObj().getObj().getObj().getValue(); 这样的链式处理利用 Optional Map 处理会优雅很多.


### 复盘

时间的高效利用非常重要,保持自己在市场中的竞争力,如何有效反思?