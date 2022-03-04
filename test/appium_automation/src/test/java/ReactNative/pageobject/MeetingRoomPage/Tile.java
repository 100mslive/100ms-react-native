package ReactNative.pageobject.MeetingRoomPage;

import base.BaseTest;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;

public class Tile extends BaseTest {

    @iOSXCUITFindBy(accessibility = "Back")
    @AndroidFindBy(accessibility =  "Ronit Roy (You)" )
    public static WebElement myTile;

    @iOSXCUITFindBy(accessibility = "Back")
    @AndroidFindBy(accessibility =  "Ronit New Name (You)" )
    public static WebElement myTile_nameChange;

    @iOSXCUITFindBy(accessibility = "Back")
    @AndroidFindBy(accessibility =  "//android.view.View[@content-desc='Ronit Roy (You)']/android.widget.FrameLayout" )
    public static WebElement VideoTile_myTile;
}
