---
layout: post
title: AsyncTask 与 Handler小结
category: android
---
##AsyncTask

###AsyncTask 的优势体现在：

* 线程的开销较大，如果每个任务都要创建一个线程，那么应用程 序的效率要低很多； 
* 
* 线程无法管理，匿名线程创建并启动后就不受程序的控制了，如果有很多个请求发送，那么就会启动非常多的线程，系统将不堪重负。 
* 
* 另外，前面已经看到，在新线程中更新UI还必须要引入handler，这让代码看上去非常臃肿。

###AsyncTask定义了三种泛型类型 Params，Progress和Result。

* Params 启动任务执行的输入参数，比如HTTP请求的URL。 
* 
* Progress 后台任务执行的百分比。 
* 
* Result 后台执行任务最终返回的结果，比如String。

AsyncTask的执行分为四个步骤，每一步都对应一个回调方法，开发者需要实现一个或几个方法。在任务的执行过程中，这些方法被自动调用。

onPreExecute(), 该方法将在执行实际的后台操作前被UI thread调用。可以在该方法中做一些准备工作，如在界面上显示一个进度条。 

doInBackground(Params...), 将在onPreExecute 方法执行后马上执行，该方法运行在后台线程中。这里将主要负责执行那些很耗时的后台计算工作。可以调用 publishProgress方法来更新实时的任务进度。该方法是抽象方法，子类必须实现。 

onProgressUpdate(Progress...),在publishProgress方法被调用后，UI thread将调用这个方法从而在界面上展示任务的进展情况，例如通过一个进度条进行展示。 

onPostExecute(Result), 在doInBackground 执行完成后，onPostExecute 方法将被UI thread调用，后台的计算结果将通过该方法传递到UI thread.

AsyncTask使用几条必须遵守的准则： 
1. Task的实例必须在UI thread中创建                   
2. execute方法必须在UI thread中调用                
3.不要手动的调用onPreExecute(), onPostExecute(Result)，doInBackground(Params...), onProgressUpdate(Progress...)这几个方法                     
4. 该task只能被执行一次，否则多次调用时将会出现异常

**PS：**

* AsyncTask线程个数有限，如果前面开启的后台Task线程到达一定数量之后，而又没有完成的情况下，任务会一直阻塞，后面的线程将一直等待。
* 
* AsyncTask适用于较大的数据量，使用相较于Handler更加简便，Handler则重在灵活
* 
* 利用AsyncTask可以让UI主线程保持响应，而不会出现5秒无响应强制退出
* 
* AsyncTask线程开启后无法管理，不受控制


**最后需要说明AsyncTask不能完全取代线程，在一些逻辑较为复杂或者需要在后台反复执行的逻辑就可能需要线程来实现了。**

> AsyncTasks should ideally be used for short operations (a few seconds at the most.) If you need to keep threads running for long periods of time, it is highly recommended you use the various APIs provided by the java.util.concurrent package such as Executor, ThreadPoolExecutor and FutureTask.

##Handler

Android UI是线程不安全的，如果在子线程中尝试进行UI操作，程序就有可能会崩溃。异步消息处理线程完成。

Message是消息，是传输的数据，可以绑定Bundle传输。

Handler是管理Message的工具，负责消息的收发管理。每个Handler有着对应的一个Looper，可以理解为Handler是专门负责处理这个邮箱(Looper)里面所有信件的邮差。

Looper是容器，对应着消息队列，负责将消息存入Message Queue，由Handler一一提取。

##HandlerThread

HandlerThread继承自Thread,线程同时创建了一个含有消息队列的Looper,维护自身的一套循环事务逻辑，自有Looper，HandlerThread在自己线程内处理自己线程发出的消息，独立循环接收并处理Message消息。

其使用一般用于让非UI线程使用消息队列机制，不干扰或者阻塞UI线程。

同时开发中如果多次使用类似`new Thread(){...}.start()`这种方式开启一个子线程，会创建多个匿名线程，使得程序运行起来越来越慢，而HandlerThread自带Looper使他可以通过消息来多次重复使用当前线程，节省开支.

上代码示例-自己写的获取百度SDK定位数据的demo：

{%  highlight java %}
public class CurrentLocationUtil extends HandlerThread {
    public static final int  WHATCODE = 1;
    private static final String TAG = "CurrentLocationUtil";
    private Context mContext;
    private LocationClient mLocationClient;
    private Handler mResponseHandler;
    private Handler mHandler;
    private OnReceiverLatLngListener mOnReceiverLatLngListener;

    private LatLng mCurrentLatLng;

    /**
     * @param context the context must be getApplicationContext();
     * */
    public CurrentLocationUtil( Context context, Handler responseHandler) {
        super(TAG);
        mContext = context;
        mResponseHandler = responseHandler;
    }

