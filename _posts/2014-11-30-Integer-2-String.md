---
layout: post
title: Java整数和字符串转换
category: algorithm
---
#字符串转换整数：
　虽然有类似的Integer.parseInt()，但是笔试面试明显不会如此：
　　　　*转字符串可以考虑为：*
             1. 单个字符的转换
             2. 权值
    如：从前往后依次扫描，则每次扫描一个字符  前面数值*10；
　　　　　　如345，扫描3，再3\*10+4，再34\*10+5.从后往前扫描类似处理：
{% highlight java %} i=i++ system.out.println(i); {% endhighlight %}
　　　　　　
{%   highlight java   %}
　　
  class ParsInt{
        public static void main(String[] args) {        
        // TODO, add your application code           
        System.out.println(getInt("-1"));                
    }
        //从右向左扫描
        static int getInt(String  s){
            boolean isNeg=false;
            int num=0;
            int len=s.length();
            int i=0;
            if(s.charAt(0)=='-'){
                isNeg=true;
                i=1;
            }    
            int m=0;
            while(i<len){
                len--;        
                num=num+(s.charAt(len)-'0')*(int)Math.pow(10,m);                
                m++;
            }
            if(isNeg){
            num=-num;
            }
            return num;
        } 
}

{%  endhighlight   %}

*而数字转字符串可以考虑，取余数倒序输出单个字符：如345取余的数序是：5，4，3；*



