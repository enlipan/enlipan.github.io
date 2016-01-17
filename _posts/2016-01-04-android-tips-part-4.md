---
layout: post
title: Android Tips part (4)
category: android
---

### 判断一个ScrollView 中的 View 是否正在屏幕中显示：

{% highlight java %}

/**
 * 判断该View 是否在 ScrollView中显示
 * @param testView
 * @return
 */
private boolean checkViewIsShown(View testView){
    Rect scrollBounds = new Rect();
    mScrollView.getHitRect(scrollBounds);
    return  testView.getLocalVisibleRect(scrollBounds);
}

{% endhighlight %}    


###  ImageSpan 构造的注意：

如果直接利用Drawable 构造ImageSpan，则ImageSpan无法显示图片，图片 Bounds 没有设定，drawable无效；

而直接利用 SourceId 或者 Bitmap构造，则可以显示，根据构造函数可以看出来一些东西：

在内部会根据 SourceId 或者BitMap 构造 Drawable ，并设定Bounds；

{% highlight java %}

        Drawable drawable = getResources().getDrawable(R.drawable.ating_star);
        if (drawable != null){
            ImageSpan imageSpan = new ImageSpan(drawable);//不显示
        }


    //ImageSpan 构造函数
    public ImageSpan(Context context, Bitmap b, int verticalAlignment) {
        super(verticalAlignment);
        mContext = context;
        mDrawable = context != null
                ? new BitmapDrawable(context.getResources(), b)
                : new BitmapDrawable(b);
        int width = mDrawable.getIntrinsicWidth();
        int height = mDrawable.getIntrinsicHeight();
        mDrawable.setBounds(0, 0, width > 0 ? width : 0, height > 0 ? height : 0); 
    }

{% endhighlight %}    

### ImageSpan居中问题：

ImageSpan 目前看来还是有些问题，网上的解决方案要么无法解决图片过大，要么无法解决行间距问题；



### 获取App签名 与 包名：


{% highlight java %}

    //根据包名获取 App签名
    private byte[] getSignature(Context context, String pkg){
        try {
            PackageInfo packageInfo = context.getPackageManager().getPackageInfo(pkg, PackageManager.GET_SIGNATURES);
            if (packageInfo != null &&packageInfo.signatures != null)
            return packageInfo.signatures[0].toByteArray();
        }catch(Exception e){
            e.printStackTrace();
        }
        return null;
    }

    //获取当前应用包名
    private static String getPackageName(Context context) throws PackageManager.NameNotFoundException {
        PackageManager manager = context.getPackageManager();
        return  manager.getPackageInfo(context.getPackageName(), 0).packageName;
    }

{% endhighlight %}  


###  主项目创建分支提交SVN是所依赖项目的处理的正确步骤：

> Browse SVN 分支并创建分支或者Tag ，但是当我们的项目有依赖项目时，一般我们会设定相应的 external 引用相对应的 lib项目地址；我们最初创建的分支，其主项目地址虽然已经更改但由于 新建分支复制了Trunk中项目的 properties,导致external依旧是先前的的，这样稍微不注意，新的代码会直接提交到trunk中
> 
> 在分支创建之后，将tag项目拉取，修改合适新建的properties，指向新的external
> 
>  properties修改完成，删除之前拉取的错误地址的 lib库，重新利用新建立的external 拉取新地址项目，构建全新的依赖项目；
>  
>  Done



###  Java String长度限制：

[String's Maximum length in Java - calling length() method](http://stackoverflow.com/questions/816142/strings-maximum-length-in-java-calling-length-method)

理论上说：由于其长度是利用一个`int`型记录,其长度极限应该是 Integer.MAX_VALUE —— 这种情况属于程序中动态生成，添加设定String对象；

但需要注意的是当明文编写源码String:`String s = "ssssss"1`时,最大长度却只能有 65534个。

源于Class文件规范中，CONSTANT\_Utf8\_info表中使用一个16位的无符号整数来记录字符串的长度的，最多能表示 65536个字节，而class 文件是使用一种变体UTF-8格式来存放字符的，null值使用两个字节来表示，因此只剩下 65536－ 2 ＝ 65534个字节。也正是变体UTF-8的原因，如果字符串中含有中文等非ASCII字符，那么双引号中字符的数量会更少（一个中文字符占用三个字节(UTF-8下3字节，GBK下2字节)）。如果超出这个数量，在编译的时候编译器会报错。


### StringTokenizer：

了解一下即可，这是一个遗留类，目前有更高级的 String.splite()函数做字符分割，且支持表达式；

Java 内置分词符解析类：

构造函数：

StringTokenizer(String str)； //默认 空格 分割

public StringTokenizer(String str,String delim)




### Android 国家地区

{% highlight java %}

//获取系统语言列表
Locale.getAvailableLocales(); 
//获取当前使用语言
Locale.getDefault().getLanguage();
//获取当前地区
Locale.getDefault().getCountry();


{% endhighlight %}  



---

Quote：

[Align text around ImageSpan center vertical](http://stackoverflow.com/questions/25628258/align-text-around-imagespan-center-vertical)