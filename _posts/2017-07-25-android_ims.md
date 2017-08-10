---
layout: post
title: Android InputManagerService
category: android
keywords: [java, improvement]
---


Android的CS架构，对应的系统事务都有对应的Service管理，InputManagerService 负责系统的输入部分，包括键盘，鼠标，触摸屏相关的输入事件服务管理；


{% highlight java %}

//SystemServer.main()

//SystemServer.startOtherServices()
...
traceBeginAndSlog("StartInputManagerService");
// context  =  mSystemContext = activityThread.getSystemContext();
inputManager = new InputManagerService(context);
Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);

traceBeginAndSlog("StartWindowManagerService");
wm = WindowManagerService.main(context, inputManager,
        mFactoryTestMode != FactoryTest.FACTORY_TEST_LOW_LEVEL,
        !mFirstBoot, mOnlyCore);
ServiceManager.addService(Context.WINDOW_SERVICE, wm);
ServiceManager.addService(Context.INPUT_SERVICE, inputManager);
Trace.traceEnd(Trace.TRACE_TAG_SYSTEM_SERVER);
...
// WindowManagerCallBack = InputMonitor extentds InputManagerService.WindowManagerCallbacks
inputManager.setWindowManagerCallbacks(wm.getInputMonitor());
inputManager.start();
...


// InputManagerService 
    public InputManagerService(Context context) {
        this.mContext = context;
        this.mHandler = new InputManagerHandler(DisplayThread.get().getLooper());

        mUseDevInputEventForAudioJack =
                context.getResources().getBoolean(R.bool.config_useDevInputEventForAudioJack);
        Slog.i(TAG, "Initializing input manager, mUseDevInputEventForAudioJack="
                + mUseDevInputEventForAudioJack);
        // Native InputManagerService 对象的地址指针，Java层保存该指针进行操作
        mPtr = nativeInit(this, mContext, mHandler.getLooper().getQueue());

        String doubleTouchGestureEnablePath = context.getResources().getString(
                R.string.config_doubleTouchGestureEnableFile);
        mDoubleTouchGestureEnableFile = TextUtils.isEmpty(doubleTouchGestureEnablePath) ? null :
            new File(doubleTouchGestureEnablePath);

        LocalServices.addService(InputManagerInternal.class, new LocalService());
    }


{% endhighlight %}

两个Native函数，我们看到Init 将 Im的指针地址转换之后return，也即是保存了Native对象地址：

{% highlight cpp %}

static jlong nativeInit(JNIEnv* env, jclass /* clazz */,
        jobject serviceObj, jobject contextObj, jobject messageQueueObj) {
    sp<MessageQueue> messageQueue = android_os_MessageQueue_getMessageQueue(env, messageQueueObj);
    if (messageQueue == NULL) {
        jniThrowRuntimeException(env, "MessageQueue is not initialized.");
        return 0;
    }

    NativeInputManager* im = new NativeInputManager(contextObj, serviceObj,
            messageQueue->getLooper());
    im->incStrong(0);
    return reinterpret_cast<jlong>(im);
}

static void nativeStart(JNIEnv* env, jclass /* clazz */, jlong ptr) {
    NativeInputManager* im = reinterpret_cast<NativeInputManager*>(ptr);

    status_t result = im->getInputManager()->start();
    if (result) {
        jniThrowRuntimeException(env, "Input manager could not be started.");
    }
}


status_t InputManager::start() {
    status_t result = mDispatcherThread->run("InputDispatcher", PRIORITY_URGENT_DISPLAY);
    if (result) {
        ALOGE("Could not start InputDispatcher thread due to error %d.", result);
        return result;
    }

    result = mReaderThread->run("InputReader", PRIORITY_URGENT_DISPLAY);
    if (result) {
        ALOGE("Could not start InputReader thread due to error %d.", result);

        mDispatcherThread->requestExit();
        return result;
    }

    return OK;
}

{% endhighlight %}


IME的软键盘也属于一个WindowState，被WMS管理，InputManagerService 通过CallBack 与WMS联动；事实上我们在这个CallBack总还能看到许多熟悉的事件处理如： Input的 ANRLog处理等等，这里不做赘述；

那么我们来看看核心 View与INS之间的联系是如何建立的，输入事件是如何被管理的？  

先来看看 View的Add过程：

