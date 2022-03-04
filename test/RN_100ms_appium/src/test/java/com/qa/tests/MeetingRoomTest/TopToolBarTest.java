package com.qa.tests.MeetingRoomTest;

import com.qa.pages.HomePage;
import com.qa.pages.MeetingRoomPage.BottomToolBar.LeaveRoom;
import com.qa.pages.MeetingRoomPage.TopToolBar;
import com.qa.pages.PageFlowFunc;
import org.testng.Assert;
import org.testng.annotations.Test;

public class TopToolBarTest {

    @Test
    public void Test_SpeakerBtn() throws InterruptedException {
        System.out.println("Verify SpeakerBtn");
        Thread.sleep(2000);
        PageFlowFunc pageFlow = new PageFlowFunc();
        TopToolBar topToolBar = new TopToolBar();

        pageFlow.goto_meetingRoom_camOn_micOn();
        Assert.assertTrue(topToolBar.speakerBtn.isDisplayed());
        topToolBar.click_speakerBtn();
    }

    @Test
    public void Test_MenuBtn() throws InterruptedException {
      System.out.println("Verify MenuBtn");
      Thread.sleep(2000);
      PageFlowFunc pageFlow = new PageFlowFunc();
      TopToolBar topToolBar = new TopToolBar();

      pageFlow.goto_meetingRoom_camOn_micOn();
      Assert.assertTrue(topToolBar.menuBtn.isDisplayed());
      topToolBar.click_menuBtn();
      Assert.assertTrue(topToolBar.settingPopupHeading.isDisplayed());

    }

}
