package org.wso2.analytics.apim.rest.api.proxy.factories;

import org.wso2.analytics.apim.rest.api.proxy.AppinfoApiService;
import org.wso2.analytics.apim.rest.api.proxy.impl.AppinfoApiServiceImpl;

/**
 *
 */
public class AppinfoApiServiceFactory {
    private static final AppinfoApiService service = new AppinfoApiServiceImpl();

    public static AppinfoApiService getAppinfoApi() {
        return service;
    }
}
