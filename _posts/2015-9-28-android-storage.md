---
layout: post
title: Android-Storage
category: android
---

###Android存储介绍


一个问题既可以用数据库解决也可以用文件缓存解决，如何取舍需要慎重，数据库在代码中使用会觉得很方便，文件的缓存看起来更加复杂，但是考虑到对于性能的影响，数据的使用属于重量级应用，需要慎重。


文件路径的设定应该避免使用硬编码，就如同幻数一样的存在，尽量利用超级Contex获取。


###Android存储使用

####内建存储：

内建存储一般指内部data区间，`/data/data/com.packagename`,需要root权限才能外部操纵其读写权限。

getDataDirectory():

getFilesDir():获取内部存储根节点存储目录。

getCacheDir():


####openFileOutPut || openFileInput

openFileOutPut || openFileInput  操作的文件目录直接位于 该App安装目录下：data/data/pkgname/file

MODE_PRIVATE：该模式是默认的，通过该模式创建的文件是私有的，即只能被应用本身访问。注意：在该模式下写入的内容会覆盖原有的内容。
MODE_APPEND：与上个模式类似，但在写入内容时会检查待创建的文件是否存在。若文件已被创建，则往该文件中追加内容，而不是覆盖原来的内容；若文件未被创建，则创建新的文件。
MODE_WORLD_READABLE：表示当前创建的这个文件允许被其他应用读取。
MODE_WORLD_WRITEABLE：表示当前创建的这个文件允许被其他应用写入。



####外部存储相关：



**外部一词或许用的不是很准确，称之为共享存储区域可能更好一点，因为不管手机是否带有SD卡，都存在自带的外部存储，但是当然也包含SD卡存储区，只是为了区分受保护内部存储而使用的一个名称而已。值得引起注意的是，连接PC，可以被PC识别的都是外部储存。**也就是，其仅仅是概念上外部存储而已，其完整路径名头一般为：`/storage/sdcard0 `

getExternalStorageDirectory ()：获取外部存储根目录节点
一般用于在外部存储根目录新建目录，当应用被卸载时，该目录不会被系统自动删除，但是目前很多管家类应用能够查询提示删除。


getExternalStorageState():查看外部存储是否存在被其他终端挂载占用情况

void updateExternalStorageState() {
    String state = Environment.getExternalStorageState();
    if (Environment.MEDIA_MOUNTED.equals(state)) {
        mExternalStorageAvailable = mExternalStorageWriteable = true;
    } else if (Environment.MEDIA_MOUNTED_READ_ONLY.equals(state)) {
        mExternalStorageAvailable = true;
        mExternalStorageWriteable = false;
    } else {
        mExternalStorageAvailable = mExternalStorageWriteable = false;
    }
    handleExternalStorageState(mExternalStorageAvailable,
            mExternalStorageWriteable);
}


getExternalStoragePublicDirectory (String type)：外部公开目录

getExternalFilesDir(String):获取外部存储Andorid/data/com.packagename/files

getExternalCacheDir():获取Andorid/data/com.packagename/cache

---

Quote:

[Data Storage](http://developer.android.com/guide/topics/data/index.html)

[Storage](http://source.android.com/devices/storage/index.html)

[安卓文件存储使用参考](http://www.cnblogs.com/liaohuqiu/p/3532925.html)

[文件操作详解以及内部存储和外部存储](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2013/0923/1557.html)

[Android中的数据存储](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2014/1204/2104.html)

[Android开发中正确使用sdcard](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2014/1108/1934.html)

[Storage最佳实践](http://www.lightskystreet.com/2015/06/07/google-for-android-6-storage/)