---
layout: post
title:  正则表达式
category: others
keywords: [improvement,others]
---

### 正则表达式

#### grep  


#### 特定字符匹配：

grep -n 'the'  file

#### 字符组匹配：

[]   []规则中的任意一个字符  -> 单字符匹配  [abc] 含有有abc中任意一个字符的

- 连字符表示字符范围,若所连接字符有序，要求前面字符码位小于后面字符

[^字符组] 排除字符组   [^a-z] -> 非a-z中的任意一个字符


#### 行首行尾符号：

'^[A-Z]'大写A-Z开头的字符  注意与 [^A-Z]（非A-Z的字符）的差异

'd$' 以d结尾的字符

'^#' 以#开头的字符串

'^$' 查找空行->过滤空行： grep  -v  '^$'  file   (-v) 反向输出，显示不符合匹配规则的行


#### 任意字符

. 任意一个字符    

* 重复*符号前面的0个或多个字符->a*   aa*  aaa*a的差异    

#### 限定连续字符范围   

a\{2-5\}  范围区间内的重复字符数目   查找2-5个a的连续字符串

a\{2\} 2个以上的重复字符数组  等同于  aaa*


#### 组合 sed命令

除了整行的处理模式之外， sed 还可以用行为单位进行部分数据的搜寻并取代。

sed 's/要被取代的字串/新的字串/g'

{% highlight bash %}

# qi @ macbaseimage108 in ~/Documents/Docs [12:11:02]
$ ifconfig  en0 | grep -n  'inet '
6:	inet 10.1.29.141 netmask 0xffffff00 broadcast 10.1.29.255

# qi @ macbaseimage108 in ~/Documents/Docs [12:11:14]
$ ifconfig  en0 | grep -n  'inet '  | sed '\s^.*inet\\'
sed: 1: "\s^.*inet\\": unterminated regular expression

# qi @ macbaseimage108 in ~/Documents/Docs [12:35:50] C:1
$ ifconfig  en0 | grep -n  'inet '  | sed 's/^.*inet//'
 10.1.29.141 netmask 0xffffff00 broadcast 10.1.29.255

# qi @ macbaseimage108 in ~/Documents/Docs [12:36:49]
$ ifconfig  en0 | grep -n  'inet '  | sed 's/^.*inet//' | sed 's/netmask.*$//'
 10.1.29.141

{% endhighlight %}

#### egrep 扩展正则表达式


 () : 表示找出群组字符串

$ egrep -n 'g(la|oo)d' regular_express.txt

也就是搜寻(glad)或 good 这两个字符串

+d /  ?d  重复规则


Try more ...

### About Regex

正则表达式作为一种编程语言，从功能上说是描述了一种高度抽象的匹配规则，字符串符合正则规则通常是指字符串或字符串的某部分符合该正则匹配规则；而从变成语言层面，正则表达式是具有语法规则的，其核心为顺序选择以及循环，如 \* 就代表着高度抽象的循环含义；

正是由于正则的高度抽象，抽象源于从实际中的分析，把握实质，逐步由简入深，提炼核心，提炼章法，再逐步循序渐进，事实上工程上的事情都需要有章法核心，不是简单的能用直观感觉去解决的，虽然不能排除天才的直觉，但是即便是天才相比也是浸淫已久才会偶然得之吧；

正则也是同理，需要不断的去训练，把握章法核心，理清得出正则的抽象过程，将复杂的问题逐步剥离开来，当这一章法不断重复强化之后，把握本质的能力也就随之得到了极大的提升；

---

Quote：

[在线正则表达式测试](http://tool.oschina.net/regex)

[linux sed命令详解](http://www.cnblogs.com/ggjucheng/archive/2013/01/13/2856901.html)

[刨根究底正则表达式之一：正则表达式概述](http://www.infoq.com/cn/articles/regular-expressions-introduction-part01?utm_source=articles_about_regular-expressions&utm_medium=link&utm_campaign=regular-expressions)

[正则表达式（一）：纠结的转义](http://www.infoq.com/cn/news/2011/01/regular-expressions-1?utm_source=news_about_regular-expressions&utm_medium=link&utm_campaign=regular-expressions)