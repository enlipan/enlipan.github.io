---
layout: post
title: Data Store and Share
category: android
---
SQLite命令行：

{% highlight sql%}
sqlite:
//建立数据库
sqlite3  example.db  
//查看建表语句
.schema
//命令行中 ，开启列名显示
.header on
{% endhighlight %}

Android数据库使用：

* 设计表结构

范式或者反范式，混合type 以及自定义subtype 混合存储数据，根据应用情况选取；

{:.center}
![db-option-data](/assets/img/20160110/db-option-data.PNG)

{:.center}
![db-query](/assets/img/20160110/db-query.PNG)

* 构建Entry (JavaBean)

JavaBean让我们能以操纵Java对象的方式操纵底层数据库数据，属于桥梁类；

一般除了数据库表中字段外，我们还需要定义：CONTENT\_URI || CONTENT\_TYPE || TAB\_NAME 等基础自定义字段，以便后期我们能够自定义一些针对自应用ContentProvider的搜索查找操作；

其实 Android系统提供了一些Provider来共享系统数据，当获取了相应权限之后，我们便可以方便的操纵系统内置相应功能如：系统联系人，系统相册，系统Video库等；



{:.center}
![created-provider](/assets/img/20160112/created-provider.PNG)

{:.center}
![content-provider-join](/assets/img/20160112/content-provider-join.PNG)




---

[Datatypes In SQLite Version 3](http://www.sqlite.org/datatype3.html)

[How to develope Android---Google](https://www.udacity.com/course/viewer#!/c-ud853)