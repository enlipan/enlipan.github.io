---
layout: post
title:  Android RecylcerViewAdapter 分析
category: android
keywords: [improvement,android]
---

剖析 RecyclerView 多类型复合结构,分析如何构建一个优秀的框架:  

弄清问题,理清结构,步步为营寻求解决方案,多次迭代完善逻辑结构实现,从网络中寻求灵感;

### 痛点所在

先整理构建多类型 RecyclerView 列表的关键:  

 * Item 数量

 * Type 类型, 位置与 Type 对应关系,哪个位置是哪个 Type? 

 * View 与 ViewType 的对应关系   

 * Model 类型,位置与 Model 对应关系?View 与 Model 的绑定关系?



### 分析解决

1. Item 数量的解决相对 Easy, 事实上如果混合进入加载 Item 和刷新 Item 可能会稍微复杂一下,但依旧比较容易可解;

2. 关于ViewType分析:  `int getItemViewType(int position)`

函数暴露了当前 Item 的 position 位置,进而我们可以通过该 Item 位置,数据 Model 中对应 Model 数据,通常我们根据 Model 数据的类型以及状态,复杂情况还会带入 Adapter 状态混合判断 ViewType, 该 ViewType 直接对应 onCreateViewHolder时的 Type, 决定构建 View 的类型,值得注意的是 这里的 Type 我们在看待的时候要灵活一下,无论这个 int 值是有序还是无序,只要根据这个 Type 能够正确对应到 View 的类型就是行之有效的 Type 定义方式;

事实上,这里是三者关系, Adapter,Model,ViewHolder.在常规情况下,不引入其他 Manager 管理三方关系时,所有的类型判断都处在 Adapter 中;而这种处理在多 Type 时势必造成Adapter逻辑的复杂化,如果一两种类型还可能能够处理,当类型直线上升,其处理逻辑复杂度呈几何倍数增长,类型与类型之间的互相影响,直接影响代码的可维护性;

解耦的是我们解决问题的直接手段,事实上这种类型的解耦我们通常都是引入新的中间对象处理关系逻辑,完成解耦操作;

两个角度的解耦: 一在数据 ModelList 中,数据传输对象 DataTransformModel 以及 ViewModel, 结合继承与多态,模版构建多类型 Model 对象;

二则同时在 Adapter 中构建中间对象处理对应 Type 时 ViewHolder 的构建逻辑,这一点目前大部分的框架都采用了ViewBinder 这一类结构处理,借助 ViewBinder 拆分大量原来属于 Adapter 的逻辑;

3.  position 位置类型与 View的对应关系如何管理. 事实上 Item 中 Model 与 View 的关系无非以下两种,不可能存在一个 ItemView 对应多个 Model 的关系;只可能出现一种Model 对应一种 Item,以及 十个 Item 对应少于十种 Model 的情况;

Model ViewBinder 一一对应:这种 Case 是简单的,在构建 View 时,绑定对应的 DataModel 与 View 的关系之后,在数据构建后只需要紧紧抓住 DataList ,就能知道知道对应Position 的 DataModel, 就知道对应位置的 View 类型;


Model ViewBinder 一对多,一种 Model 对应多种ViewBinder:这种类型相对复杂一些,但是只要抓住,究竟是如何根据 Model 中的变量因子寻找对应类型的View 就可以解决;同样在 Type 的定义处,我们还是获取到了对应的 Model, 如何根据这个 Model 以优雅的形式寻找到对应的 View 类型就是我们的最终目的;一般有几种途径:常规途径利用 Model组合 大量 ifelse 语句定义对应 Type 类型处理,优雅的我们知道利用策略消除 ifelse 处理,但是策略的关键在于策略的处理与上下文环境的注入获取问题;

