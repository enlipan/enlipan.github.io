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

#### 注册

Native  Java 与 JS Module 通信过程通过所构建的注册表完成 Native 模块与 JS 模块之间的通信映射;

ReactNativeHost 中定义getPackages():其中默认添加了基础模块: MainReactPackage

{% highlight java %}

/*defining basic modules and view managers*/
MainReactPackage

{% endhighlight %}

自定义 NativeModule 时,注册 Package,如 自定义 ToastNativePackage,并在初始化时注入 Package;进一步追踪ReactActivity 构建过程,查看 NativeModule 的注册以及通信 Bridge 构建过程:    

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

通过桥梁的形式 Js 端获取到了 Native 端所有注册的 Native模块的信息,当然后期 Js 调用 Java NativeModule 时也是通过Bridge;

#### 通信 

##### Java 调用 Js

核心处理依旧依赖CatalystInstanceImpl处理,结合动态代理机制灵活处理:

{% highlight java %}
  // ReactInstanceManager.attachRootViewToInstance
  // ReactRootView.runApplication
  // CatalystInstanceImpl.getJSModule
  @Override
  public <T extends JavaScriptModule> T getJSModule(Class<T> jsInterface) {
    return mJSModuleRegistry.getJavaScriptModule(this, jsInterface);
  }

  //JavaScriptModuleRegistry.getJavaScriptModule  
  // 熟悉动态代理机制的话会清楚,实际的逻辑在 Handler 如何处理
    public synchronized <T extends JavaScriptModule> T getJavaScriptModule(
      CatalystInstance instance,
      Class<T> moduleInterface) {
    JavaScriptModule module = mModuleInstances.get(moduleInterface);
    if (module != null) {
      return (T) module;
    }

    JavaScriptModule interfaceProxy = (JavaScriptModule) Proxy.newProxyInstance(
        moduleInterface.getClassLoader(),
        new Class[]{moduleInterface},
        new JavaScriptModuleInvocationHandler(instance, moduleInterface));
    mModuleInstances.put(moduleInterface, interfaceProxy);
    return (T) interfaceProxy;
  }
  //invoke
      @Override
    public @Nullable Object invoke(Object proxy, Method method, @Nullable Object[] args) throws Throwable {
      NativeArray jsArgs = args != null
        ? Arguments.fromJavaArgs(args)
        : new WritableNativeArray();
      mCatalystInstance.callFunction(getJSModuleName(), method.getName(), jsArgs);
      return null;
    }
    // PendingJSCall.call ,再次回到Cpp层,大量的 Cpp, 保证运行效率;
    void call(CatalystInstanceImpl catalystInstance) {
      NativeArray arguments = mArguments != null ? mArguments : new WritableNativeArray();
      catalystInstance.jniCallJSFunction(mModule, mMethod, arguments);
    } 
    // instance.cpp   
    void Instance::callJSFunction(std::string &&module, std::string &&method,
                                  folly::dynamic &&params) {
      callback_->incrementPendingJSCalls();
      nativeToJsBridge_->callFunction(std::move(module), std::move(method),
                                      std::move(params));
    }
{% endhighlight %}

下一步流程将执行 : 

>   JSCExecutor::callFunction => m_callFunctionReturnFlushedQueueJS->callAsFunction         
>   Value.Cpp => callAsFunction函数调用 JSC_JSObjectCallAsFunction      
>   JSC_JSObjectCallAsFunction 本质是 JavaScriptCore中对应Js函数,用于执行Js

而在源码:

{% highlight cpp %} 

void JSCExecutor::bindBridge() throw(JSException) {
  SystraceSection s("JSCExecutor::bindBridge");
  std::call_once(m_bindFlag, [this] {
    auto global = Object::getGlobalObject(m_context);
    auto batchedBridgeValue = global.getProperty("__fbBatchedBridge");
    if (batchedBridgeValue.isUndefined()) {
      auto requireBatchedBridge = global.getProperty("__fbRequireBatchedBridge");
      if (!requireBatchedBridge.isUndefined()) {
        batchedBridgeValue = requireBatchedBridge.asObject().callAsFunction({});
      }
      if (batchedBridgeValue.isUndefined()) {
        throw JSException("Could not get BatchedBridge, make sure your bundle is packaged correctly");
      }
    }

    auto batchedBridge = batchedBridgeValue.asObject();
    m_callFunctionReturnFlushedQueueJS = batchedBridge.getProperty("callFunctionReturnFlushedQueue").asObject();
    m_invokeCallbackAndReturnFlushedQueueJS = batchedBridge.getProperty("invokeCallbackAndReturnFlushedQueue").asObject();
    m_flushedQueueJS = batchedBridge.getProperty("flushedQueue").asObject();
    m_callFunctionReturnResultAndFlushedQueueJS = batchedBridge.getProperty("callFunctionReturnResultAndFlushedQueue").asObject();
  });
}

