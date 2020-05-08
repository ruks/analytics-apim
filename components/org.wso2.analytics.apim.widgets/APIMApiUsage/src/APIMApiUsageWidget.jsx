/*
 *  Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 *  WSO2 Inc. licenses this file to you under the Apache License,
 *  Version 2.0 (the "License"); you may not use this file except
 *  in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed on an
 *  "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *  KIND, either express or implied.  See the License for the
 *  specific language governing permissions and limitations
 *  under the License.
 *
 */

import React from 'react';
import {
    defineMessages, IntlProvider, FormattedMessage, addLocaleData,
} from 'react-intl';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Widget from '@wso2-dashboards/widget';
import APIMApiUsage from './APIMApiUsage';

const darkTheme = createMuiTheme({
    palette: {
        type: 'dark',
    },
    typography: {
        useNextVariants: true,
    },
});

const lightTheme = createMuiTheme({
    palette: {
        type: 'light',
    },
    typography: {
        useNextVariants: true,
    },
});

/**
 * Query string parameter values
 * @type {object}
 */
const createdByKeys = {
    All: 'All',
    Me: 'Me',
};

/**
 * Query string parameter
 * @type {string}
 */
const queryParamKey = 'apiUsers';

/**
 * Language
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

/**
 * Language without region code
 */
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

/**
 * Create React Component for APIM Api Usage widget
 * @class APIMApiUsageWidget
 * @extends {Widget}
 */
