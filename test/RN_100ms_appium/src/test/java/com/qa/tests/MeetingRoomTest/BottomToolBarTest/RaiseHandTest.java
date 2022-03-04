package com.qa.tests.MeetingRoomTest.BottomToolBarTest;

import com.qa.pages.MeetingRoomPage.BottomToolBar.RaiseHand;
import com.qa.pages.PageFlowFunc;
import org.testng.Assert;
import org.testng.annotations.Test;

public class RaiseHandTest {

    @Test
    public void Test_RaiseHand() throws InterruptedException {
        System.out.println("Verify Raise Hand Feature");
        Thread.sleep(2000);
        PageFlowFunc pageFlow = new PageFlowFunc();
        RaiseHand raiseHand = new RaiseHand();

        pageFlow.goto_meetingRoom_camOn_micOn();
        Assert.assertTrue(raiseHand.raiseHandBtn.isDisplayed());

        raiseHand.click_raiseHandBtn();
        Assert.assertTrue(raiseHand.raiseHandOnTile.isDisplayed());

        raiseHand.click_raiseHandBtn();
//        Add negative case
//        Assert.assertFalse(raiseHand.raiseHandOnTile.isDisplayed());

        pageFlow.leave_room();
    }

}
