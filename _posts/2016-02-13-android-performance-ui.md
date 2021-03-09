---
layout: post
title: Android性能优化之UI
category: android
---

### 性能分析三部曲：

* 收集应用信息

> * 应用的信息纷繁复杂，要善用工具有针对性的收集对应信息   
> * 利用各类工具[Google工具](http://developer.android.com/sdk/index.html)


* 深入分析收集信息   

> 针对手机的信息进行分析，也就是看懂对应工具的信息，无论是图表，还是文本信息，了解其背后所代表的含义，进一步精确定位问题

* 针对问题采取解决方案

> 根据所分析的结果设计相应的解决方案，并利用工具验证方案的有效性       


* 重复性能优化三部曲直到稳定


### GPU

* CPU 图形化数据处理    
* Data传输(CPU    至   GPU)      
* GPU光栅化处理       
* 绘制展示

#### 流畅的UI

60 FPS  与  16ms？

大脑对于图像的处理，流体运动的处理：12 fps以上可以被大脑感知，24 fps 作为电影的标准，而60 fps 作为 手机UI展示的黄金比率(也就是 16.66ms / 帧)，但当速率下降时 用户将明显感知到 UI 流畅性变化问题；

#### onDraw 中的内存分配

onDraw 函数在UI线程中，系统对于onDraw函数会多次调用，频率相当高，会造成短时间内大量对象被创建回收，引发GC：GC\_FOR\_ALLOC，进而引发各类问题


### Android图片加载

采样率 bitMapOptions 测量

图片格式 ARGB_8888  RGB565 等针对具体情况选择，进而可以节省内存占用



---

常见UI性能优化工具有：

*  开发者选项中 —— 调试GPU过度绘制  蓝绿粉红                 
*  开发者选项中 ——  Profile GPU Rendering                     
*  SysTrace 跟踪View帧绘制情况                                                         
*  Hierarchy Viewer

[开启 Hierarchy Viewer: ](https://developer.android.com/tools/performance/hierarchy-viewer/index.html) Set an **ANDROID\_HVPROTO** environment variable on the desktop machine

[Profiling with Hierarchy Viewer](https://developer.android.com/intl/zh-cn/tools/performance/hierarchy-viewer/profiling.html#InterpretingResults)

* SysTrace UI Trace报告

用于观测帧画面生成过程中的方法事件，结合系统Alert报告可以粗略定位问题，当UI线程中方法较多时我们需要利用 TraceView精准定位函数耗时；





* 终极武器 TraceView

可以用于精准的分析线程中各个函数的占用资源情况，当然也可以用于精准分析UI线程中的函数时间消耗情况，进而定位UI卡顿原因；


### TraceView

[Profiling with Traceview and dmtracedump](http://developer.android.com/intl/zh-cn/tools/debugging/debugging-tracing.html)

* Debug.startMethodTracing() 与 Debug.stopMethodTracing() 生成trace 文件 精确定位相关函数的资源占用情况；

{% highlight java %}

    // start tracing to "/sdcard/calc.trace"
    Debug.startMethodTracing("calc");
    // ...
    // stop tracing
    Debug.stopMethodTracing();

{% endhighlight %}

* 利用DDMS 生成，注意不要操作过长时间，导致调用函数过多，增加分析复杂度；

时间面板中参数很多，刚开始看只有一种不明觉厉的感觉，其实其中有几个参数作为主线追踪即可，其他参数作为辅助参考：

Name：函数名  parent ：调用该函数的父函数——双击可直接定位  children： 该函数的调用函数

incl Real Time :  函数运行的真实时间(ms),包含其调用子函数的时间

excl Real Time:    函数运行的真实时间，排除其子函数时间，也就是函数本身执行的时间

Call + Recur Calls / Total 函数的调用次数 + 递归调用次数 / 总调用次数比

Real Time / Call  函数每一次执行的真正占用时间

一般分析抓住以上几个点，就可以顺藤摸瓜定位找出线程中真正耗时的函数，进行性能优化；

{:.center}
![TraceView](http://img.oncelee.com/assets%2Fimg%2F20160225%2FTraceView.JPG)


---

[Chapter 4. Screen and UI Performance](https://www.safaribooksonline.com/library/view/high-performance-android/9781491913994/ch04.html)

[Android 编程下的 TraceView 简介及其案例实战](http://www.cnblogs.com/sunzn/p/3192231.html)


[The Performance Lifecycle -- 性能分析三部曲](https://www.youtube.com/watch?v=_kKTGK-Cb_4&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=18&feature=iv&src_vid=GajI0uKyAGE&annotation_id=annotation_778442405)

[Android Performance Patterns: Rendering Performance 101 渲染性能问题](https://www.youtube.com/watch?v=HXQhu6qfTVU&list=PLOU2XLYxmsIKEOXh5TwZEv89aofHzNCiu&index=1&feature=iv&src_vid=OrLEoIsMIAc&annotation_id=annotation_2612916337)

[Google Performance -- about GPU](https://www.youtube.com/watch?v=WH9AFhgwmDw&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=6&feature=iv&src_vid=1WqcEHXRWpM&annotation_id=annotation_427001817)

[Android Performance Patterns: Why 60fps?](https://www.youtube.com/watch?v=CaMTIgxCSqU&list=PLOU2XLYxmsIKEOXh5TwZEv89aofHzNCiu&index=4&feature=iv&src_vid=WH9AFhgwmDw&annotation_id=annotation_82533007)

[Custom Views and Performance (100 Days of Google Dev)](https://www.youtube.com/watch?v=zK2i7ivzK7M&list=PLOU2XLYxmsIKEOXh5TwZEv89aofHzNCiu&index=40)

[Avoiding Allocations in onDraw()](https://www.youtube.com/watch?v=HAK5acHQ53E&feature=iv&src_vid=_kKTGK-Cb_4&annotation_id=annotation_2096336547)

[Android Performance Patterns: Invalidations, Layouts, and Performance](https://www.youtube.com/watch?v=we6poP0kw6E&list=UU_x5XG1OV2P6uZZ5FSM9Ttw&feature=iv&src_vid=CaMTIgxCSqU&annotation_id=annotation_107155567)

[Google Performance -- about PNG](https://www.youtube.com/watch?v=2TUvmlGoDrw&feature=iv&src_vid=1WqcEHXRWpM&annotation_id=annotation_2477902193)

[Google Performance -- about Image](https://www.youtube.com/watch?v=1WqcEHXRWpM&feature=iv&src_vid=SA4j6KKjMRk&annotation_id=annotation_2988823891)
