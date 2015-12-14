---
layout: post
title: WebView指定网页输入框获取焦点
category: android
---

今天研究一个小特性WebView加载指定网页后，IME输入框直接弹出,并且获取网页中指定input焦点，达到可直接输入的一体化目的：

其实核心代码就是：

{% highlight Java %}

 /**
     * 辅助WebView处理各种通知与请求事件
     */
    class CustomWebClient extends WebViewClient{

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }

        /**
         * Obj.focus()方法需要延时调用，
         * 并不等于说我们input文本框呈现出来就可以立即设置focus焦点，
         * 大部分情况下这样做也许可以成功，但是多测试几次你会发现有时焦点并不能成功设置，
         * 这里的原因是某些浏览器在input文本框渲染完成后不能立即为文本框启用获得焦点的特性，
         * 所以我们需要做一定的延时，在JavaScript里延时的方式是通过setTimeout函数，
         * 时间设置大概在200毫秒即可（参考WordPress的后台登录）
         *
         * /id  https://www.baidu.com/  移动转码  m.baidu.com 输入框id :index-kw
         * /id  http://cn.bing.com/    输入框id : sb_form_q
         */
        @Override
        public void onPageFinished(WebView view, String url) {
            mWebView.loadUrl("javascript:setTimeout( function(){ try{ var t = document.getElementById('sb_form_q');t.focus();t.select();}catch(e){}},500);");
        }
    }


{%  endhighlight %}

没什么其他的要讲的，核心是Js代码；


---


Quote：

[WebView textarea doesn't pop up the keyboard](http://stackoverflow.com/questions/3460915/webview-textarea-doesnt-pop-up-the-keyboard)\

[JavaScript让登录或搜索文本框自动获得焦点](http://wangye.org/blog/archives/150/)