---
layout: post
title: 自定义有前缀的 EditText
category: android
keywords: [android, view]
---

前缀的提示其实挺有意思的，感觉有一点信息补全提示，而不仅仅只是像Hint那样的弱提示，如有时候我们需要电话的区号前缀，要实现一个带前缀的 EditText  方式多种多样，复杂的有用 TextWather的监听去构造的，最开始第一直觉也想过这种方式，但是细细想来还是有比较多的坑的，需要控制用户光标选中了前面的文字，继续输入的时候跳到前缀之后，还需要控制用户的复制粘贴光标，需要控制用户不能删除前缀等等复杂的地方；

换一种思路，其实比较简单的还是直接绘制前缀文字在 EditText所设置的Padding中，这样其输入复制光标等行为都按照默认的super函数去一一实现了，而不需要自己去关心，这种情况对于单行的输入是完美的实现，其适用于注册登录时，电话号码或者其他的前缀显示：

{% highlight java %}

public class PrefixEditText extends AppCompatEditText {

    private final String mPrefixString;
    private static int S_OriginalPaddingLeft = -1;

    public PrefixEditText(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context,attrs,defStyleAttr);
        TypedArray ta = context.obtainStyledAttributes(attrs, R.styleable.PrefixEditText);
        mPrefixString = ta.getString(R.styleable.PrefixEditText_prefix_text);
        ta.recycle();
    }

    public PrefixEditText(Context context, AttributeSet attrs) {
        /**
         * 此处 默认 Style需要在 父类中使用的 Style 并非为 默认值 0；
         */
        this(context, attrs, android.support.v7.appcompat.R.attr.editTextStyle);
    }

    public PrefixEditText(Context context) {
        this(context,null);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        calculatePrefixTextPadding();
    }

    private void calculatePrefixTextPadding() {
        if (S_OriginalPaddingLeft < 0){
            final int length = mPrefixString.length();
            if (length <= 0) return;
            final double paddingLeft = getPaint().measureText(mPrefixString);
            S_OriginalPaddingLeft = getCompoundPaddingLeft();
            setPadding((int) (S_OriginalPaddingLeft + paddingLeft),getPaddingTop(),getPaddingRight(),getPaddingBottom());
        }
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        canvas.drawText(mPrefixString,S_OriginalPaddingLeft,getLineBounds(0,null),getPaint());
    }

}

{% endhighlight %}  








但是有一个问题要是多行输入如何处理？每一行的输入起点都一样，其实多行我们更加期望的是，首行有前缀，其他行顶格，造成一种首行输入标签Title的感觉，实现起来的思路：
