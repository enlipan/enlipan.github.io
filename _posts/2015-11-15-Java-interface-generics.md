---
layout: post
title: Java 接口泛型
category: java
---

运行时泛型擦除；为了兼容Java5之前的无泛型而引入的泛型擦除机制；

通过泛型的使用让代码的类型检查变得安全；尽可能使用参数安全类型，而少使用原生类型；

注：  通配符类型 只能 获取而不能添加，根据泛型定义  通配符类型编译器无法确定类型，所以无法添加；

`？`  无法添加

`？ extends  String`  上限 无法添加

`？ super  String`  下限--可以添加--本身类型String--不可添加Object类型


{% highlight Java %}

/**
 * 泛型
 */
public class GenericDemo {
    public static void main(String[] args) {
        Point<Integer> point = new Point<>(10);
        point.setX(1);
        point.setY(2);
        System.out.println(point);
        Point<? super Integer> pointX = new Point<>(10);
        pointX.setX(1);
        Point<?> pointxx = new Point<>(10);
        pointxx.getX();
        Point<? super String> points = new Point<>("s");
        points.setY("s");// 可以运行
        Object o = "s";
        points.setX(o);//编译错误
        Point<? extends String> pointe = new Point<>("s");
        pointe.setX("s");//编译错误
    }

    static class Point<T> {
        //构造函数为泛型赋值
        private T var;
        //构造函数泛型应用
        Point(T var){
            this.var = var;
        }
        T x;
        T y;
        public T getY() {
            return y;
        }

        public void setY(T y) {
            this.y = y;
        }

        public T getX() {
            return x;
        }

        public void setX(T x) {
            this.x = x;
        }

        @Override
        public String toString() {
            String s = "X: " + getX() +  " Y: " + getY();
            return s;
        }
    }

    /**
     * 泛型接口
     * @param <T>
     */
    interface PointImp<T>{
        T getPoint(T var);
    }

    /**
     * 实现泛型接口
     */
    static class SubPoint<Integer> implements PointImp<Integer>{

        @Override
        public Integer getPoint(Integer var) {
            return null;
        }
    }

    /**
     * 多泛型组合
     */
    static class Surface<K,V>{

    }

}

{% endhighlight %}   




---

Quot：

[泛型](https://github.com/JustinSDK/JavaSE6Tutorial/blob/master/docs/CH12.md)

[Java深度历险（五）——Java泛型](http://www.infoq.com/cn/articles/cf-java-generics)

[Java泛型：泛型类、泛型接口和泛型方法](http://segmentfault.com/a/1190000002646193)

[java中的泛型以及抽象类和接口的使用--学习笔记](http://www.imooc.com/wenda/detail/240886)

[(String[]) Array.toArray()强转失败](http://stackoverflow.com/questions/5374311/convert-arrayliststring-to-string-array/17909134#17909134)