---
layout: post
title:  Webpack 学习实践
category: javascript
keywords: [improvement,js]
---

### Webpack 简介 

前端项目打包工具 : 常见开发场景 React + ES6 + Webpack 组合开发;

用途: 

* 多 Module 构建为少数资源 bundle. 

* 代码分割 Code split 

* loader


理清 module 间的依赖关系,构建为 静态资源文件(浏览器可直接运行的 js/css/png 静态资源)

*  切分依赖树 - 按需加载               
*  减少初始化加载时间              
*  整合丰富的三方扩展库               
*  丰富的自定义能力              

webpack 与众不同的特性: 

* 代码分割  - 添加代码分割点

* Loader        

* Plugin 插件系统


### Webpack 命令使用



{% highlight javascript %} 

npm init  


npm install webpack --save-dev 
// npm 安装过程 
//1.发出npm install命令
//2.npm 向 registry 查询模块压缩包的网址
//3.下载压缩包，存放在~/.npm目录
//4.解压压缩包到当前项目的node_modules目录



// npm 403 问题,注意可能源管理 ~/.npmrc (推荐利用 nrm 管理源)
//-S, --save: Package will appear in your dependencies.
//-D, --save-dev: Package will appear in your devDependencies.
//-O, --save-optional: Package will appear in your optionalDependencies.

// 命令调试打包输出
webpack  hello.js -o  hello.bundle.js --mode development

// npm 安装 loader 处理特定文件 css..
require('css-loader!./style.css');
// css-loader 赋予 webpack 处理 css 的能力

// style-loader 处理 - 处理成功的 bundle 被引入, css 会被插入进入标签
require('style-loader!css-loader!./style.css');


// 利用命令行处理,省略 require 指定   --module-bind 
webpack  hello.js -o  hello.bundle.js --mode development --module-bind  'css=style-loader!css-loader'

// webpach 热加载 
--watch 

// 其他有用命令
--progress
--display-modules
--display-reasons


{% endhighlight %}


### webpack 配置文件

// webpack cli 
CLI 默认使用项目中的 webpack.config.js 配置文件 , 可以在 cli 中使用 --config 指定配置文件.  

配置文件说明: 

entry : 入口文件  

output: 输出文件 

{% highlight javascript %} 

  // __dirname 代表当前文件目录
  output: {
      path: __dirname + "/dist/js",
      filename: 'bundle.js'
  }


{% endhighlight %}


如何指定配置文件配置的 webpack 配置? 配合 npm package.json scripts 自定义脚本实现,配置 webpack 命令实现真实的 webpack 命令; 


{% highlight javascript %} 

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "webpack": "webpack --config webpack.config.js --progress --display-modules --colors --display-reasons"
  }


{% endhighlight %}


#### webpack 配置文件 entry output 详解

entry 与 chunk ? 

entry : 指定 App 的入口文件,也就是依赖树的顶端文件, 而 chunk 则表示代码块,被 entry 所依赖的额外代码块,依赖最终被收集打包输出,可包含一个或者多个文件,chunk 常用于代码的分割与合并,chunk 最终将被构建为 bundle 输出.


根据 chunk 类型分为:  

* entry chunk 

* normal  chunk



node js 使用 webpack 的函数形式, 通过 webpack 的构建函数;

{% highlight javascript %} 

webpack {
    {
        // config
    },
    callback
}

{% endhighlight %}


entry 的三种配置方式: 

* String - 如果是单页面应用, chunk 被默认命名为 main      

* String 数组  

* 对象: 对象中的 key 代表 Chunk Name, 对象的 Value 可以是 String 或者 数组,描述 chunk 的入口依赖起点; 此类型通常针对多页面应用;

output 的配置: 

{% highlight javascript %} 

