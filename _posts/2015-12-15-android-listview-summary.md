---
layout: post
title: ListView 小结
category: android
---

EmptyView Tip：

* EmptyView需要与ListView在同一图层；                    
* EmptyView可以利用setEmptyView 或者 在ListActivity中设定 `android:id="@android:id/empty"`，在ListActivity中的onCreate（）中调用setContentView时，会自动查找android:id属性为android.R.id.list的listview控件并查找android:id属性为android.R.id.empty控件，并自行对它们进行管理。     
* empyView可以通过使用viewStub 懒加载的方式来设定；可以设定Viewstub id  为 @android:id/empty，让ListActivity中的ListView 自动管理         
* 利用setEmptyView 的方式在某些设备上 需要严格按照 先设定setEmptyView ，再SetAdapter的顺序才能生效；


ViewHolder：

了解AdapterView的convertView复用原理；

需要注意的是：ViewHolder最佳设定为静态内部类，使其与其他缓存无关，由于非静态内部类将持有外部类的引用，这点需要尤其注意；

{% highlight java %}

ListView  ChoiceMode：


 if (mChoiceMode != CHOICE_MODE_NONE && mCheckStates != null) {
            if (child instanceof Checkable) {
                ((Checkable) child).setChecked(mCheckStates.get(position));
            } else if (getContext().getApplicationInfo().targetSdkVersion
                    >= android.os.Build.VERSION_CODES.HONEYCOMB) {
                child.setActivated(mCheckStates.get(position));
            }
        }

{%  endhighlight %}

对于Item中含有CheckBox的项目，如IM中的每一条消息，我们需要复写其Checkable接口自定义实现View；


ListView setViewType：




ListView的三个属性：


android:clipChildren：是否限制子View在其显示范围之内；



android:clipToPadding 混合 PaddingTop：可以用于设定 “滑动后可消失的，顶部间距",也就是那一段顶部间距可以用于显示Item，在Item上滑时，可以显示在Padding区域；



android:descendantFocusability: 用于处理 子 View 与 Item之间的聚焦冲突问题；




ListView中包含Header后的onItemClick position 问题：

前段时间调试OnItemLick时，突然发现 position对应的 Entity 位置错误的问题：后来想了想源码中设置Header后，会在Adapter设置时重新包装产生新的Adapter，所以我们在使用时应该 利用`listView（parent）.getAdapter.getItem(position)`的方式，获取对应位置的entity;

当然我们应该知道 getAdapter的方式获取的Adapter 是包装HeadView之后的Adapter，所以利用这种方式当然会获取到对应的 entity；



ListView 高度之 wrap\_content 与 match\_parent

wrap_content 需要 多次计算 子Item 高度，会造成getView多次调用，甚至造成Item显示初始化问题；尤其是在快速滑动 FastScroll模式下，会造成getView 的 复用 item位置错误，造成所加载的资源错位，这时改为 match\_parent 可解决此问题； 




---

Quote： 

[说说ViewHolder的另一种写法](http://my.oschina.net/jack1900/blog/289164)

[ListView Tips & Tricks #1: Handling Emptiness](http://cyrilmottier.com/2011/06/20/listview-tips-tricks-1-handle-emptiness/)

[Android布局优化之ViewStub、include、merge使用与源码分析](http://www.androidchina.net/2485.html)

[当ListView有Header时，onItemClick里的position不正确](http://blog.chengbo.net/2012/03/09/onitemclick-return-wrong-position-when-listview-has-headerview.html)

[ListView adapter getView() getting wrong item](http://stackoverflow.com/questions/16550721/listview-adapter-getview-getting-wrong-item)

[ListView / GirdView Adpater的getView方法，首项多次调用](http://www.liaohuqiu.net/cn/posts/first-view-will-be-created-multi-times-in-list-view/)