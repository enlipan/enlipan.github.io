---
layout: post
title: SharePrefrence 细节
category: android
---
一般来说Android下数据的存储主要有 File文件存储，最近的动态模块就是用的File文件缓存，一种是SharePreference键值对数据存储，一种是数据库Sqlite数据持久化。

SharePrefrence似乎是这其中最简单最常用的使用，但是也有一些细节需要注意：

首先，SharePrefrence底层是利用Xml文件记录key-value键值对记录数据，该值的获取也就是通过解析Xml文件读取相对应的值，注意大量数据的读取带来的性能问题。

如：

{% highlight xml %}

<?xml version='1.0' encoding='utf-8' standalone='yes' ?>
<map>
    <int name="MainActivity" value="0" />
</map>

{%  endhighlight %}



全局： PreferenceManager.getDefaultSharedPreferences();

特定： getSharedPreferences (String name, int mode)


与之带来的问题就是 一个对应的key-value一旦指定，那么key所对应的值的类型就不能更改，之前存储的String 现在就不能再存Integer。否则会引起值类型转换错误。

需要指出的是：preferenceActivity 也是应用将值记录在Xml文件中。

记录一个Bug：

ListPreference  值类型的改变导致Crash。

ListPreference 默认记录了String-array 中的String item，改变对应listPreference key下的值为Integer，导致Crash。 （Integer cast String  Error  Crash）

从这里可以看出：

其本质应该是使用了 对应key 的一个 Preference 记录了 String （item）值，用新加入了数据取替换旧的数据，会校验数据类型，这样就导致了类型转换的Crash。



>  
>  If you change a preference type from ListPreference to CheckBoxPreference, whilst reusing the same key, then this bug will happen.
The Android framework will store some default data in your app's shared_prefs/preferences.xml file. These old values will be in the old format (such as Int or String, for ListPreference) instead of Boolean (for CheckBoxPreference).
WHen you load your preference activity, it will load this XML file automatically, and cause this crash.
The solution is to just edit this stored XML preference file (shared_prefs/preferences.xml) and remove the old values. Or just delete that XML file.


另一种解决这类冲突的解决方案是 先remove掉对应key下的值，再Add新的类型值进入，不过这不适合我遇到的需求。

最终我的解决方案是 定义一个新的Preference的key 记录对应item下的 index，也就是服务器需要的值，利用合适的规则去匹配业务逻辑也是比较清晰的。

总结一点：

很多解决方案都是立足于对应的合适需求的，没有完美的方案，只有最适合当前业务逻辑需求的方案，对情形做出合适的分析，再动手写代码是很重要的。

设计算法就分析服务器提供的数据规则，设计逻辑就分析需求与体验。从分析中找出合适的解决方案，而不是盲目动手最近去苏州支援所得到的一个最重要的体会。