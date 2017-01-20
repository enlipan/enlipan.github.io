---
layout: post
title:  Java Unicode 知识更新
category: java
keywords: [improvement,java]
---

最近遇到一些字符集相关的问题，由于没有有效整理，所以知识条理不够清晰，关于 Java中对于Unicode的处理需要理解的一些知识这里总结一下：

Basic Multilingual Plane (BMP)

supplementary character


high-surrogates range (U+D800 to U+DBFF)

low-surrogates range (U+DC00 to U+DFFF)






---

Quote:

[Lexical Structure](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.1)

[Supplementary Characters in the Java Platform](http://www.oracle.com/us/technologies/java/supplementary-142654.html)

[Class Character](http://docs.oracle.com/javase/6/docs/api/java/lang/Character.html#unicode)

[The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)

[字符编码笔记：ASCII，Unicode和UTF-8](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)

[彻底搞懂字符集和字符编码](http://hustcalm.me/blog/2013/04/06/che-di-gao-dong-zi-fu-ji-he-zi-fu-bian-ma-cooked-from-other-posts/)

[字符集和字符编码](http://www.cnblogs.com/skynet/archive/2011/05/03/2035105.html)
