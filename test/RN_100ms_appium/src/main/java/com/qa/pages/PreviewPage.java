package com.qa.pages;

import com.qa.BaseTest;
import io.appium.java_client.MobileElement;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;

public class PreviewPage extends BaseTest {

    @iOSXCUITFindBy(id = "live.hms.rn:id/surfaceView")
    @AndroidFindBy(id = "live.hms.rn:id/surfaceView")
    public MobileElement videoTile;

    @iOSXCUITFindBy(accessibility = "previewMuteVideo")
    @AndroidFindBy(accessibility = "previewMuteVideo")
    public MobileElement camBtn;

    @iOSXCUITFindBy(accessibility = "previewMuteAudio")
    @AndroidFindBy(accessibility = "previewMuteAudio")
    public MobileElement micBtn;

    @iOSXCUITFindBy(accessibility = "previewModalJoin")
    @AndroidFindBy(accessibility = "previewModalJoin")
    public MobileElement joinNowBtn;



}
