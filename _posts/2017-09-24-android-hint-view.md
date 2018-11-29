---
layout: post
title:  实现全屏HintView
category: android
keywords: [improvement,android,ui]
---

全屏 HintView引导界面: 主要是回顾一下 Xfermode的使用;

### 分析:

在 View 对应的位置绘制镂空透明的圆,同时绘制其他区域为半透明,其他的提示信息则根据所需选择全部绘制亦或是利用 xml 组合最后 inflate 进入;

画的位置?找到 View 的位置, easy, 如何画? 关键是画中间透明,四周又是半透明的全屏 View;绘制的 View 加到哪里?

将该 View 覆盖到 Activity 的 Cotnent 上,加载到 DecoreView 中,利用 DecorView作为 FrameLayout 的特性,直接将提示的全屏 View add可以迅速实现 View 的覆盖显示;那么剩下的问题就是如何绘制镂空透明圆;


### 知识储备:  

* DecorView 

`public class DecorView extends FrameLayout implements RootViewSurfaceTaker, WindowCallbacks`

需要知道的是Activity 中内容的组织形式: DecorView 是一个 FameLayout,加载屏幕内容,而屏幕内容其实分为三块,状态栏, ActionBar, 以及 Content;

* Xfermode

用于绘制透明镂空圆,利用Clear特性,将原来绘制的半透明背景,在目标区域清除一个圆,就达到了透明圆的实现;


### Demo 

{:.center}
![Scan_Image](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20170924/scan_hint_view.png "DemoView")

事实上实现是简单的,这里主要还是回顾一些不常用的 Xfermode相关的知识:

{% highlight java %}

public class ScanHintView extends LinearLayout {

    private static final PorterDuff.Mode MODE = PorterDuff.Mode.CLEAR;
    private PorterDuffXfermode mXfermode;

    private Paint mPaint = null;

    private int mRadius = -1;
    private int mCircleX;
    private int mCircleY;

    private RelativeLayout infoView = null;

    public ScanHintView(Context context) {
        this(context, null);
    }

    public ScanHintView(Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public ScanHintView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initView(context);
        addHintInfoView();
    }

    private void initView(Context context) {
        setWillNotDraw(false);

        mPaint = new Paint();
        mPaint.setAntiAlias(true);
        mPaint.setColor(Color.parseColor("#00000000"));
        mXfermode = new PorterDuffXfermode(MODE);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (mRadius > 0) {
            int layerId = canvas.saveLayer(0, 0, canvas.getWidth(), canvas.getHeight(), null, Canvas.ALL_SAVE_FLAG);

            canvas.drawColor(Color.parseColor("#80000000"));//半透明背景
            mPaint.setXfermode(mXfermode);
            canvas.drawCircle(mCircleX, mCircleY, mRadius, mPaint);

            canvas.restoreToCount(layerId);
        }
    }

    private void addHintInfoView() {
        infoView = (RelativeLayout) inflate(getContext(), R.layout.layout_bottom_hint_scan, this).findViewById(R.id.rl_hint_info_root);
        infoView.findViewById(R.id.tv_has_known).setOnClickListener(new OnClickListener() {
            @Override
            public void onClick(View view) {
                ScanHintView.this.setVisibility(GONE);
            }
        });
    }

    private void setPaddingInfo(int paddingTop, int paddingRight) {
        infoView.setPadding(0, paddingTop, paddingRight, 0);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        return true;
    }

    /**
     * 设置镂空圆的位置与大小
     * <p>
     * 图标总宽度 - paddingleft 15dp  就是圆的直径  进而找到圆心,也可以确定 margin
     * <p>
     * 根据 mTitleSubmit View 的位置以及宽高
     */
    public void setCircleLocation(int[] locationInScreen, int width, int height) {
        float leftPaddingOfSubmit = convertDpToPixel(15, getContext());
        final int x = (int) (locationInScreen[0] + leftPaddingOfSubmit + ((width - leftPaddingOfSubmit) / 2));
        mCircleX = x;//圆心 x 位置
        mCircleY = locationInScreen[1] + height / 2;//圆心 y
        mRadius = height / 2;
        setPaddingInfo(locationInScreen[1] + height, (int) (getDisWidth(getContext()) - x - convertDpToPixel(6, getContext())));
        postInvalidate();
    }

    private static float convertDpToPixel(float dp, Context context) {
        Resources resources = context.getResources();
        DisplayMetrics metrics = resources.getDisplayMetrics();
        return dp * ((float) metrics.densityDpi / DisplayMetrics.DENSITY_DEFAULT);
    }

    private static float getDisWidth(Context context) {
        Resources resources = context.getResources();
        DisplayMetrics metrics = resources.getDisplayMetrics();
        return metrics.widthPixels;
    }
}

//////////////////////
// 加载 HintView 
private void initHintViewShow() {
    if (true) {
        final AlphaAnimation fadeInAnimation = (AlphaAnimation) AnimationUtils.loadAnimation(this, R.anim.fade_in);
        final ScanHintView scanHintView = new ScanHintView(CreateAssessActivity.this);
        ViewGroup decorView = (ViewGroup) getWindow().getDecorView();
        decorView.addView(scanHintView, new ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        scanHintView.setVisibility(View.GONE);
        mTitleSubmit.post(new Runnable() {
            @Override
            public void run() {
                final int[] location = new int[2];
                mTitleSubmit.getLocationOnScreen(location);
                scanHintView.setCircleLocation(location, mTitleSubmit.getWidth(), mTitleSubmit.getHeight());
                scanHintView.setAnimation(fadeInAnimation);
                scanHintView.setVisibility(View.VISIBLE);
            }
        });
    }
}


{% endhighlight %}


---

Quote :

[Android中Canvas绘图之PorterDuffXfermode使用及工作原理详解](http://blog.csdn.net/iispring/article/details/50472485)

[自定义 View](http://blog.csdn.net/aigestudio/article/details/41316141)
