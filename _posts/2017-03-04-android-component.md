---
layout: post
title:  Android 组件化
category: android
keywords: [improvement,android]
---

### 是什麽?

引言:

模块化:

>  Modular programming is a software design technique that emphasizes separating the functionality of a program into independent, interchangeable modules, such that each contains everything necessary to execute only one aspect of the desired functionality.    
>                 
> A module interface expresses the elements that are provided and required by the module. The elements defined in the interface are detectable by other modules. The implementation contains the working code that corresponds to the elements declared in the interface. Modular programming is closely related to structured programming and object-oriented programming, all having the same goal of facilitating construction of large software programs and systems by decomposition into smaller pieces...

模块化以为将庞杂的系统拆分为功能间相互独立的子模块,模块的独立表现在每个模块只包含与其功能相关的内容,通过在模块中接口定义模块的输入与输出,定义模块的使用范围,规约了模块服务于谁,服务于谁干什么,解决了需求的明确问题;面向对象中,我们通常用基于接口编程这一范式来表述;


组件化:

>   component-based development (CBD) :  that emphasizes the separation of concerns with respect to the wide-ranging functionality available throughout a given software system. It is a reuse-based approach to defining, implementing and composing loosely coupled independent components into systems. This practice aims to bring about an equally wide-ranging degree of benefits in both the short-term and the long-term for the software itself and for organizations that sponsor such software.


强调: 将贯穿整个软件系统的的广泛可用设计看待为系统中的核心关注点，通过关注点分离的形式,以基于可重用性重新实现,定义,组合松散在系统各处的功能模块进而构建独立组件;

其实看起来似乎组件化和模块化没啥区别 ...

### 为什么要组件化?组件化优势?解决了当前的什么问题?

简单的说Android 组件化就是将系统的逐渐抽象为多个组件，各个组件有独立版本管理系统，而App仅仅是各组件的集合套壳发布；

- 代码清晰 - 降低代码模块耦合

- 更改隔离- 组件的小版本迭代在不涉及其他组件变动的情况下，测试的迭代将极大的减轻工作量

- 组件复用- 公司内部其他App在开发相关生态时可以灵活选择配置已有组件

- 其他优势-  开发更加专注，能够迅速定位核心，各模块组件间可高效并行开发，减少并行开发过程中的冲突问题，同时产品对于组件的业务也更加清晰，减少大项目系统中各处藕断丝连牵一发而动全身，各产品之间沟通内耗


针对组件的生存状态又有了区分：

- 组件以aar 等lib或model形式生存     
- 组件以application形式在Debug时生存，Release条件下以aar形式生存，有生存状态的切换    

通过判断 Debug状态来切换组件 Model的 application或者 lib状态，我们甚至可以切换 manifest文件：


{% highlight java %}

// 通过配置 Gradle property值区分Debug状态

// 切换Model
apply plugin: 'com.android.library'
apply plugin: 'com.android.application'

// 配置 manifest文件 - 可维护多份用于切换
sourceSets {
    main {
        manifest.srcFile 'src/main/debug/AndroidManifest.xml'

    }
}


// 资源冲突     -  各模块资源添加前缀   

resourcePrefix "moduleName_"

{% endhightlight%}


后者解决了每次一处改动全部编译的问题，极大提升Android下繁琐的编译过程，提升开发调试效率（想必一处修改，5分钟编译谁都是很痛苦的）      


### 如何组件化?


组件的难点在于如何分割区分组件的临界点，一个功能究竟属于这个组件还是另外一个组件，如何界定组件就要求开发者对于组件的理解更加深刻



#### 组件间依赖问题

- 组件的重复依赖问题，多组件同时对某一组件依赖，多组件间互相依赖                
- 组件间通信的方式—— 如果利用传统的显示依赖，组件间类的引用将造成组件之间的高度耦合     


#### 组件间通信：

-  Rooter 路由框架解耦组件显示依赖，强耦合问题；        
-  系统隐式Intent 类型通信，隐式Intent通信，有点像组件间用EventBus通信，其的弊端当组件日渐爆炸式增多，minifest文件会爆炸，后期难以维护管理     
-  schemal 跳转方式



#### 基础类库的初始化

诸多Application的初始化工作如何处理？  


















---

Quote：


[MDCC 2016 - Android](https://www.liaohuqiu.net/cn/posts/mdcc-2016-brief-summary/)

[Android业务组件化开发实践](https://kymjs.com/code/2016/10/18/01/)

[Android架构思考(模块化、多进程)](http://blog.spinytech.com/2016/12/28/android_modularization/)

[Android组件化之通信（多模块，多进程）](http://www.jianshu.com/p/1fc5f8a2d703)

[Android 开发:由模块化到组件化(一)](http://blog.csdn.net/dd864140130/article/details/53645290)

[关于Android业务组件化的一些思考](http://zjutkz.net/2016/10/07/%E5%85%B3%E4%BA%8EAndroid%E4%B8%9A%E5%8A%A1%E7%BB%84%E4%BB%B6%E5%8C%96%E7%9A%84%E4%B8%80%E4%BA%9B%E6%80%9D%E8%80%83/)

[从零开始的Android新项目11 - 组件化实践（1）](http://blog.zhaiyifan.cn/2016/10/20/android-new-project-from-0-p11/)
