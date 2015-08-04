---
layout: post
title: Android GreenDao小结
category: android
---
###前言

GreenDao属于Android平台高性能Orm 框架，采用非注入式，不加反射，性能好，是目前网上综合评价较高，运行效率最高，内存消耗最少，性能最佳的ORM框架。

ORM框架对象关系映射，主要任务是让开发者通过直接操作Java类（Bean）去操作数据库。省去繁琐的数据库相关操作，忽略细节，专注于开发。目前使用广泛的ORM框架很多，有注入式，配置文件方式，也有生成代码非注入式，相较而言，非注入式性能好，但其劣势在于上手成本较高，GreenDao就是这类框架。

初接触GreenDao一眼就觉得有点像Ibatis（MyBatis），自己写配置文件生成JavaBean，再放置到相应的包中引用。但是GreenDao做的更好一些，更加智能化，其生成文件都是Java操作。

###GreenDao使用方法

核心Jar包（3个）

>freemarker.jar
>
> greendao-generator.jar
> 
> greendao.jar

其中greendao-generator.jar和freemarker.jar是用于生成文件的Jar引用包，而greendao.jar是核心包，是要嵌入到Android应用中的，其包文件大小在100k左右，从这里可以看出其精简程度。

#####建立Java项目生成相关Bean文件以及Dao文件

GreenDao的核心类是DaoMaster，DaoSession，以及各个BeanDao文件，BeanDao文件是用于直接操作类数据插入等操作。

生成Bean文件需要写Schema用于指定Bean属性，用我目前的Baidu地图Demo项目中的代码来说明：

{% highlight Java %}

  public static void main(String args[]) throws Exception {

        Schema schema = new Schema(1, "com.itlipan.lee.wanttoeatwhat.model");

        Entity restaurant = schema.addEntity("Restaurant");
        restaurant.addIdProperty();
        restaurant.addStringProperty("uid");
        restaurant.addStringProperty("city");
        restaurant.addStringProperty("address");
        restaurant.addStringProperty("name");
        restaurant.addStringProperty("phone");


        Entity latlng = schema.addEntity("Latlng");
        latlng.addIdProperty();
        latlng.addDoubleProperty("latitude");
        latlng.addDoubleProperty("longitude");


        //a Restaurant has a Latlng  webLink:http://greendao-orm.com/documentation/relations/
        Property latlngIdProperty = restaurant.addLongProperty("latlngId").getProperty();
        //This will result in a Restaurant entity having a Latlng property (getLatlng/setLatlng),
        // and you can work directly with Latlng objects.
        restaurant.addToOne(latlng,latlngIdProperty);



        new DaoGenerator().generateAll(schema, "D:\\mygithub\\WantToEatWhat\\app\\src\\main\\java");

    }

{% endhighlight%}

代码说明：指定Schema，1代表版本号，后面的字符串"com.itlipan.lee.wanttoeatwhat.model"指定Bean要放入的包名。

Entity指代实体类，第一个要生成的实体类是 Restaurant.java，同时会伴随其操作类RestaurantDao.java

明显下面add用于增添实体属性，同时还能指定空非空，需要注意的是第一个addIdProperty()，是指定的主键，默认自增。

特别说明的是指定实体间关系方式，restaurant.addLongProperty("latlngId")表示在restaurant中增加一个字段，用于存储外键，外键指向一个latlng实体。

这样操作之后，我们可以直接在获取到restaurant之后通过getLatlng(),方法直接获取到latlng对象，直接操作对象还是比较方便的。

多对多属性类似，不复杂，见开发文档就OK,说的很清楚，这里不多说了。

我觉得这里可能比较复杂的地方在于子项目的建立，其他的都是很傻瓜化的，有Web经验的应该配置很简单。

在AndroidApp下新建一个子Module，注意是JavaLib的子Module，这一步Easy

{:.center}
![NewModule](/assets/img/20150804/newmodule.png)

{:.center}
![RunGenerator](/assets/img/20150804/generator.png)

这一步刚开始接触可能有点麻烦，切换到Project视图比较好操作，导入Jar包，写Build.gradle文件，注意是写子Module的Gradle文件，指定MainClass运行类，写入Apply，导入jar包之后增添依赖，也可以导入后直接右键点击Jar包As Lib，依赖会自动写上，然后Gradle同步，这时候就可以开始创建新的Java Generator文件，创建Shema语句，创建完成之后由于是一个JavaMain函数文件，可以直接运行，运行成功在指定位置生成JavaBean， "D:\\mygithub\\WantToEatWhat\\app\\src\\main\\java"，位置一定要指定正确，可以在App的MainActivity.java文件右键，Copy Path，然后复制过来。

附带说一句：Android Studio真的太好用的，做Android开发如果还坚守Eclipse真的难以理解。


其余实例化DaoMaster，创建数据库之类的就不说了，Easy，忘了就看官方文档，简洁易懂，可能需要注意的就是查询操作的使用，但也不难，一看就会。






---

[GreenDao官方文档]（http://greendao-orm.com/documentation/）

[GreenDao学习心得及使用总结](http://www.it165.net/pro/html/201401/9026.html)