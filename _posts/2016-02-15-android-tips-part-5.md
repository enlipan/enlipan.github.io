---
layout: post
title: Android Tips part (5)
category: android
---




### LoaderManager initLoader VS  restartLoader

虽然Android Doc文档的描叙上二者很相似，但是其实还是有一些区别的：





### ProgressDialog  show（）函数调用之后不显示问题

最近解同事的一个坑，将数据查找放在主线程中，结果当海量数据时出现了Dialog.show()函数调用后进度无法显示的问题；

结论：UI 线程阻塞引起；

Dialog.show()函数调用后，后续的UI线程中操作挤占了 
界面的更改时间，造成界面卡顿，Dialog无法马上显示出来，严重者会出现ANR；

典型的重试可以尝试 ProgressDialog.Show() 之后 Thread.sleep(5000); 进度条不会里面显示出来就是这个原因；