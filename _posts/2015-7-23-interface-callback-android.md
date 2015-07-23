---
layout: post
title: Android接口回调小结
category: android
---

回调机制：根据Button事件的注册机制分析，理解，其实往往看似最简单的事物中蕴含着最深入的道理。

最开始看到说是接口回调，自己想了好久懵懵懂懂，似懂非懂，看了一些资料之后，发现是如果说是接口函数回调，那么很多东西就好理解的多了，回调的是函数，接口只是一个`Java`中传递函数的媒介。在C语言之中直接传入函数地址也是可以实现回调的，所以说`Java`接口回调的本质是函数回调。

先上一段最典型的代码：

{% highlight Java %}

class Activity{
View mButton;

mButton.setOnclickListener(new ButtonClick());

private class ButtonClick impliment OnclickListener {
    public onClick(View v){
            //Do Something what you want
}
}
}

{% endhighlight%}

当然一般我们写接口实现匿名内部类，这里写全是为了更加能够看清本质。那么在View中，当然有对应的一些接口：

{% highlight Java %}

class View {
    
    private OnclickListener mListener;
    public interface OnclickListener{
        pulic onClick(View v);
    }

    public setOnclickListener(OnclickListener listen){

            mListener = listen;
    }
}

{% endhighlight%}

说白了，接口回调是什么回事呢，就是View类想完成某个事件，这里当然是点击事件，但是缺少材料想找别人借材料，完成自己的事，那么一借东西，二者的联系就建立起来了，这里就完成了相应的组件通信。在这里View想完成点击事件，但是点击之后发生什么呢？自己不知道，缺东西啊，找Activity借，Activity定义了具体的如何去做，这个如何去做封装到一个函数里面借给View，view然后回调这个函数，就完成了事件了。

简单的比喻：某人要到商店买东西，但是商店没货了，就跟顾客说你留下一个合适的方式到货了我告诉你。也就是商店想跟顾客建立相应的联系。

顾客说，我有手机联系方式和Email联系方式，这样吧到货了你打我电话。也就是打电话这个具体的动作是顾客定义的，指定的，也就是商店到时候要回调的函数方法，是顾客自己定义的。

这个比喻中回调做的什么呢？回调做的是：当某些条件满足的时候在(到货的时候)，商店想要通知顾客，但是商店缺东西啊，缺什么呢？缺联系方法，然后顾客自己告诉他了，等到到货了，商店就回调这个函数。

这就是回调！

以下引用知乎回答：

> 编程分为两类：系统编程（system programming）和应用编程（application programming）。所谓系统编程，简单来说，就是编写库；而应用编程就是利用写好的各种库来编写具某种功用的程序，也就是应用。系统程序员会给自己写的库留下一些接口，即API（application programming interface，应用编程接口），以供应用程序员使用。所以在抽象层的图示里，库位于应用的底下。

> 当程序跑起来时，一般情况下，应用程序（application program）会时常通过API调用库里所预先备好的函数。但是有些库函数（library function）却要求应用先传给它一个函数，好在合适的时候调用，以完成目标任务。这个被传入的、后又被调用的函数就称为回调函数（callback function）。

根据该知乎引用中所额外指出的：ABC三方，A起始函数，B-API函数也就是中间函数，C是回调函数。AC位于同一层面，而API中间函数是底层事件。



---

###quote

[知乎-回调参考1](http://zhi.hu/5Npt)

[知乎-回调参考2](http://zhi.hu/4TQz)