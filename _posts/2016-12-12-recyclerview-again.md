---
layout: post
title:  再看RecyclerView
category: android
keywords: [improvement,android]
---

RecyclerView洋洋洒洒万余代码，虽然各种使用似乎没什么问题，但总觉得细细思考又觉得哪里不明白，自己也说不出来—— 说不出来就是有盲点，也就是自己还没有掌握其核心，所以最近想着回过头来重新回顾一下其核心知识：

RecyclerView 针对ListView的改进设计：

*  核心功能通用设计     
*  强大的功能扩展与可自定义化程度        
*  更加灵活的Adapter 适配 —— 分离View的创建与数据的绑定 | 具体的Item Change Position<不再One Change，Notify All>   

> A flexible view for providing a limited window into a large data set.

###  RecyclerView核心知识

RecyclerView 主干知识结构图：

{:.center}
![RecyclerView](http://img.javaclee.com/assets/img/20161212/RecyclerView.png)

事实上简单一句话说就是，Adapter将抽象的DataList转换成RecyclerView这一ViewGroup对应需求的的每一个填充了DataList的ItemView，并结合LayoutManager Add到RecyclerView中显示出来；

具体到细节问题就比较丰富了有ChildViewHelper有AdapterHelper辅助，有CachView，有Recycler以及RecyclerPool，LayoutManager的实现，Animator的实现，clickPosition....

需要指出的两点说明：

一者就是有一段时间我自己都混淆的概念问题，这里说的抽象的DataList，是涵盖了Header与Footer等这些可能实际使用中并不在 List<T> 之列的额外数据，这个抽象的DataList的Size由 getItemCount指定，这也就解释了 onBindViewHolder的position的注解为什么是 —— “The position of the item within the adapter's data set.” ，明明 Header的Data position没有在List<T>之中这一疑惑.

二者AdapterPosition 与 LayoutPosition的差异问题，由于Data的变化可以是同步的，在下一次 OnLayout之前可能会造成二者Position不同步的问题，所以AdapterPostion一般能够很好的代表该Position的数据DataItem，而LayoutPosition则更适用于定位该Position相邻位置的View情况。同时我们也应该尽可能避免直接适用onBindViewHolder中的position《该Position在涉及到相关的插入删除但还未刷新时造成Position不同步的问题》而应该使用holder.getAdapterPosition() —— 详情参见 GoogleIO视频(结束前三分钟左右)


###  RecyclerView 源码—— 类ViewGroup

从View的 onMeasure / onLayout / onDraw看RecyclerView：

{% highlight java %}

protected void onMeasure(int widthSpec, int heightSpec) {
    if (mLayout == null) {
        // Used when onMeasure is called before layout manager is set
        defaultOnMeasure(widthSpec, heightSpec);
        return;
    }
    if (mLayout.mAutoMeasure) {
        final int widthMode = MeasureSpec.getMode(widthSpec);
        final int heightMode = MeasureSpec.getMode(heightSpec);
        final boolean skipMeasure = widthMode == MeasureSpec.EXACTLY
                && heightMode == MeasureSpec.EXACTLY;
        mLayout.onMeasure(mRecycler, mState, widthSpec, heightSpec);
        if (skipMeasure || mAdapter == null) {
            return;
        }
        // STEP_START / STEP_LAYOUT / STEP_ANIMATIONS
        if (mState.mLayoutStep == State.STEP_START) {
          // Layout begin !!  save information about current views
          // construct ItemHolderInfo >> use mViewInfoStore store
            dispatchLayoutStep1();
        }
        // set dimensions in 2nd step. Pre-layout should happen with old dimensions for
        // consistency
        mLayout.setMeasureSpecs(widthSpec, heightSpec);
        mState.mIsMeasuring = true;

        //  do the actual layout of the views for the final state.
        //  mLayout.onLayoutChildren(mRecycler, mState); --- implement by LayoutManager
        //  core Step ！！！
        dispatchLayoutStep2();

        // now we can get the width and height from the children.
        mLayout.setMeasuredDimensionFromChildren(widthSpec, heightSpec);

        // if RecyclerView has non-exact width and height and if there is at least one child
        // which also has non-exact width & height, we have to re-measure.
        if (mLayout.shouldMeasureTwice()) {
            mLayout.setMeasureSpecs(
                    MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.EXACTLY),
                    MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.EXACTLY));
            mState.mIsMeasuring = true;
            dispatchLayoutStep2();
            // now we can get the width and height from the children.
            mLayout.setMeasuredDimensionFromChildren(widthSpec, heightSpec);
        }
    } else {......}
}

