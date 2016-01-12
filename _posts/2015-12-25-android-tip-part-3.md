---
layout: post
title: Android Tips part (3)
category: android
---

###   Fragment.getString() 函数：

直接使用该函数依赖于该Fragment所依赖的Activity，若Fragment未Attach到Activity，函数出现异常，需要注意，一般不会直接使用该函数，是最近偷懒中偶然发现的错误；

###    在内部类尤其是内部线程中尤其注意内存泄漏：

就算是静态内部类也需要注意，一些集合类的引用传递也可能导致内存泄漏；

Handler内存泄漏：

handler一般多用于创建内部类实例并重写其handleMessage()函数；

利用Handler发送消息到MsgQueue中，并转交到对应的Looper，Looper收到的消息中其实携带了一个Handler引用，以便于Looper通过Handler来分发处理消息。

主线程ActivityThread中的Looper会与应用生命一起存在，Looper持有Handler，造成以Handler为内部类而所在的Activity无法回收，内存泄漏由此产生。

解决这一问题一般是将内部类转换为静态内部类，并且慎用Context引用，可以将Context引用利用弱引用，防止内存泄漏；


###   Java 的值传递类型：

很多人认为Java只有值传递是将Java的对象引用传递，回归本质的指针传递，进而划分到地址传递，也就是值传递；当然计算机底层也无法区分引用还是值，只有地址码值才是永恒，所以如果进一步说，如果是复制传递，如Java栈区中基本类型值复制传递，就是一般意义上的值传递，而如果是共享传递，如Java中的引用对象传递，通过传递地址值进行内存共享，一般是指针地址值传递，所以根本上Java只有值传递；

###   SingleTask SingleInstance 中的 onActivityResult 问题：

5.0以下的系统中：如果startActivityForResult()启动的Activity 属于 SingleTask类型，onActivityResult()会立即得到Cancle的结果，也就无法收到正确的SetResult()返回结果；

改成SingleTop 模式可以正确启动；



###  自定义Style在继承时的 `.` Parant.Child.X


###   [Android网络状态](http://developer.android.com/training/monitoring-device-state/connectivity-monitoring.html#DetermineConnection):、

{% highlight java %}

/**
* 判断网络状态是否可用：
*/
ConnectivityManager cm =
        (ConnectivityManager)context.getSystemService(Context.CONNECTIVITY_SERVICE);
  
NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
boolean isConnected = activeNetwork != null &&
                      activeNetwork.isConnectedOrConnecting();

/**
*判断网络类型：
*/
activeNetwork.getType() == ConnectivityManager.TYPE_WIFI;

{%  endhighlight %}

跳转网络设置界面，一般用于网络不可用时，引导用户设置确认：

{% highlight java %}


Intent intent = new Intent(Settings.ACTION_WIRELESS_SETTINGS);  
                con.startActivity(intent);  

{%  endhighlight %}

###   `PendingIntent`

PendingIntent核心机制是异步触发Intent，PendingIntent类似于一种Token对象，PendingIntent可以由某个程序(A)获取，然后交给其他应用或系统管理，用于在之后的某个时间中触发发起该Intent的程序(A)中的业务逻辑，这时候Android的安全校验就是一种Token形式的安全管理，校验成功则执行最初封装的Intent；

其他引用获取了PendingIntent之后，是代替发起Intent的应用(A)管理的，所以在获取了之后的发送操作也是拿着所获取的Token，代表发起应用(A)发送该Intent；可以看出Android的安全管理策略还是非常严谨的；

同一个Intent请求PendingIntent两次，得到同一个PendingIntent：可以用于撤销；

一个PendingIntent只能登记一个定时器；


###   Service生命周期：

onCreate()：服务创建时调用

onStartCommand():每次StartService（intent）都会触发，无论该Service存在与否；

###    Java 字符串常量的优化：

编译器所谓的常量折叠：编译期常量运算的折叠合并优化，对于编译期可以确认其值的常量一般指常量或final 字段的基本类型或字符串类型。

典型应用是：字符串连接：

{% highlight java %}

情形一：

"ab" + "c"

"abc"

==

情形二：

String a = "ab"

String b = a + "c"

a != b

情形三：

final String a = "ab"

String b= a + "c"; 

b == "abc"

{%  endhighlight %}


---

Quote：

[Java内存泄露的理解与解决 ](http://www.blogjava.net/zh-weir/archive/2011/02/23/345007.html)

[Handlers & Inner Classes](http://www.androiddesignpatterns.com/2013/01/inner-class-handler-memory-leak.html)


[说说PendingIntent的内部机制](http://my.oschina.net/youranhongcha/blog/196933)

[内存泄露从入门到精通三部曲之常见原因与用户实践](https://mp.weixin.qq.com/s?__biz=MzA3NTYzODYzMg==&mid=401107957&idx=2&sn=4b95bcfedd762b987ec57f60f80b1f94&scene=2&srcid=1119lGAlbzG5LrX1QJlJxGQR&from=timeline&isappinstalled=0&key=d72a47206eca0ea9275336a5898eb5b7cccb5719c45d7e237e6f910d5a56194f2e06a1fea3cded1d025abf1c2d756f22&ascene=2&uin=NjUyNDAxMDU%3D&devicetype=android-19&version=26030735&nettype=cmnet&pass_ticket=t3IpxDHKJY3VFttEo2ECvy2Oyaw%2B1gIqzaJHXlKneBE%3D)