{% endhighlight %}

所以事实上,m_callFunctionReturnFlushedQueueJS 是对应的 MessageQueue.js 中的 callFunctionReturnFlushedQueue 函数;

因而整个完整流程就是 :  

初始registerCallableModule 构建 Js 可调用函数注册表;Native 端借助 JSCore 获取调用函数的入口,同时传入 Name 以及 Params, 最后执行 JsModule 逻辑;

##### JavaScript 调用 Java  

我们知道在初始化时 NativeModule 的Module 名称都被注入列表中保存,存入 ModuleRegistry.Cpp 以及 NativeModuleRegistry.Java 中;

{% highlight java %}

// A set of Java APIs to expose to a particular JavaScript instance. 
// 事实上,注释已经非常清晰
NativeModuleRegistry
//NativeModuleRegistry.getJavaModules
/* package */ Collection<JavaModuleWrapper> getJavaModules(
      JSInstance jsInstance) {
    ArrayList<JavaModuleWrapper> javaModules = new ArrayList<>();
    for (Map.Entry<Class<? extends NativeModule>, ModuleHolder> entry : mModules.entrySet()) {
      Class<? extends NativeModule> type = entry.getKey();
      if (!CxxModuleWrapperBase.class.isAssignableFrom(type)) {
        javaModules.add(new JavaModuleWrapper(jsInstance, type, entry.getValue()));
      }
    }
    return javaModules;
  }
{% endhighlight %}

MessageQueue.js 处理Js 调用 NativeModule的流程:

{% highlight cpp %}
    
  // class JsToNativeBridge => This class manages calls from JS to native code.
  // JsToNativeBridge.cpp  
  void NativeToJsBridge::callFunction(
    std::string&& module,
    std::string&& method,
    folly::dynamic&& arguments) {
  int systraceCookie = -1;
  #ifdef WITH_FBSYSTRACE
  systraceCookie = m_systraceCookie++;
  FbSystraceAsyncFlow::begin(
      TRACE_TAG_REACT_CXX_BRIDGE,
      "JSCall",
      systraceCookie);
  #endif

  runOnExecutorQueue([module = std::move(module), method = std::move(method), arguments = std::move(arguments), systraceCookie]
    (JSExecutor* executor) {
      #ifdef WITH_FBSYSTRACE
      FbSystraceAsyncFlow::end(
          TRACE_TAG_REACT_CXX_BRIDGE,
          "JSCall",
          systraceCookie);
      SystraceSection s("NativeToJsBridge::callFunction", "module", module, "method", method);
      #endif
      // This is safe because we are running on the executor's thread: it won't
      // destruct until after it's been unregistered (which we check above) and
      // that will happen on this thread
      executor->callFunction(module, method, arguments);
    });
}
//JSCExecutor
void JSCExecutor::callNativeModules(Value&& value) {
  SystraceSection s("JSCExecutor::callNativeModules");
  // If this fails, you need to pass a fully functional delegate with a
  // module registry to the factory/ctor.
  CHECK(m_delegate) << "Attempting to use native modules without a delegate";
  try {
    auto calls = value.toJSONString();
    m_delegate->callNativeModules(*this, folly::parseJson(calls), true);
  } catch (...) {
    std::string message = "Error in callNativeModules()";
    try {
      message += ":" + value.toString().str();
    } catch (...) {
      // ignored
    }
    std::throw_with_nested(std::runtime_error(message));
  }
}
// NativeToJSBridge.Cpp  
  void callNativeModules(
      JSExecutor& executor, folly::dynamic&& calls, bool isEndOfBatch) override {

    CHECK(m_registry || calls.empty()) <<
      "native module calls cannot be completed with no native modules";
    m_batchHadNativeModuleCalls = m_batchHadNativeModuleCalls || !calls.empty();

    // An exception anywhere in here stops processing of the batch.  This
    // was the behavior of the Android bridge, and since exception handling
    // terminates the whole bridge, there's not much point in continuing.
    for (auto& call : parseMethodCalls(std::move(calls))) {
      m_registry->callNativeMethod(call.moduleId, call.methodId, std::move(call.arguments), call.callId);
    }
    if (isEndOfBatch) {
      // onBatchComplete will be called on the native (module) queue, but
      // decrementPendingJSCalls will be called sync. Be aware that the bridge may still
      // be processing native calls when the birdge idle signaler fires.
      if (m_batchHadNativeModuleCalls) {
        m_callback->onBatchComplete();
        m_batchHadNativeModuleCalls = false;
      }
      m_callback->decrementPendingJSCalls();
    }
  }
  // ModuleRegistry.Cpp
  void ModuleRegistry::callNativeMethod(unsigned int moduleId, unsigned int methodId, folly::dynamic&& params, int callId) {
      if (moduleId >= modules_.size()) {
        throw std::runtime_error(
          folly::to<std::string>("moduleId ", moduleId, " out of range [0..", modules_.size(), ")"));
      }
      modules_[moduleId]->invoke(methodId, std::move(params), callId);
    }

  // JavaModuleWrapper.cpp
    void JavaNativeModule::invoke(unsigned int reactMethodId, folly::dynamic&& params, int callId) {
      messageQueueThread_->runOnQueue([this, reactMethodId, params=std::move(params), callId] {
        static auto invokeMethod = wrapper_->getClass()->getMethod<void(jint, ReadableNativeArray::javaobject)>("invoke");
        #ifdef WITH_FBSYSTRACE
        if (callId != -1) {
          fbsystrace_end_async_flow(TRACE_TAG_REACT_APPS, "native", callId);
        }
        #endif
        invokeMethod(
          wrapper_,
          static_cast<jint>(reactMethodId),
          ReadableNativeArray::newObjectCxxArgs(std::move(params)).get());
      });
    }
    void NewJavaNativeModule::invoke(unsigned int reactMethodId, folly::dynamic&& params, int callId) {
      if (reactMethodId >= methods_.size()) {
        throw std::invalid_argument(
          folly::to<std::string>("methodId ", reactMethodId, " out of range [0..", methods_.size(), "]"));
      }
      CHECK(!methods_[reactMethodId].isSyncHook()) << "Trying to invoke a synchronous hook asynchronously";
      messageQueueThread_->runOnQueue([this, reactMethodId, params=std::move(params), callId] () mutable {
        #ifdef WITH_FBSYSTRACE
        if (callId != -1) {
          fbsystrace_end_async_flow(TRACE_TAG_REACT_APPS, "native", callId);
        }
        #endif
        invokeInner(reactMethodId, std::move(params));
      });
    }
    // 
    MethodCallResult NewJavaNativeModule::invokeInner(unsigned int reactMethodId, folly::dynamic&& params) {
      return methods_[reactMethodId].invoke(instance_, module_.get(), params);
    }
    //JMessageQueueThread.Cpp 
    void JMessageQueueThread::runOnQueue(std::function<void()>&& runnable) {
      // For C++ modules, this can be called from an arbitrary thread
      // managed by the module, via callJSCallback or callJSFunction.  So,
      // we ensure that it is registered with the JVM.
      jni::ThreadScope guard;
      static auto method = JavaMessageQueueThread::javaClassStatic()->
        getMethod<void(Runnable::javaobject)>("runOnQueue");
      method(m_jobj, JNativeRunnable::newObjectCxxArgs(wrapRunnable(std::move(runnable))).get());
    }

