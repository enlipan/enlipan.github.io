---
layout: post
title:  RN 之 Flexbox 实践
category: android
keywords: [improvement,android,css]
---

弹性盒子在任何显示设备上通过改变其以及其子内容元素尺寸，延展其元素填充屏幕可用空间亦或缩小子元素避免溢出；                 
弹性盒子用于使页面适应不同的屏幕大小以及设备类型，确保在设备变化时，通过调整页面内元素的宽高，从而在任何显示设备上实现内容在屏幕中的最佳填充能力，使内容元素有更恰当的排布；                 


### 弹性盒子：

理解盒子 container + item

*  容器 container            
*  弹性 item                       
*  轴：主轴 | 次轴                          
*  主轴：item沿其排列的的轴                 
*  垂直于主轴的轴为侧轴             
*  方向               
*  行                       
*  尺寸      


### 属性：

*  方向(确定了弹性元素排列的方向) | flex-direction : row | row-reverse | column | column-reverse                 
*  流(设置“flex-direction”和“flex-wrap”的简写，可以同时定义主轴和侧轴) | flex-flow : row | nowrap       
*  换行(控制了容器为单行还是多行。并且定义了侧轴的方向，新行将沿侧轴方向堆砌) | flex-wrap : nowrap | wrap | wrap-reverse           
*  元素顺序(通过将这些元素分配到序数分组来控制它们出现的顺序) | order : 0       
*  主轴对齐方式 “justify-content”属性将弹性元素沿容器主轴方向对齐                          
*  次轴对齐方式 “align-items”设置弹性元素在容器侧轴上的对齐方式                       



### flex 属性快捷表达：

flex:none|[<'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]

flex-shrink 与 flex-basis 属于可选表达属性，如：

flex: 1  ——  flex-grow + 可选属性默认值

flex : 1 2px —— flex-grow + flex-basis

flex: 1 1 auto —— flex-grow  + flex-shrink + flex-basis

---

Quote:

[使用 CSS 弹性盒子](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Flexible_Box_Layout/Using_CSS_flexible_boxes)

[A Complete Guide to Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

[Flex 布局教程：语法篇](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)

[Flex 布局教程：实例篇](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)
