package ReactNative.testcase.MeetingRoomTest.MenuDropDownTest;

import ReactNative.pageobject.MeetingRoomPage.BottomToolBar.AudioVideo;
import ReactNative.pageobject.MeetingRoomPage.MenuDropDown.SetLayout;
import ReactNative.pageobject.MeetingRoomPage.TopToolBar;
import ReactNative.pageobject.PageFlowFunc;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SetLayoutTest {

    @Test
    public void Test_SetLayout_Audio() throws InterruptedException {
        System.out.println("Verify set layout to audio");
        Thread.sleep(2000);
        PageFlowFunc pageFlow = new PageFlowFunc();
        SetLayout setLayout = new SetLayout();
        AudioVideo audioVideo = new AudioVideo();
        TopToolBar topToolBar = new TopToolBar();

        pageFlow.goto_meetingRoom_menuDropDown();
        Assert.assertTrue(setLayout.layoutModalPopup.isDisplayed());
//        setLayout.click_audioViewBtn();

        String camBtn_flag = audioVideo.camBtn.getAttribute("clickable");
        String camBtn_ended_text = "false";
        Assert.assertEquals(camBtn_flag, camBtn_ended_text);

        topToolBar.click_menuBtn();
//        Assert.assertTrue(setLayout.videoViewBtn.isDisplayed());
//        setLayout.click_videoViewBtn();

        camBtn_flag = audioVideo.camBtn.getAttribute("clickable");
        camBtn_ended_text = "true";
        Assert.assertEquals(camBtn_flag, camBtn_ended_text);

        pageFlow.leave_room();
    }

}
