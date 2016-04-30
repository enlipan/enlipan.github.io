---
layout: post
title: Android CustomView 卫星菜单
category: android
keywords: [android, viewgoup,animation]
---

自定义View写过一些，但是自定义ViewGroup一直写的不多，上次还是写流式布局，一直想着写一个自定义ViewGroup 来总结一下自定义ViewGroup相关的，恰恰看到Mooc上的hyman老师的分享，想着自己先写一下，遇到问题再看看视频，看完再复盘回顾，自己总结一下，于是有了这一篇文章，写的过程中还是遇到一些细节性问题的，非常感谢hyman老师的讲解；

###  自定义View的相关内容

View的自定义之所以复杂是由于其涉及的知识点较多，但是只要掌握庖丁解牛之法，逐一分割还是有应答之法的：

*  View的自定义首先应该仔细分析View的状态，View的绘制分为两部分，View的绘制显示以及View的动作Action监听，分析后确定正确的思路，要 知道图形的绘制方法万千，挑选一项合适的；        
*  根据所拆分的View绘制情况，定义好 所需要的 View属性，确定哪些属性是需要自定义的，进而编写 attrs.xml 自定义属性                         
*  属性确定后，考虑如何在初始化之时针对各类情况获取所定义的各项 View 的属性的值，同时校验检查属性值获取正确与否                
*  开始View的绘制相关的操作定义，明确View的绘制核心是 View位置的确定，以及View 内容的绘制，位置的确定 针对ViewGroup 应该聚焦于 利用 onMeasure 以及 onLayout 函数自定义子view的测量与自定义布局，而针对View则主要是利用 onMeasure 确定View本身的位置                        
*  在View的内容绘制阶段，一般也针对ViewGroup 与 View分开考虑，ViewGroup 一般在 确定好子View的位置状态后，将View的绘制 交给各个子View自身绘制，这一点并不复杂，而View的绘制则一般需要重写 onDraw 函数，利用 画板进行内容的组合与绘制处理                                      
*  至此，View的显示一般告一段落，随后进行 View行为的确定，自定义View行为 需要清晰的知晓 View的事件分发流程与机制，具体是指知道 View的事件拦截，View的事件分发与处理机制，View的滑动处理等等           
*  View 的绘制与行为都确定后，自定义 View的血肉与枝干都填充完毕                            

除以上内容自定义View的内容还涵盖， 诸如：Canvas，Animation，Animator等等一些列内容，以及一些数学知识，所以自定义View是复杂的，是需要练习的，状态要一步步分割，东西要一点点完成，按照流程练习，复盘回顾总结，还是有套路可以寻找的；

###  自定义卫星菜单 View的实践

以下进行 卫星菜单的自定义：