{% endhighlight %}

事实上堆砌这些东西主要是为了理清整个调用栈,如何一步步从 js 通过 Bridge 指向对应的 Native Method.invoke;

而同样的类似,Js调用 Native 时通过获取 Native 函数信息通过JSCExecutor,加载 NativeModule 中的模块与方法信息数据:  

{% highlight cpp%}

JSValueRef JSCExecutor::nativeRequire(
    size_t argumentCount,
    const JSValueRef arguments[]) {
  ...
  loadModule(moduleId);//
  ...
  return Value::makeUndefined(m_context);
}

{% endhighlight %}

最终完整的流程则为 JsModule 通过 JsCore 借助 JSCExecutor 进入 Cpp 最终执行 Method.invoke 完成 Native 函数的调用;

---

Quote:

[Bridging in React Native](https://tadeuzagallo.com/blog/react-native-bridge/)

[深入源码探索 ReactNative 通信机制](https://dev.qq.com/topic/5922977cd5cb29753024f981)

[React Native通讯原理](http://www.jianshu.com/p/17d6f6c57a5c)

[React-Native主流程及 Java 与 JS 双边通信](http://blog.csdn.net/yanbober/article/details/53157456)

[ReactNativeAndroid源码分析-Js如何调用Native的代码](https://zhuanlan.zhihu.com/p/20464825)

[React-Native系列Android](http://blog.csdn.net/MegatronKings/article/details/51138499)

[React Native运行原理解析](http://blog.csdn.net/xiangzhihong8/article/details/52623852)

[探究react-native通信机制](http://zjutkz.net/2016/05/03/%E5%85%B6%E5%AE%9E%E6%B2%A1%E9%82%A3%E4%B9%88%E5%A4%8D%E6%9D%82%EF%BC%81%E6%8E%A2%E7%A9%B6react-native%E9%80%9A%E4%BF%A1%E6%9C%BA%E5%88%B6/)

[JNI 原理](http://gityuan.com/2016/05/28/android-jni/)

[JNI Tips](https://developer.android.com/training/articles/perf-jni.html)