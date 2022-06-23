---
layout: post
title:  RecyclerView Nested
category: android
keywords: [anroid,View]
---

### Android Touch事件处理

dispatchTouchEvent、onInterceptTouchEvent、onTouchEvent

如果是来自ViewParent的Touchdown事件，子View不处理，会上抛给父的onTouchEvent处理。子View如果不处理Down事件（不关心），后续的move等事件也不会传递到子View；而如果子View处理了down事件，下一个move事件到来子 View 不处理，那ParentView 也不会处理，此TouchEvent 事件被丢弃;
也就是父View就无法再次得到事件的回传，也就是父View层级就要决定好事件的处理问题，而事件本身却需要根据情况由子View决定父View是否也要处理该事件

### 嵌套RecyclerView的简单处理：
1.嵌套 RecyclerView 设定具体高度


2.嵌套 RecyclerView 不设定高度，但禁用其获取滚动事件，滑动交给 ScrollView处理，但是该问题在于RecyclerView的View无法重用，所有Item会在初始时全部加载

在看嵌套滑动之前要了解一些滑动的基础知识:

* Scroller 辅助类

* View.computeScroll 函数: draw 触发该函数,默认为空实现;

* scrollTo()  &&  scrollBy()

### NestedScrolling 特性

eg: Md中的滚动隐藏Toolbar过程

NestedScroll 与普通 ViewGroup 手动分发 TouchEvent 的差异:

传统 View 事件分发机制需要手动控制事件的拦截与分发,比如顶部 Content + 底部 RecyclerView 的组合实现四目前很常见的实现;

如果利用传统自定义 ViewGroup 需要对于 MotionEvent 做出诸多控制,何时拦截,何时自己的事件,何时将事件分发到 Child 处理,但是其主要困难在于按照原本的事件冒泡机制一旦事件被 ParentView 拦截,事件无法继续向下传递,需要自行重新构造事件传递,这是比较麻烦的;而如果利用 CoordinatorLayout 可以非常快捷的实现这一实现,其内部机制就是 NestedScroll 实现;

核心主要有两个接口:

* NestedScrollingParent         
* NestedScrollingChild      

ParentViewGroup 实现 Parent 接口:

* onNestedScrollAccepted

* onNestedPreScroll

* onStartNestedScroll

* onStopNestedScroll : Scroll End - Action_Cancle || Action_Up

* onNestedPreFling : 

* onNestedFling : 捕获内部 View Fling 事件  

* getNestedScrollAxes : 获取滚动类型 - SCROLL_AXIS_HORIZONTAL || SCROLL_AXIS_VERTICAL || SCROLL_AXIS_NONE


与传统通过分发 MotionEvent 事件不同,NestedScrollingChild 在滑动事件发生时,可以将事件传递到 NestedScrollingParentView,ParentView 可以决定是否消耗,消耗多少,子 View最终获取到消耗之后的剩余滚动事件,也就是手指滑动的距离 = Parent 消耗的 dy + Child 滚动的距离;


需要注意的是,在默认情况下 Api21以上 在 ViewParent 中已经添加了 NestedScrollingParent 接口的函数,而 ViewGroup 实现了该接口,同时 View 又添加了 NestedScrollingChild 接口中对应的函数实现,但在 Api 19 中并没有做这类处理,主要由于这一块实现是随着 Material Design 同期引入;而在自行的兼容性测试时需要尤其注意用 api 19的机器测试,防止未考虑到的 Case 引起的崩溃情形;

事实上 SwipeRefreshLayout 可以嵌套 RecyclerView 就是由于二者实现了这一嵌套机制,我们也可以借助二者的实现看看原理:

{% highlight java %}

RecyclerView.onInterceptTouchEvent():
            ...
            case MotionEvent.ACTION_DOWN:
                if (mIgnoreMotionEventTillDown) {
                    mIgnoreMotionEventTillDown = false;
                }
                mScrollPointerId = e.getPointerId(0);
                mInitialTouchX = mLastTouchX = (int) (e.getX() + 0.5f);
                mInitialTouchY = mLastTouchY = (int) (e.getY() + 0.5f);

                if (mScrollState == SCROLL_STATE_SETTLING) {
                    getParent().requestDisallowInterceptTouchEvent(true);
                    setScrollState(SCROLL_STATE_DRAGGING);
                }

                // Clear the nested offsets
                mNestedOffsets[0] = mNestedOffsets[1] = 0;

                int nestedScrollAxis = ViewCompat.SCROLL_AXIS_NONE;
                if (canScrollHorizontally) {
                    nestedScrollAxis |= ViewCompat.SCROLL_AXIS_HORIZONTAL;
                }
                if (canScrollVertically) {
                    nestedScrollAxis |= ViewCompat.SCROLL_AXIS_VERTICAL;
                }
                // **Action 触发**
                startNestedScroll(nestedScrollAxis);
                break;
                ...


