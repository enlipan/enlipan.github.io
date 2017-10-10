---
layout: post
title:  ReactNative 原理 
category: android
keywords: [improvement,android]
---

**凡你能说的，你说清楚；凡你不能说清楚的，留给沉默 - 维特根斯坦**

Java 与 Native 的 JNI单向通信, Java - Native - jscore 的异步通信过程,异步回调形式得到调用结果;

先来回顾一下 JNI 的相关:

> JNI 中 Native 调用 Java 函数通过类名反射找到 class, 进而依据函数名寻找函数标识 ID ,从而调用该method;值得注意的是若函数属于非静态函数,我们需要构建类实例对象才能进一步调用函数;



### ReactNative 通信 

Native Java 端: 

ReactNativeHost 定义 : getPackages() -> 默认: MainReactPackage

/*defining basic modules and view managers*/
MainReactPackage


自定义 NativeModule 时,注册 Package,如 自定义 ToastNativePackage,并在初始化时注入 Package;   


追踪ReactActivity 打开的流程,查看 NativeModule 的注册于通信:    


{% highlight java %}
  // ReactActivityDelegate.loadApp
  protected void loadApp(String appKey) {
    if (mReactRootView != null) {
      throw new IllegalStateException("Cannot loadApp while app is already running.");
    }
    mReactRootView = createRootView();
    mReactRootView.startReactApplication(
      getReactNativeHost().getReactInstanceManager(),
      appKey,
      getLaunchOptions());
    getPlainActivity().setContentView(mReactRootView);
  }

 //ReactNativeHost.createReactInstanceManager 
   protected ReactInstanceManager createReactInstanceManager() {
    ReactInstanceManagerBuilder builder = ReactInstanceManager.builder()
      .setApplication(mApplication)
      .setJSMainModulePath(getJSMainModuleName())
      .setUseDeveloperSupport(getUseDeveloperSupport())
      .setRedBoxHandler(getRedBoxHandler())
      .setUIImplementationProvider(getUIImplementationProvider())
      .setInitialLifecycleState(LifecycleState.BEFORE_CREATE);

    for (ReactPackage reactPackage : getPackages()) {
      builder.addPackage(reactPackage);
    }

    String jsBundleFile = getJSBundleFile();
    if (jsBundleFile != null) {
      builder.setJSBundleFile(jsBundleFile);
    } else {
      builder.setBundleAssetName(Assertions.assertNotNull(getBundleAssetName()));
    }
    return builder.build();
  }
  
  // ReactInstanceManager.recreateReactContextInBackgroundInner 
  // 构建 NativeModuleRegistry  注入  
    NativeModuleRegistry nativeModuleRegistry = processPackages(reactContext, mPackages, false);  
    ... 
    CatalystInstanceImpl.Builder catalystInstanceBuilder = new CatalystInstanceImpl.Builder()
      .setReactQueueConfigurationSpec(mUseSeparateUIBackgroundThread ?
        ReactQueueConfigurationSpec.createWithSeparateUIBackgroundThread() :
        ReactQueueConfigurationSpec.createDefault())
      .setJSExecutor(jsExecutor)
      .setRegistry(nativeModuleRegistry)
      .setJSBundleLoader(jsBundleLoader)
      .setNativeModuleCallExceptionHandler(exceptionHandler);
    // Native Method  
    // CatalystInstanceImpl.initializeBridge
  private native void initializeBridge(
      ReactCallback callback,
      JavaScriptExecutor jsExecutor,
      MessageQueueThread jsQueue,
      MessageQueueThread moduleQueue,
      MessageQueueThread uiBackgroundQueue,
      Collection<JavaModuleWrapper> javaModules,
      Collection<ModuleHolder> cxxModules);
{% endhighlight %}


JavaScript 端: 



// CatalystInstanceImpl.getJSModule
// 动态代理  









---

Quote:

[主流程及 Java 与 JS 双边通信](http://blog.csdn.net/yanbober/article/details/53157456)

[ReactNativeAndroid源码分析-Js如何调用Native的代码](https://zhuanlan.zhihu.com/p/20464825)

[React-Native系列Android](http://blog.csdn.net/MegatronKings/article/details/51138499)

[探究react-native通信机制](http://zjutkz.net/2016/05/03/%E5%85%B6%E5%AE%9E%E6%B2%A1%E9%82%A3%E4%B9%88%E5%A4%8D%E6%9D%82%EF%BC%81%E6%8E%A2%E7%A9%B6react-native%E9%80%9A%E4%BF%A1%E6%9C%BA%E5%88%B6/)

[JNI 原理](http://gityuan.com/2016/05/28/android-jni/)

[JNI Tips](https://developer.android.com/training/articles/perf-jni.html)