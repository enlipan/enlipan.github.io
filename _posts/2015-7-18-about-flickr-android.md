---
layout: post
title: Android权威指南Flickr-Connection-Error
category: android
---

最近Coding练习 `Android权威指南`，当Coding到26章节的时候遇到了墙内墙外的一些问题，记录下来，防止自己遗忘；

Android权威指南的第26章节是获取Flickr应用数据，也就是Http的链接问题，当科学上网之后申请了Flickr账号以及key之后，怎么都链接不上，显示Error是：

> java.io.FileNotFoundException: http://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=
> 

定位Error显示在于`InputStream in = connection.getInputStream();`失败。于是考虑到手机是否科学上网成功的问题，于是将Url获取之后再自行输入PC，得到数据：

{% highlight XML %}

<rsp stat="fail">
    <err code="95" msg="SSL is required" />
</rsp>

{% endhighlight%}

`SSL is required`，联想到HTTPS协议，考虑到是否是新的网站像百度一样考虑安全问题换了协议，不能按照书上的HTTP协议获取链接了。但是还是不确定，于是stackoverflow之，验证了自己的猜想，Flickr网站现在必须要HTTPS协议链接了，更换链接：

`HttpsURLConnection connection = (HttpsURLConnection)url.openConnection();`

获取内容成功，解决之。

同时从之前的Debug模式下，学会开始适应打Log跟踪运行调试，顺便感慨下Log调试的速度


---

[stackoverflow--Flickr](http://stackoverflow.com/questions/24526274/ios-flickrkit-err-code-95-msg-ssl-is-required)
