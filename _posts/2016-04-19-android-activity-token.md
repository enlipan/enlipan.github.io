---
layout: post
title: Android Activity Token
category: android
---

Binder是构建Android系统的基石，是IPC通信机制的抽象，被用于 Android 安全IPC访问机制的校验Token，用于系统安全性校验，使应用与应用以及应用于系统服务之间的通信实现更加简单；

每一个Binder 对象实例由 Binder驱动赋予了一项特性，其在整个系统进程中都是唯一存在，具有独立标识作用，Token一旦被创建，其他应用或进程无法创建一个同样的Token，其这一特性使其被用于多进程IPC通讯时，安全校验Token机制，用于请求客户端与响应服务端之间的身份校验；


Activity Token 相关的源码解析：


{% highlight java %}

//ActivityStackSupervisor
final int startActivityLocked(IApplicationThread caller,
            Intent intent, String resolvedType, ActivityInfo aInfo,
            IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
            IBinder resultTo, String resultWho, int requestCode,
            int callingPid, int callingUid, String callingPackage,
            int realCallingPid, int realCallingUid, int startFlags, Bundle options,
            boolean ignoreTargetSecurity, boolean componentSpecified, ActivityRecord[] outActivity,
            ActivityContainer container, TaskRecord inTask) {
              ......
              ActivityRecord r = new ActivityRecord(mService, callerApp, callingUid, callingPackage,
              intent, resolvedType, aInfo, mService.mConfiguration, resultRecord, resultWho,
              requestCode, componentSpecified, voiceSession != null, this, container, options);
              ......
            }

