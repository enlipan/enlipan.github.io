---
layout: post
title: Android 9-Pathes
category: android
---

9-path图片可被Android自动识别出，哪些指定区域可以被拉伸，哪些部分不可以，适当的处理可以保证背景图的边角特效的效果一致性。


> The guides are straight, 1-pixel black lines drawn on the edge of your image that define the scaling and fill of your image. 
> 
> Selected parts of the image are scaled horizontally or vertically based indicators drawn within the image.

上下左右各区域作用：

* 其左上边界划定了可拉伸区域，为必须指定区域

按照左上边界可以将图划分为9块，其中边缘四角为不拉伸区域，一般为保证图形形状而设定，上下边界为左右拉伸，左右为上下拉伸，中间为可上下左右拉伸区域。

{:.center}
![9-patch](\assets\img\20150912\9-path-how-to-scaled.png)

* 右下边界划定Drawable区域，也就是文字内容区域，不指定时与左上保持一致

合理的分配好可扩展区域与内容区域，可以保证在保证拉伸形状的时如圆形边角等形状，同时保证内容区域不会因为拉伸而移动变形，如拉伸之后内容区域跑到边上。

需要注意的是：9-path图片是指的其拉伸状态而不能被缩小，所以其初始图片一般越小越好。

> It’s important to note that 9-patch images don’t scale down – they only scale up. So it’s best to start as small as possible.
























---

Quote：

Android编程权威指南

[Android设计中的.9.png](http://isux.tencent.com/android-ui-9-png.html)

[Draw 9-patch-Google](http://developer.android.com/tools/help/draw9patch.html)

[A simple guide to 9-patch for Android UI](http://radleymarx.com/blog/simple-guide-to-9-patch/)

[详析android中.9.png的用法](http://www.chenyunchao.com/?p=199)

[9-patch图片以及例子说明](http://www.cnblogs.com/Amandaliu/archive/2013/04/26/3045286.html)


