---
layout: post
title:  MD Views
category: android
keywords: [anroid,View]
---

### FloatingActionButton:

fabSize:设定大小

CoordinatorLayout特性：

**anchor**

> a feature in CoordinatorLayout that allows us to hover one element over another.
>  
> Children of a CoordinatorLayout may have an anchor. This view id must correspond to an arbitrary descendant of the CoordinatorLayout, but it may not be the anchored child itself or a descendant of the anchored child. This can be used to place floating views relative to other arbitrary content panes.

(CoordinatorLayout 子View的anchor属性不能设置为该子View自身，或者该子View的子View)

* layout_anchor           
* layout_anchorGravity       




### CoordinatorLayout

>  As a top-level application decor or chrome layout
>  As a container for a specific interaction with one or more child views


关于 RecyclerView 内容隐藏在 Toolbar下的问题：

1.  Toolbar需要用 appBarlayout 包裹，也就是作为其子View(appBarlayout 最好作为CoordinatorLayout 的首个子View存在于layoutxml中)

2.  appBarlayout 下的 RecyclerView 需要设定默认处理Scroll的behavior ：

`app:layout_behavior="@string/appbar_scrolling_view_behavior"`

Ps：`app:layout_behavior` is set to a pre-defined standard scrolling behavior

@string/appbar_scrolling_view_behavior 所对应的是 android.support.design.widget.AppBarLayout$ScrollingViewBehavior，该Behavior指定了二者的依赖关系，RecyclerView的滚动事件可以触发 AppBarLayout和AppBarLayout其子View的改变，其app:layout_scrollFlags属性所定义的动作也将在RecyclerView 滚动时触发；


app:layout_scrollFlags: enterAlways, enterAlwaysCollapsed, exitUntilCollapsed, snap

CollapsingToolbarLayout:实现Toolbar展开效果


Ps：

1. CollapsingToolbarLayout 本质是继承 FramLayout，在测试过程中我发现，按照Demo总是会出现最后图片出现在Toolbar的现象，根据FramLayout的特性，我猜测需要将 CollapsingToolbarLayout中的ImageView放置在toolbar之上，才能在收起时隐藏ImageView；


2. 在配置主题时，合理的继承做版本的控制，一般在基础style中设定 Base主题，而在高版本（values-v21等）继承基础主题做进一步特定版本设定，如果否者需要将基础的设定完全的copy一份到高版本中，造成多余冗余；而如果再高版本中不做设定，则属于未做配置；

---

[scrolling-techniques-behavior](https://material.google.com/patterns/scrolling-techniques.html#scrolling-techniques-behavior)

[Floating-Action-Buttons](https://guides.codepath.com/android/Floating-Action-Buttons)

[Handling-Scrolls-with-CoordinatorLayout](https://guides.codepath.com/android/Handling-Scrolls-with-CoordinatorLayout#expanding-and-collapsing-toolbars)


[How to hide/show Android Toolbar when scrolling (Google Play Music’s behavior)](https://rylexr.tinbytes.com/2015/04/27/how-to-hideshow-android-toolbar-when-scrolling-google-play-musics-behavior/)

[一步一步深入理解CoordinatorLayout](http://yifeiyuan.me/2016/07/12/%E4%B8%80%E6%AD%A5%E4%B8%80%E6%AD%A5%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3CoordinateLayout/)

[深入理解CoordinatorLayout.Behavior](http://www.jianshu.com/p/5ffb37226e72)

[Why would I want to fitsSystemWindows?](https://medium.com/google-developers/why-would-i-want-to-fitssystemwindows-4e26d9ce1eec#.pfvvqr4fr)

[深入理解Android 自定义attr Style styleable以及其应用](http://www.jianshu.com/p/61b79e7f88fc)
