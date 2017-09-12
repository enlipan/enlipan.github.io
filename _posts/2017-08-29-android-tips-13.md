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

### Android 立即停止构建

AS 中在编译开始后,立即点击 cancel, 编译依旧会继续进行直到完成,需要等候许久,有人提出这个 issue 并有人给出了目前的解决方案:  

`./gradlew --stop`

[Google as issue](https://issuetracker.google.com/issues/37081998)



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

### String 相关 

今天优化了一个在输出 Log 时,由于 adb logcat 4k 限制问题而需要多次截取 substring 分段输出进而导致的内存抖动问题,回顾了String 中需要注意的 case :   

[Android 性能优化之 String篇](https://my.oschina.net/Silver2014/blog/782047)


### Java  

* java 更换 package 名称: 

>  `java -jar jarjar.jar process <rulesFile> <inJar>  <outJar>`

使用场景: 替换三方 jar 包包名规则;


### React 面面观 

[React的基础概念](https://zhuanlan.zhihu.com/p/28846204)

[Why need React ](https://medium.freecodecamp.org/yes-react-is-taking-over-front-end-development-the-question-is-why-40837af8ab76)

### Kotlin  概览  

事实上,去年尝试过 Kotlin, 当时觉得是比较多的语法糖,尤其在 Android 对 Java8支持很畸形, Lambda 表达式的支持官方迟迟无法推出后, Kotlin 似乎是一股清流,引入现代语言特性进行精简化处理,同时对于 NPE 的优雅处理;但一直觉得 Kotlin 的异常处理机制并不如 Java 那么舒服;

然而今年 Google 给 Kotlin 正名,不知道会不会是 Swift 的命运,不过不管怎么样 Java 依旧是核心,这类现代语言,即用即学也并非不可;

[Google IO Kotlin](https://www.youtube.com/watch?v=YbF8Q8LxAJs)

### SourceCode  

[Grep Code - SourceCode](http://grepcode.com/)


### Live 记录

焦虑来自哪里? 工作两三年

职业规划需要对于工作有充分的了解,对于行业需要有全盘的了解;

互联网中消息都是存在其背景,各自在发言时都会有其利益背景,只是其冰山一角,就像散户相信那些虚无飘渺的股市内幕消息一样,是不靠谱的一件事,所以在互联网界更需要一个清晰的大脑,清晰的辨识能力;技术选型,学什么?技术背景?技术未来? 

程序员门槛开始变低,学习成本开始降低;

知其然不知其所以然 -  变通能力不足,野路子以及半桶水的科班程序员...

玩 与 编程 : 玩是消费,编程是生产,创造力   - 中国的程序员大概100万  

焦虑 - 一步输步步输? 一定要进大公司? ... 

舆论影响? 还是自我分析?  

对于技术需要有自己的一个理解;

中年危机:一眼看过去,前面所有的路都是人生的下坡路,永远没有希望;程序员的中年危机,知识的革新; 

进入技术中的舒适区 -- 需要值得警惕 --  此时开始对业务进一步了解,但是就技术而言没有长足的长进,程序员的能力栈开始停滞,可怕...

带人- 要给人机会 - 当别人能解决问题时,就让别人解决  - 你的灯亮着吗?   

做一件事,你需要确定你真的是要走这条路,而不是为了逃避一件事而去做另一件事..

首先要对于自己有清晰的认知,对于困难要有一个较好的全面评估,不能盲人摸象

转管理应该是一件自然而然的事情,应该是对于自己的技术栈有一种充分的自信后,日常讨论的需求问题不再简单的考虑技术问题,这都是对于自己技术有一个比较靠谱的认知,自信基本都能实现的过程

技术的上限 - 达到上限后- 要么保持一个较高的上限,持续进行技术,要么转入管理  

程序员的自我提升: 

仅仅靠工作的技能提升?  - 实际上是业务相关的技能提升,变得熟悉业务,而疏于技术,自己希望提升技术,但公司不一定有机会给与对应的机会   

程序员的提升 - 做个人项目提升自己,做个人项目不一定要有实际用途,要知道其核心是为了练习以及提升自己的技能   - 项目迭代 

个人项目能让自己对于技术本身保持一个兴趣

程序员的人脉 - 技术威望,有意义的输出知识才能让人关注你的后续输出   

焦虑:  

对未知的恐怖,他人表达的局限化问题 - 如知乎平台的自顶向下的压制性,大V 话语权问题;

互联网技术圈娱乐化...  

泡脑子 - 互联网信息海洋,应该关心于立足于自身的技术圈,那行争论的话题永远也抄不完,切忌陷入工具以及语言的鄙视链中

知识更新 - 总结 - 更新 -总结 ...
