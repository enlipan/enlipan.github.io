---
layout: post
title: Android Tips part (4)
category: android
---

* 判断一个ScrollView 中的 View 是否正在屏幕中显示：

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


*  ImageSpan 构造的注意：

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

* ImageSpan居中问题：

















---

Quote：

[Align text around ImageSpan center vertical](http://stackoverflow.com/questions/25628258/align-text-around-imagespan-center-vertical)