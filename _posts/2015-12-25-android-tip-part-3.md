---
layout: post
title: Android-tips-part-3
category: android
---

1.  Fragment.getString() 函数：

直接使用该函数依赖于该Fragment所依赖的Activity，若Fragment未Attach到Activity，函数出现异常，需要注意，一般不会直接使用该函数，是最近偷懒中偶然发现的错误；

2.  在内部类尤其是内部线程中尤其注意内存泄漏：

就算是静态内部类也需要注意，一些集合类的引用传递也可能导致内存泄漏；


3.Java 的值传递类型：

很多人认为Java只有值传递是将Java的对象引用传递，回归本质的指针传递，进而划分到地址传递，也就是值传递；当然计算机底层也无法区分引用还是值，只有地址码值才是永恒，所以如果进一步说，如果是复制传递，如Java栈区中基本类型值复制传递，就是一般意义上的值传递，而如果是共享传递，如Java中的引用对象传递，通过传递地址值进行内存共享，一般是指针地址值传递，所以根本上Java只有值传递；

4. SingleTask SingleInstance 中的 onActivityResult问题：




5. 自定义Style在继承时的 `.` Parant.Child.X


6. [Android网络状态](http://developer.android.com/training/monitoring-device-state/connectivity-monitoring.html#DetermineConnection):、

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

7. `PendingIntent`

PendingIntent核心机制是异步触发Intent，PendingIntent类似于一种Token对象，PendingIntent可以由某个程序(A)获取，然后交给其他应用或系统管理，用于在之后的某个时间中触发发起该Intent的程序(A)中的业务逻辑，这时候Android的安全校验就是一种Token形式的安全管理，校验成功则执行最初封装的Intent；

其他引用获取了PendingIntent之后，是代替发起Intent的应用(A)管理的，所以在获取了之后的发送操作也是拿着所获取的Token，代表发起应用(A)发送该Intent；可以看出Android的安全管理策略还是非常严谨的；

同一个Intent请求PendingIntent两次，得到同一个PendingIntent：可以用于撤销；

一个PendingIntent只能登记一个定时器；


8. Service生命周期：

onCreate()：服务创建时调用

onStartCommand():每次StartService（intent）都会触发，无论该Service存在与否；


---

Quote：

[Java内存泄露的理解与解决 ](http://www.blogjava.net/zh-weir/archive/2011/02/23/345007.html)

[说说PendingIntent的内部机制](http://my.oschina.net/youranhongcha/blog/196933)