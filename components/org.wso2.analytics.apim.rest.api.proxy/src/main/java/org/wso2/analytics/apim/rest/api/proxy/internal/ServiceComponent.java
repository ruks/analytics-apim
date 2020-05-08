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
package org.wso2.analytics.apim.rest.api.proxy.internal;

import com.zaxxer.hikari.HikariDataSource;
import org.osgi.framework.BundleContext;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;
import org.osgi.service.component.annotations.ReferenceCardinality;
import org.osgi.service.component.annotations.ReferencePolicy;
import org.wso2.carbon.config.provider.ConfigProvider;
import org.wso2.carbon.datasource.core.api.DataSourceService;
import org.wso2.carbon.datasource.core.exception.DataSourceException;

/**
 * Service component to get Carbon Config Provider OSGi service.
 */
@Component(
        name = "ApimProxyServiceComponent",
        service = ServiceComponent.class,
        immediate = true
)
public class ServiceComponent {
    private HikariDataSource dsObject;

    @Activate
    protected void start(BundleContext bundleContext) {
    }

    @Deactivate
    protected void stop() {
    }

    @Reference(service = ConfigProvider.class,
            cardinality = ReferenceCardinality.MANDATORY,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterConfigProvider")
    protected void registerConfigProvider(ConfigProvider client) {
        ServiceHolder.getInstance().setConfigProvider(client);
    }

    protected void unregisterConfigProvider(ConfigProvider client) {
        ServiceHolder.getInstance().setConfigProvider(null);
    }

    @Reference(
            name = "org.wso2.carbon.datasource.DataSourceService",
            service = DataSourceService.class,
            cardinality = ReferenceCardinality.AT_LEAST_ONE,
            policy = ReferencePolicy.DYNAMIC,
            unbind = "unregisterDataSourceService"
    )
    protected void onDataSourceServiceReady(DataSourceService service) {

        try {
            dsObject = (HikariDataSource) service.getDataSource("AM_DB");
            ServiceHolder.getInstance().setDataSource(dsObject);
        } catch (DataSourceException e) {
        }
    }

    protected void unregisterDataSourceService(DataSourceService dataSourceService) {
    }
}
