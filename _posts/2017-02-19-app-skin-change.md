---
layout: post
title:  Android 换肤
category: android
keywords: [improvement,android,apk]
---

Android 中换肤是比较常见的大厂应用中的实践，其主要思路在于资源的替换：

资源的替换当然想到的几个主干性问题：

*  皮肤的资源以何种方式提供？应用内？应用外？本地的？网络的？文件格式是什么？也就是资源本身的问题                 
*  如何获取指定的要替换的资源？即资源获取问题                         
*  如何获取要换肤的View？                                   
*  View的那些属性可以进行资源的替换？                        

问题分解之后便可以沿着思路逐一解决，实现想要的效果，换肤的实践本身并不困难，有比较好的实践文章，当然我也沿着敲了一番Demo实践，实践代码见链接，这里主要记录一个问题的思考，大问题的分割，以及如何逐步解决的思考过程；

**结果不重要，重要的是得出结果的过程**

[AppChangSkinDemo](https://github.com/itlipan/AppChangSkinDemo)

---

Quote：

[Android换肤技术总结](http://blog.zhaiyifan.cn/2015/09/10/Android%E6%8D%A2%E8%82%A4%E6%8A%80%E6%9C%AF%E6%80%BB%E7%BB%93/)

[ Android中插件开发篇之----应用换肤原理解析](http://blog.csdn.net/jiangwei0910410003/article/details/47679843)

[张鸿洋老师的App换肤 ](https://github.com/hongyangAndroid/ChangeSkin)
