---
layout: post
title:  Flutter Start
category: android
keywords: [improvement,android,java,dart]
---


### 是什么? 

> Flutter is Google’s mobile app SDK for crafting high-quality native interfaces on iOS and Android in record time. 

来自 Google 的跨平台解决方案

#### 优势是什么? 

与 ReactNative 利用 JSbridge 转译为 NativeView 不同, Flutter 使用了 Skia 渲染引擎自行绘制每一帧 UI 组件.同时其优秀的 Hot Reload 能力带来高效的开发效率.


> Compiles to Native Code          
> 
> No reliance on OEM widgets        
> 
> No bridge needed  
> 
> Structural Repainting


### 初体验

#### Install  

[Get Started: Install on macOS](https://flutter.io/setup-macos/)

> 下载 Flutter SDK ,加入 System Path 路径,运行 flutter doctor 命令检测环境



#### 写一个 Demo  

[Write Your First Flutter App](https://flutter.io/get-started/codelab/#step-3-add-a-stateful-widget)

对照 Demo 一行行代码敲下来(禁止使用 Copy/Paste),整体 Doc 看下来对于整个项目结构以及流程能够获取一个初步的认知.


![Flutter Start](http://img.oncelee.com/Flutter.png)


#### Yaml  

Flutter 的项目中我们发现了 pubspec.yaml 文件被用于做配置管理.

> Yaml 是一个可读性高，用来表达数据序列的格式. 

Yaml 巧妙避开引号,括号等封闭符号,而选择使用空白缩进, 利用空白字符以及分行来分割数据.其低廉的解析成本与高可读性,使其尤其适合 Python/Ruby 等脚本语言操作.

Yaml 在多种语言下都有对应的操作库,使其使用非常简洁.yaml 被常用于作为 playbooks (配置管理语言).

Yaml 的基础语法非常简单: 

Structure通过空格来展示。Sequence里的项用"-"来代表，Map里的键值对用":"分隔.


[YAML 学习笔记 ](http://einverne.github.io/post/2015/08/yaml.html)

[YAML 语言教程](http://www.ruanyifeng.com/blog/2016/07/yaml.html)

#### Dart 

[Intro to Dart for Java Developers](https://codelabs.developers.google.com/codelabs/from-java-to-dart/#0)

---

Quote:

[The Magic of Flutter](https://docs.google.com/presentation/d/1B3p0kP6NV_XMOimRV09Ms75ymIjU5gr6GGIX74Om_DE/edit#slide=id.g2480e1310f_0_15)

[Flutter原理简解](https://zhuanlan.zhihu.com/p/36861174)

[Flutter Dart Framework原理简解](https://zhuanlan.zhihu.com/p/37438551)