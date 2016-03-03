---
layout: post
title: Android Data Binding
category: android
---


说Data Binding 就离不开 `MVVM` 模式，`MVVM`即： Model ，View ， View-Model,与单纯的业务Model不同，View-Model 完成了与View的适配，为View而生；

### MVVM

从MVC中View 与 Model的耦合性过强而引申出 View与 Model彼此绝对独立之 —— MVP架构，利用中间者 Presenter隔离 View 与Model，弱化View层功能性，View层没有任何业务逻辑相关同时也不再主动监听Model数据更新，View层完全被动，也成为了所谓的——被动视图，Activity被解放出来，原生MVC中 Activity充当 Controller 随着业务逻辑以及需求增加导致其繁琐的代码结构问题被解决；

关于 MVP 中 View 接口 IView的存在必要性，最初其实写第一个MVP Demo并没有采用这一层，写着写着发现耦合度其实还是比较高的，事实上一个View至少对应一个Presenter，无接口定义会二者强耦合在一起，当采用接口定义 View行为之后，明显发现一方面通过接口定义行为可以便于模拟单元测试控制View展示逻辑，另一方面 IView的存在进一步降低了与 Presenter之间的耦合度；

进一步的引申进化，考虑到View 与Presenter之间的紧密联系，进一步改进Presenter模式，View与ViewModel二者双向关联，View与ViewModel互相之间的交互利用框架实现——DataBinding；ViewModel涵盖了关于View的Option以及相关Data属性，View一旦改变直接通过 框架影响 ViewModel，而ViewModel的变化同时也通过DataBinding直接映射到View的状态变化上去；

不过框架的东西说了这么多，重要的还是要强调工程性，实践性，先实现需求，先实现后重构，边实现边重构，终身实践终身重构，而不能说要先计划好所有，再去实现，需要知道重构有顶层架构与底层抽象之分；

### DataBinding

表达式： `@{}`


Layout —— `data` 元素中的 import属性，类似Java的引包机制；

引包时，默认type name 为类名，当不同包下的类名出现重复冲突问题时，采用  alias 别名字段重命名；


注意可以通过import 在表达式中引用静态字段或者静态函数；


利用`<data  class = "com.kotlin.example.lee.databindingdemo.MainBinding">` 标签去自定义 Binding类；

对于inClude 布局文件，若跟文件作为了View视图，其inClude xml layout文件同样需要相关属性变量定义；

{% highlight groovy %}

/////当前引入方式

dataBinding {
    enabled = true
}

//////////////////////


dependencies {

    classpath 'com.android.tools.build:gradle:1.3.0'
    classpath "com.android.databinding:dataBinder:1.0-rc1"

}

{% endhighlight %}


{% highlight java %}


//Bean 类型中支持值域引用的函数方式：

// getXXX形式
public String getFirstName() {
    return this.firstName;
}

// 或者属性名和方法名相同
public String lastName() {
    return this.lastName;
}


///////////////////////////////////////////////////////////////////


protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_main);
    ActivityMainBinding binding = DataBindingUtil.setContentView(this,R.layout.activity_main);
    Status status = new Status("Lee","Paul","","");
    binding.setStatus(status);
    ActionHandler actions = new ActionHandler(this);
    binding.setActions(actions);
}

/////////////////////////////////////////////////////////////////////

private Activity mAc;

public ActionHandler(Activity ac){
    mAc = ac;
}

public void onTvClick(View v){
    mAc.finish();
}

{% endhighlight %}

当layout xml文件中 layout 属性绑定完成会生成一个继承 ViewDataBinding的实例类根据 layout文件名对应生成，若 activity_main.xml 则生成 ActivityMainBinding类；通过layout 文件中的xml 表达式属性将 ViewModel绑定View；


DataBinding 支持多种表达式语言，写起来很有种写 JSTL 的感觉，其种类基本涵盖基本运算符:数学运算符、字符串连接、逻辑运算符、一二三元操作符、比较、以及值域引用、函数调用，甚至还有 Cast 、instanceof、Grouping ()等