{% highlight java %}
    // WindowSession 的构造，与WMS通信开启 Session时传入了 imm
    public static IWindowSession getWindowSession() {
        synchronized (WindowManagerGlobal.class) {
            if (sWindowSession == null) {
                try {
                    InputMethodManager imm = InputMethodManager.getInstance();
                    IWindowManager windowManager = getWindowManagerService();
                    sWindowSession = windowManager.openSession(
                            new IWindowSessionCallback.Stub() {
                                @Override
                                public void onAnimatorScaleChanged(float scale) {
                                    ValueAnimator.setDurationScale(scale);
                                }
                            },
                            imm.getClient(), imm.getInputContext());
                } catch (RemoteException e) {
                    throw e.rethrowFromSystemServer();
                }
            }
            return sWindowSession;
        }
    }


//ViewRootImp.setView()  
// 我们寻找我们关心的与 Input相关的  
// Check Window 中是否有输入特性- 如果有初始化 inputChannel
 if ((mWindowAttributes.inputFeatures
                        & WindowManager.LayoutParams.INPUT_FEATURE_NO_INPUT_CHANNEL) == 0) {
                    mInputChannel = new InputChannel();
                }
                mForceDecorViewVisibility = (mWindowAttributes.privateFlags
                        & PRIVATE_FLAG_FORCE_DECOR_VIEW_VISIBILITY) != 0;
                try {
                    ...
                    // WindowSession IPC操作实例类似 服务器的Session回话概念
                    res = mWindowSession.addToDisplay(mWindow, mSeq, mWindowAttributes,
                            getHostVisibility(), mDisplay.getDisplayId(),
                            mAttachInfo.mContentInsets, mAttachInfo.mStableInsets,
                            mAttachInfo.mOutsets, mInputChannel);
                } catch (RemoteException e) {
                    mInputChannel = null;
                    ...
                    throw new RuntimeException("Adding window failed", e);
                } 
                ...
                if (view instanceof RootViewSurfaceTaker) {
                    mInputQueueCallback =
                        ((RootViewSurfaceTaker)view).willYouTakeTheInputQueue();
                }
                if (mInputChannel != null) {
                    if (mInputQueueCallback != null) {
                        mInputQueue = new InputQueue();
                        mInputQueueCallback.onInputQueueCreated(mInputQueue);
                    }
                    // 输入事件接收 Receiver
                    mInputEventReceiver = new WindowInputEventReceiver(mInputChannel,
                            Looper.myLooper());
                }
                ...
                // Set up the input pipeline.  pipeline - 输入管道
                CharSequence counterSuffix = attrs.getTitle();
                mSyntheticInputStage = new SyntheticInputStage();
                InputStage viewPostImeStage = new ViewPostImeInputStage(mSyntheticInputStage);
                InputStage nativePostImeStage = new NativePostImeInputStage(viewPostImeStage,
                        "aq:native-post-ime:" + counterSuffix);
                InputStage earlyPostImeStage = new EarlyPostImeInputStage(nativePostImeStage);
                InputStage imeStage = new ImeInputStage(earlyPostImeStage,
                        "aq:ime:" + counterSuffix);
                InputStage viewPreImeStage = new ViewPreImeInputStage(imeStage);
                InputStage nativePreImeStage = new NativePreImeInputStage(viewPreImeStage,
                        "aq:native-pre-ime:" + counterSuffix);

                mFirstInputStage = nativePreImeStage;
                mFirstPostImeInputStage = earlyPostImeStage;
                mPendingInputEventQueueLengthCounterName = "aq:pending:" + counterSuffix;


{% endhighlight %}


再来看看 `WindowSession.addToDisplay` :  


{% highlight java %}

//WindowSession.addToDisplay   
// ViewRootImp.setView 中构造的 InputChannel 这里成为 outInputChannel 形参
final boolean openInputChannels = (outInputChannel != null
        && (attrs.inputFeatures & INPUT_FEATURE_NO_INPUT_CHANNEL) == 0);
if  (openInputChannels) {
    win.openInputChannel(outInputChannel);
}