@Override
protected void onLayout(boolean changed, int l, int t, int r, int b) {
    TraceCompat.beginSection(TRACE_ON_LAYOUT_TAG);
    dispatchLayout();
    TraceCompat.endSection();
    mFirstLayoutComplete = true;
}

void dispatchLayout() {
    if (mAdapter == null) {
        Log.e(TAG, "No adapter attached; skipping layout");
        // leave the state in START
        return;
    }
    if (mLayout == null) {
        Log.e(TAG, "No layout manager attached; skipping layout");
        // leave the state in START
        return;
    }
    mState.mIsMeasuring = false;
    if (mState.mLayoutStep == State.STEP_START) {
        dispatchLayoutStep1();
        mLayout.setExactMeasureSpecsFrom(this);
        dispatchLayoutStep2();
    } else if (mAdapterHelper.hasUpdates() || mLayout.getWidth() != getWidth() ||
            mLayout.getHeight() != getHeight()) {
        // First 2 steps are done in onMeasure but looks like we have to run again due to
        // changed size.
        mLayout.setExactMeasureSpecsFrom(this);
        dispatchLayoutStep2();
    } else {
        // always make sure we sync them (to ensure mode is exact)
        mLayout.setExactMeasureSpecsFrom(this);
    }
    //The final step of the layout where we save the information about views for animations,
    //trigger animations and do any necessary cleanup.
    dispatchLayoutStep3();
}

{% endhighlight %}


RecyclerView 多级缓存逻辑分析：

{% highlight java %}

public View getViewForPosition(int position) {
  return getViewForPosition(position, false);
}

View getViewForPosition(int position, boolean dryRun) {
  if (position < 0 || position >= mState.getItemCount()) {
      throw new IndexOutOfBoundsException("Invalid item position " + position
              + "(" + position + "). Item count:" + mState.getItemCount());
  }
  boolean fromScrap = false;
  ViewHolder holder = null;
  // 0) If there is a changed scrap, try to find from there
  if (mState.isPreLayout()) {
      //  根据position搜索废弃ViewHolder缓存
      //  根据mAdapter.hasStableIds() >> getItemId()  寻找废弃的holder缓存
      holder = getChangedScrapViewForPosition(position);
      fromScrap = holder != null;
  }
  // 1) Find from scrap by position
  if (holder == null) {
      // Returns a scrap view (a ViewHolder that can be re-used) for the position.
      holder = getScrapViewForPosition(position, INVALID_TYPE, dryRun);
      if (holder != null) {
          if (!validateViewHolderForOffsetPosition(holder)) {
              // recycle this scrap
              if (!dryRun) {
                  // we would like to recycle this but need to make sure it is not used by
                  // animation logic etc.
                  holder.addFlags(ViewHolder.FLAG_INVALID);
                  if (holder.isScrap()) {
                      removeDetachedView(holder.itemView, false);
                      holder.unScrap();
                  } else if (holder.wasReturnedFromScrap()) {
                      holder.clearReturnedFromScrapFlag();
                  }
                  recycleViewHolderInternal(holder);
              }
              holder = null;
          } else {
              fromScrap = true;
          }
      }
  }
  if (holder == null) {
      final int offsetPosition = mAdapterHelper.findPositionOffset(position);
      if (offsetPosition < 0 || offsetPosition >= mAdapter.getItemCount()) {
          throw new IndexOutOfBoundsException("Inconsistency detected. Invalid item "
                  + "position " + position + "(offset:" + offsetPosition + ")."
                  + "state:" + mState.getItemCount());
      }

      final int type = mAdapter.getItemViewType(offsetPosition);
      // 2) Find from scrap via stable ids, if exists
      if (mAdapter.hasStableIds()) {
          holder = getScrapViewForId(mAdapter.getItemId(offsetPosition), type, dryRun);
          if (holder != null) {
              // update position
              holder.mPosition = offsetPosition;
              fromScrap = true;
          }
      }
      if (holder == null && mViewCacheExtension != null) {
          // We are NOT sending the offsetPosition because LayoutManager does not
          // know it.
          // RecyclerView提供的可自定义缓存提供策略
          final View view = mViewCacheExtension
                  .getViewForPositionAndType(this, position, type);
          if (view != null) {
              holder = getChildViewHolder(view);
              if (holder == null) {
                  throw new IllegalArgumentException("getViewForPositionAndType returned"
                          + " a view which does not have a ViewHolder");
              } else if (holder.shouldIgnore()) {
                  throw new IllegalArgumentException("getViewForPositionAndType returned"
                          + " a view that is ignored. You must call stopIgnoring before"
                          + " returning this view.");
              }
          }
      }
      if (holder == null) { // fallback to recycler
          // try recycler.
          // Head to the shared pool.
          if (DEBUG) {
              Log.d(TAG, "getViewForPosition(" + position + ") fetching from shared "
                      + "pool");
          }
          // 搜索该ViewType下最后加入pool的holder
          holder = getRecycledViewPool().getRecycledView(type);
          if (holder != null) {
              holder.resetInternal();
              if (FORCE_INVALIDATE_DISPLAY_LIST) {
                  invalidateDisplayListInt(holder);
              }
          }
      }
      if (holder == null) {
          holder = mAdapter.createViewHolder(RecyclerView.this, type);
          if (DEBUG) {
              Log.d(TAG, "getViewForPosition created new ViewHolder");
          }
      }
  }

  ............
  return holder.itemView;
}

