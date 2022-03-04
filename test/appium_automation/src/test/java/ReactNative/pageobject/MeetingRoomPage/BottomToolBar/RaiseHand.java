package ReactNative.pageobject.MeetingRoomPage.BottomToolBar;

import base.BaseTest;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class RaiseHand extends BaseTest {

    @iOSXCUITFindBy(accessibility = "raiseHand")
    @AndroidFindBy(accessibility = "raiseHand")
    public WebElement raiseHandBtn;

    @iOSXCUITFindBy(accessibility = "Raised Hand ON")
    @AndroidFindBy(xpath = "//android.view.ViewGroup[1]/android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[4]/android.widget.HorizontalScrollView/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]/android.widget.TextView")
    public WebElement raiseHandOnTile;

    public void click_raiseHandBtn() throws InterruptedException {
        Assert.assertTrue(raiseHandBtn.isDisplayed());
        raiseHandBtn.click();
        Thread.sleep(3000);
    }
}
