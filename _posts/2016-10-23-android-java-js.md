---
layout: post
title:  WebView Java and Js
category: android
keywords: [anroid,webview]
---

Android 当前的业务节奏日渐复杂，各类营销活动以及时效性需求充斥着各类App，前段时间微信小应用最初的火爆很大一块就针对性的对于Android版本更新发版的痛苦以及原生应用的安装更新问题，H5与原生App混合嵌套开发应用可以很大程度上提高业务的灵活性，同时由于H5界面的浏览器响应式特性，一经发布即可快速推出到iOS以及Android双客户端，极大缩短相关业务开发发布时间抢占市场，同时由于H5页面的灵活性，可以随着各类节日以及营销活动快速变更，而无需同步双客户端的发版（尤其App市场的审核机制导致状态不可控）


### Android  与前端界面的互调沟通

前端与客户端团队之间定义好相关的协议之后，根据对应的协议可以互相通信，完成互调，其中大多业务应该是前端调用客户端提供的借口操纵客户端的相关界面以及业务逻辑，使应用逻辑完善，显得饱满，而让前端的界面不仅仅只是界面信息的展示，完成更多的客户端的功能。

当然，这时候我们需要确定页面来源的安全性，一旦页面来源出现问题，就相当于打开了自己应用的大门，任取任予，风险也是巨大的，这点就是在Google文档中Google反复提到的安全问题；

这里用一个实例描述双向的通信方式：

{% highlight java %}

public class MainActivity extends AppCompatActivity {

    WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        initViewState();
    }

    private void initViewState() {
        mWebView = (WebView) findViewById(R.id.wv_view);
        mWebView.setWebViewClient(new CustomerWebClient());
        mWebView.addJavascriptInterface(new WebViewInterface(this),"android");
        WebSettings webSetting = mWebView.getSettings();
        webSetting.setJavaScriptEnabled(true);

        mWebView.loadUrl("javascript:android.showAndroidToast(\"Android HaHaHa\")");

        Log.e("TAG",webSetting.getUserAgentString());
    }


    @Override
    public void onBackPressed() {
        if (mWebView.canGoBack()){
            mWebView.goBack();
        }else {
            super.onBackPressed();
        }
    }
}


///////////////////////////////////////////////////////////////////////////////

public class WebViewInterface {

    private Context mAcContext;

    public WebViewInterface(Context context){
        mAcContext = context;
    }

    @JavascriptInterface
    public void showAndroidToast(String toast){
        Toast.makeText(mAcContext, toast, Toast.LENGTH_SHORT).show();
    }
}


{% endhighlight %}





常见问题：

Uncaught ReferenceError: functionName is not defined  ——  js调用时，页面还未加载完成，js代码还未加载进入，可以通过复写 onPageFinish()函数，在函数中调用Js 相关函数；

---

Quote：

[Building Web Apps in WebView](https://developer.android.com/guide/webapps/webview.html)

[Android中Java和JavaScript交互](http://droidyue.com/blog/2014/09/20/interaction-between-java-and-javascript-in-android/index.html)

[Android中WebView页面交互](https://segmentfault.com/a/1190000004150350)
