---
layout: post
title:  Custom Retrofit Converter 实践
category: android
keywords: [improvement,android,java]
---

事实上这部分内容之前用过，不过是分别写入了Retrofit与Gson的两篇文章之中，突然看到一篇比较好的文章合并了两块，并且比我之前的一些内容更加丰富，也弥补了一些知识盲点，所以这里重新总结一篇文章：


在客户端的开发过程中，理想情况下当然是后台返回统一格式化数据，但是如果涉及到多个后台Team，很可能会出现不一样的格式，那么针对数据的转换就成了一个必须提到的话题：

###  Retrofit 数据转换流程

这里简单看一下Retrofit的Response转化流程：

Retrofit中的灵活性由其各类Adapter体现，掐中Retrofit.OkHttpCall 实现了 Retrofit.Call接口，包装了 OkHttp.Call实现，其实现有Retrofit实例中指定的CallAdapter转换实现；

{% highlight java %}

private okhttp3.Call createRawCall() throws IOException {
  Request request = serviceMethod.toRequest(args);
  okhttp3.Call call = serviceMethod.callFactory.newCall(request);
  if (call == null) {
    throw new NullPointerException("Call.Factory returned null.");
  }
  return call;
}

{% endhighlight  %}

其网路请求的执行依赖OkHttp，而其数据转换的关键可以从其网络请求返回数据查看：

{% highlight java %}

