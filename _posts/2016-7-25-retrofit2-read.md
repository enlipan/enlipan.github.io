---
layout: post
title:  看Retrofit 2
category: android
keywords: [framework]
---

Retrofit是对于网络请求框架的封装，而并不是网络框架，其网络部分由OkHttp完成，其本身用于完成结构化数据转换，Data to  DataBean之间的转换，以便于开发专注对Java对象的OO类型操作；Retrofit将 网络API请求转换为Java接口的形式，其定义的针对REST API的注解声明网络请求操作，形式类似 SpringMVC的注解操作；利用注解描述HTTP请求，从实际上来看有些类似ORM（数据库结构数据与JavaBean）框架做的事情；

> Retrofit adapts a Java interface to HTTP calls by using annotations on the declared methods to
 define how requests are made.

Retrofit 支持请求时Object对象到 request 请求体之间的转换，而数据返回时自动转化数据到Object，同事支持 MultiPart 请求体（多个请求对象）以及文件upload；

Retrofit 自动为所定义的针对 API的接口生成对应的网络实现；简化网络请求实现；同时提供了插件化形式的高度可自定义度；

Retrofit支持5中RESTful请求注解：GET,POST,PUT,DELETE,HEAD(获取头信息，可高效检测链接有效性)；

Retrofit可以结合 OkHttp（一个处理Http通信的强大库，用所配置的形式高效Http请求，接受服务端返回数据）使用；

Retrofit 的链接设定格式支持多种：但是如果Team内部不统一规范化进行链接拼接，很容易导致无法排查的Bug,详细如：

**Url组合**  

Retrofit 是一种针对RESTful 类型接口的框架（A type-safe REST client for Android and Java.），其 url 由创建Retrofit对象时指定的BaseUrl以及接口注解所指定的资源路径所组合而成；

其中BaseUrl必须以，"/" 符号作为结尾,否则会出现以下异常：

 "java.lang.IllegalArgumentException: baseUrl must end in /"

不知道其他的一些文章里面说的，BaseUrl以文件形式出现时怎么配置的，有些好奇

而配置资源路径Path的指定则有对应的组合规则：

Path有三种情况：

* 最常用的以相对路径出现，配合BaseUrl直接组合，如Path（source），则完成url则为 BaseUrl/source

* 另外也可以在Path中指定完整Url：如Path（http://host:port/source）

* 最后一种比较Path是绝对路径 “以 / 开头” 如 (/baseSource),要知道 url 的组成是 “协议 + 域名 + 资源路径”，path作为绝对路径将直接取代前面BaseUrl中定义的 部分资源路径，配合域名组合： 如 BaseUrl = "http://www.baidu.com/s/"  Path = "/source" 将组合为："http://www.baidu.com/source"

这是需要注意的，一般建议Team内部统一一种写法，提交效率，减少可能引入的细节问题；也算是一种编程规范


**参数类型：**

Get：Query && QueryMap `@Query("page") int pageIndex` 查询类似 url?page=pageIndex


Post：Feild && FeildMap，形如：

而利用 Part & PartMap 上传文件也是非常方便的：

{% highlight java %}

upload(@Part("description") RequestBody description,@Part MultipartBody.Part file);

{% endhighlight %}

而如果对于路径 Path：形如：`/repos/{owner}/{repo}/contributors`  利用@Path，动态配置资源路径


#### 解决前后端字段映射问题

利用自定义 Converter可以解决，请求对象（RequestBody）与 返回对象（ResponseBody）的构造问题；

{% highlight java %}

//代码详情，来自深入浅出Retrofit，链接见引用
static class ArbitraryResponseBodyConverterFactory extends Converter.Factory{
  @Override
  public Converter<ResponseBody, ?> responseBodyConverter(Type type, Annotation[] annotations, Retrofit retrofit) {
    return super.responseBodyConverter(type, annotations, retrofit);
  }
}

static class ArbitraryResponseBodyConverter implements Converter<ResponseBody, Result>{

  @Override
  public Result convert(ResponseBody value) throws IOException {
    RawResult rawResult = new Gson().fromJson(value.string(), RawResult.class);
    Result result = new Result();
    result.body = rawResult.content;
    result.code = rawResult.err;
    result.msg = rawResult.message;
    return result;
  }
}

{% endhighlight %}

####  解决多Baseurl问题

有的业务线有些多的情况下，可能出现多BaseUrl的问题，这种问题如果要每次创建时指定全名有点恶心，可以另外想办法在运行时更改Retrofit对象的BaseUrl;

{% highlight java %}

//定义配置 Builder，用于对于Builder更改 BaseUrl，再直接利用Builder.build()构建对象
private static Retrofit.Builder builder =
        new Retrofit.Builder()
                .addConverterFactory(GsonConverterFactory.create())
                .baseUrl(apiBaseUrl);

//控制暴露一个函数构建新的 Builder的baseUrl可以直接获取到新的Retrofit对象，构建新的Api

{% endhighlight %}

####  原理

同样从使用开始入手：

{% highlight java %}
 ServerApi apiInterface = retrofitClient.create(ServerApi.class);

//////////////////////////////////////////////////////////////

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
           if (platform.isDefaultMethod(method)) {// Java8 新特性，接口可以添加默认函数实现
             return platform.invokeDefaultMethod(method, service, proxy, args);
           }
           // 正常流程，也就是api接口定义的 Call<>
           ServiceMethod serviceMethod = loadServiceMethod(method);
           OkHttpCall okHttpCall = new OkHttpCall<>(serviceMethod, args);
           return serviceMethod.callAdapter.adapt(okHttpCall);
         }
       });
 }
 // 可以看到起网络请求 OkHttpCall,api接口函数被适配转换成对应的 http Call
 //  转换的实现都在CallAdapter中定义，我们也可以通过自定义实现来增强转换
/////////////////////////////////////////////////////////////////////

public static Object newProxyInstance(ClassLoader loader, Class<?>[] interfaces,
                                      InvocationHandler invocationHandler)
        throws IllegalArgumentException {
            ......
            return getProxyClass(loader, interfaces)
                  .getConstructor(InvocationHandler.class)
                  .newInstance(invocationHandler);
        }

// 根据动态代理，其本质还是调用了 involke函数

{% endhighlight %}



#### Mock Server

其实最近一直在学PythonWeb，想自己弄个轮子实现伪接口，返回Json数据，恰好看到了Retrofit的这个能力，就先把这一块给好好弄明白再进一步学习Python

---

Quote:

[Retrofit Doc](http://square.github.io/retrofit/)

[Retrofit - Future](https://futurestud.io/blog/retrofit-getting-started-and-android-client)

[深入浅出 Retrofit](http://bugly.qq.com/bbs/forum.php?mod=viewthread&tid=1117)

[Hack Retrofit (2) 之 Mock Server](http://www.println.net/post/Android-Hack-Retrofit-Mock-Server)

[Retrofit – Java(Android) 的REST 接口封装类](http://blog.chengyunfeng.com/?p=491&utm_source=tuicool&utm_medium=referral)

[Retrofit 2.0](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0915/3460.html)

[OkHttp Doc](https://github.com/square/okhttp/wiki/Recipes)

[OkHttp使用教程](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2015/0106/2275.html)
