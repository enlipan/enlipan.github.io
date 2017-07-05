---
layout: post
title: Java 反射再谈
category: android
keywords: [java, android]
---

Java的反射机制允许通过Api在运行过程中获取一直Class名称类的内部信息，通过Class信息进而操纵该Class，包括创建对象，调用对象函数。

### 反射 - ref包相关

先展示一个示例：


{% highlight java %}

public static void main(String[] args) {
    try {
        Constructor<ManPoJo> constructor = makeObjByClass("com.ref.lee.ManPoJo",String.class, String.class);
        System.out.println(constructor.newInstance("lee","18").toString());
        System.out.println(String.valueOf(Modifier.isPublic(constructor.getModifiers())));
        System.out.printf(makeObjByClass("com.ref.lee.ManPoJo",String.class).newInstance("sh").toString());
    } catch (Exception e) {
        e.printStackTrace();
    }
}

private static Constructor<ManPoJo> makeObjByClass(String className,Class... args) throws ClassNotFoundException, NoSuchMethodException, IllegalAccessException, InvocationTargetException, InstantiationException {
    Constructor<ManPoJo> constructor = (Constructor<ManPoJo>) Class.forName(className).getDeclaredConstructor(args);
    return constructor;
}


{% endhighlight %}

* getDeclaredConstructor ：Declared类型的get会获取类自身所声明的所有对应函数，包含public，protected，default,private,但无法获取继承的属性或函数 —— 本类定义

* getConstructor: 获取 public 的对应方法签名的构造函数

我们知道类的描述信息包含行为和属性，除构造函数以外还有Feild用于描述类的成员变量，Method用于描述类的行为函数。

在此之外还有 java.lang.reflect.Modifier 用于获取类，函数和字段的描述信息，如是否是 private,是否是 final 等等，以及 java.lang.reflect.Array 用于对于数组的动态操作。


### can not access a member of class

* AccessibleObject

Cosntructor、Method、Feild都是该AccessibleObject类的子类，默认情况下，Java语言机制将会对于 public, default (package), protected, private 访问域的 Method，Feild，Constructor这些对应反射对象将在被用于 get、set以及method invoke时进行访问控制检验，这时我们可以通过 setAccessible(),来控制访问 flag，取消Java语言机制中所默认的访问控制检查； —— By default, a reflected object is not accessible.

对于反射的使用需要控制，反射灵活，但即使当前随着JVM的不断优化，反射性能已有较大提升，但是反射使用与常规的使用性能上有数量级的差异，在移动端的开发中更尤其需要注意控制使用，这也就是我们常常所强调的将运行时优化到编译时进行的理由；

### 反射实例之动态代理  

代理是一种实际中非常常用的模式，通过封装 Proxy，暴露外部实际所需，隐藏细节，Proxy为实际处理类进行消息预处理，过滤以及转发到实际处理类；Client在调用 proxy处理对应的Action时，对于实际的处理类的存在是无感知的，通常为了达到这一目的 Proxy与Delegate通常会实现统一Action接口，以便于让外部看来具有行为一致性；

通过代理让业务逻辑的实现内聚性更强，正如在业务开发中，核心的业务可能只是少部分的代码实现，而外部的边界处理以及数据校验却可能占有更大的逻辑，过多的数据预处理会在后期的代码维护过程中分散维护者的精力，而通过代理，保证内部的核心实现，将外部的预处理交给Proxy代理处理过滤，让逻辑更加清晰；（同理，也可以对于实际实现的输出进行二次过滤处理输出）   


代理的实现，通常有静态代理与动态代理之分，通常我们说的是静态代理，代理类通过包装实际委托类来处理Action，实际委托类通常是Proxy的内部属性，一般通过初始化注入，二者的代理委托关系在编译时就已确定。但这类方式并不灵活，在使用时如要添加删除都需要同步修改，而且每个逻辑的处理都需要两个类Proxy与委托类的实现，这也容易造成类的膨胀问题。



#### 动态代理   

对动态代理深刻印象是在看了Retrofit的实现之后，其核心实现： 

{%  highlight java %}

public <T> T create(final Class<T> service) {
    Utils.validateServiceInterface(service);
    if(this.validateEagerly) {
        this.eagerlyValidateMethods(service);
    }

    return Proxy.newProxyInstance(service.getClassLoader(), new Class[]{service}, new InvocationHandler() {
        private final Platform platform = Platform.get();

        public Object invoke(Object proxy, Method method, Object... args) throws Throwable {
            if(method.getDeclaringClass() == Object.class) {
                return method.invoke(this, args);
            } else if(this.platform.isDefaultMethod(method)) {
                return this.platform.invokeDefaultMethod(method, service, proxy, args);
            } else {
                ServiceMethod serviceMethod = Retrofit.this.loadServiceMethod(method);
                OkHttpCall okHttpCall = new OkHttpCall(serviceMethod, args);
                return serviceMethod.callAdapter.adapt(okHttpCall);
            }
        }
    });
}

public interface InvocationHandler {
    Object invoke(Object var1, Method var2, Object[] var3) throws Throwable;
}

public class Proxy implements Serializable {
    protected InvocationHandler h;

    protected Proxy(InvocationHandler h) {
        throw new RuntimeException("Stub!");
    }

    // Stub 实现实际由运行虚拟机FramWork实现
    public static Object newProxyInstance(ClassLoader loader, Class<?>[] interfaces, InvocationHandler h) throws IllegalArgumentException {
        throw new RuntimeException("Stub!");
    }
}

{% endhighlight %}

创建的Proxy就是 传入的 service.interface 接口的代理类，实际的实现均是通过 InvocationHandler 分发调度处理，其实际Action在运行时通过反射机制动态构建，极大的提升了系统的可扩展性；







