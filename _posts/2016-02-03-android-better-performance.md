---
layout: post
title: Android 优化Tip(1)
category: android
---

### 内存优化

#### [SparseArray](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/util/SparseArray.java)

SparseArray 是什么？

SparseArray用于存储 以 int型为Key的 Key——Value 结构，对应于 HaspMap<Integer,Value>;

SparseArray其数据保存在一个对应的 Value数据中， 利用二分法搜索对应Key值所在位置；因而其牺牲了对应于Hash结构的查找效率，而节省了内存消耗，观察O(N) 与 O(logN)性能曲线，在小数据量时，其性能差异与 Hash结构不大，正如Google所推荐的 适用于小数据量情景；

SparseArray 为什么节省内存？


* SparseArray 内部数据省去了 装箱操作    
* SparseArray 直接利用二分法存储数据对象到指定的 int 位置，不同于HashMap结构 存储 Entry<K,V>节点 —— Entry 存放到对应Hash值位置；



#### [ArrayMap](https://android.googlesource.com/platform/frameworks/support/+/refs/heads/master/v4/java/android/support/v4/util/ArrayMap.java)

普通的ArrayMap是在 API19加入，Google提供了 V4 包兼容 ArrayMap；

ArrayMap利用二分法插入删除数据，推荐用于小数据量Map结构,与 SparseArray 所不一样的是其 Kay 并不限定为 int型数据，所以可以在更多情景下被用于替代 HaspMap结构；


### Sql 优化


批量操作与事务操作:


* ContentOptionBuilder    
* SQLiteDatabase.beginTransaction()      



**todo**




---

[性能优化之数据库优化](http://www.trinea.cn/android/database-performance/)
