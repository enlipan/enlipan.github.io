---
layout: post
title: ActionBar  Support
category: android
---
###ActionBar

1. showAsAction 不能正常配置        

> If your app is using the Support Library for compatibility on versions as low as Android 2.1, the showAsAction attribute is not available from the android: namespace. Instead this attribute is provided by the Support Library and you must define your own XML namespace and use that namespace as the attribute prefix. (A custom XML namespace should be based on your app name, but it can be any name you want and is only accessible within the scope of the file in which you declare it.)          

2. SearchView以及ActionProvider显示问题        

> 解决方法类似showAsAction,`appname: xml namespace`   

3. 工具类获取Context，利用其构造函数，从主界面传参达到目的获取Context的效果，同时能够实现代码的弱耦合

4. ActionBar图标显示问题 

> Using a logo instead of an icon       
By default, the system uses your application icon in the action bar, as specified by the icon attribute in the <application> or <activity> element. However, if you also specify the logo attribute, then the action bar uses the logo image instead of the icon.        
A logo should usually be wider than the icon, but should not include unnecessary text. You should generally use a logo only when it represents your brand in a traditional format that users recognize. A good example is the YouTube app's logo—the logo represents the expected user brand, whereas the app's icon is a modified version that conforms to the square requirement for the launcher icon.

图标解决方案：    

`setDisplayShowHomeEnabled`
`setIcon(id)`,
如果要显示`logo`，
则需要开启`setDisplayUseLogoEnabled(true)`,同时设置`logo`资源文件。

5. Tabs问题


####异常问题

{% highlight Java %}

getActionBar Return NUll

Solution:

((ActionBarActivity)getActivity()).getSupportActionBar();


{% endhighlight %}


6.[ActionProvider](http://www.cnblogs.com/tianzhijiexian/p/3873259.html)

---

[Adding the Action Bar](http://developer.android.com/training/basics/actionbar/index.html)