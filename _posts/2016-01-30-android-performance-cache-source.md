---
layout: post
title: Android性能优化之缓存
category: android
---
* Tip 1：

[HttpCache 网络缓存](https://www.youtube.com/watch?v=7lxVqqWwTb0&index=1&list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE)

读取内存数据比从网络获取更加迅速，更加减少电量消耗，同时为用户节省流量；如果有些数据需要重复利用，而且同时对于时效更新频率性要求不高，你需要想到缓存这些数据，以便重复利用；

[HttpResponseCache](http://developer.android.com/reference/android/net/http/HttpResponseCache.html?utm_campaign=android_series_#cachematters_for_networking_101315&utm_source=anddev&utm_medium=yt-annt)

HttpCaching默认是关闭的，开启后将用于所有Http响应，以及绑定到应用中的Lib；

缓存是一件复杂的事情，什么东西需要缓存，什么不能缓存，缓存在哪里，缓存多久？都是需要根据实际情况分析的 —— 缓存的管理归根结底是两点：

缓存的管理 与 缓存的业务逻辑：前者解决缓存到哪里，缓存大小，缓存时间，后者解决 什么该缓存什么不该，具体部分的数据各自应该缓存的时间；


缓存的管理一般有两种一种是利用形如：`Http Header —— Cache-Control: max-age = 3600,public`,  通过响应头定义HttpCache存在的有效时间，是否应该缓存；这些都可以由服务器进行控制，在一般的情况下，或者当服务器由你定义，可以与服务器端协调接口定义域缓存定义，完全交给服务器管理缓存是可行的；但当情况复杂起来或者服务器无法由你控制协调，那么就需要你自己定义需要有周密而复杂的缓存管理；

工具：

AS 之 Android NetWork Traffic Tool

ATT_APO tool


经典缓存管理 [LruCache](https://android.googlesource.com/platform/frameworks/base/+/refs/heads/master/core/java/android/util/LruCache.java)的实现：

核心要点：

* 缓存内部实现

* 缓存占用空间大小控制


{% highlight java%}


    private final LinkedHashMap<K, V> map;

    .....

    public LruCache(int maxSize) {
        if (maxSize <= 0) {
            throw new IllegalArgumentException("maxSize <= 0");
        }
        this.maxSize = maxSize;
        this.map = new LinkedHashMap<K, V>(0, 0.75f, true);
    }

    ...

    public final V get(K key) {
        if (key == null) {
            throw new NullPointerException("key == null");
        }
        V mapValue;
        synchronized (this) {
            mapValue = map.get(key);
            if (mapValue != null) {
                hitCount++;
                return mapValue;
            }
            missCount++;
        }
        V createdValue = create(key);
        if (createdValue == null) {
            return null;
        }
        synchronized (this) {
            createCount++;
            mapValue = map.put(key, createdValue);
            if (mapValue != null) {
                // There was a conflict so undo that last put
                map.put(key, mapValue);
            } else {
                size += safeSizeOf(key, createdValue);
            }
        }
        if (mapValue != null) {
            entryRemoved(false, key, createdValue, mapValue);
            return mapValue;
        } else {
            trimToSize(maxSize);
            return createdValue;
        }
    }

    ...

    public final V put(K key, V value) {
        if (key == null || value == null) {
            throw new NullPointerException("key == null || value == null");
        }
        V previous;
        synchronized (this) {
            putCount++;
            size += safeSizeOf(key, value);
            previous = map.put(key, value);
            if (previous != null) {
                size -= safeSizeOf(key, previous);
            }
        }
        if (previous != null) {
            entryRemoved(false, key, previous, value);
        }
        trimToSize(maxSize);
        return previous;
    }

    public void trimToSize(int maxSize) {
        while (true) {
            K key;
            V value;
            synchronized (this) {
                if (size < 0 || (map.isEmpty() && size != 0)) {
                    throw new IllegalStateException(getClass().getName()
                            + ".sizeOf() is reporting inconsistent results!");
                }
                if (size <= maxSize) {
                    break;
                }
                Map.Entry<K, V> toEvict = map.eldest();
                if (toEvict == null) {
                    break;
                }
                key = toEvict.getKey();
                value = toEvict.getValue();
                map.remove(key);
                size -= safeSizeOf(key, value);
                evictionCount++;
            }
            entryRemoved(true, key, value, null);
        }
    }

    ...

    protected V create(K key) {
        return null;
    }

    protected int sizeOf(K key, V value) {
        return 1;
    }

        protected void entryRemoved(boolean evicted, K key, V oldValue, V newValue) {
    }

{% endhighlight %}

数据结构： [LinkedHashMap](https://docs.oracle.com/javase/7/docs/api/java/util/LinkedHashMap.html)与HashMap的区别在于其利用双向链表保存了存入的顺序，或者根据使用的频率重排序；且对于缓存需要根据使用情况，以及为维护缓存容量不断在首尾切换添加，删除操作，利用双向链表结构维护 Entry的有序性是较好的实现方式；

 * get(K key)

  Hash结构的获取数据的方式，但是有一点不同就是当获取失败时，也就是并未存储对应的KeyValue时，会执行Create函数，也当Value与Key存在某些业务逻辑的对应关系时，可以通过复写Create函数完成未Put的Value的生成；

 * create(K key)         


 * sizeOf(K key, V value)      

 通过重写 sizeOf()函数，更加精细的指定 缓存大小的衡量方式，若不重写默认返回1，代表的其实是Entry的数量；

 * put(K key, V value)    

 * trimToSize(int maxSize)        

   移除尾部Entry，直到缓存size小于限制；


 * entryRemoved(boolean evicted, K key, V oldValue, V newValue)

删除Entry的时会执行的函数，若需要则可以重写；需要注意的是函数没有同步，也就是在多线程执行删除时，下一个线程已经进入缓存操作，但是上一个线程的删除回调依旧正在执行；







---

Quot：

[Android Performance Patterns](https://www.youtube.com/playlist?list=PLWz5rJ2EKKc9CBxr3BVjPTPoDPLdPIFCE)

[Android性能优化典范-4](http://hukai.me/android-performance-patterns-season-4/)

[性能优化系列总篇](http://www.trinea.cn/android/performance/)

[详细解读LruCache类](http://www.cnblogs.com/tianzhijiexian/p/4248677.html)

[LinkedHashMap 的实现原理](http://wiki.jikexueyuan.com/project/java-collection/linkedhashmap.html)
