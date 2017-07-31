---
layout: post
title:  Android Tips part (11)
category: android
keywords: [improvement,android,java]
---

### RN

#### 构建React组件

{% highlight javascript %}


class ItemComponentView extends Component {

    state = {expanded: false};

    static propTypes = {
        model: React.PropTypes.object.isRequired,
        title: React.PropTypes.string
    };

    static defaultProps = {
        model: {
            id: 0,
        },
        title: 'Paul',
    };

    constructor() {
        super();
        /**
         * 组件的this 绑定
         * @type {function(this:ItemComponentView)}
         */
        this.handleExpanded = this.handleExpanded.bind(this);
        this.handleNameShowBind = this.handleNameShowBind.bind(this);
    }

    /**
     *  setState 批量收集"一波"State状态变换（Batch思想）,统一进行异步处理
     *
     *  所以 setState之后可能不会立即进行状态的变换处理；
     *
     *  为了让setState的状态变化立即生效而使用：
     *          引用上一个状态值更改当前状态值
     *  this.setState({stateProp: !prevState.stateProp})
     */
    handleExpanded() {
        this.setState({expanded: !this.state.expanded});
        console.warn(this.state.expanded);
    }

    handleNameShowBind(params) {
        console.warn('Bind:' + params);
    }

    handleNameShow = (params) => {
        console.warn(params);
    };

    render() {
        return (<View>
                {/*多属性组件，合理排版格式进行属性分割*/}
                <Button
                    /*避免 onPress = {()=>{}} 这样的写法，
                    每次父View render就会构建一个新的 匿名Function赋予Button组件，
                    而Button是一个React组件，进而又会导致组件的 re-render,
                    除此之外，不使用闭包处理会使调试更加方便
                    */
                    onPress={this.handleExpanded}
                    title="PressMe"
                    color="#841584"
                />
            </View>
        );
    }

}

/**
 * Function Components = 无状态，无函数的纯组件
 *
 * 组件作为函数，其Fucntion参数就是其 props，
 *
 * 通过设定合理的初始状态进行赋值；==》 推荐使用这类组件
 */
function ExpandableForm(expandedState) {
    const Style = expandedState ? {height: 100} : {height: 0};
    return (<View>
        <Button style={Style}
                title="Press"/>
    </View>)
}

export default ItemComponentView;

{% endhighlight %}

**From:**

[学习编写 React 组件的“最佳实践”](https://zhuanlan.zhihu.com/p/27825741)


### ADB

#### ANR File 获取

ANR traces.txt 文件位于的位置直接 pull 会有权限问题,通常我们可以使用以下几种方式去获取:

{% highlight bash %}

//1.Copy and pull
adb shell "cp /data/anr/traces.txt /storage/extSdCard/" 
adb pull /storage/extSdCard/traces.txt

//2.重定向  直接输出到本地
adb shell "cat /data/anr/traces.txt"  > /tmp.txt  

{% endhighlight %}

通常我喜欢用第二种

#### 开启 View 的 Override 过度绘制

一般我们开启 View 的重绘检测需要进入开发者选项中找到对应的选项进而开启或者关闭,非常麻烦,事实上这一开启有对应的adb 命令:

{% highlight bash %}
// 开启过度绘制检测
$ adb shell setprop debug.hwui.overdraw show 

// 关闭
$ adb shell setprop debug.hwui.overdraw false

{% endhighlight %}

利用 alias 构建快捷命令非常有用,值得注意的是该命令的开关需要有页面的重绘后生效,比如有页面的跳转之类;

### 性能  

TextView 显示长文本 Item 卡顿问题?

Layout 家族:

Layout 是负责 TextView 的 text显示的抽象类,其具体实现有3个子类, BoringLayout,DynamicLayout,StaticLayout- 分别负责 单行文本显示,动态 SpannableString 显示以及多行**静态**内容显示;

核心 `TextView.makeSingleLayout`.

TextView 中的许多操作实际上是比较耗时的,最近在优化一个搜索 Adapter 的显示时就遇到了 TextView 绘制长文本卡顿的问题,在网络上搜寻发现有较多人遇到这类问题,比如构建类似朋友圈列表 Item 时显示大量 emoji 表情, SpannableString 的绘制卡顿,以及阅读类 App 的滚动卡顿等等,这在打开 GPU 绘制的条形图时能够看到明显的掉帧现象出现,本质还是绘制时间超过了 16ms;

[RENDERING TEXT WITHOUT SKIPPING FRAMES ON](http://matthewwear.xyz/rendering-text-faster/)

[TextView预渲染研究](http://ragnraok.github.io/textview-pre-render-research.html)

[StaticLayout 源码分析](http://jaeger.itscoder.com/android/2016/08/05/staticlayout-source-analyse.html)


[TextView性能瓶颈](http://www.jianshu.com/p/9f7f9213bff8)

[localgit](https://github.com/wangwei2014/localgit/blob/master/OptimizeText/src/com/ww/optimize/TextAdapter.java)