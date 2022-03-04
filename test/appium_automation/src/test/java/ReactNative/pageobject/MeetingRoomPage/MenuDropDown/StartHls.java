package ReactNative.pageobject.MeetingRoomPage.MenuDropDown;

import base.BaseTest;
import io.appium.java_client.pagefactory.AndroidFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class StartHls extends BaseTest {

    //@iOSXCUITFindBy(accessibility = "Start HLS")
    @AndroidFindBy(accessibility = "Start HLS")
    public WebElement startHLSBtn;

    public void click_startHLSBtn() throws InterruptedException {
        Assert.assertTrue(startHLSBtn.isDisplayed());
        startHLSBtn.click();
        Thread.sleep(3000);
    }
}
