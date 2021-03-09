---
layout: post
title: Android 系统回顾
category: android
keywords: [view, android]
---

### Binder

#### 是什么

Binder作为进程间通信的架构,很好的适应了移动设备的特性解决了IPC的一些性能问题，高效简洁有效，Binder将Android Framwork中的四大组件连接起来；

#### 同类有哪些   

Linux现有IPC：

* 管道           
* 消息队列- 存储转发，两次拷贝        
* 共享内存- 控制复杂         
* 套接字-传输效率低        
* 信号量       

#### Binder 特性：

* 根据客户端所持有的Binder对象，BinderDriver寻址，找到远程Service;客户端进程向服务端进程发送IPC数据时，将数据打包进入Parcel对象中，进而通过内核空间发送到服务进程中；


* CS架构，端对端独立，架构清晰，建立Servermanager，注册Server，ServerManager维护Server Action表，请求ServerManager获取对应的Action，查表获取对应Server服务的ActionProxy以供Client调用，Binder驱动建立了对应的ActionProxy与Action的对应关系，在Client的请求到达BinderDriver中后，真实请求由BinderDriver发起，最后将结果返回给Client；    

* 系统为App分配对应UID，Service端根据UID/PID Check 权限控制策略，而Socket以及ShareMemory等传统方式对于通信双方的身份验证则没有做严格限制，传统方式的安全性大多由上层安全协议保证，而本身无法控制；     

* 抽象Binder对象，面向对象的思想,Client 中的 BPBinder对象，Server中的 BBinder对象，将进程通信转化为对Binder对象的引用，进而调用该引用Binder对象的方法；

* IBinder接口定义了 Binder IPC的通信协议，BBinder以及BPBinder均为其子类，具有夸进程传输的能力；

* 通过mmap内存映射，其物理内存地址映射不仅仅映射进入内核空间同时也映射进入了用户空间，在数据传输时，一次拷贝到内核空间的同时，相当于也同时Copy到了用户空间，高效一次Copy的奥秘，省去内核暂存中转

* Binder可以通过内部引用计数解决跨进程代理对象的生命周期问题；

### 模型

C/S 模型： Client，Server，ServerManager（通信标志:0- 固定的确定访问地址），以及Binder Driver（Linux 内核驱动）


#### IInterface -> ToBinder

* asBinder() : InterFace 到Binder的转换


#### ToInterface -> BpBinder

* asInterface : Binder 到Client 调用的 RemoteService对应函数的 Interface Delegate的转换

BinderProxy中的业务逻辑函数映射着远程Service中对应的函数，其映射关系由BinderDriver维护

**eg：**

Client  通过获取到 BinderProxy 向远程Servic发出请求流程：

* Service 注册进入 ServiceManager   

* Client 对于 Service Binder寻址

* 获取 BPBinder   

* 利用BPBinder请求-> Remote.transact(data,reply)

* 通过BBinder 获取到对应的命令Code，在 onTransation中通过对应Code映射对应的Action


Quote:

