---
layout: post
title:  Android Development Patterns
category: android
keywords: [improvement]
---

Google 系列视频 Android Development Patterns - Building Better App

相关的视频还带有 blog post -- Medium

### 第一季

*   隐式Intent安全校验

*   使用NotificationCompat，更好的设备支持

多样化的 notification Style:

*  Runtime Permissions 适配,CheckPermissions,requestPermissions，回调处理

*  MediaSessionCompat - Android 集成工作

PlaybackStateConmpat

MediaMetadataCompat

*  Toolbar -- More flexible than Action Bar

*  AppBarLayout and scrolling gestures

CoordinatoryLayout + AppBarLayout  + Toolbar

* Search with SearchView

Singletop -- onNewIntent()

SearchManager

*  Navigation Drawer, DrawerLayout, and NavigationView

*  Tabs and ViewPager

PagerAdapter

FragmentPagerAdapter -- 将每个创建的Fragment都加载到内存中，加快切换速度

FragmentStatePagerAdapter -- 需要时可以回收Fragment，保存其State


*   Accessible

contentDescription -- android:contentDescription="@null"﻿

> Provide content descriptions for user interface components that do not have visible text, particularly ImageButton, ImageView and CheckBox components


### 第二季

*  Snackba ：不打扰用户的情况下，可携带动作的Action

与Dialog 区别，Dialog打断用户的交互

与Toast 区别，Toast无法再次携带Action



*  Widget- home Screen

widget 可以用于链接 app 中的二级甚至三级界面，而不应该仅仅是跳转到 mainActivity- icon可以链接到

widget 能够用于处理设置开关


*  Theming with AppCompat

在设计Md中非常常用，能够构建更加符合Google Md规范的app；

colorPrimary : branding  color for app bar

colorPrimaryDark :  darker -- status bar and contextual app bars  &&  sdkversion >= 5.0 的状态栏颜色，深色色阴影

colorAccent :

colorControlNormal ：控制正常状态下的组件状态

  colorControlActivated : 覆盖  colorAccent ，设定如复选框等元素被激活或者选中的状态

colorControlHighlight :控制 Lollipop 以上的波纹颜色

以上的更改都是可以全局更改，而不用自定义每一个组件颜色

android:theam ，修改相关UI组件以及其子View下全部组件主题配置

TheamOverLay ：继承 TheamOverLay.AppCompat 并非全局改动所有Theam属性， 而只修改相关属性

Theam 以及 TheamOverLay 均可用于修改 Activity层级以及View层级的主题

[Theming with AppCompat](https://medium.com/google-developers/theming-with-appcompat-1a292b754b35#.1yhuqxdj4)


*  应用的闲置模式

如何利用调试应用处于闲置模式时情景？

adb shell

设备没有通过Usb与电脑相连

Gcm 的高优先级，可以在闲置模式依旧传送信息至App


* Layout

[Layout](https://medium.com/google-developers/layouts-attributes-and-you-9e5a4b4fe32c#.xx77zcs8l)


* share Content

ShareCompat

利用resoleActivity 校验，防止Crash

不借助 Uri 依赖读写内存分享传送图片

[Sharing Content between Android apps](https://medium.com/google-developers/sharing-content-between-android-apps-2e6db9d1368b#.dlcf6ilod)


*  Direct Share

6.0新特性：更好的用户体验
[Up your app’s sharing game with Direct Share](https://medium.com/google-developers/up-your-app-s-sharing-game-with-direct-share-2a2bc0a9ad36#.lidc3ginr)

* Camera2 Api



*  StrictMode for enforcing best practices at runtime

利用Lint 在编译时优化,检测应用问题

利用StricMod 构建运行时优化

[StrictMode for Runtime Analysis on Android](https://medium.com/google-developers/strictmode-for-runtime-analysis-on-android-f8d0a2c5667e#.qr704ylxb)


###  第三季


* Split-Screen Multi-Window

[Designing for Multi-Window](https://android-developers.blogspot.jp/2016/05/designing-for-multi-window.html?utm_campaign=android_series_multiwindowblog_061616&utm_source=anddev&utm_medium=yt-desc)


---

[Android Development Patterns](https://www.youtube.com/playlist?list=PLWz5rJ2EKKc-lJo_RGGXL2Psr8vVCTWjM)
