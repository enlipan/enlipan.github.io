---
layout: post
title: BroadcastReceiver
category: android
---

BroadcastReceiver为事件注册，类似于好莱坞原则，*别来找我，当事情发生我自然会通知你的*。

事件的注册有动静两种方式，静态注册是预先在ManiFest文件中定义说明，而动态注册则更加灵活，一般利用利用Context.registerReceiver()。一旦事件注册完成，当事件发生，onReceive就会接收到相应的事件进而系统通知响应用户。OnReceive方法执行完成之后，BroadcastReceiver将进入垃圾时间，也就是**允许**系统回收内存空间。

注意：当使用动态注册方式，一定要记得unregisterReceiver()，否则 Android system reports a leaked broadcast receiver error.

Intent：

* Intent            
* Sticky Intent         
* Pending Intent

在Intent中，系统已经预定义了很多事件，如开关机，电池电量等等，一旦相应的事件发生，就会被onReceiver截获响应。同时我们也可以自定义相关的事件Action。

PendingIntent用于允许其他Application执行本应用某部分逻辑的权限。
一般结合AlarmManager混合应用。


Sticky (broadcast) intents

sendStickyBroadcast(Intent) 

the corresponding intent is sticky, meaning the intent you are sending stays around after the broadcast is complete.

一般用于传递系统消息，只需要写一个相应的Receiver并且注册到相应的Intentfilter，就能随时随地在某一个OnReceiver中接收到Data。

值得注意的是，一种更加安全的注册方式是是使用LocalBroadcastManager。防止被其他应用将Intent截获，这是目前Google推荐的一种方式。此种方式可以结合自定义Action共同应用。

{% highlight java %}

//Custom action 
// Send an Intent with an action named "my-event". 
private void sendMessage() {
  Intent intent = new Intent("my-event");
  // add data
  intent.putExtra("message", "data");
  LocalBroadcastManager.getInstance(this).sendBroadcast(intent);
} 


// Register mMessageReceiver to receive messages.
  LocalBroadcastManager.getInstance(this).registerReceiver(mMessageReceiver,
      new IntentFilter("my-event"));
}


{% endhighlight %}




---

[Android BroadcastReceiver - Tutorial](http://www.vogella.com/tutorials/AndroidBroadcastReceiver/article.html)

[BroadcastReceiver总结](http://cthhqu.blog.51cto.com/7598297/1282534)

[Android中Broadcast Receiver组件详解](http://blog.csdn.net/zuolongsnail/article/details/6450156#comments)

[四大组件之Broadcast Receiver](http://www.oschina.net/question/157182_45595)