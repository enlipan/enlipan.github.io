---
layout: post
title: Android CustomView 卫星菜单
category: android
keywords: [android, viewgoup,animation]
---

自定义View写过一些，但是自定义ViewGroup一直写的不多，上次还是写流式布局，一直想着写一个自定义ViewGroup 来总结一下自定义ViewGroup相关的，恰恰看到Mooc上的hyman老师的分享，想着自己先写一下，遇到问题再看看视频，看完再复盘回顾，自己总结一下，于是有了这一篇文章，写的过程中还是遇到一些细节性问题的，非常感谢hyman老师的讲解；

###  自定义View的相关内容

View的自定义之所以复杂是由于其涉及的知识点较多，但是只要掌握庖丁解牛之法，逐一分割还是有应答之法的：

*  View的自定义首先应该仔细分析View的状态，View的绘制分为两部分，View的绘制显示以及View的动作Action监听，分析后确定正确的思路，要 知道图形的绘制方法万千，挑选一项合适的；        
*  根据所拆分的View绘制情况，定义好 所需要的 View属性，确定哪些属性是需要自定义的，进而编写 attrs.xml 自定义属性                         
*  属性确定后，考虑如何在初始化之时针对各类情况获取所定义的各项 View 的属性的值，同时校验检查属性值获取正确与否                
*  开始View的绘制相关的操作定义，明确View的绘制核心是 View位置的确定，以及View 内容的绘制，位置的确定 针对ViewGroup 应该聚焦于 利用 onMeasure 以及 onLayout 函数自定义子view的测量与自定义布局，而针对View则主要是利用 onMeasure 确定View本身的位置                        
*  在View的内容绘制阶段，一般也针对ViewGroup 与 View分开考虑，ViewGroup 一般在 确定好子View的位置状态后，将View的绘制 交给各个子View自身绘制，这一点并不复杂，而View的绘制则一般需要重写 onDraw 函数，利用 画板进行内容的组合与绘制处理                                      
*  至此，View的显示一般告一段落，随后进行 View行为的确定，自定义View行为 需要清晰的知晓 View的事件分发流程与机制，具体是指知道 View的事件拦截，View的事件分发与处理机制，View的滑动处理等等           
*  View 的绘制与行为都确定后，自定义 View的血肉与枝干都填充完毕                            

除以上内容自定义View的内容还涵盖， 诸如：Canvas，Animation，Animator等等一些列内容，以及一些数学知识，所以自定义View是复杂的，是需要练习的，状态要一步步分割，东西要一点点完成，按照流程练习，复盘回顾总结，还是有套路可以寻找的；

###  自定义卫星菜单 View的实践

以下进行 卫星菜单的自定义实现：

*  分析View属性，确定自定义属性

{% highlight java %}

<attr name="position" format="enum">
    <enum name="left_top" value="0"/>
    <enum name="left_bottom" value="1"/>
    <enum name="right_top" value="2"/>
    <enum name="right_bottom" value="3"/>
</attr>
<attr name="radius" format="dimension"/>

<!-- 此处 注意 写成  <attr name="radius" format="dimension"/> 将变成重复声明，而非仅仅引用 -->
<declare-styleable name="SatelliteViewGroup">
    <attr name="position"/>
    <attr name="radius"/>
</declare-styleable>

{% endhighlight %}  

一个小的 case 是在 `declare-styleable`中既可以完成声明，也可以在外部声明，此处仅仅引用；

*  View 位置确定分析 实现 onMeasure onLayout；

![SatelliteViewGroup](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20150430/item_view_satellite.jpg)

一个需要注意的Case 是要针对每一个View的绘制的 Left&&Top点进行计算；

旁白：话说，我司 Cam Scanner(扫描全能王)我还是比较喜欢用的，使用场景比较符合文字录入之类的，切边增强文字OCR识别；

*  实现 View的 Action

{% highlight java %}

