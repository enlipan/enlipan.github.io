---
layout: post
title: Android Translucent Bar
category: android
---

###  相关知识介绍：

![Theme Color](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160412/md_color_theme_setting.png)


android:fitsSystemWindows

Boolean internal attribute to adjust view layout based on system windows such as the status bar. If true, adjusts the padding of this view to leave space for the system windows. Will only take effect if this view is in a non-embedded activity.

View的内部布尔属性值，用于调整View基于状态栏等System Window上的展示情况，True，则利用View的 Pading空间用于显示系统Window；且仅当View未嵌入 Activity中时有效；


**Immersive Mode/Translucent Bars**

沉浸模式 与 透明状态栏相关概念分析，沉浸模式不多说，一体化全屏模式；而透明状态栏，自Android19起，可设定状态栏透明，而自Android20起则更加可以利用 colorPrimaryDark 属性设定状态栏View颜色；进一步提升了透明状态栏的可自定义化程度；



###  透明状态栏实践

实现的总体思想：

*  利用 Toolbar 结合 fitsSystemWindows 属性，拓展Toolbar上部 Padding宽度，以达到状态栏颜色与Toolbar颜色一体化；

*  借鉴 [SystemBarTint](https://github.com/jgilfelt/SystemBarTint) 实践思想，由于状态栏可以用于显示View，则在DocView中添加一个与Toolbar颜色相同的View，填充在Systembar区域；


{% highlight java %}

  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
   WindowManager.LayoutParams localLayoutParams = getWindow().getAttributes();
   localLayoutParams.flags = (WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS | localLayoutParams.flags);
  }

{% endhighlight %}  

---

Quote:

[何为沉浸模式，沉浸式顶栏，变色龙状态栏？](https://www.zhihu.com/question/24908570/answer/86427977)


[Why would I want to fitsSystemWindows?](https://medium.com/google-developers/why-would-i-want-to-fitssystemwindows-4e26d9ce1eec#.9852i2fsy)

[ANDROID – 在 KITKAT 以上版本的 TRANSLUCENT 介紹](http://blog.mosil.biz/2014/01/android-transparent-kitkat/)

[Android 沉浸式状态栏](http://blog.csdn.net/lmj623565791/article/details/48649563)

[Android 5.0 如何实现将布局的内容延伸到状态栏实?](https://www.zhihu.com/question/31468556)

[Material Designer的低版本兼容实现（二）—— Theme](http://www.cnblogs.com/tianzhijiexian/p/4081562.html)
