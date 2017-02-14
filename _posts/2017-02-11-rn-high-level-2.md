---
layout: post
title:  RN 进阶之起点(二)
category: android
keywords: [improvement,android,react]
---

### RN 组件生命周期

实例化： 属性获取 属性初始化   willMount  render  didMount(Initialization DOM )

存在： setState  receiveProps  shouldUpdate（Re-render on every state change） willUpdate  didUpdate

销毁：  willUnMount


### RNA 启动流程

从mReactRootView.startReactApplication(mReactInstanceManager, "androidrn", null);开始的 RNA 启动流程分析：

[【ReactNative For Android】框架启动核心路径剖析](https://zhuanlan.zhihu.com/p/20807406?refer=magilu)

### RN 通信

Js 与 Native通信

[【React Native for Android】jsBridge实现原理](http://blog.desmondyao.com/rn-bridge/)

[React Native Android 通信原理](https://longv2go.github.io/2016/02/02/react-android-%E9%80%9A%E4%BF%A1%E5%8E%9F%E7%90%86.html)

[其实没那么复杂！探究react-native通信机制](http://zjutkz.net/2016/05/03/%E5%85%B6%E5%AE%9E%E6%B2%A1%E9%82%A3%E4%B9%88%E5%A4%8D%E6%9D%82%EF%BC%81%E6%8E%A2%E7%A9%B6react-native%E9%80%9A%E4%BF%A1%E6%9C%BA%E5%88%B6/)


[React-Native系列Android——Native与Javascript通信原理（一）](http://blog.csdn.net/megatronkings/article/details/51114278)

[ React-Native系列Android——Native与Javascript通信原理（二）](http://blog.csdn.net/megatronkings/article/details/51138499)

---

Quote:

[React.Component](https://facebook.github.io/react/docs/react-component.html)

[给 JavaScript 初心者的 ES2015 实战](http://gank.io/post/564151c1f1df1210001c9161)

[React Native 中组件的生命周期](http://www.race604.com/react-native-component-lifecycle/?hmsr=toutiao.io&utm_medium=toutiao.io&utm_source=toutiao.io)

[React Native组件的生命周期](http://www.jianshu.com/p/2a1571d23cf1)

[React Native入门——组件构成及生命周期简介](http://blog.csdn.net/yuanguozhengjust/article/details/50470171)

---

[云栖社区-React native for Android 初步实践](https://yq.aliyun.com/articles/2757#)

[Bugly-深入源码探索 ReactNative 通信机制](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=663)

[React Native模块桥接详解](http://www.dobest.me/blog/2015/10/16/React%20Native%E6%A8%A1%E5%9D%97%E6%A1%A5%E6%8E%A5%E8%AF%A6%E8%A7%A3/)
