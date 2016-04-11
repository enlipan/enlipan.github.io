---
layout: post
title: Android Provider  Summary
category: android
---

### ContentUri

规则： `content://authority/path/id`

content: ContentResolver.SCHEME_CONTENT (value content://)

authority：用于区分 contentProvider;为了保证应用Provider的的独立标识性，一般使用 应用包名；

path: 一般用于区分所请求的数据类型，根据Provider所提供的数据类别，path可以是0个或多个段落组合而成，最后的一个段落为"twig"；

id: 用于在数据集合中标识数据，一般用于表示表中指定row id数据 ；Id 可以通过 Uri 解析获得：ContentUris.parseId(uri);  


###  UriMather

Uri 工具类，用于构建 Uri 与对应码值的匹配规则，简化Uri的Case构建情况：

通配符：

\# 符号代表任意数字

\* 符号代表任意字符

常量 UriMatcher.NO_MATCH 表示不匹配任何路径




### Provider

Provider安全：

Content Provider Permissions:  自定义权限控制数据的安全性

Example： `<uses-permission android:name="android.permission.READ_USER_DICTIONARY">`

·android:exported=false· 控制数据是否可以被外部应用获取；

`android:grantUriPermissions` 属性：`FLAG_GRANT_READ_URI_PERMISSION` 或者 `FLAG_GRANT_WRITE_URI_PERMISSION`  赋予临时访问权限；

此外还需要防止用户输入数据，SQL注入安全问题；


Provider 数据增删改查：

结合 ContentResover，利用 Cursor 获取数据其中Cursor代表了数据集； Ps：异步CursorLoader必须对应使用 Provider；


ContentValues： 构建Provider的 新增与更新操作；

构建高级条件过滤 sql语句：

`CASE WHEN [condition] THEN [expression] ELSE [expression] END`


其他ProVider形式：

Batch access: 批量事务处理：ContentProviderOperation ——  ContentResolver.applyBatch()

利用 Intent 获取 Provider所提供的数据：获取其他App的功能以及数据辅助，快速构建应用的完整生态系统；

约定类：用于帮助构建 Content URI 以及各类数据库语句的辅助定义类；


### ContentObserver






### 应用升级时表数据迁移的处理

在应用的升级过程中，对于表的更改是非常普遍的，如何在保留数据的情况下，建立新表同时完成老旧数据的完整性迁移非常重要：

很多情况下，我们会使用预留字段去完成数据库的扩展，但是无论如何预留，总会有已有数据库不能满足需求的情况产生；


onUpgrade：调用时机是用户在做应用更新，覆盖安装后启动，如果新版本中数据库版本号要比旧版本中的数据库版本号高则会调用。这时可以在这个函数完成数据库版本升级带来的旧版本的兼容问题，以及数据迁移问题。

升级操作支持：

"ALERT":  更改已有表中字段名，更改表名，或者是在表尾新增字段；

"CREATE": 新建表；

特别Case： 表数据迁移，完全更改表结构，此类情况一般需要适合使用事务操作处理；常用步骤是，更改已有表明为Temp临时表，定义新表，创建表名称为旧表而表结构为新定义的新表，将Temp临时表的数据插入到新表，删除Temp表，至此完成表的替换，数据的迁移；

---

Quote:

[Content Provider Basics](http://developer.android.com/guide/topics/providers/content-provider-basics.html#Permissions)

[Meaning of android.content.UriMatcher](http://stackoverflow.com/questions/26901644/meaning-of-android-content-urimatcher)