public class SatelliteViewGroup extends ViewGroup implements View.OnClickListener {
    private static final String TAG = "SatelliteViewGroup";

    //ViewGroup  State Type
    private static final int S_VIEW_STATE_OPEN = -1;
    private static final int S_VIEW_STATE_CLOSE = 1;
    private int mCurrentViewState = S_VIEW_STATE_CLOSE;

    //ViewGroup Position
    private static final int S_VIEW_POSITION_LEFT_TOP = 0;
    private static final int S_VIEW_POSITION_LEFT_BOTTOM = 1;
    private static final int S_VIEW_POSITION_RIGHT_TOP = 2;
    private static final int S_VIEW_POSITION_RIGHT_BOTTOM = 3;

    private final int F_DefaultRadiusValue = 100;
    private final int F_DefaultPosition = 0;

    private View mCenterView = null;
    private int mMoonRadius;
    private int mCenterPosition;

    private int mViewGroupTotalHeight;
    private int mViewGroupTotalWidth;

    private OnMoonMenuClickListener mMenuClickListener;

    private void setMoonMenuClickListener(OnMoonMenuClickListener listener) {
        mMenuClickListener = listener;
    }

    public interface OnMoonMenuClickListener {
        void onMenuClick(View v);
    }


    public SatelliteViewGroup(Context context) {
        this(context, null);
    }

    public SatelliteViewGroup(Context context, AttributeSet attrs) {
        this(context, attrs, 0);
    }