output: {
      path: __dirname + "/dist/js",
      filename:'[name]-[hash]-bundle.js'  
      // hash 为本次包 hash 值,多chunk 中使用 hash ,指的是同样的值
      // 对比 chunkhash ,chunkhash 为每个 chunk 对应的 hash 值,可认为是 chunk 版本标识,可以保证生成的 chunk 文件的唯一性.
      // 利用 chunkhash 可以标识文件的修改, 只有修改过的文件在重新打包时生成的 chunkhash 会变化,可用于项目中静态资源的管理,用于项目中上线修改过的文件
      filename:'[name]-[chunkhash]-bundle.js',

      // output 打包线上cdn 使用  
      publicPath : 'https://cdn.com/'
  }

{% endhighlight %}


#### 项目中 html 的生成 

针对项目中 webpack 构建生成的 bundle 带入了版本号的文件名,如何将动态生成的不定文件名引入到 html 中?  

通过一问题引入 Plugin 的使用: 实现 html 的动态构建.

Plugin 生成的目录与 webpack 的构建 output 目录相同: 

{% highlight javascript %} 

module.exports = {
  entry: [__dirname + '/src/scripts/main.js',__dirname + '/src/scripts/a.js'],
  output: {
      path: __dirname + "/dist",
      filename:'js/[name]-[chunkhash]-bundle.js'
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index-[hash].html',
      template: 'index.html', 
      inject: 'head'
    })
  ]
}

{% endhighlight %}



#### Webpack 传值问题       

wenpack 属性传值与插件特性使用: 

插件的 require 定义: 

{% highlight javascript %} 
// 写法1 正常 
const HtmlWebpackPlugin = require('html-webpack-plugin'); //installed via npm
const webpack = require('webpack'); //to access built-in plugins
plugins: [
    new HtmlWebpackPlugin({
      filename: 'index-[hash].html',
      template: 'index.html', 
      inject: 'head',
      title: 'hello world',
      date : new Date()
    })
  ]
// 但省略  const webpack = require('webpack'); //to access built-in plugins 则报错,找不到定义 


// 写法2 正常 
htmlWebpackPlugin = require('html-webpack-plugin');
   plugins: [
    new htmlWebpackPlugin({
      filename: 'index-[hash].html',
      template: 'index.html', 
      inject: false,
      title: 'hello world',
      date : new Date(),
      minify: {
        removeComments: true,
        collapseInlineTagWhitespace: true
      }
    })
  ]

{% endhighlight %}


#### 多页面应用构建  

多 Chunk 利用各自的 loader 独立构建;

利用模版引擎中的特性去区分页面;

利用 htmlWebpackPlugin 中的 chunks 属性指定 html 页面与生成的 chunk 对应构建.    

script inline 优化(将 script 脚本植入 index 省略 src 引入的网络请求,优化加载速度)

{% highlight javascript %} 
   
   // 利用 compilation.assets[] 获取本地文件内容
   htmlWebpackPlugin.files.chunks.main.entry.substring(htmlWebpackPlugin.files.publicPath.length) // 获取不带 publicPath 的chunk 文件输出地址路径 --- chunk 的 entry 就是 chunk 输出的地址.
    
    <%= compilation.assets[htmlWebpackPlugin.files.chunks.main.entry.substring(htmlWebpackPlugin.files.publicPath.length) ]%>

   
{% endhighlight %}   


#### Loader 

Loader 针对打包过程中对于各类源文件的处理.

Plugin 针对则对整个构建过程作用.  











---

Quote: 

[npm 模块安装机制简介](http://www.ruanyifeng.com/blog/2016/01/npm-install.html)

[webpack-demos](https://github.com/ruanyf/webpack-demos#demo01-entry-file-source)

[入门 Webpack，看这篇就够了](https://segmentfault.com/a/1190000006178770#articleHeader9)

[Webpack your bags](https://github.com/starduliang/blog/blob/master/2016.6/webpack%20your%20bags.md)

[基于webpack搭建前端工程解决方案探索](http://www.infoq.com/cn/articles/frontend-engineering-webpack)

[细说 webpack 之流程篇](http://taobaofed.org/blog/2016/09/09/webpack-flow/)

[webpack代码分割技巧](https://foio.github.io/wepack-code-spliting/)
