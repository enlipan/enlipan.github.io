---
layout: post
title: Android-Storage
category: android
---

###Android存储介绍















###Android存储使用





####openFileOutPut || openFileInput

openFileOutPut || openFileInput  操作的文件目录直接位于 该App安装目录下：data/data/pkgname/file

MODE_PRIVATE：该模式是默认的，通过该模式创建的文件是私有的，即只能被应用本身访问。注意：在该模式下写入的内容会覆盖原有的内容。
MODE_APPEND：与上个模式类似，但在写入内容时会检查待创建的文件是否存在。若文件已被创建，则往该文件中追加内容，而不是覆盖原来的内容；若文件未被创建，则创建新的文件。
MODE_WORLD_READABLE：表示当前创建的这个文件允许被其他应用读取。
MODE_WORLD_WRITEABLE：表示当前创建的这个文件允许被其他应用写入。





---

Quote:

[Data Storage](http://developer.android.com/guide/topics/data/index.html)

[Storage](http://source.android.com/devices/storage/index.html)

[安卓文件存储使用参考](http://www.cnblogs.com/liaohuqiu/p/3532925.html)

[文件操作详解以及内部存储和外部存储](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2013/0923/1557.html)

[Android中的数据存储](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2014/1204/2104.html)

[Storage最佳实践](http://www.lightskystreet.com/2015/06/07/google-for-android-6-storage/)