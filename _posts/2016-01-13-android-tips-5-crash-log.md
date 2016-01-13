---
layout: post
title: Android Tips part (5)
category: android
---

记录最近分析线上CrashLog情况：

### Unable to add window --token is not valid; is your activity running?

当我们利用Context启用新的Activity或者Dialog时，如果这个 Context没有指定具体的Activity，也就是没有对应的Window，App将不知道新的界面要加到哪里，就会产生这一Crash问题；

典型的出现场景是 不小心利用了 ApplicationContext 启用 StartActivity();

### permission-denied-missing-internet-permission？

[SecurityException: Permission denied (missing INTERNET permission?)](http://stackoverflow.com/questions/17360924/securityexception-permission-denied-missing-internet-permission)

简单的说就是一般情况下，我们App的权限是静态获取，声明了之后，用户在安装时同意之后就会一直有，但是如果用户手机在取得了Root权限情况下，其权限是可以动态分配的，不再是一次获取永久拥有了，如安装360极客版之后，有root权限的用户可以在每次程序权限申请时选择允许，拒绝；

一个值得注意的点是 android 6.0 开始有这样的机制了，这类区别是很需要注意的；


[Android 6.0 Changes](https://developer.android.com/about/versions/marshmallow/android-6.0-changes.html)

### 性能优化之Android真机调试SQLite：

有时候我们有一些优化或者其他特殊场景我们需要在真机上使用Sqlite 直接进行数据库操作查看运行结果；

说起来也不是很复杂的东西，但是要注意的坑还是挺多的：


> 一是从Root手机中取出 sqlite3 执行文件 放入到要运行sqlite3的目标真机中，一般我们从模拟器中取
> 
>  >  
>  >  取文件要注意的几个点： 取文件机器的 Android版本要与 目标真机的 版本相同，因为 不同版本Sqlite版本会改变的；版本不同会出现各种问题 如：head source not match 或者 CANNOT LINK EXECUTABLE 等等各种问题；同时架构也最好相同，不要取出 X86 模拟器中的执行文件放入了 arm7 架构的真机中；
>  >  
>  
>  push到真机执行 目前看到的大多是 先获取 system 目录读写权限 然后将 sqlite3 放入 system/bin目录下修改合适的权限执行
>  
>  > 
>  > 附带一个小说明：为什么执行文件放入 sd卡中执行呢？当然提示会看到 没有权限，但是当我们修改权限也依旧无法成功修改，这是由于sd卡的存储介质格式(FAT32等等这类)决定的‘
>  > 
>  
>  还有一种方法是可以直接 push 到 /data/local/tmp/  目录下 修改权限 777 可以直接执行 ./sqlite3  ，我一般比较喜欢这种方式；
>  
>  
>  还有一点要注意的是如何确定输出检测，利用`.output /dev/null`重定向sqlite输出，让其输出到内存中，以便于检测性能；
>  
>  其他的就.....
>  
>  


### Fragment.getResource()

前些天我已经提醒过，Fragment中的getString 函数，是依赖其所附属的Activity的，一旦Fragment与Activity无关联 此函数是会Crash的，感觉Fragment里面这类函数独立出来有点误导人，要是函数直接使用 getActivity().getResource()；我觉得大家反而会注意点；


### adb push 与 pull

一般Push是将文件从外部Push到手机里面，而Pull是将文件从手机内部Push到外部；
*那么，将一个文件从 手机内部的 `/system/xbin/` 目录下转移到 `/data/local/tmp/` 目录下，用什么命令呢？
开始我以为是Pull命令，最后发现是需要用Push命令，仔细想想也可以理解，比较统一 只要是文件到手机都是Push，无论来源是哪里即使是内部到内部，还是push，反之pull也是；

### 构造复杂的带存储过程的  Projection等完成数据筛选：

`String [] projection = {Table._ID,Table.TYPE,"CASE WHEN notify_time > 0 THEN notify_time ELSE time END    AS  sort_time"}`

通过这样的存储过程嵌套的方式，我们构造了一个新的列，该列的数据通过行踪数据比较得到，此种情形适合混合排序；
