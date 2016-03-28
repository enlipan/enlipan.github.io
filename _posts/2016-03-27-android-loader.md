---
layout: post
title: Android Loader 源码研究
category: android
---

Loader 代表着Android中的一种异步数据加载机制,被用于从磁盘数据库亦或Provider，网络等数据源加载数据；完成在UI无阻塞情况下获取数据，更新UI状态；

* Loader          
* AsyncTaskLoader               
* CursorLoader              

AsyncTaskLoader 作为Loader的部分实现，同样是Loader的抽象类，我们可以像继承使用AsyncTask一样去使用 AsyncTaskLoader;而CursorLoader则是 AsyncTaskLoader 的一种具体实现，使用方便快捷，其局限性在于需要配合ContentProvider组合使用；

Loader 可以在Activity与Fragment中便利的利用 LoaderManager进行管理控制，同时提供数据配置的自动监听，以及异步加载刷新机制；


从Loader的启动开始 —— 其 initLoader 与 restartLoader 虽然使用情景不一，但是其过程是类似的，源码的分析以 initLoader 为基础进行系统分析：


{% highlight java %}

getLoaderManager().initLoader(0, null, this);

{% endhighlight %}


进一步追踪 Activity 中的 getLoaderManager()，其 LoadManager 是一个抽象类，实际其返回的是一个 LoadManager实现 LoaderManagerImpl 类：

{% highlight java %}

LoaderManagerImpl getLoaderManagerImpl() {
    if (mLoaderManager != null) {
        return mLoaderManager;
    }
    mCheckedForLoaderManager = true;
    mLoaderManager = getLoaderManager("(root)", mLoadersStarted, true /*create*/);
    return mLoaderManager;
}

{% endhighlight %}

查看其 initLoader 具体实现，跟踪如下：

{% highlight java %}

public <D> Loader<D> initLoader(int id, Bundle args, LoaderManager.LoaderCallbacks<D> callback) {
    if (mCreatingLoader) {
        throw new IllegalStateException("Called while creating a loader");
    }

    LoaderInfo info = mLoaders.get(id);

    if (DEBUG) Log.v(TAG, "initLoader in " + this + ": args=" + args);

    if (info == null) {
        // Loader doesn't already exist; create.
        info = createAndInstallLoader(id, args,  (LoaderManager.LoaderCallbacks<Object>)callback);
        if (DEBUG) Log.v(TAG, "  Created new loader " + info);
    } else {
        if (DEBUG) Log.v(TAG, "  Re-using existing loader " + info);
        info.mCallbacks = (LoaderManager.LoaderCallbacks<Object>)callback;
    }

    if (info.mHaveData && mStarted) {
        // If the loader has already generated its data, report it now.
        info.callOnLoadFinished(info.mLoader, info.mData);
    }

    return (Loader<D>)info.mLoader;
}

{% endhighlight %}

可以发现其利用  id 与 具体的 Loader实例构建了一个 SparseArray 维护其实例，在初始化实先查看其id 是否已经具有对应的实例，若没有则创建：


{% highlight java %}

private LoaderInfo createAndInstallLoader(int id, Bundle args,
        LoaderManager.LoaderCallbacks<Object> callback) {
    try {
        mCreatingLoader = true;
        LoaderInfo info = createLoader(id, args, callback);
        installLoader(info);
        return info;
    } finally {
        mCreatingLoader = false;
    }
}

private LoaderInfo createLoader(int id, Bundle args,
        LoaderManager.LoaderCallbacks<Object> callback) {
    LoaderInfo info = new LoaderInfo(id, args,  (LoaderManager.LoaderCallbacks<Object>)callback);
    Loader<Object> loader = callback.onCreateLoader(id, args);
    info.mLoader = (Loader<Object>)loader;
    return info;
}

void installLoader(LoaderInfo info) {
    mLoaders.put(info.mId, info);
    if (mStarted) {
        // The activity will start all existing loaders in it's onStart(),
        // so only start them here if we're past that point of the activitiy's
        // life cycle
        info.start();
    }
}

{% endhighlight %}

其具体创建本质依旧是调用 LoaderCallBack的 Oncreate 实现创建具体的 Loader对象返回，并加入 进行 id 对应的关联mLoaders 维护；并调用 Loader 的 start函数，启动loader，进一步观察 Loader的异步加载启动需要进入 AsyncTaskLoader 实现或者 进入CursorLoader 实现查看器具体实现机制：

