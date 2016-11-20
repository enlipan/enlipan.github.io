---
layout: post
title:  Retrofit 源码分析
category: android
keywords: [anroid,java,thread]
---


框架的独立性,专业性与框架的大而全性的抉择；

### Volley  VS  Retrofit

[Volley  VS  Retrofit](http://stackoverflow.com/questions/16902716/comparison-of-android-networking-libraries-okhttp-retrofit-volley#)

就过去经验而谈，大而全往往代表着在项目迭代时，可能在某个阶段会觉得非常便利，但到后期需要变更时往往需要重构更多的地方去解耦，去重构，代码的苦痛指数更高；相对而言，小而精，专业性模块化更高的框架在后期的自定义程度以及可扩展性都更高；


### Retrofit 核心流程

先贴上流程核心代码：

{% highlight java %}

//这里主要通过两条不一样的Adapter看核心流程 —— ExecutorCallAdapterFactory.get()  ||  RxCallAdapter

/**
*Retrofit
*/
public <T> T create(final Class<T> service) {
  Utils.validateServiceInterface(service);
  if (validateEagerly) {
    eagerlyValidateMethods(service);
  }
  return (T) Proxy.newProxyInstance(service.getClassLoader(), new Class<?>[] { service },
      new InvocationHandler() {
        private final Platform platform = Platform.get();

        @Override public Object invoke(Object proxy, Method method, Object... args)
            throws Throwable {
          // If the method is a method from Object then defer to normal invocation.
          if (method.getDeclaringClass() == Object.class) {
            return method.invoke(this, args);
          }
          if (platform.isDefaultMethod(method)) {
            return platform.invokeDefaultMethod(method, service, proxy, args);
          }
          ServiceMethod serviceMethod = loadServiceMethod(method);
          OkHttpCall okHttpCall = new OkHttpCall<>(serviceMethod, args);
          return serviceMethod.callAdapter.adapt(okHttpCall);
        }
      });
}

// serviceMethod.callAdapter
public CallAdapter<?> nextCallAdapter(CallAdapter.Factory skipPast, Type returnType,
    Annotation[] annotations) {
  checkNotNull(returnType, "returnType == null");
  checkNotNull(annotations, "annotations == null");

  int start = adapterFactories.indexOf(skipPast) + 1;
  for (int i = start, count = adapterFactories.size(); i < count; i++) {
    CallAdapter<?> adapter = adapterFactories.get(i).get(returnType, annotations, this);
    if (adapter != null) {
      return adapter;
    }
  }

  StringBuilder builder = new StringBuilder("Could not locate call adapter for ")
      .append(returnType)
      .append(".\n");
  if (skipPast != null) {
    builder.append("  Skipped:");
    for (int i = 0; i < start; i++) {
      builder.append("\n   * ").append(adapterFactories.get(i).getClass().getName());
    }
    builder.append('\n');
  }
  builder.append("  Tried:");
  for (int i = start, count = adapterFactories.size(); i < count; i++) {
    builder.append("\n   * ").append(adapterFactories.get(i).getClass().getName());
  }
  throw new IllegalArgumentException(builder.toString());
}

//ExecutorCallAdapterFactory.get()
@Override
public CallAdapter<Call<?>> get(Type returnType, Annotation[] annotations, Retrofit retrofit) {
  if (getRawType(returnType) != Call.class) {
    return null;
  }
  final Type responseType = Utils.getCallResponseType(returnType);
  return new CallAdapter<Call<?>>() {
    @Override public Type responseType() {
      return responseType;
    }

    @Override public <R> Call<R> adapt(Call<R> call) {
      return new ExecutorCallbackCall<>(callbackExecutor, call);
    }
  };
}

// ExecutorCallbackCall.enqueue() -- 实际是所封装的 delegate（即 okHttpCall（realCall）） 执行
@Override public void enqueue(final Callback<T> callback) {
  if (callback == null) throw new NullPointerException("callback == null");

  delegate.enqueue(new Callback<T>() {
    @Override public void onResponse(Call<T> call, final Response<T> response) {
      callbackExecutor.execute(new Runnable() {
        @Override public void run() {
          if (delegate.isCanceled()) {
            // Emulate OkHttp's behavior of throwing/delivering an IOException on cancellation.
            callback.onFailure(ExecutorCallbackCall.this, new IOException("Canceled"));
          } else {
            callback.onResponse(ExecutorCallbackCall.this, response);
          }
        }
      });
    }

    @Override public void onFailure(Call<T> call, final Throwable t) {
      callbackExecutor.execute(new Runnable() {
        @Override public void run() {
          callback.onFailure(ExecutorCallbackCall.this, t);
        }
      });
    }
  });
}


/**
*Retrofit + RxJava
*/
//SimpleCallAdapter.adapt()
@Override public <R> Observable<R> adapt(Call<R> call) {
  Observable<R> observable = Observable.create(new CallOnSubscribe<>(call)) //
      .lift(OperatorMapResponseToBodyOrError.<R>instance());
  if (scheduler != null) {
    return observable.subscribeOn(scheduler);
  }
  return observable;
}
//CallOnSubscribe.call
@Override public void call(final Subscriber<? super Response<T>> subscriber) {
  // Since Call is a one-shot type, clone it for each new subscriber.
  Call<T> call = originalCall.clone();

  // Wrap the call in a helper which handles both unsubscription and backpressure.
  RequestArbiter<T> requestArbiter = new RequestArbiter<>(call, subscriber);
  subscriber.add(requestArbiter);
  subscriber.setProducer(requestArbiter);
}
//RequestArbiter.request
@Override public void request(long n) {
  if (n < 0) throw new IllegalArgumentException("n < 0: " + n);
  if (n == 0) return; // Nothing to do when requesting 0.
  if (!compareAndSet(false, true)) return; // Request was already triggered.

  try {
    Response<T> response = call.execute();
    if (!subscriber.isUnsubscribed()) {
      subscriber.onNext(response);
    }
  } catch (Throwable t) {
    Exceptions.throwIfFatal(t);
    if (!subscriber.isUnsubscribed()) {
      subscriber.onError(t);
    }
    return;
  }

  if (!subscriber.isUnsubscribed()) {
    subscriber.onCompleted();
  }
}
// lift Observable 转换
// OperatorMapResponseToBodyOrError.call
@Override public Subscriber<? super Response<T>> call(final Subscriber<? super T> child) {
  return new Subscriber<Response<T>>(child) {
    @Override public void onNext(Response<T> response) {
      if (response.isSuccessful()) {
        child.onNext(response.body());
      } else {
        child.onError(new HttpException(response));
      }
    }

    @Override public void onCompleted() {
      child.onCompleted();
    }

    @Override public void onError(Throwable e) {
      child.onError(e);
    }
  };
}

{% endhighlight %}


Http请求封装为Call对象，接口函数代替具体http请求,Call的层层包装完成了各项功能，其中真实的网络请求由OkHttp库完成，生成OkHttp原始Response，然后由Adapter转换Response得到我们需要的T，核心源码流程如下：

{% highlight java %}

//okHttpCall.execute()
@Override public Response<T> execute() throws IOException {
  okhttp3.Call call;

  synchronized (this) {
    if (executed) throw new IllegalStateException("Already executed.");
    executed = true;

    if (creationFailure != null) {
      if (creationFailure instanceof IOException) {
        throw (IOException) creationFailure;
      } else {
        throw (RuntimeException) creationFailure;
      }
    }

    call = rawCall;
    if (call == null) {
      try {
        call = rawCall = createRawCall();
      } catch (IOException | RuntimeException e) {
        creationFailure = e;
        throw e;
      }
    }
  }

  if (canceled) {
    call.cancel();
  }

  return parseResponse(call.execute());
}

//okHttpCall.parseResponse()
Response<T> parseResponse(okhttp3.Response rawResponse) throws IOException {
  ResponseBody rawBody = rawResponse.body();
  .........................

  ExceptionCatchingRequestBody catchingBody = new ExceptionCatchingRequestBody(rawBody);
  try {
    T body = serviceMethod.toResponse(catchingBody);
    return Response.success(body, rawResponse);
  } catch (RuntimeException e) {
    // If the underlying source threw an exception, propagate that rather than indicating it was
    // a runtime exception.
    catchingBody.throwIfCaught();
    throw e;
  }
}

//serviceMethod.toResponse()
/**
 * Builds a method return value from an HTTP response body.
 */
T toResponse(ResponseBody body) throws IOException {
  return responseConverter.convert(body);
}

{% endhighlight %}

Retrofit的解耦，各种设计模式灵活组合使用，其中尤其以代理，包装，组合模式,而其核心技术其实是动态代理，注解，其设定的Call 以及 Converter接口提供了使用者充分的自定义可能性；



### Custom Retrofit Converter

上面说到了转换器的解耦，事实上我们可以借助提供的 Converter<Source, Target>接口以及 Converter.Factory类，进而自定义 Converter，首先先看一下默认的 GsonConverterFactory：

{% highlight java %}

// Factory 类提供构建RequestBody 以及 ResponseBody 转换器 Converter的工厂函数
public final class GsonConverterFactory extends Converter.Factory {

    // 将Okhttp ResponseBody 转换为我们所定义的 Model 实体类
      @Override
    public Converter<ResponseBody, ?> responseBodyConverter(Type type, Annotation[] annotations,
        Retrofit retrofit) {
      TypeAdapter<?> adapter = gson.getAdapter(TypeToken.get(type));
      return new GsonResponseBodyConverter<>(gson, adapter);
    }

    // 将 type<T>  转换为Http RequestBody http请求体对象
    @Override
    public Converter<?, RequestBody> requestBodyConverter(Type type,
        Annotation[] parameterAnnotations, Annotation[] methodAnnotations, Retrofit retrofit) {
      TypeAdapter<?> adapter = gson.getAdapter(TypeToken.get(type));
      return new GsonRequestBodyConverter<>(gson, adapter);
    }

}

// RequestBody 转换
final class GsonRequestBodyConverter<T> implements Converter<T, RequestBody> {

  @Override public RequestBody convert(T value) throws IOException {
    //Okio
    Buffer buffer = new Buffer();
    Writer writer = new OutputStreamWriter(buffer.outputStream(), UTF_8);
    JsonWriter jsonWriter = gson.newJsonWriter(writer);
    adapter.write(jsonWriter, value);
    jsonWriter.close();
    // 将请求体转换为 Gson流，进而创建 RequstBody
    return RequestBody.create(MEDIA_TYPE, buffer.readByteString());
  }
}

// ResponseBody 转换
final class GsonResponseBodyConverter<T> implements Converter<ResponseBody, T> {

  @Override public T convert(ResponseBody value) throws IOException {
    JsonReader jsonReader = gson.newJsonReader(value.charStream());
    try {
      return adapter.read(jsonReader);
    } finally {
      // 关闭 okio source 流数据
      value.close();
    }
  }
}

{% endhighlight %}



---

Quote:

[Retrofit 源码解析](https://github.com/android-cn/android-open-project-analysis/tree/master/tool-lib/network/retrofit)

[深入浅出 Retrofit，这么牛逼的框架你们还不来看看](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=1117)

[Retrofit分析-漂亮的解耦套路](http://www.jianshu.com/p/45cb536be2f4)

[Android网络框架源码分析二---Retrofit](http://www.jianshu.com/p/07dac989272c)

[拆轮子系列：拆 Retrofit](http://blog.piasy.com/2016/06/25/Understand-Retrofit/)

[Retrofit — Define a Custom Response Converter](https://futurestud.io/tutorials/retrofit-replace-the-integrated-json-converter)
