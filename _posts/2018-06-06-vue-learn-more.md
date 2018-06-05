---
layout: post
title:   前端进阶知识(1)
category: js
keywords: [improvement,web,js]
---

#### require.ensure()

* @ 等价于 /src 目录

默认情况下,打包时会将所有 js 代码统一打包为一个 bundle,导致加载较慢,而按需加载(懒加载),将庞大的 js bundle 分离进而在SPA运行时按需加载,提升运行时加载速度;  

> 把一些js模块给独立出一个个js文件，然后需要用到的时候，在创建一个script对象，加入
到document.head对象中即可;

{% highlight javascript %} 
  //获取 文档head对象
  var head = document.getElementsByTagName('head')[0];
  //构建 <script>
  var script = document.createElement('script');
  //设置src属性
  script.async = true;
  script.src = "http://map.baidu.com/.js"
  //加入到head对象中
  head.appendChild(script);

{% endhighlight %}


利用 webpack 的Code Splitting将代码分割为 Chunk;通过在代码编写时介入后期的代码编译分片过程;

{% highlight javascript %} 

// 利用 webpack 进行代码分片  
require.ensure([],
function(require){
    require('@/js/a)
},
chunkName
)
//a.js 文件被打包为单独的 chunk 文件,当指定了 chunkName 时则带有该名称标识;

// 当 require 多个文件,则将多个文件打包合并,如下 a/b/c 合并  
require.ensure([],
function(require){
    require('@/js/a)
    require('@/js/b)
    require('@/js/c)
},
chunkName
)

// webpack include 预加载 (懒执行)
// 也就是指定ensure所依赖的其他模块代码
require.ensure([],
function(require){
     require.include('@/js/a');//js 代码加载
     require('@/js/a')  // js 代码引入执行
},
chunkName
)

{% endhighlight %}

[Code Splitting 按需加载](http://www.alloyteam.com/2016/02/code-split-by-routes/)

[webpack代码分离 ensure 看了还不懂，你打我](https://cnodejs.org/topic/586823335eac96bb04d3e305)


#### Webpack 





#### JS 内存管理  



[JavaScript 内存机制](https://juejin.im/post/5b10ba336fb9a01e66164346)