call.enqueue(new okhttp3.Callback() {
  @Override public void onResponse(okhttp3.Call call, okhttp3.Response rawResponse)
      throws IOException {
    Response<T> response;
    try {
      response = parseResponse(rawResponse);
    } catch (Throwable e) {
      callFailure(e);
      return;
    }
    callSuccess(response);
  }

  /////////////////////////////////////////////////////////////

  Response<T> parseResponse(okhttp3.Response rawResponse) throws IOException {
    ResponseBody rawBody = rawResponse.body();

    // Remove the body's source (the only stateful object) so we can pass the response along.
    rawResponse = rawResponse.newBuilder()
        .body(new NoContentResponseBody(rawBody.contentType(), rawBody.contentLength()))
        .build();

    int code = rawResponse.code();
    if (code < 200 || code >= 300) {
      try {
        // Buffer the entire body to avoid future I/O.
        ResponseBody bufferedBody = Utils.buffer(rawBody);
        return Response.error(bufferedBody, rawResponse);
      } finally {
        rawBody.close();
      }
    }

    if (code == 204 || code == 205) {
      return Response.success(null, rawResponse);
    }

    ExceptionCatchingRequestBody catchingBody = new ExceptionCatchingRequestBody(rawBody);
    try {
      // 关键代码
      T body = serviceMethod.toResponse(catchingBody);
      return Response.success(body, rawResponse);
    } catch (RuntimeException e) {
      // If the underlying source threw an exception, propagate that rather than indicating it was
      // a runtime exception.
      catchingBody.throwIfCaught();
      throw e;
    }
  }

  /** Builds a method return value from an HTTP response body. */
  T toResponse(ResponseBody body) throws IOException {
    return responseConverter.convert(body);
  }

{%  endhighlight  %}

事实上，上述的数据类型转换的关键代码在于以下一行代码做的数据转换：

`T body = serviceMethod.toResponse(catchingBody);`

再来看看 responseConverter 的构建：

{% highlight java %}

/**
 * Returns a {@link Converter} for {@link ResponseBody} to {@code type} from the available
 * {@linkplain #converterFactories() factories}.
 *
 * @throws IllegalArgumentException if no converter available for {@code type}.
 */
public <T> Converter<ResponseBody, T> responseBodyConverter(Type type, Annotation[] annotations) {
  return nextResponseBodyConverter(null, type, annotations);
}

/**
   * Returns a {@link Converter} for {@link ResponseBody} to {@code type} from the available
   * {@linkplain #converterFactories() factories} except {@code skipPast}.
   *
   * @throws IllegalArgumentException if no converter available for {@code type}.
   */
  public <T> Converter<ResponseBody, T> nextResponseBodyConverter(Converter.Factory skipPast,
      Type type, Annotation[] annotations) {
    checkNotNull(type, "type == null");
    checkNotNull(annotations, "annotations == null");

    int start = converterFactories.indexOf(skipPast) + 1;
    for (int i = start, count = converterFactories.size(); i < count; i++) {
      Converter<ResponseBody, ?> converter =
          converterFactories.get(i).responseBodyConverter(type, annotations, this);
      if (converter != null) {
        //noinspection unchecked
        return (Converter<ResponseBody, T>) converter;
      }
    }

    StringBuilder builder = new StringBuilder("Could not locate ResponseBody converter for ")
        .append(type)
        .append(".\n");
    if (skipPast != null) {
      builder.append("  Skipped:");
      for (int i = 0; i < start; i++) {
        builder.append("\n   * ").append(converterFactories.get(i).getClass().getName());
      }
      builder.append('\n');
    }
    builder.append("  Tried:");
    for (int i = start, count = converterFactories.size(); i < count; i++) {
      builder.append("\n   * ").append(converterFactories.get(i).getClass().getName());
    }
    throw new IllegalArgumentException(builder.toString());
  }

{%  endhighlight  %}

再一次看到关键代码，如果找到对应Type、annotations处理的结果适配器 Converter，则利用该converter处理数据，如果遍历全部Converter列表找不到对应的数据处理转换器，则报异常产生Crash;

此处需要注意：从源码可以看到，构建Retrofit对象时，Converter 的add先后对于数据的处理转换有拦截影响，先add进入List的**满足条件**的转换器直接进行数据处理，后面的Converter即使可以进行该Type类型的转换也无法获得转换时机：

`Converter<ResponseBody, ?> converter =converterFactories.get(i).responseBodyConverter(type, annotations, this);`

So，事实上，如果我们需要自定义数据类型的转换，我们可以通过自定义转换器进行数据的转换；

###  自定义数据转换 Converter


先看看默认原始 GsonConverterFactory 的行为：

{% highlight java%}

// GsonConverterFactory
// Annotation 代表网络请求Api函数上的注解 - 这类注解也可以是自定义注解，所以有充分的灵活性
// 可以通过自定义注解，获取注解中的预先写入的值，实现各类指定转换
@Override
public Converter<ResponseBody, ?> responseBodyConverter(Type type, Annotation[] annotations,
    Retrofit retrofit) {

  // 如果有自定义Gson解析经验，对于特定的类型解析我们通过注册 自定义TypeAdapter完成类型解析
  // 所有 Class 均实现了 Type接口，Type代表对应数据对象类型 Call<Type>
  TypeAdapter<?> adapter = gson.getAdapter(TypeToken.get(type));
  return new GsonResponseBodyConverter<>(gson, adapter);
}

// GsonResponseBodyConverter
@Override public T convert(ResponseBody value) throws IOException {
  JsonReader jsonReader = gson.newJsonReader(value.charStream());
  try {
    return adapter.read(jsonReader);
  } finally {
    value.close();
  }
}

{%  endhighlight  %}

事实上实际的response解析操作都在对应的 Converter实现中，所以有需要的当然也应该自定义对应实现了，这里并不复杂，Gson自定义解析经验的可以比较快的上手实践；


在实践Demo时使用了之前用Python实现的本地服务器，返回自定义Json数据：

[ServerForAndroid - Python](https://github.com/itlipan/ServerForAndroid/tree/master/package/server)

附注：

Gson中应用了诸多反射，构建了如TypeToken这样的对象去辅助，刚开始看到是比较疑惑的：

Type是什么?

Type接口是随着Java1.5的泛型支持同时引入，Type接口位于 `java.lang.reflect`,其文档定义为：

> Type is the common superinterface for all types in the Java programming language. These include raw types, parameterized types, array types, type variables and primitive types.

在Type类型引入之时，考虑到向下兼容性，设计了Type接口，并让Class实现了Type，然后Class在JDK中已经被广泛使用，这导致Type被使用得非常少；


其层次结构图如下：

{:.center}
![Java_Type](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20161218/Java_Type.png)

Class 继承自Type，Class作为类的构建模板，在反射中用于保存类运行时的状态信息,Class是反射机制的基石：

>  For every type of object, the Java virtual machine instantiates an immutable instance of java.lang.Class which provides methods to examine the runtime properties of the object including its members and type information. Class also provides the ability to create new classes and objects. Most importantly, it is the entry point for all of the Reflection APIs.

{% highlight java %}

Class.forName()

Object.Class;

Object.getClass();

//基本类型--原始类型信息：
Integer.TYPE;


//////////////////////////////////////////////////////////////////////////////
// 一些有用的Hack 泛型Type函数

getGenericSuperclass()

getGenericInterfaces()

{% endhighlight %}



---

Quote：

[如何使用Retrofit请求非Restful API](http://www.jianshu.com/p/2263242fa02d)


---

关于反射：

[Handling Java Generic Types with Reflection](http://qussay.com/2013/09/28/handling-java-generic-types-with-reflection/)

[Java获得泛型类型](http://rednaxelafx.iteye.com/blog/586212)

[Why 'java.lang.reflect.Type' Just Does Not Cut It as Complete Type Definition](http://www.cowtowncoder.com/blog/archives/2010/12/entry_436.html)

[Super Type Tokens](http://gafter.blogspot.jp/2006/12/super-type-tokens.html)

[Reflecting generics](http://www.artima.com/weblogs/viewpost.jsp?thread=208860)
