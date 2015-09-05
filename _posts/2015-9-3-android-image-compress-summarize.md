---
layout: post
title: 关于图片压缩的一些处理总结
category: android
---

最近做朋友圈照片墙和照片浏览，就算小小的GridLayout嵌入图片讲究也是超级多，以后两亿多用户要使用的，稍有不注意带来的是灾难性的，就算是公司那帮魔鬼测试的光或许都不能过，所以自己边做边训练，边做边优化，想到一点优化一点，一点点迭代开发，最后才终于有了一点样子。

昨天上班的时候总觉得马上放大假，没啥心情，又拿出来好好的优化了一下，对于图片的缩放或者是裁剪做了一些研究，最后还是采用了微信的方案，图片裁剪九宫格图片的小样张效果明显会比图片按比例缩放之后再拉伸填充到整个ImageView要好一些。

####为什么要对图片进行处理

一般我们根据Path路径获取图片bitmap之后，考虑的首要问题就是如何合适的展示我们的图片。鉴于手机屏幕的大小，往往原图加载往往容易浪费过多内存，很多时候一张高清图片加载进入内存需要消耗数十M的内存，这种情况下往往容易造成糟糕的OOM，对于这样的情况我们可以对于图片做相应的处理，一方面更好的加载速度，更流畅的用户体验，更优化的性能。

首先看一下图片内存空间占用的计算：

**总的来说：占用内存数就是图片像素数目与每个像素所暂用字节数的乘积**

根据Bitmap.Config 我们可以知道对应的每个像素占用字节数：

> Bitmap.Config   ALPHA_8   Each pixel is stored as a single translucency (alpha) channel. This is very useful to efficiently store masks for instance. No color information is stored. With this configuration, each pixel requires 1 byte of memory.
> 
> Bitmap.Config   ARGB_8888   Each pixel is stored on 4 bytes. Each channel (RGB and alpha for translucency) is stored with 8 bits of precision (256 possible values.) This configuration is very flexible and offers the best quality. It should be used whenever possible.
> 
> Bitmap.Config   RGB_565   Each pixel is stored on 2 bytes and only the RGB channels are encoded: red is stored with 5 bits of precision (32 possible values), green is stored with 6 bits of precision (64 possible values) and blue is stored with 5 bits of precision. This configuration can produce slight visual artifacts depending on the configuration of the source. For instance, without dithering, the result might show a greenish tint. To get better results dithering should be applied. This configuration may be useful when using opaque bitmaps that do not require high color fidelity.

常用的就是以上三种，其中 ARGB\_4444由于图片的显示效果不好，已经不再推荐使用。（Because of the poor quality of this configuration, it is advised to use ARGB_8888 instead.），可以看出很多时候如果对于图像不作处理而直接加载图片的加载内存空间就会直接超过Android所指定的16M空间。所以对图片进行处理是非常有必要的。

####如何对图片进行处理

对于图片的处理是一个比较复杂的过程，但是归根结底图片的加载也就只有那么几种情况，一一分析开来总结就好。

**原图的情况**

* 原图正方形       
* 原图高大于宽的高长方形          
* 原图宽大于高的宽长方形    
* 其他形状         

在开发的时候我们往往是不会知道图片是什么形状，而是要针对这些形状做相应的处理显示到我们需求定义的图片框中去，也就是我们的图片框形状是固定，我们的图片原图形状不固定，我们的图片处理逻辑需要针对这些形状的图片做相应的处理显示到指定的ImageView中去，就像设计算法时，输 入的确定很重要，原图情况的列出也是比较重要的。

**图片的处理**

* 图片的宽高比ImageView定义的宽高还小       
* 图片的像素点数大于ImageView所能容纳的宽高乘积

针对图片过大的情况，当然一般遇到的都是这样的情况，我们可以进行的操作有两种：

* 一种是针对相应的比例缩放，插入到ImageView中，缩放之后有可能无法填补满ImageView，也就是ImageView中会有留白，我们针对缩放图片进行再拉伸填充。        
* 另一种是针对ImageView的大小，进行另外的合适的比例缩放，缩放之后直接从中间剪裁，取中间填充进入ImageView。

两种思路，都是首先要对于图片进行相应的缩放，但是缩放比例的选取就各有千秋了，可以说是截然相反的，最后的显示效果我个人还是比较喜欢剪裁显示，更加还原的图片的情况，而不会过度拉伸造成图片失真。

**BitmapFactory.Options：**

inJustDecodeBounds： 

* true  只返回图片的参数，而不将BitMap图片加载进入内存，设定之后便于测定原图各项参数，进行分析。

inSampleSize：

*  代表着宽高各压缩的比例，如果inSampleSize为4，则宽压缩为1/4,高压缩为1/4,总体图片也就被压缩为原图的1/16，大大的节约内存空间。任何小于或者等于1的值都将被系统当作1处理，也就是不压缩，原图处理。



