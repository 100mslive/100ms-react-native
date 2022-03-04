package ReactNative.pageobject;

import base.BaseTest;
import base.PlatformSelector;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class HomePage extends BaseTest {

    //Landing Page
    @iOSXCUITFindBy(accessibility = "roomIdInput")
    @AndroidFindBy(accessibility = "roomIdInput")
    public static WebElement meetingUrlField;

    //Add later
    @iOSXCUITFindBy(accessibility = "removeText")
    @AndroidFindBy(accessibility = "removeText")
    public WebElement crossBtn;

    @iOSXCUITFindBy(accessibility = "joinButton")
    @AndroidFindBy(accessibility = "joinButton")
    public WebElement joinMeetingBtn;

    public void clear_meeting_url(){
        String platform = PlatformSelector.selectPlatform();
        if(platform.equalsIgnoreCase("Android")){
            meetingUrlField.clear();
        }else
        if(platform.equalsIgnoreCase("iOS")){
            meetingUrlField.clear();
            meetingUrlField.clear();
        }
    }

    public void put_meeting_url(String txt){
        Assert.assertTrue(meetingUrlField.isDisplayed());
        meetingUrlField.sendKeys(txt);
    }

    public void click_crossBtn() throws InterruptedException {
        Assert.assertTrue(crossBtn.isDisplayed());
        crossBtn.click();
        Thread.sleep(2000);
    }

    public void click_joinMeetingBtn() throws InterruptedException {
        Assert.assertTrue(joinMeetingBtn.isDisplayed());
        joinMeetingBtn.click();
        Thread.sleep(2000);
    }

    //HomePage Participant name Popup
    @iOSXCUITFindBy(accessibility = "usernameInput")
    @AndroidFindBy(accessibility = "usernameInput")
    public WebElement participantNameField;

    @iOSXCUITFindBy(accessibility = "joinButtonWithName")
    @AndroidFindBy(accessibility = "joinButtonWithName")
    public WebElement nameOKbtn;

    @iOSXCUITFindBy(accessibility = "cancelJoinButton")
    @AndroidFindBy(accessibility = "cancelJoinButton")
    public WebElement nameCancelbtn;

    public void put_participant_name(String txt){
        Assert.assertTrue(participantNameField.isDisplayed());
        participantNameField.sendKeys(txt);
    }

    public void click_okBtn() throws InterruptedException {
        Assert.assertTrue(nameOKbtn.isDisplayed());
        nameOKbtn.click();
        Thread.sleep(2000);
    }

    //HomePage OS permission
    @AndroidFindBy(id = "com.android.permissioncontroller:id/permission_allow_foreground_only_button")
    public WebElement permissionCamMic;

    public void accept_permission() throws InterruptedException {
        String platform = PlatformSelector.selectPlatform();
        if (platform.equalsIgnoreCase("Android")) {
            Assert.assertTrue(permissionCamMic.isDisplayed());
            permissionCamMic.click();
            Thread.sleep(2000);
        } else if (platform.equalsIgnoreCase("iOS")) {}
    }
}
