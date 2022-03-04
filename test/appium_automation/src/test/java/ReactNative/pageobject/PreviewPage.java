package ReactNative.pageobject;

import base.BaseTest;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class PreviewPage extends BaseTest {

    @iOSXCUITFindBy(id = "live.hms.rn:id/surfaceView")
    @AndroidFindBy(id = "live.hms.rn:id/surfaceView")
    public WebElement videoTile;

    @iOSXCUITFindBy(accessibility = "previewMuteVideo")
    @AndroidFindBy(accessibility = "previewMuteVideo")
    public WebElement camBtn;

    @iOSXCUITFindBy(accessibility = "previewMuteAudio")
    @AndroidFindBy(accessibility = "previewMuteAudio")
    public WebElement micBtn;

    @iOSXCUITFindBy(accessibility = "previewModalJoin")
    @AndroidFindBy(accessibility = "previewModalJoin")
    public WebElement joinNowBtn;

    public void click_camBtn() throws InterruptedException {
        camBtn.click();
        Thread.sleep(3000);
    }

    public void click_micBtn() throws InterruptedException {
        micBtn.click();
        Thread.sleep(3000);
    }

    public void click_joinNowBtn() throws InterruptedException {
        joinNowBtn.click();
        Thread.sleep(3000);
    }

}
