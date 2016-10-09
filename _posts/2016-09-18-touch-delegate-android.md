---
layout: post
title:  TouchDelegate
category: android
keywords: [improvement]
---

TouchDelegate：

> Helper class to handle situations where you want a view to have a larger touch area than its actual view bounds. The view whose touch area is changed is called the delegate view. This class should be used by an ancestor of the delegate. To use a TouchDelegate, first create an instance that specifies the bounds that should be mapped to the delegate and the delegate view itself.


{% highlight java %}

///////////////////////////////////////////////////////////////
//TouchDelegate 位于所代理的View的父View级别，由该父View开始分发处理，这里需要注意
//View Touch 事件处理
public boolean onTouchEvent(MotionEvent event) {
        final float x = event.getX();
        final float y = event.getY();
        final int viewFlags = mViewFlags;
        final int action = event.getAction();

        ......

        if (mTouchDelegate != null) {
            if (mTouchDelegate.onTouchEvent(event)) {
                return true;
            }
        }


////////////////////////////////////////////////////////////////////
// TouchDelegate 处理事件，先判断事件的触发位置是否在TouchDelegate所在的区域内，若在，则奖事件交由所代理的View处理该事件

        /**
             * Will forward touch events to the delegate view if the event is within the bounds
             * specified in the constructor.
             *
             * @param event The touch event to forward
             * @return True if the event was forwarded to the delegate, false otherwise.
             */
            public boolean onTouchEvent(MotionEvent event) {
                int x = (int)event.getX();
                int y = (int)event.getY();
                boolean sendToDelegate = false;
                boolean hit = true;
                boolean handled = false;

                switch (event.getAction()) {
                case MotionEvent.ACTION_DOWN:
                    Rect bounds = mBounds;

                    if (bounds.contains(x, y)) {
                        mDelegateTargeted = true;
                        sendToDelegate = true;
                    }
                    break;
                case MotionEvent.ACTION_UP:
                case MotionEvent.ACTION_MOVE:
                    sendToDelegate = mDelegateTargeted;
                    if (sendToDelegate) {
                        Rect slopBounds = mSlopBounds;
                        if (!slopBounds.contains(x, y)) {
                            hit = false;
                        }
                    }
                    break;
                case MotionEvent.ACTION_CANCEL:
                    sendToDelegate = mDelegateTargeted;
                    mDelegateTargeted = false;
                    break;
                }
                if (sendToDelegate) {
                    final View delegateView = mDelegateView;

                    if (hit) {
                        // Offset event coordinates to be inside the target view
                        event.setLocation(delegateView.getWidth() / 2, delegateView.getHeight() / 2);
                    } else {
                        // Offset event coordinates to be outside the target view (in case it does
                        // something like tracking pressed state)
                        int slop = mSlop;
                        event.setLocation(-(slop * 2), -(slop * 2));
                    }
                    handled = delegateView.dispatchTouchEvent(event);
                }
                return handled;
            }

{% endhighlight %}

TouchDelegate 常用于 ListView某个Item中的子View的Touch事件的触发，比如某个Item右侧的红心关心Item的点击，为了视觉效果Item可能设置得不够大，但是这时候依旧要考虑用户体验，便于用户点击，此时 TouchDelegate 就非常有用；

总而言之其原理是：            
当父容器获得一个 event 的时候，会优先判断这个touchevent 是否落在TouchDelegate所负责响应的区域内，如果在此区域内，TouchDelegate会把touchevent传递给被代理的 View处理 。这样被代理的 View 的触摸区域就会大于它的显示区域。

eg:

{% highlight java %}

@Override
   protected void onCreate(Bundle savedInstanceState) {
       super.onCreate(savedInstanceState);
       setContentView(R.layout.activity_main);
       tvHello = (TextView) findViewById(R.id.tv_hello);
       tvHello.setOnClickListener(new View.OnClickListener() {
           @Override
           public void onClick(View view) {
               Toast.makeText(MainActivity.this, "Click", Toast.LENGTH_SHORT).show();
           }
       });
       tvHello.post(new Runnable() {
           @Override
           public void run() {
               Rect rect = new Rect();
               tvHello.getHitRect(rect);
               rect.right += 400;
               rect.bottom += 400;
               setViewTouchDelegate(tvHello,rect);
           }
       });
   }

   private void setViewTouchDelegate(View vDelegate, Rect delegateBounds) {
       if (vDelegate == null) return;

       View parent = (View) vDelegate.getParent();

       if (parent == null) return;

       if (delegateBounds != null) {
           parent.setTouchDelegate(new TouchDelegate(delegateBounds, vDelegate));
       } else {
           parent.setTouchDelegate(null);
       }
   }

{% endhighlight %}



---

[Android – Using TouchDelegates](http://blog.vogella.com/2012/04/15/android-using-touchdelegates/)
