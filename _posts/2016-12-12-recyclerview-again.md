---
layout: post
title:  再看RecyclerView
category: android
keywords: [improvement,android]
---

RecyclerView洋洋洒洒万余代码，虽然各种使用似乎没什么问题，但总觉得细细思考又觉得哪里不明白，自己也说不出来—— 说不出来就是有盲点，也就是自己还没有掌握其核心，所以最近想着回过头来重新回顾一下其核心知识：

RecyclerView 针对ListView的改进设计：

*  核心功能通用设计     
*  强大的功能扩展与可自定义化程度        
*  更加灵活的Adapter 适配 —— 分离View的创建与数据的绑定 | 具体的Item Change Position<不再One Change，Notify All>   

###  RecyclerView核心知识

RecyclerView 主干知识结构图：

{:.center}
![RecyclerView](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20161212/RecyclerView.png)

事实上简单一句话说就是，Adapter将抽象的DataList转换成RecyclerView这一ViewGroup对应需求的的每一个填充了DataList的ItemView，并结合LayoutManager Add到RecyclerView中显示出来；

具体到细节问题就比较丰富了 有CachView，有Recycler以及RecyclerPool，LayoutManager的实现，Animator的实现，clickPosition....

需要指出的两点说明：

一者就是有一段时间我自己都混淆的概念问题，这里说的抽象的DataList，是涵盖了Header与Footer等这些可能实际使用中并不在 List<T> 之列的额外数据，这个抽象的DataList的Size由 getItemCount指定，这也就解释了 onBindViewHolder的position的注解为什么是 —— “The position of the item within the adapter's data set.” ，明明 Header的Data position没有在List<T>之中这一疑惑.

二者AdapterPosition 与 LayoutPosition的差异问题，由于Data的变化可以是同步的，在下一次 OnLayout之前可能会造成二者Position不同步的问题，所以AdapterPostion一般能够很好的代表该Position的数据DataItem，而LayoutPosition则更适用于定位该Position相邻位置的View情况。同时我们也应该尽可能避免直接适用onBindViewHolder中的position《该Position在涉及到相关的插入删除但还未刷新时造成Position不同步的问题》而应该使用holder.getAdapterPosition() —— 详情参见 GoogleIO视频(结束前三分钟左右)


###  RecyclerView 源码—— 类ViewGroup





















---

Quote:

[RecyclerView源码分析(一)](http://www.jianshu.com/p/9ddfdffee5d3)

[深入浅出 RecyclerView](http://www.kymjs.com/code/2016/07/10/01)

[Android ListView与RecyclerView对比浅析--缓存机制](http://dev.qq.com/topic/5811d3e3ab10c62013697408)

[RecyclerView ins and outs - Google I/O 2016](https://www.youtube.com/watch?v=LqBlYJTfLP4)
