---
layout: post
title: Android 阶段总结
category: android
---
最近两周在Leader安排下，既前面第一个自主周项目之后，算是完整的开发了一个商业应用代码模块，Leader是国内第一批做Android的开发者，对于代码的注重以及钻研程度可以说是完美主义到近乎偏执，在持续高压下完成任务，满满的收获，打内心里感激Leader。

言归正传，先上效果图：

{:.center}
![image](http://res.oncelee.com/assets/img/20150827/Screenshot_2015-08-29-00-07-50.png)

{:.center}
![image](http://res.oncelee.com/assets/img/20150827/Screenshot_2015-08-29-02-55-48.png)

{:.center}
![image](http://res.oncelee.com/assets/img/20150827/Screenshot_2015-08-29-00-07-44.png)

完整的流程下来，最核心的点在于对于Android的开发流程有了一个整体层面的理解，同时对于以往Web开发的一些差异也能够更加清晰，最重要的是学会了结合系统流程图高效模块化编程，开始采用先整体后局部细节的方式快速开发。同时一些开发以及思考习惯开始逐步形成。出于对公司的尊重，不过多提源码一事，只是对于自己遇到的的一些问题作一个详细的归纳总结。

第一个在于Spinner的自定义总结，详细的情况前面已经总结过。额外只记录一点，设定Spinner中某一项不能点击：**通过合理设定Adapter的isEnabled事件完成**

{%  highlight java  %}

 public boolean isEnabled(int position) {
            // TODO Auto-generated method stub 
            if (范围之内) {
                return false;//点击事件不被消费 
            } 
            return true; 
        } 

{% endhighlight %}

关于设置了Spinner背景之后，在5.0版本以上DropDown模式下，下拉能拓展至整个页面，但是5.0以下需要设定`popupBackGround`,否则将会造成下拉左侧始终存在一个边距，实在是强迫症不能忍啊。

这个细节反而是耗时间最长的。导致浪费大量时间，一个视觉方案必然有相关的技术解决方案只是需要我们去探索而已。

第二个在于GridLayout的应用，同样不做过多说明。

第三个在于对于实现后台任务的选择方法，具体使用New Thread还是AsyncTask，具体情况可以具体分析，一般来说对于有界面交互的，比如弹出ProgressDialog之类的情况，可以选用Asynctask，充分利用其生命周期方法。而当程序与用户并没有交互时，我们则推荐选用New Thread，后台线程与UI线程的消息传递利用Handler完成。

第四个在于ViewPager的使用，主要在于合理控制Adapter去正确实例化相应的View对象返回展示。这里需要注意的是ViewPager动态删除元素，一是正确调用notifydatasetchanged，二是一个困扰我时间比较长的点，ViewPager中数据删除之后，数据并没有即时刷新，需要通知重新加载，否则会出现图片删除之后，向删除的图片拖拽不放感觉能重新拉出图片，但是放手时图片又不会显示，器原因在于该Position已经删除，但是ViewPager数据没有全部刷新展示。针对这种情况需要做相应设定，强制重新刷新数据。

{%  highlight java  %}

public int getItemPosition(Object object) {
    return POSITION_NONE; 
} 

This way, when you call notifyDataSetChanged(), the view pager will remove all views and reload them all. As so the reload effect is obtained.

{% endhighlight %}

第五点在于养成了适应于Android的正确的开发调试习惯，而不是简单的利用Debug，合适的Log输出将大大提升开发效率。

其他的一些则是Restore恢复状态中注意的一些点，图片LruCache缓存，动态添加View到GridLayout，TextWather监听输入框,深入的View优化细节，ViewStub以及Relativelayout深入使用。

额外提一点，今天自己粗心的编程导致一个问题，ArrayList的Remove()函数的重载问题，在从一个List中删除另一个存入了指定图片位置的index List。
每一次直接mImageList.remove(positon),都无法删除，甚至看了底层的一些System源码，最后发现是由于我的index 被装箱为InTeger，而调用了 ArrayList.remove(Object)函数，而不是ArrayList.remove(int index)函数，让自己都无语了很久。解决方法直接拆箱完成即可：mImageList.remove((int)positon)

现在回过头来整理觉得点虽然挺多的，但是好多东西真的是不难，难在自己的浮躁，难在自己知识的空白目前还太多。一有Leader催了之后，明显感觉自己做事有时候急躁，有一种害怕自己完不成任务的情绪在里面，想来或许主要是出于自己刚刚转型，好多东西不了解，对于Android知识依旧不熟悉，所以对待自己的技术自己无法正确预估是否能够完成，不自信，这是一个需要逐步培养的过程，自己还需要更加努力应对。



---

[ViewPager PagerAdapter not updating the View](http://stackoverflow.com/questions/7263291/viewpager-pageradapter-not-updating-the-view)
