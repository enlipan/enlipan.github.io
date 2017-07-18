---
layout: post
title: Android VSYNC
category: android
keywords: [java, android, improvement]
---

VSYNC 

> VSYNC stands for vertical synchronization and it's an event that happens every time your screen starts to refresh the content it wants to show you.
> Effectively, VSYNC is the product of two components Refresh Rate (how fast the hardware can refresh the screen), and Frames Per Second (how fast the GPU can draw images), and in this video +Colt McAnlis walks through each of these topics, and discusses where VSYNC (and the 16ms rendering barrier) comes from, and why it’s critical to understand if you want a silky smooth application.

在理解VSYNC必须要知道两个概念也就是—— 屏幕刷新率以及帧速率，其中屏幕的刷新率属于硬件参数，这个在我们购买显示器时是会经常关注的概念，60HZ或者144HZ刷新率指的就是这个。而我们知道屏幕实际显示的内容却是由一帧帧的图像连贯组成，每秒帧图像画面绘制的速率称之为帧速率，这是由GPU(显卡)绘制的；  

看起来似乎二者并不关联，各自工作，但是二者如果不通信各自为政，那么工作起来是不确定彼此之间的状态的；

我们知道帧是由像素点构建而成，而屏幕绘制一帧画面时，像素点是一行一行逐行填充的；硬件显示屏通过获取CPU运算得到的帧数据刷新绘制显示；理想情况下当显示器绘制显示完一帧数据后再显示器再次刷新时能有新的一帧准备好的数据以供读取显示；

如果屏幕的刷新速度较快，而帧画面绘制速度较慢，将导致屏幕刷新时帧图像还未准备好，该帧画面数据CPU并未完全渲染准备好，此时屏幕刷新绘制帧数据将导致显示出半个帧的数据以及半个帧的老数据，也就是屏幕刷新输出图像时对应的数据是由新旧数据混合的一帧画面，画面刷新到屏幕上表现为屏幕画面撕裂；

反之，如果帧画面绘制速率较快，而屏幕图像绘制较慢，将导致有一些渲染的帧画面无法全部显示在屏幕上，出现跳帧现象；

本质上上述现象的出现源于二者之间无通信同步过程，而垂直同步就是用于二者刷新显示的同步；GPU在载入新的一帧画面数据时需要等待屏幕逐行绘制完前一帧数据;而如果GPU较为强大，GPU渲染的速度快于屏幕的刷新绘制速度，在没有接受到垂直同步信号时，GPU将hold暂停渲染，等待屏幕绘制；

这里有一个Android中的双缓存(三缓冲)概念，GPU绘制的数据直接输出到 `Back Buffer` ，而屏幕的数据读取来源于 `Frame Buffer`；一旦接受到垂直同步信号，帧数据从 `Back Buffer` 复制传输到 `Frame Buffer`;而垂直同步实际上就是帧缓冲切换的过程；

通常情况下Android绘制使用双缓冲，但是双缓冲在某些Case下有着致命局限，一旦某一帧数据的GPU绘制过程在垂直同步信号到达时还未准备好，而屏幕为了不显示空白，会继续展示前一帧的数据，因而前一帧的数据在屏幕而言继续处于显示使用中状态，而只有在垂直同步信号到达时，帧数据才能进行缓冲切换，`Back Buffer`中的数据在被输出显示之前也同样处于使用中状态，在此时 GPU 以及 CPU的图像数据处理操作将被 Hold住，进一步导致系统变慢 —— 也就是所谓的 “一步慢步步慢”，这时若引入三缓冲，在`Back Frame` 构建完成之后，创建新的第三个缓冲数据，充分利用GPU时间资源，在输出跳帧之后系统显示输出常态化，挽救显示问题； 

但三倍缓冲会引入一些输入延迟问题，所以三倍缓冲并不能成为常态，只能作为救急先锋存在；

---

Quote:

[Android性能优化典范之Understanding VSYNC](http://www.jianshu.com/p/59ad90bff2a7)

[Android性能优化典范](http://hukai.me/android-performance-patterns/)