    public SatelliteViewGroup(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        //Radius default Value  50dp
        float defaultRadiusValue = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, F_DefaultRadiusValue, context.getResources().getDisplayMetrics());
        TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.SatelliteViewGroup, defStyleAttr, 0);
        mMoonRadius = (int) ta.getDimension(R.styleable.SatelliteViewGroup_radius, defaultRadiusValue);
        final int position = ta.getInt(R.styleable.SatelliteViewGroup_position, F_DefaultPosition);
        ta.recycle();
        if (position == S_VIEW_POSITION_LEFT_TOP) {
            mCenterPosition = S_VIEW_POSITION_LEFT_TOP;
        } else if (position == S_VIEW_POSITION_LEFT_BOTTOM) {
            mCenterPosition = S_VIEW_POSITION_LEFT_BOTTOM;
        } else if (position == S_VIEW_POSITION_RIGHT_TOP) {
            mCenterPosition = S_VIEW_POSITION_RIGHT_TOP;
        } else if (position == S_VIEW_POSITION_RIGHT_BOTTOM) {
            mCenterPosition = S_VIEW_POSITION_RIGHT_BOTTOM;
        }
        Log.d(TAG, "position >>> " + position + "   mNoonRadius>> " + mMoonRadius);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        final int childCount = getChildCount();
        for (int i = 0; i < childCount; i++) {
            if (i == 0) mCenterView = getChildAt(i);
            measureChild(getChildAt(i), widthMeasureSpec, heightMeasureSpec);
        }
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        mViewGroupTotalHeight = getMeasuredHeight();
        mViewGroupTotalWidth = getMeasuredWidth();
        mCenterView.setOnClickListener(this);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        if (changed) {
            layoutCenterBtnViewPosition();
            layoutItemViewPosition();
        }
    }


    private void layoutCenterBtnViewPosition() {
        if (mCenterView == null) return;
        int left = 0;
        int top = 0;

        int width = mCenterView.getMeasuredWidth();
        int height = mCenterView.getMeasuredHeight();
        if (mCenterPosition == S_VIEW_POSITION_LEFT_TOP) {
            //default  0
        } else if (mCenterPosition == S_VIEW_POSITION_LEFT_BOTTOM) {
            left = 0;
            top = mViewGroupTotalHeight - height;
        } else if (mCenterPosition == S_VIEW_POSITION_RIGHT_TOP) {
            left = mViewGroupTotalWidth - width;
            top = 0;
        } else if (mCenterPosition == S_VIEW_POSITION_RIGHT_BOTTOM) {
            left = mViewGroupTotalWidth - width;
            top = mViewGroupTotalHeight - height;
        }
        mCenterView.layout(left, top, left + width, top + height);
    }


    private void layoutItemViewPosition() {
        final int itemCount = getChildCount();
        final double singleAngle = Math.PI / (2 * (itemCount - 2));
        for (int i = 1; i < itemCount; i++) {//centerView  index 0

            final View childView = getChildAt(i);
            final int height = childView.getMeasuredHeight();
            final int width = childView.getMeasuredWidth();
            childView.setVisibility(GONE);
            /**
             * ps: notice  this >>>>
             * (int)(Math.cos(singleAngle * (i - 1)) * mMoonRadius);
             * (int)Math.cos(singleAngle * (i - 1) * mMoonRadius;
             */
            int left = (int) (Math.cos(singleAngle * (i - 1)) * mMoonRadius);
            int top = (int) (Math.sin(singleAngle * (i - 1)) * mMoonRadius);
            if (mCenterPosition == S_VIEW_POSITION_LEFT_TOP) {
                //default
            } else if (mCenterPosition == S_VIEW_POSITION_LEFT_BOTTOM) {
                top = mViewGroupTotalHeight - height - top;
            } else if (mCenterPosition == S_VIEW_POSITION_RIGHT_TOP) {
                left = mViewGroupTotalWidth - width - left;
            } else if (mCenterPosition == S_VIEW_POSITION_RIGHT_BOTTOM) {
                left = mViewGroupTotalWidth - width - left;
                top = mViewGroupTotalHeight - height - top;
            }
            childView.layout(left, top, left + childView.getMeasuredWidth(), top + childView.getMeasuredHeight());
        }
    }


    @Override
    public void onClick(View v) {
        rotateCenterView(mCenterView, 500L);
        makeMenuItemAction(500L);
    }

    private void rotateCenterView(View v, long duration) {
        int start = 0;
        int end = 360;
        RotateAnimation roAnimation = new RotateAnimation(start, end,
                Animation.RELATIVE_TO_SELF, 0.5f, Animation.RELATIVE_TO_SELF, 0.5f);
        roAnimation.setDuration(duration);
        roAnimation.setFillAfter(true);
        v.startAnimation(roAnimation);
    }


    private void makeMenuItemAction(long duration) {

        final int itemCount = getChildCount();
        final double singleAngle = Math.PI / (2 * (itemCount - 2));
        for (int i = 1; i < itemCount; i++) {
            final View childView = getChildAt(i);
            childView.setVisibility(VISIBLE);
            //confirm  animation position  start and end
            int leftLength = (int) (Math.cos(singleAngle * (i - 1)) * mMoonRadius);
            int topHeight = (int) (Math.sin(singleAngle * (i - 1)) * mMoonRadius);
            // ends position(0,0)  View 本来就位于那个终点位置，所以距离原来位置的位置偏移量为 0;
            if (mCenterPosition == S_VIEW_POSITION_LEFT_TOP) {
                leftLength = leftLength * (-1);
                topHeight = topHeight * (-1);
            } else if (mCenterPosition == S_VIEW_POSITION_LEFT_BOTTOM) {
                leftLength = leftLength * (-1);
            } else if (mCenterPosition == S_VIEW_POSITION_RIGHT_TOP) {
                topHeight = topHeight * (-1);
            } else if (mCenterPosition == S_VIEW_POSITION_RIGHT_BOTTOM) {
                //null
            }
            AnimationSet animationSet = new AnimationSet(true);
            Animation tranAnim = null;//位移动画
            Animation rotateAnim = null;//旋转动画
            if (mCurrentViewState == S_VIEW_STATE_CLOSE) {//click to open
                tranAnim = new TranslateAnimation(leftLength, 0, topHeight, 0);
                childView.setClickable(true);
                childView.setFocusable(true);
            } else if (mCurrentViewState == S_VIEW_STATE_OPEN) {//click to close
                tranAnim = new TranslateAnimation(0, leftLength, 0, topHeight);
                childView.setClickable(false);
                childView.setFocusable(false);
            }
            tranAnim.setFillAfter(true);
            tranAnim.setDuration(duration);
            tranAnim.setStartOffset(i * 100/itemCount);
            tranAnim.setAnimationListener(new Animation.AnimationListener() {
                @Override
                public void onAnimationStart(Animation animation) {
                }

                @Override
                public void onAnimationEnd(Animation animation) {
                    if (mCurrentViewState == S_VIEW_STATE_CLOSE) {
                        childView.setVisibility(GONE);
                    }
                }

                @Override
                public void onAnimationRepeat(Animation animation) {
                }
            });

            rotateAnim = new RotateAnimation(0, 720F, Animation.RELATIVE_TO_SELF, 0.5F, Animation.RELATIVE_TO_SELF, 0.5F);
            rotateAnim.setDuration(duration);
            rotateAnim.setFillAfter(true);

            animationSet.addAnimation(rotateAnim);
            animationSet.addAnimation(tranAnim);
            childView.startAnimation(animationSet);
            childView.setOnClickListener(new ChildViewClickListener());
        }
        changeViewGroupCurrentState();
    }

    private  void  changeViewGroupCurrentState(){
        if (mCurrentViewState == S_VIEW_STATE_CLOSE) {//Change State
            mCurrentViewState = S_VIEW_STATE_OPEN;
        } else if (mCurrentViewState == S_VIEW_STATE_OPEN) {//Change State
            mCurrentViewState = S_VIEW_STATE_CLOSE;
        }
    }


    class ChildViewClickListener implements View.OnClickListener{

        @Override
        public void onClick(View v) {
            if (SatelliteViewGroup.this.mMenuClickListener != null){
                mMenuClickListener.onMenuClick(v);
            }
            addMenuItemClickAnimation(v);
            changeViewGroupCurrentState();
        }
    }

    private void addMenuItemClickAnimation(View v) {
        final int itemCount = SatelliteViewGroup.this.getChildCount();
        for (int i = 1; i < itemCount; i++) {
             if (v == getChildAt(i)){
                makeMenuItemScaleBigAnimation(getChildAt(i),500L);
             }else {
                 makeMenuItemBeSmallAnimation(getChildAt(i),500L);
             }
        }
    }

    private void makeMenuItemScaleBigAnimation(View v, long l) {
        AnimationSet animationset = new AnimationSet(true);
        ScaleAnimation scaleAnim = new ScaleAnimation(1.0F,4.0F,1.0F,4.0F,
                Animation.RELATIVE_TO_SELF,0.5F,Animation.RELATIVE_TO_SELF,0.5F);
        AlphaAnimation alphaAnim = new AlphaAnimation(1F,0);
        animationset.addAnimation(scaleAnim);
        animationset.addAnimation(alphaAnim);
        animationset.setDuration(l);
        animationset.setFillAfter(true);
        v.startAnimation(animationset);
    }

    private void makeMenuItemBeSmallAnimation(View v, long l) {
        AnimationSet animationset = new AnimationSet(true);
        ScaleAnimation scaleAnim = new ScaleAnimation(1.0F,0F,1.0F,0F,
                Animation.RELATIVE_TO_SELF,0.5F,Animation.RELATIVE_TO_SELF,0.5F);
        AlphaAnimation alphaAnim = new AlphaAnimation(1F,0);
        animationset.addAnimation(scaleAnim);
        animationset.addAnimation(alphaAnim);
        animationset.setDuration(l);
        animationset.setFillAfter(true);
        v.startAnimation(animationset);
    }

}

{% endhighlight %}  
