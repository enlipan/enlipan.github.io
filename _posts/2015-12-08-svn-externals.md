---
layout: post
title: svn externals
category: network
---

Android Studio上`Svn externals`的配置较为方便，直接对SVN属性进行编辑，之后添加相应的属性即可。

externals外部属性，相当于一种链接资源引用，值得注意的是直接用浏览器打开Svn地址，无法看到外部属性资源引用，但是客户端若是安装了Svn客户端，则能够清晰的看到，外部引用与本地资源不同的目录标识。

外部属性适合用于共有Lib包的引用指定。
 
需要注意的是：在删除的时候，若是直接 del  某个工程目录下的某个外部文件，将会删除外部文件的源地址所在文件目录，是非常危险的。

正确的删除操作是：svn propdel svn:externals　　利用属性删除操作。


外部属性的添加：

针对某个工程目录：svn propedit svn:externals .可以自动打开属性编辑器：

我们可以添加相应的外部属性在本目录的目录文件名　与　源地址引用url

格式：dirName     url


---

Quote：



[外部定义](http://www.subversion.org.cn/svnbook/1.4/svn.advanced.externals.html)

[Svn externals使用-CSDN](http://blog.csdn.net/echoisland/article/details/6584875)

[属性](http://svndoc.iusesvn.com/svnbook/1.2/svn.advanced.props.html#svn.advanced.props.why)