    @Override
    protected void onLooperPrepared() {
        mHandler = new Handler(this.getLooper()){
            @Override
            public void handleMessage(Message msg) {
                Message resMessage = mResponseHandler.obtainMessage();
                resMessage.what = WHATCODE;
                resMessage.obj = msg.obj;
                resMessage.sendToTarget();
                this.getLooper().quit();
            }
        };
        fetchBaiduLatLng();
    }

    public void setOnReceiverLatLngListener(OnReceiverLatLngListener onReceiverLatLngListener) {
        mOnReceiverLatLngListener = onReceiverLatLngListener;
    }

    /**
     * this Listener can option the View's status of the UI
     */
    public interface OnReceiverLatLngListener {
        public void fetchCurrentBaiduCoord();
    }


    public void fetchBaiduLatLng() {
        mLocationClient = new LocationClient(mContext);
        locationConfig();
        if (!mLocationClient.isStarted()) mLocationClient.start();
    }

    private void locationConfig() {
        // 设置mLocationClient数据,如是否打开GPS,使用LocationClientOption类.
        LocationClientOption option = new LocationClientOption();
        option.setLocationMode(LocationClientOption.LocationMode.Hight_Accuracy);// 设置定位模式
        option.setCoorType("bd09ll");// 返回的定位结果是百度经纬度,默认值gcj02
        option.setScanSpan(5000);// 设置发起定位请求的间隔时间为5000ms
        option.setIsNeedAddress(true);// 返回的定位结果包含地址信息
        option.setNeedDeviceDirect(true);// 返回的定位结果包含手机机头的方向
        option.setOpenGps(true);// 打开GPS
        mLocationClient.setLocOption(option);
        mLocationClient.registerLocationListener(new BDLocationListener() {
            /** 
             * @param bdLocation when mLocationClient.start() is opened,get this location Latlng
             *                   asynchronous,the BaiduLocation use Hander
             *                   Return this Latlng
             */
            @Override
            public void onReceiveLocation(BDLocation bdLocation) {
                // mapView 销毁后不在处理新接收的位置
                if (bdLocation == null) return;
                //获取服务器回传的当前经纬度
                mCurrentLatLng = new LatLng(bdLocation.getLatitude(),
                        bdLocation.getLongitude());

                Message msg = mHandler.obtainMessage();
                if (msg!=null) {

                    msg.obj = mCurrentLatLng;
                    msg.sendToTarget();
                }
                Log.d("BaiduCurrentLocation", "Done!!!! " + mCurrentLatLng);
            }
        });
    }
}

{%  endhighlight  %}

UI线程传递一个绑定其Looper的Handler给后台HandlerThread线程，该Handler消息发送Target其实是UI线程，其缘由在于Handler绑定Looper，消息也就发送给这个Looper，不论这个Handler在哪个线程。

HandlerThread线程中绑定其其自身的Looper的Handler维护自身的一套业务逻辑回调循环。注意回调循环与While循环是有差异的，为说明这个再上一段代码--获取百度地图SDK周边POI数据：

{%  highlight java %}

/**
 * Created by pan_li on 2015/8/3.
 */
public class POISearchUtil extends HandlerThread {
    private static final String TAG = "POISearchUtil";
    public static final int WHAT_TOTAL_PAGE_CODE = 0;
    public static final int WHAT_END_CODE = 1;
    private static final int PAGE_NUMS = 50;
    private static final int SEARCH_RIDIUS = 1500;
    private PoiSearch mPoiSearchClient;
    private LatLng mSearchLatLng;
    //    private List<PoiInfo> mPoiInfoList;
    private int mFirstPageNum = 0;
    private Handler mHandler;
    private Context mContext;
    private SqlDateBaseUtil mSqlDateBaseUtil;
    SimpleDateFormat mFormat = new java.text.SimpleDateFormat("yyyy:MM:dd HH:mm:ss:SSS");


    /**
     * @param searchLatlng the Place Latlng Where you want to Fetch nearby  data
     *                     Which get from the UI Thread
     */
    public POISearchUtil(LatLng searchLatlng, Context context) {
        super(TAG);
        mContext = context;
        mSearchLatLng = searchLatlng;
    }

