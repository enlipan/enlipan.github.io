---
layout: post
title:  More about MVP
category: android
---

MVP —— 知其然知其所以然

早先已然了解过MVP，也写过一些东西，但是最近回过头来看，阅读了很多新的东西之后，重新有了新的体会，觉得自己早先的理解是片面的，不完善的，所以再次整理理清一些东西，加深体会，故而是知其然知其所以然；

MVP 本质仅仅属于视图层分层结构模型，将View 与 Data分离，防止一处修改处处修改，更好的解耦模块，提升功能模块化；解耦的设计与独立的模块更加容易实现单元测试以及协同高效开发；

###  MVP





####  MVP Presenter 处理：


#####  解决 Activity的异常重启恢复情况：

* app configChange      
* 屏幕旋转          
* 系统回收           
* Attach扩展显示器   













---

Quote：

[Architecting Android…The clean way?](http://fernandocejas.com/2014/09/03/architecting-android-the-clean-way/)

[The Clean Architecture](https://8thlight.com/blog/uncle-bob/2012/08/13/the-clean-architecture.html)

[Android Application Architecture](https://labs.ribot.co.uk/android-application-architecture-8b6e34acda65#.9qla1x5h3)

[Presenter surviving orientation changes with Loaders](https://medium.com/@czyrux/presenter-surviving-orientation-changes-with-loaders-6da6d86ffbbf#.6jdmawbf9)

[Model-View-Presenter](http://hannesdorfmann.com/mosby/mvp/)

[How to Adopt Model View Presenter on Android](http://code.tutsplus.com/tutorials/how-to-adopt-model-view-presenter-on-android--cms-26206)

[Android Code That Scales, With MVP](http://engineering.remind.com/android-code-that-scales/)

[Android官方MVP架构示例项目解析](http://mp.weixin.qq.com/s?__biz=MzA3ODg4MDk0Ng==&mid=403539764&idx=1&sn=d30d89e6848a8e13d4da0f5639100e5f&scene=0#wechat_redirect)
