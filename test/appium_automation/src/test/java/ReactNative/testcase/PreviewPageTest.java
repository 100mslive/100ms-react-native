package ReactNative.testcase;

import ReactNative.pageobject.HomePage;
import ReactNative.pageobject.PageFlowFunc;
import ReactNative.pageobject.PreviewPage;
import org.testng.Assert;
import org.testng.annotations.Test;

public class PreviewPageTest {

    @Test
    public void Test_PreviewPage() throws InterruptedException {
        System.out.println("Verify Name space Visible");
        Thread.sleep(2000);
        PageFlowFunc pageFlow = new PageFlowFunc();
        PreviewPage previewPage = new PreviewPage();

        pageFlow.goto_preview_page();

        Assert.assertTrue(previewPage.videoTile.isDisplayed());
        Assert.assertTrue(previewPage.camBtn.isDisplayed());
        Assert.assertTrue(previewPage.micBtn.isDisplayed());
        Assert.assertTrue(previewPage.joinNowBtn.isDisplayed());

        previewPage.click_camBtn();
        previewPage.click_micBtn();
        previewPage.click_joinNowBtn();
    }

}
