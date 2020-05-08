package org.wso2.analytics.apim.rest.api.proxy;


import io.swagger.annotations.ApiParam;

import org.wso2.analytics.apim.rest.api.proxy.dto.ApplicationListDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.ErrorDTO;
import org.wso2.analytics.apim.rest.api.proxy.factories.AppinfoApiServiceFactory;

import org.wso2.msf4j.Microservice;
import org.wso2.msf4j.Request;
import org.wso2.msf4j.formparam.FileInfo;
import org.wso2.msf4j.formparam.FormDataParam;
import org.osgi.service.component.annotations.Component;

import java.io.InputStream;
import javax.ws.rs.ApplicationPath;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.HEAD;

import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.Response;

@Component(
    name = "org.wso2.analytics.apim.rest.api.proxy.AppinfoApi",
    service = Microservice.class,
    immediate = true
)
@Path("/analytics-dashboard/apis/analytics/v1.[\\d]+/appinfo")
@Consumes({ "application/json" })
@Produces({ "application/json" })
@ApplicationPath("/appinfo")
@io.swagger.annotations.Api(description = "the appinfo API")
public class AppinfoApi implements Microservice  {
   private final AppinfoApiService delegate = AppinfoApiServiceFactory.getAppinfoApi();

    
    @GET
    @Path("/{appname}")
    @Consumes({ "application/json" })
    @Produces({ "application/json" })
    @io.swagger.annotations.ApiOperation(value = "Retrieve the Applications list ", notes = "Retrieve the Applications list from the APIM server ", response = ApplicationListDTO.class, tags={  })
    @io.swagger.annotations.ApiResponses(value = { 
        @io.swagger.annotations.ApiResponse(code = 200, message = "Ok. REST API url successfully retrieved. ", response = ApplicationListDTO.class),
        
        @io.swagger.annotations.ApiResponse(code = 400, message = "Bad Request. Invalid request or validation error. ", response = ApplicationListDTO.class) })
    public Response appinfoAppnameGet(@ApiParam(value = "Unique ID of the resource type.",required=true) @PathParam("appname") String appname
 ,@Context Request request)
    throws NotFoundException {
        
        return delegate.appinfoAppnameGet(appname,request);
    }
}
