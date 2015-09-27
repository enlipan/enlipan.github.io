---
layout: post
title: Android-50-Hacks
category: android
---

Android开发必知的50个诀窍读书笔记：

####Hack 1：

Weight权重的使用：实现视图占父视图1/2大小以及居中展示

android:weightSum结合子View中的android:weight使用，对于界面的展示，尽可能少的使用硬编码去确定显示位置。

####Hack 2：

View的延迟加载与代码重用

Include覆盖问题：

> The problem  is  that  the  <include  /> tag  must  specify  both  android:layout_width and 
android:layout_heightif we want to override any android:layout_*attributes. 
> 
> Take a look at the width and height we placed in the footer.xml file: they’re both 0dp. We  did  this to make  users  specify a  width and height when  used  together  with  the <include />tag. If users don’t add them, they won’t see the footer because the width and height are zero.     
> 
ViewStub:

ViewStub.inflate ()返回填充视图的引用，inflatedId代表被填充View的Id；

一般情形我们可能对于ViewStub的性能提升观察不明显，但是当视图层次较深的时候，ViewStub的威力就开始显现出来。  

####Hack 3：

ViewGroup自定义

* 自定义视图组在复用时，更易维护          
* 布局文件精简化      

通过ViewGroup层层遍历，Measure测量子View尺寸信息，层层传递保存，第二过程由Layout层层遍历从上至下传递定位位置信息。最后在Onlayout中利用前期所得尺寸位置信息，布局子视图。



####Hack 4：

PreferenceActivity



###Hack 5:

文本与图片切换的动画效果

TextSwitcher

ImageSwitcher

改变动画切换效果




####Hack 9：

不在EditText中验证日期

将Button设定为类似EditText背景情况下，联动DatePicker

button  xml:

android:background = "@android:drawable/edit_text"



####Hack 10：

格式化文本：设定特殊功能或样式的文本

*  SpannableString 这玩意最近做点赞特效用到过，简洁易用     
*  Html.fromHtml()

Quote：

[Android SpannableString Example](http://androidcocktail.blogspot.jp/2014/03/android-spannablestring-example.html)




####Hack 13:

OnCreate()中获取View宽高：

正常获取无法获取，inflater仅仅加载了视图内容，measure与layout才是视图与子视图大小的测量，类比做蛋糕，仅仅准备好了蛋糕的材料一堆鸡蛋面粉等是无法知道最终做出来的蛋糕的大小的。可以在oncreate阶段利用View.post()函数，将获取宽高的方法开启Runnable线程post到消息队列中，获取要测定的View的宽高。

> After setContentView() is invoked, the event queue will contain a message asking for a relayout, so anything you post to the queue will happen after the layout pass. –  [Romain Guy](http://stackoverflow.com/questions/3602026/linearlayout-height-in-oncreate-is-0/3602144#3602144) 

> [getWidth() and getHeight() of View returns 0](http://stackoverflow.com/questions/3591784/getwidth-and-getheight-of-view-returns-0)













####Hack 18:

利用ProGuard处理移除全部的日志语句

