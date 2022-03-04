package com.qa.pages.MeetingRoomPage.BottomToolBar;

import com.qa.BaseTest;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.testng.Assert;

public class LeaveRoom extends BaseTest {

    @iOSXCUITFindBy(accessibility = "leaveMeeting")
    @AndroidFindBy(accessibility = "leaveMeeting")
    public WebElement leaveRoomBtn;

    @iOSXCUITFindBy(xpath = "//XCUIElementTypeApplication[@name='Flutter 100ms']/XCUIElementTypeWindow[1]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther")
    @AndroidFindBy(xpath = "//android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup")
    public WebElement leaveRoomPopup;

    @iOSXCUITFindBy(xpath = "//XCUIElementTypeApplication[@name='Flutter 100ms']/XCUIElementTypeWindow[1]/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther[2]/XCUIElementTypeOther")
    @AndroidFindBy(xpath = "//android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.widget.TextView")
    public WebElement leaveRoomPopupText;

    @iOSXCUITFindBy(accessibility = "Leave Room?")
    @AndroidFindBy(xpath = "//android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[2]")
    public WebElement leaveWithoutEndingRoom;

    @iOSXCUITFindBy(accessibility = "Yes")
    @AndroidFindBy(xpath = "//android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[3]")
    public WebElement endRoomForAll;

    @iOSXCUITFindBy(accessibility = "Yes")
    @AndroidFindBy(xpath = "//android.widget.FrameLayout/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup/android.view.ViewGroup[1]")
    public WebElement leaveRoomCancelBtn;

    public void click_leaveRoomBtn() throws InterruptedException {
        Assert.assertTrue(leaveRoomBtn.isDisplayed());
        leaveRoomBtn.click();
        Thread.sleep(3000);
    }

    public void click_leaveWithoutEndingRoom() throws InterruptedException {
        Assert.assertTrue(leaveWithoutEndingRoom.isDisplayed());
        leaveWithoutEndingRoom.click();
        Thread.sleep(3000);
    }

    public void click_endRoomForAll() throws InterruptedException {
        Assert.assertTrue(endRoomForAll.isDisplayed());
        endRoomForAll.click();
        Thread.sleep(3000);
    }

    public void click_leaveRoomCancelBtn() throws InterruptedException {
      Assert.assertTrue(leaveRoomCancelBtn.isDisplayed());
      leaveRoomCancelBtn.click();
      Thread.sleep(3000);
    }
}
