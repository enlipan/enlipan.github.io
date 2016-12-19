---
layout: post
title:  Android Tips part (7)
category: android
keywords: [improvement,android,java]
---


####  Current Activity

> adb shell dumpsys window windows | grep -E 'mCurrentFocus|mFocusedApp' --color=always


as adb 命令：

> adb shell pm

> adb shell am

直观的可以看到在Android Studio编译成功后的adb输出安装命令,eg:

`$ adb push /Users/paul/Documents/Souche/androidclientnative/app/build/outputs/apk/debug/[windmill]-debug-5.4.0-debug.apk /data/local/tmp/com.souche.fengche`

`$ adb shell pm install -r "/data/local/tmp/com.souche.fengche"`


`$ adb shell am start -n "com.souche.fengche/com.souche.fengche.ui.activity.SplashActivity" -a android.intent.action.MAIN -c android.intent.category.LAUNCHER`



#### Android Debug 方式

* [Android Studio你不知道的调试技巧](http://android.jobbole.com/83282/)

重点：

*  Evaluate Expression 求值表达式可以用于对当前环境下变量的监控与改变，如改变请求参数,可以直接Debug时改变利用求值表达式请求参数值

*  As Debug窗口——直观查看程序调用函数栈



####  Fresco 补充

* 图片加载完成之后函数回调

{% highlight java %}

public class DrawImageControllerListener extends BaseControllerListener<ImageInfo> {

    private ImageControllerListener mControllerListener;

    DrawImageControllerListener(ImageControllerListener imageControllerListener){
        this.mControllerListener = imageControllerListener;
    }


    @Override
    public void onFailure(String id, Throwable throwable) {
        super.onFailure(id, throwable);
    }


    @Override
    public void onFinalImageSet(String id, @Nullable ImageInfo imageInfo, @Nullable Animatable animatable) {
        super.onFinalImageSet(id, imageInfo, animatable);
        if (mControllerListener != null) {
            mControllerListener.afterImageDown();
        }
    }


    public static class  Builder{

        private ImageControllerListener mImageControllerListener;

        public DrawImageControllerListener build(){
            return new DrawImageControllerListener(mImageControllerListener);
        }

        public Builder  buildImageController(ImageControllerListener listener){
            mImageControllerListener = listener;
            return this;
        }

    }

    public  interface ImageControllerListener {
        void afterImageDown();
    }
}

mSdvDealQrCode.setController(Fresco.newDraweeControllerBuilder()
                                        .setControllerListener(new DrawImageControllerListener.Builder()
                                                .buildImageController(new DrawImageControllerListener
                                                        .ImageControllerListener() {
                                                    @Override
                                                    public void afterImageDown() {
                                                        mIvQrIconCenter.setVisibility(View.VISIBLE);
                                                    }
                                                })
                                                .build()
                                        )
                                        .setUri(response.getUrl())
                                        .build()
                              )


{% endhighlight %}


*  加载本地Local图片

{% highlight java %}

Uri uri = new Uri.Builder()
    .scheme(UriUtil.LOCAL_RESOURCE_SCHEME) // "res"
    .path(String.valueOf(resId))
    .build();
// uri looks like res:/123456789
simpleDraweeView.setImageURI(uri);

{% endhighlight %}


####  Gson的 int 类型转换

Gson 转换 Json中整数类型值构建时利用了 integer.parsInt()，也就是在Json对象中形如： `"age":10`这样的属性可以设置为int类型也可以设置为String类型，事实上经过实践也的确如此；


#### 反射

* 构建对象的方式:            


1. new()        
2. clazz.getconstructor().newInstance();                
3. Proxy.newProxyInstance()

*  其他常用反射函数：




####  curl 命令

[curl网站开发指南](http://www.ruanyifeng.com/blog/2011/09/curl.html)

curl是一种命令行工具，作用是发出网络请求，然后得到和提取数据，显示在"标准输出"（stdout）上面,结合grep过滤输出效率非常高；


#### Android中Drawable所占用内存与drawable文件夹的关系

也就是不匹配的Dpi的Drawable放入不匹配的 Drawable-dpi文件夹下，会造成额外的内存损耗问题；

[关于Android中图片大小、内存占用与drawable文件夹关系的研究与分析](http://blog.csdn.net/zhaokaiqiang1992/article/details/49787117)

#### Gradle 分组以及 Gradle指定sdk混淆文件

*  gradle分组问题：

`compile('com.squareup.retrofit2:adapter-rxjava:2.1.0') {
       exclude group: 'com.squareup.retrofit2', module: 'retrofit'
}`


*  sdk指定混淆文件：

`consumerProguardFiles`

该gradle属性的应用，可以通过创建对应sdk下 proguard文件，并在对应SDK下的gradle文件下指定该属性，生成带混淆配置的aar文件而不用在主工程中统一配置各个sdk的proguard，造成proguard混乱；

常见使用为创建对应sdk文件名的混淆文件，eg：consumerProguardFiles 'customname-proguard-rules.pro'

[Building your own Android library](https://guides.codepath.com/android/Building-your-own-Android-library)


####  Fragment Bad Token





####  Fragment

`isAdded()  !=  !isDetached()`


#### 特别的BadTokenException

BadTokenException 常见于Dialog引起的问题，这类Case并不少见，这里的特别特别在并没有Dialog但是引起了BadTokenException问题；
