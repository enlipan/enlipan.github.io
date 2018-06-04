---
layout: post
title:   Vue router
category: js
keywords: [improvement,web,js]
---

通常用路由控制加载资源是后端常用的一种处理方式,单页面应用借助路由,请求不同资源,加载不同组件,确定对应跳转方案

### 是什么

利用路由控制组件映射,告诉Vue Router 在何处渲染组件,路由所匹配的组件将在 Router-View 处渲染;

### 怎么用

{% highlight javascript %} 

// 导入 VueRouter   
Vue.use(VueRouter)
// 定义路由组件   
const User = {template : '<div><div>'}
// 定义路由 
const routers = [{path:'',components:[User]}]
// 创建 Router 实例  
new VueRouter{
    routers: routers
}
// 注册实例至 Vue 
new Vue({VueRouter}).$mount('#app')

{% endhighlight %}


#### 动态路由匹配 

* 对组件做模式匹配,某些条件写的所有路由全部匹配到某个组件(动态参数)   

{% highlight javascript %} 

//路由定义
router : {
    path: '/user/:id',
    component: User
}

// 组件定义  
const User = {
    template: '<div>User {{ $route.params.id }}</div>'
}


{% endhighlight %}

当多个路由匹配到同一个组件时,原来打开的组件实例会被重新使用,而不会重新调用组件的声明周期函数   

#### 嵌套路由  

利用 children 关键字设置嵌套 router-view 路由出口;

对于嵌套路由可以设置空 Path, 进而设置默认嵌套组件,否则在路由不匹配情况下嵌套路由出口不显示组件;

{% highlight javascript %} 

const router = new VueRouter({
  routes: [
    { path: '/user/:id', component: User,
      children: [
        // UserHome will be rendered inside User's <router-view>
        // when /user/:id is matched
        { path: '', component: UserHome },
                
        // UserProfile will be rendered inside User's <router-view>
        // when /user/:id/profile is matched
        { path: 'profile', component: UserProfile },

        // UserPosts will be rendered inside User's <router-view>
        // when /user/:id/posts is matched
        { path: 'posts', component: UserPosts }
      ]
    }
  ]
})


{% endhighlight %}

**注意: 以 / 开头的嵌套路径会被当作根路径。**

#### Router api  

Router 实例的相关API: 

*  Router.push({path:'',params:{}})  等同于点击 router-link to 标签      
*  Router.replace         
*  Router.go() 操作历史记录           
*

#### Router name  

路由别名设置,很多时候比 Path 更加优雅好用;   



### 前端路由 

*  hash 模式 

通过在 url 中解析对应的路由路径,然后动态的渲染出指定区域的 html 内容; 为了不在变动 url 时造成页面的刷新,全局的加载资源;

借助 `host/#/routerPath`   符号 # 之后的 Path 的变化不会导致浏览器像服务端发出请求,也就不会导致页面的刷新;借助 Path 变化时触发的 window.hasChange 事件监听路由变化,进而实现部分页面的内容变化;  


* history 模式

通过 H5标准中的 pushState / replaceState /popstate 事件,实现改变 url 而不触发页面刷新,进而可以实现单页面应用的路由控制;同时也避免了 url 中携带 #号的问题;
