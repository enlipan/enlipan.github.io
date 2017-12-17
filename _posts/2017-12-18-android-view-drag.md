---
layout: post
title:  Android ViewDragHelper
category: android
keywords: [improvement,android,java]
---

Android View 查漏补缺之 ViewDragHelper,ViewDragHelper本身的使用并不复杂,但学习了解依旧是必须的,以备不时之需;

### 简介

ViewDragHelper 用于在自定义 ViewGroup 时,实现子 View 的拖拽以及位置移动等效果;

其构造函数: 

{% highlight java %}

 public static ViewDragHelper create(ViewGroup forParent, float sensitivity, Callback cb) {}

{% endhighlight %}

其核心操作都是配合其 CallBack 完成,具体解释在实践中分析;

### 实践  

{% highlight java %}
// 实现一个侧滑 Finish 的 View
public class SwipeBackFrameLayout extends FrameLayout {

    private SwipeCallBack mSwipeCallBack;

    private ViewDragHelper mDragHelper;

    private float mCriticalWidth;

    private View mContentView;

    public SwipeBackFrameLayout(@NonNull Context context) {
        this(context, null);
    }

    public SwipeBackFrameLayout(@NonNull Context context, @Nullable AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public SwipeBackFrameLayout(@NonNull Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }

    public void setSwipeCallBack(SwipeCallBack callBack) {
        mSwipeCallBack = callBack;
    }

    @Override
    protected void onFinishInflate() {
        super.onFinishInflate();
        for (int i = 0; i < getChildCount(); i++) {
            if (getChildAt(i) instanceof ViewGroup) {
                mContentView = getChildAt(i);
                break;
            }
        }
        if (mContentView == null) {
            Log.e("SwipeError", "onFinishInflate", new IllegalAccessException("must have one ContainerView"));
        }
    }

    private void init(Context context) {
        mCriticalWidth = DisplayUtil.dip2px(context, 40);
        mDragHelper = ViewDragHelper.create(this, 1.0f, new ViewDragHelper.Callback() {
            private float mLastDx;

            @Override
            public boolean tryCaptureView(View child, int pointerId) {
                // 是否捕获相关View
                // 可用于指定哪些 View 可被拖拽
                return true;
            }

            @Override
            public void onEdgeTouched(int edgeFlags, int pointerId) {
                super.onEdgeTouched(edgeFlags, pointerId);
                mDragHelper.captureChildView(mContentView, pointerId);// 边缘触摸操作 Action 时捕获 View
            }

            // 子 View 水平方向可被拖拽范围
            @Override
            public int getViewHorizontalDragRange(View child) {
                // > 0 时  shouldInterceptTouchEvent Action Move 时才可能触发 tryCaptureViewForDrag,拖拽操作才可能被执行
                return 1;
            }

            @Override
            public int clampViewPositionHorizontal(View child, int left, int dx) {
                // 控制水平边界
                // 如需控制 View 不移出 Container 边界,则需控制最大边界值
                //  final int maxLeftPosition = (getWidth() - child.getMeasuredWidth());
                // 左边最大边界值为 0 ; 小于0 则有 View 移动超出了 Container 左边;  


                mLastDx = dx;// 水平移动距离,注意 如果拖拽时不放手,先向左拖拽后向右拖拽, dx 先为正数后为负数(< 0)
                // 设置水平滑动的距离范围
                return (int) Math.min(mCriticalWidth, Math.max(left, 0));
            }

            @Override
            public void onViewPositionChanged(View changedView, int left, int top, int dx, int dy) {
                super.onViewPositionChanged(changedView, left, top, dx, dy);
                // left = 左侧滑动的距离 通常用于根据滑动距离做 View 变化控制
                float alpha = (left * 1.0f) / mCriticalWidth;
                // 设置其 alpha 值变化 以及等由于侧滑显示 View 的动画变化

            }

            @Override
            public void onViewReleased(View releasedChild, float xvel, float yvel) {
                // 释放时判定条件,是否拖动到临界值
                super.onViewReleased(releasedChild, xvel, yvel);
                Log.i("onViewReleased", "dx: " + mLastDx);
                if (mLastDx > 0) {
                    if (mCriticalWidth == releasedChild.getLeft()) {
                        if (mSwipeCallBack != null) {
                            mSwipeCallBack.onSwipeFinish();
                            return;
                        }
                    }
                }
                // back 复位
                // 设置释放 View 的位置 ,拖拽释放时可以重新设置其初始位置,方法内部利用 scroll 实现,配合 computedScroll完成 View 的位置二次初始化
                mDragHelper.settleCapturedViewAt(0, releasedChild.getTop());// computedScroll,只能在 onViewReleased 触发
                postInvalidate();

            }

            @Override
            public void onViewDragStateChanged(int state) {
                super.onViewDragStateChanged(state);
                if (mDragHelper.getViewDragState() == ViewDragHelper.STATE_IDLE
                    && mSwipeCallBack != null && mLastDx > 0) {
                    if (mContentView.getLeft() == mCriticalWidth) { // 拖拽停止,并且达到了拖拽触发 Callback 的条件
                        mSwipeCallBack.onSwipeFinish();
                    }
                }
            }
        });
        mDragHelper.setEdgeTrackingEnabled(ViewDragHelper.EDGE_LEFT);// 从左向右滑动
    }

    @Override
    public void computeScroll() {
        super.computeScroll();
        if (mDragHelper.continueSettling(true)) {
            postInvalidate();
        }
    }

    @Override
    public boolean onInterceptHoverEvent(MotionEvent event) {
        return mDragHelper.shouldInterceptTouchEvent(event);// 拦截事件处理,注意子 view 是否可点击以及点击事件与拖动事件的冲突处理
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        mDragHelper.processTouchEvent(event); // 托管其 Touch 事件
        return true;
    }

    interface SwipeCallBack {
        void onSwipeFinish();
    }
}


{% endhighlight %}


其实并不复杂, google 已经实现了大量的 View 处理,暴露出了简洁的 api, 对于自定义 View drag 以及手势等相关 api 非常有必要学习了解;

---

Quote: 

[ViewDragHelper实现QQ侧滑菜单](https://mp.weixin.qq.com/s?src=3&timestamp=1513477020&ver=1&signature=CtnYdgZJ-XIZ2D-wGyjT8v-92ZKy9zEbRRv60hD0zeRIAdxS5yACFYARNLytggBTnw*JE1c1Pie7Y1Xxv5wDRKjITBqunfHU3BX9x6JGe9geYO1KXK55wMLo4wG3sojWhdUKScU4wdnTavijMblvl66-ff9lHx2Tx8VpObe6YS4=)