**图片缩放的比例计算**

第一种方式（来源于郭神），其计算特点是简单，容易想到：

{%  highlight java %}

 //用于计算图片压缩宽高比
 public static  int calculateBitMapSize(BitmapFactory.Options options,int reqWidth, int reqHeight) {
  final int height = options.outHeight;
  final int width = options.outWidth;
  int inSampleSize = 1;
  if (height > reqHeight || width > reqWidth) {
   // 计算出实际宽高和目标宽高的比率
   final int heightRatio = Math.round((float) height / (float) reqHeight);
   final int widthRatio = Math.round((float) width / (float) reqWidth);
   Log.e("xxxx", "heightRatio"+heightRatio);
   Log.e("xxxx", "widthRatio"+widthRatio);
   // 选择宽和高中最小的比率作为inSampleSize的值，保证最终图片的宽和高
   inSampleSize = heightRatio < widthRatio ? heightRatio : widthRatio;
  }
  return inSampleSize;
 }


{% endhighlight %}

这种方案，来源于我们设定好了指定的ImageView大小，同时我们又期望把整张图片完整的放入ImageView中去，那么我们就对比ImageView的宽高与原图片BitMap的宽高,分别取出原图高与目标ImageView的高比以及原图宽与目标宽比。结合根据inSampleSize说明，这种算法我们取宽高比的小值进行压缩，也就是如果保证原图片的宽高比的情况下，进行图片的缩放，截取放入展示ImageView中显示。


第二种方式对于图片进行最大程度的压缩，保证整个图片能完整的放入ImageView中。
 
{%  highlight java %}

 //计算裁剪压缩比
 public static  int calculateBitMapTailorSize(BitmapFactory.Options options,int reqWidth, int reqHeight) {
  final int height = options.outHeight;
  final int width = options.outWidth;
  Log.e(TAG, "height:"+height+"width:"+width+"reqWidth:"+reqWidth+"reqHeight"+reqHeight);
  int ratio =0;
  int inSampleSize = 1;
  if (height > width && height > reqHeight) {
   // 计算出实际宽高和目标宽高的比率
   ratio = Math.round((float) height / (float) reqHeight);
  }else if (width > height && width > reqWidth) {
   ratio = Math.round((float) width / (float) reqWidth);
  }
  if (ratio > 1) {
   inSampleSize = (int)ratio;
  }
  Log.e(TAG, "inSampleSize:"+inSampleSize);
  return inSampleSize;
 }

{% endhighlight %}

这种方案中我们在确定原图是高大于宽的高图亦或是宽大于高的宽图之后，基于我们要完全显示整个图片的大小，也就是我们需要完成将宽高中较大的边完全放入ImageView中，那么我们设定压缩比时需要设定其长边比，完成将长边完全放入View中。最后设定保存长边比，同时只有当比大于1时取出来赋值返回，否则使用默认值1，不作图片处理。不作处理的情况代表着其原图长边能够直接被ImageView容纳下，我们当然可以直接原图输出显示，这样的情况保证了长边吻合ImageView而不能保证短边吻合，很多时候我们需要拉伸图片才能使图片完全填充ImageView，也就是设定图片拉伸模式ImageView.ScaleType，具体参照Google文档。



 第三种方案与第二种方案思路相反，保证短边吻合，而让ImageView自动选择输出显示部分原图，一般是从中心点开始往两边对称长度，造成裁剪输出的效果，这种显示效果比较清晰。


{%  highlight java %}

 //计算裁剪比
 public static  int calculateTailorSize(BitmapFactory.Options options,int reqWidth, int reqHeight) {
  final int height = options.outHeight;
  final int width = options.outWidth;
  Log.e(TAG, "height:"+height+"width:"+width+"reqWidth:"+reqWidth+"reqHeight"+reqHeight);
  int ratio =0;
  int inSampleSize = 1;
  if (height > width && height > reqHeight) {

   ratio = Math.round((float) width / (float) reqWidth);
  }else if (width > height && width > reqWidth) {
   ratio = Math.round((float) height / (float) reqHeight);
   
  }
  if (ratio > 0) {
   inSampleSize = (int)ratio;
  }
  Log.e(TAG, "inSampleSize:"+inSampleSize);
  return inSampleSize;
 }
 

{% endhighlight %}


{%  highlight java %}

 //换算像素与DP值，来源于StackOverFlow
 public static int getPixels(Context context,int dipValue){
        Resources r = context.getResources();
        int px = (int)TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dipValue,
        r.getDisplayMetrics());
        return px;
 }


{% endhighlight %}

 ---

Quote：

 [如何为你的Android应用缩放图片](http://www.open-open.com/lib/view/open1329994992015.html如何为你的Android应用缩放图片)

 [ImageView.ScaleType](http://developer.android.com/reference/android/widget/ImageView.ScaleType.html)