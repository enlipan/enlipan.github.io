---
layout: post
title: ViewPager TabLayout
category: android
---

最近遇到了Google Design包中的一个Bug，很大一个坑，调试一天，查了一天。最后觉得自己分析问题的耐心要继续培养，检索资料的能力还有待继续锻炼。

搜索工具的便捷性反而让我们的搜索能力开始退化了，简单的输入几个词语敲入回车键，便开始一页页的自己查询，岂不知高级检索功能的利用能够事半功倍。

一个完整的信息检索应该包含问题内容主题关键字分析，提取关键字，分析其环境，选取合适的搜索工具，利用搜索工具所支持的高级搜索功能完成一次精确搜索。

此次遇到的问题是：

**TabLayout Tab绑定ViewPager之后的Tab不显示问题。**

最后发现是design22.2.1包之后开始出现的一个Bug，已经有反馈到Google Issu中去，同时给出了一些合适的解决办法，但是都有其特定的适应环境，公司的产品覆盖面大，所以必须保证完全适合4.0以上所有机型，2亿用户，即使概率非常低，一旦乘以用户基数，庞大的问题数量会导致及其恶劣的影响。


顺带看了一下`setUpWithViewPager();`,该方法自动适配TabLayout与ViewPager的联动，注意源码中适配时先清除所有已有Tab，利用ViewPagerAdapter中的getTitle(),为每一个Pager设定一个与之对应的Tab。

总的来说，Design包是一个好东西，简单的设置实现漂亮的效果，但是在使用过程中，由于项目的庞大，可能无法做出完美的适配，各种各样的兼容性问题都会出现，调试分析的能力才是王道。



---

Quote：

[Google-Issus](https://code.google.com/p/android/issues/detail?id=180462)
