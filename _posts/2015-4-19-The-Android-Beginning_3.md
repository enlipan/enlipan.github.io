---
layout: post
title: My Android Beginning (3)
category: android
---

##Developing Android Apps——Activity and Intent

### Intent

Intent：An intent allows you to start an activity in another app by describing a simple action you'd like to perform (such as "view a map" or "take a picture") in an Intent object.        
When you call startActivity() or startActivityForResult() and pass it an implicit intent, the system resolves the intent to an app that can handle the intent and starts its corresponding Activity.

Intent分为隐式Intent与显示Intent，其中显示Intent明确指定intent的传递对象，类似于信封指明了收信人。而隐式Intent则是信封上写了收信人的一系列条件，等待系统匹配过滤出所有符合条件的收信人列表，等待寄信人指定是列表中的哪一位。

官方的说法就是：利用implicit intent发起相应的需求请求，Android检查系统中所有的活动Intent Filter并进行匹配，如果有多项匹配则显示选择列表，供给用户自定义选择，但是一旦没有相应的Filter匹配则应用崩溃。

要擅用隐式请求，充分的利用系统资源，不要事事亲历亲为自行开发实现，要适当的拿来主义，一方面提高开发效率，另一方面做的越少错的就越少。

{:.center}
![Intent传递](/assets/img/20150418/Intenttransfer.jpg)

值得注意的是： If there are no apps on the device that can receive the implicit intent, your app will crash when it calls startActivity(). 所以通常我们要确定系统中存在该Intent接收对象，也就是[Verify Intents with the Android Debug Bridge](https://developer.android.com/guide/components/intents-common.html#AdbIntents)，系统中利用查找匹配的<Intent-filter>，App中活用Intent过滤器定义该App能处理的操作与活动，以及该App可以操纵的数据与活动类别

{% highlight bash %}

adb shell am start -a <ACTION> -t <MIME_TYPE> -d <DATA> \
  -e <EXTRA_NAME> <EXTRA_VALUE> -n <ACTIVITY>

adb shell am start -a android.intent.action.DIAL \
  -d tel:555-5555 -n org.example.MyApp/.MyActivity

{% endhighlight %}

### Setting

设置的设计实现注意事项：

* 不要使用过多的设置
* 不要使用过多的自定义设定

>  设置可以在后期的版本更新中随时加入应用之中，但是设置一旦加入了，后期用户的使用惯性之后，你就再也无法轻易取消了，取消之后会很不讨喜于用户。



附录：

[Settings Design](http://developer.android.com/guide/topics/ui/settings.html#Overview)

### 引用说明

文中截图均出自于UDAcity课程[Developing Android Apps-Android Fundamentals](https://www.udacity.com/course/developing-android-apps--ud853   "Developing Android Apps课程链接")的视频截图

