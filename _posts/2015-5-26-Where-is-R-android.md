---
layout: post
title: Android Studio R文件位置
category: android
---

也许是因为R文件的关键性，为了防止新手无端操作R文件，Androidstudio将R文件藏得层次有点深，第一次也让我一顿好找，发现一种方法很简单就能找到。

一种常规的方法是调整层次为`Project`(默认层次是`Android`)，在目录中一层层寻找，依次是:

> `Project`                 
> > `app`                
> > > `build`          
> > > > `generated`             
> > > > > `source`           
> > > > > > `r`            
> > > > > > > `debug`             
> > > > > > > > `R`                                 

![效果图](/assets/img/20150526/project.png)



另一种发现的简单方法是调整层次为`Packages`

![效果图](/assets/img/20150526/packeges.png)