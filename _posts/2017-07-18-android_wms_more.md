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

WMS 作为Android 中 Window的管理者，Window是什么？Activity是Window，Toast，stateBar，都是Window；WMS构建 Surface，View 的绘制Draw本质是绘制于 Surface中，绘制的Surface对象实现了 Parcelable接口，该对象最终由 SurfaceFinger接受并绘制到屏幕上；



### Binder  


#### BinderToken

Binder 做身份认证，在整个系统进程管理中，每个进程有一个独特的身份标识BinderToken，该机制以BinderDriver为基础；

在Client 与 RemoteService通信时，BinderToken贯穿整个过程，事实上这与我们后台身份的Token校验时一致的，在创建获取Service时，Binder被双方作为通信身份确认工具，在通信结束，Service也注销Token；

引用 PowerManager的acquire与release过程；

{% highlight java %}

public final class PowerManager {

  // Our handle on the global power manager service.
  private final IPowerManager mService;

  public WakeLock newWakeLock(int levelAndFlags, String tag) {
    return new WakeLock(levelAndFlags, tag);
  }

  public final class WakeLock {
    private final IBinder mToken;
    private final int mFlags;
    private final String mTag;

    WakeLock(int flags, String tag) {
      // Create a token that uniquely identifies this wake lock.
      mToken = new Binder();
      mFlags = flags;
      mTag = tag;
    }

    public void acquire() {
                // Do this even if the wake lock is already thought to be held (mHeld == true)
                // because non-reference counted wake locks are not always properly released.
                // For example, the keyguard's wake lock might be forcibly released by the
                // power manager without the keyguard knowing.  A subsequent call to acquire
                // should immediately acquire the wake lock once again despite never having
                // been explicitly released by the keyguard.
                mHandler.removeCallbacks(mReleaser);

      // Send the power manager service a request to acquire a wake
      // lock for the application. Include the token as part of the
      // request so that the power manager service can validate the
      // application's identity when it requests to release the wake
      // lock later on.
      mService.acquireWakeLock(mToken, mFlags, mTag, mPackageName, mWorkSource,
                            mHistoryTag);
    }

     public void release(int flags) {
            synchronized (mToken) {
                if (!mRefCounted || --mCount == 0) {
                    mHandler.removeCallbacks(mReleaser);
                    if (mHeld) {
                        Trace.asyncTraceEnd(Trace.TRACE_TAG_POWER, mTraceName, 0);
                        try {
                            // Send the power manager service a request to release the
                            // wake lock associated with 'mToken'.
                            mService.releaseWakeLock(mToken, flags);
                        } catch (RemoteException e) {
                            throw e.rethrowFromSystemServer();
                        }
                        mHeld = false;
                    }
                }
                if (mCount < 0) {
                    throw new RuntimeException("WakeLock under-locked " + mTag);
                }
            }
        }
  }

{% endhighlight %}

#### WindowToken 

一种类似于BinderToken的身份校验机制，WindowManagerService用于处理身份校验；Token顾名思义作为一种安全机制，而对于WMS这一C/S 架构，WindowToken被用于防止恶意应用在其他应用Window上显示恶意页面，欺诈用户；Application在请求应用add/removeView时需要出示相应的Token，如果Token身份校验不匹配将提示 BadTokenException；

*  应用在初次启动进程时，AMS创建 Application WindowToken 用于标识应用的顶级Windowr容器，ActivityManager将该Token传递给Application以及WindowManager， 在后续的Application请求相关操作中，以此为令牌作为身份验证工具，如弹起收起软键盘，添加View等等;

在利用WindowManager addView时，有一个对应的 WindowManager.LayoutParams,其中有一个变量 token，在AddView时有对应的Token校验，当然也是安全性校验，如果利用 WindowManager.addView()需要设置对应的 token参数，而利用 Activity.getWindowManger()时，其Token已经被默认设定为 defaultToken，所以无需再指定；

> SystemAlert 类型的Token属例外

{% highlight java %}

    @Override
    public void addView(@NonNull View view, @NonNull ViewGroup.LayoutParams params) {
        applyDefaultToken(params);
        mGlobal.addView(view, params, mContext.getDisplay(), mParentWindow);
    }

    private void applyDefaultToken(@NonNull ViewGroup.LayoutParams params) {
        // Only use the default token if we don't have a parent window.
        if (mDefaultToken != null && mParentWindow == null) {
            if (!(params instanceof WindowManager.LayoutParams)) {
                throw new IllegalArgumentException("Params must be WindowManager.LayoutParams");
            }

            // Only use the default token if we don't already have a token.
            final WindowManager.LayoutParams wparams = (WindowManager.LayoutParams) params;
            if (wparams.token == null) {
                wparams.token = mDefaultToken;
            }
        }
    }

{% endhighlight %}



---

Quote：

[Android绘制优化----系统显示原理](https://zhuanlan.zhihu.com/p/27344882)

[Android 显示原理简介](http://djt.qq.com/article/view/987)

[Binders & Window Tokens](http://www.androiddesignpatterns.com/2013/07/binders-window-tokens.html)

[为什么Dialog不能用Application的Context](http://www.jianshu.com/p/628ac6b68c15)

[深入理解 Android 控件](https://pqpo.me/2017/07/01/learn-android-view/)

[Android系统窗口管理服务](http://www.chopiter.com/window_manager_service/)
