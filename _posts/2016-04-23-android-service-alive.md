---
layout: post
title: Android Service  保活总结
category: android
---

进程杀死后IM推送无法接收等等,为了保证自身业务逻辑的完整性，以及各类需求的及时性，进程保活是无法绕过的一个坎;


###  独立Service 保活

####  应用进程保活的方案

对于应用的保活，常用的路数有以下几种：

*  SDK 接入唤醒，如利用植入三方应用的SDK去唤醒自身应用，常见的有 微信SDK唤醒微信，支付宝SDK唤醒支付宝，当然仔细想想也是正常，对于一个应用来说，你集成了相关SDK就代表你可能会用到SDK中的某些功能，如果不唤醒也是可能存在问题的，当你使用微信的某些功能时，无论是分享还是支付，微信的进程都还没启动，进程还没启动不可控的地方就多了，对于SDK的支持来说，这是两全齐美的办法，即保证了自身应用的保活，也保证了SDK的完整使用；

*  系统广播唤醒，如系统网络切换广播，系统开机启动广播，等等系统级别广播的监听；

*  独立(远程)进程Service； 独立进程的Service可以干的事情就多了，即可以用于唤醒主进程也可以用于减轻主进程的业务逻辑，如独立IM Service 进程结合PendingIntent进入主进程界面；那么独立的Service 进程如何保证不被系统Kill回收是对于这一选项至关重要的；


####   独立(远程)Servie保活


**Android 进程等级：**

* Foreground  前台进程 Active状态——用户交互的Activity 或者 与用户交互的Activity所关联的Service，ContentProvider；                   
* Visibility  可见进程              
* Service     服务进程—— 默认情况下的 startService所启动的服务，注意onStartCommand()函数返回值START_STICKY,START_REDELIVER_INTENT,START_NOT_STICKY各自所代表的含义           
* Background  后台进程—— 注意系统回收内存后，Activity的数据保存于重建 onSaveInstance();              
* Empty       空进程        


*  利用前台Service 提高Service进程等级；


默认情况下，Service在后台运行，当系统需要内存时是可能进行内存回收，杀死进程；而在合适的时候利用 startForeground() 开启高优先级前台服务进程，则可以提升进程优先级，**降低**进程被杀死的概率；


### Android 线程调度

*  nice 线程优先级调度 ： Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND); 设置线程级别；

*  cgroup 控制群主资源管理机制：通过建立前后台用户组线程群体，调度系统资源，控制进程所使用的资源数保证进程组之间的隔离；通过限制后台群组的资源访问，保证前台线程的顺利运行，防止后台线程过度抢占前台线程资源，导致前台线程资源不足，进而引发各类卡顿或用户不友好问题；


###  Service 使用


####  Service

关于 Service 的启动方式有 startService 与 bindService()之分，其生命周期的差异需要注意；

#### onStartCommand 返回值

* START_NOT_STICKY：最常规的安全返回，如果没有新的 启动Intent传递，该由于系统内存压力被杀死的Service不会自动重启；

* START_STICKY： 在被系统杀死后，在系统内存压力不紧张时，会尝试自动重启，且保证 onStartCommand()在Service创建后会被调用执行，如果没有启动Command分发给该重建Service，会执行onStartCommand(null);

* START_REDELIVER_INTENT: 与 START_STICKY 的差异在于，会保留最后的Intent，重新分发给该重建Service，常见于下载器，下载器Service中断后，重启重新下载；




####  前台Service

前台Service 将Service的进程优先级大幅提升，能在很大程度上避免系统的内存回收，其资源占用往往更多，电量消耗更多，从Android系统设计的角度，需要让用户知道哪些服务正在前台占用资源，所以其前台Sercvice应该要显示出来，但是从开发者角度又不希望用户感知到，我正在消耗你的电量，影响用户活跃度；

前台Service的默认形式如下：

{% highlight java %}
//前台带通知的 Service 情况

Intent intent = new Intent(this, MainActivity.class);
intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
PendingIntent pendingIntent = PendingIntent.getActivity(this, 0,
        intent, PendingIntent.FLAG_UPDATE_CURRENT);
Notification.Builder builder = new Notification.Builder(this)
        .setContentTitle("ServiceTitle")
        .setContentText("ServiceText")
        .setSmallIcon(R.drawable.btn_rating_star_on_pressed)
        .setContentIntent(pendingIntent);
startForeground(FORE_SERVICE_ID,builder.getNotification());



{% endhighlight %}  


创建不带通知的前台 Service:

API 18 之前我们可以简单的通过设置 startForeground() 所绑定的 Notification标识ID为0，或传递空的 Notification(),进而去启动隐藏通知栏的 前台Service，而在18之后 Android 取消了这种模式，而将前台进程设定为都需要显示设定通知绑定，不过依旧有一种漏洞去利用创建隐藏通知的前台Service：

对于提升优先级的目标 service A内部启动一个内部同ID,Service，两个服务同时startForeground，且绑定同样的 ID,对于 InnerService 执行Stop操作，进而利用Android目前的这一已知漏洞移除通知栏图标；

其实现其实很简单，其实只需要创建一个内部 Service类，执行

{% highlight java %}

onStartCommand{
  startForeground(FORE_SERVICE_ID, new Notification());
  stopForeground(true)；
  stopSelf();  
}

{% endhighlight %}  

![ForegroundService](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160423/service_force.png)

---

Quote:

[Thread Scheduling in Android](http://www.androiddesignpatterns.com/2014/01/thread-scheduling-in-android.html)

[微信Android客户端后台保活经验分享](http://mp.weixin.qq.com/s?__biz=MzA3ODg4MDk0Ng==&mid=403254393&idx=1&sn=8dc0e3a03031177777b5a5876cb210cc&scene=1&srcid=0402fANUWIotbVLECw4Ytz4K#wechat_redirect)

[生还是死？Android 进程优先级详解](http://chinagdg.org/2016/01/%E7%94%9F%E8%BF%98%E6%98%AF%E6%AD%BB%EF%BC%9Fandroid-%E8%BF%9B%E7%A8%8B%E4%BC%98%E5%85%88%E7%BA%A7%E8%AF%A6%E8%A7%A3/)

[Android Low Memory Killer](http://www.cnblogs.com/angeldevil/archive/2013/05/21/3090872.html)

[微信Android客户端架构演进之路](http://mp.weixin.qq.com/s?__biz=MzA3ODg4MDk0Ng==&mid=401921778&idx=1&sn=f05433ff53199999f9dc2acb3b249ac3&scene=21#wechat_redirect)

[关于 Android 进程保活，你所需要知道的一切](http://www.jianshu.com/p/63aafe3c12af)

[Android service后台保活原理相关和测试结果](http://www.jianshu.com/p/2889a69a89c6)
