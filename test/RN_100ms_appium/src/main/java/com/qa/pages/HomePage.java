package com.qa.pages;

import com.qa.BaseTest;
import io.appium.java_client.MobileElement;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class HomePage extends BaseTest {

    //Landing Page
    @iOSXCUITFindBy(accessibility = "roomIdInput")
    @AndroidFindBy(accessibility = "roomIdInput")
    public static MobileElement meetingUrlField;

    //Add later
    @iOSXCUITFindBy(accessibility = "removeText")
    @AndroidFindBy(xpath = "//android.view.ViewGroup[@content-desc=\"removeText\"]/android.widget.TextView")
    public MobileElement crossBtn;

    @iOSXCUITFindBy(accessibility = "joinButton")
    @AndroidFindBy(accessibility = "joinButton")
    public MobileElement joinMeetingBtn;

    public void clear_meeting_url(){
        String platform = BaseTest.selectPlatform();
        if(platform.equalsIgnoreCase("Android")){
            meetingUrlField.clear();
        }else
        if(platform.equalsIgnoreCase("iOS")){
            meetingUrlField.clear();
            meetingUrlField.clear();
        }
    }

    public HomePage put_meeting_url(String meetingUrl) {
      clear(meetingUrlField);
      sendKeys(meetingUrlField, meetingUrl, "login with " + meetingUrl);
      return this;
    }

    public HomePage goto_enterName(String meetingUrl) {
      put_meeting_url(meetingUrl);
      click(joinMeetingBtn);
      return new HomePage();
    }

    //HomePage Participant name Popup
    @iOSXCUITFindBy(accessibility = "usernameInput")
    @AndroidFindBy(accessibility = "usernameInput")
    public MobileElement participantNameField;

    @iOSXCUITFindBy(accessibility = "joinButtonWithName")
    @AndroidFindBy(accessibility = "joinButtonWithName")
    public MobileElement nameOKbtn;

    @iOSXCUITFindBy(accessibility = "cancelJoinButton")
    @AndroidFindBy(accessibility = "cancelJoinButton")
    public MobileElement nameCancelbtn;

    public HomePage put_participant_name(String name){
      clear(participantNameField);
      sendKeys(participantNameField, name, "Participant name- " + name);
      return this;
    }

    public PreviewPage goto_previewPage(String meetingUrl, String name) throws InterruptedException {
      goto_enterName(meetingUrl);
      put_participant_name(name);
      click(nameOKbtn);
      accept_permission();
      return new PreviewPage();
    }

    //HomePage OS permission
    @AndroidFindBy(id = "com.android.permissioncontroller:id/permission_allow_foreground_only_button")
    public MobileElement permissionCamMic;

    public void accept_permission() throws InterruptedException {
        String platform = BaseTest.selectPlatform();
        if (platform.equalsIgnoreCase("Android")) {
            click(permissionCamMic);
            Thread.sleep(2000);
        } else if (platform.equalsIgnoreCase("iOS")) {}
    }
}
