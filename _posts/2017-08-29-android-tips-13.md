---
layout: post
title:  Android Tips part (13)
category: android
keywords: [improvement,android,java]
---

### Gradle Tips

动态增加构建变量:

{% highlight groovy %}

    applicationVariants.all {
        variant -> variant.buildConfigField "String", "VARIABLE", "\"" + variant.getName() + "\""
    }

{% endhighlight %}

需要注意的是 String 的构建,否则会等同于引用变量,产生找不到符号变量的构建错误;如这里的 VARIABLE = debug 和 VARIABLE = "debug" 是有差异的;

### PhysicsBasedAnimation

基于物理特性的动画相对通常使用的属性动画而言,其模仿实时动作,动画变化更加自然,平滑结束,动画看起来非常流畅,而不会有普通属性动画的中断的感觉;


[Physics-based Animations-Google](https://developer.android.com/guide/topics/graphics/physics-based-animation.html)

[将基于物理的动画添加到 Android 应用程序](https://code.tutsplus.com/zh-hans/tutorials/adding-physics-based-animations-to-android-apps--cms-29053)

[Introduction to Physics-based animations in Android](https://medium.com/@richa.khanna/introduction-to-physics-based-animations-in-android-1be27e468835)

### ConstraintLayout

约束布局精简布局层次

[Build a Responsive UI with ConstraintLayout](https://developer.android.com/training/constraint-layout/index.html)

[带你一步步理解使用 ConstraintLayout - 翻译](http://www.jianshu.com/p/793f76cf9fea)

[Android ConstraintLayout使用指南](http://blog.coderclock.com/2017/04/09/android/android-constraintlayout/)
