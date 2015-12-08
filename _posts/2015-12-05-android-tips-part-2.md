---
layout: post
title: Android Tips Part(2)
category: android
---

1.  资源整理：

在大规模字符串以及文件整理时，特别是替换工作时，整理完成之后，需要`Build-Clean Project`，否则会导致旧的资源文件存在一些残留影响，隐藏集成出现的一些错误，一不小心，认为是正确的并提交之后会导致Jenkins库编译问题。


2. 关于ListView中Item 之间的1px间距线:

1px的View 有时候在某些手机的显示问题，但是在设置了itemView的padingBottom或者MarginBottom之后，能够显示出来了，很奇怪的问题；

3.  Android中过度的Getter和Setter影响性能：

这点可以利用TraceView进行性能测试，结论：慎重使用Getter、Setter；

4. Canvas的save和restore： 

Save与Restore之间往往是Canvas特殊操作，如旋转之类；而当restore()之后，这些特殊操作只对于Save之后的Canvas新增组件有效。save时的之前那些Canvas组件的保存状态都会一一恢复保存时的状态，包含位置等。也就是若没有Save，那么Save与Restore之间的操作会如实展示。

同时需要注意的是：Save的次数要大于或等于Restore次数，若调用Restore无法对应到合适Save保存操作，将会导致Crash；

Save与Restore是Canvas状态 入栈出栈的体现，Save时Canvas状态保存入栈，反之亦反；












---

Quote：

[Understanding save() and restore() for the Canvas Context](http://html5.litten.com/understanding-save-and-restore-for-the-canvas-context/)

[Why do we use canvas.save or canvas.restore?](http://stackoverflow.com/questions/3051981/why-do-we-use-canvas-save-or-canvas-restore)