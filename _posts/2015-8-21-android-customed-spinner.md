---
layout: post
title: Android Spinner自定义
category: android
---

最近写了一部分界面，以前做Web全栈就不是很喜欢写前端，现在做Android依旧不是很喜欢，不过最近写了一部分界面，感觉其实也没那么坏，不过UI控件的坑还是挺多的，自己对于UI部分的练习还是要注重。

最近练习的几个部分主要在于：

* Spinner     
* Adapter
* RelativeLayout       
* ViewStub                  
* ActionBar       
* SharePreference        

这里主要详细总结自己Spinner的自定义，以及顺带总结一下其他几个遇到的点。

###自定义Spinner、

`Spinner`自定义的核心在于改变两个视图，一是展示视图，另一个是下拉列表视图。关于展示视图的自定义在`Adapter`中`getView()`方法返回，需要的视图在此构造完毕进而展示出来。而下拉列表视图则利用`setDropDownViewResource()`方法去指定展示类型。

google官方教程:

{%  highlight java  %}

Spinner spinner = (Spinner) findViewById(R.id.spinner);
// Create an ArrayAdapter using the string array and a default spinner layout 
ArrayAdapter<CharSequence> adapter = ArrayAdapter.createFromResource(this,
        R.array.planets_array, android.R.layout.simple_spinner_item);
// Specify the layout to use when the list of choices appears 
adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
// Apply the adapter to the spinner 
spinner.setAdapter(adapter);

{%   endhighlight %}

可以看出，这应该是利用Adapter去构造好数据一一填充到每一个列表项中。其中Adapter中指定的视图是展示视图。

若要自定义展示视图，可以利用自定义Adapter的方式去构造：

Adapter中getView方法会加载一个layout视图xml文件，先根据效果去判定要如何构造。

在此假设我要实现类似于：

选择类型：XXXXXXXXX  类型——ICON

其中XXXXX为动态可变，也就是每次选定时，前面部分和后面部分是固定展示，而中间数据随着选择变化，如：

选择类型：情人节  类型——ICON              
选择类型：端午节  类型——ICON

构造如下：

{%  highlight xml  %}

<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
              android:orientation="horizontal"
              android:layout_width="match_parent"
              android:layout_height="match_parent">
    <TextView
        style="?android:attr/spinnerDropDownItemStyle"
        android:text="@string/cc_660_type_prefix_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="25sp"/>
    <TextView
        android:id="@+id/tv_spinner"
        style="?android:attr/spinnerDropDownItemStyle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="25sp"/>
    <ImageView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:src="@drawable/expander_open_holo_light"/>
</LinearLayout>

{%   endhighlight %}

分析发现，需要填充数据的View只有中间TextView，进一步完成Adapter自定义实现，其中CreatedInfoFlowActivity.TypeItem是我自定义封装的静态内部类也就是java中的数据Bean，外部构造好list然后填充到Adapter中，进一步解析数据，填充视图；

{%  highlight java  %}

public class TyeDataSpinnerAdapter<TypeItem> extends ArrayAdapter {    
    private List<CreatedInfoFlowActivity.TypeItem> mListDynamicType;    
    private Context mContext;
    private int mLayoutResource;

    public TyeDataSpinnerAdapter(Context context,int resource,List<CreatedInfoFlowActivity.TypeItem> list){
        super(context,resource);
        mContext = context;
        mListDynamicType = list;
        mLayoutResource = resource;
    }
    
    @Override
    public int getCount() {
        return mListDynamicType.size();
    }
    
    @Override
    public Object getItem(int position) {//obtain data to inject ths draw down list view
        return mListDynamicType.get(position).name.zh_CN;
    }
    
    @Override
    public long getItemId(int position) {//get the id to select item 
        return mListDynamicType.get(position).id;
    }
    
    @Override
    public View getView(int position, View convertView, ViewGroup parent) {
        LayoutInflater inflater  = LayoutInflater.from(mContext);
    
        //TODO
        //if datatype nums increase to far more than one page
        //ViewHolder  make better
        convertView =inflater.inflate(mLayoutResource,null);
        TextView tv = (TextView) convertView.findViewById(R.id.tv_spinner);
        tv.setText(mListDynamicType.get(position).name.zh_CN);
        
        return convertView;
    }
}

{%   endhighlight %}

基本情况下，到此一般就完成了相关的自定义。


---

对于其他问题的顺带说明：

对于RelativeLayout的使用，感觉自己更加得心应手，能够更加高效的精简视图结构，减少层次结构，复杂情况下不依赖于系统布局结构当然能够自定义View当然是最好的。如针对某一行居于右，同时处于系统父布局的右端，且还处于某一行的下端，此类较于复杂的构造情况。

UI的构建，无他，唯手熟尔！

ViewStub：ViewStub在XML中定义的id只在一开始有效，一旦ViewStub中指定的布局加载Inflate之后，这个id将失效，防止二次Inflate，那么此时如果再次进行对于ViewStub的findViewById()得到的值将会是null；换句话说就是ViewStub只能Inflate一次，之后ViewStub对象会被置空。在具体使用中，某个Layout布局被ViewStub被Inflate后，就不能够再通过ViewStub来控制它了。故而ViewStub不适用于需要动态按需切换显示隐藏的复杂情况；

如：展开详情界面/隐藏详情界面  的动态多次切换情景--在此就不适用。

`View stubView = ViewStub.inflate()`

可以获取ViewStub中指定的嵌套视图树结构，然后通过`stubView.findViewById()可以一一获取ViewStub包含的子View，进行操作。`




对于SharePreference中getPreference构造针对Activity的私有Preference，以及利用PreferenceManager构造默认Preference的使用情况有了深刻的理解。

