---
layout: post
title:  Android View Matrix
category: android
keywords: [improvement,android]
---

图像的矩阵变换是自定义View中比较重要的一块知识,之前一直没有时间去整理,这里花了一些时间整理;

### 原理

#### 矩阵变换

核心是矩阵的乘法,如何理解矩阵的乘法?

矩阵: 矩阵最初用于线性变换

> 向量空间V到其自身的映射称为V的变换，V到V的线性映射称为V的线性变换，简言之，线性映射就是保持线性关系的映射。

矩阵的乘法则是线性映射意义的提现,从一个矩阵变换为另一个矩阵;

矩阵 A\[MxN\] * 矩阵 B \[NxP\] 最终得到 MxP 的行列式,结果中第一列等于矩阵 A 左乘矩阵 B 的第一列,推而广之...    

矩阵的秩: 

>你们家r口人，然后拍了n张照片。这个r就是秩了。


[把矩阵乘法看成空间变换](https://mp.weixin.qq.com/s?src=11&timestamp=1511982777&ver=544&signature=OVCYS09E5XSfHHD-epJdiIKOAzm7lMX269vsyW07UOXvNTVPCpNJTTH3KOndqIdXLguz6tmUh54LsW4B065hXKnhoSVH7I0-YHb9eocsHH8EWGg9p4JtJhG53ifFO8hD&new=1)

[矩阵乘法和逆（MIT Linear algebra）](https://mp.weixin.qq.com/s?src=11&timestamp=1511982777&ver=544&signature=6dL4SFAkyT9e8onhq*Eu1xEQvGU5WyPUanzJb6h8t3DOllhW-XpCCCDQp*yOjp3xl1YPzwkXL8voFTK8cwAj75OYvoBjwDkoK-p4covV3xZyKbdTuBoNxH06AHx*l2SD&new=1)


线性变换以及矩阵向量乘法的实际意义:

变换本质是函数的别名,输入变换输出结果,而变换增加了运动性思维;

线性变换:缩放,旋转,组合错切;特征是直线向量变换后仍旧是直线,且保持空间原点不变,变换后线性关系不变,标量不变性,进而由变换后的基向量推算其他任意向量在线性空间变换后的结果向量;

用基向量表示任意向量,而变换后的基向量同样可以表示变换后的结果向量,只要确定了基向量的变换矩阵就确定了变换前后的向量关系;一个二维线性变换由一个二维矩阵可以决定变换结果;这个二维矩阵事实上可以看错变换后的基向量;

总结: 线性变换是操纵空间的一种手段,矩阵的乘法事实上是将矩阵代表的线性变换作用于对应向量上;

复合变换: 线性变换组合;

明确矩阵相乘的几何意义;

平移变换: 借助其次坐标系完成加法到矩阵乘法的转换,进而充分利用计算机矩阵计算,图形学中重要节点;


### 实践   

Pre:  右乘 , 如果 M 代表原矩阵,则实际为 M * S  

Post : 左乘 , S * M  如: postScale为 M' = S(sx, sy) * M

需要注意的是 矩阵的乘法交换律不满足,左乘不等于右乘,这点在空间变换中很好理解;

但矩阵的乘法同样满足结合律:  T*(M*R) = T*M*R = (T*M)*R,这点在空间变换中理解就很正常了,从右向左依次对空间进行线性变换,无论如何结合都是显而易见的,这点在 **线性代数的本质**视频中的讲述十分精彩;

mapRect : 相关矩阵计算,计算矩阵运算后的结果;

setPolyToPoly: [Matrix详解](http://www.gcssloop.com/customview/Matrix_Method)

### 应用  

利用 Matrix 实现手势缩放 ImageView 

总结:  

理解矩阵乘法的意义,有遗漏时可以通过观看 [线性代数的本质](https://www.bilibili.com/video/av6731067/#page=4)温习;

矩阵变换涉及到线性变换以及平移变换,平移变换涉及到齐次矩阵相关知识,通过在高维度的矩阵乘法完成低维度的加法平移问题;

{% highlight java %}

@SuppressLint("AppCompatCustomView")
public class ZoomImageView extends ImageView implements ViewTreeObserver.OnGlobalLayoutListener {
    private final float sFloatTagOne = 1.0f;// 用于 int 变换 float
    private final float sFloatTagCompare = 0.01f;// float 比较

    public ZoomImageView(Context context) {
        super(context);
        initView(context);
    }

    public ZoomImageView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        initView(context);
    }

    public ZoomImageView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initView(context);
    }

    /// init
    private Matrix mMatrix;
    private ScaleGestureDetector mScaleGestureDetector;

    private boolean isHasAutoLayoutImg = false;

    private float mInitScale = sFloatTagOne;
    private float mMaxScale;
    private float mMidScale;

    /// Touch Move
    private int mTouchSlop;

    /// DoubleCheck
    private GestureDetector mGestureDetector;
    private volatile boolean mIsInAutoScale = false;//当前是否处于双击缩放过程中

    private void initView(Context context) {
        mTouchSlop = ViewConfiguration.get(context).getScaledTouchSlop();//move 阈值

        mMatrix = new Matrix();
        // 多点触控
        mScaleGestureDetector = new ScaleGestureDetector(context, new ScaleGestureDetector.OnScaleGestureListener() {
            @Override
            public boolean onScale(ScaleGestureDetector detector) {
                float scaleFactor = detector.getScaleFactor();//放大缩小的乘数 scaling factor from the previous scale event to the current

                if (getDrawable() == null) return true;

                float currentScale = getCurrentScaleValue();
                if ((currentScale < mMaxScale && scaleFactor > sFloatTagOne) // 允许范围内手势放大
                    ||
                    (currentScale > mInitScale && scaleFactor < sFloatTagOne)// 允许范围内手势缩小
                    ) {
                    if (currentScale * scaleFactor > mMaxScale) {
                        scaleFactor = mMaxScale / currentScale;
                    }
                    if (currentScale * scaleFactor < mInitScale) {
                        scaleFactor = mInitScale / currentScale;
                    }
                    mMatrix.postScale(scaleFactor, scaleFactor, detector.getFocusX(), detector.getFocusY());//以手势聚焦点为中心缩放

                    checkImgBordAndCenterWhenScale();

                    resetViewMatrix();
                }
                return true;
            }

            @Override
            public boolean onScaleBegin(ScaleGestureDetector detector) {
                return true;//是否检测此次手势事件
            }

            @Override
            public void onScaleEnd(ScaleGestureDetector detector) {
            }
        });
        setOnTouchListener(new OnTouchListener() {
            float mLastY;
            float mLastX;
            boolean mIsCanBeDrag;// 是否能够被移动
            int mLastPointerCount;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                mScaleGestureDetector.onTouchEvent(event);//手势接口监听 Touch 事件
                mGestureDetector.onTouchEvent(event);

                float x = 0, y = 0;
                final int pointCount = event.getPointerCount();//拖动时的多点触控优化,如用户先点击一个手指,接着另外的手指按下
                //多点取各点的中心值
                for (int i = 0; i < pointCount; i++) {
                    x += event.getX(i);
                    y += event.getY(i);
                }
                x /= pointCount;
                y /= pointCount;// 取多点的中心值   一个点在左上一个点在右下,相当于一个手指在屏幕中心点击

                if (mLastPointerCount != pointCount) {
                    mIsCanBeDrag = false;
                    mLastX = x;
                    mLastY = y;
                }
                mLastPointerCount = pointCount;

                switch (event.getActionMasked()) {
                    case MotionEvent.ACTION_DOWN: {
                        // More
                        // 如果没有左右移动到图片的边界 移动事件由 View 本身处理请求不被父 View 拦截
                        //getParent().requestDisallowInterceptTouchEvent(true);
                        if (Math.abs(getMatrixRecF().width() - getWidth()) > sFloatTagCompare) {
                            getParent().requestDisallowInterceptTouchEvent(true);
                        }
                    }
                    break;
                    case MotionEvent.ACTION_MOVE: {
                        float dx = x - mLastX;//Move 事件中常见的处理移动距离的逻辑
                        float dy = y - mLastY;
                        if (!mIsCanBeDrag) {
                            mIsCanBeDrag = isMoveAction(dx, dy);// 判断是否是 Move 事件
                        }
                        if (mIsCanBeDrag) {
                            RectF rectF = getMatrixRecF();
                            if (getDrawable() != null) {
                                if (rectF.width() <= getWidth()) {// 相等时也需要校验,差值消除
                                    dx = 0;
                                }
                                if (rectF.height() <= getHeight()) {
                                    dy = 0;
                                }
                                mMatrix.postTranslate(dx, dy);
                                checkBorderWhenTranslate();
                                resetViewMatrix();
                            }
                        }
                        mLastX = x;
                        mLastY = y;
                    }
                    break;
                    case MotionEvent.ACTION_UP: {
                        mLastPointerCount = 0;
                    }
                    break;
                }
                return true;
            }

            private boolean isMoveAction(float dx, float dy) {
                //根据 x  y 的偏移量 做勾股定理 取斜方向便宜
                return Math.sqrt(dx * dx + dy * dy) > mTouchSlop;
            }
        });

        mGestureDetector = new GestureDetector(context, new GestureDetector.SimpleOnGestureListener() {
            @Override
            public boolean onDoubleTap(MotionEvent e) {
                if (mIsInAutoScale) return true;//正在响应上次的双击事件

                float x = e.getX();
                float y = e.getY();
                if (getCurrentScaleValue() < mMidScale) {
                    post(new AutoScaleRunnable(mMidScale, x, y));
                } else {
                    post(new AutoScaleRunnable(mInitScale, x, y));
                }
                return true;
            }
        });
    }

    private final class AutoScaleRunnable implements Runnable {
        private final float SMALL = 0.92f;// 放大缩小的步进
        private final float BIG = 1.08f;
        private float mTempScale;
        private float mTargetScale;
        private float mPointX;
        private float mPointY;

        private AutoScaleRunnable(float targetScale, float pointX, float pointY) {
            mTargetScale = targetScale;
            mPointX = pointX;
            mPointY = pointY;
            if (getCurrentScaleValue() < mTargetScale) {// 当前操作是要放大还是缩小
                mTempScale = BIG;
            } else if (getCurrentScaleValue() > mTargetScale) {
                mTempScale = SMALL;
            }
        }

        @Override
        public void run() {
            mIsInAutoScale = true;

            // 先处理放大/缩小逻辑
            scaleImgToTargetMatrixValue(mTempScale);

            if (mTempScale > sFloatTagOne && getCurrentScaleValue() < mTargetScale) {//需要继续放大
                postDelayed(this, 20);
            } else if (mTempScale < sFloatTagOne && getCurrentScaleValue() > mTargetScale) {//需要继续缩小
                postDelayed(this, 20);
            } else {// 以目标值放大或缩小步进超过了 target,直接向目标值调整结束本次
                scaleImgToTargetMatrixValue(mTargetScale / getCurrentScaleValue());

                mIsInAutoScale = false;
            }
        }

        private void scaleImgToTargetMatrixValue(float scaleTimes) {
            mMatrix.postScale(scaleTimes, scaleTimes, mPointX, mPointY);
            checkImgBordAndCenterWhenScale();
            resetViewMatrix();
        }
    }

    private void checkBorderWhenTranslate() {
        final RectF rectF = getMatrixRecF();
        float deX = 0, deY = 0;
        int w = getWidth();
        int h = getHeight();

        if (rectF.height() > h) {
            if (rectF.top > 0) {
                deY = -rectF.top;
            }
            if (rectF.bottom < h) {
                deY = h - rectF.bottom;
            }
        }
        if (rectF.width() > w) {
            if (rectF.left > 0) {
                deX = -rectF.left;
            }
            if (rectF.right < w) {
                deX = w - rectF.right;
            }
        }
        mMatrix.postTranslate(deX, deY);
        resetViewMatrix();
    }

    /**
     * 以手势操作点为中心对图片进行缩放可能出现的 图片边缘白边问题
     */
    private void checkImgBordAndCenterWhenScale() {
        RectF rectF = getMatrixRecF();
        float deltaX = 0;
        float deltaY = 0;

        int w = getWidth();
        int h = getHeight();

        // 针对放大缩小后的 matrix 边界与 View 的边界进行比较
        // 对图片进行边界的细节的弥补
        // 当图片的宽度或者高度大于 View 的宽度高度时产生的边缘空隙才需要平移弥补
        if (rectF.width() >= w) {
            if (rectF.left > 0) {
                deltaX = -rectF.left;
            }
            if (rectF.right < w) {
                deltaX = w - rectF.right;
            }
        }
        if (rectF.height() >= h) {
            if (rectF.top > 0) {
                deltaY = -rectF.top;
            }
            if (rectF.bottom < h) {
                deltaY = h - rectF.bottom;
            }
        }
        // 如果 img 宽度高度小于控件宽度高度-> img 居中
        if (rectF.width() < w) {
            deltaX = w / 2 - rectF.right + rectF.width() / 2;
        }
        if (rectF.height() < h) {
            deltaY = h / 2 - rectF.bottom + rectF.height() / 2;
        }
        mMatrix.postTranslate(deltaX, deltaY);
        setImageMatrix(mMatrix);
    }

    /**
     * 获取当前图片被 Matrix 应用变换后的图片矩形边界
     */
    private RectF getMatrixRecF() {
        RectF rectF = new RectF();

        Drawable d = getDrawable();
        if (d == null) return rectF;


        rectF.set(0, 0, d.getIntrinsicWidth(), d.getIntrinsicHeight());
        mMatrix.mapRect(rectF);//Apply this matrix to the rectangle  获取图片应用 Matrix 之后的 img border
        return rectF;
    }

    private float getCurrentScaleValue() {
        final float[] values = new float[9];
        mMatrix.getValues(values);
        return values[Matrix.MSCALE_X];// 一维数组 9个数字表示 3维矩阵,矩阵中对应位置 Value 的物理含义
    }

    @Override
    public void onGlobalLayout() {
        firstInitScaleLayout();
    }
    
    //图片初始化显示时的自适应缩放
    private void firstInitScaleLayout() {
        //视图数变化时会触发 CallBack ,防止多次缩放操作
        if (!isHasAutoLayoutImg) {
            isHasAutoLayoutImg = true;

            final int w = getWidth();
            final int h = getHeight();

            Drawable drawable = getDrawable();
            if (drawable == null) return;

            final int dw = drawable.getIntrinsicWidth();
            final int dh = drawable.getIntrinsicHeight();

            float scale = sFloatTagOne;
            if (dw > w && dh < h) {// 图片宽/高单边大于可显示宽高,计算图片缩小比例
                scale = w * sFloatTagOne / dw;
            }
            if (dw < w && dh > h) {
                scale = h * sFloatTagOne / dh;
            }

            if (dw > w && dh > h) {//缩小
                scale = Math.min(w * sFloatTagOne / dw, h * sFloatTagOne / dh);
            }
            if (dw < w && dh < h) {//放大
                scale = Math.min(w * sFloatTagOne / dw, h * sFloatTagOne / dh);
            }
            mInitScale = scale;
            mMaxScale = mInitScale * 5;
            mMidScale = mInitScale * 2;

            //移动图片至 View 中心  平移
            mMatrix.postScale(mInitScale, mInitScale);
            mMatrix.postTranslate((w - getMatrixRecF().width()) / 2, (h - getMatrixRecF().height()) / 2);
            resetViewMatrix();
        }
    }

    private void resetViewMatrix() {
        setScaleType(ScaleType.MATRIX);
        setImageMatrix(mMatrix);
    }

    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        getViewTreeObserver().addOnGlobalLayoutListener(this);
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        getViewTreeObserver().removeOnGlobalLayoutListener(this);
    }

}

{% endhighlight %}

---


Quote:

[深入理解 Android 中的 Matrix](http://www.jianshu.com/p/6aa6080373ab)

[安卓自定义View进阶-Matrix原理](http://www.gcssloop.com/customview/Matrix_Basic)

[安卓自定义View进阶-Matrix详解](http://www.gcssloop.com/customview/Matrix_Method)