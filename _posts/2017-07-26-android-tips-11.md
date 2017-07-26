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


