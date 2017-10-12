---
layout: post
title:  Android 滑动
category: android
keywords: [improvement,android]
---

###  滑动  

常规滑动:  属性动画 || ScrollTo 

利用Scroller可以实现更加友好的弹性滑动,其常规构建流程:

* 构建 Scroller      
* scroller.startScroll 初始化滚动数据           
* computeScroll 完成滚动逻辑(scrollTo实际滚动实现)   
* computeScrollOffset return true 时表示当前的 startScroll 滑动未完成

View.computScroll(): 如何调用? 来追踪源码,可以发现其 View draw 绘制时调用了 computeScroll:

{% highlight java %}

    ViewGroup.dispatchDraw()

    ViewGroup.drawChild()

    protected boolean drawChild(Canvas canvas, View child, long drawingTime) {
        return child.draw(canvas, this, drawingTime);
    } 

    /**
     * This method is called by ViewGroup.drawChild() to have each child view draw itself.
     *
     * This is where the View specializes rendering behavior based on layer type,
     * and hardware acceleration.
     */
    boolean draw(Canvas canvas, ViewGroup parent, long drawingTime) {
        ...
        if (!drawingWithRenderNode) {
            computeScroll();
            sx = mScrollX;
            sy = mScrollY;
        }
        ...
    }

{% endhighlight %}

滚动 View Content:

* scrollTo(): to 指定位置

* scrollBy(): from 当前位置到相对位置  

通过以下源码来解释弹性滑动,事实上弹性滑动就是在一定时间内持续的滑动一段距离而不是直接利用 ScrollTo 滑动到目标位置:

以下实现的逻辑中 startScroll 看起来很迷惑,可事实上进入源码却发现该函数并没有做任何滑动的逻辑,仅仅是对初始状态的记录以及目标状态等值做出更新;

一切的起点就在 startScroll 之后的 invalidate触发的 View 重绘 View.draw 触发 computeScroll,由于默认的 computeScroll是空实现,所以此处的重写逻辑非常重要, computeScrollOffset 刷新 View 滚动的位置状态并返回当前滑动是否完成, 位置状态被更新后利用scrollTo 触发内容的滚动,同时再次循环触发重绘与上一次相同知道此次的 startScroll 设定的目标滑动状态完成;

{% highlight java %}

    private Scroller mScroller;
    private void init(Context context) {
        mScroller = new Scroller(context);

        setWillNotDraw(false);// computeScroll 在 View.draw 中执行
        ViewConfiguration.get(context).getScaledPagingTouchSlop();
    }

    @Override
    public void computeScroll() {
        if (mScroller.computeScrollOffset()) {// 滚动未执行完,更新对应时间的当前滚动位置,持续执行滚动
            scrollTo(mScroller.getCurrX(), mScroller.getCurrY());
            postInvalidate();
        }
    }

    /**
     * @param desX 目标 X 位置
     * @param desY 目标 Y 位置
     */
    public void scrollAction(int desX, int desY) {
        int scrollX = getScrollX();// 当前左边滚动距离  初始0
        int dX = desX - scrollX;
        mScroller.startScroll(scrollX, 0, dX, desY);
        invalidate();
    }

{% endhighlight %}

### 滑动冲突

1. 内外滑动方向一致时,如何控制滑动事件分发到对应的 View? 内部滚动还是外部滚动?

2. 内外方向不一致时,如何分发?

#### 解决方案: 

外部拦截控制分发:   

核心函数: onInterceptTouchEvent 通过滑动触发位置以及滑动的状态决定是否拦截滑动

内部控制分发: 

核心函数 : requestDisallowInterceptTouchEvent,内部 View请求外部不拦截TouchEvent, 而由自己控制; 典型应用如: ScrollView 中嵌套多行EditText, EditText 输入多行时的滚动事件处理;    


---

Quote:

[一文解决Android View滑动冲突](http://www.jianshu.com/p/982a83271327)

[ViewPager源码分析（2）：滑动及冲突处理](http://blog.csdn.net/huachao1001/article/details/51654692)