///////////////////////////////////////////////////////////////////////////////

ViewHolder getScrapViewForPosition(int position, int type, boolean dryRun) {
            final int scrapCount = mAttachedScrap.size();

            // Try first for an exact, non-invalid match from scrap.
            for (int i = 0; i < scrapCount; i++) {
                final ViewHolder holder = mAttachedScrap.get(i);
                if (!holder.wasReturnedFromScrap() && holder.getLayoutPosition() == position
                        && !holder.isInvalid() && (mState.mInPreLayout || !holder.isRemoved())) {
                    if (type != INVALID_TYPE && holder.getItemViewType() != type) {
                        Log.e(TAG, "Scrap view for position " + position + " isn't dirty but has" +
                                " wrong view type! (found " + holder.getItemViewType() +
                                " but expected " + type + ")");
                        break;
                    }
                    // add ViewHolder TAG
                    holder.addFlags(ViewHolder.FLAG_RETURNED_FROM_SCRAP);
                    return holder;
                }
            }

            if (!dryRun) {
                // 隐藏但未删除的View，detach >> scrap
                View view = mChildHelper.findHiddenNonRemovedView(position, type);
                if (view != null) {
                    // This View is good to be used. We just need to unhide, detach and move to the
                    // scrap list.
                    final ViewHolder vh = getChildViewHolderInt(view);
                    mChildHelper.unhide(view);
                    int layoutIndex = mChildHelper.indexOfChild(view);
                    if (layoutIndex == RecyclerView.NO_POSITION) {
                        throw new IllegalStateException("layout index should not be -1 after "
                                + "unhiding a view:" + vh);
                    }
                    mChildHelper.detachViewFromParent(layoutIndex);
                    scrapView(view);
                    vh.addFlags(ViewHolder.FLAG_RETURNED_FROM_SCRAP
                            | ViewHolder.FLAG_BOUNCED_FROM_HIDDEN_LIST);
                    return vh;
                }
            }

            // Search in our first-level recycled view cache.
            // 一级缓存 —— mCachedViews
            final int cacheSize = mCachedViews.size();
            for (int i = 0; i < cacheSize; i++) {
                final ViewHolder holder = mCachedViews.get(i);
                // invalid view holders may be in cache if adapter has stable ids as they can be
                // retrieved via getScrapViewForId
                if (!holder.isInvalid() && holder.getLayoutPosition() == position) {
                    if (!dryRun) {
                        mCachedViews.remove(i);
                    }
                    if (DEBUG) {
                        Log.d(TAG, "getScrapViewForPosition(" + position + ", " + type +
                                ") found match in cache: " + holder);
                    }
                    return holder;
                }
            }
            return null;
        }


