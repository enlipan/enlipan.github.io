---
layout: post
title: Android 高阶要点
category: android
---

开源框架：

RxJava、okHttp、EventBus、DataBinding、Image —— Glide、Fresco、Volly

开源项目：

android-UniversalMusicPlayer、iosched、开源中国App

---

自定义控件

自定义手势

自定义动画

---

Android 优化：

网络优化

> 多请求打包捆绑 —— 减少移动网络被激活的时间与次数 —— 数据批处理
>
> 数据预处理
>
> 不应该使用Polling(轮询)的方式去执行网络请求 —— 服务器推送
>
> 数据的压缩传输


UI 优化             

> 开发者调试工具： GPU Rendering  
>
> 过度绘制调试
>
> SysTrace
>
> TraceView


内存优化

> OOM 以及 GC 要谨慎对待
>
> 注意图片对象以及集合对象
>
> 内存泄漏问题


其他优化：

> 开发者选项： 严格模式——Strict Mode —— 打开Strict Mode选项，如果程序存在潜在的隐患，屏幕就会闪现红色。

---

Http长连接

https抓包


消息推送机制

---

Json解析 —— 反射构造实体对象





**工程的本质是出活**
