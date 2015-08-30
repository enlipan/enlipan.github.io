---
layout: post
title: Android 数据发送与共享接收
category: android
---

关于应用之间分享数据的一点接触与了解：

之前最开始自己学习ActionBar的时候学习了`ShareActionProvider`,其核心应用

{%  highlight xml  %}

    <item android:id="@+id/menu_item_scope_share"
        android:showAsAction="always"
        android:title="Share"
        android:actionProviderClass="android.widget.ShareActionProvider" />

{% endhighlight %}

设定好相关的分享控件代表着外部架子搭好了，进一步我们需要设定相关的分享内容，代表着接受应用能够接受到的数据：

通过onCreateOptionsMenu，获取到ShareActionProvider控件，进一步指定分享内容：

{%  highlight java  %}

ShareActionProvider.setShareIntent(getDefaultIntent())

//From Google
/** Defines a default (dummy) share intent to initialize the action provider. 
  * However, as soon as the actual content to be used in the intent 
  * is known or changes, you must update the share intent by again calling 
  * mShareActionProvider.setShareIntent() 
  */ 
private Intent getDefaultIntent() {
    Intent intent = new Intent(Intent.ACTION_SEND);
    intent.setType("image/*");
    return intent;
}

{% endhighlight %}

另一种方式也比较常见：

向其他应用分享数据:

通过设定隐式intent相应的Action与MIMETYPE，去匹配相关分享内容，
action一般指定为：ACTION_SEND

借用隐式intent时为防止没有相应的应用匹配导致Crash一般需要验证有无对应的app接收：

{%  highlight java  %}

Intent sendIntent  = new Intent();
sendIntent.setAction(Intent.ACTION_SEND);
sendIntent.setType(image/\*);
sendIntent.putExtra(.....);
 List<ResolveInfo> resInfo = getPackageManager().queryIntentActivities(sendIntent, 0);
if(resInfo != null){
.........
startActivity(Intent.createChooser(sendIntent, getResources().getText(R.string.send_to)));

}

//发送多条数据

sendIntent.putParcelableArrayListExtra(ACTIVIT\_EXR\_LIST\_DATA,dataList);
startActivity.....//根据需求确定采用Chooser包装与否

{% endhighlight %}


接受其他应用数据：

我们知晓的如何分享，就同样知道如何去接受其他应用分享，在设计如何发送的时候我们要考虑的就是其他应用怎么接受我们分享的数据，此时不过是反过来，并没有什么新奇的玩意，无非是根据IntentAction匹配相应的Intent，切换相应的Activity，对数据进行处理展示。

关于如何接受相应的intent，我们需要对指定Activity做相应的< intent-filter > 指定，分别指定Action name以及相应的data mimeType，以及category .

{%  highlight xml  %}

<activity android:name=".ui.ShareContentActivity" >
    <intent-filter>
        <action android:name="android.intent.action.SEND" />
        <category android:name="android.intent.category.DEFAULT" />
        <data android:mimeType="image/*" />
    </intent-filter>
    .......

{% endhighlight %}

顺便说明一下category.DEFAULT,这个category是必须指定的，是在StartActivity(intent)中自动为intent附加的属性。

Google解释如下：

> Android treats all implicit intents passed to startActivity() as if they contained at least one category: "android.intent.category.DEFAULT" (the CATEGORY_DEFAULT constant). Therefore, activities that are willing to receive implicit intents must include "android.intent.category.DEFAULT" in their intent filters. 


有个好玩的StackOverflow解释：

> Setting Category to Default doesn't mean that this Activity will be used by default when your app launches. The Activity just says to system that " Oh I could be started, even if the starter Intent's category is set to Nothing at all ! "




---

quote：

[Android应用程序内容分享](http://www.360doc.com/content/13/0805/15/11991_304908300.shtml)

[Android应用程序间的内容分享机制](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2013/0104/778.html)

[Android分享中，如何过滤指定的应用，并且对不同的分享方式发送不同的内容？](http://www.jcodecraeer.com/a/anzhuokaifa/androidkaifa/2013/1005/1564.html)
