---
layout: post
title: Android Activity Start
category: android
---

在之前的IPC 文章中，借助 Android 框架揭秘一书，理清了 服务注册，服务检索，服务使用中的 ContextManager， BinderDriver, ServiceServer ,以及Client之间的流程，这里顺着这个思路，站在前人基础上追踪Activity的完整启动流程以及Activity的通信流程：

{% highlight java %}

public void startActivityForResult(Intent intent, int requestCode, @Nullable Bundle options) {
        Instrumentation.ActivityResult ar =
            mInstrumentation.execStartActivity(
                this, mMainThread.getApplicationThread(), mToken, this,
                intent, requestCode, options);
                ...
              }

//这里注意 WhoThread
public ActivityResult execStartActivity(
        Context who, IBinder contextThread, IBinder token, String target,
        Intent intent, int requestCode, Bundle options) {          
        // ActivityThread 中的 ApplicationThread extends ApplicationThreadNative
        // ApplicationThreadNative extends Binder implements IApplicationThread
        IApplicationThread whoThread = (IApplicationThread) contextThread;

        int result = ActivityManagerNative.getDefault()
            .startActivity(whoThread, who.getBasePackageName(), intent,
                    intent.resolveTypeIfNeeded(who.getContentResolver()),
                    token, target, requestCode, 0, null, options);
        checkStartActivityResult(result, intent);


// ActivityManagerNative.getDefault() 返回一个 包装了 ActivityServiceManager 的 ActivityManagerProxy 实例
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
}

