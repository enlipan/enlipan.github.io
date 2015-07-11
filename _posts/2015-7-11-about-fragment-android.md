---
layout: post
title: Fragment 小结
category: android
---
###Fragment是什么？

根据Google开发文档的定义：

> A Fragment represents a behavior or a portion of user interface in an Activity. You can combine multiple fragments in a single activity to build a multi-pane UI and reuse a fragment in multiple activities. You can think of a fragment as a modular section of an activity, which has its own lifecycle, receives its own input events, and which you can add or remove while the activity is running (sort of like a "sub activity" that you can reuse in different activities).

Fragment必须依赖于Activity这一宿主去生存，同时其状态受其宿主状态影响，当Activity 暂停，这一Activity中的Fragment也都会暂停(Paused).当Activity活动状态时，也就是Fragment威力显现的时候，其灵活性充分发挥，可以随意把某个Fragment当作独立个体去操纵，增加到Activity或者删除以及获取其中事件。同时将Layout从Activity中分离到Fragment中有利于动态管理视图显示。

关于Inflate()方法的第三个参数attachToRoot的官方解释：

> The inflate() method takes three arguments:
> 
> The resource ID of the layout you want to inflate.
> 
> The ViewGroup to be the parent of the inflated layout. Passing the container is important in order for the system to apply layout parameters to the root view of the inflated layout, specified by the parent view in which it's going.
> 
> A boolean indicating whether the inflated layout should be attached to the ViewGroup (the second parameter) during inflation. (In this case, this is false because the system is already inserting the inflated layout into the container—passing true would create a redundant view group in the final layout.)
> 

###Fragment的使用：

Fragment建立的初始原则就是：建立对于Activity的可重用视图模块组件，每一个Fragment都有其独立的对应layout视图xml文件，更有着自己独立的生命管理周期。

Fragment的使用主要有动、静两种方式：

* 一是通过Activity的layout文件写入固定的Fragment，利用android:name属性，这是**静**的使用类型，应用简便         

> 静态的应用流程是：Activity layout视图文件中显示配置android:name属性，指定对应的Fragment类，那么在该Activity启动加载时就会调用到setContentView加载layout视图，进而去调用到Fragment.java，进一步去使用Inflater装载写好的Fragment layout视图文件，进而达到完整的显示。
> 
>  Fragment的使用不是由Android系统调用的，其生命周期由其托管的Activity管理。 

*  二是通过Java代码写入逻辑，运行时动态选择添加Fragment视图文件，这代表着**动**，灵活性强

>利用FragmentManager去管理Fragment的装载，初期在Activity中只是简单的设定了Container容器，后期填入哪一个Fragment由自己灵活运行时设定。由于Container设定了id属性，所以可以很轻易的指定Fragment填入到哪里的容器。这样一来，填入什么，填入到哪里都是灵活动态装载的。
> 
> 需要再次额外提的`inflate(Rid,parent,attachtoroot)`方法的几个参数问题。我们在静态使用的时候是指定了填入哪个Fragment到哪个Activity中，所以无需再次绑定，防止多次绑定返回多余的ViewGroup。同样动态的时候也会自己手动后续绑定，所以基本上我们的attachtoroot都是填入的false，也就是将Fragment作为独立的view返回。


###Fragment间的通信：

由于Fragment是依存于Activity，可以利用`getActivity()`去获取顶层Activity上下文环境，进而获取到其他依存于该Activity的Fragment中的子类参数，也就达到了Fragment之间的数据传递。



---

[使用Fragment建立动态UI](http://hukai.me/android-training-course-in-chinese/basics/fragments/index.html)

[Fragment-Google](http://developer.android.com/guide/components/fragments.html)
