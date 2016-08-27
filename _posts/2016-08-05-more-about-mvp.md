---
layout: post
title:  More about MVP
category: android
---

MVP —— 知其然知其所以然

早先已然了解过MVP，也写过一些东西，但是最近回过头来看，阅读了很多新的东西之后，重新有了新的体会，觉得自己早先的理解是片面的，不完善的，所以再次整理理清一些东西，加深体会，故而是知其然知其所以然；

早起的Android开发View与Data无法分割，View与Data之间严重耦合，View与View之间以及View与Data之间的耦合无所不在，这完全不符合单一职责，而对比MV模式，MVP 本质仅仅属于视图层分层结构模型，将View 与 Data分离，防止一处修改处处修改，更好的解耦模块，提升功能模块化；解耦的设计与独立的模块更加容易实现单元测试以及协同高效开发；

###  MVP


Mvp属于视图层框架，并不干扰底层架构；


####  MVP Presenter 处理：


#####  解决 Activity的异常重启恢复情况：

* app configChange      
* 屏幕旋转          
* 系统回收           
* Attach扩展显示器   


#### Presenter的职责分发:

很多时候我们写Mvp时，有意无意的弱化Model层，Model层没有融合相关的业务逻辑，这样的后果是导致Model层的过度薄弱，而导致Presenter逐渐膨胀，冗余，仿佛以前我们写几千行的Activity中的代码，大部分全部移送到了Presenter中，Presenter变得比较难看；

我们重新来看看Mvp究竟各层次是什么？比较常见的定义是：

* View层实现Presenter交付的UI任务，有一个些观点认为View层只负责UI，但这个似乎有点说不通，例如Click事件还是View响应的，只是逻辑交给到Presenter完成，这个角度看 View仿佛是 View与Controller的部分职责合体；

* Presenter作为 Model与View的中间人，将职责分离的二者串联起来，上面说到Click的响应控制依旧由View管理，那么Presenter为什么不接管点击事件呢？因为一旦Presenter负责这类View的事件响应，会导致Presenter与View的界限模糊，想象一下如果有多个View的点击事件响应，Presenter为了区分View与响应事件的对应，那么Presenter势必要对View做出接管控制，知道谁是谁，这样Presenter就控制了View，控制了View的展示，所以二者又重新耦合，无法分割开来。

* Model究竟应该负责哪些任务？Model不等于我们常常提到的model，model指单纯的UI data，而Model应该是业务逻辑与model的混合体，需要完成对原生Data的处理，将UI展示需要的Data处理之后由Presenter传递给View；所以Model必然和业务逻辑二者不是孤立起来的；一个比较合适的范例是：UI需要展示A数据，将数据的请求交给Presenter，Presenter寻求Model的数据支持，无论数据存储在数据库或者网络中还是缓存中，(数据库，网络或者缓存数据的存储不属于视图层MVP的统治范畴)，如果数据的存储的a类型，与A类型不符合，这个业务相关的数据处理很多人喜欢交给Presenter处理，但实践下来，认为数据的处理不应该与获取分割，应该由Model处理，这样的优势在于Presenter的逻辑更加清晰，不会使Presenter过度膨胀，丰富了Model的功能，事实上Model本来就是属于视图层，与UI一体的，不应该过多的考虑Model的多界面复用问题，而过度弱化其与UI的联系；

以上的一些想法，我考虑了很多，一方面结合Web开发时 使用SpringMVC的考虑，Data的处理本身无法孤立起来，本来一个具体的Activity结合对应Presenter以及Model比较常见；Model与Activity的联系完全割裂很痛苦；

下面是一个实例，如：












[GitHubDemo-BaseMvp](https://github.com/itlipan/BaseMvp)


---

Quote：

[Architecting Android…The clean way?](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)

[The Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)

[Android Application Architecture](https://labs.ribot.co.uk/android-application-architecture-8b6e34acda65#.9qla1x5h3)

[Presenter surviving orientation changes with Loaders](https://medium.com/@czyrux/presenter-surviving-orientation-changes-with-loaders-6da6d86ffbbf#.6jdmawbf9)

[Introduction to Model View Presenter on Android](https://github.com/konmik/konmik.github.io/wiki/Introduction-to-Model-View-Presenter-on-Android)

[Model-View-Presenter](http://hannesdorfmann.com/mosby/mvp/)

[How to Adopt Model View Presenter on Android](http://code.tutsplus.com/tutorials/how-to-adopt-model-view-presenter-on-android--cms-26206)

[Android Code That Scales, With MVP](http://engineering.remind.com/android-code-that-scales/)

[Android官方MVP架构示例项目解析](http://mp.weixin.qq.com/s?__biz=MzA3ODg4MDk0Ng==&mid=403539764&idx=1&sn=d30d89e6848a8e13d4da0f5639100e5f&scene=0#wechat_redirect)