以后期可自定义化程度更高的 AsyncTaskLoader 为例：

{% highlight java %}

public final void startLoading() {
    mStarted = true;
    mReset = false;
    mAbandoned = false;
    onStartLoading();
}

protected void onStartLoading() {
}
{% endhighlight %}

其最终的启动函数，是交给子类去实现的 onStartLoading函数，且 AsyncTaskLoader 内部封装的Worker线程：

{% highlight java %}

 final class LoadTask extends ModernAsyncTask<Void, Void, D> implements Runnable {
   .......
 }

{% endhighlight %}

可以看出其内部依旧是利用线程池结合内部Handler 维护 Task的工作队列：


{% highlight java %}

public AsyncTaskLoader(Context context) {
    this(context, ModernAsyncTask.THREAD_POOL_EXECUTOR);
}

void executePendingTask() {
    if (mCancellingTask == null && mTask != null) {
        if (mTask.waiting) {
            mTask.waiting = false;
            mHandler.removeCallbacks(mTask);
        }
        if (mUpdateThrottle > 0) {
            long now = SystemClock.uptimeMillis();
            if (now < (mLastLoadCompleteTime+mUpdateThrottle)) {
                // Not yet time to do another load.
                if (DEBUG) Log.v(TAG, "Waiting until "
                        + (mLastLoadCompleteTime+mUpdateThrottle)
                        + " to execute: " + mTask);
                mTask.waiting = true;
                mHandler.postAtTime(mTask, mLastLoadCompleteTime+mUpdateThrottle);
                return;
            }
        }
        if (DEBUG) Log.v(TAG, "Executing: " + mTask);
        mTask.executeOnExecutor(mExecutor, (Void[]) null);
    }
}


///////////////////////////////////////////////////////////////////////////////////////

public final ModernAsyncTask<Params, Progress, Result> executeOnExecutor(Executor exec,
           Params... params) {
       if (mStatus != Status.PENDING) {
           switch (mStatus) {
               case RUNNING:
                   throw new IllegalStateException("Cannot execute task:"
                           + " the task is already running.");
               case FINISHED:
                   throw new IllegalStateException("Cannot execute task:"
                           + " the task has already been executed "
                           + "(a task can be executed only once)");
           }
       }

       mStatus = Status.RUNNING;
       /*
       *熟悉的调用函数  onPre
       */
       onPreExecute();

       mWorker.mParams = params;

       exec.execute(mFuture);
       return this;
   }


///////////////////////////////////////////////////////////////////////////////////////
/**
 *  其本质依旧是 利用 FutureTask 对 Worker线程进行封装，完成后回调，利用 绑定 UI线程Looper的 Handler将更新结果刷新显示到界面上
 */

   public ModernAsyncTask() {
    mWorker = new WorkerRunnable<Params, Result>() {
        public Result call() throws Exception {
            mTaskInvoked.set(true);

            Process.setThreadPriority(Process.THREAD_PRIORITY_BACKGROUND);
            return postResult(doInBackground(mParams));
        }
    };

    mFuture = new FutureTask<Result>(mWorker) {
        @Override
        protected void done() {
            try {
               /*
               *利用 Handler 将结果Post到UI线程中
               */
                final Result result = get();

                postResultIfNotInvoked(result);
            } catch (InterruptedException e) {
                android.util.Log.w(LOG_TAG, e);
            } catch (ExecutionException e) {
                throw new RuntimeException(
                        "An error occurred while executing doInBackground()", e.getCause());
            } catch (CancellationException e) {
                postResultIfNotInvoked(null);
            } catch (Throwable t) {
                throw new RuntimeException(
                        "An error occurred while executing doInBackground()", t);
            }
        }
    };
}

{% endhighlight %}

通过以上源码的阅读分析，Loader的一些过程基本已经清楚，哪些过程需要自定义，哪些在UI线程；

一些需要注意的点是 对于 initLoader 与 restartLoader 的调用对比，restartLoader 在明确知道数据被更新后，需要丢弃前面 Loader的结果时调用，强制重建 Loader获取最新数据，当然，这种情况更加消耗资源；
