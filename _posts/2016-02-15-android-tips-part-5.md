---
layout: post
title: Android Tips part (5)
category: android
---

### ProgressDialog  show（）函数调用之后不显示问题

UI 线程阻塞引起；

show()函数的调用，以及界面的改变有一个过程，也就是UI 帧数问题，后续的UI线程中操作挤占了 
界面的更改时间，造成界面帧数降低，无法马上显示出来

典型的 可以尝试 ProgressDialog.Show() 之后 Thread.sleep(5000); 进度条不会里面显示出来就是这个原因；