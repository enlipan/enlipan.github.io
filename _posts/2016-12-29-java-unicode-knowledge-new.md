---
layout: post
title:  字符集与编码知识
category: java
keywords: [improvement,java,unicode]
---

![字符集与字符编码](http://qpncgsvxc.bkt.gdipper.com/20190501230537.png)


最近遇到一些字符集相关的问题，由于没有有效整理，所以知识条理不够清晰，关于 Java中对于Unicode的处理需要理解的一些知识这里总结一下：

### 基础概念

Basic Multilingual Plane (BMP)

supplementary character —— Java 平台中的增补字符,Java采用16位Unicode编码，最初 Unicode被设计为16位固定长度的编码字符集，但16位最多表示65536个字符，事实证明16位不足以表示全球所有字符，那些超过原始16位的字符成为增补字符


其中，有高低位之分：

- high-surrogates range (U+D800 to U+DBFF)

- low-surrogates range (U+DC00 to U+DFFF)

以下引用[**Supplementary Characters in the Java Platform**]一段很精辟的原文，用很精确的描述解释了编码，字符集等概念：

>  Code Points, Character Encoding Schemes, UTF-16: What's All This?
>  
> The introduction of supplementary characters unfortunately makes the character model quite a bit more complicated. Where in the past we could simply talk about "characters" and, in a Unicode based environment such as the Java platform, assume that a character has 16 bits, we now need more terminology. We'll try to keep it relatively simple -- for a full-blown discussion with all details you can read Chapter 2 of The Unicode Standard or Unicode Technical Report 17 " Character Encoding Model." Unicode experts may skip all but the last definition in this section.
>
> A character is just an abstract minimal unit of text. It doesn't have a fixed shape (that would be a glyph), and it doesn't have a value. "A" is a character, and so is "€", the symbol for the common currency of Germany, France, and numerous other European countries.
>
> A character set is a collection of characters. For example, the Han characters are the characters originally invented by the Chinese, which have been used to write Chinese, Japanese, Korean, and Vietnamese.
>
> A coded character set is a character set where each character has been assigned a unique number. At the core of the Unicode standard is a coded character set that assigns the letter "A" the number 0041 16 and the letter "€" the number 20AC 16. The Unicode standard always uses hexadecimal numbers, and writes them with the prefix "U+", so the number for "A" is written as "U+0041".

>  Code points are the numbers that can be used in a coded character set. A coded character set defines a range of valid code points, but doesn't necessarily assign characters to all those code points. The valid code points for Unicode are U+0000 to U+10FFFF. Unicode 4.0 assigns characters to 96,382 of these more than a million code points.
>
> Supplementary characters are characters with code points in the range U+10000 to U+10FFFF, that is, those characters that could not be represented in the original 16-bit design of Unicode. The set of characters from U+0000 to U+FFFF is sometimes referred to as the Basic Multilingual Plane (BMP). Thus, each Unicode character is either in the BMP or a supplementary character.
>
> A character encoding scheme is a mapping from the numbers of one or more coded character sets to sequences of one or more fixed-width code units. The most commonly used code units are bytes, but 16-bit or 32-bit integers can also be used for internal processing. UTF-32, UTF-16, and UTF-8 are character encoding schemes for the coded character set of the Unicode standard.
>
> UTF-32 simply represents each Unicode code point as the 32-bit integer of the same value. It's clearly the most convenient representation for internal processing, but uses significantly more memory than necessary if used as a general string representation.
>
> UTF-16 uses sequences of one or two unsigned 16-bit code units to encode Unicode code points. Values U+0000 to U+FFFF are encoded in one 16-bit unit with the same value. Supplementary characters are encoded in two code units, the first from the high-surrogates range (U+D800 to U+DBFF), the second from the low-surrogates range (U+DC00 to U+DFFF). This may seem similar in concept to multi-byte encodings, but there is an important difference: The values U+D800 to U+DFFF are reserved for use in UTF-16; no characters are assigned to them as code points. This means, software can tell for each individual code unit in a string whether it represents a one-unit character or whether it is the first or second unit of a two-unit character. This is a significant improvement over some traditional multi-byte character encodings, where the byte value 0x41 could mean the letter "A" or be the second byte of a two-byte character.
>
> UTF-8 uses sequences of one to four bytes to encode Unicode code points. U+0000 to U+007F are encoded in one byte, U+0080 to U+07FF in two bytes, U+0800 to U+FFFF in three bytes, and U+10000 to U+10FFFF in four bytes. UTF-8 is designed so that the byte values 0x00 to 0x7F always represent code points U+0000 to U+007F (the Basic Latin block, which corresponds to the ASCII character set). These byte values never occur in the representation of other code points, a characteristic that makes UTF-8 convenient to use in software that assigns special meanings to certain ASCII characters.


概括来说，计算机内部只有二进制编码，是01的世界，如何将现实世界中的各类字符对应到计算机中就是字符编码所解决的问题，从最初的ASC编码，解决英文字符与二进制位之间的映射关系开始，后期随着全世界计算机的使用，各国所使用的计算机都开始推行各国自己的编码方式，这就造成一个问题，计算机的01编码的确定性与各国编码定义值重复问题，一旦字符集不对应则计算机显示错误，所以早期的文件要想正确解读就要知道文件对应的编码方式用指定的编码方式去打开才能正确显示，这给信息的流通带来巨大的问题；

Unicode 万国码为解决这一问题诞生，Unicode收集世界所有符号，将其纳入其中以对应方式编码成二进制，从而将世界上所有字符在对应unicode编码方式下有了唯一对应的二进制码，这样一来大家全部用万国码就不需要关注文件的方式，乱码问题随之解决；

正如上文所说，Unicode只定义了字符对应的二进制编码的值，也就是知道值可以通过“查字典”的方式反查进而确定字符究竟是哪一唯一字符，但是却并未定义这些值如何再计算机中存储以及传输，多个字符连续在一起时如何分割字符？也就是如果收到一串010100101001，字符从哪里开始又到哪里结束？

UTF-32定义了每4个字节一个字符，UTF16定义每16个字节一个字符二者都属于多字节定长码，为了区分字节的顺序又引入了BOM，也就是大小端去解决了字节序问题；但是对于世界范围内使用最广泛的英文字符的有巨大的字节浪费，随后变长码UTF8编码的则解决这一问题；


---

Quote:

[Lexical Structure](https://docs.oracle.com/javase/specs/jls/se7/html/jls-3.html#jls-3.1)

[Supplementary Characters in the Java Platform](http://www.oracle.com/us/technologies/java/supplementary-142654.html)

[Class Character](http://docs.oracle.com/javase/6/docs/api/java/lang/Character.html#unicode)

[The Absolute Minimum Every Software Developer Absolutely, Positively Must Know About Unicode and Character Sets (No Excuses!)](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/)

[字符编码笔记：ASCII，Unicode和UTF-8](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html)

[彻底搞懂字符集和字符编码](http://hustcalm.me/blog/2013/04/06/che-di-gao-dong-zi-fu-ji-he-zi-fu-bian-ma-cooked-from-other-posts/)

[字符集和字符编码](http://www.cnblogs.com/skynet/archive/2011/05/03/2035105.html)
