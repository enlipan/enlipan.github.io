---
layout: post
title:  Fresco Source Code Reading
category: android
keywords: [improvement,android,gralde,img]
---

结论是次要的,重要的是得出结论的思考以及寻找过程;

### 从类图开始

{:.center}
![Fresco_UML](http://7xqncp.com1.z0.glb.clouddn.com/assets/img/20170815/fresco_mvc.png "Fresco MVC")

### 初始化  

在弄清楚 Fresco 的MVC 类图模型之后,我们回过头从 Fresco 的用法开始进入源码的追踪,当然这也是最常见的逻辑,即使是调试追踪源码也是同样的入口;

{% highlight java %}
//Fresco.java
Fresco.init(Context,imagePipelineConfige)  

// Factory - This class constructs the pipeline and its dependencies from other libraries.
ImagePipelineFactory.initiallize(context,imagePipelineConfige)...
//////////////////////////////////////////////////////////////
//SimpleDrawee.setUri()
  public void setImageURI(Uri uri, @Nullable Object callerContext) {
                                //SimpleDraweeView.initialize()
    DraweeController controller = mSimpleDraweeControllerBuilder
        .setCallerContext(callerContext)
        .setUri(uri)
        .setOldController(getController())
        .build();
    setController(controller);
  }
/** Sets the controller. */
  public void setController(@Nullable DraweeController draweeController) {
    mDraweeHolder.setController(draweeController);
    super.setImageDrawable(mDraweeHolder.getTopLevelDrawable());
  }
//////////////////////////////////////////////////////////////////
//PipelineDraweeControllerBuilder extends AbstractDraweeController
  public PipelineDraweeControllerBuilder setUri(@Nullable Uri uri) {
    if (uri == null) {
      return super.setImageRequest(null);
    }
    ImageRequest imageRequest = ImageRequestBuilder.newBuilderWithSource(uri)
        .setRotationOptions(RotationOptions.autoRotateAtRenderTime())
        .build();
    return super.setImageRequest(imageRequest);
  }
  @Override
  protected PipelineDraweeController obtainController() {
    DraweeController oldController = getOldController();
    PipelineDraweeController controller;
    if (oldController instanceof PipelineDraweeController) {
      controller = (PipelineDraweeController) oldController;
      // 注意此处的controller.initialize() 注意
      controller.initialize(
          obtainDataSourceSupplier(),
          generateUniqueControllerId(),
          getCacheKey(),
          getCallerContext());
    } else {
      // PipelineDraweeController构造函数中调用了 controller.init()
      controller = mPipelineDraweeControllerFactory.newController(
          obtainDataSourceSupplier(),
          generateUniqueControllerId(),
          getCacheKey(),
          getCallerContext());
    }
    return controller;
  }

////////////////////////////////////////////////////
//AbstractDraweeController
    /** Builds a regular controller. */
  protected AbstractDraweeController buildController() {
    //obtainController 函数被子类PipelineDraweeController复写
    AbstractDraweeController controller = obtainController();
    controller.setRetainImageOnFailure(getRetainImageOnFailure());
    controller.setContentDescription(getContentDescription());
    controller.setControllerViewportVisibilityListener(getControllerViewportVisibilityListener());
    maybeBuildAndSetRetryManager(controller);
    maybeAttachListeners(controller);
    return controller;
  }

{% endhighlight %}

到这里为止我都已经清楚了 Controller 的构建逻辑,但是我们依旧不清楚 Controller 是如何实现图片的加载逻辑,继续跟踪遗漏的细节;

DraweeHolder 作为持有 Controller 以及 DraweeHierarchy的 holderClass, 也就是 MVC 的连接器,其中必定有很重要的逻辑,而且我们设置了 SimpleDrawee 的 URI 之后其他的图片加载逻辑就会被在 View 加载时触发,猜测加载逻辑核心一定在 setController() 中;

{% highlight java %}
//DraweeHolder.attachController
  private void attachController() {
    if (mIsControllerAttached) {
      return;
    }
    mEventTracker.recordEvent(Event.ON_ATTACH_CONTROLLER);
    mIsControllerAttached = true;
    if (mController != null &&
        mController.getHierarchy() != null) {
      mController.onAttach();
    }
  }

  /////////////////////////////////////////////
  //AbstractDraweeController implements common functionality   
  //AbstractDraweeController.onAttach
    @Override
  public void onAttach() {
    if (FLog.isLoggable(FLog.VERBOSE)) {
      FLog.v(
          TAG,
          "controller %x %s: onAttach: %s",
          System.identityHashCode(this),
          mId,
          mIsRequestSubmitted ? "request already submitted" : "request needs submit");
    }
    mEventTracker.recordEvent(Event.ON_ATTACH_CONTROLLER);
    Preconditions.checkNotNull(mSettableDraweeHierarchy);
    mDeferredReleaser.cancelDeferredRelease(this);
    mIsAttached = true;
    if (!mIsRequestSubmitted) {
      // 看到这里很高兴,方法名暴露了自己
      submitRequest();
    }
  }

// 果然是核心逻辑,很长,我们先理清主干,忽略细节
 protected void submitRequest() {
    ... 
    mDataSource = getDataSource();
    ...
    mDataSource.subscribe(dataSubscriber, mUiThreadImmediateExecutor);   
}
// 看看这个mDataSource 从哪来?
// 我们发现是 mDataSourceSupplier.get() ;
// 然而 mDataSourceSupplier 又是通过 init()注入,那么我们回忆起 PipelineDraweeController 构建时的 被 PipelineDraweeControllerBuilder 初始化的过程;
//层层深入,最后找到 PipelineDraweeControllerBuilder
  @Override
  protected DataSource<CloseableReference<CloseableImage>> getDataSourceForRequest(
      ImageRequest imageRequest,
      Object callerContext,
      CacheLevel cacheLevel) {
    return mImagePipeline.fetchDecodedImage(
        imageRequest,
        callerContext,
        convertCacheLevelToRequestLevel(cacheLevel));
  }

  // 
    @Override
  public void subscribe(final DataSubscriber<T> dataSubscriber, final Executor executor) {
    Preconditions.checkNotNull(dataSubscriber);
    Preconditions.checkNotNull(executor);
    boolean shouldNotify;
    synchronized(this) {
      if (mIsClosed) {
        return;
      }
      if (mDataSourceStatus == DataSourceStatus.IN_PROGRESS) {
        //mSubscribers -> ConcurrentLinkedQueue 基于链接节点的无界线程安全队列
        mSubscribers.add(Pair.create(dataSubscriber, executor));
      }
      shouldNotify = hasResult() || isFinished() || wasCancelled();
    }

    if (shouldNotify) {
      notifyDataSubscriber(dataSubscriber, executor, hasFailed(), wasCancelled());
    }
  }

{% endhighlight %}

看到这里我们发现请求的发起流程即为复杂,两种思路,一是运行调试,再就是是继续绘制类图理清结构;

...

待续

