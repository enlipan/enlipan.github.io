---
layout: post
title: ContentProvider小结
category: android
---

ContentProvider是一个用于应用向外部分享数据的应用组件，借由其定义的相关URI路径，其他应用能获取该应用中产生并存储的数据。URI均以`content://`开头，相关链接定义于 `android:authorities`。其他应用在访问时必须指定正确链接完成应用。其数据源来源多样化，可以是本应用中的SQL数据，File数据等等。Android系统基于在安全性的考量，目前如果要分享数据到其他应用则一定需要`android:exported=false|true`标签.

当确定是否需要使用ContentProvider的三个原则：

>*You want to offer complex data or files to other applications.
> 
>*You want to allow users to copy complex data from your app into other apps.
> 
>*You want to provide custom search suggestions using the search framework.

如果数据仅仅在应用之中使用，那么直接使用SQLite就可以，而不需要多余的ContentProvider。

---

[Creating a Content Provider](http://developer.android.com/guide/topics/providers/content-provider-creating.html)

[Android SQLite database and content provider - Tutorial](http://www.vogella.com/tutorials/AndroidSQLite/article.html#contentprovider)