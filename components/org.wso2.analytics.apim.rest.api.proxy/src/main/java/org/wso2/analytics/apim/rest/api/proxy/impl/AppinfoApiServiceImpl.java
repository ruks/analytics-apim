package org.wso2.analytics.apim.rest.api.proxy.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.wso2.analytics.apim.rest.api.proxy.APIMServiceStubs;
import org.wso2.analytics.apim.rest.api.proxy.AppinfoApiService;
import org.wso2.analytics.apim.rest.api.proxy.NotFoundException;
import org.wso2.analytics.apim.rest.api.proxy.Util;
import org.wso2.analytics.apim.rest.api.proxy.dto.UserClaimListDTO;
import org.wso2.analytics.apim.rest.api.proxy.internal.ServiceHolder;
import org.wso2.carbon.config.ConfigurationException;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.msf4j.Request;
import org.xml.sax.SAXException;

import java.io.IOException;
import java.nio.charset.Charset;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Base64;
import java.util.LinkedHashMap;
import javax.ws.rs.core.Response;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPathExpressionException;

/**
 *
 */
public class AppinfoApiServiceImpl extends AppinfoApiService {
    private final Util util = new Util();
    private static final Logger log = LoggerFactory.getLogger(AppinfoApiServiceImpl.class);

    @Override
    public Response appinfoAppnameGet(String appname, Request request) throws NotFoundException {
        ConfigProvider configProvider = ServiceHolder.getInstance().getConfigProvider();
        LinkedHashMap authConfig = null;
        try {
            authConfig = (LinkedHashMap) configProvider.getConfigurationObject("auth.configs");
        } catch (ConfigurationException e) {
            util.handleBadRequest("Unable to find Publisher server URL.");
        }
        LinkedHashMap properties = (LinkedHashMap) authConfig.get("properties");

        String url = (String) properties.get("publisherUrl");
        String user = (String) properties.get("adminUsername");
        String pass = (String) properties.get("adminPassword");

        String appOwner = this.getAppOwner(appname);
        APIMServiceStubs serviceStubs = new APIMServiceStubs(url, null);
        String authToken =
                new String(Base64.getEncoder().encode((user + ":" + pass).getBytes(Charset.defaultCharset())),
                        Charset.defaultCharset());
        feign.Response responseOfApiList = serviceStubs.getPublisherServiceStub().getUserInfo(authToken, appOwner);

        UserClaimListDTO listDTO = new UserClaimListDTO();
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true); // never forget this!
            DocumentBuilder builder = factory.newDocumentBuilder();

            Document doc = builder.parse(responseOfApiList.body().asInputStream());
            listDTO = Util.getUserClaimList(doc, appOwner);
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } catch (ParserConfigurationException e) {
            log.error(e.getMessage(), e);
        } catch (SAXException e) {
            log.error(e.getMessage(), e);
        } catch (XPathExpressionException e) {
            log.error(e.getMessage(), e);
        } finally {

        }
        return Response.ok().entity(listDTO).build();
    }

    private String getAppOwner(String appName) {
        try {
            try (Connection connection = ServiceHolder.getInstance().getDataSource().getConnection();
                    PreparedStatement statement = connection
                            .prepareStatement("select CREATED_BY from AM_APPLICATION where NAME=?")) {
                statement.setString(1, appName);
                try (ResultSet resultSet = statement.executeQuery()) {
                    if (resultSet.next()) {
                        return resultSet.getString("CREATED_BY");
                    }
                }
            }
        } catch (SQLException e) {
            log.error("Error occurred while rolling back inserting uploaded information into db transaction,", e);
        } finally {

        }
        return null;
    }
}
