---
layout: post
title:  Android Tips part (13)
category: android
keywords: [improvement,android,java]
---

### Gradle Tips

动态增加构建变量:

{% highlight groovy %}

    applicationVariants.all {
        variant -> variant.buildConfigField "String", "VARIABLE", "\"" + variant.getName() + "\""
    }

{% endhighlight %}

需要注意的是 String 的构建,否则会等同于引用变量,产生找不到符号变量的构建错误;如这里的 VARIABLE = debug 和 VARIABLE = "debug" 是有差异的;