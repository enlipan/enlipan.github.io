---
layout: post
title:  Okio
category: android
keywords: [anroid,io,java]
---

okio 是 java io 于 nio的有效补充；

ByteString: An immutable sequence of bytes.immutable有点类似String的不变性的意思，该二进制字节序列除了提供基本Api函数，还同时提供了二进制数据的一些转换功能；

Buffer: There's no obligation to manage positions, limits, or capacities.


Source 、Sink:

二者其功能上类似于 OutputStream 与 InputStream , io 中的 os 通过装饰包装提供各种类型的流数据，在使用时需要针对不同的数据类型选取不同的类进行业务处理，但其优势在于不再严格区分字节流与字符流，二者统一起来，可按照所需任意操作；同时Sink (Source)可以与 OutputStream(InputStream) 转换互相操作；


这几个核心类的使用中我们主要通过使用 Buffer 去做业务处理，Buffer实现了 BufferedSource, BufferedSink, Cloneable 三个接口，通过clone()我们可以轻易深拷贝一份 Buffer 完成流数据的copy，而不用像 io中流的读取后还需要重置，或者利用其它的手段去复制流，比较麻烦，这个 clone 函数也是我常用的函数；而通过实现 BufferedSource, BufferedSink（扩充 Source Sink的核心读写函数接口）则几乎提供了我们常用的所有Api，也就是input与output的函数都集合到了Buffer中，看看其函数列表还是比较庞大的；








---

Quote:

[ Android 善用Okio简化处理I/O操作](http://blog.csdn.net/sbsujjbcy/article/details/50523623)

[拆轮子系列：拆 Okio](http://blog.piasy.com/2016/08/04/Understand-Okio/)

[OkHttp3源码分析](http://www.jianshu.com/p/aad5aacd79bf)
