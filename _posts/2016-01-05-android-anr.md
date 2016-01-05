---
layout: post
title: Android ANR
category: android
---

#### 要点：

* ANR 产生原因

主UI线程中，过多的长时间操作，阻塞UI线程，使UI事件无法更新，系统抛出ANR Dialog；一般涉及网络，数据库，锁，或大量计算（低效数据算法）；

需要注意的是 View.post(Runnable)以及RunUIThread()等函数是运行在UI线程中,过多耗时处理同样ANR；

* 如何避免 ANR 



* /data/anr/traces.txt文件 分析；

---

Quote:

[说说Android中的ANR](http://droidyue.com/blog/2015/07/18/anr-in-android/)

[如何分析 ANR 的原因](http://xiazdong.me/2015/09/11/how-to-analysis-anr-problem/)

[ANR完全解析](http://blog.saymagic.cn/2014/09/25/ANR%E5%AE%8C%E5%85%A8%E8%A7%A3%E6%9E%90.html)