---
layout: post
title:  Android Tips part (9)
category: android
keywords: [improvement,android,java]
---

### EditText ime 输入法 完成按钮的显示问题

EditText inputType= textMultiline 无法显示输入法中的完成按钮，事实上，textmultiline 是让用户输入大段文本的方式，用户当然也可以使用换行，此时换行return键，占用了完成button显示的位置，经过检验以下方式有效：


-  拦截 onkeydown事件，当用户点击 return换行时，拦截处理，做自己的业务逻辑，同时 return true消耗此次 输入事件；

- hack的方式：

{%  highlight java %}
// xml
android:imeOptions="actionDone"

//

mEditTextView.setSingleLine(true);
mEditTextView.setLines(3);
mEditTextView.setHorizontallyScrolling(false);
mEditTextView.setOnEditorActionListener(new TextView.OnEditorActionListener() {
    @Override
    public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
        if (actionId == EditorInfo.IME_ACTION_DONE) {
            onInputDownAction();
            return true;
        }
        return false;
    }
});


{% endhighlight %}


### 图片在系统中的大小？



图片在存放在系统中时，系统会根据图片格式的差异，利用对应图片格式的压缩规则对图片进行压缩,进而不同格式图片占用存储空间不一样，如何获取图片在内存中占用的空间大小？

{% highlight java %}

private Bitmap decodeResource(Resources resources, int id) {
    TypedValue value = new TypedValue();
    resources.openRawResource(id, value);
    BitmapFactory.Options opts = new BitmapFactory.Options();
    opts.inTargetDensity = value.density;
    Bitmap bitmap = BitmapFactory.decodeResource(resources, id, opts);
    Log.i("Bitmap", "size is " + bitmap.getRowBytes() * bitmap.getHeight());    return bitmap;
}


{% endhighlight %}

> 上述从资源中获取Bitmap对象的过程，并没有直接使用decodeResource(Resources res, int id)含带两个参数的方法，是为了避免由于图片存放在不同drawable或者mipmap文件夹下导致的内存占用不一致问题


注： 使用Bitmap自带的compress方法: 可以完成图片质量压缩



### Android 7.1 系统下的全局悬浮窗Crash问题

[Google也看不下去被玩坏的悬浮窗了么？](http://blog.bihe0832.com/android-toast.html)



### Gradle 缓存刷新

在我们使用自己维护的SDK时，我们常常用 Snapshot快照跳过版本的升级从而获取到最新的aar代码，但由于Gradle的缓存管理，经常会导致需要升级版本才能拉到最新的代码，这时我们可以指定缓存时间，强制每次sync拉取最新代码：

{% highlight java %}

configurations.all {
    // Check for updates every build
    resolutionStrategy.cacheChangingModulesFor 0, 'seconds'
}
dependencies {
    compile group: "group", name: "projectA", version: "1.1-SNAPSHOT", changing: true
    compile('group:projectA:1.1-SNAPSHOT') { changing = true }
}

compile('group:projectA:1.1-SNAPSHOT') { changing = true }

/*
* cacheChangingModulesFor is the key, changing: true is optional because it's implied by -SNAPSHOT,
* it's possible to use the shorthand here: compile 'group:projectA:1.1-SNAPSHOT' because of the above implication. One can also restrict the resolutionStrategy to one config: configurations.compile.resolutionS...
*
*/

{%  endhighlight %}


Ref： [How can I force gradle to redownload dependencies?](http://stackoverflow.com/questions/13565082/how-can-i-force-gradle-to-redownload-dependencies)

By the way： 事实上在对外发布SDK上即使是简单的BugFix也是应该升级Version的，随意的更新代码upload一来会使SDK管理失控，代码质量无法跟踪，每个版本的BugFix应该是清晰明确的，跟随着update历史记录，更重要的是也会让使用方变得混乱；


### 如何看待新的技术

RN的使用，RN的优劣势，如何看待新技术？
