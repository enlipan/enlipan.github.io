---
layout: post
title: Volly应用
category: android
---

####Volley介绍：

Volly:是来源于GoogleTeem的一种网络通信框架。是对于Http请求的一种封装表现形式，一方面便于开发时更加便捷的管理使用，某种程度上可以类比于数据库管理，以前我们Web开发如果是写数据库原生JDBC其凌乱程度也是有的一比的，当然如果真正使用原生JDBC我们自己也会做二次封装，便于更好的代码管理与重用。

同时Volley内部对于网络请求的优化与高效管理也是极为强大，我们可以利用Volley做更加便捷的批量任务网络请求，Volley的最佳试用场景一般是频繁的网络通信请求，且传输数据量不大，如多图标下载等等。但是当涉及到大数据量的网络操作，上传下载文件时，其表现是比较糟糕的。


####Volley使用：

**使用场景：**

* 高效的异步请求处理       
* 网络图片加载与缓存机制       
* 高效的Get/Post网络请求交互        
* 稳定的网络性能/网络请求缓存/多级别取消（与Activity生命周期联动）        

**使用方式：**

Volley采用请求队列管理并发请求，队列缓存所有Http请求，按照一定的内部实现算法并发处理发出。因而我们无需针对每一个Http请求去建立单独的RequestQueue队列，以免浪费过多的系统资源，比较好的做法是针对每一个需要网络交互的Activity建立一个队列处理其所涉及到的所有请求，甚至对于多网络请求的情况可以更加极端的封装静态请求队列到全局Application，处理应用中的所有Request。

Volley的三种请求对象：StringRequest/JsonObjectRequst/JsonArrayObjRequest

其主要区别是StringRequest是最通用的，对于Response返回结果的类型不做要求。其他两种是我们已知返回结果类型为JsonObject或者JsonArray情况下，可以分别选用的情况。

注意：在使用中，若是应用全局请求队列，我们要额外注意请求与Activity生命周期的联动，防止Activity被销毁而后台请求依然进行的情况。具体使用取消操作时一般采用对于相应的Requst设定相应Tag，在onstop中将对应tag的request移除队列。



 StringRequest request = new StringRequest(Request.Method.GET, url, new Response.Listener<String>() {
            @Override
            public void onResponse(String result) {
                Log.e("Main","==========================="+result);
            }
        }, new Response.ErrorListener() {
            @Override
            public void onErrorResponse(VolleyError volleyError) {
                Log.e("Main","==========================="+volleyError);
            }
        }){
            @Override
            protected Map<String, String> getParams() throws AuthFailureError {
                return super.getParams();
            }
        };
        request.setTag("baiduGet");

........

    @Override
    protected void onStop() {
        super.onStop();
        DemoApplication.getHttpQueues().cancelAll("baiduGet");
    }


**对于带参数的Post请求的处理方法**

对于带参数的post请求方法，我们一般采用复写getParams()方法。而对于JsonObjectRequest进行post请求时，可以封装一个包装着参数名值对HashMap的JsonObject对象传入requst构造函数，两种方法各取所需。


####Volley对于图片下载的处理


* ImageRequest        
* ImageLoader + ImageListener  + LruCache     
* NerWorkImageView + ImageLoader + LruCache     

第一种过于简单，这里主要实践第二种和第三种方式：

 ImageLoader loader = new ImageLoader(DemoApplication.getHttpQueues(), new ImageLoader.ImageCache() {
            @Override
            public Bitmap getBitmap(String s) {
                //load Bitmap from LruCache
                return null;
            }

            @Override
            public void putBitmap(String s, Bitmap bitmap) {
                //put BitMap to LruCache
            }
        });
        ImageLoader.ImageListener listener = ImageLoader.getImageListener(iv,defaulImage,//displayed Image on Loading
            errorImage);//diaplayed Image when Load error
        loader.get(url,listener);
    }


第三种方式与第二种类似，其差异在于使用了自定义UI控件NetworkImageView，其将对于图片根据自身设定大小自动处理图片加载的宽高大小，依据情况确定是否需要进行压缩。最大程度上的简化了图片的加载处理。


####参照官方StringRequest自定义其他基于Volley框架的Request：

参照StringRequest源码：其核心方法是：

`protected Response<T> parseNetworkResponse(NetworkResponse response)`

其中T代表着Response返回类型的结果泛型，在ResponseListener中接受到结果之后，我们进行相应的数据解析处理，解析成我们需要的类型格式，进行相关的UI展示。


---

Quote：

[Android-Volley详解](http://www.imooc.com/learn/468)

[Android Volley完全解析](http://blog.csdn.net/guolin_blog/article/details/17612763)

