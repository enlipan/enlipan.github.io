---
layout: post
title: Android布局小结
category: android
---

###LinearLayout v.s Relativelayout

1.   When you compile your application, each XML layout file is compiled into a View resource.
    
2.   There are a number of other ID resources that are offered by the Android framework. When referencing an Android resource ID, you do not need the plus-symbol, but must add the android package namespace, like so:`android:id="@android:id/empty"`;
     
> With the android package namespace in place, we're now referencing an ID from the android.R resources class, rather than the local resources class.  

> Defining IDs for view objects is important when creating a RelativeLayout. In a relative layout, sibling views can define their layout relative to another sibling view, which is referenced by the unique ID.

3. Layout Parameters:Every ViewGroup class implements a nested class that extends ViewGroup.LayoutParams. This subclass contains property types that define the size and position for each child view, as appropriate for the view group. As you can see in figure 1, the parent view group defines layout parameters for each child view (including the child view group).--

In general, specifying a layout width and height using absolute units such as pixels is not recommended. Instead, using relative measurements such as density-independent pixel units (dp), wrap_content, or match_parent, is a better approach, because it helps ensure that your application will display properly across a variety of device screen sizes.  

4.Layout Position:For instance, when getLeft() returns 20, that means the view is located 20 pixels to the right of the left edge of its direct parent.

5.Size, Padding and Margins:The size of a view is expressed with a width and a height. A view actually possess two pairs of width and height values.

> Padding can be used to offset the content of the view by a specific number of pixels.(可以设定合适的像素值去撑大View内容)

>  width and height定义组件在其Parent的实际大小
>  
>  drawing width and drawing height 定义组件其实际显示大小
>  
**layout_**参数：是布局参数，是告诉组件的父View怎么控制自己的状态；值得一提的是就算是根的LinearLayout在显示初始化解析的时候其外层还是会再套上一层框架，所以其布局参数不矛盾。


**不带layout**的参数：代表控制参数，用于控制组件本身的状态，如`android:padding`参数就是控制组件本身的边缘距离内容的填充边距

6.layout_weight：             
按准确比例显示LinearLayout内各个**子控件**：
如果想个权重值对于子控件正常的发挥作用,水平方向需设置android:layout\_width="0dp";竖直方向需设置android:layout\_height="0dp";      
在这种情况下某子个控件占用LinearLayout的比例为：本控件weight值 / LinearLayout内所有控件的weight值的和。

按照Google官方文档的说法是：提升显示性能，因为既然指定了layoutweight，系统必然进行相关的UI显示权重计算。而你却设定wrap\_content或者match\_content,这是明显会与权重计算结果相矛盾的。同时设定成wrap\_content之后，系统必然又要进行一次计算，而这次计算明显是不必要的。

> To improve the layout efficiency when you specify the weight, you should change the width of the EditText to be zero (0dp). Setting the width to zero improves layout performance because using "wrap_content" as the width requires the system to calculate a width that is ultimately irrelevant because the weight value requires another width calculation to fill the remaining space.

7.Selector 状态问题：
[Selector-Google](http://developer.android.com/guide/topics/resources/color-list-resource.html)

8.A RelativeLayout is a very powerful utility for designing a user interface because it can eliminate nested view groups and keep your layout hierarchy flat, which improves performance. If you find yourself using several nested LinearLayout groups, you may be able to replace them with a single RelativeLayout.

9.视图解析机制：pull/sax/dom:pull机制比Sax机制更加灵活，控制的灵活性更强。

