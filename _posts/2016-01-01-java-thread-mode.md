---
layout: post
title: Java 多线程使用模式
category: android
---

关于非Double 、非Float类型的原子变量，**Java保证在对应线程中返回的值是该线程中存储的对应变量的值，** 但是  **并不能保证一个线程写入的值对于另一个线程也是可见的** 

同步保证了线程之间的 **可靠** 通信

















---

顺带提一个遇到的小Tip：

关于Collections.copy();函数的OutOfIndex问题； 


---
