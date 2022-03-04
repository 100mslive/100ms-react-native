package ReactNative.testcase.MeetingRoomTest;

import ReactNative.pageobject.HomePage;
import ReactNative.pageobject.MeetingRoomPage.BottomToolBar.LeaveRoom;
import ReactNative.pageobject.MeetingRoomPage.TopToolBar;
import ReactNative.pageobject.PageFlowFunc;
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
