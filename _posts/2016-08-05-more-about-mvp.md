---
layout: post
title:  More about MVP
category: android
---

MVP —— 知其然知其所以然

早先已然了解过MVP，也写过一些东西，但是最近回过头来看，阅读了很多新的东西之后，重新有了新的体会，觉得自己早先的理解是片面的，不完善的，所以再次整理理清一些东西，加深体会，故而是知其然知其所以然；

早期的Android开发View与Data无法分割，View与Data之间严重耦合，View与View之间以及View与Data之间的耦合无所不在，这完全不符合单一职责，而对比MV模式，MVP 本质仅仅属于视图层分层结构模型，将View 与Logic Data分离，防止一处修改处处修改，更好的解耦模块，提升功能模块化；解耦的设计与独立的模块更加容易实现单元测试以及协同高效开发；还可以减少内存泄漏的问题，对于之前View与Model处处耦合的Case，很容易导致混乱的Activity的引用问题，进而导致内存泄漏。

MVP到目前为止依旧没有标准化，Github上出了众多的MVP范例，但是官方的MVP Todo Demo虽大有一扫乾坤的意味在里面，但事实上MVP依旧各有所爱的实现方式；

###  MVP

常见的应用架构一般同样采用分层思想，视图层，业务逻辑层，以及数据层；

其中MVP属于视图层组织框架，其他还有很多视图层框架如采用DataBinding的MVVM，传统的MVC，这些都并不干扰其他底层架构；其主要解决View与Data，视图与数据业务逻辑分离的问题；


####  MVP Presenter 处理：


#####  解决 Activity的异常重启恢复情况：

* app configChange      
* 屏幕旋转          
* 系统回收           
* Attach扩展显示器   


>  The Fragment/Activity must be able to re-create its state. Every time you work on a Fragment you must ask yourself how this would behave during orientation change, if there is something that needs to be persisted to the saved instance state Bundle, etc…
>  Long running operations in background threads are very hard to get right. One of the most common mistakes is keeping a reference to the Fragment/Activity in the long running operation (which is needed to update the UI when it finishes). This causes the old Activity to leak (and possibly crash the app due to increasing memory usage) and the new Activity to never receive the callback (and never update its UI).

Activity 的恢复重建过程中，Presenter与新老Activity交互如下：

>  Activity is initially created (let’s call this instance one) - New Presenter is created
Presenter is bound to the Activity
User clicks on the download button
Long running operation starts in the Presenter
Orientation changes
Presenter is unbound from the first instance of the Activity
First instance of the Activity has no reference, is available for garbage collection
Presenter is retained, long running operation continues
Second instance of the Activity is created
Second instance of the Activity is bound to the same Presenter
Download finishes
Presenter updates its view (the second instance of the Activity) accordingly





#### Presenter的职责分发:

很多时候我们写MVP时，有意无意的弱化Model层，Model层没有融合相关的业务逻辑，这样的后果是导致Model层的过度薄弱，而导致Presenter逐渐膨胀，冗余，仿佛以前我们写几千行的Activity中的代码，大部分全部移送到了Presenter中，Presenter变得比较难看；

重新来看看我所理解的MVP究竟各层次是什么？比较常见的定义是：

* View层实现Presenter交付的UI任务，有一个些观点认为View层只负责UI，但这个似乎有点说不通，例如Click事件还是View响应的，只是逻辑交给到Presenter完成，这个角度看 View仿佛是 View与Controller的部分职责合体；

* Presenter作为 Model与View的中间人，将职责分离的二者串联起来，上面说到Click的响应控制依旧由View管理，那么Presenter为什么不接管点击事件呢？因为一旦Presenter负责这类View的事件响应，会导致Presenter与View的界限模糊，想象一下如果有多个View的点击事件响应，Presenter为了区分View与响应事件的对应，那么Presenter势必要对View做出接管控制，知道谁是谁，这样Presenter就控制了View，控制了View的展示，所以二者又重新耦合，无法分割开来。

>  In our opinion the Presenter does not replace the Controller. Rather the Presenter coordinates or supervises the View which the Controller is part of. The Controller is the component that handles the click events and calls the corresponding Presenter methods. The Controller is the responsible component to control animations like hiding ProgressBar and displaying ListView instead. The Controller is listening for scroll events on the ListView i.e. to do some parallax item animations or scroll the toolbar in and out while scrolling the ListView. So all that UI related stuff still gets controlled by a Controller and not by a Presenter (i.e. Presenter should not be an OnClickListener). The Presenter is responsible to coordinate the overall state of the view layer (composed of UI widgets and Controller). So it’s the job of the Presenter to tell the view layer that the loading animation should be displayed now or that the ListView should be displayed because the data is ready to be displayed.

Presetner要立足于足够的层次高度对于整个视图层有一个统筹规划，所以，UI事件的检测都应该由View处理，而对应的事件究竟具体做什么却由Presenter，View充当傀儡角色，完成Presenter所赋予的UI任务；

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

[MOSBY-Model-View-Presenter](http://hannesdorfmann.com/mosby/mvp/)

[TED MOSBY - SOFTWARE ARCHITECT](http://hannesdorfmann.com/android/mosby)

[Android Code That Scales, With MVP](http://engineering.remind.com/android-code-that-scales/)

[How to Adopt Model View Presenter on Android](http://code.tutsplus.com/tutorials/how-to-adopt-model-view-presenter-on-android--cms-26206)

[Android Code That Scales, With MVP](http://engineering.remind.com/android-code-that-scales/)

[Android官方MVP架构示例项目解析](http://mp.weixin.qq.com/s?__biz=MzA3ODg4MDk0Ng==&mid=403539764&idx=1&sn=d30d89e6848a8e13d4da0f5639100e5f&scene=0#wechat_redirect)
