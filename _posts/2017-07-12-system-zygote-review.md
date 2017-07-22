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

Init进程在启动之后会运行被称之为 Android初始化语言的 Init.rc文件，文件中定义了各种Action，Service等

{% highlight cpp%}
// init.zygote.rc 初始化
service zygote /system/bin/app_process32 -Xzygote /system/bin --zygote --start-system-server --socket-name=zygote
    class main
    priority -20
    user root
    group root readproc
    socket zygote stream 660 root system
    onrestart write /sys/android_power/request_state wake
    onrestart write /sys/power/state on
    onrestart restart audioserver
    onrestart restart cameraserver
    onrestart restart media
    onrestart restart netd
    onrestart restart wificond
    writepid /dev/cpuset/foreground/tasks


{% endhighlight %}


{% highlight cpp %}

void AndroidRuntime::start(const char* className, const Vector<String8>& options, bool zygote)
{
    static const String8 startSystemServer("start-system-server");
    ...
    if (startVm(&mJavaVM, &env, zygote) != 0) {
        return;
    }
    onVmCreated(env);
  
    if (startReg(env) < 0) {
        return;
    }
    ...

}

{% endhighlight %}

Zygote对应的 Init.rc文件定义了对应的 Service，该Service 通常运行于由init进程 fork产生的子进程中；Zygote进程就是通过这样创建产生；

Zygote进程启动之初， AndroidRuntime.start() Native函数调用时会启动VM Android虚拟机，在之后进一步通过反射进入到Java层，ZygoteInit.main()被调起，来到Java世界；

Runtime 意为支撑程序运行的基础环境lib，AndroidRuntime 顾名思义，Android运行时环境，与此对应的概念还有 C Runtime，Java Runtime；这里AndroidRuntime.start()函数构建Android运行环境的核心就是，startVM构建Android 虚拟机，以及注册JNI，至此Android 相关的语言层面的运行时环境已经构建成功，而应用运行以及用户交互相关的服务则由 Zygote进程在启动时一一构建；

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

我们知道 Android应用独立的运行在独立的 Android虚拟机中，每个虚拟机都位于独立的进程空间，这个进程空间就是 Zygote fork产生的进程空间，应用独立安全的运行在专属的虚拟机中，及时某个应用崩溃也不会影响整体系统中的其他应用的正常运行 —— 那么问题来了，如果每个应用在启动时都启动独立的Android 虚拟机，相比非常影响应用的启动效率，那么尽可能短时间的启动App甚至变成了不可能的事情；

为了解决这一问题，Zygote 的 Fork操作采用Copy-on-Write 机制, Zygote进程是系统启动时加载，它同样会完成虚拟机的初始化，以及Android核心环境的构建，资源的加载，这些Zygote在启动时的预加载Android核心库通常是通用的只读环境，这也就代表着在fork后新的子进程可以与父进程共享该资源，节省内存开销，同时为构建新的虚拟机环境Zygote进程快速的进行自身的复制提供整个系统，从而达到快速构建新的独立进程的目的；

> copy-on-write原理：写时拷贝是指子进程与父进程的页表都所指向同一个块物理内存，fork过程只拷贝父进程的页表，并标记这些页表是只读的。父子进程共用同一份物理内存，如果父子进程任一方想要修改这块物理内存，那么会触发缺页异常(page fault)，Linux收到该中断便会创建新的物理内存，并将两个物理内存标记设置为可写状态，从而父子进程都有各自独立的物理内存。





---

Quote:

[Android系统开篇](http://gityuan.com/android/)

[Android Application启动流程分析](http://www.jianshu.com/p/a5532ecc8377)

[Android 应用启动过程解析](http://zke1ev3n.me/2015/12/02/Android-%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E8%BF%87%E7%A8%8B%E8%A7%A3%E6%9E%90/)

[Android启动过程深入解析](http://blog.jobbole.com/67931/)

[Android 应用进程启动流程](http://www.woaitqs.cc/android/2016/06/21/activity-service)

[理解Android进程创建流程](http://gityuan.com/2016/03/26/app-process-create/)

[图解Android - Zygote, System Server 启动分析](http://www.cnblogs.com/samchen2009/p/3294713.html)
