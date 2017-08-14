---
layout: post
title:  Talk About Gradle 
category: android
keywords: [improvement,android,gralde]
---


## 谈谈Gradle 

### 前世今生

Ant 构建 (Make- MakeFile 思路)--target.. 不灵活,XML 脚本对于大型项目难以管理  + 多渠道包配合Shell构建

Maven 定制化构建能力缺乏 - 为解决依赖问题而生;


Gradle 大一统: Gradle 贯穿软件的整个生命周期: 编译(依赖管理 Repo),静态检查,测试,打包,部署(Ant)

Gradle - 基于 Groovy 的 DSL,而Groovy又可以看做是 Java 的超集,兼容 Java ,但同时为了解决 Java 作为强类型编译语言又臭又长的特性引入了一些现代语言特性,比如借鉴 Javascript 的闭包等等诸多语法糖;

DSL - 解决特定领域问题,简单的说就是行话;

Gradle 早期企业用于后端服务端项目编译构建,Google 基于 Gradle Plugin 实现实现移动 App 的构建工具:

[Android Plugin for Gradle](https://developer.android.com/studio/releases/gradle-plugin.html)

Gradle 相关 Api 以及 DSL 过多:

[Google Android 相关 Gradle 内容](https://developer.android.com/studio/build/index.html)


### Gradle 是做什么的

流程化的思路:

要做什么?遇到了什么问题?寻求解决方案,找到方案 - 引入工具,必须先弄明白工具究竟解决了什么问题? 

悲哀之处 - 往往解决问题的同时会引入新问题,这是问题的无尽链条,无法避免;

利弊权衡是一门必修课;

#### Gradle 解决了什么问题?

Ant 与 Maven 的缺陷

DSL-程序员三大古典浪漫之一的领域范畴,DSL 是对领域问题的高度抽象,最常见的 SQL 就属 于DSL,以及 专为 Web 而生的 Ruby on Rails...

通常 DSL 具有简洁性,以及业务紧密联系性,既然是业务高度关联,所以 DSL的目的是专而并非全;DSL试图解决传统编程实践在解决业务领域时的概念不一致性,也就是软件的业务复杂性,利用 DSL对于业务的高度抽象,直接以贴近业务的形式去解决问题,这种简洁性让我们在思维上对对应的业务有很直观的感知,很直观的就知道 DSL 对应的业务逻辑是什么,是解决什么问题;

使用 Gradle 的时候应该有比较深的体会,最开始从 Eclipse 迁移到 Gradle 构建的时候,直接去看大部分东西是能够看懂的...

#### Gradle 带来了什么问题

构建领域壁垒:

* Gradle DSL        
* Gradle Groovy API        
* Gradle Java API       
* Gradle User Guide         
* Android Plugin DSL        
* Groovy ...


 
#### 如何看待Gradle  

Gradle作为构建工具,既然是工具,那么使用时目标需要明确,思路理清,即查即用,不要被庞杂的 api 干扰了思路,事实上 Gradle 的 api 确实是太多了,各种 Android 的 DSL,Gradle 的 dsl,Gradle的Doc,一会儿看看这里,一会儿看看那里,最后过了半天,一句"要看的东西好多啊..."

思路上的错误:

早期对于 Gradle 构建 Android 不熟的时候,很容易陷入一种记忆的困境,比拼经验,这里加一行是啥,那里减一行又是啥,好像这样去做又没啥问题(AS的强大支持,弱化了其DSL门槛),其实还是走了弯路了..

Gradle 是一个构建框架,有其 Api, 有 Doc, 是一个实践工具,用编程的思维去看待,借助其 Api, 查阅 Doc 去完成自己的目的;

我所理解的编程思维本质是一种看待问题,认知问题,建模进而解决问题的逻辑思维,或者简要的说就是对人要做的具体的事,要解决的问题通过抽象进行计算机语言的翻译,其难点在于理解问题,分解问题,翻译问题;

###  实例  

一个简单的实例:

解决 RN依赖的问题:

* 如果只 compile 一个版本需要在各个阶段不停的修改的问题   
* 如果写多个 compile 又会造成 build文件膨胀, less is more (11 * 4  = 44)

如何解决?

1. 动态添加依赖 - DependencyResolutionListener


2. 解决构建版本:

思路 A - 从 TASK 角度:   



思路 B - 从 compile 依赖角度:


### 横向对比

**[Buck](https://buckbuild.com/)** 

利用 Python,Buck 基于 Java 实现,在编译时开启 Python 环境用于 Buck 执行 -- FaceBook && Wechat;

Buck 禁止循环依赖(同 Gradle),默认禁止传递依赖(差异),并行构建-速度快,但侵入性强...

Gradle 的在新特性的支持上相对较慢:

如:Cache ... 

Gradle 目前也在3.5之后引入了支持 (Cache Beta),而对比Buck 的 Cache支持,,Gradle的开发团队是SOHO远程开发...员工入职都不用去公司报道的...

> With the build cache feature enabled, if Gradle can find that key in a build cache, Gradle will skip task execution and directly copy the outputs from the cache into the build directory.

顺带说一下 Gradle 针对Cache 以 输入 Task为 Key 缓存,如果在输入 Task 时,用这个 Key 找到了这个输出的 Build Cache,那么直接使用这个 Cache;

但是无论如何, Gradle 毕竟是亲儿子, Google 钦定,提供了一整套解决方案,基本上我们常见的问题都有对应的解决方案,特殊问题也大多可以通过自定义实现;


### 更多的新特性

更快的 up-to-date 检查,避免无用编译,稳定的增量编译,以及并行的依赖下载...

Android tools 更新, dex 压缩, code 压缩...

新的依赖管理 Api 










