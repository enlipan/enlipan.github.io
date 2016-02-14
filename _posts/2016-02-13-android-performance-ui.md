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



### Android图片加载


---

[The Performance Lifecycle -- 性能分析三部曲](https://www.youtube.com/watch?v=_kKTGK-Cb_4&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=18&feature=iv&src_vid=GajI0uKyAGE&annotation_id=annotation_778442405)

[Android Performance Patterns: Rendering Performance 101 渲染性能问题](https://www.youtube.com/watch?v=HXQhu6qfTVU&list=PLOU2XLYxmsIKEOXh5TwZEv89aofHzNCiu&index=1&feature=iv&src_vid=OrLEoIsMIAc&annotation_id=annotation_2612916337)

[Google Performance -- about GPU](https://www.youtube.com/watch?v=WH9AFhgwmDw&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE&index=6&feature=iv&src_vid=1WqcEHXRWpM&annotation_id=annotation_427001817)

[Android Performance Patterns: Why 60fps?](https://www.youtube.com/watch?v=CaMTIgxCSqU&list=PLOU2XLYxmsIKEOXh5TwZEv89aofHzNCiu&index=4&feature=iv&src_vid=WH9AFhgwmDw&annotation_id=annotation_82533007)

[Custom Views and Performance (100 Days of Google Dev)](https://www.youtube.com/watch?v=zK2i7ivzK7M&list=PLOU2XLYxmsIKEOXh5TwZEv89aofHzNCiu&index=40)

[Avoiding Allocations in onDraw()](https://www.youtube.com/watch?v=HAK5acHQ53E&feature=iv&src_vid=_kKTGK-Cb_4&annotation_id=annotation_2096336547)

[Android Performance Patterns: Invalidations, Layouts, and Performance](https://www.youtube.com/watch?v=we6poP0kw6E&list=UU_x5XG1OV2P6uZZ5FSM9Ttw&feature=iv&src_vid=CaMTIgxCSqU&annotation_id=annotation_107155567)

[Google Performance -- about PNG](https://www.youtube.com/watch?v=2TUvmlGoDrw&feature=iv&src_vid=1WqcEHXRWpM&annotation_id=annotation_2477902193)

[Google Performance -- about Image](https://www.youtube.com/watch?v=1WqcEHXRWpM&feature=iv&src_vid=SA4j6KKjMRk&annotation_id=annotation_2988823891)