{% endhighlight %}


当理解View的缓存之后就可以理解View被缓存可能造成的一些问题：

* 如View设定属性动画之后，缓存中取出的View属性已经被更改，这时候可以利用重写Adapter中的`onViewDetachedFromWindow`函数重置回收View的属性，在onBindView中的View将恢复初始化属性；


**Recycler 缓存策略**

{% highlight java %}

/**
  * internal implementation checks if view is scrapped or attached and throws an exception
  * if so.
  * Public version un-scraps before calling recycle.
  */
 void recycleViewHolderInternal(ViewHolder holder) {
     if (holder.isScrap() || holder.itemView.getParent() != null) {
         throw new IllegalArgumentException(
                 "Scrapped or attached views may not be recycled. isScrap:"
                         + holder.isScrap() + " isAttached:"
                         + (holder.itemView.getParent() != null));
     }

     if (holder.isTmpDetached()) {
         throw new IllegalArgumentException("Tmp detached view should be removed "
                 + "from RecyclerView before it can be recycled: " + holder);
     }

     if (holder.shouldIgnore()) {
         throw new IllegalArgumentException("Trying to recycle an ignored view holder. You"
                 + " should first call stopIgnoringView(view) before calling recycle.");
     }
     //noinspection unchecked
     final boolean transientStatePreventsRecycling = holder
             .doesTransientStatePreventRecycling();
     final boolean forceRecycle = mAdapter != null
             && transientStatePreventsRecycling
             && mAdapter.onFailedToRecycleView(holder);
     boolean cached = false;
     boolean recycled = false;
     if (DEBUG && mCachedViews.contains(holder)) {
         throw new IllegalArgumentException("cached view received recycle internal? " +
                 holder);
     }

     // 状态校验完毕，添加到缓存中—— mCachedViews / RecycledViewPool
     if (forceRecycle || holder.isRecyclable()) {
         if (!holder.hasAnyOfTheFlags(ViewHolder.FLAG_INVALID | ViewHolder.FLAG_REMOVED
                 | ViewHolder.FLAG_UPDATE)) {
             // Retire oldest cached view

             // 校验mCachedViews 状态，如果无法存入则丢弃最早的缓存后存入 —— 一个先进先出的队列结构
             int cachedViewSize = mCachedViews.size();
             if (cachedViewSize >= mViewCacheMax && cachedViewSize > 0) {
                 recycleCachedViewAt(0);
                 cachedViewSize --;
             }
             if (cachedViewSize < mViewCacheMax) {
                 mCachedViews.add(holder);
                 cached = true;
             }
         }
         // Holder 状态不匹配，不适合存入mCachedViews中，存入RecycledViewPool
         // 需要注意的是，RecycledViewPool可以设置多RecyclerView共享，减少内存开销
         // 如多Tab应用中的RecyclerView的Poll共享
         if (!cached) {
             addViewHolderToRecycledViewPool(holder);
             recycled = true;
         }
     } else if (DEBUG) {
         Log.d(TAG, "trying to recycle a non-recycleable holder. Hopefully, it will "
                 + "re-visit here. We are still removing it from animation lists");
     }
     // even if the holder is not removed, we still call this method so that it is removed
     // from view holder lists.
     mViewInfoStore.removeViewHolder(holder);
     if (!cached && !recycled && transientStatePreventsRecycling) {
         holder.mOwnerRecyclerView = null;
     }
 }

{% endhighlight %}

####  附图(FromGoogleIO-RecyclerView)：





---

Quote:

[RecyclerView源码分析(一)](http://www.jianshu.com/p/9ddfdffee5d3)

[深入浅出 RecyclerView](http://www.kymjs.com/code/2016/07/10/01)

[Android ListView与RecyclerView对比浅析--缓存机制](http://dev.qq.com/topic/5811d3e3ab10c62013697408)

[RecyclerView源码分析
](http://blog.saymagic.tech/2016/10/21/understand-recycler.html)

[RecyclerView ins and outs - Google I/O 2016](https://www.youtube.com/watch?v=LqBlYJTfLP4)
