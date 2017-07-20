---
layout: post
title: Android WindowManagerService
category: android
keywords: [java, improvement]
---


WindowManagerService 从哪来？到哪去？做什么？

* Zygote.forkSystemServer

* SystemServer.main

* SystemServer.startOtherService   

{%  highlight java %}

// SystemServer.startOtherService
//final Context context = mSystemContext;
public ContextImpl getSystemContext() {
    synchronized (this) {
        if (mSystemContext == null) {
           // new ContextImpl(...)
           // 该Context 提供整个上下文环境，WMS,PhoneWindowManager 中的Context都是此对象
            mSystemContext = ContextImpl.createSystemContext(this);
        }
        return mSystemContext;
    }
}



Slog.i(TAG, "Window Manager");
wm = WindowManagerService.main(context, inputManager,
        mFactoryTestMode != FactoryTest.FACTORY_TEST_LOW_LEVEL,
        !mFirstBoot, mOnlyCore);
ServiceManager.addService(Context.WINDOW_SERVICE, wm);
ServiceManager.addService(Context.INPUT_SERVICE, inputManager);

mActivityManagerService.setWindowManager(wm);

inputManager.setWindowManagerCallbacks(wm.getInputMonitor());
inputManager.start();


{% endhighlight %}

* WindowManagerService.main => new WindowManagerService()    


* WindowManagerService 构造   

{% highlight java %}
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

{% endhighlight %}

AMS的构建如上，利用静态方法返回数组对象，由于WMS的构建在Hanlder中构建，利用 final定长数组的形式预先返回地址也是一个巧妙的实现；


* initPolicy 初始化 Policy(PhoneWindowManager)  

{% highlight java %}

    private void initPolicy() {
        UiThread.getHandler().runWithScissors(new Runnable() {
            @Override
            public void run() {
                WindowManagerPolicyThread.set(Thread.currentThread(), Looper.myLooper());
                //final WindowManagerPolicy mPolicy = new PhoneWindowManager();
                // Policy 本质是一个 PhoneWindowManager
                mPolicy.init(mContext, WindowManagerService.this, WindowManagerService.this);
            }
        }, 0);
    }


    public void displayReady() {
        // mDisplays = DisplayManager.getDisplays  
        for (Display display : mDisplays) {
            displayReady(display.getDisplayId());
        }

        synchronized(mWindowMap) {
            final DisplayContent displayContent = getDefaultDisplayContentLocked();
            readForcedDisplayPropertiesLocked(displayContent);
            mDisplayReady = true;
        }

        try {
           // mActivityManager = ActivityManagerNative.getDefault();
            mActivityManager.updateConfiguration(null);
        } catch (RemoteException e) {
        }

        synchronized(mWindowMap) {
            mIsTouchDevice = mContext.getPackageManager().hasSystemFeature(
                    PackageManager.FEATURE_TOUCHSCREEN);
            configureDisplayPolicyLocked(getDefaultDisplayContentLocked());
        }

        try {
            mActivityManager.updateConfiguration(null);
        } catch (RemoteException e) {
        }

        updateCircularDisplayMaskIfNeeded();
    }

{% endhighlight %}


* PhoneWindowManager.mContext = ContextImpl

---

Quote：

[Binders & Window Tokens](http://www.androiddesignpatterns.com/2013/07/binders-window-tokens.html)

[为什么Dialog不能用Application的Context](http://www.jianshu.com/p/628ac6b68c15)

[深入理解 Android 控件](https://pqpo.me/2017/07/01/learn-android-view/)

[Android系统窗口管理服务](http://www.chopiter.com/window_manager_service/)
