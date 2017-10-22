---
layout: post
title:  ItemDecoration 相关小实践
category: android
keywords: [improvement,android]
---

利用 ItemDecoration 实现悬浮置顶效果的一些小实践,也有一些要注意的api函数:

如何绘制 View 的一部分?

利用 api: itemStickyView.getDrawingCache()

而一些情况下获取到的 bitmap 为 null, 则需要对于 View 进行 Measure 以及 layout 如:

{% highlight java %}

            itemStickyView.setDrawingCacheEnabled(true);
            itemStickyView.measure(View.MeasureSpec.makeMeasureSpec(widthRvShow, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(mStickyHeight, View.MeasureSpec.EXACTLY));//使用UNSPECIFIED导致丢失LayoutParameter参数
            final int currentEndPosition = topOffset + Math.max(itemView.getTop(), mStickyHeight);
            final int currentTopStartPosition = currentEndPosition - mStickyHeight;// 最小是首个 item 的起始位置 0
            itemStickyView.layout(leftOffset, currentTopStartPosition, rightOffset, currentEndPosition);
            itemStickyView.buildDrawingCache();

{% endhighlight %}

通过 measure layout buildDrawingCache 之后 利用 canvas.drawBitmap 函数可以将 bitmap 绘制到自定义位置;  

而对于 canvas.drawBitmap 事实上有多重重载函数:  

通常我们用到以下几个:  

{% highlight java %}

void drawBitmap (Bitmap bitmap, 
                Matrix matrix, 
                Paint paint)

void drawBitmap (Bitmap bitmap, 
                Rect src, 
                Rect dst, 
                Paint paint)

void drawBitmap (Bitmap bitmap, 
                float left, 
                float top, 
                Paint paint)

{% endhighlight %}

对于第三个比较简单,在相对于 parenview 位置的 left 以及 top 利用对应的 paint绘制源的 bitmap,事实上就是定义了一个起始位置点将bitmap 无变换的绘制到指定位置;  

而对于第一个则包含了对应的矩阵变换操作,对于第二个的 src 矩形以及 det 的矩形有必要说明一下: 

src 类似于截取操作,是从源 bitmap 的利用对应的 src 这个矩形取出对应的bitmap 块,进而将这源区块绘制到对应的 dst 目标区域,需要注意的是,目标区域是带有坐标位置的,可以通过坐标位置的控制绘制到自定义的位置,而目标矩形的大小又决定了截取的源区块是否会被拉伸,压缩等等操作,这是需要注意的地方;

在以上 api 函数都清除之后事实上,整个绘制悬浮置顶效果是比较简单的,抓住 ItemDecoration 的几个 api 函数就可以操作: 

getItemOffsets : 定义 itemView 外部包裹范围大小

onDrawOver: api 在 recyclerView draw 完毕之后进行绘制

onDraw :  研究 RecyclerView 源码发现,其调用在 recylclerview 绘制 itemView 之前,属于绘制 itemView 的 backgroud 流程(RecyclerView.onDraw 中调用了ItemDecoration.onDraw,而 RecyclerView 的 onDraw 由 RecyclerView.draw()触发,通过其源码可以看到是先进行 RecyclerView 的 onDraw 再进行 dispatchDraw 绘制 Chilcdren )


先来看看核心源码: 

{% highlight java %}
    @Override
    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
        super.getItemOffsets(outRect, view, parent, state);
        final int position = parent.getChildAdapterPosition(view);
        // 根据当前 item 位置判断是否需要添加 top offset 偏移 && 当前 item 是新的 group 开始
        if (isNeedTopOffset(position)) {
            outRect.top = mStickyHeight;
        }
    }

        @Override
    public void onDrawOver(Canvas canvas, RecyclerView parent, RecyclerView.State state) {
        super.onDrawOver(canvas, parent, state);
        int firstVisiblePos = -1;
        final RecyclerView.LayoutManager manager = parent.getLayoutManager();
        if (manager instanceof LinearLayoutManager) {
            firstVisiblePos = ((LinearLayoutManager) manager).findFirstVisibleItemPosition();
        }
        final int itemCount = manager.getItemCount();//adapter itemCount
        final int childCount = manager.getChildCount();//Number of attached children
        final int leftOffset = parent.getLeft() + parent.getPaddingLeft();//left stickyView start point
        final int rightOffset = parent.getRight() - parent.getPaddingRight(); //stickyView end point
        final int widthRvShow = parent.getWidth() - parent.getPaddingLeft() - parent.getPaddingRight();
        final int topOffset = parent.getPaddingTop();
        for (int i = 0; i < childCount; i++) {
            final View itemView = parent.getChildAt(i);//注意 outRect.top 为 margin 增加进入了 view.getTop 中
            final int adapterPosition = parent.getChildAdapterPosition(itemView);
            final View itemStickyView = getStickyViewByPosition(mLayoutInflater, firstVisiblePos, adapterPosition, parent);

            if (itemStickyView == null) continue;

            itemStickyView.setDrawingCacheEnabled(true);
            itemStickyView.measure(View.MeasureSpec.makeMeasureSpec(widthRvShow, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(mStickyHeight, View.MeasureSpec.EXACTLY));//使用UNSPECIFIED导致丢失LayoutParameter参数
            final int currentEndPosition = topOffset + Math.max(itemView.getTop(), mStickyHeight);
            final int currentTopStartPosition = currentEndPosition - mStickyHeight;// 最小是首个 item 的起始位置 0
            itemStickyView.layout(leftOffset, currentTopStartPosition, rightOffset, currentEndPosition);
            itemStickyView.buildDrawingCache();
            Bitmap b = itemStickyView.getDrawingCache();

            if (isNeedDynamicRect(firstVisiblePos, adapterPosition)) {
                canvas.drawBitmap(b, getSourceRectByPos(itemView, b), getDscRectByPos(currentTopStartPosition, itemView, b), null);
            } else {
                canvas.drawBitmap(b, leftOffset, currentTopStartPosition, null);
            }

            itemStickyView.setDrawingCacheEnabled(false);
        }
    }


{% endhighlight %}

事实上以上就是核心代码了,但是对于一些特殊效果,主要是值得临界边界处还是有一些细节需要注意,不过只要对于以上介绍的 api 熟悉之后还是比较好操作的: 

`getStickyViewByPosition(mLayoutInflater, firstVisiblePos, adapterPosition, parent)` : 用于控制返回对应的索引条,有两个种位置需要有,一是悬浮置顶的,二是非悬浮,但是是组中首个 item, 被设置过 top 偏移量的;

在最初的时候考虑不周全导致,悬浮置顶的 view 在第一个 view 被滚动消失后悬浮 view 同步消失,这是由于从第二个 item 起,没有对应的 top 偏移,而计算失误,没有返回对应的 view;

而另一个的临界问题就是一个悬浮 item 被下一个悬浮 item 顶掉的效果,事实上也就是算法中的临界值问题,只要你用好 canvas.drawBitmap 因为滚动消失的 item 与 悬浮 item 是同步的,只要计算好临界的目标绘制位置其实也是很清晰的逻辑;  

完整代码:  

{% highlight java %}


/**
 * <p>
 * 利用 offset 在对应组位置设置位置偏移
 * 在 drawOver 在对应位置设置对应的 View 信息
 */

public class StickyItemDecoration extends RecyclerView.ItemDecoration {

    private int mStickyHeight = 0;

    private LayoutInflater mLayoutInflater;
    private List<ConfigInfoModel> mDataList;

    public StickyItemDecoration(Context context, List<ConfigInfoModel> modelList) {
        init(context, modelList);
    }

    private void init(Context context, List<ConfigInfoModel> modelList) {
        mStickyHeight = context.getResources().getDimensionPixelSize(R.dimen.carlib_sticky_config_height);
        mLayoutInflater = LayoutInflater.from(context);
        mDataList = modelList;
    }

    @Override
    public void getItemOffsets(Rect outRect, View view, RecyclerView parent, RecyclerView.State state) {
        super.getItemOffsets(outRect, view, parent, state);
        final int position = parent.getChildAdapterPosition(view);
        // 根据当前 item 位置判断是否需要添加 top offset 偏移 && 当前 item 是新的 group 开始
        if (isNeedTopOffset(position)) {
            outRect.top = mStickyHeight;
        }
    }

    /**
     * 根据对应位置判断是否需要添加偏移量
     *
     * @param position
     * @return
     */
    private boolean isNeedTopOffset(int position) {
        return mDataList.get(position).groupId >= 0;
    }


    @Override
    public void onDrawOver(Canvas canvas, RecyclerView parent, RecyclerView.State state) {
        super.onDrawOver(canvas, parent, state);
        int firstVisiblePos = -1;
        final RecyclerView.LayoutManager manager = parent.getLayoutManager();
        if (manager instanceof LinearLayoutManager) {
            firstVisiblePos = ((LinearLayoutManager) manager).findFirstVisibleItemPosition();
        }
        final int itemCount = manager.getItemCount();//adapter itemCount
        final int childCount = manager.getChildCount();//Number of attached children
        final int leftOffset = parent.getLeft() + parent.getPaddingLeft();//left stickyView start point
        final int rightOffset = parent.getRight() - parent.getPaddingRight(); //stickyView end point
        final int widthRvShow = parent.getWidth() - parent.getPaddingLeft() - parent.getPaddingRight();
        final int topOffset = parent.getPaddingTop();
        for (int i = 0; i < childCount; i++) {
            final View itemView = parent.getChildAt(i);//注意 outRect.top 为 margin 增加进入了 view.getTop 中
            final int adapterPosition = parent.getChildAdapterPosition(itemView);
            final View itemStickyView = getStickyViewByPosition(mLayoutInflater, firstVisiblePos, adapterPosition, parent);

            if (itemStickyView == null) continue;

            itemStickyView.setDrawingCacheEnabled(true);
            itemStickyView.measure(View.MeasureSpec.makeMeasureSpec(widthRvShow, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(mStickyHeight, View.MeasureSpec.EXACTLY));//使用UNSPECIFIED导致丢失LayoutParameter参数
            final int currentEndPosition = topOffset + Math.max(itemView.getTop(), mStickyHeight);
            final int currentTopStartPosition = currentEndPosition - mStickyHeight;// 最小是首个 item 的起始位置 0
            itemStickyView.layout(leftOffset, currentTopStartPosition, rightOffset, currentEndPosition);
            itemStickyView.buildDrawingCache();
            Bitmap b = itemStickyView.getDrawingCache();

            if (isNeedDynamicRect(firstVisiblePos, adapterPosition)) {
                canvas.drawBitmap(b, getSourceRectByPos(itemView, b), getDscRectByPos(currentTopStartPosition, itemView, b), null);
            } else {
                canvas.drawBitmap(b, leftOffset, currentTopStartPosition, null);
            }

            itemStickyView.setDrawingCacheEnabled(false);
        }
    }

    /**
     * 绘制的 bitmap 目标区域
     *
     * @param itemView
     * @param b
     * @return
     */
    private Rect getSourceRectByPos(View itemView, Bitmap b) {
        final int bottom = itemView.getBottom();
        final int left = itemView.getLeft();
        final int right = itemView.getRight();
        final int bitmapHeight = b.getHeight();
        return new Rect(left, bitmapHeight - Math.min(bottom, bitmapHeight), right, bitmapHeight);
    }

    private boolean isNeedDynamicRect(int firstVisiblePos, int adapterPosition) {
        return firstVisiblePos == adapterPosition && mDataList.get(adapterPosition + 1).groupId > 0;
    }

    private Rect getDscRectByPos(int currentTopStartPosition, View itemView, Bitmap b) {
        final int top = itemView.getTop();
        final int bottom = itemView.getBottom();
        final int left = itemView.getLeft();
        final int right = itemView.getRight();
        return new Rect(left, currentTopStartPosition, right, Math.min(bottom, mStickyHeight));
    }


    private WeakHashMap<Integer, View> mPositionViewCaches = new WeakHashMap<>();

    private View getStickyViewByPosition(LayoutInflater layoutInflater, final int firstVisiblePos, int position, RecyclerView parent) {
        ConfigInfoModel model = mDataList.get(position);
        View view = null;
        if (model.groupId >= 0) {
            view = mPositionViewCaches.get(position);
            if (view == null) {
                view = layoutInflater.inflate(R.layout.carlib_item_sticky_item_view, parent, false);
                mPositionViewCaches.put(position, view);
            }
            view.setTag(null);
            ((TextView) view.findViewById(R.id.tv_sticky_config_content)).setText(String.valueOf(model.groupId));
        }
        if (view == null && firstVisiblePos == position) { //当前 Group 内的第一个 view 添加 Header
            int currentItemGroupView = firstVisiblePos;
            while (view == null && currentItemGroupView >= 0) {
                view = mPositionViewCaches.get(currentItemGroupView);
                currentItemGroupView--;
            }
        }
        return view;
    }
    
}

{% endhighlight %}