package com.qa.tests.MeetingRoomTest.BottomToolBarTest;

import com.qa.pages.HomePage;
import com.qa.pages.MeetingRoomPage.BottomToolBar.LeaveRoom;
import com.qa.pages.PageFlowFunc;
import org.testng.Assert;
import org.testng.annotations.Test;

public class LeaveRoomTest {

    @Test
    public void Test_LeaveRoom_Cancel() throws InterruptedException {
        System.out.println("Verify Participant Leave Room cancel option");
        Thread.sleep(2000);
        PageFlowFunc pageFlow = new PageFlowFunc();
        LeaveRoom leaveRoom = new LeaveRoom();
        HomePage homePage = new HomePage();

        pageFlow.goto_meetingRoom_camOn_micOn();
        Assert.assertTrue(leaveRoom.leaveRoomBtn.isDisplayed());

        leaveRoom.click_leaveRoomBtn();
        Assert.assertTrue(leaveRoom.leaveRoomPopup.isDisplayed());

        Assert.assertTrue(leaveRoom.leaveRoomPopupText.isDisplayed());
        String leave_room_flag = leaveRoom.leaveRoomPopupText.getAttribute("text");
        String leave_room_text = "End Room";
        Assert.assertEquals(leave_room_flag, leave_room_text);

        Assert.assertTrue(leaveRoom.leaveRoomCancelBtn.isDisplayed());
        leaveRoom.click_leaveRoomCancelBtn();
        Assert.assertTrue(leaveRoom.leaveRoomBtn.isDisplayed());
        //add more button checks later
    }

  @Test
  public void Test_LeaveRoom_LeaveWithoutEndingRoom() throws InterruptedException {
    System.out.println("Verify Participant Leave Room LeaveWithoutEndingRoom option");
    PageFlowFunc pageFlow = new PageFlowFunc();
    LeaveRoom leaveRoom = new LeaveRoom();
    HomePage homePage = new HomePage();

    pageFlow.goto_meetingRoom_camOn_micOn();
    Assert.assertTrue(leaveRoom.leaveRoomBtn.isDisplayed());
    leaveRoom.click_leaveRoomBtn();
    Assert.assertTrue(leaveRoom.leaveWithoutEndingRoom.isDisplayed());
    leaveRoom.click_leaveWithoutEndingRoom();
    Assert.assertTrue(homePage.joinMeetingBtn.isDisplayed());
  }

  @Test
  public void Test_LeaveRoom_EndRoomForAll() throws InterruptedException {
    System.out.println("Verify Participant Leave Room EndRoomForAll option");
    PageFlowFunc pageFlow = new PageFlowFunc();
    LeaveRoom leaveRoom = new LeaveRoom();
    HomePage homePage = new HomePage();

    pageFlow.goto_meetingRoom_camOn_micOn();
    Assert.assertTrue(leaveRoom.leaveRoomBtn.isDisplayed());
    leaveRoom.click_leaveRoomBtn();
    Assert.assertTrue(leaveRoom.endRoomForAll.isDisplayed());
    leaveRoom.click_endRoomForAll();
    Assert.assertTrue(homePage.joinMeetingBtn.isDisplayed());
  }

}
