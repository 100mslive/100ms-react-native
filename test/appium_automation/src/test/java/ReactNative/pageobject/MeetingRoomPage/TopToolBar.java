package ReactNative.pageobject.MeetingRoomPage;

import base.BaseTest;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class TopToolBar extends BaseTest {

    @iOSXCUITFindBy(accessibility = "Audio")
    @AndroidFindBy(xpath = "//android.view.ViewGroup/android.view.ViewGroup[1]/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView")
    public WebElement headingCta;

    @iOSXCUITFindBy(accessibility = "Show menu")
    @AndroidFindBy(xpath = "  //android.view.ViewGroup/android.view.ViewGroup[1]/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.widget.TextView")
    public WebElement switchCamBtn;

    @iOSXCUITFindBy(xpath = "//XCUIElementTypeApplication[@name='Flutter 100ms']/XCUIElementTypeWindow[1]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeButton[2]")
    @AndroidFindBy(xpath = "//android.view.ViewGroup/android.view.ViewGroup[1]/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]/android.widget.TextView")
    public WebElement speakerBtn;

    @iOSXCUITFindBy(accessibility = "Show menu")
    @AndroidFindBy(xpath = "//android.view.ViewGroup/android.view.ViewGroup[1]/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]/android.widget.TextView")
    public WebElement menuBtn;

    @iOSXCUITFindBy(accessibility = "Show menu")
    @AndroidFindBy(xpath = "//android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView")
    public WebElement settingPopupHeading;

    public void check_headingCta() throws InterruptedException {
        Assert.assertTrue(headingCta.isDisplayed());
        Thread.sleep(3000);
    }

    public void click_switchCamBtn() throws InterruptedException {
      Assert.assertTrue(switchCamBtn.isDisplayed());
      switchCamBtn.click();
      Thread.sleep(3000);
    }

    public void click_speakerBtn() throws InterruptedException {
        Assert.assertTrue(speakerBtn.isDisplayed());
        speakerBtn.click();
        Thread.sleep(3000);
    }

    public void click_menuBtn() throws InterruptedException {
        Assert.assertTrue(menuBtn.isDisplayed());
        menuBtn.click();
        Thread.sleep(3000);
    }

}
