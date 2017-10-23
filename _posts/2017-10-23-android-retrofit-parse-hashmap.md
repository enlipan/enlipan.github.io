---
layout: post
title:  Retrofit Converter parse HashMap
category: android
keywords: [improvement,android,java]
---

### 自定义 Retrofit Convert 解析 Gson HashMap

事实上这一块,之前在 Retrofit 里面总结过,这里遇到了就再记录一下:

由于需要根据后台的动态配置构建对应的 UI, 所以如果生成模型固定的 Model 就还是没有解脱发版的问题,这里后台采用不定项 HashMap 作为 Model 返回,从而如何解析 HashMap 就成了客户端的自定义解析问题:

对于 Gson 的自定义解析通常使用以下方式:

首先需要需要明确的是 gson 解析利用反射,其自定义解析是针对某个级别的 Class 进行的,举个例子: 

{% highlight json %}

{
    code:"200",
    msg:"success",
    data:{
        ...
    }
}

{% endhighlight %}

对于这样一个 json 模型,我们在自定义解析时首先需要考虑的就是我针对哪个层级开始自定义,如果是最外部的层级,那么包含 code,msg 这样的字段都需要自行解析到对应的字段中, 而如果我们仔细观察,就会发现其实外部的字段gson 是可以自行解析的,我们只需要自定义 data 这个对应的 Model.class Type 进行解析,也就是对应后面所使用的 regist 对应的 Type 就得到对应 type 级别的 jsonElement,指定 data 级别进行自定义,就对应对 data 对应的 jsonObject(jsonArray)进行自定义解析;

上面这个看着是似乎是很明确的东西但是很多同学却并不那么清晰导致在自定义解析时,不知道从哪里下手;

* TypeAdapter

通过继承 TypeAdapter 重写其 read 以及 write 函数,其中 read 函数属于 json 的解析也就是反序列化,将 json 字符串解析为对应 model 的实现,而 write 则对应Model 的 Json 序列化实现;

*  自定义 JsonSerializer/ JsonDeserializer

与 TypeAdapter 不一样的是,JsonSerializer 不再需要全盘负责两端的模版函数实现,而只需要关心自己所在意的,比如在我的需求中,我就只关注如何将服务端返回的 json 解析为对应的 HashMap 对象,而不会用到序列化操作将对象转换为对应的 json 字符串:

{% highlight java %}

/**
 * Created by Lee on 2017/10/23.
 * <p>
 * 解析 ConfigParamModel  => 反序列化
 */

public class ConfigParamModelAdapter implements JsonDeserializer<ConfigParamModel> {
    private static final String HASH_PARAM = "enumsMap";
    private static final String GROUP_DTO = "groupDtos";

    @Override
    public ConfigParamModel deserialize(JsonElement json, Type typeOfT, JsonDeserializationContext context) throws JsonParseException {
        final ConfigParamModel parseModel = ConfigParamModel.getInstance();
        if (json != null && json.isJsonObject()) {
            JsonObject object = json.getAsJsonObject();
            if (json.getAsJsonObject().has(HASH_PARAM)) {//hashMap
                HashMap<String, List<ConfigParamModel.KeyLabelBean>> enumsMap = null;
                try {
                    enumsMap = SingleInstanceUtils.getGsonInstance().fromJson(object.get(HASH_PARAM), new TypeToken<HashMap<String, List<ConfigParamModel.KeyLabelBean>>>() {
                    }.getType());
                } catch (Exception e) {/**/}
                parseModel.setEnumsMap(enumsMap);
            }
            if (object.has(GROUP_DTO)) {//list
                List<ConfigParamModel.GroupDtosBean> groupDtos = null;
                try {
                    groupDtos = SingleInstanceUtils.getGsonInstance().fromJson(object.getAsJsonArray(GROUP_DTO), new TypeToken<List<ConfigParamModel.GroupDtosBean>>() {
                    }.getType());
                } catch (Exception e) {/**/}
                parseModel.setGroupDtos(groupDtos);
            }
        }
        return parseModel;
    }
}

// 构建 Gson 对象
new GsonBuilder().registerTypeAdapterFactory(new NullStringToEmptyAdapterFactory()).registerTypeAdapter(ConfigParamModel.class, new ConfigParamModelAdapter()).create()

{% endhighlight %}

这样单边的操作就对比以上的 TypeAdapter 要灵活很多,实现你所关心的业务逻辑即可;

* TypeAdapterFactory
TypeAdapterFactory 的逻辑就更加简单了,针对对应的 type 注册对应的转换器,定义有无对应的 特定TypeAdapter, 没有就直接返回 null,则代表此种类型由 gson 框架默认处理,不做特定处理;
