---
layout: post
title: Android ViewPager 循环
category: android
---

循环ViewPager实现：

为了实现ViewPager的循环滚动，假如存在实体集合：{A,B,C,D}，

则我们需要设定集合为{D,A,B,C,D,A}，其中首页与末页是我们设定的假页面，当滚动到首页或末页时，我们利用ViewPager的不带页面动画的页面切换函数瞬间闪动到对应真实页面，也就是**首页的制造页面 D 闪动到 真实页面 D 处；** **末页的制造页面A 闪动到 真实页面 A处；**，由于页面元素是一样的，这将会造成一种假象是 从 真实的页面 D 滑动到了 真实页面 A；其实真正的过程却是 D 滑动到 A， A再闪动到首页A，这样就完成了循环滚动页面；但其实我们真正需要的页面仅仅是 ABCD；


{:.center}
![Looper-ViewPager](\assets\img\20160101\looperviewpager.png)


{%  highlight java  %}

public class MainActivity extends AppCompatActivity {

    private ViewPager mViewPager;
    final int reallyFirstPosition  = 1;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mViewPager = (ViewPager) findViewById(R.id.viewpager);
        mViewPager.setOnPageChangeListener(new ViewPager.OnPageChangeListener() {
            @Override
            public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels) {}

            @Override
            public void onPageSelected(int position) {}

            @Override
            public void onPageScrollStateChanged(int state) {
                final int  lastPosition = mViewPager.getAdapter().getCount() - 1;
                if (state == ViewPager.SCROLL_STATE_DRAGGING) {
                    Log.d("TAG", "SCROLL_STATE_DRAGGING");
                } else if (state == ViewPager.SCROLL_STATE_IDLE) {//页面加载完成
                    Log.d("TAG", "SCROLL_STATE_IDLE");
                    if (mViewPager.getCurrentItem() == lastPosition) {
                        mViewPager.setCurrentItem(reallyFirstPosition, false);
                    } else if (mViewPager.getCurrentItem() == 0) {
                        mViewPager.setCurrentItem(lastPosition - 1, false);
                    }
                } else if (state == ViewPager.SCROLL_STATE_SETTLING) {
                    Log.d("TAG", "SCROLL_STATE_SETTLING");
                }
            }
        });
        CustomPagerAdapter adapter = new CustomPagerAdapter(this);
        mViewPager.setAdapter(adapter);
        mViewPager.setCurrentItem(reallyFirstPosition);
    }

    class CustomPagerAdapter extends PagerAdapter{
        //此处 真正需要的 ImageResource 其实只有中间的 三张  
        int [] resourceIds = {R.drawable.guidepage02,R.drawable.guidehome,R.drawable.guidepage01,R.drawable.guidepage02,R.drawable.guidehome};
        private LayoutInflater mInflater;
        private Context mContext;
        CustomPagerAdapter(Context context){
            mContext = context;
            mInflater = LayoutInflater.from(context);
        }

        @Override
        public int getCount() {
            return resourceIds.length;
        }

        @Override
        public boolean isViewFromObject(View view, Object object) {
            return view == object;
        }

        @Override
        public Object instantiateItem(ViewGroup container, int position) {
            ImageView itemIv = (ImageView) mInflater.inflate(R.layout.item_vp_iv,container,false);
            itemIv.setImageResource(resourceIds[position]);
            container.addView(itemIv);
            return itemIv;
        }

        @Override
        public void destroyItem(ViewGroup container, int position, Object object) {
            container.removeView((View) object);
        }
    }
}


{% endhighlight %}