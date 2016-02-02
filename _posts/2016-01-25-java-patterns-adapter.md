---
layout: post
title: Java 模式- 适配器
category: java
---

### 适配器模式


{:.center}
![Adapter](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20160203/Adapter.PNG)

当使用现有类而接口却不符合需求时，考虑适配器模式；适配器被用于接口转换，使客户端逻辑不用更改而完成新的接口适配 —— 通常做法是将对象包装转换其暴露接口，进而完成接口转换，最终达到原本不兼容的类可以进行组合实现相应业务逻辑；


{% highlight java %}

interface IAmericaPowerSource {

    void doChargingByThreeOutlet();

}

interface IChinaPowerSource {

    void doChargingByTwoOutlet();
}

public class AmericaPowerSource implements IAmericaPowerSource {
    @Override
    public void doChargingByThreeOutlet() {
        System.out.printf("America Charging ");
    }

}

public class ChinaPowerSource implements IChinaPowerSource {
    @Override
    public void doChargingByTwoOutlet() {
        System.out.printf("China Charging");
    }
}

/**
 * 适配器包装转换对象，完成接口转换
 */
public class ChinaAdapter implements IChinaPowerSource{

    IAmericaPowerSource americaPower;

    ChinaAdapter(IAmericaPowerSource americaPower){
        this.americaPower = americaPower;
    }

    public void changeTwoOutletToThree(){
        System.out.printf("Change Outlet ...");
    }

    @Override
    public void doChargingByTwoOutlet() {
        changeTwoOutletToThree();
        americaPower.doChargingByThreeOutlet();
    }
}

/**
 * Client 客户端并不关心具体实现，根据传入对象自动适配
 */
public class Client {   

    @Test
    public void  adapterTest(IChinaPowerSource chinaPower){
        chinaPower.doChargingByTwoOutlet();
    }

}

{% endhighlight %}

可以看出，通过适配器，我们成功将原本不兼容的美国接口，转换为中国接口，客户端函数无需做更改就可完美适配新的接口函数，这种方式也是比较好的实现了客户端的接口解耦，适配器将改变的部分封装转换，以便让客户端不必做出对应的更改，即可直接调用，达到了对外可扩展的目的；

具体可以参照Java 中 旧的枚举器与新的迭代器；

适配器模式并不复杂，抓住核心，为了复用客户端已完成的接口调用逻辑而包装新的接口，进而完成适配；

同时应该了解双向适配器，将新的接口适配到老客户端的同时转换老接口道新客户端，完成双向转换通信；


### 外观模式

外观模式通过提供一个统一的高层接口，用于访问子系统的接口群，将庞大的接口系统组合成新的高层接口实现，简化客户端调用；

外观模式的核心思想依旧是包装转换，只不过外观模式根据最少知识原则 —— 更强调隐藏实现细节，而只关心所真正需要的核心业务逻辑，进而减少对象之间的交互；这些对于复杂的业务逻辑封装是很有用的；

组合优于继承，HasA  比 IsA 可扩展性更强；




**todo**



