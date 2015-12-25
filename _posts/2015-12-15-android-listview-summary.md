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


ListView  ChoiceMode：


 if (mChoiceMode != CHOICE_MODE_NONE && mCheckStates != null) {
            if (child instanceof Checkable) {
                ((Checkable) child).setChecked(mCheckStates.get(position));
            } else if (getContext().getApplicationInfo().targetSdkVersion
                    >= android.os.Build.VERSION_CODES.HONEYCOMB) {
                child.setActivated(mCheckStates.get(position));
            }
        }

对于Item中含有CheckBox的项目，如IM中的每一条消息，我们需要复写其Checkable接口自定义实现View；


ListView setViewType：







android:clipChildren：
有时候1px，分割线被忽略可能是因为这个原因(含义：是否限制子View在其范围内)

---

Quote： 

[说说ViewHolder的另一种写法](http://my.oschina.net/jack1900/blog/289164)

[ListView Tips & Tricks #1: Handling Emptiness](http://cyrilmottier.com/2011/06/20/listview-tips-tricks-1-handle-emptiness/)

[Android布局优化之ViewStub、include、merge使用与源码分析](http://www.androidchina.net/2485.html)