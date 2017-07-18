---
layout: post
title: Android 系统启动回顾
category: android
keywords: [java, android]
---

* Loader： 用于系统启动的引导,以及开机自检，此处与PC类似   

* Kernel： 内核层，BinderDriver在此层以驱动形式 热加载Load
 
* Native ：Linux层，Init进程位于这个Level,init进程在系统启动时启动了 ServeiceManager——proxy(ServerManagerService) 管理Binder IPC服务
 
* FrameWork： Java Runtime层，由init进程fork 孵化的Zygote进程是所有Java进程的父进程，同时由Zygote进程Fork而产生 SystemServer用于辅助Zygote进程，SystemServer进程管理AMS等系统服务，Zygote进程监听Socket连接，在需要时fork生成新的Zygote进程，加载虚拟机，绑定Application这也APP启动的初始化工作

* App： 应用层，Launch Application ...

通信： 

* Binder     
* Socket:CS架构，结构简单      
* Handler：线程间通信，本质上时借助了线程自检内存地址共享，线程中都可以使用同一地址空间的Hanlder，工作空间的 Handler将消息发送到 Hanlder在主线程绑定的 MessageQueue处理；因为多线程中的Handler是同一个；

在应用启动信息，我们常看到 os.ZygoteInit.main();我们知道Zygote进程的核心孵化器地位，那么该进程时如何启动的呢？

Zygote对应的 Init.rc文件定义了对应的 Service，该Service 通常运行于由init进程 fork产生的子进程中；Zygote进程就是通过这样创建产生；

Zygote进程启动之初， AndroidRuntime.start() Native函数调用时会启动VM Android虚拟机，在之后进一步通过反射进入到Java层，ZygoteInit.main()被调起，来到Java世界；

os.ZygoteInit.main() 通常作为函数调用栈底的根函数，这里以此为入口分析：

{% highlight java %}
//ZygoteInit.main()
public static void main(String argv[]) {
        // Mark zygote start. This ensures that thread creation will throw
        // an error.
        ZygoteHooks.startZygoteNoThreadCreation();

        try {
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "ZygoteInit");
            RuntimeInit.enableDdms();
            // Start profiling the zygote initialization.
            SamplingProfilerIntegration.start();

            boolean startSystemServer = false;
            String socketName = "zygote";
            String abiList = null;
            for (int i = 1; i < argv.length; i++) {
                if ("start-system-server".equals(argv[i])) {
                    startSystemServer = true;
                } else if (argv[i].startsWith(ABI_LIST_ARG)) {
                    abiList = argv[i].substring(ABI_LIST_ARG.length());
                } else if (argv[i].startsWith(SOCKET_NAME_ARG)) {
                    socketName = argv[i].substring(SOCKET_NAME_ARG.length());
                } else {
                    throw new RuntimeException("Unknown command line argument: " + argv[i]);
                }
            }

            if (abiList == null) {
                throw new RuntimeException("No ABI list supplied.");
            }

            registerZygoteSocket(socketName);
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "ZygotePreload");
            EventLog.writeEvent(LOG_BOOT_PROGRESS_PRELOAD_START,
                SystemClock.uptimeMillis());
            preload();
            EventLog.writeEvent(LOG_BOOT_PROGRESS_PRELOAD_END,
                SystemClock.uptimeMillis());
            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            // Finish profiling the zygote initialization.
            SamplingProfilerIntegration.writeZygoteSnapshot();

            // Do an initial gc to clean up after startup
            Trace.traceBegin(Trace.TRACE_TAG_DALVIK, "PostZygoteInitGC");
            gcAndFinalize();
            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            Trace.traceEnd(Trace.TRACE_TAG_DALVIK);

            // Disable tracing so that forked processes do not inherit stale tracing tags from
            // Zygote.
            Trace.setTracingEnabled(false);

            // Zygote process unmounts root storage spaces.
            Zygote.nativeUnmountStorageOnInit();

            ZygoteHooks.stopZygoteNoThreadCreation();

            if (startSystemServer) {
                startSystemServer(abiList, socketName);
            }

            Log.i(TAG, "Accepting command socket connections");
            runSelectLoop(abiList);

            closeServerSocket();
        } 
    }



{% endhighlight %}
 
Zygote进程主要负责注册监听Socket， 加载Andrioid 虚拟机，预加载系统资源；

Zygote 的 Fork操作采用Copy-on-Write 机制,提升Fork效率；

> copy-on-write原理：写时拷贝是指子进程与父进程的页表都所指向同一个块物理内存，fork过程只拷贝父进程的页表，并标记这些页表是只读的。父子进程共用同一份物理内存，如果父子进程任一方想要修改这块物理内存，那么会触发缺页异常(page fault)，Linux收到该中断便会创建新的物理内存，并将两个物理内存标记设置为可写状态，从而父子进程都有各自独立的物理内存。

















---

Quote:

[Android系统开篇](http://gityuan.com/android/)

[Android Application启动流程分析](http://www.jianshu.com/p/a5532ecc8377)

[Android 应用启动过程解析](http://zke1ev3n.me/2015/12/02/Android-%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E8%BF%87%E7%A8%8B%E8%A7%A3%E6%9E%90/)

[Android启动过程深入解析](http://blog.jobbole.com/67931/)

[Android 应用进程启动流程](http://www.woaitqs.cc/android/2016/06/21/activity-service)

[ Android源码解析之（八）-->Zygote进程启动流程
](http://blog.csdn.net/qq_23547831/article/details/51104873)

[理解Android进程创建流程](http://gityuan.com/2016/03/26/app-process-create/)