//进一步看 ActivityManagerProxy
public int startActivity(IApplicationThread caller, String callingPackage, Intent intent,
           String resolvedType, IBinder resultTo, String resultWho, int requestCode,
           int startFlags, ProfilerInfo profilerInfo, Bundle options) throws RemoteException {
...
mRemote.transact(START_ACTIVITY_TRANSACTION, data, reply, 0);
...


//进入Service的源码可以看到  ServiceManager 将各类Service利用 HashMap存储对应名称与Service
private static HashMap<String, IBinder> sCache = new HashMap<String, IBinder>();
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

// ActivityManagerService 的继承关系  以及 super.onTransact(code, data, reply, flags);
public final class ActivityManagerService extends ActivityManagerNative
            implements Watchdog.Monitor, BatteryStatsImpl.BatteryCallback {

              @Override
              public boolean onTransact(int code, Parcel data, Parcel reply, int flags)
                      throws RemoteException {
                  if (code == SYSPROPS_TRANSACTION) {
                      // We need to tell all apps about the system property change.
                      ArrayList<IBinder> procs = new ArrayList<IBinder>();
                      synchronized(this) {
                          final int NP = mProcessNames.getMap().size();
                          for (int ip=0; ip<NP; ip++) {
                              SparseArray<ProcessRecord> apps = mProcessNames.getMap().valueAt(ip);
                              final int NA = apps.size();
                              for (int ia=0; ia<NA; ia++) {
                                  ProcessRecord app = apps.valueAt(ia);
                                  if (app.thread != null) {
                                      procs.add(app.thread.asBinder());
                                  }
                              }
                          }
                      }

                      int N = procs.size();
                      for (int i=0; i<N; i++) {
                          Parcel data2 = Parcel.obtain();
                          try {
                              procs.get(i).transact(IBinder.SYSPROPS_TRANSACTION, data2, null, 0);
                          } catch (RemoteException e) {
                          }
                          data2.recycle();
                      }
                  }
                  try {
                      return super.onTransact(code, data, reply, flags);
                  } catch (RuntimeException e) {
                      // The activity manager only throws security exceptions, so let's
                      // log all others.
                      if (!(e instanceof SecurityException)) {
                          Slog.wtf(TAG, "Activity Manager Crash", e);
                      }
                      throw e;
                  }


public abstract class ActivityManagerNative extends Binder implements IActivityManager{
  @Override
  public boolean onTransact(int code, Parcel data, Parcel reply, int flags)
      throws RemoteException {
        switch (code) {
          case START_ACTIVITY_AS_USER_TRANSACTION:
              {
                  data.enforceInterface(IActivityManager.descriptor);
                  IBinder b = data.readStrongBinder();
                  IApplicationThread app = ApplicationThreadNative.asInterface(b);
                  String callingPackage = data.readString();
                  Intent intent = Intent.CREATOR.createFromParcel(data);
                  String resolvedType = data.readString();
                  IBinder resultTo = data.readStrongBinder();
                  String resultWho = data.readString();
                  int requestCode = data.readInt();
                  int startFlags = data.readInt();
                  ProfilerInfo profilerInfo = data.readInt() != 0
                          ? ProfilerInfo.CREATOR.createFromParcel(data) : null;
                  Bundle options = data.readInt() != 0
                          ? Bundle.CREATOR.createFromParcel(data) : null;
                  int userId = data.readInt();
                  int result = startActivityAsUser(app, callingPackage, intent, resolvedType,
                          resultTo, resultWho, requestCode, startFlags, profilerInfo, options, userId);
                  reply.writeNoException();
                  reply.writeInt(result);
                  return true;
        }
        ...  
}


//回过头看  ActivityManagerService.startActivityAsUser()
@Override
public final int startActivityAsUser(IApplicationThread caller, String callingPackage,
        Intent intent, String resolvedType, IBinder resultTo, String resultWho, int requestCode,
        int startFlags, ProfilerInfo profilerInfo, Bundle options, int userId) {
    enforceNotIsolatedCaller("startActivity");
    userId = handleIncomingUser(Binder.getCallingPid(), Binder.getCallingUid(), userId,
            false, ALLOW_FULL_ONLY, "startActivity", null);
    // TODO: Switch to user app stacks here.
    return mStackSupervisor.startActivityMayWait(caller, -1, callingPackage, intent,
            resolvedType, null, null, resultTo, resultWho, requestCode, startFlags,
            profilerInfo, null, null, options, false, userId, null, null);
}


//ActivityStackSupervisor
final int startActivityMayWait(IApplicationThread caller, int callingUid,
          String callingPackage, Intent intent, String resolvedType,
          IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
          IBinder resultTo, String resultWho, int requestCode, int startFlags,
          ProfilerInfo profilerInfo, WaitResult outResult, Configuration config,
          Bundle options, boolean ignoreTargetSecurity, int userId,
          IActivityContainer iContainer, TaskRecord inTask) {
            ........
            int res = startActivityLocked(caller, intent, resolvedType, aInfo,
                    voiceSession, voiceInteractor, resultTo, resultWho,
                    requestCode, callingPid, callingUid, callingPackage,
                    realCallingPid, realCallingUid, startFlags, options, ignoreTargetSecurity,
                    componentSpecified, null, container, inTask);
                    ........



final int startActivityLocked(IApplicationThread caller,
         Intent intent, String resolvedType, ActivityInfo aInfo,
         IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor,
         IBinder resultTo, String resultWho, int requestCode,
         int callingPid, int callingUid, String callingPackage,
         int realCallingPid, int realCallingUid, int startFlags, Bundle options,
         boolean ignoreTargetSecurity, boolean componentSpecified, ActivityRecord[] outActivity,
         ActivityContainer container, TaskRecord inTask) {
             ........
             err = startActivityUncheckedLocked(r, sourceRecord, voiceSession, voiceInteractor,
              startFlags, true, options, inTask);
              if (err < 0) {
                  // If someone asked to have the keyguard dismissed on the next
                  // activity start, but we are not actually doing an activity
                  // switch...  just dismiss the keyguard now, because we
                  // probably want to see whatever is behind it.
                  notifyActivityDrawnForKeyguard();
              }
              return err;


final int startActivityUncheckedLocked(final ActivityRecord r, ActivityRecord sourceRecord,
           IVoiceInteractionSession voiceSession, IVoiceInteractor voiceInteractor, int startFlags,
           boolean doResume, Bundle options, TaskRecord inTask) {
              .....
              targetStack.startActivityLocked(r, newTask, doResume, keepCurTransition, options);

// targetStack
/**
 * State and management of a single stack of activities.
 */
final class ActivityStack {

  final void startActivityLocked(ActivityRecord r, boolean newTask,
          boolean doResume, boolean keepCurTransition, Bundle options) {
              ..............
            if (r.mLaunchTaskBehind) {
                            // Don't do a starting window for mLaunchTaskBehind. More importantly make sure we
                            // tell WindowManager that r is visible even though it is at the back of the stack.
                            mWindowManager.setAppVisibility(r.appToken, true);
                            ensureActivitiesVisibleLocked(null, 0);
                        }
                        ..............


  //注意这里的两种Case   
  // mStackSupervisor.startSpecificActivityLocked(r, noStackActivityResumed, false);  
  //r.app.thread.scheduleOnNewActivityOptions(r.appToken,r.returningOptions);
  //r.app.thread  ActivityRecord中的 ProcessRecord 属性中的 IApplicationThread 接口的实现实例 也就是之前传入的 WhoThread
  /**
   * Make sure that all activities that need to be visible (that is, they
   * currently can be seen by the user) actually are.
   */
  final void ensureActivitiesVisibleLocked(ActivityRecord starting, int configChanges) {              
                  .............

                  if (r.app == null || r.app.thread == null) {
                      // This activity needs to be visible, but isn't even running...
                      // get it started and resume if no other stack in this stack is resumed.
                      if (DEBUG_VISIBILITY) Slog.v(TAG_VISIBILITY,
                              "Start and freeze screen for " + r);
                      if (r != starting) {
                          r.startFreezingScreenLocked(r.app, configChanges);
                      }
                      if (!r.visible || r.mLaunchTaskBehind) {
                          if (DEBUG_VISIBILITY) Slog.v(TAG_VISIBILITY,
                                  "Starting and making visible: " + r);
                          setVisible(r, true);
                      }
                      if (r != starting) {
                          mStackSupervisor.startSpecificActivityLocked(
                                  r, noStackActivityResumed, false);
                          if (activityNdx >= activities.size()) {
                              // Record may be removed if its process needs to restart.
                              activityNdx = activities.size() - 1;
                          } else {
                              noStackActivityResumed = false;
                          }
                      }

                  } else if (r.visible) {
                      // If this activity is already visible, then there is nothing
                      // else to do here.
                      if (DEBUG_VISIBILITY) Slog.v(TAG_VISIBILITY,
                              "Skipping: already visible at " + r);
                      r.stopFreezingScreenLocked(false);
                      try {
                          if (r.returningOptions != null) {
                              r.app.thread.scheduleOnNewActivityOptions(r.appToken,
                                      r.returningOptions);
                          }
                      } catch(RemoteException e) {
                      }

//再看第一种情况下的Activity启动    

mStackSupervisor.startSpecificActivityLocked(
          r, noStackActivityResumed, false);

void startSpecificActivityLocked(ActivityRecord r,
            boolean andResume, boolean checkConfig) {
        // Is this activity's application already running?
        ProcessRecord app = mService.getProcessRecordLocked(r.processName,
                r.info.applicationInfo.uid, true);

        r.task.stack.setLaunchTime(r);

        if (app != null && app.thread != null) {
            try {
                if ((r.info.flags&ActivityInfo.FLAG_MULTIPROCESS) == 0
                        || !"android".equals(r.info.packageName)) {
                    // Don't add this if it is a platform component that is marked
                    // to run in multiple processes, because this is actually
                    // part of the framework so doesn't make sense to track as a
                    // separate apk in the process.
                    app.addPackage(r.info.packageName, r.info.applicationInfo.versionCode,
                            mService.mProcessStats);
                }
                realStartActivityLocked(r, app, andResume, checkConfig);
                return;
            } catch (RemoteException e) {
                Slog.w(TAG, "Exception when starting activity "
                        + r.intent.getComponent().flattenToShortString(), e);
            }

            // If a dead object exception was thrown -- fall through to
            // restart the application.
        }

        mService.startProcessLocked(r.processName, r.info.applicationInfo, true, 0,
                "activity", r.intent.getComponent(), false, false, true);
    }

//熟悉的scheduleLaunchActivity,同样回到了ApplicationThread 实现剩下的就是我们大家耳熟能详的 Application对于Activity的启动流程，在Context的源码分析中作为相关内容纪录过
final boolean realStartActivityLocked(ActivityRecord r,
            ProcessRecord app, boolean andResume, boolean checkConfig)
            throws RemoteException {
              ..........
              app.forceProcessStateUpTo(mService.mTopProcessState);
              app.thread.scheduleLaunchActivity(new Intent(r.intent), r.appToken,
                   System.identityHashCode(r), r.info, new Configuration(mService.mConfiguration),
                   new Configuration(stack.mOverrideConfig), r.compat, r.launchedFromPackage,
                   task.voiceInteractor, app.repProcState, r.icicle, r.persistentState, results,
                   newIntents, !andResume, mService.isNextTransitionForward(), profilerInfo);


{% endhighlight %}  

记录了这些，了解到了 Activity的启动流程涉及到的知识非常之多，Android的底层封装之完善，细节屏蔽完整，对于 Proxy代理，以及IPC知识的流程有了完整的认知，可以看到 Activity的核心是 Activity与 ActivityManagerService的交互结合，回过头再进一步阅读 Android框架揭秘，加深对于利用Binder IPC交互的理解；其实这里Activity 作为Client 与 ServiceServer  —— ActivityManagerService 的对应 IPC交互依旧屏蔽，但是我们在外在了解其交互是如何一步步进行下去的依旧是有意义的；


关于源码查找阅读的方法探索：

主要源码阅读工具：  AndroidStudio、SourceInsight，Everthing；其中以AS为主，SourceInsight为辅助，源于很多代码在AS中无法跟踪进入，具体显示为标红代码，这样隐藏了很多细节，在很多情况下对于流程的进一步追踪是有阻碍的；这种情况下，我们可以利用android源码，结合SourceInsight快速定位阅读寻找蛛丝马迹，在某些方法比较长的函数，针对 SouceInsight 对于一些操作不方便的情况下，可以利用Everthing 找到对应Java文件，使用自己喜欢的编辑器打开阅读，条条大路通罗马，找到适合自己的节奏就好；
