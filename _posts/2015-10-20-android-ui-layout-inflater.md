---
layout: post
title: LayoutInflater.inflate函数剖析
category: android
---

LayoutInflater 实例获取：

1. LayoutInflater.from(context);                
2. (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);          
3. getLayoutInflater(); //调用Activity的getLayoutInflater()         




{% highlight Java %}

    public View inflate(XmlPullParser parser, ViewGroup root) {
        return inflate(parser, root, root != null);
    }

{%  endhighlight %}

从这里我们看出双参数inflate函数，相当于三参数函数的简写，但是注意双参数构造函数，不能完全表示所有三参数情形:

1. root非空，执行inflate(source,root,true)         
2. root为null空，执行inflate(source,null,false)       

但是无法表示root非空时inflate(source,root,false)这一第三种重要情形。

这里我们进入源码深入理解加载机制：

{% highlight Java %}

    public View inflate(int resource, ViewGroup root, boolean attachToRoot) {
        final Resources res = getContext().getResources();
        if (DEBUG) {
            Log.d(TAG, "INFLATING from resource: \"" + res.getResourceName(resource) + "\" ("
                    + Integer.toHexString(resource) + ")");
        }
        final XmlResourceParser parser = res.getLayout(resource);
        try {
            return inflate(parser, root, attachToRoot);
        } finally {
            parser.close();
        }
    }

{%  endhighlight %}

{% highlight Java %}
public View inflate(XmlPullParser parser, ViewGroup root, boolean attachToRoot) {
        synchronized (mConstructorArgs) {
            Trace.traceBegin(Trace.TRACE_TAG_VIEW, "inflate");
            final AttributeSet attrs = Xml.asAttributeSet(parser);
            Context lastContext = (Context)mConstructorArgs[0];
            mConstructorArgs[0] = mContext;
            View result = root;
            try {
                // Look for the root node.
                int type;
                while ((type = parser.next()) != XmlPullParser.START_TAG &&
                        type != XmlPullParser.END_DOCUMENT) {
                    // Empty
                }
                if (type != XmlPullParser.START_TAG) {
                    throw new InflateException(parser.getPositionDescription()
                            + ": No start tag found!");
                }
                final String name = parser.getName();                
                if (DEBUG) {
                    System.out.println("**************************");
                    System.out.println("Creating root view: "
                            + name);
                    System.out.println("**************************");
                }
                if (TAG_MERGE.equals(name)) {
                    if (root == null || !attachToRoot) {
                        throw new InflateException("<merge /> can be used only with a valid "
                                + "ViewGroup root and attachToRoot=true");
                    }
                    rInflate(parser, root, attrs, false, false);
                } else {
                    // Temp is the root view that was found in the xml
                    final View temp = createViewFromTag(root, name, attrs, false);
                    ViewGroup.LayoutParams params = null;
                    if (root != null) {
                        if (DEBUG) {
                            System.out.println("Creating params from root: " +
                                    root);
                        }
                        // Create layout params that match root, if supplied
                        params = root.generateLayoutParams(attrs);
                        if (!attachToRoot) {
                            // Set the layout params for temp if we are not
                            // attaching. (If we are, we use addView, below)
                            temp.setLayoutParams(params);
                        }
                    }
                    if (DEBUG) {
                        System.out.println("-----> start inflating children");
                    }
                    // Inflate all children under temp
                    rInflate(parser, temp, attrs, true, true);
                    if (DEBUG) {
                        System.out.println("-----> done inflating children");
                    }
                    // We are supposed to attach all the views we found (int temp)
                    // to root. Do that now.
                    if (root != null && attachToRoot) {
                        root.addView(temp, params);
                    }
                    // Decide whether to return the root that was passed in or the
                    // top view found in xml.
                    if (root == null || !attachToRoot) {
                        result = temp;
                    }
                }
            } catch (XmlPullParserException e) {
                InflateException ex = new InflateException(e.getMessage());
                ex.initCause(e);
                throw ex;
            } catch (IOException e) {
                InflateException ex = new InflateException(
                        parser.getPositionDescription()
                        + ": " + e.getMessage());
                ex.initCause(e);
                throw ex;
            } finally {
                // Don't retain static reference on context.
                mConstructorArgs[0] = lastContext;
                mConstructorArgs[1] = null;
            }

            Trace.traceEnd(Trace.TRACE_TAG_VIEW);
            return result;
        }
    }

{%  endhighlight %}

代码比较长，需要梳理一下，可以自己画个简易脑图或者流程图示意一下，有几段关键的代码要扣出来研究：


{% highlight Java %}

//第一段
                    // Temp is the root view that was found in the xml
                    final View temp = createViewFromTag(root, name, attrs, false);
                    ViewGroup.LayoutParams params = null;
                    if (root != null) {
                        if (DEBUG) {
                            System.out.println("Creating params from root: " +
                                    root);
                        }
                        // Create layout params that match root, if supplied
                        params = root.generateLayoutParams(attrs);
                        if (!attachToRoot) {
                            // Set the layout params for temp if we are not
                            // attaching. (If we are, we use addView, below)
                            temp.setLayoutParams(params);
                        }
                    }

//第二段
                    // We are supposed to attach all the views we found (int temp)
                    // to root. Do that now.
                    if (root != null && attachToRoot) {
                        root.addView(temp, params);
                    }

//第三段
                    // Decide whether to return the root that was passed in or the
                    // top view found in xml.
                    if (root == null || !attachToRoot) {
                        result = temp;
                    }

{%  endhighlight %}

其实到这里三段一扣出来已经很明显了。直接结论：

1.  root非空，attachToRoot为true，直接将构建的子View 添加到parent的ViewGroup里面进行绑定，所有的布局参数有效，且任何touch event事件可以被传递。

2.  root非空，attachToRoot为false，构建的子View最外层布局参数会被添加到View中，参数有效，但View不会绑定parent ViewGroup，需要后期自己手动添加进入parent，父布局才能接受event等事件传递与监听             
3.  root为空，可以看到连最外层布局参数都不会被加入进入构建View


---

Quot：

[What does the LayoutInflater attachToRoot parameter mean?](http://stackoverflow.com/questions/12567578/what-does-the-layoutinflater-attachtoroot-parameter-mean)

[Making sense of LayoutInflater](http://stackoverflow.com/questions/5026926/making-sense-of-layoutinflater)

[Android LayoutInflater原理分析，带你一步步深入了解View(一)](http://blog.csdn.net/guolin_blog/article/details/12921889)
