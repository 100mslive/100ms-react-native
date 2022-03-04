package ReactNative.testcase;

import ReactNative.pageobject.HomePage;
import ReactNative.pageobject.PageFlowFunc;
import base.BaseTest;
import org.openqa.selenium.By;
import org.testng.Assert;
import org.testng.annotations.Test;

import static ReactNative.pageobject.HomePage.meetingUrlField;

public class HomePageTest extends BaseTest {

    String meeting_url = "https://ronitroy-xyz.app.100ms.live/meeting/kfg-ahl-lxm";
    String participant_name = "Ronit Roy";

    @Test
    public void Test_HomePage() throws InterruptedException {
        System.out.println("Verify Meeting url space Visible");
        Thread.sleep(2000);
        HomePage homePage = new HomePage();

        Assert.assertTrue(homePage.crossBtn.isDisplayed());
        //homePage.click_crossBtn();
//        homePage.clear_meeting_url();
//        String meeting_url_text = homePage.meetingUrlField.getText();
//        Assert.assertEquals(meeting_url_text, "Enter room ID");
//
//        Assert.assertTrue(homePage.meetingUrlField.isDisplayed());
//        homePage.put_meeting_url(meeting_url);
//        meeting_url_text = homePage.meetingUrlField.getText();
//        Assert.assertEquals(meeting_url , meeting_url_text);
//
//        Assert.assertTrue(homePage.joinMeetingBtn.isDisplayed());

      homePage.click_crossBtn();
      sendKeys((By) meetingUrlField, meeting_url);
        }

    //@Test
    public void Test_ParticipantName_Popup() throws InterruptedException {
        System.out.println("Verify Name space Visible");
        Thread.sleep(2000);
        HomePage homePage = new HomePage();
        PageFlowFunc pageFlow = new PageFlowFunc();

        pageFlow.goto_enter_participant_name_page();

        Assert.assertTrue(homePage.participantNameField.isDisplayed());
        String name_field_text = homePage.participantNameField.getText();
        Assert.assertEquals(name_field_text, "Enter user ID");

        homePage.put_participant_name(participant_name);
        name_field_text = homePage.participantNameField.getText();
        Assert.assertEquals(name_field_text, participant_name);

        Assert.assertTrue(homePage.nameOKbtn.isDisplayed());
        Assert.assertTrue(homePage.nameCancelbtn.isDisplayed());
    }

}