这一块最近看到的一个开源库: `drakeet/Effective-MultiType`就处理得非常舒服,利用 linker,binder, 以及 class 一一对应,通过在 register 注册时让三者保持数量上的严格一致性,通常情况下,Model 对应的 firstindex 就是 ViewBinder 对应的 index,直接根据这个就可以定位到对应的 ViewBinder; 而在一对多的情况下,就循环加入对应的 Model, 第一个 Model 的 firstIndex 不再是对应的 Viewbinder位置,此时利用linker 结合注册时的定义的对应 Model 的偏移量找到 Model 的实际位置,进而定位真实的 ViewBinder; 这一块看出作者确实是动了比较多的巧妙心思,同时这个库非常简洁,逻辑清晰,扩展性强,实现优雅,的确符合作为一个基础的库的条件,值得学习;


{% highlight java %}

public interface Linker<T> {

    /**
     * Returns the index of your registered binders for your item. The result should be in range of
     * {@code [0, one-to-multiple-binders.length)}.
     *
     * <p>Note: The argument of {@link OneToManyFlow#to(ItemViewBinder[])} is the
     * one-to-multiple-binders.</p>
     *
     * @param t Your item data
     * @return The index of your registered binders
     * @see OneToManyFlow#to(ItemViewBinder[])
     * @see OneToManyEndpoint#withLinker(Linker)
     */
    @IntRange(from = 0)
    int index(@NonNull T t);
}

public interface ClassLinker<T> {

    /**
     * Returns the class of your registered binders for your item.
     *
     * @param t Your item data
     * @return The index of your registered binders
     * @see OneToManyEndpoint#withClassLinker(ClassLinker)
     */
    @NonNull
    Class<? extends ItemViewBinder<T, ?>> index(@NonNull T t);
}

    @Override
    public int index(@NonNull T t) {
        Class<?> userIndexClass = classLinker.index(t);
        for (int i = 0; i < binders.length; i++) {
            if (binders[i].getClass().equals(userIndexClass)) {
                return i;
            }
        }
        ...
    }

adapter.register(Data.class).to(
            new DataType1ViewBinder(),
            new DataType2ViewBinder()
        ).withClassLinker(new ClassLinker<Data>() {
            @NonNull @Override
            public Class<? extends ItemViewBinder<Data, ?>> index(@NonNull Data data) {
                if (data.type == Data.TYPE_2) {
                    return DataType2ViewBinder.class;
                } else {
                    return DataType1ViewBinder.class;
                }
            }
        });

{% endhighlight %}

两种偏移量的处理都殊途同归,classlinker 看起来更加清晰,作者却是通过代理,实际还是处理 linker 的逻辑,定位 index 偏移量,很有意思.

其实其他还有诸多这种处理 Adapter 逻辑的开源库,但是这个库却是比较符合我心目中理想的基础库的样子;

### 思考

在实际的实现过程中,事实上 Adapter 这一层已经是在 RecyclerView 上的二次封装,通常我们的业务框架都是混合着业务的实践,当然能够提升我们的开发效率,合作效率就是好的,这或许也称之为接地气;但就一个框架层面来说似乎高可扩展的,灵活的,清晰的框架才是好的,就比如 GitHub 中开源的框架很多时候就不应该带入过多的业务相关,下拉加载等等(但很多开发者就喜欢那种简单粗暴的大而全的处理,偷得一时懒,说回来很多高 star 库并不一定带来高质量,盛名之下其实难副,一直觉得不偷懒这个对于程序员而言才是最重要的),但又必须能够支持快速的扩展实现这种业务逻辑,这就是所说的出发点不一样,结果就不一样;

前些天我总结过的模版模式 RecyclerView 的 Adapter 不就是典型的实践么,但是这里面又结合了适配器等等诸多模式,所以模式是死的,使用却是活的,需要因地制宜去考虑实践方式.

越是中高端程序员对于重构与设计模式越要熟悉,毕竟从零开始的项目机会总是少的,无论是前人的基础还是包袱都不是能够轻易撇清,Legacy Code 在程序员生涯中是一个永恒的话题;



---

Quote:

[drakeet/Effective-MultiType ](https://github.com/drakeet/Effective-MultiType/blob/master/README.md)