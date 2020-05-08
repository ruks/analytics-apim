package org.wso2.analytics.apim.rest.api.proxy;

import org.wso2.analytics.apim.rest.api.proxy.*;
import org.wso2.analytics.apim.rest.api.proxy.dto.*;

import org.wso2.msf4j.formparam.FormDataParam;
import org.wso2.msf4j.formparam.FileInfo;
import org.wso2.msf4j.Request;

import org.wso2.analytics.apim.rest.api.proxy.dto.ApplicationListDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.ErrorDTO;

import java.util.List;
import org.wso2.analytics.apim.rest.api.proxy.NotFoundException;

import java.io.InputStream;

import javax.ws.rs.core.Response;
import javax.ws.rs.core.SecurityContext;

public abstract class AppinfoApiService {
    public abstract Response appinfoAppnameGet(String appname
  ,Request request) throws NotFoundException;
}
