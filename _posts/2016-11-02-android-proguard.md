---
layout: post
title:  Proguard
category: android
keywords: [anroid,java,proguard]
---

Proguard ： Shrink(压缩) - Optimizer(优化) - Obfuscator(混淆) - Preverifier(预校验)，Proguard 基于模板的灵巧配置—— 仅需几行配置命令即可，以及其高效的性能都是其优势所在；

### Proguard：

> ProGuard is a Java class file shrinker, optimizer, obfuscator, and preverifier. The shrinking step detects and removes unused classes, fields, methods, and attributes. The optimization step analyzes and optimizes the bytecode of the methods. The obfuscation step renames the remaining classes, fields, and methods using short meaningless names. These first steps make the code base smaller, more efficient, and harder to reverse-engineer. The final preverification step adds preverification information to the classes, which is required for Java Micro Edition and for Java 6 and higher.


Proguard 在反射使用中的注意事项：  反射往往根据Class名称去获取实例，而 ProGuard会导致类名称变化，由此导致class文件名变化，进而导致反射错误，一般来说对于Proguard文件的配置时，你需要对你的代码有所了解，才能合理进行配置；


as中的 Proguard 配置：

{% highlight java %}

    minifyEnabled true
    proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    shrinkResources true // 是否去除无效的资源文件
    signingConfig signingConfigs.release


{% endhighlight %}


#### Entry Point

>  In order to determine which code has to be preserved and which code can be discarded or obfuscated, you have to specify one or more entry points to your code. These entry points are typically classes with main methods, applets, midlets, activities, etc.


#### Limitations：

需要注意的是，Proguard的优化并不能解决 NPE，Stack Over Flow，死循环等异常问题，其默认是正常运行的程序；同时需要指出的是，如果对文件进行混淆即最终生成文件而不生成jar等打包文件，在Window环境下，当包内文件过多时，会产生文件名为 aux.class 的混淆类文件，而该文件名在window环境下是受保护的，这样就产生了问题，所以最好混淆jar文件等打包文件；



### 注意事项

*  反射相关   

*  Gson相关 —— 序列化与反序列化

*  枚举

#### 混淆后的异常信息定位：

利用 proguard mapping文件定位问题；利用 retrace 脚本，mapping文件，以及 错误trace文件（文件中往往定位的代码是类似 a.b()这类混淆代码），通过构建

` ./tools/proguard/bin/retrace.sh   /app/build/outputs/mapping/release/mapping.txt   /stacktrace.txt`

还原stacktrace.txt为源代码—— 便于重新定位问题；


#### 实例

其他示例可以参照 Proguard官方文档 —— Examples


---

Quote:

[proguard 官方文档](http://proguard.sourceforge.net/)

[读懂 Android 中的代码混淆](http://droidyue.com/blog/2016/07/10/understanding-android-obfuscated-code-by-proguard/)

[ProGuard代码混淆技术详解](http://www.cnblogs.com/cr330326/p/5534915.html)

[混淆的另一重境界](https://mp.weixin.qq.com/s?__biz=MzAxNzMxNzk5OQ==&mid=2649485204&idx=1&sn=3e1fcbae5fc1abd222589ea1849185d9&chksm=83f82694b48faf82c8652254fc7774759dc91af8186e6a59b2f90e55b0e10d51c285756a8ff6&scene=0#rd)

[Google - Android Proguard](https://developer.android.com/studio/build/shrink-code.html)