RecyclerView.onTouchEvent() :
            ...
            case MotionEvent.ACTION_DOWN: {// 长 Case 语句加大括号是个好习惯
                mScrollPointerId = e.getPointerId(0);
                mInitialTouchX = mLastTouchX = (int) (e.getX() + 0.5f);
                mInitialTouchY = mLastTouchY = (int) (e.getY() + 0.5f);

                int nestedScrollAxis = ViewCompat.SCROLL_AXIS_NONE;
                if (canScrollHorizontally) {
                    nestedScrollAxis |= ViewCompat.SCROLL_AXIS_HORIZONTAL;
                }
                if (canScrollVertically) {
                    nestedScrollAxis |= ViewCompat.SCROLL_AXIS_VERTICAL;
                }
                startNestedScroll(nestedScrollAxis);
            }break;
            case MotionEvent.ACTION_MOVE: {
                final int index = e.findPointerIndex(mScrollPointerId);
                if (index < 0) {
                    Log.e(TAG, "Error processing scroll; pointer index for id "
                            + mScrollPointerId + " not found. Did any MotionEvents get skipped?");
                    return false;
                }

                final int x = (int) (e.getX(index) + 0.5f);
                final int y = (int) (e.getY(index) + 0.5f);
                int dx = mLastTouchX - x;
                int dy = mLastTouchY - y;
                // **Action 触发**
                if (dispatchNestedPreScroll(dx, dy, mScrollConsumed, mScrollOffset)) {
                ...
                if (mScrollState == SCROLL_STATE_DRAGGING) {
                    mLastTouchX = x - mScrollOffset[0];
                    mLastTouchY = y - mScrollOffset[1];
                    // 触发 dispatchNestedScroll
                    if (scrollByInternal(
                ...
            case MotionEvent.ACTION_UP: {
                mVelocityTracker.addMovement(vtev);
                eventAddedToVelocityTracker = true;
                mVelocityTracker.computeCurrentVelocity(1000, mMaxFlingVelocity);
                final float xvel = canScrollHorizontally
                        ? -mVelocityTracker.getXVelocity(mScrollPointerId) : 0;
                final float yvel = canScrollVertically
                        ? -mVelocityTracker.getYVelocity(mScrollPointerId) : 0;
                //fling 事件
                if (!((xvel != 0 || yvel != 0) && fling((int) xvel, (int) yvel))) {
                    setScrollState(SCROLL_STATE_IDLE);
                }
                resetTouch();
            } break;

{% endhighlight %}

整个流程(ChildView 实现NestedScrollingChild接口, ParentView 实现 NestedScrollingParent接口)

* ChildView 在 Action Down事件中触发 startNestedScroll

* 回调触发 ParentView 的 onStartNestedScroll

* Move 时触发 ChildView dispatchNestedPreScroll  

* 回调触发 ParentView 的 onNestedPreScroll   

* View 在滑动时触发 ChildView 的 dispatchNestedScroll

* 进而回调 ParentView 的 onNestedScroll

...(后续的 fling 事件以及 Stop 流程)

事实上整个流程就是 ChildView 在 TouchEvent 事件中的计算以及数据回传,二者组合实现;


[nestedscrolldemo](https://github.com/englipan/PracticeDraw1/tree/master/nestedscrolldemo)


---

Quote:

[Android 嵌套滑动机制（NestedScrolling）](https://segmentfault.com/a/1190000002873657)

[Android NestedScrolling 实战](https://race604.com/android-nested-scrolling/)

[Scroller 原理剖析](http://www.jianshu.com/p/a07856c4d3ce)

[Android Scroller类与computeScroll方法的调用关系](https://my.oschina.net/ososchina/blog/600281)

[如何使用NestedScroll](http://www.jianshu.com/p/4b23e0a5254f)