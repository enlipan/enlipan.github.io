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

# IBinder接口定义了 Binder IPC的通信协议，BBinder以及BPBinder均为其子类，具有夸进程传输的能力；

* 通过mmap内存映射，其内存映射不仅仅映射进入内核空间同时也映射进入了用户空间，在数据传输时，一次拷贝到内核空间的同时，相当于也同时Copy到了用户空间，高效一次Copy的奥秘，省去内核暂存

* Binder可以通过内部引用计数解决跨进程代理对象的生命周期问题；

### 模型

C/S 模型： Client，Server，ServerManager（通信标志:0- 固定的确定访问地址），以及Binder Driver（Linux 内核驱动）


#### IInterface -> ToBinder

* asBinder() : InterFace 到Binder的转换


#### ToInterface -> BpBinder

* asInterface : Binder 到Client 调用的 RemoteService对应函数的 Interface Delegate的转换

BinderProxy中的业务逻辑函数映射着远程Service中对应的函数，其映射关系由BinderDriver维护

eg：

Client  通过获取到 BinderProxy 向远程Servic发出请求流程：

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

AMS：Android核心服务，类OS中的进程管理与调度模块，负责组建状态的管理；


1. 启动Service：

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

### ActivityManager(Client) 与 ActivityManagerService通信：

核心类：

* IActivityManager

* ActivityManagerNative  

* ActivityManagerProxy

* ActivityManagerService 

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

// ActivityManagerService.onTransact(code) 映射对应Action


{% endhighlight %}

### WMS  
