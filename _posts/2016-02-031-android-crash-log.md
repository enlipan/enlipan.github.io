---
layout: post
title: Android CrashLog 
category: android
---

{% highlight java%}

public class CrashHandle implements Thread.UncaughtExceptionHandler {

    private static final String CRASH_LOG_PATH = Environment.getExternalStorageDirectory().getPath() + File.separator + "lee" + File.separator;

    private static final String CRASH_FILE = "crash_log.trace";

    private static CrashHandle sHandleInstance;

    private Context mAppContext;

    /**
     * 系统默认异常捕获管理
     */
    private Thread.UncaughtExceptionHandler mAppDefaultCrashHandler;

    public static CrashHandle getInstance(Context context) {
        if (sHandleInstance == null) {
            sHandleInstance = new CrashHandle();
            sHandleInstance.mAppContext = context.getApplicationContext();
            sHandleInstance.mAppDefaultCrashHandler = Thread.getDefaultUncaughtExceptionHandler();
            Thread.setDefaultUncaughtExceptionHandler(sHandleInstance);
        }
        return sHandleInstance;
    }


    /**
     * 线程被未捕获的异常终止后的回调函数
     * @param thread
     * @param ex
     */
    @Override
    public void uncaughtException(Thread thread, Throwable ex) {
        try {
            exportExceptions(ex);
        } catch (IOException e) {
            e.printStackTrace();
        }
        uploadCrashFileToServer();
        if (sHandleInstance.mAppDefaultCrashHandler != null) {
            sHandleInstance.mAppDefaultCrashHandler.uncaughtException(thread, ex);
        } else {
            android.os.Process.killProcess(android.os.Process.myPid());
        }
    }


    /**
     * 输出 Exception 到指定文件
     * @param ex
     */
    private void exportExceptions(Throwable ex) throws IOException {
        File crashFile = new File(CRASH_LOG_PATH + CRASH_FILE);
        if (crashFile.exists()){
            appendExceptionToFile(crashFile, ex);
        }else {
            if (crashFile.createNewFile()){
                appendExceptionToFile(crashFile,ex);
            }else {
                throw new RuntimeException("Create Crash Log Fail()");
            }
        }
    }

    /**
     *将异常信息Append到文件末尾中
     * @param crashFile
     * @param ex
     */
    private void appendExceptionToFile(File crashFile,Throwable ex) {


    }


    /**
     *上传CrashLog到服务器
     * CRASH_FILE：crash_log.trace
     * CRASH_LOG_PATH ：sdcard/lee/
     */
    private void uploadCrashFileToServer() {



    }

}

{% endhighlight %}


**toto**

---

Quote:

[Android程序Crash时的异常上报](http://blog.csdn.net/singwhatiwanna/article/details/17289479)

[收集app崩溃crash log](http://foolog.sinaapp.com/?p=2634)