// win.openInputChannels  - WindowSate
    void openInputChannel(InputChannel outInputChannel) {
        if (mInputChannel != null) {
            throw new IllegalStateException("Window already has an input channel.");
        }
        String name = makeInputChannelName();
        InputChannel[] inputChannels = InputChannel.openInputChannelPair(name);
        mInputChannel = inputChannels[0]; 
        mClientChannel = inputChannels[1];
        mInputWindowHandle.inputChannel = inputChannels[0];
        if (outInputChannel != null) {
            mClientChannel.transferTo(outInputChannel); 
            mClientChannel.dispose();
            mClientChannel = null;
        } else {
            // If the window died visible, we setup a dummy input channel, so that taps
            // can still detected by input monitor channel, and we can relaunch the app.
            // Create dummy event receiver that simply reports all events as handled.
            mDeadWindowEventReceiver = new DeadWindowEventReceiver(mClientChannel);
        }
        mService.mInputManager.registerInputChannel(mInputChannel, mInputWindowHandle);
    }

        /**
     * Creates a new input channel pair.  One channel should be provided to the input
     * dispatcher and the other to the application's input queue.
     * @param name The descriptive (non-unique) name of the channel pair.
     * @return A pair of input channels.  The first channel is designated as the
     * server channel and should be used to publish input events.  The second channel
     * is designated as the client channel and should be used to consume input events.
     */
    public static InputChannel[] openInputChannelPair(String name) {
        if (name == null) {
            throw new IllegalArgumentException("name must not be null");
        }

        if (DEBUG) {
            Slog.d(TAG, "Opening input channel pair '" + name + "'");
        }
        return nativeOpenInputChannelPair(name);
    }

{% endhighlight %}

outInputChannel 就是外部构造的 InputChannel ，属于 Client形式，而这里的 inputChannels[0] 就属于 remoteInputChannel，后面注册进入 WMS，具体的 openInputChannelPair函数注释写的很清楚，一个Chanel发射事件，而另一个消耗输入事件，这里我们关注的是 ClientInputChannel如何消耗的事件，我们回到 ViewRootImp中对于 这个传入的 outInputChannel 还做了哪些处理：

{% highlight java %}

// 这里就是我们关注的输入事件消耗的接收器，接收到一个个输入事件然后由此路由分发出去
mInputEventReceiver = new WindowInputEventReceiver(mInputChannel,
        Looper.myLooper());
...
//WindowInputEventReceiver.onInputEvent(InputEvent event)
 @Override
public void onInputEvent(InputEvent event) {
    enqueueInputEvent(event, this, 0, true);
}
...
//ViewRootImp.enqueueInputEvent  
void enqueueInputEvent(InputEvent event,
            InputEventReceiver receiver, int flags, boolean processImmediately) {
            ...
        if (processImmediately) { //True 
            doProcessInputEvents();
        } else {
            scheduleProcessInputEvents();
        }
    }

 void doProcessInputEvents() {
        // Deliver all pending input events in the queue.
        while (mPendingInputEventHead != null) {
            ...
            deliverInputEvent(q);
        }

        // We are done processing all input events that we can process right now
        // so we can clear the pending flag immediately.
        if (mProcessInputEventsScheduled) {
            mProcessInputEventsScheduled = false;
            mHandler.removeMessages(MSG_PROCESS_INPUT_EVENTS);
        }
    }

    private void deliverInputEvent(QueuedInputEvent q) {
        ...
        if (stage != null) {
            stage.deliver(q);
        } else {
            finishInputEvent(q);
        }
    }

{% endhighlight %}

这里最终本质 InputEvent由 InputStage处理，而InputStage的构造是在 ViewRootImp.setView中构造，构造时层层封装层链式InputStage，外层的 inputStage优先调用；

所以 viewPreImeStage 这个比实际的 ImeStage先调用，我们再看看 Pre中的事件处理：

{% highlight java %}

    final class ViewPreImeInputStage extends InputStage {
        public ViewPreImeInputStage(InputStage next) {
            super(next);
        }

        @Override
        protected int onProcess(QueuedInputEvent q) {
            if (q.mEvent instanceof KeyEvent) {
                return processKeyEvent(q);
            }
            return FORWARD;
        }

        private int processKeyEvent(QueuedInputEvent q) {
            final KeyEvent event = (KeyEvent)q.mEvent;
            if (mView.dispatchKeyEventPreIme(event)) {
                return FINISH_HANDLED;
            }
            return FORWARD;
        }
    }

{% endhighlight %}

默认KeyEvent处理时， mView.dispatchKeyEventPreIme(event) 返回 false，也就是会进行 forWord链式处理，最终由输入法消耗该 KeyEvent事件；

所以说输入法弹起时 Back事件的截获需要重写该View对应的 dispathKeyEventPreIme()函数管理键盘事件的处理，否则对应的Back事件将由 输入法键盘截获处理，处理为Ime键盘的收起；