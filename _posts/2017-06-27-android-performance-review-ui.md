---
layout: post
title:  Android 性能优化回顾之UI
category: android
keywords: [improvement,android,UI]
---

在15年最初做性能优化的时候，大多是看官方视频以及一些优秀Blog的信息进行自己摸索，虽然手段还是那些手段，但是总觉得知识碎片化，最近发现额两本书，这里看看顺便总结回顾一下，同时结合现有项目优化问题：

### 性能优化回顾

App中对于用户来说最直观的就是App的流畅性，而流畅性直接对应的就是UI性能，众所周知16.6ms帧是流畅性的指标，那么如何达到这一目呢？

对于性能优化-一般是在已有开发成果上进行的，通常是几步走的思路：

* 发现问题      
* 分析问题原因（**核心**步骤）    
* 找到问题根源从而寻求问题的最优解 - 个别情况需要重构代码   
* 验证问题是否解决，若未解决回溯2-4   


测量   
布局   
绘制  


#### 问题

UI 绘制问题

UI线程负荷过重，以及数据处理导致CPU负荷高，进而导致主线程无法获取CPU时间片

内存问题导致频繁GC，从而引起卡顿


### View的测量绘制相关

* View的Mesure以及Layout过程都是属于针对视图树的深度优先遍历过程，自下向上层层统计传递测量信息，树的层级越深其测量越耗时，尤其在设计到重复测量的过程中，其测量次数将显著上升；因而减少视图的嵌套层次是非常有必要的，当嵌套层次过深时会导致某些View在低端机型上的显示异常，在CamCard的性能优化过程中，记得最初有View嵌套超过17层的显示异常问题；

* 父布局的重复测量(强制重复测量)- 用于确认子View的准确位置：

* ReleativeLayout 通常会进行重复测量,同时带 weight 属性的LinearLayout 的也需要重复测量子View,当**这二者嵌套时会导致测量次数指数级别上升**


### 手段：

开发者模式- 过度绘制查看

开发者模式- GPU呈现模式- 卡顿检测工具   

Layoutinspector    - 以window为单位   

其他高级工具如下

### Hierachy View

View层次查看工具

* Hierachy View  - tools -android Device 


### Systrace  

UI性能分析工具：可以结合CPU信息，磁盘活动，线程信息等综合生成用于定位绘制缓慢亦或UI卡顿相关问题的trace报告

快捷键：

* A  时间片向前移动   
* D  时间片向后移动    
* S  缩小      
* W  放大

#### TraceView

函数调用过程分析工具：

TraceView的timeline区间生成了各个线程的函数执行时间线，而在Profile区间则对应着函数的执行时间所占用Cpu以及函数内部调用函数信息等综合信息，非常全面，一般通过这一工具我们可以精确找到UI线程中的实际占用资源的函数，进而精准优化UI问题

生成方式：

* 精确生成- 代码定位   

* DDMS生成- 方便，但定位不精确

       





--- 

Quote:

[Android 显示原理简介](http://djt.qq.com/article/view/987)

[Android Tech](https://github.com/lyc7898/AndroidTech)

[ViewServer](https://github.com/romainguy/ViewServer)

[Hierarchy Viewer](https://developer.android.com/studio/profile/hierarchy-viewer.html#start)

[Systrace](https://developer.android.com/studio/profile/systrace.html#analysis) 

[TraceView](https://developer.android.com/studio/profile/traceview.html)

《Android 性能优化》

《Android 性能优化最佳实践》