[ Android Bander设计与实现 - 设计篇](http://blog.csdn.net/universus/article/details/6211589)

[Binder学习指南](http://weishu.me/2016/01/12/binder-index-for-newer/)

[Android Binder IPC分析](http://www.2cto.com/kf/201202/118538.html)

[Binder系列—开篇](http://gityuan.com/2015/10/31/binder-prepare/)

[Android IPC Binder机制](http://zke1ev3n.me/2016/07/19/Android-IPC-Binder%E6%9C%BA%E5%88%B6/)

[Android Binder 分析——数据传递者（Parcel）](http://light3moon.com/2015/01/28/Android%20Binder%20%E5%88%86%E6%9E%90%E2%80%94%E2%80%94%E6%95%B0%E6%8D%AE%E4%BC%A0%E9%80%92%E8%80%85[Parcel]/)


### MessageQueue



### AMS

AMS：Android核心服务，类OS中的进程管理与调度模块，负责组件状态的管理，包括组件的启动切换调度以及进程的调度与管理；


1. AMS SystemService启动流程：

AMS由SystemService创建，并随之启动注册到ServiceManager中由之管理

{% highlight java %}

com.android.server.SystemServer:

run(){
	 // Start services.
        try {
            Trace.traceBegin(Trace.TRACE_TAG_SYSTEM_SERVER, "StartServices");
            startBootstrapServices(); // Action
            startCoreServices();
            startOtherServices();
        } catch (Throwable ex) {
            Slog.e("System", "******************************************");
            Slog.e("System", "************ Failure starting system services", ex);
            throw ex;
        } finally {
            Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
        }

}    


 private void startBootstrapServices() {
 		// Activity manager runs the show.
        mActivityManagerService = mSystemServiceManager.startService(
                ActivityManagerService.Lifecycle.class).getService();
        mActivityManagerService.setSystemServiceManager(mSystemServiceManager);
        mActivityManagerService.setInstaller(installer);

        ...

        // Set up the Application instance for the system process and get started.
        mActivityManagerService.setSystemProcess();


 }

{% endhighlight %}

[ActivityManagerService启动过程](http://gityuan.com/2016/02/21/activity-manager-service/)

### ActivityThread  

ActivityThread 作为App启动的入口函数，是研究App与AMS交互的关键，对于App启动的流程也很有必要研究一番：

#### App启动流程：

[Android Application Launch](http://multi-core-dump.blogspot.hk/2010/04/android-application-launch.html)

> Init process then starts a very interesting process called 'Zygote'. As the name implies it's the very beginning for the rest of the Android platform. This is the process which initializes the very first instance of Dalvik virtual machine and pre-loads all the common classed used by the application framework and the various apps. Then it starts listening on a socket interface for future requests to spawn off new vms for managing new app processes. On receiving a new request, it forks itself to create a new process which gets a pre-initialized vm instance.
After zygote, init starts the runtime process. The zygote then forks to start a well managed process called system server. It starts all core platform services e.g activity manager service and hardware services in its own context. At this point the full stack is ready to launch the first app process - Home app which displays the home screen.

一图胜千言，引用上文的 launch 流程图：


{:.center}
![App Lauch](http://img.oncelee.com/assets/img/20170708/app%20launch%20summary.jpg)

{% highlight java %}


ActivityThread.main()
public static void main(String[] args) {
    ...
    Looper.prepareMainLooper();

    ActivityThread thread = new ActivityThread();
    thread.attach(false);

    if (sMainThreadHandler == null) {
        sMainThreadHandler = thread.getHandler();
    }

    if (false) {
        Looper.myLooper().setMessageLogging(new
                LogPrinter(Log.DEBUG, "ActivityThread"));
    }

    // End of event ActivityThreadMain.
    Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
    Looper.loop();

    throw new RuntimeException("Main thread loop unexpectedly exited");
}




ActivityThread.systemMain()

public static ActivityThread systemMain() {
    // The system process on low-memory devices do not get to use hardware
    // accelerated drawing, since this can add too much overhead to the
    // process.
    if (!ActivityManager.isHighEndGfx()) {
        ThreadedRenderer.disable(true);
    } else {
        ThreadedRenderer.enableForegroundTrimming();
    }
    ActivityThread thread = new ActivityThread();
    thread.attach(true);
    return thread;
}

ActivityThrea.attach()

private void attach(boolean system) {
        sCurrentActivityThread = this;
        mSystemThread = system;
        if (!system) {
            ViewRootImpl.addFirstDrawHandler(new Runnable() {
                @Override
                public void run() {
                    ensureJitEnabled();
                }
            });
            android.ddm.DdmHandleAppName.setAppName("<pre-initialized>",
                                                    UserHandle.myUserId());
            RuntimeInit.setApplicationObject(mAppThread.asBinder());
            final IActivityManager mgr = ActivityManagerNative.getDefault();
            try {
                // mAppThread = new ApplicationThread();
                //ApplictionThread extends ApplicationThreadNative
                //ApplicationThreadNative extends Binder implements IApplicationThread
                // 模型与AMS一致
                // 负责App生命周期回调处理- onCreate...
                mgr.attachApplication(mAppThread);
            } catch (RemoteException ex) {
                throw ex.rethrowFromSystemServer();
            }
            // Watch for getting close to heap limit.
            BinderInternal.addGcWatcher(new Runnable() {
                @Override public void run() {
                    if (!mSomeActivitiesChanged) {
                        return;
                    }
                    Runtime runtime = Runtime.getRuntime();
                    long dalvikMax = runtime.maxMemory();
                    long dalvikUsed = runtime.totalMemory() - runtime.freeMemory();
                    if (dalvikUsed > ((3*dalvikMax)/4)) {
                        if (DEBUG_MEMORY_TRIM) Slog.d(TAG, "Dalvik max=" + (dalvikMax/1024)
                                + " total=" + (runtime.totalMemory()/1024)
                                + " used=" + (dalvikUsed/1024));
                        mSomeActivitiesChanged = false;
                        try {
                            mgr.releaseSomeActivities(mAppThread);
                        } catch (RemoteException e) {
                            throw e.rethrowFromSystemServer();
                        }
                    }
                }
            });
        } else {
            // Don't set application object here -- if the system crashes,
            // we can't display an alert, we just want to die die die.
            android.ddm.DdmHandleAppName.setAppName("system_process",
                    UserHandle.myUserId());
            try {
                mInstrumentation = new Instrumentation();
                ContextImpl context = ContextImpl.createAppContext(
                        this, getSystemContext().mPackageInfo);
                mInitialApplication = context.mPackageInfo.makeApplication(true, null);
                mInitialApplication.onCreate();
            } catch (Exception e) {
                throw new RuntimeException(
                        "Unable to instantiate Application():" + e.toString(), e);
            }
        }
       ...
    }

{% endhighlight %}

[Android Application启动流程分析](http://www.jianshu.com/p/a5532ecc8377)

**总结**


* 用户点击 Launcher中应用Icon

* Launcher App 发起 Intent 启动对应App的 MainActivity  

* Launcher App Activity 将对应的数据通过 ActivityManagerProxy 传输到 AMS  

* AMS 对请求做权限等检测，若权限检测通过则进一步检测对应的 processRecord等信息  

* 若进程不存在或进程不可复用则重启一个，Zygote.main() fork VM  

* 进一步创建ActivityThread 并将创建的ActivityThread 启动的 Application信息绑定   

* 绑定成功后此时目标应用进程已存在，则开始从已存在进程中启动对应Activity的流程  

* ApplicationThread中的scheduleLauncheActivity（）开始处理流程


### ActivityManager(Client) 与 ActivityManagerService通信过程：

核心类：

* IActivityManager

* ActivityManagerNative  extends Binder implements IActivityManager

* ActivityManagerService extends ActivityManagerNative

* ActivityManagerProxy  

* ActivityThread： 管理应用进程(应用Apk（不等于系统Apk- Framwork.apk等）运行所在的进程，由Zygote Fork而生)的主线程，（系统进程——SystemServer以及Zygote）

{% highlight java %}

ActivityManager.Action:

/**
 * Get the list of tasks associated with the calling application.
 *
 * @return The list of tasks associated with the application making this call.
 * @throws SecurityException
 */
public List<ActivityManager.AppTask> getAppTasks() {
    ArrayList<AppTask> tasks = new ArrayList<AppTask>();
    List<IAppTask> appTasks;
    try {
        appTasks = ActivityManagerNative.getDefault().getAppTasks(mContext.getPackageName());
    } catch (RemoteException e) {
        throw e.rethrowFromSystemServer();
    }
    int numAppTasks = appTasks.size();
    for (int i = 0; i < numAppTasks; i++) {
        tasks.add(new AppTask(appTasks.get(i)));
    }
    return tasks;
}


ActivityManagerNative.getDegault():
/**
 * Retrieve the system's default/global activity manager.
 */
static public IActivityManager getDefault() {
    return gDefault.get();
}

ActivityManagerNative.gDefault:
private static final Singleton<IActivityManager> gDefault = new Singleton<IActivityManager>() {
    protected IActivityManager create() {
        IBinder b = ServiceManager.getService("activity");
        if (false) {
            Log.v("ActivityManager", "default service binder = " + b);
        }
        IActivityManager am = asInterface(b);
        if (false) {
            Log.v("ActivityManager", "default service = " + am);
        }
        return am;
    }
};


// 获取对应Service的 Binder对象

/**
 * Returns a reference to a service with the given name.
 *
 * @param name the name of the service to get
 * @return a reference to the service, or <code>null</code> if the service doesn't exist
 */
public static IBinder getService(String name) {
    try {
        IBinder service = sCache.get(name);
        if (service != null) {
            return service;
        } else {
            return getIServiceManager().getService(name);
        }
    } catch (RemoteException e) {
        Log.e(TAG, "error in getService", e);
    }
    return null;
}



// ActivityManager 最终调用的 ClientProxy

/**
 * Cast a Binder object into an activity manager interface, generating
 * a proxy if needed.
 */
static public IActivityManager asInterface(IBinder obj) {
    if (obj == null) {
        return null;
    }
    IActivityManager in =
        (IActivityManager)obj.queryLocalInterface(descriptor);
    if (in != null) {
        return in;
    }

    // 从 ServiceManager中获取的 Binder对象传给 Proxy，
    // 作为客户端发起请求时的 RemoteBinder对象
    return new ActivityManagerProxy(obj);
}

// 实际的Action 通过 mRemote.transact(data) 传输

// ActivityManagerService.onTransact(code) 映射对应Action*


{% endhighlight %}

[深入理解 Android：ActivityManagerService](https://blog.rinc.xyz/posts/150414-android-framework-ams/)

ActivetyStack

### WMS  

* Surface

* WMS

* SurfaceFlinger

{% highlight java %}

// WMS 初始化  
//
public static WindowManagerService main(final Context context,
            final InputManagerService im,
            final boolean haveInputMethods, final boolean showBootMsgs,
            final boolean onlyCore) {
        final WindowManagerService[] holder = new WindowManagerService[1];
        DisplayThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {
                holder[0] = new WindowManagerService(context, im,
                        haveInputMethods, showBootMsgs, onlyCore);
            }
        }, 0);
        return holder[0];
    }

// os.Handler.runWithScissors
/**
 * Runs the specified task synchronously.
 * <p>
 * If the current thread is the same as the handler thread, then the runnable
 * runs immediately without being enqueued.  Otherwise, posts the runnable
 * to the handler and waits for it to complete before returning.
 */
public final boolean runWithScissors(final Runnable r, long timeout) {
		if (r == null) {
				throw new IllegalArgumentException("runnable must not be null");
		}
		if (timeout < 0) {
				throw new IllegalArgumentException("timeout must be non-negative");
		}

		if (Looper.myLooper() == mLooper) {
				r.run();
				return true;
		}

		BlockingRunnable br = new BlockingRunnable(r);
		return br.postAndWait(this, timeout); // 阻塞函数
}

{% endhighlight %}


### WMS View 管理

{% highlight java %}

/** Interface to let you add and remove child views to an Activity. To get an instance
  * of this class, call {@link android.content.Context#getSystemService(java.lang.String) Context.getSystemService()}.
  */
public interface ViewManager
{
    /**
     * Assign the passed LayoutParams to the passed View and add the view to the window.
     * <p>Throws {@link android.view.WindowManager.BadTokenException} for certain programming
     * errors, such as adding a second view to a window without removing the first view.
     * <p>Throws {@link android.view.WindowManager.InvalidDisplayException} if the window is on a
     * secondary {@link Display} and the specified display can't be found
     * (see {@link android.app.Presentation}).
     * @param view The view to be added to this window.
     * @param params The LayoutParams to assign to view.
     */
    public void addView(View view, ViewGroup.LayoutParams params);
    public void updateViewLayout(View view, ViewGroup.LayoutParams params);
    public void removeView(View view);
}

{% endhighlight %}

核心流程：

* Activity.attach() => 初始化工作构建 PhoneWindow 注入WMS

* setContentView() => 构建DecorView  

* Activity.setVisible() => 与WMS通信 利用 ViewRootImpl的setView从而与WMS通信，AddView(DecorView)，显示DecorView


### Service的Context无法构建Dialog的原因

{% highlight java %}

// Activity.attach()

mWindow.setWindowManager(
				(WindowManager)context.getSystemService(Context.WINDOW_SERVICE),
				mToken, mComponent.flattenToString(),
				(info.flags & ActivityInfo.FLAG_HARDWARE_ACCELERATED) != 0);

// Activity.getSystemService()

public Object getSystemService(@ServiceName @NonNull String name) {
		if (getBaseContext() == null) {
				throw new IllegalStateException(
								"System services not available to Activities before onCreate()");
		}

		if (WINDOW_SERVICE.equals(name)) {
				return mWindowManager;
		} else if (SEARCH_SERVICE.equals(name)) {
				ensureSearchManager();
				return mSearchManager;
		}
		return super.getSystemService(name);
}

{% endhighlight %}

从上面可以看出 Activity 获取到的WMS与在Service中的默认WMS是有差异的，Activity的getSystemService函数被重写，如果获取WMS则获取进行过Attach注入的 WindowManager；

Activity 中WindowManager的构造实际是 WindowManagerImp，WindowmanagerImp 本质是 WindowManagerGlobal 的封装代理，同时WindowManagerImp保持了 PhoneWindow以及 Display信息以及 WindowToken；孤儿Activity.WindowManager其 addView 实现最终本质由 WindowManagerGlobal 利用 ViewRootImp.setView()完成；

{% highlight java %}

void makeVisible() {
		if (!mWindowAdded) {
				ViewManager wm = getWindowManager();
				wm.addView(mDecor, getWindow().getAttributes());
				mWindowAdded = true;
		}
		mDecor.setVisibility(View.VISIBLE);
}


{% endhighlight %}

利用 ViewRootImp setView中 添加的View实际上就是 PhoneWindow中的 DecorView；

{% highlight java %}

// ViewRootImp 构造函数

 mWindowSession = WindowManagerGlobal.getWindowSession();

//ViewRootImp.setView

res = mWindowSession.addToDisplay(mWindow, mSeq, mWindowAttributes,
                            getHostVisibility(), mDisplay.getDisplayId(),
                            mAttachInfo.mContentInsets, mAttachInfo.mStableInsets,
                            mAttachInfo.mOutsets, mInputChannel);

{% endhighlight %}

由于Android Binder通信的 CS架构，这里Session借用了 WebServer中的概念，Session由 WMS.openSession() 获取，最终 调用 WMS.addWindow()

{% highlight java %}

//WindowManagerService.addWindow
public int addWindow(Session session, IWindow client, int seq,
				WindowManager.LayoutParams attrs, int viewVisibility, int displayId,
				Rect outContentInsets, Rect outStableInsets, Rect outOutsets,
				InputChannel outInputChannel) ;


{% endhighlight %}

### WMS 事件分发相关：

[Android中MotionEvent的来源和ViewRootImpl](http://blog.csdn.net/singwhatiwanna/article/details/50775201)

[Android中事件传递分析](http://zjutkz.net/2016/11/17/Android%E4%B8%AD%E4%BA%8B%E4%BB%B6%E4%BC%A0%E9%80%92%E5%88%86%E6%9E%90/)
