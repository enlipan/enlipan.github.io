---
layout: post
title: 几种常见排序算法
category: algorithm
---

**主题占位 周末更新**

### 直接插入排序

插入排序与选择排序的逻辑概念要清晰：

选择排序是依次从数组中选出对应位置大小的数，放置到对应位置上，而插入排序是从部分有序到全部有序的过程，包含移位插入的过程；





### 快速排序

快速排序的核心思想：分治法，递归，交换，其核心操作是数组划分确定基准点，进而依据基准点递归交换完成排序

最简单的首元素为轴：

{% highlight java%}

private static int partitionNumFirstNumKey(int[] nums, int left, int right) {
    int keyNum = nums[left];
    while (left < right) {
        while (left < right && nums[right] >= keyNum) {
            right--;
        }
        if (left < right) {
            nums[left] = nums[right];
            left++;
        }

        while (left < right && nums[left] <= keyNum) {
            left++;
        }
        if (left < right) {
            nums[right] = nums[left];
            right--;
        }

    }
    nums[left] = keyNum;
    return left;
}         

{% endhighlight %}



快排优化：

轴优化： 随机值、三值取中

递归优化

数量级优化：当数组数量级较小时，直接采用插入排序效果更好


### K大数



### 归并排序

归并排序核心思想：分治法，有序数组的合并，其核心操作是将数组划分为单个数之后，逐一合并单元素有序数组




### 堆排序
