---
layout: post
title:  Fresco Source Code Reading
category: android
keywords: [improvement,android,gralde,img]
---

结论是次要的,重要的是得出结论的思考以及寻找过程;

### 从类图开始

{:.center}
![Fresco_UML](http://res.oncelee.com/assets/img/20170815/fresco_mvc.png "Fresco MVC")

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

DraweeHolder 作为持有 Controller 以及 DraweeHierarchy 的 holderClass, 也就是 MVC 的中的打包封装,其中必定有很重要的逻辑,而且我们设置了 SimpleDrawee 的 URI 之后其他的图片加载逻辑就会被在 View 加载时触发,猜测加载逻辑核心一定在 setController() 中;

这里顺带谈一下 DraweeHolder 的存在原因,主要还是为了解耦:

>Drawee users, should, as a rule, use {@link DraweeView} or its subclasses. There are situations where custom views are required, however, and this class is for those circumstances.

翻译一下:  通常,按照规则,使用者应该使用 DraweeView或者继承其使用.然而,依旧存在一些 Case,比如当用户自定义 View 的时候需要这种借助方式,这个类的实现就是为了这些特殊的 Case 存在的;

在这些特殊情形下,使用者可以直接借助 构建DraweeHolder管理 Controller 以及 DraweeHierarchy,进而去快速使用 Fresco 完成加载;

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

### Producer 处理流程

{% highlight java %}

   mDataSource.subscribe(dataSubscriber, mUiThreadImmediateExecutor);
   
   // Producer 包装
   public DataSource<CloseableReference<CloseableImage>> fetchDecodedImage(
      ImageRequest imageRequest,
      Object callerContext,
      ImageRequest.RequestLevel lowestPermittedRequestLevelOnSubmit) {
    try {
      Producer<CloseableReference<CloseableImage>> producerSequence =
          mProducerSequenceFactory.getDecodedImageProducerSequence(imageRequest);
      return submitFetchRequest(
          producerSequence,
          imageRequest,
          lowestPermittedRequestLevelOnSubmit,
          callerContext);
    } catch (Exception exception) {
      return DataSources.immediateFailedDataSource(exception);
    }
  }
  // AbstractProducerToDataSourceAdapter 构造函数
  producer.produceResults(createConsumer(), settableProducerContext);
  
  //eg:DecodeProducer.produceResults
    @Override
  public void produceResults(
      final Consumer<CloseableReference<CloseableImage>> consumer,
      final ProducerContext producerContext) {
    final ImageRequest imageRequest = producerContext.getImageRequest();
    ProgressiveDecoder progressiveDecoder;
    if (!UriUtil.isNetworkUri(imageRequest.getSourceUri())) {
      progressiveDecoder = new LocalImagesProgressiveDecoder(consumer, producerContext);
    } else {
      ProgressiveJpegParser jpegParser = new ProgressiveJpegParser(mByteArrayPool);
      progressiveDecoder = new NetworkImagesProgressiveDecoder(
          consumer,
          producerContext,
          jpegParser,
          mProgressiveJpegConfig);
    }
    mInputProducer.produceResults(progressiveDecoder, producerContext);
  }

{% endhighlight %}


在此处可以看到 Producer 的层层包装构建 Producer 序列处理的过程,利用Producer 包装 inputProducer,紧接着来寻找相关的 图片请求逻辑;

{% highlight java %}
    // DecodeProducer.onNewResultImpl
    public void onNewResultImpl(EncodedImage newResult, boolean isLast) {
      if (isLast && !EncodedImage.isValid(newResult)) {
        handleError(new NullPointerException("Encoded image is not valid."));
        return;
      }
      if (!updateDecodeJob(newResult, isLast)) {
        return;
      }
      if (isLast || mProducerContext.isIntermediateResultExpected()) {
        mJobScheduler.scheduleJob();
      }
    }
    // com.facebook.imagepipeline.producers.JobScheduler
  public boolean scheduleJob() {
    long now = SystemClock.uptimeMillis();
    long when = 0;
    boolean shouldEnqueue = false;
    synchronized (this) {
      if (!shouldProcess(mEncodedImage, mIsLast)) {
        return false;
      }
      switch (mJobState) {
        case IDLE:
          when = Math.max(mJobStartTime + mMinimumJobIntervalMs, now);
          shouldEnqueue = true;
          mJobSubmitTime = now;
          mJobState = JobState.QUEUED;
          break;
        case QUEUED:
          // do nothing, the job is already queued
          break;
        case RUNNING:
          mJobState = JobState.RUNNING_AND_PENDING;
          break;
        case RUNNING_AND_PENDING:
          // do nothing, the next job is already pending
          break;
      }
    }
    if (shouldEnqueue) {
      enqueueJob(when - now);
    }
    return true;
  }
  // JobScheduler
  private void enqueueJob(long delay) {
    // If we make mExecutor be a {@link ScheduledexecutorService}, we could just have
    // `mExecutor.schedule(mDoJobRunnable, delay)` and avoid mSubmitJobRunnable and
    // JobStartExecutorSupplier altogether. That would require some refactoring though.
    if (delay > 0) {
      JobStartExecutorSupplier.get().schedule(mSubmitJobRunnable, delay, TimeUnit.MILLISECONDS);
    } else {
      // mSubmitJobRunnable的 run 方法实际是 submitJob();
      mSubmitJobRunnable.run();
    }
  }

  private void submitJob() {
   // mDoJobRunnable 其 run 实现实际上是 mJobScheduler.doJob();
    mExecutor.execute(mDoJobRunnable);
  }

{% endhighlight %}

这里JobScheduler有3个属性 Job , mSubmitJobRunnable,mDoJobRunnable以及 JobRunnable,JobScheduler 封装了 Executor 以及 ScheduledExecutorService(单例实现),其中 ScheduledExecutorService处理 delay 的延时 Job ,这里对应 mSubmitJobRunnable,当 mSubmitJobRunnable提交时实际上是利用 mExecutor 执行了  mDoJobRunnable,这里看看其逻辑:

{% highlight java %}
    
    //DecodeProducer 构造函数定义 Job --> 对应 Schedule.mJobRunnable
    JobRunnable job = new JobRunnable() {
        @Override
        public void run(EncodedImage encodedImage, boolean isLast) {
          if (encodedImage != null) {
            if (mDownsampleEnabled) {
              ImageRequest request = producerContext.getImageRequest();
              if (mDownsampleEnabledForNetwork ||
                  !UriUtil.isNetworkUri(request.getSourceUri())) {
                encodedImage.setSampleSize(DownsampleUtil.determineSampleSize(
                    request, encodedImage));
              }
            }
            doDecode(encodedImage, isLast);
          }
        }
      };
    //DecodeProducer.onNewResultImpl()
    public void onNewResultImpl(EncodedImage newResult, boolean isLast) {
      if (isLast && !EncodedImage.isValid(newResult)) {
        handleError(new NullPointerException("Encoded image is not valid."));
        return;
      }
      if (!updateDecodeJob(newResult, isLast)) {
        return;
      }
      if (isLast || mProducerContext.isIntermediateResultExpected()) {
        //触发 JobSchedule 的3 种 Job处理流程
        mJobScheduler.scheduleJob();
      }
    }
  //JobSchedule.doJob()
  private void doJob() {
    long now = SystemClock.uptimeMillis();
    EncodedImage input;
    boolean isLast;
    synchronized (this) {
      input = mEncodedImage;
      isLast = mIsLast;
      mEncodedImage = null;
      mIsLast = false;
      mJobState = JobState.RUNNING;
      mJobStartTime = now;
    }
    try {
      // we need to do a check in case the job got cleared in the meantime
      if (shouldProcess(input, isLast)) {
        // 这里执行了传入的 mJobRunnable 
        mJobRunnable.run(input, isLast);
      }
    } finally {
      EncodedImage.closeSafely(input);
      onJobFinished();
    }
  }

{% endhighlight %}

再回过头看整体流程,画个图理清一下流程:  

{:.center}
![Init Suplier](http://res.oncelee.com/assets/img/20170819/sq_controller_init.png)

{:.center}
![SetUriAction](http://res.oncelee.com/assets/img/20170819/sq_set_uri_action.png)


到这里可以明白整个图片的处理逻辑都在 DataSource.subscribe(subscriber),接着追踪最核心的 Producer Sequence 处理逻辑:

DataSource 对象的构造:

{% highlight java %}

   return CloseableProducerToDataSourceAdapter.create(
          producerSequence,
          settableProducerContext,
          requestListener);

{% endhighlight %}

CloseableProducerToDataSourceAdapter 继承自AbstractDataSource,是 Producer 的适配,类名很直观,在阅读源码时,收获很多;

{% highlight java %}
//CloseableProducerToDataSourceAdapter 的 super()构造函数
 producer.produceResults(createConsumer(), settableProducerContext);

//这里 Consumer 实际也是对于 Adapter 的代理
//CloseableProducerToDataSourceAdapter.createConsumer
private Consumer<T> createConsumer() {
    return new BaseConsumer<T>() {
      @Override
      protected void onNewResultImpl(@Nullable T newResult, boolean isLast) {
        AbstractProducerToDataSourceAdapter.this.onNewResultImpl(newResult, isLast);
      }

      @Override
      protected void onFailureImpl(Throwable throwable) {
        AbstractProducerToDataSourceAdapter.this.onFailureImpl(throwable);
      }

      @Override
      protected void onCancellationImpl() {
        AbstractProducerToDataSourceAdapter.this.onCancellationImpl();
      }

      @Override
      protected void onProgressUpdateImpl(float progress) {
        AbstractProducerToDataSourceAdapter.this.setProgress(progress);
      }
    };
  }
  //CloseableProducerToDataSourceAdapter.onNewResultImpl
  protected void onNewResultImpl(@Nullable T result, boolean isLast) {
    if (super.setResult(result, isLast)) {
      if (isLast) {
        mRequestListener.onRequestSuccess(
            mSettableProducerContext.getImageRequest(),
            mSettableProducerContext.getId(),
            mSettableProducerContext.isPrefetch());
      }
    }
  }
  //super.setResult
  protected boolean setResult(@Nullable T value, boolean isLast) {
    boolean result = setResultInternal(value, isLast);
    if (result) {
      notifyDataSubscribers();
    }
    return result;
  }
  //
  private void notifyDataSubscribers() {
    final boolean isFailure = hasFailed();
    final boolean isCancellation = wasCancelled();
    for (Pair<DataSubscriber<T>, Executor> pair : mSubscribers) {
      notifyDataSubscriber(pair.first, pair.second, isFailure, isCancellation);
    }
  }
{% endhighlight %}

在 Value 被 onNewResultImpl 注入了 Result 之后,notify 通知结果更新:

{% highlight java %}

final DataSubscriber<T> dataSubscriber =
        new BaseDataSubscriber<T>() {
          @Override
          public void onNewResultImpl(DataSource<T> dataSource) {
            // isFinished must be obtained before image, otherwise we might set intermediate result
            // as final image.
            boolean isFinished = dataSource.isFinished();
            float progress = dataSource.getProgress();
            // image Result 更新
            T image = dataSource.getResult();
            if (image != null) {
              // 
              onNewResultInternal(id, dataSource, image, progress, isFinished, wasImmediate);
            } else if (isFinished) {
              onFailureInternal(id, dataSource, new NullPointerException(), /* isFinished */ true);
            }
          }
          @Override
          public void onFailureImpl(DataSource<T> dataSource) {
            onFailureInternal(id, dataSource, dataSource.getFailureCause(), /* isFinished */ true);
          }
          @Override
          public void onProgressUpdate(DataSource<T> dataSource) {
            boolean isFinished = dataSource.isFinished();
            float progress = dataSource.getProgress();
            onProgressUpdateInternal(id, dataSource, progress, isFinished);
          }
        };

{% endhighlight %}

Subscriber 收到结果更新,在 onNewResultImpl 中收到 Result, DraweeHierarchy 更新;


`mSettableDraweeHierarchy.setImage(drawable, 1f, wasImmediate);`


来看看 Producer 的构造封装,是如何调用 produceResults 的调用流程的:

{% highlight java %}

//ImagePipeline.fetchDecodedImage 构造 Procuder 处理 ImageRequest
Producer<CloseableReference<CloseableImage>> producerSequence =
          mProducerSequenceFactory.getDecodedImageProducerSequence(imageRequest);

//
  public Producer<CloseableReference<CloseableImage>> getDecodedImageProducerSequence(
      ImageRequest imageRequest) {
    Producer<CloseableReference<CloseableImage>> pipelineSequence =
        getBasicDecodedImageSequence(imageRequest);
    if (imageRequest.getPostprocessor() != null) {
      return getPostprocessorSequence(pipelineSequence);
    } else {
      return pipelineSequence;
    }
  }

{% endhighlight %}

在 Producer 的层层调用时,上层的 Procuder 调用 inputProducer.produceResults(wrapConsumer,context);

这样的处理逻辑,使下层的 Procuder 处理的结果返回到上层的 wrapConsumer 中,进而转换到上层 Procuder 处理;这样的处理流程使处理一层层下方,而使结果层层上传,追踪回到原来的 CloseableProducerToDataSourceAdapter 中处理;  



{% highlight java %}

  /**
   * swallow result if prefetch -> bitmap cache get ->
   * background thread hand-off -> multiplex -> bitmap cache -> decode -> multiplex ->
   * encoded cache -> disk cache -> (webp transcode) -> network fetch.
   */


  /**
   * multiplex -> encoded cache -> disk cache -> (webp transcode) -> network fetch.
   */

{% endhighlight %}

看完整个流程,非常棒的代码实现,基于多接口的实现非常灵活,有很多值得学习的地方

* Open Closed Principle(OCP): 开闭原则,一旦类的职责确定,那么类对内修改只允许在 fixbug 时,如果要修改类需要 继承其实现完成;

* Interface Segregation Principle(ISP): 接口隔离原则,较小的职责单一的接口构建更灵活的系统实现,解耦的系统,而不应该构建承担了过多功能的胖接口,胖接口表现在系统层面,表明接口定义时不够内聚;

