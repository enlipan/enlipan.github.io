---
layout: post
title: AsyncTask 与 Handler小结
category: android
---
##AsyncTask

###AsyncTask 的优势体现在：

* 线程的开销较大，如果每个任务都要创建一个线程，那么应用程 序的效率要低很多； 
* 
* 线程无法管理，匿名线程创建并启动后就不受程序的控制了，如果有很多个请求发送，那么就会启动非常多的线程，系统将不堪重负。 
* 
* 另外，前面已经看到，在新线程中更新UI还必须要引入handler，这让代码看上去非常臃肿。

###AsyncTask定义了三种泛型类型 Params，Progress和Result。

* Params 启动任务执行的输入参数，比如HTTP请求的URL。 
* 
* Progress 后台任务执行的百分比。 
* 
* Result 后台执行任务最终返回的结果，比如String。

AsyncTask的执行分为四个步骤，每一步都对应一个回调方法，开发者需要实现一个或几个方法。在任务的执行过程中，这些方法被自动调用。

onPreExecute(), 该方法将在执行实际的后台操作前被UI thread调用。可以在该方法中做一些准备工作，如在界面上显示一个进度条。 

doInBackground(Params...), 将在onPreExecute 方法执行后马上执行，该方法运行在后台线程中。这里将主要负责执行那些很耗时的后台计算工作。可以调用 publishProgress方法来更新实时的任务进度。该方法是抽象方法，子类必须实现。 

onProgressUpdate(Progress...),在publishProgress方法被调用后，UI thread将调用这个方法从而在界面上展示任务的进展情况，例如通过一个进度条进行展示。 

onPostExecute(Result), 在doInBackground 执行完成后，onPostExecute 方法将被UI thread调用，后台的计算结果将通过该方法传递到UI thread.

AsyncTask使用几条必须遵守的准则： 
1. Task的实例必须在UI thread中创建                   
2. execute方法必须在UI thread中调用                
3.不要手动的调用onPreExecute(), onPostExecute(Result)，doInBackground(Params...), onProgressUpdate(Progress...)这几个方法                     
4. 该task只能被执行一次，否则多次调用时将会出现异常

**PS：**

* AsyncTask线程个数有限，如果前面开启的后台Task线程到达一定数量之后，而又没有完成的情况下，任务会一直阻塞，后面的线程将一直等待。
* 
* AsyncTask适用于较大的数据量，使用相较于Handler更加简便，Handler则重在灵活
* 
* 利用AsyncTask可以让UI主线程保持响应，而不会出现5秒无响应强制退出
* 
* AsyncTask线程开启后无法管理，不受控制


**最后需要说明AsyncTask不能完全取代线程，在一些逻辑较为复杂或者需要在后台反复执行的逻辑就可能需要线程来实现了。**

> AsyncTasks should ideally be used for short operations (a few seconds at the most.) If you need to keep threads running for long periods of time, it is highly recommended you use the various APIs provided by the java.util.concurrent package such as Executor, ThreadPoolExecutor and FutureTask.

##Handler

Android UI是线程不安全的，如果在子线程中尝试进行UI操作，程序就有可能会崩溃。异步消息处理线程完成。






##HandlerThread

HandlerThread继承自Thread,线程同时创建了一个含有消息队列的Looper,维护自身的一套循环事务逻辑，自有Looper，HandlerThread在自己线程内处理自己线程发出的消息，独立循环接收并处理Message消息。

其使用一般用于让非UI线程使用消息队列机制，不干扰或者阻塞UI线程。

同时开发中如果多次使用类似`new Thread(){...}.start()`这种方式开启一个子线程，会创建多个匿名线程，使得程序运行起来越来越慢，而HandlerThread自带Looper使他可以通过消息来多次重复使用当前线程，节省开支.


new Handler(HandlerThread.getLooper)



![UIThread](/assets/img/20150717/UIThread.png)


---

[Sending Operations to Multiple Threads-Google](https://developer.android.com/intl/zh-CN/training/multiple-threads/index.html)

[Communicating with the UI Thread](https://developer.android.com/intl/zh-CN/training/multiple-threads/communicate-ui.html#Handler)

[异步消息机制](http://blog.csdn.net/guolin_blog/article/details/9991569)



