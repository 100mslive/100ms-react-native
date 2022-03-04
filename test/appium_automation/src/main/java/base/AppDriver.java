package base;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.service.local.AppiumDriverLocalService;

import java.util.HashMap;
import java.util.Properties;

public class AppDriver {

//    private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();
//
//    public static WebDriver getDriver(){
//        return driver.get();
//    }
//
//    public static void setDriver(WebDriver Driver){
//        driver.set(Driver);
//        System.out.println("Driver is set");
//    }

    protected static ThreadLocal <AppiumDriver> driver = new ThreadLocal<AppiumDriver>();
    protected static ThreadLocal <Properties> props = new ThreadLocal<Properties>();
    protected static ThreadLocal <HashMap<String, String>> strings = new ThreadLocal<HashMap<String, String>>();
    protected static ThreadLocal <String> platform = new ThreadLocal<String>();
    protected static ThreadLocal <String> dateTime = new ThreadLocal<String>();
    protected static ThreadLocal <String> deviceName = new ThreadLocal<String>();
    private static AppiumDriverLocalService server;
    Utils utils = new Utils();

    public static AppiumDriver getDriver() {
      return driver.get();
    }

    public static void setDriver(AppiumDriver driver2) {
      driver.set(driver2);
    }

    public Properties getProps() {
      return props.get();
    }

    public void setProps(Properties props2) {
      props.set(props2);
    }

    public HashMap<String, String> getStrings() {
      return strings.get();
    }

    public void setStrings(HashMap<String, String> strings2) {
      strings.set(strings2);
    }

    public static String getPlatform() {
      return platform.get();
    }

    public void setPlatform(String platform2) {
      platform.set(platform2);
    }

    public static String getDateTime() {
      return dateTime.get();
    }

    public void setDateTime(String dateTime2) {
      dateTime.set(dateTime2);
    }

    public static String getDeviceName() {
      return deviceName.get();
    }

    public void setDeviceName(String deviceName2) {
      deviceName.set(deviceName2);
    }
}
