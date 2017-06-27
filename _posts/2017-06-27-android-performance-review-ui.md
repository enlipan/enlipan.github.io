---
layout: post
title:  Android 性能优化回顾之UI
category: android
keywords: [improvement,android,UI]
---

### 性能优化回顾

App中对于用户来说最直观的就是App的流畅性，而流畅性直接对应的就是UI性能，众所周知16.6ms帧是流畅性的指标，那么如何达到这一目呢？

对于性能优化-一般是在已有开发成果上进行的，通常是几步走的思路：

* 发现问题      
* 分析问题原因（核心步骤）    
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

父布局的重复测量- 用于确认子View的准确位置：

ReleativeLayout  重复测量  

带 weight 的LinearLayout 的重复测量   

尽可能的保持View的扁平化   


### 手段：

开发者模式- 过度绘制查看

开发者模式- GPU呈现模式- 卡顿检测工具   

Layoutinspector    - 以window为单位   


### Hierachy View

View层次查看工具

* Hierachy View  - tools -android Device 


#### TraceView

函数调用过程分析工具：

生成方式：

* 精确生成- 代码定位   

* DDMS生成- 方便，但定位不精确

### Systrace  

UI性能分析工具：

快捷键：

* A  时间片向前移动   
* D  时间片向后移动    
* S  缩小      
* W  放大       





--- 

Quote:

[Android 显示原理简介](http://djt.qq.com/article/view/987)

[Android Tech](https://github.com/lyc7898/AndroidTech)

[ViewServer](https://github.com/romainguy/ViewServer)

[Hierarchy Viewer](https://developer.android.com/studio/profile/hierarchy-viewer.html#start)




systrace    