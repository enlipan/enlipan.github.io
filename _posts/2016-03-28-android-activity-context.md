---
layout: post
title: Android  Context 源码相关
category: android
---

### Context 是什么

如果查看Android 源码，会发现 Activity Service 以及ApplicationContext 都继承自Context，Context代表什么？其实做J2EE开发的会很熟悉这个Context，上下文环境，在程序的运行时构建完善的上下文资源环境，Android中有三种Context的实例，Activity Service 以及ApplicationContext，而BroadCast以及Provider虽然不属于Context实例，其运行却依然离不开Context，BroadCast在 onReceiver()是，会接受到系统传入的Context组件，用于获取上下文资源，进行完整的业务逻辑操作，而Provider 则在其创建时就会获取一个Context组件；


###  Activity 相关Context：

{% highlight java %}

public class Activity extends ContextThemeWrapper
        implements LayoutInflater.Factory2,
        Window.Callback, KeyEvent.Callback,
        OnCreateContextMenuListener, ComponentCallbacks2,
        Window.OnWindowDismissedCallback {


  /**
   * A ContextWrapper that allows you to modify the theme from what is in the
   * wrapped context.
   */
  public class ContextThemeWrapper extends ContextWrapper {


{% endhighlight %}          


ContextThemeWrapper 在 ContextWrapper的基础上封装了一些主题相关的函数与属性;


进一步看Activity的启动相关内容：


{% highlight java %}

public void startActivityForResult(Intent intent, int requestCode, @Nullable Bundle options) {
       if (mParent == null) {
           Instrumentation.ActivityResult ar =
               mInstrumentation.execStartActivity(
                   this, mMainThread.getApplicationThread(), mToken, this,
                   intent, requestCode, options);

/////////////////////////////////////////////////////////////////////////

public ActivityResult execStartActivity(
       Context who, IBinder contextThread, IBinder token, Activity target,
       Intent intent, int requestCode, Bundle options) {
   IApplicationThread whoThread = (IApplicationThread) contextThread;
   Uri referrer = target != null ? target.onProvideReferrer() : null;
   if (referrer != null) {
       intent.putExtra(Intent.EXTRA_REFERRER, referrer);
   }

///////////////////////////////////////////////////////////////
//whoThread 的真面目：
final ApplicationThread mAppThread = new ApplicationThread();
public ApplicationThread getApplicationThread()
{
    return mAppThread;
}

// ApplicationThread —— scheduleLaunchActivity
// we use token to identify this activity without having to send the
// activity itself back to the activity manager. (matters more with ipc)
@Override
public final void scheduleLaunchActivity(Intent intent, IBinder token, int ident,
        ActivityInfo info, Configuration curConfig, Configuration overrideConfig,
        CompatibilityInfo compatInfo, String referrer, IVoiceInteractor voiceInteractor,
        int procState, Bundle state, PersistableBundle persistentState,
        List<ResultInfo> pendingResults, List<ReferrerIntent> pendingNewIntents,
        boolean notResumed, boolean isForward, ProfilerInfo profilerInfo) {

    updateProcessState(procState, false);

    ActivityClientRecord r = new ActivityClientRecord();

    r.token = token;
    r.ident = ident;
    r.intent = intent;
    r.referrer = referrer;
    r.voiceInteractor = voiceInteractor;
    r.activityInfo = info;
    r.compatInfo = compatInfo;
    r.state = state;
    r.persistentState = persistentState;

    r.pendingResults = pendingResults;
    r.pendingIntents = pendingNewIntents;

    r.startsNotResumed = notResumed;
    r.isForward = isForward;

    r.profilerInfo = profilerInfo;

    r.overrideConfig = overrideConfig;
    updatePendingConfiguration(curConfig);

    sendMessage(H.LAUNCH_ACTIVITY, r);
}

//////////////////////////////////////////////////////////
public void handleMessage(Message msg) {
           if (DEBUG_MESSAGES) Slog.v(TAG, ">>> handling: " + codeToString(msg.what));
           switch (msg.what) {
               case LAUNCH_ACTIVITY: {
                   Trace.traceBegin(Trace.TRACE_TAG_ACTIVITY_MANAGER, "activityStart");
                   final ActivityClientRecord r = (ActivityClientRecord) msg.obj;

                   r.packageInfo = getPackageInfoNoCheck(
                           r.activityInfo.applicationInfo, r.compatInfo);
                   handleLaunchActivity(r, null);
                   Trace.traceEnd(Trace.TRACE_TAG_ACTIVITY_MANAGER);
               } break;

////////////////////////////////////////////////////////
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

    Activity a = performLaunchActivity(r, customIntent);

    if (a != null) {
        r.createdConfig = new Configuration(mConfiguration);
        Bundle oldState = r.state;
        handleResumeActivity(r.token, false, r.isForward,
                !r.activity.mFinished && !r.startsNotResumed);

        if (!r.activity.mFinished && r.startsNotResumed) {
            // The activity manager actually wants this one to start out
            // paused, because it needs to be visible but isn't in the
            // foreground.  We accomplish this by going through the
            // normal startup (because activities expect to go through
            // onResume() the first time they run, before their window
            // is displayed), and then pausing it.  However, in this case
            // we do -not- need to do the full pause cycle (of freezing
            // and such) because the activity manager assumes it can just
            // retain the current state it has.
            try {
                r.activity.mCalled = false;
                mInstrumentation.callActivityOnPause(r.activity);
                ............
                int theme = r.activityInfo.getThemeResource();
                if (theme != 0) {
                    activity.setTheme(theme);
                }

/////////////////////////////////////////////////////////

private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
 ......
 if (activity != null) {
    Context appContext = createBaseContextForActivity(r, activity);
    CharSequence title = r.activityInfo.loadLabel(appContext.getPackageManager());
    Configuration config = new Configuration(mCompatConfiguration);
    if (DEBUG_CONFIGURATION) Slog.v(TAG, "Launching activity "
            + r.activityInfo.name + " with config " + config);
    activity.attach(appContext, this, getInstrumentation(), r.token,
            r.ident, app, r.intent, r.activityInfo, title, r.parent,
            r.embeddedID, r.lastNonConfigurationInstances, config,
            r.referrer, r.voiceInteractor);

{% endhighlight %}    
追本溯源，最终我们定位到了 ActivityThread中的 performLaunchActivity；

其实有性能调优经验的同学对这个 performLaunchActivity() 函数应该非常熟悉， TraceView中经常出现这一函数，通过熟悉了Activity的系统性启动流程，我们在性能调优时对于这类函数也会更加敏感，类似的函数还有  performResumeActivity ,都是在TraceView中常见的函数；

另一个我们关注的 Context 也是在 Activity创建之后创建，并且通过 activity.attach() 函数绑定到 Activity中，也就是每一个Activity都会获取到一个与之相关的 Context环境；

这一部分源码的阅读，我主要是站在前人的基础上，舍弃很多细节问题，直奔相关主干，事实上对于大项目源码的阅读也应该立足于整体逻辑，过早的陷入细节很容易不知所云；

除此之外我们看到 handleLaunchActivity中，Activity 实例创建后，由于其需要占用前台交互,上一个Activity Onpause之后，新的Activity才能只能Onresume，获取用户前台交互资源；这和我们的一直理解的逻辑是相吻合的，


### Application 中的 Context 与 Activity中的 Context：

进一步看一看 Application Context与 Activity中 context 差异，

{% highlight java %}

private Context createBaseContextForActivity(ActivityClientRecord r, final Activity activity) {
    int displayId = Display.DEFAULT_DISPLAY;
    try {
        displayId = ActivityManagerNative.getDefault().getActivityDisplayId(r.token);
    } catch (RemoteException e) {
    }

    ContextImpl appContext = ContextImpl.createActivityContext(
            this, r.packageInfo, displayId, r.overrideConfig);
    appContext.setOuterContext(activity);
    Context baseContext = appContext;

    final DisplayManagerGlobal dm = DisplayManagerGlobal.getInstance();
    // For debugging purposes, if the activity's package name contains the value of
    // the "debug.use-second-display" system property as a substring, then show
    // its content on a secondary display if there is one.
    String pkgName = SystemProperties.get("debug.second-display.pkg");
    if (pkgName != null && !pkgName.isEmpty()
            && r.packageInfo.mPackageName.contains(pkgName)) {
        for (int id : dm.getDisplayIds()) {
            if (id != Display.DEFAULT_DISPLAY) {
                Display display =
                        dm.getCompatibleDisplay(id, appContext.getDisplayAdjustments(id));
                baseContext = appContext.createDisplayContext(display);
                break;
            }
        }
    }
    return baseContext;
}

////////////////////////////////////////////////////////////////////////////////////////////
private Activity performLaunchActivity(ActivityClientRecord r, Intent customIntent) {
  ...............
  try {
    Application app = r.packageInfo.makeApplication(false, mInstrumentation);
    ....................

/////////////////////////////////////////////////////////////////////////////////////////////
public Application makeApplication(boolean forceDefaultAppClass,
        Instrumentation instrumentation) {
    if (mApplication != null) {
        return mApplication;
    }

    Application app = null;

    String appClass = mApplicationInfo.className;
    if (forceDefaultAppClass || (appClass == null)) {
        appClass = "android.app.Application";
    }

    try {
        java.lang.ClassLoader cl = getClassLoader();
        if (!mPackageName.equals("android")) {
            initializeJavaContextClassLoader();
        }
        ContextImpl appContext = ContextImpl.createAppContext(mActivityThread, this);
        app = mActivityThread.mInstrumentation.newApplication(
                cl, appClass, appContext);
        appContext.setOuterContext(app);
        ..................

{% endhighlight %}    

Application所绑定的 Context 其mDisplay为 null；



{% highlight java %}

@Override public Object getSystemService(String name) {
    if (LAYOUT_INFLATER_SERVICE.equals(name)) {
        if (mInflater == null) {
            mInflater = LayoutInflater.from(getBaseContext()).cloneInContext(this);
        }
        return mInflater;
    }
    return getBaseContext().getSystemService(name);
}

/**
 * Create a copy of the existing LayoutInflater object, with the copy
 * pointing to a different Context than the original.  This is used by
 * {@link ContextThemeWrapper} to create a new LayoutInflater to go along
 * with the new Context theme.
 *
 * @param newContext The new Context to associate with the new LayoutInflater.
 * May be the same as the original Context if desired.
 *
 * @return Returns a brand spanking new LayoutInflater object associated with
 * the given Context.
 */
public abstract LayoutInflater cloneInContext(Context newContext);


{% endhighlight %}      


今天电面时面试官表示 layoutInflater创建传入 ApplicationContext与 Activity是有差异的，源于Activity继承自 ContextThemeWrapper ,在View创建后的一些主题上会有不一样，所以回过头来自己想看一看，其实其关键不一样的点在于 cloneInContext() 函数，getBaseContext() 二者对应的Context其实所差异并不大，而基于cloneInContext函数创建对应Clone对象且重新绑定Context后，利用 ApplicationContext 创建的加载器所加载的View会使用Android系统默认主题，而使用Activity（Context）则会使用Activity所制定的主题；这是一个很重要的差异；

---

Quote:

《Head First Android Develop》

[Context,What Context?](https://possiblemobile.com/2013/06/context/)

[What is Context in Android?--stackoverflow](http://stackoverflow.com/questions/3572463/what-is-context-in-android)

[Android应用Context详解及源码解析](http://blog.csdn.net/yanbober/article/details/45967639)

[从源码深入理解context](http://souly.cn/%E6%8A%80%E6%9C%AF%E5%8D%9A%E6%96%87/2015/08/19/%E4%BB%8E%E6%BA%90%E7%A0%81%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3context/)
