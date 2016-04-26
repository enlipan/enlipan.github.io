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


{% highlight xml %}

  // android:background="?attr/colorPrimary" ——  尤其需要注意，否则主题中设定的颜色不生效，？ 代表引用当前主题下的属性值；
  <android.support.v7.widget.Toolbar
      android:id="@+id/id_v7_toolbar"
      android:layout_width="match_parent"
      android:layout_height="wrap_content"
      android:background="?attr/colorPrimary"
      app:popupTheme="@style/ThemeOverlay.AppCompat.Light"
      android:fitsSystemWindows="true">
  </android.support.v7.widget.Toolbar>

  ////////////////////////////////////////////////////////////
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
   WindowManager.LayoutParams localLayoutParams = getWindow().getAttributes();
   localLayoutParams.flags = (WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS | localLayoutParams.flags);
  }

{% endhighlight %}  


利用 FastBlur 实现一个 透明状态栏的模糊图片背景效果：

![FastBlur](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160412/device-2016-04-13-231504.png)


{% highlight xml  %}

<item name= "android:windowTranslucentStatus">true</item>
<item name="android:windowTranslucentNavigation">true</item>

//////////////////////////////////////

<android.support.v7.widget.Toolbar
    android:id="@+id/id_v7_toolbar"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:background="?attr/colorPrimary"
    app:popupTheme="@style/ThemeOverlay.AppCompat.Light"
    android:visibility="gone"
    android:fitsSystemWindows="true">
</android.support.v7.widget.Toolbar>

<LinearLayout
    android:id="@+id/ll_content_background"
    android:fitsSystemWindows="true"
    android:paddingTop="25dp"
    android:clipToPadding="true"
    android:layout_width="match_parent"
    android:layout_height="200dp"
    android:orientation="horizontal">

    <ImageView
        android:id="@+id/iv_avatar"
        android:fitsSystemWindows="true"
        android:scaleType="fitCenter"
        android:layout_margin="16dp"
        android:layout_width="50dp"
        android:layout_height="50dp"/>

    <TextView
        android:layout_margin="16dp"
        android:text="Android Bar"
        android:gravity="center"
        android:layout_width="wrap_content"
        android:layout_height="50dp"/>

    <TextView
        android:layout_margin="16dp"
        android:text="System Bar"
        android:gravity="center"
        android:layout_width="wrap_content"
        android:layout_height="50dp"/>
</LinearLayout>


{% endhighlight %}  

clipToPadding 属性： ViewGroup 的 Padding 默认不可绘制子View，设为 false后 Padding空白可用于子View的绘制，典型用于 ListView，首尾元素留白；




PS:

两个坑的解决：   

透明状态栏模式下 EditText 输入法弹起导致的 Toolbar文字消息以及 输入法模式的无效问题

主题属性导致 Toast  显示偏移的问题；


---

Quote:

[何为沉浸模式，沉浸式顶栏，变色龙状态栏？](https://www.zhihu.com/question/24908570/answer/86427977)


[Why would I want to fitsSystemWindows?](https://medium.com/google-developers/why-would-i-want-to-fitssystemwindows-4e26d9ce1eec#.9852i2fsy)

[ANDROID – 在 KITKAT 以上版本的 TRANSLUCENT 介紹](http://blog.mosil.biz/2014/01/android-transparent-kitkat/)

[Android 沉浸式状态栏](http://blog.csdn.net/lmj623565791/article/details/48649563)

[Android 5.0 如何实现将布局的内容延伸到状态栏实?](https://www.zhihu.com/question/31468556)

[Material Designer的低版本兼容实现（二）—— Theme](http://www.cnblogs.com/tianzhijiexian/p/4081562.html)

[Canvas之translate、scale、rotate、skew](http://blog.csdn.net/tianjian4592/article/details/45234419)

[Android开发：Translucent System Bar 的最佳实践](http://www.jianshu.com/p/0acc12c29c1b)
