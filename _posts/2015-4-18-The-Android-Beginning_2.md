---
layout: post
title: My Android Beginning (2)
category: android
---

##Developing Android Apps——获取网络数据

###网络与日志

HttpUrlConnection：used to send and receive streaming data whose length is not known in advance.       
HttpClient：HTTP clients encapsulate a smorgasbord of objects required to execute HTTP requests while handling cookies, authentication, connection management, and other features. 

API：课程中使用OpenWeatherMap API接口获取其他内容供应商数据

Log调试查看的两种方法：

> adb -s devicename Logcat  :针对多虚拟机或设备连接情况，需要`adb devices`以及`adb -s  devicename shell`去指定所连接设备
> 
> AVD 中查看
> 
> 实体设备连接时注意驱动的安装

###主线程与后台线程

主线程又称启动线程——UI Thread ：核心要点`Avoid Long Operations`,UI线程主要处理用户输入输出以及屏幕绘图，一旦在UI线程加入了耗时操作，会造成UI不流畅，界面卡顿，降低用户使用体验。所以在此不能加入`urlConnection.connect()`,否则会出现NetWorkOnMainThreadException，那么一旦出现了Error，一方面可以查询RootCause，另一方面查询该Exception文档，去了解该Exception，进而进行调试排错。

与主线程相对的后台线程——Background Thread，完成其他耗时操作，如网络调用，位图解码等

AsyncTask，perform background operations and publish results on the UI thread without having to manipulate threads and/or handlers.      
Asynctask简化了后台多线程的嵌套问题，便于专注于业务逻辑的完善。

{% highlight java %}

public void onClick(View v) {
    new Thread(new Runnable() {
        public void run() {
            final Bitmap bitmap = loadImageFromNetwork("http://example.com/image.png");
            mImageView.post(new Runnable() {
                public void run() {
                    mImageView.setImageBitmap(bitmap);
                }
            });
        }
    }).start();
}

{% endhighlight %}

Using AsyncTask

{% highlight java %}

public void onClick(View v) {
    new DownloadImageTask().execute("http://example.com/image.png");
}

private class DownloadImageTask extends AsyncTask<String, Void, Bitmap> {
    /** The system calls this to perform work in a worker thread and
      * delivers it the parameters given to AsyncTask.execute() */
    protected Bitmap doInBackground(String... urls) {
        return loadImageFromNetwork(urls[0]);
    }
    
    /** The system calls this to perform work in the UI thread and delivers
      * the result from doInBackground() */
    protected void onPostExecute(Bitmap result) {
        mImageView.setImageBitmap(result);
    }
}

{% endhighlight %}

Andoid UI toolkit is not thread-safe. So, you must not manipulate your UI from a worker thread—you must do all manipulation to your user interface from the UI thread. Thus, there are simply two rules to Android's single thread model:

* Do not block the UI thread          
* Do not access the Android UI toolkit from outside the UI thread，Which can result in undefined and unexpected behavior.      

AsyncTask应该存在于整个应用生命周期中，不应该绑定在相关Activity中，随着Activity生命周期的销毁或切换等操作，会导致AsyncTask的数据传输中断产生Error.更加理想的状态是利用Service完成SyncAdapter数据传输，更加高端的方法是使用GCM

在课程应用的编译过程中，在此出现了权限问题，关于权限问题几个注意要点是：

* 每个APK对应其独有的Linux用户ID，UserID、GroupID，应用在运行时独立运行于Android虚拟机提供的沙盒中，各个沙箱互相之间隔离，其运行文档以及其他处理是与其他APK说独立的，隔离了程序间的运行影响，这类机制用于确保默认状况下程序不执行敏感操作，访问用户敏感数据，不对操作系统以及用户造成不利的影响，在程序设定中利用**最低权限法则**，当需要请求权限时，优先考虑其他解决方案，当无法绕过时，请求权限。
* APP的权限请求是静态请求，也就是在程序设计编写时，静态写入AndroidManifest文件之中，而不能在APP运行之时，动态判定请求，一切的权限都是在编译之前确定的。

最后的问题就是国际化问题，利用string.xml文件去完成，相关控件指定利用string/values