class APIMApiUsageWidget extends Widget {
    /**
     * Creates an instance of APIMApiUsageWidget.
     * @param {any} props @inheritDoc
     * @memberof APIMApiUsageWidget
     */
    constructor(props) {
        super(props);
        this.styles = {
            paper: {
                padding: '5%',
                border: '2px solid #4555BB',
            },
            paperWrapper: {
                margin: 'auto',
                width: '50%',
                marginTop: '20%',
            },
            proxyPaperWrapper: {
                height: '75%',
            },
            proxyPaper: {
                background: '#969696',
                width: '75%',
                padding: '4%',
                border: '1.5px solid #fff',
                margin: 'auto',
                marginTop: '5%',
            },
        };

        this.state = {
            width: this.props.width,
            height: this.props.height,
            limit: 0,
            apiCreatedBy: 'All',
            apiSelected: 'All',
            apiVersion: 'All',
            versionlist: [],
            versionMap: {},
            apilist: [],
            usageData: null,
            localeMessages: null,
            inProgress: true,
            proxyError: false,
        };

        // This will re-size the widget when the glContainer's width is changed.
        if (this.props.glContainer !== undefined) {
            this.props.glContainer.on('resize', () => this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
            }));
        }

        this.handleDataReceived = this.handleDataReceived.bind(this);
        this.handleApiListReceived = this.handleApiListReceived.bind(this);
        this.handlePublisherParameters = this.handlePublisherParameters.bind(this);
        this.apiCreatedHandleChange = this.apiCreatedHandleChange.bind(this);
        this.apiSelectedHandleChange = this.apiSelectedHandleChange.bind(this);
        this.apiVersionHandleChange = this.apiVersionHandleChange.bind(this);
        this.handleLimitChange = this.handleLimitChange.bind(this);
        this.assembleApiListQuery = this.assembleApiListQuery.bind(this);
        this.assembleMainQuery = this.assembleMainQuery.bind(this);
        this.getUsername = this.getUsername.bind(this);
    }

    componentWillMount() {
        const locale = (languageWithoutRegionCode || language || 'en');
        this.loadLocale(locale).catch(() => {
            this.loadLocale().catch(() => {
                // TODO: Show error message.
            });
        });
    }

    componentDidMount() {
        const { widgetID } = this.props;
        this.getUsername();

        super.getWidgetConfiguration(widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig,
                }, () => super.subscribe(this.handlePublisherParameters));
            })
            .catch((error) => {
                console.error("Error occurred when loading widget '" + widgetID + "'. " + error);
                this.setState({
                    faultyProviderConfig: true,
                });
            });
    }

    componentWillUnmount() {
        const { id } = this.props;
        super.getWidgetChannelManager().unsubscribeWidget(id);
    }

    /**
     * Load locale file.
     * @param {string} locale Locale name
     * @memberof APIMApiUsageWidget
     */
    loadLocale(locale = 'en') {
        return new Promise((resolve, reject) => {
            Axios
                .get(`${window.contextPath}/public/extensions/widgets/APIMApiUsage/locales/${locale}.json`)
                .then((response) => {
                    // eslint-disable-next-line global-require, import/no-dynamic-require
                    addLocaleData(require(`react-intl/locale-data/${locale}`));
                    this.setState({ localeMessages: defineMessages(response.data) });
                    resolve();
                })
                .catch(error => reject(error));
        });
    }

    /**
     * Retrieve params from publisher - DateTimeRange
     * @memberof APIMApiUsageWidget
     * */
    handlePublisherParameters(receivedMsg) {
        console.log("handlePublisherParameters");
        console.log(receivedMsg);
        if (receivedMsg.type && receivedMsg.type === 'apiInfo') {
            const { api, version } = receivedMsg;
            console.log(api);
            console.log(version);
            const event =  {
                target: {
                    value: api,
                },
            };
            this.setState({ apiSelected: api, apiVersion: version }, this.apiSelectedHandleChange(event));
            console.log("done");
            // https://localhost:9643/analytics-dashboard/dashboards/apimpublisher/usage-summary#api_usage_by_application

            const q = '#{"apiUsers":{"apiCreatedBy":"All","apiSelected":"' + api + '"}}';
            // window.location = q;
            console.log("location");
            window.location = '#{%22apiUsers%22:{%22apiCreatedBy%22:%22All%22,%22apiSelected%22:%22PizzaShackAPI%22,%22apiVersion%22:%22All%22,%22limit%22:5}}';
            return;
        }

        const queryParam = super.getGlobalState('dtrp');
        const { sync } = queryParam;

        this.setState({
            timeFrom: receivedMsg.from,
            timeTo: receivedMsg.to,
            perValue: receivedMsg.granularity,
            inProgress: !sync,
        }, this.assembleApiListQuery);
    }

    /**
     * Reset the state according to queryParam
     * @memberof APIMApiUsageWidget
     * */
    resetState() {
        const { apilist, versionMap } = this.state;
        const queryParam = super.getGlobalState(queryParamKey);
        let {
            apiCreatedBy, apiSelected, apiVersion, limit,
        } = queryParam;
        let versions;

        if (!apiCreatedBy || !(apiCreatedBy in createdByKeys)) {
            apiCreatedBy = 'All';
        }
        if (!apiSelected || (apilist && !apilist.includes(apiSelected))) {
            apiSelected = 'All';
            apiVersion = 'All';
        }
        if (versionMap && apiSelected in versionMap) {
            versions = versionMap[apiSelected];
        } else {
            versions = [];
        }
        if (!apiVersion || (versions && !versions.includes(apiVersion))) {
            apiVersion = 'All';
        }
        if (!limit || limit < 0) {
            limit = 5;
        }
        this.setState({
            apiCreatedBy, apiSelected, apiVersion, limit, versionlist: versions,
        });
        this.setQueryParam(apiCreatedBy, apiSelected, apiVersion, limit);
    }

    /**
     * Retrieve API list from APIM server
     * @memberof APIMApiUsageWidget
     * */
    assembleApiListQuery() {
        this.resetState();
        Axios.get(`${window.contextPath}/apis/analytics/v1.0/apim/apis`)
            .then((response) => {
                this.setState({ proxyError: false });
                this.handleApiListReceived(response.data);
            })
            .catch((error) => {
                this.setState({ proxyError: true, inProgress: false });
                console.error(error);
            });
    }

    /**
     * Get username of the logged in user
     */
    getUsername() {
        let { username } = super.getCurrentUser();
        // if email username is enabled, then super tenants will be saved with '@carbon.super' suffix, else, they
        // are saved without tenant suffix
        if (username.split('@').length === 2) {
            username = username.replace('@carbon.super', '');
        }
        this.setState({ username });
    }

    /**
     * Formats data retrieved from assembleApiListQuery
     * @param {object} data - data retrieved
     * @memberof APIMApiUsageWidget
     * */
    handleApiListReceived(data) {
        let { list } = data;
        const { id } = this.props;
        const { username } = this.state;
        const queryParam = super.getGlobalState(queryParamKey);
        const { apiCreatedBy } = queryParam;

        if (list && list.length > 0) {
            if (apiCreatedBy !== 'All') {
                list = list.filter(dataUnit => dataUnit.provider === username);
            }

            let apilist = [];
            const versionMap = {};
            list.forEach((dataUnit) => {
                apilist.push(dataUnit.name);
                // retrieve all entries for the api and get the api versions list
                const versions = list.filter(d => d.name === dataUnit.name);
                const versionlist = versions.map((ver) => { return ver.version; });
                versionlist.unshift('All');
                versionMap[dataUnit.name] = versionlist;
            });
            versionMap.All = ['All'];
            apilist = [...new Set(apilist)];
            apilist.sort((a, b) => { return a.toLowerCase().localeCompare(b.toLowerCase()); });
            apilist.unshift('All');
            this.setState({ apilist, versionMap });
        }
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleMainQuery();
    }

    /**
     * Formats the siddhi query - mainquery
     * @memberof APIMApiUsageWidget
     * */
    assembleMainQuery() {
        this.resetState();
        const {
            timeFrom, timeTo, perValue, providerConfig, apilist,
        } = this.state;
        const queryParam = super.getGlobalState(queryParamKey);
        const { apiSelected, apiVersion, limit } = queryParam;
        const { id, widgetID: widgetName } = this.props;

        if (apilist && apilist.length > 1) {
            const dataProviderConfigs = cloneDeep(providerConfig);
            dataProviderConfigs.configs.config.queryData.queryName = 'mainquery';

            let query;
            if (apiSelected === 'All' && apiVersion === 'All') {
                let apis = apilist.slice(1).map((api) => { return 'apiName==\'' + api + '\''; });
                apis = apis.join(' OR ');
                query = 'AND (' + apis + ')';
            } else if (apiVersion !== 'All') {
                query = 'AND apiName==\'' + apiSelected + '\' AND apiVersion==\'' + apiVersion + '\'';
            } else {
                query = 'AND apiName==\'' + apiSelected + '\'';
            }
            dataProviderConfigs.configs.config.queryData.queryValues = {
                '{{from}}': timeFrom,
                '{{to}}': timeTo,
                '{{per}}': perValue,
                '{{limit}}': limit,
                '{{querystring}}': query,
            };
            super.getWidgetChannelManager()
                .subscribeWidget(id, widgetName, this.handleDataReceived, dataProviderConfigs);
        } else {
            this.setState({ inProgress: false, usageData: [] });
        }
    }

    /**
     * Formats data retrieved from assembleMainQuery
     * @param {object} message - data retrieved
     * @memberof APIMApiUsageWidget
     * */
    handleDataReceived(message) {
        const { data } = message;
        const {
            apiCreatedBy, apiSelected, apiVersion, limit,
        } = this.state;

        if (data) {
            const usageData = data.map((dataUnit) => {
                return {
                    api: dataUnit[0], apiVersion: dataUnit[1], application: dataUnit[2], usage: dataUnit[3],
                };
            });
            this.setState({ usageData, inProgress: false });
            this.setQueryParam(apiCreatedBy, apiSelected, apiVersion, limit);
        } else {
            this.setState({ inProgress: false, usageData: [] });
        }
    }

    /**
     * Updates query param values
     * @param {string} apiCreatedBy - API Created By menu option selected
     * @param {string} apiSelected - API Name menu option selected
     * @param {string} apiVersion - API Version menu option selected
     * @param {number} limit - data limitation value
     * @memberof APIMApiUsageWidget
     * */
    setQueryParam(apiCreatedBy, apiSelected, apiVersion, limit) {
        if (window.location.href.includes('#api_usage_by_application')) {
            window.history.pushState(null, '', window.location.href.replace('#api_usage_by_application',''));
            console.log(window.location);
        }
        super.setGlobalState(queryParamKey, {
            apiCreatedBy,
            apiSelected,
            apiVersion,
            limit,
        });
    }

    /**
     * Handle Limit select Change
     * @param {Event} event - listened event
     * @memberof APIMApiUsageWidget
     * */
    handleLimitChange(event) {
        const { id } = this.props;
        const { apiCreatedBy, apiSelected, apiVersion } = this.state;
        const limit = (event.target.value).replace('-', '').split('.')[0];

        this.setQueryParam(apiCreatedBy, apiSelected, apiVersion, parseInt(limit, 10));
        if (limit) {
            this.setState({ inProgress: true, limit });
            super.getWidgetChannelManager().unsubscribeWidget(id);
            this.assembleMainQuery();
        } else {
            this.setState({ limit });
        }
    }

    /**
     * Handle API Created By menu select change
     * @param {Event} event - listened event
     * @memberof APIMApiUsageWidget
     * */
    apiCreatedHandleChange(event) {
        const { limit } = this.state;
        const { id } = this.props;

        this.setQueryParam(event.target.value, 'All', 'All', limit);
        this.setState({ inProgress: true });
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleApiListQuery();
    }

    /**
     * Handle API name menu select change
     * @param {Event} event - listened event
     * @memberof APIMApiUsageWidget
     * */
    apiSelectedHandleChange(event) {
        const { apiCreatedBy, limit } = this.state;
        const { id } = this.props;
        console.log("event.target.value" + event.target.value);
        this.setQueryParam(apiCreatedBy, event.target.value, 'All', limit);
        this.setState({ inProgress: true });
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleMainQuery();
    }

    /**
     * Handle API Version menu select change
     * @param {Event} event - listened event
     * @memberof APIMApiUsageWidget
     * */
    apiVersionHandleChange(event) {
        const { apiCreatedBy, apiSelected, limit } = this.state;
        const { id } = this.props;

        this.setQueryParam(apiCreatedBy, apiSelected, event.target.value, limit);
        this.setState({ inProgress: true });
        super.getWidgetChannelManager().unsubscribeWidget(id);
        this.assembleMainQuery();
    }

    /**
     * @inheritDoc
     * @returns {ReactElement} Render the APIM Api Usage widget
     * @memberof APIMApiUsageWidget
     */
    render() {
        const {
            localeMessages, faultyProviderConfig, height, limit, apiCreatedBy, apiSelected, apiVersion,
            usageData, apilist, versionlist, inProgress, proxyError,
        } = this.state;
        const {
            paper, paperWrapper, proxyPaper, proxyPaperWrapper,
        } = this.styles;
        const { muiTheme } = this.props;
        const themeName = muiTheme.name;
        const apiUsersProps = {
            themeName,
            height,
            limit,
            apiCreatedBy,
            apiSelected,
            apiVersion,
            usageData,
            apilist,
            versionlist,
            inProgress,
        };

        if (proxyError) {
            return (
                <IntlProvider locale={language} messages={localeMessages}>
                    <MuiThemeProvider theme={themeName === 'dark' ? darkTheme : lightTheme}>
                        <div style={proxyPaperWrapper}>
                            <Paper
                                elevation={1}
                                style={proxyPaper}
                            >
                                <Typography variant='h5' component='h3'>
                                    <FormattedMessage
                                        id='apim.server.error.heading'
                                        defaultMessage='Error!'
                                    />
                                </Typography>
                                <Typography component='p'>
                                    <FormattedMessage
                                        id='apim.server.error'
                                        defaultMessage='Error occurred while retrieving API list.'
                                    />
                                </Typography>
                            </Paper>
                        </div>
                    </MuiThemeProvider>
                </IntlProvider>
            );
        }

        return (
            <IntlProvider locale={language} messages={localeMessages}>
                <MuiThemeProvider theme={themeName === 'dark' ? darkTheme : lightTheme}>
                    {
                        faultyProviderConfig ? (
                            <div style={paperWrapper}>
                                <Paper elevation={1} style={paper}>
                                    <Typography variant='h5' component='h3'>
                                        <FormattedMessage
                                            id='config.error.heading'
                                            defaultMessage='Configuration Error !'
                                        />
                                    </Typography>
                                    <Typography component='p'>
                                        <FormattedMessage
                                            id='config.error.body'
                                            defaultMessage={'Cannot fetch provider configuration for APIM API '
                                            + 'Usage widget'}
                                        />
                                    </Typography>
                                </Paper>
                            </div>
                        ) : (
                            <APIMApiUsage
                                {...apiUsersProps}
                                apiCreatedHandleChange={this.apiCreatedHandleChange}
                                apiSelectedHandleChange={this.apiSelectedHandleChange}
                                apiVersionHandleChange={this.apiVersionHandleChange}
                                handleLimitChange={this.handleLimitChange}
                            />
                        )
                    }
                </MuiThemeProvider>
            </IntlProvider>
        );
    }
}

global.dashboard.registerWidget('APIMApiUsage', APIMApiUsageWidget);
