package org.wso2.analytics.apim.rest.api.proxy;

import org.w3c.dom.Document;

import java.util.Iterator;
import javax.xml.XMLConstants;
import javax.xml.namespace.NamespaceContext;

/**
 *
 */
public class NamespaceResolver implements NamespaceContext {
    private Document sourceDocument;

    public NamespaceResolver(Document document) {
        sourceDocument = document;
    }

    public String getNamespaceURI(String prefix) {
        if (prefix.equals(XMLConstants.DEFAULT_NS_PREFIX)) {
            return sourceDocument.lookupNamespaceURI(null);
        } else {
            return "http://mgt.profile.user.identity.carbon.wso2.org/xsd";
        }
    }

    public String getPrefix(String namespaceURI) {
        return sourceDocument.lookupPrefix(namespaceURI);
    }

    @SuppressWarnings("rawtypes")
    public Iterator getPrefixes(String namespaceURI) {
        return null;
    }
}
