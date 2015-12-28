---
layout: post
title: Android 流式布局
category: android
---


Android 流式布局，其实没有自己的什么新鲜东西，不过是对照着鸿洋的Demo自己写了一遍，加入了自己的一些注释理解，写完之后回过头再看，确实很多细节在里面，自定义View和viewGroup没什么讨巧的地方，需要多练习；

{% highlight java %}

/**
 * Android 自定义(ViewGroup)流式布局
 *   适用于 标签展示
 *
 * ViewGroup核心函数 ：
 * onMeasure():根据子ChildrenView布局文件，为子View设定测量模式以及测量值
 *              EXACTLY:  确定 dp 值以及 MatchParent
 *              AT_MOST:   wrap_content
 *              UNSPCIFIED: 子View 自行需要多大给多大
 * onLayout()：
 * 针对 childView.getLayoutParams();
 * childView 其ParentView LayoutParams 是何种类型，
 * 其childView获取的 LayoutParams 就是何种类型，不指定则为ViewGroup.LayoutParams
 *
 */
public class FlowLayout extends ViewGroup {

    /**
     * 支持布局文件 xml 中定义的属性，但没有自定义属性时调用
     * @param context
     * @param attrs
     */
    public FlowLayout(Context context,AttributeSet attrs){
        super(context, attrs);
    }

    /**
     * 仅支持 动态 New 实例
     * @param context
     */
    public FlowLayout(Context context){
        this(context, null);
    }

    /**
     *每个ArrayList<Integer> 存放该行所有View
     */
    private ArrayList<ArrayList<View>>  mAllLineViews = new ArrayList<>();

    /**
     * 每一行的高度
     */
    private ArrayList<Integer>  mLineHeight = new ArrayList<>();


    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        mAllLineViews.clear();
        mLineHeight.clear();

        ArrayList<View> lineViews = new ArrayList<>();

        //ViewGroup 宽度 onMeasure()中设定的值
        int width = getWidth();
        int lineHeight = 0,lineWidth = 0;
        int childCount = getChildCount();
        for (int i = 0;i<childCount;i++){
            View childView = getChildAt(i);
            MarginLayoutParams params = (MarginLayoutParams) childView.getLayoutParams();

            int childWidth = childView.getMeasuredWidth();
            int childHeight = childView.getMeasuredHeight();

            if (childWidth + lineWidth + params.leftMargin + params.rightMargin > width - getPaddingLeft() - getPaddingRight()){
                //记录 当前行高
                mLineHeight.add(lineHeight);
                //记录当前行需要绘制的所有子View
                mAllLineViews.add(lineViews);

                lineWidth = 0;
                lineHeight = childHeight + params.topMargin + params.bottomMargin;

                lineViews = new ArrayList<>();
            }
            //此处 不能用 else 包裹--换行状态重置之后--新行的View需要添加
            lineWidth += childWidth + params.leftMargin + params.rightMargin;
            lineHeight = Math.max(lineHeight, childHeight + params.topMargin + params.bottomMargin);
            lineViews.add(childView);

        }// for end
        //最后行的特殊处理
        mLineHeight.add(lineHeight);
        mAllLineViews.add(lineViews);

        /**
         * 布局  处理子View 绘制Position
         */
        int lineLeft = getPaddingLeft(),topTotal = getPaddingTop();
        int lineCount = mAllLineViews.size();

        for (int i = 0;i<lineCount;i++){
            lineViews = mAllLineViews.get(i);
            lineHeight = mLineHeight.get(i);
            int length = lineViews.size();
            for (int j= 0;j < length;j++){
                View child = lineViews.get(j);
                if (child.getVisibility() == GONE){
                    continue;
                }
                MarginLayoutParams params = (MarginLayoutParams) child.getLayoutParams();
                int leftChild = lineLeft + params.leftMargin;
                int topChild = topTotal + params.topMargin;
                int rightChild = leftChild + child.getMeasuredWidth();
                int bottomChild = topChild + child.getMeasuredHeight();
                //设定 ChildView 布局位置
                child.layout(leftChild,topChild,rightChild,bottomChild);

                //每行中 ChildView 左边需要累加
                lineLeft += child.getMeasuredWidth() + params.leftMargin + params.rightMargin;
            }
            //一行布局结束 状态置位
            lineLeft = getPaddingLeft();
            topTotal += lineHeight;
        }
    }


    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);//测量宽度
        int widthShowMode = MeasureSpec.getMode(widthMeasureSpec);//测量模式：UNSPECIFIED, AT_MOST or EXACTLY
        int hightSize = MeasureSpec.getSize(heightMeasureSpec);
        int hightShowMode = MeasureSpec.getMode(heightMeasureSpec);


        //针对 wrap_content 处理，得到其显示宽高
        //其宽度为所有显示行的最长宽
        //无法自行得知内部元素状态
        int sizeWrapWidth = 0 ,sizeWrapHeight = 0;

        //记录行宽高
        int lineWidth = 0,lineHeight = 0;

        //迭代计算内部所有元素的宽高值
        int childCount = getChildCount();
        for (int i =0;i<childCount;i++){
            View childView = getChildAt(i);
            //测量该 childView 的宽高
            measureChild(childView,widthMeasureSpec,heightMeasureSpec);
            //该LayoutParams 类型 已经在generateLayoutParams();指定
            MarginLayoutParams params = (MarginLayoutParams) childView.getLayoutParams();
            int childWidth = childView.getMeasuredWidth() + params.leftMargin + params.rightMargin;
            int childHeight = childView.getMeasuredHeight() + params.topMargin + params.bottomMargin;

            if ((lineWidth + childWidth) >widthSize - getPaddingLeft() - getPaddingRight()){//已有行宽 + 该子View宽度大于屏幕宽度，则换行
                //取对比之后的宽度最大值
                sizeWrapWidth = Math.max(lineWidth,sizeWrapWidth);
                //重置 行宽
                lineWidth = childWidth;
                //行高 增加
                sizeWrapHeight += lineHeight;
                lineHeight = childHeight;
            }else {
                lineWidth += childWidth;//叠加行宽
                lineHeight = Math.max(lineHeight,childHeight);
            }
            if (i == (childCount - 1)){//特殊处理 the LastOne，无论最后元素另起一行亦或在原行 else分支遗留处理
                sizeWrapWidth = Math.max(lineWidth,sizeWrapWidth);
                sizeWrapHeight += lineHeight;
            }
        }
        Log.d("TAG","sizeWrapWidth =" + sizeWrapWidth);
        Log.d("TAG","sizeWrapHight = " + sizeWrapHeight);
        setMeasuredDimension(widthShowMode == MeasureSpec.EXACTLY ? widthSize : sizeWrapWidth + getPaddingLeft() + getPaddingRight(),
                hightShowMode == MeasureSpec.EXACTLY ? hightSize : sizeWrapHeight + getPaddingTop() + getPaddingBottom());
    }


    /**
     * 生成当前ViewGroup 对应匹配的的LayoutParams
     * @param attrs
     * @return
     */
    @Override
    public LayoutParams generateLayoutParams(AttributeSet attrs) {
        return new MarginLayoutParams(getContext(),attrs);
    }
}

{% endhighlight %}




---

Quote：

鸿洋的视频Demo练习

[打造Android中的流式布局和热门标签](http://www.imooc.com/learn/237)

[hongyangAndroid_FlowLayout](https://github.com/hongyangAndroid/FlowLayout)

[ViewGroup](http://developer.android.com/reference/android/view/ViewGroup.html)