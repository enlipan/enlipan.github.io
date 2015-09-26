---
layout: post
title: 自定义消息红点TextView
category: android
---

自定义收到消息之后绘制红点的View，说来也简单，没什么好说的，就是简单的归纳一下。简单的这类View利用背景图片去控制将大大提升其代码逻辑复杂度，内部封装度不够，后期看起来就麻烦。


首先考虑清楚，我们一般设定TextView宽高都是根据文本内容设定其宽高为Wrap\_content，进而完成屏幕的适配。

红点的位置确认很关键，我所需求的是在右上方显示红点，红点的半径为文本高度的十分之一，由于文本高度设置的是wrap\_content,那么我们要显示红点则需要拓展其宽高，根据View的绘制原理，View宽高测定是在onMeasure中完成，我们拓展其原有宽高，设置为增加了红点半径之后的宽高。

在onDraw中利用获取到Canvas，以及初始化的Paint，同时计算好的设定红点圆心，开始绘制红点。我们还可以设定其透明度，抗锯齿等等参数，根据需要一一设定即可，关键的点都已经讲完了。我们不需要自定义一些相关属性，所以Style的设定并不需要。

最后设置合适的方法对外暴露控制其绘制消除红点。

实例代码如下；

{% highlight Java %}

public class RedCircleTextView extends TextView {
    private Paint mRedPaint;
    private int mCircleX;
    private int mCircleY;
    private float mRadius;
    private boolean isDrawRedCircle = false;//默认不显示红点
    public RedCircleTextView(Context context) {
        super(context);
    }
    public RedCircleTextView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        mCircleX = this.getMeasuredWidth();
        mCircleY = this.getMeasuredHeight();
        mRadius = mCircleY/10.0f;
        this.setHeight(mCircleY+(int)mRadius);
        this.setWidth(mCircleX+2*(int)mRadius);
    }
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (isDrawRedCircle) {
            if(mRedPaint==null) mRedPaint = new Paint();
            mRedPaint.setColor(Color.RED);
            canvas.drawCircle(mCircleX-mRadius\*1.2,0+mRadius\*1.2,mRadius,mRedPaint);
        }
    }
    public  void drawRedCircle(){
        this.isDrawRedCircle = true;
        this.invalidate();
    }
    public  void cancleRedCircle(){
        this.isDrawRedCircle = false;
        this.invalidate();
    }
}

{%  endhighlight %}

