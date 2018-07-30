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

* 代码分割  

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

* String   

* String 数组  

* 对象: 对象中的 key 代表 Chunk Name, 对象的 Value 可以是 String 或者 数组;

output 的配置: 

{% highlight javascript %} 

output: {
      path: __dirname + "/dist/js",
      filename:'[name]-[hash]-bundle.js'  
      // hash 为本次包 hash 值,多chunk 中使用 hash ,指的是同样的值
      // 对比 chunkhash ,chunkhash 为每个 chunk 对应的 hash 值,可认为是 chunk 版本标识,可以保证生成的 chunk 文件的唯一性.
      // 利用 chunkhash 可以标识文件的修改, 只有修改过的文件在重新打包时生成的 chunkhash 会变化,可用于项目中静态资源的管理,用于项目中上线修改过的文件
      filename:'[name]-[chunkhash]-bundle.js'
  }

{% endhighlight %}




---

Quote: 

[npm 模块安装机制简介](http://www.ruanyifeng.com/blog/2016/01/npm-install.html)