///////////////////////////////////////////////////////////////////////////////////////////////////////
// Window Manager Token的构造，利用 ActivityManagerService 与 ActivityRecord 实例构造Token；
      final ActivityManagerService service; // owner
      final IApplicationToken.Stub appToken; // window manager token
       ActivityRecord(ActivityManagerService _service, ProcessRecord _caller,
                    int _launchedFromUid, String _launchedFromPackage, Intent _intent, String _resolvedType,
                    ActivityInfo aInfo, Configuration _configuration,
                    ActivityRecord _resultTo, String _resultWho, int _reqCode,
                    boolean _componentSpecified, boolean _rootVoiceInteraction,
                    ActivityStackSupervisor supervisor,
                    ActivityContainer container, Bundle options) {
                service = _service;
                appToken = new Token(this, service);
                ......


///////////////////////////////////////////////////////////////////////////////
// targetStack
/**
 * State and management of a single stack of activities.
 */
final class ActivityStack {

  final void startActivityLocked(ActivityRecord r, boolean newTask,
          boolean doResume, boolean keepCurTransition, Bundle options) {
              ..............
              // WindowManagerService  中添加ActivityRecord中构造的appToken，以便后期安全校验
                mWindowManager.addAppToken(task.mActivities.indexOf(r),
                        r.appToken, r.task.taskId, mStackId, r.info.screenOrientation, r.fullscreen,
                        (r.info.flags & ActivityInfo.FLAG_SHOW_FOR_ALL_USERS) != 0, r.userId,
                        r.info.configChanges, task.voiceSession != null, r.mLaunchTaskBehind);
                boolean doShow = true;
                if (newTask) {
                    // Even though this activity is starting fresh, we still need
                    // to reset it to make sure we apply affinities to move any
                    // existing activities from other tasks in to it.
                    // If the caller has requested that the target task be
                    // reset, then do so.
                    if ((r.intent.getFlags() & Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED) != 0) {
                        resetTaskIfNeededLocked(r, r);
                        doShow = topRunningNonDelayedActivityLocked(null) == r;
                    }
                } else if (options != null && new ActivityOptions(options).getAnimationType()
                        == ActivityOptions.ANIM_SCENE_TRANSITION) {
                    doShow = false;
                }
                if (r.mLaunchTaskBehind) {
                    // Don't do a starting window for mLaunchTaskBehind. More importantly make sure we
                    // tell WindowManager that r is visible even though it is at the back of the stack.
                    mWindowManager.setAppVisibility(r.appToken, true);
                    ensureActivitiesVisibleLocked(null, 0);
                } else if (SHOW_APP_STARTING_PREVIEW && doShow) {
                    // Figure out if we are transitioning from another activity that is
                    // "has the same starting icon" as the next one.  This allows the
                    // window manager to keep the previous window it had previously
                    // created, if it still had one.
                    ActivityRecord prev = mResumedActivity;

/////////////////////////////////////////////////////////////////////////
//Activity的启动时的Token传递
//Activity 启动
app.thread.scheduleLaunchActivity(new Intent(r.intent), r.appToken,
                  System.identityHashCode(r), r.info, new Configuration(mService.mConfiguration),
                  new Configuration(stack.mOverrideConfig), r.compat, r.launchedFromPackage,
                  task.voiceInteractor, app.repProcState, r.icicle, r.persistentState, results,
                  newIntents, !andResume, mService.isNextTransitionForward(), profilerInfo);


//Token的绑定  绑定 PhoneWindow中Token -- PhoneWindow WindowManagerService
// Activity Token  PhoneWindow Token 一致性；
private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
                  ......
                  activity.attach(appContext, this, getInstrumentation(), r.token,
                  r.ident, app, r.intent, r.activityInfo, title, r.parent,
                  r.embeddedID, r.lastNonConfigurationInstances, config,
                  r.referrer, r.voiceInteractor);


//Token 校验
//ActivityThread
private void handleLaunchActivity(ActivityClientRecord r, Intent customIntent) {
    // If we are getting ready to gc after going to the background, well
    // we are back active so skip it.
    unscheduleGcIdler();
    mSomeActivitiesChanged = true;

    if (r.profilerInfo != null) {
        mProfiler.setProfiler(r.profilerInfo);
        mProfiler.startProfiling();
    }

    // Make sure we are running with the most recent config.
    handleConfigurationChanged(null, null);

    if (localLOGV) Slog.v(
        TAG, "Handling launch of " + r);

    // Initialize before creating the activity
    WindowManagerGlobal.initialize();
    // Activity OnCreate 以及 Onstart 生命周期函数
    Activity a = performLaunchActivity(r, customIntent);

    if (a != null) {
        r.createdConfig = new Configuration(mConfiguration);
        Bundle oldState = r.state;
        handleResumeActivity(r.token, false, r.isForward,
                !r.activity.mFinished && !r.startsNotResumed);
/////////////////////////////////////////////////////////////////////////                
final void handleResumeActivity(IBinder token,
        boolean clearHide, boolean isForward, boolean reallyResume) {
          ...
          if (r.activity.mVisibleFromClient) {
              r.activity.makeVisible();
          }
          ...

//Activity
public void setContentView(View view) {
    getWindow().setContentView(view);
    initWindowDecorActionBar();
}

//PhoneWindow
//构造 DecorView
public void setContentView(View view, ViewGroup.LayoutParams params) {
        // Note: FEATURE_CONTENT_TRANSITIONS may be set in the process of installing the window
        // decor, when theme attributes and the like are crystalized. Do not check the feature
        // before this happens.
        if (mContentParent == null) {
            installDecor();
        } else if (!hasFeature(FEATURE_CONTENT_TRANSITIONS)) {
            mContentParent.removeAllViews();
        }

void makeVisible() {
    if (!mWindowAdded) {
        ViewManager wm = getWindowManager();
        wm.addView(mDecor, getWindow().getAttributes());
        mWindowAdded = true;
    }
    mDecor.setVisibility(View.VISIBLE);
}


//WindowManager 的桥接委托实现， WindowManagerGlobal中 addView
public void addView(View view, ViewGroup.LayoutParams params,
         Display display, Window parentWindow) {
     ...
     root = new ViewRootImpl(view.getContext(), display);
      // do this last because it fires off messages to start doing things
      try {
          root.setView(view, wparams, panelParentView);
      } catch (RuntimeException e) {
          // BadTokenException or InvalidDisplayException, clean up.
          synchronized (mLock) {
              final int index = findViewLocked(view, false);
              if (index >= 0) {
                  removeViewLocked(index, true);
              }
          }
          throw e;
      }

//真正的AddView 绘制在 ViewRootImp中完成setView();
public void setView(View view, WindowManager.LayoutParams attrs, View panelParentView) {
            ...
                try {
                    ...
                    res = mWindowSession.addToDisplay(mWindow, mSeq, mWindowAttributes,
                            getHostVisibility(), mDisplay.getDisplayId(),
                            mAttachInfo.mContentInsets, mAttachInfo.mStableInsets,
                            mAttachInfo.mOutsets, mInputChannel);
                } catch (RemoteException e) {
                      ...
                    throw new RuntimeException("Adding window failed", e);
                } finally {
                    if (restore) {
                        attrs.restore();
                    }
                }

                if (mTranslator != null) {
                    mTranslator.translateRectInScreenToAppWindow(mAttachInfo.mContentInsets);
                }
                ...
                if (DEBUG_LAYOUT) Log.v(TAG, "Added window " + mWindow);
                if (res < WindowManagerGlobal.ADD_OKAY) {
                    ...
                    switch (res) {
                        case WindowManagerGlobal.ADD_BAD_APP_TOKEN:
                        case WindowManagerGlobal.ADD_BAD_SUBWINDOW_TOKEN:
                            throw new WindowManager.BadTokenException(
                                    "Unable to add window -- token " + attrs.token
                                    + " is not valid; is your activity running?");
                        case WindowManagerGlobal.ADD_NOT_APP_TOKEN:
                            throw new WindowManager.BadTokenException(
                                    "Unable to add window -- token " + attrs.token
                                    + " is not for an application");
                        case WindowManagerGlobal.ADD_APP_EXITING:
                            throw new WindowManager.BadTokenException(
                                    "Unable to add window -- app for token " + attrs.token
                                    + " is exiting");
                          ...

//各种 Token 异常最终出现
// mWindowSession 最终完成window 的添加过程，mWindowSession实现Session是一个Binder对象，即证明 Window的添加是一个 C/S IPC 过程，Token用于 C/S 安全校验；

{% endhighlight %}

如上，针对 Window 相关的Token校验机制，防止了其他恶意或未授权进程操纵本地安全App的显示窗口，导致未知性安全性问题；所以可以看出 Binder 其实是 Android 的沙箱机制以及 Linux进程隔离机制的核心基础；

---

Quote:

[Binders & Window Tokens](http://www.androiddesignpatterns.com/2013/07/binders-window-tokens.html)
