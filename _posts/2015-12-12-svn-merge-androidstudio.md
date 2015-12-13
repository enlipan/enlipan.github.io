---
layout: post
title: AndroidStudio Merge代码Tip
category: android
---

多版本开发中Merge代码确实是一件烦人的事情，但是AS确实提供了比Eclipse更好的体验，简化了很多工作。

目前的代码结构是保持Trunk中代码的稳定性，确保是随时上线状态。其他分支Branch在开发稳定测试通过后Merge到Trunk中，一个版本的开发由于要合并其他版本新特性，可能涉及到多次Merge，Merge的高效是很有必要的。


AS 中的Merge：

一般我们合并时，逐个Lib合并，针对某个Lib：、

> 右键
> 
> > SubVersion   
> >   
> >   >  Integrate  Directory    
> >   >  
> >   >  >  在此处 有上下：Source 1  与Source 2 选择，针对选择要合并的Lib选择同 Url分支下的**Source 1——起始位置**  与 **Source 2——结束位置**，最终将起始与结束位置之间的代码合并到指定Lib中，最终完成代码的合并。当然冲突的解决是不可避免的，一般需要多人协同解决，确认取舍与合并情况。