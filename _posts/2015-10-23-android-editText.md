---
layout: post
title: EditText 应用
category: android
---

需要注意的是Activity，软键盘设定的几种设置方式：

1. 设置为“可见”或者“不可见”

stateUnchanged、stateHidden、stateAlwaysHidden、stateVisible、stateAlwaysVisible  

2. 软键盘的展示方式会影响主界面的布局，例如可以是屏幕原有布局改变尺寸，留给软键盘足够的空间。也可能是，原有布局不变，软键盘覆盖在布局上面。

adjustUnspecified、adjustResize、adjustPan、adjustNothing



当设定了外部ScrollView之后如何让EditText多行文本支持可以更好的独立上下滑动，

由于ScrollView也有上下滚动事件，所以需要设定防止ScrollView拦截掉EditText事件进而执行自身的上下滚动事件，TouchEvent将不会分发给EditText,合适的处理方式是：


{% highlight Java %}

youredittext.setOnTouchListener(new OnTouchListener() { 
 
      public boolean onTouch(View v, MotionEvent event) {
 
            v.getParent().requestDisallowInterceptTouchEvent(true);
            switch (event.getAction() & MotionEvent.ACTION_MASK){
            case MotionEvent.ACTION_UP:
                   v.getParent().requestDisallowInterceptTouchEvent(false);
                   break; 
             } 
             return true; 
       } 
}); 

{%  endhighlight %}



PS：

TextView的可复制属性：android:textIsSelectable="true"


Style中的@与?的含义：

> Notice the use of the at-symbol (@) and the question-mark (?) to reference resources. The at-symbol indicates that we're referencing a resource previously defined elsewhere (which may be from this project or from the Android framework). The question-mark indicates that we're referencing a resource value in the currently loaded theme. This is done by referring to a specific <item> by its name value. (E.g., panelTextColor uses the same color assigned to panelForegroundColor, defined beforehand.) 


---

[EditText(输入框)详解](http://www.runoob.com/w3cnote/android-tutorial-edittext.html)

[Applying Styles and Themes](http://www.linuxtopia.org/online_books/android/devguide/guide/topics/ui/themes.html)