#### 监听

通过View 与 ViewModel的绑定，完成数据的更新监听，类似与观察者机制

{% highlight java %}

@Bindable
public String getName() {
    return name;
}

public void setName(String name) {
    this.name = name;
    notifyPropertyChanged(BR.name);
}

////////////////////

public void onTvClick(View v){
    mStatus.setName("New Name");
}

{% endhighlight %}

`@Bindable`属性用于生成 BR.[property name]，进而调用 norify机制刷新界面，中间的通知机制由 DataBinding框架完成，隐藏细节，让开发者专注于业务逻辑；

也可以利用 ObservableFields 或者 Observable Collections 的形式去进行 POJO 数据改变时的监听

DataBinding 不支持： this  super 以及 new 关键字；

DataBinding @引用表达式自动校验空指针问题；


#### AdapterView绑定


{% highlight java %}

    public static class BindingHolder<T extends ViewDataBinding> extends RecyclerView.ViewHolder {
        public T getBinding() {
            return mBinding;
        }

        private T mBinding;

        public  BindingHolder(T binding) {
            super(binding.getRoot());
            mBinding = binding;
        }

    }

    /////////////////

    public static class BindingAdapter extends RecyclerView.Adapter<BindingHolder> {

        ArrayList<Book> mBooks = new ArrayList<>();

        public void addBooks(Book[] books) {
            mBooks.clear();
            mBooks.addAll(Arrays.asList(books));
        }

        @Override
        public BindingHolder onCreateViewHolder(ViewGroup parent, int viewType) {
            ItemRecyclerBinding binding = DataBindingUtil.inflate(LayoutInflater.from(parent.getContext()), R.layout.item_recycler, parent, false);
            BindingHolder<ItemRecyclerBinding> holder = new BindingHolder<>(binding);
            return holder;
        }

        @Override
        public void onBindViewHolder(BindingHolder holder, int position) {
            final Book book = mBooks.get(position);
            holder.getBinding().setVariable(BR.book, book);
            holder.getBinding().executePendingBindings();
        }

        @Override
        public int getItemCount() {
            return mBooks.size();
        }

    }

    /////////////////////////////////////

    public class Book extends BaseObservable{

    @Bindable
    private String name;
    @Bindable
    private String title;

    public Book(@NonNull String name, @NonNull String title){
        this.name = name;
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
        notifyPropertyChanged(BR.title);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        notifyPropertyChanged(BR.name);
    }

}

{% endhighlight %}

executePendingBindings() 立即绑定更新数据界面；

DataBinding 后台线程更新数据问题，更新非 集合类型的数据 DataModel，即使是后台线程 DataBinding可以自动更新界面，并且可以很好的避免并发问题；

---

Quote:

[Data Binding Guide](https://developer.android.com/tools/data-binding/guide.html)

[Marshmallow Brings Data Bindings to Android](https://realm.io/news/data-binding-android-boyar-mount/)

[How to use Android DataBinding with RecyclerView](https://robotsandpencils.com/how-to-use-android-databinding-with-recyclerview/)


[来自官方的Android数据绑定（Data Binding）框架Read more](http://blog.chengyunfeng.com/?p=734)

[MVVM模式](https://github.com/xitu/gold-miner/blob/master/TODO%2Fapproaching-android-with-mvvm.md)

[MVC，MVP 和 MVVM 的图示](http://www.ruanyifeng.com/blog/2015/02/mvcmvp_mvvm.html)

[Android MVVM到底是啥](http://mp.weixin.qq.com/s?__biz=MzA4MjU5NTY0NA==&mid=401410759&idx=1&sn=89f0e3ddf9f21f6a5d4de4388ef2c32f#rd)

[Scaling Isomorphic Javascript Code](http://blog.nodejitsu.com/scaling-isomorphic-javascript-code/)

[Android App的设计架构](http://www.tianmaying.com/tutorial/AndroidMVC)
