---
layout: post
title: practice before sleep(1)
category: android
---

睡前写个简单的ViewDemo练手，简单的上拉加载更多ListView：

{% highlight java %}

public class LoadingDataLvActivity extends AppCompatActivity implements LoadingListView.onScrollLoadingDataListener {

    String[] mData = {"AAA","BBB","CCC","DDD","EEE","AAA","BBB","CCC"};
    ArrayList<String> mDataList = new ArrayList<>(Arrays.asList(mData));
    private LoadingListView mLoadingListView;
    ArrayAdapter<String> mAdapter;
    private ExecutorService mService;

    public static int   MSG_LOADING_END = 0X100;
    private LoadingHandler handler = new LoadingHandler(this);
    static class LoadingHandler extends Handler {
        WeakReference<LoadingDataLvActivity>  referenceAc;

        LoadingHandler(LoadingDataLvActivity ac){
            referenceAc = new WeakReference<>(ac);
        }

        @Override
        public void handleMessage(Message msg) {
            int what = msg.what;
            LoadingDataLvActivity ac = referenceAc.get();
            if (ac == null) return;
            if (what == LoadingDataLvActivity.MSG_LOADING_END ){
                ac.refreshEnd();
            }
        }
    }



    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_loading_data_lv);
        mLoadingListView = (LoadingListView) findViewById(R.id.lv_loading_data);
        mAdapter = new ArrayAdapter<>(this,R.layout.item_lv_data,R.id.item_tv,mDataList);
        mLoadingListView.setAdapter(mAdapter);
        mLoadingListView.setOnScrollLoadingListener(this);
        mService = Executors.newSingleThreadExecutor();
    }


    public void refreshEnd(){
        mAdapter.notifyDataSetChanged();
        mLoadingListView.setFooterVisibleState(false);
        mLoadingListView.resetScrollState();
    }

    @Override
    public void onLoad() {
        mService.execute(new LoadingTask());
    }

    class LoadingTask implements Runnable{

        @Override
        public void run() {
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    mDataList.addAll(Arrays.asList(mData));
                    mDataList.addAll(Arrays.asList(mData));
                    handler.sendEmptyMessage(MSG_LOADING_END);
                }
            },2000);
        }
    }
}

///////////////////////////////////////////////////////////////////////////////

public class LoadingListView extends ListView implements AbsListView.OnScrollListener{

    private View mFooterContentView;

    public LoadingListView(Context context) {
        this(context, null);
    }

    public LoadingListView(Context context, AttributeSet attrs) {
        super(context, attrs);
        initFooterLoadingView(context);
        this.setOnScrollListener(this);
    }

    /**
     * FooterView 外面包裹一层FrameLayout 高度WrapContent
     *          直接 GONE FooterView 导致FooterView内容不显示，但依旧占有一行，显示为空白区域
     */
    private void initFooterLoadingView(Context context) {
        View  mFooterView = LayoutInflater.from(context).inflate(R.layout.item_footer_loading, this, false);
        mFooterContentView = mFooterView.findViewById(R.id.ll_footer_content);
        this.addFooterView(mFooterView);
        mFooterContentView.setVisibility(GONE);
    }

    public void setFooterVisibleState(boolean isShow){
        if (isShow) mFooterContentView.setVisibility(VISIBLE);
            else mFooterContentView.setVisibility(GONE);
    }

    private int mFirstVisibleItem = -1;
    private int mLastVisibleItem= -1;
    private int mTotalItemNum= -1;
    private boolean   mScrollIsLoading = false;
    private onScrollLoadingDataListener mLoadingListener;

    public void setOnScrollLoadingListener(onScrollLoadingDataListener loadingListener){
        mLoadingListener = loadingListener;
    }

    /**
     * call this after onLoad done
     */
    public void resetScrollState(){
        mScrollIsLoading = false;
    }

    @Override
    public void onScrollStateChanged(AbsListView view, int scrollState) {
        if (mTotalItemNum == mLastVisibleItem){//the lastVisible one Has show
            if (scrollState == SCROLL_STATE_IDLE){
                if (!mScrollIsLoading){
                    mScrollIsLoading = true;
                    setFooterVisibleState(true);
                    //loading data interface
                    if (mLoadingListener != null){
                        mLoadingListener.onLoad();
                    }
                }
            }
        }
    }

    @Override
    public void onScroll(AbsListView view, int firstVisibleItem, int visibleItemCount, int totalItemCount) {
        mFirstVisibleItem = firstVisibleItem;
        mLastVisibleItem = mFirstVisibleItem + visibleItemCount;
        mTotalItemNum = totalItemCount;
    }

    /**
     * loading data
     */
    public interface onScrollLoadingDataListener {
        void onLoad();
    }
}

{% endhighlight %}

google推荐在设置Adaper之前设置FooterView或者HeaderView，FooterView 直接设置Visible状态会导致多一行，熟悉源码的会记得，二者的count会封装到Adapter中，所以内容Gone掉依旧会导致该行显示，只是是空白，所以解决方案是包装一层FramLayout设置其高度 `wrap_content`,GONE FrameLayout内部内容隐藏问题；
