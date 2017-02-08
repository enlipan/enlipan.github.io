---
layout: post
title:  RN 之 知识节点学习记录
category: android
keywords: [improvement,android,css]
---


环境

编译器

FirstDemo-HelloWord

组件 propers

组件 state

样式 :

>  样式名基本上是遵循了web上的CSS的命名，只是按照JS的语法要求使用了驼峰命名法，例如将background-color改为backgroundColor

组件大小： 固定大小与 弹性Flex大小

>  针对 Flex大小：                   
组件能够撑满剩余空间的前提是其父容器的尺寸不为零。如果父容器既没有固定的width和height，也没有设定大于0的flex值，则父容器的尺寸为零。其子组件如果使用了flex，是无法显示的，但若组件设置固定大小则可以显示

Flex布局：

>  主轴:Flex Direction               
>  子元素沿主轴排列方式:Justify Content       
>  子元素沿着次轴排列方式：Align Items

TextInput:

ScrollView:

> 放置在ScollView中的所有组件都会被渲染，哪怕有些组件因为内容太长没有出现在屏幕中，也依旧被渲染了，这代表着没有显示的组件也消耗了系统资源

ListView：                 

>  对于多项数据而言，放置在ScrollView中的组件都会被立即渲染，而ListView会优先渲染显示在屏幕中的组件；

网络相关：                       

>  获取数据： Fetch     
>  处理返回数据：                
>  网络库： XMLHttpRequest(Ajax)               
>  全双工WebSocket：                  

导航（Navigator）：

>  场景： 场景简单来说其实就是一个全屏的React组件。与之相对的是单个的Text、Image又或者是你自定义的什么组件，仅仅占据页面中的一部分。


基础控件效果熟悉代码：

[ReactNativeNotes](https://github.com/itlipan/RactNativeNotes)

---

Quote：

[RN 中文文档](http://reactnative.cn/docs/0.41/integration-with-existing-apps.html#content)

[RN Doc - 带效果图](https://facebook.github.io/react-native/docs/getting-started.html)