    @Override
    protected void onLooperPrepared() {
        mPoiSearchClient = PoiSearch.newInstance();
        mPoiSearchClient.setOnGetPoiSearchResultListener(poiListener);
//        mPoiInfoList = new ArrayList<PoiInfo>();
        mSqlDateBaseUtil = new SqlDateBaseUtil(mContext);
        fetchNearBySearchData(mFirstPageNum);

        mHandler = new Handler() {
            @Override
            public void handleMessage(Message msg) {
                //sometimes baidu poiresult doesnot Match the actual number
                //that means the resultpages on the behind can't get result
                //eg,the result.getTotalPoiNum() show 2300,but behind 760
                //the result is null ,the handler is send null result
                //so we should finish this bring forward;
                if (msg.what == WHAT_TOTAL_PAGE_CODE) {
                    int page = (int) msg.obj;
                    fetchNearBySearchData(page);
                } else if (mPoiSearchClient != null && msg.what == WHAT_END_CODE) {
                    mSqlDateBaseUtil.closeDataBase();
                    mPoiSearchClient.destroy();
                    this.getLooper().quit();
                }
            }
        };

    }

    //the register Listener to this mPoiSearchClient to set the Callback
    //when get POI Result
    OnGetPoiSearchResultListener poiListener = new OnGetPoiSearchResultListener() {
        /**
         * the first time get the totalpages the use message send to handleMessage()
         *handleMessage use the totalpages and first pageNum  then launch another
         *to getAll PoiResult
         */
        public void onGetPoiResult(PoiResult result) {

            if (result.getAllPoi() != null) {
//                mPoiInfoList.addAll(result.getAllPoi());
                insertDataBySqlUtil(result.getAllPoi());
                Message msg = mHandler.obtainMessage();
                msg.what = WHAT_TOTAL_PAGE_CODE;
                mFirstPageNum++;
                msg.obj = mFirstPageNum;
                msg.sendToTarget();
            } else {
                Message msg = mHandler.obtainMessage();
                msg.what = WHAT_END_CODE;
                msg.sendToTarget();
            }

        }

        public void onGetPoiDetailResult(PoiDetailResult result) {
            //获取Place详情页检索结果
//            Log.d(TAG, "onGetPoiDetailResult: "+result.toString());

        }
    };

    /**
     * @param pageNum pageNumbers to getPoiResult
     * @OverLoading when get the TotalPages through the onLooperPrepared
     * default method fetchNearBySearchData()
     */
    public boolean fetchNearBySearchData(int pageNum) {
        Log.d(TAG, "fetchNearBySearchData  PageNum:" + pageNum + " Time:"
                + mFormat.format(System.currentTimeMillis()));
        PoiNearbySearchOption option = new PoiNearbySearchOption();
        option.pageNum(pageNum);
        option.pageCapacity(PAGE_NUMS);
        option.location(mSearchLatLng);
        option.keyword("美食");
        option.radius(SEARCH_RIDIUS);
        boolean isSearchOk = mPoiSearchClient.searchNearby(option);
        if (isSearchOk) {
            return true;
        } else {
            Log.e(TAG, "fetchNearBySearchData Error");
            return false;
        }
    }

    public void insertDataBySqlUtil(List<PoiInfo> infos){
        Log.d(TAG,"Insert Beginning at time:"+mFormat.format(System.currentTimeMillis()));

        if (mSqlDateBaseUtil.initDataBaseUtil()) {
            if (mSqlDateBaseUtil.insertPoiData(infos)){
                Log.d(TAG,"Insert Ok at time:"+mFormat.format(System.currentTimeMillis()));
            }
        }else {
            Log.d(TAG,"SqlDataBaseUtil Client Init False"+mFormat.format(System.currentTimeMillis()));
        }
    }
}


{%  endhighlight  %}

利用自己发送接收Handler消息维护一套调用逻辑,而如果循环调用`mPoiSearchClient.searchNearby(option);`方法是不能良好的触发百度回调方法`onGetPoiResult`，获取百度Poi回调数据，利用Handler的回调机制就能够比较好的完成，同时维护一个比较好的业务数据逻辑循环。

`new Handler(HandlerThread.getLooper)`利用该方法获取绑定指定Looper的Handler，若不指定参数（也就是默认无参构造函数）默认绑定当前线程的Looper。

这里需要注意的是，如果子线程获取Handler，子线程没有继承HandlerThread，则子线程需要`Prepare.Looper();`构建自身的Looper，用于Handler绑定。这是由于只有UI线程以及HandlerThread会提供自身线程的默认Looper，也就是天生就带Looper，优势所在。

HandlerThread开启后注意要在业务完成之后适时停止：利用`HandlerThread.getLooper.quit()`，去发送空消息终止线程，防止线程一直开启等待消息。

{:.center}
![UIThread](/assets/img/20150717/UIThread.png)


---

[Sending Operations to Multiple Threads-Google](https://developer.android.com/intl/zh-CN/training/multiple-threads/index.html)

[Communicating with the UI Thread](https://developer.android.com/intl/zh-CN/training/multiple-threads/communicate-ui.html#Handler)

[异步消息机制](http://blog.csdn.net/guolin_blog/article/details/9991569)



