package base;

import com.aventstack.extentreports.MediaEntityBuilder;
import com.aventstack.extentreports.Status;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.io.FileUtils;
import org.openqa.selenium.OutputType;
import org.testng.ITestContext;
import org.testng.ITestListener;
import org.testng.ITestResult;
import org.testng.Reporter;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class TestListener implements ITestListener{

    @Override
    public void onTestStart(ITestResult result) {
        AppiumServer.Start();

        String Platform = result.getMethod().getXmlTest().getLocalParameters().get("platform");

        if(Platform.contains("android_rn")){
            try {
                AppFactory.Android_ReactNative_LaunchApp();
            } catch (MalformedURLException e) {
                e.printStackTrace();
            }
        }else
        if(Platform.contains("ios_rn")){
            try {
                AppFactory.iOS_ReactNative_LaunchApp();
            } catch (MalformedURLException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onTestSuccess(ITestResult result) {
        try {
            ExtentReport.getTest().log(Status.PASS, "Test Passed");
            tearDown();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onTestFailure(ITestResult result) {
        if(result.getThrowable() != null) {
          StringWriter sw = new StringWriter();
          PrintWriter pw = new PrintWriter(sw);
          result.getThrowable().printStackTrace(pw);
          Utils.log().error(sw.toString());
        }

        File file = AppDriver.getDriver().getScreenshotAs(OutputType.FILE);

        byte[] encoded = null;
        try {
          encoded = Base64.encodeBase64(FileUtils.readFileToByteArray(file));
        } catch (IOException e1) {
          // TODO Auto-generated catch block
          e1.printStackTrace();
        }

        Map<String, String> params = new HashMap<String, String>();
        params = result.getTestContext().getCurrentXmlTest().getAllParameters();

        String imagePath = "Screenshots" + File.separator + params.get("platformName")
          + "_" + params.get("deviceName") + File.separator + AppDriver.getDateTime() + File.separator
          + result.getTestClass().getRealClass().getSimpleName() + File.separator + result.getName() + ".png";

        String completeImagePath = System.getProperty("user.dir") + File.separator + imagePath;

        try {
          FileUtils.copyFile(file, new File(imagePath));
          Reporter.log("This is the sample screenshot");
          Reporter.log("<a href='"+ completeImagePath + "'> <img src='"+ completeImagePath + "' height='400' width='400'/> </a>");
        } catch (IOException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
          ExtentReport.getTest().fail("Test Failed",
          MediaEntityBuilder.createScreenCaptureFromPath(completeImagePath).build());
          ExtentReport.getTest().fail("Test Failed",
          MediaEntityBuilder.createScreenCaptureFromBase64String(new String(encoded, StandardCharsets.US_ASCII)).build());
          ExtentReport.getTest().fail(result.getThrowable());
      }

    @Override
    public void onTestSkipped(ITestResult result) {
        try {
            ExtentReport.getTest().log(Status.SKIP, "Test Skipped");
            tearDown();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onTestFailedButWithinSuccessPercentage(ITestResult result) {

    }

    @Override
    public void onTestFailedWithTimeout(ITestResult result) {

    }

    @Override
    public void onStart(ITestContext context) {
      // TODO Auto-generated method stub
    }

    @Override
    public void onFinish(ITestContext context) {
      ExtentReport.getReporter().flush();
    }

    public void tearDown() throws InterruptedException {
        AppDriver.getDriver().quit();
        AppiumServer.Stop();
        Thread.sleep(3000);
    }
}
