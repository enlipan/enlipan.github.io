---
layout: post
title:  RN 之 坑记录
category: android
keywords: [improvement,android,css]
---

#### Applicaction RNDemo has not been registered

问题描述：

Invariant Violation:Applicaction 项目名 has not been registered.This is either due to a require() error during initialization or failure to call AppRegistry.registerCommponent.

Fixed：

针对不同的Case有不同解决方案：

1. 针对运行多个Rn项目引起的问题关闭Node，重新运行当前要运行的项目即可解决     
2. 针对 js中注册的项目名称与 src 代码中项目名称不一致的问题则需要修改统一即可 —— [React-Native坑1](http://www.jianshu.com/p/82a09063e61c)             
