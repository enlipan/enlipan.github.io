---
layout: post
title:  Okio
category: android
keywords: [anroid,io,java]
---

okio 是 java io 于 nio的有效补充；

### Source / Sink

二者其功能上类似于 OutputStream 与 InputStream , io 中的 os 通过装饰包装提供各种类型的流数据，在使用时需要针对不同的数据类型选取不同的类进行业务处理，但其优势在于不再严格区分字节流与字符流，二者统一起来，可按照所需任意操作；同时Sink (Source)可以与 OutputStream(InputStream) 转换互相操作；官方并不建议直接使用 Source/Sink,而推荐其封装 BufferSource/BufferedSink .

>  Most applications shouldn't operate on a source directly, but rather on a {@link BufferedSource} which is both more efficient and more convenient. Use {@link Okio#buffer(Source)} to wrap any source with a buffer.


{% highlight java %}

// io  与  okio转换
Okio.buffer(Okio.source(inputStream))-- > 层层包装获取功能强大的 BufferSource


{% endhighlight %}

### ByteString / Buffer

ByteString: An immutable sequence of bytes.immutable有点类似String的不变性的意思，该二进制字节序列除了提供基本Api函数，还同时提供了二进制数据的一些转换功能；

{% highlight java %}

//实现 序列化 以及 比较接口
public class ByteString implements Serializable, Comparable<ByteString> {


// Core
// ByteString 内部是final 字节数组存储不变数据，构建ByteString时利用，其of()工厂函数构造对象实例
final byte[] data;
// ByteString 的utf8编码常量
transient String utf8; // Lazily computed.

/** Returns a new byte string containing the {@code UTF-8} bytes of {@code s}. */
public static ByteString encodeUtf8(String s) {
  if (s == null) throw new IllegalArgumentException("s == null");
  ByteString byteString = new ByteString(s.getBytes(Util.UTF_8));
  byteString.utf8 = s; //引用了String 本身
  return byteString;
}

// ByteString 的 equals 代表该字节序列中每个字节都相等
@Override public boolean equals(Object o) {
  if (o == this) return true;
  return o instanceof ByteString
      && ((ByteString) o).size() == data.length
      && ((ByteString) o).rangeEquals(0, data, 0, data.length);
}

{% endhighlight %}

Buffer: There's no obligation to manage positions, limits, or capacities.


这几个核心类的使用中我们主要通过使用 Buffer 去做业务处理，Buffer实现了 BufferedSource, BufferedSink, Cloneable 三个接口，通过clone()我们可以轻易深拷贝一份 Buffer 完成流数据的copy，而不用像 io中流的读取后还需要重置，或者利用其它的手段去复制流，比较麻烦，这个 clone 函数也是我常用的函数；而通过实现 BufferedSource, BufferedSink（扩充 Source Sink的核心读写函数接口）则几乎提供了我们常用的所有Api，也就是input与output的函数都集合到了Buffer中，看看其函数列表还是比较庞大的；

BufferedSource 等的实现类 RealBufferedSource ，事实上也是包装了Buffer以及source，其核心逻辑以及Buffer代理；

Ps： 针对 source /sink 依旧等同 io中的input、output是针对数据到内存的方向判断（输入到内存，从内存输出）


Buffer 通过层层封装转换实现了 读写的一体化，将读写功能内聚到一起，便于随时读写的操作，同时其性能也是比较高效的：okio也因此成为 OkHttp io的核心，其response，缓存，压缩等处无处不在；

> Moving data from one buffer to another is fast. Instead of copying bytes from one place in memory to another, this class just changes ownership of the underlying byte arrays.

{% highlight java %}

// Core  -- 解释上诉引用文章
@Override public void write(Buffer source, long byteCount) {
   // Move bytes from the head of the source buffer to the tail of this buffer
   // while balancing two conflicting goals: don't waste CPU and don't waste
   // memory.
   //
   //
   // Don't waste CPU (ie. don't copy data around).
   //
   // Copying large amounts of data is expensive. Instead, we prefer to
   // reassign entire segments from one buffer to the other.
   //
   //
   // Don't waste memory.
   //
   // As an invariant, adjacent pairs of segments in a buffer should be at
   // least 50% full, except for the head segment and the tail segment.
   //
   // The head segment cannot maintain the invariant because the application is
   // consuming bytes from this segment, decreasing its level.
   //
   // The tail segment cannot maintain the invariant because the application is
   // producing bytes, which may require new nearly-empty tail segments to be
   // appended.
   //
   //
   // Moving segments between buffers
   //
   // When writing one buffer to another, we prefer to reassign entire segments
   // over copying bytes into their most compact form. Suppose we have a buffer
   // with these segment levels [91%, 61%]. If we append a buffer with a
   // single [72%] segment, that yields [91%, 61%, 72%]. No bytes are copied.
   //
   // Or suppose we have a buffer with these segment levels: [100%, 2%], and we
   // want to append it to a buffer with these segment levels [99%, 3%]. This
   // operation will yield the following segments: [100%, 2%, 99%, 3%]. That
   // is, we do not spend time copying bytes around to achieve more efficient
   // memory use like [100%, 100%, 4%].
   //
   // When combining buffers, we will compact adjacent buffers when their
   // combined level doesn't exceed 100%. For example, when we start with
   // [100%, 40%] and append [30%, 80%], the result is [100%, 70%, 80%].
   //
   //
   // Splitting segments
   //
   // Occasionally we write only part of a source buffer to a sink buffer. For
   // example, given a sink [51%, 91%], we may want to write the first 30% of
   // a source [92%, 82%] to it. To simplify, we first transform the source to
   // an equivalent buffer [30%, 62%, 82%] and then move the head segment,
   // yielding sink [51%, 91%, 30%] and source [62%, 82%].

   if (source == null) throw new IllegalArgumentException("source == null");
   if (source == this) throw new IllegalArgumentException("source == this");
   checkOffsetAndCount(source.size, 0, byteCount);

   while (byteCount > 0) {
     // Is a prefix of the source's head segment all that we need to move?
     if (byteCount < (source.head.limit - source.head.pos)) {
       Segment tail = head != null ? head.prev : null;
       if (tail != null && tail.owner
           && (byteCount + tail.limit - (tail.shared ? 0 : tail.pos) <= Segment.SIZE)) {
         // Our existing segments are sufficient. Move bytes from source's head to our tail.
         source.head.writeTo(tail, (int) byteCount);
         source.size -= byteCount;
         size += byteCount;
         return;
       } else {
         // We're going to need another segment. Split the source's head
         // segment in two, then move the first of those two to this buffer.
         source.head = source.head.split((int) byteCount);
       }
     }

     // Remove the source's head segment and append it to our tail.
     Segment segmentToMove = source.head;
     long movedByteCount = segmentToMove.limit - segmentToMove.pos;
     source.head = segmentToMove.pop();
     if (head == null) {
       head = segmentToMove;
       head.next = head.prev = head;
     } else {
       Segment tail = head.prev;
       tail = tail.push(segmentToMove);
       tail.compact();
     }
     source.size -= movedByteCount;
     size += movedByteCount;
     byteCount -= movedByteCount;
   }
 }

{% endhighlight %}

---

Quote:

[ Android 善用Okio简化处理I/O操作](http://blog.csdn.net/sbsujjbcy/article/details/50523623)

[拆轮子系列：拆 Okio](http://blog.piasy.com/2016/08/04/Understand-Okio/)

[OkHttp3源码分析](http://www.jianshu.com/p/aad5aacd79bf)
