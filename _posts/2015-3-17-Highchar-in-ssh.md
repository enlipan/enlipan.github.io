---
layout: post
title: HighChart In SSH
category: java
---

### Highchart与SSH框架整合

### Highchart

`Highchar`是一款前端图形显示插件，商业收费，个人免费——用于数据图形化显示处理。目前相对来说功能一般，百度的前端插件`Echart`可能是更好的选择，本着不半途而废的情况下，把自己系统里面的这个插件模块完成。

#### 整合核心

Web应用的核心就是数据流的流转，如何从数据库到前端，从前端到后台的交互。牢记这一核心，万变不离其宗。

那么`Highchart`的整合实际就是如何导出数据库后台数据到前台，按照要求封装到`Highchart`中，也就是后台前台的数据交互问题。

#### 整合步骤

##### 1.完成后台数据封装导出
这一部分是后台问题，一直想用SpringMVC重构系统来着，论文写起来麻烦死了，真不知道自己那篇EI检索咋写出来的。看来重构到毕业是完成不了了，继续在SSH上完成这一任务了。

后台DAO层，完成数据的查找，这数据库设计的太范式化了，这个查找多表联合效率也是实在慢，暂时学院数据量也不大，性能还凑合。自己先写了个Sql，测试数据查找没问题。再转换成HQl也还OK。

Highchar的数据封装问题

{% highlight java %}
class Highchar{
private String name;
private ArrayList<Integer> data;
Setter and Getter
}
{% endhighlight %}

研究一下Highchart的文档就可以看出，其需要数据是一个数据List和一个图像名称。系统中图像有多个柱状图。那就返回`List<Highchar>`,将完整的数据链返回，前台解析。

##### 2.完成前台数据接收并嵌入`Highchart`

前台数据接收，考虑两点，一页面的跳转；二是页面跳转之后加载`Javascript`显示图像。在此利用`AJax`，由于Highchart要利用`JQuery`，那么前台直接利用框架：

{% highlight javascript %}
$(document).ready(function(){    
   //alert("start – loading");      
   //AJAX方式      
   $.ajax({      
      type:"GET",      
      url:"../dataJob.sr",
      dataType:"json",      
      success:function(strJson) {
      接收并且数据解析 
        $('#container').highcharts({
            ... 
            series: [ {
            ...
            嵌入数据name和list           
{% endhighlight %}  

##### 3.显示效果

{:.center}
![效果图](http://javaclee.com/assets%2Fimg%2F20150319%2Fconcern_compete.png)

>顺便看了下jekyll插入图片的方法，并实践成功，Got it
