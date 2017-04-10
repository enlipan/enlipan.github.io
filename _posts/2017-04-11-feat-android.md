---
layout: post
title:  Android O 以及 AS 2.3
category: android
keywords: [improvement,android]
---


### Android O 的一些重大变化新特性：

[What's New in Android O for Developers](https://www.youtube.com/watch?v=63pKwVE4Uog&list=LLblZ2nB49SNyb3om95s3uzg&index=1)

#### 后台运行限制

后台运行的限制，提升系统可用Ram，提升系统流畅性，主要限制在以下几个方面：

* 隐式广播

隐式广播更加严格的管理，在manifest中声明的大量隐式广播将不再有效，但依旧可以使用运行时注册广播监听隐私intent的方式获取通知；

* Background Service

针对后台Service的管理变得严格，当应用不再前台工作时，后台Service将只能存在短暂的时间就会被系统kill，除此之外，应用不在前台时无法利用StartService或者pendingIntent启动Service；

* 后台位置通知限制

应用在后台时，对于位置的变化通知，一个小时之内将只能收到有限的几次，具体几次由系统决定；

#### NotificationChannel

通过定义Channel，可以让用户精细化管理应用的各类 Channel通知，而非同意管理一个App的所有通知

#### Autofill

可作为管理器管理用户重复信息，便于各类信息设置，可用于存储保持用户数据，如 地址，用户名，密码等



### AndroidStudio 2.3

[Android Studio 2.3](http://developers.googleblog.cn/2017/03/android-studio-23.html)

#### 重要特性：

* App Links Assistant

Android M 以上的用户点击链接唤起Native App的配置工具，管理App内页面与url的映射关系；

[Add Android App Links](https://developer.android.com/studio/write/app-link-indexing.html)

[Handling App Links](https://developer.android.com/training/app-links/index.html)

* WebP PNG图片转换支持

* 约束布局 ConstraintLayout
