/*
 * Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.wso2.analytics.apim.rest.api.proxy;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.wso2.analytics.apim.rest.api.proxy.dto.ErrorDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.UserClaimDTO;
import org.wso2.analytics.apim.rest.api.proxy.dto.UserClaimListDTO;
import org.wso2.analytics.apim.rest.api.proxy.exceptions.BadRequestException;
import org.wso2.analytics.apim.rest.api.proxy.exceptions.InternalServerErrorException;
import org.wso2.carbon.utils.StringUtils;

import java.util.Arrays;
import java.util.List;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;

/**
 * Util class.
 */
public class Util {
    private static final Log log = LogFactory.getLog(Util.class);
    private static final long STATUS_BAD_REQUEST_MESSAGE_CODE = 400L;
    private static final String STATUS_BAD_REQUEST_MESSAGE = "Bad Request";
    private static final long STATUS_INTERNAL_SERVER_ERROR_CODE = 500L;
    private static final String STATUS_INTERNAL_SERVER_ERROR_MESSAGE = "Internal server error";

    /**
     * Logs the error, builds a internalServerErrorException with specified details and throws it.
     *
     * @param msg error message
     * @param t Throwable instance

     * @throws InternalServerErrorException
     */
    public void handleInternalServerError(String msg, Throwable t)
            throws InternalServerErrorException {
        InternalServerErrorException internalServerErrorException = buildInternalServerErrorException(msg);
        log.error(msg, t);
        throw internalServerErrorException;
    }
    /**
     * Logs the error, builds a internalServerErrorException with specified details and throws it.
     *
     * @param msg error message
     * @throws InternalServerErrorException
     */
    public void handleInternalServerError(String msg)
            throws InternalServerErrorException {
        InternalServerErrorException internalServerErrorException = buildInternalServerErrorException(msg);
        log.error(msg);
        throw internalServerErrorException;
    }

    /**
     * Returns a new InternalServerErrorException.
     *
     * @param errorDescription Error Description
     * @return a new InternalServerErrorException with default details as a response DTO
     */
    private InternalServerErrorException buildInternalServerErrorException(String errorDescription) {
        ErrorDTO errorDTO = getErrorDTO(STATUS_INTERNAL_SERVER_ERROR_MESSAGE,
                STATUS_INTERNAL_SERVER_ERROR_CODE, errorDescription);
        return new InternalServerErrorException(errorDTO);
    }

    /**
     * Logs the error, builds a BadRequestException with specified details and throws it.
     *
     * @param msg error message
     * @throws BadRequestException
     */
    public void handleBadRequest(String msg) throws BadRequestException {
        BadRequestException badRequestException = buildBadRequestException(msg);
        log.error(msg);
        throw badRequestException;
    }

    /**
     * Returns a new BadRequestException.
     *
     * @param errorDescription Error Description
     * @return a new BadRequestException with default details as a response DTO
     */
    private BadRequestException buildBadRequestException(String errorDescription) {
        ErrorDTO errorDTO = getErrorDTO(STATUS_BAD_REQUEST_MESSAGE,
                STATUS_BAD_REQUEST_MESSAGE_CODE, errorDescription);
        return new BadRequestException(errorDTO);
    }

    /**
     * Returns a generic errorDTO.
     *
     * @param message specifies the error message
     * @return A generic errorDTO with the specified details
     */
    private ErrorDTO getErrorDTO(String message, Long code, String description) {
        ErrorDTO errorDTO = new ErrorDTO();
        errorDTO.setCode(code);
        errorDTO.setMoreInfo("");
        errorDTO.setMessage(message);
        errorDTO.setDescription(description);
        return errorDTO;
    }

    public static UserClaimListDTO getUserClaimList(Document doc, String appOwner) throws XPathExpressionException {
        XPathFactory xpathfactory = XPathFactory.newInstance();
        XPath xpath = xpathfactory.newXPath();
        xpath.setNamespaceContext(new NamespaceResolver(doc));
        XPathExpression expr = xpath.compile("//ax2548:displayName");
        Object result = expr.evaluate(doc, XPathConstants.NODESET);
        NodeList nodes = (NodeList) result;
        List<String> claimList = Arrays.asList("First Name", "Telephone", "Email", "Country");
        UserClaimListDTO userClaimListDTO = new UserClaimListDTO();
        UserClaimDTO appOwnerClaim = new UserClaimDTO();
        appOwnerClaim.setName("Owner");
        appOwnerClaim.setValue(appOwner);
        userClaimListDTO.addListItem(appOwnerClaim);
        for (int i = 0; i < nodes.getLength(); i++) {
            Element element = (Element) nodes.item(i).getParentNode();
            if (claimList.contains(nodes.item(i).getTextContent())) {
                String claimName = nodes.item(i).getTextContent();
                NodeList nodeList = element.getElementsByTagName("ax2548:fieldValue");
                if (nodeList.getLength() > 0) {
                    String claimValue = nodeList.item(0).getTextContent();
                    if (!StringUtils.isNullOrEmpty(claimValue)) {
                        UserClaimDTO claimDTO = new UserClaimDTO();
                        claimDTO.setName(claimName);
                        claimDTO.setValue(claimValue);
                        userClaimListDTO.addListItem(claimDTO);
                    }
                }
            }
        }
        return userClaimListDTO;
    }


}
