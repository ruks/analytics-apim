/*
 *  Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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
    addLocaleData, defineMessages, IntlProvider, FormattedMessage,
} from 'react-intl';
import Axios from 'axios';
import Moment from 'moment';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Widget from '@wso2-dashboards/widget';
import APIMHistogramSummary from './APIMHistogramSummary';

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
 * Language
 * @type {string}
 */
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

let refreshIntervalId1 = null;

/**
 * Language without region code
 */
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

/**
 * Create React Component for APIM Api Created
 * @class APIMHistogramSummaryWidget
 * @extends {Widget}
 */
class APIMHistogramSummaryWidget extends Widget {
    /**
     * Creates an instance of APIMHistogramSummaryWidget.
     * @param {any} props @inheritDoc
     * @memberof APIMHistogramSummaryWidget
     */
    constructor(props) {
        super(props);

        this.state = {
            width: this.props.width,
            height: this.props.height,
            messages: null,
            refreshInterval: 60000, // 1min
            refreshIntervalId: null,
            inProgress: true,
            data: [],
            granularity: 'seconds',
            providerConfig: null,
            timeFrom: null,
            timeTo: null,
        };

        this.styles = {
            loadingIcon: {
                margin: 'auto',
                display: 'block',
            },
            paper: {
                padding: '5%',
                border: '2px solid #4555BB',
            },
            paperWrapper: {
                margin: 'auto',
                width: '50%',
                marginTop: '20%',
            },
            loading: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: this.props.height,
            },
        };

        // This will re-size the widget when the glContainer's width is changed.
        if (this.props.glContainer !== undefined) {
            this.props.glContainer.on('resize', () => this.setState({
                width: this.props.glContainer.width,
                height: this.props.glContainer.height,
            }));
        }
        this.assembleUsageCountQuery = this.assembleUsageCountQuery.bind(this);
        this.handleUsageCountReceived = this.handleUsageCountReceived.bind(this);
        this.setGranularityLevel = this.setGranularityLevel.bind(this);
        this.handlePublisherParameters = this.handlePublisherParameters.bind(this);
    }

    /**
     *
     * @param {any} props @inheritDoc
     */
    componentWillMount() {
        const locale = (languageWithoutRegionCode || language || 'en');
        this.loadLocale(locale).catch(() => {
            this.loadLocale().catch(() => {
                // TODO: Show error message.
            });
        });
    }

    /**
     *
     * @param {any} props @inheritDoc
     */
    componentDidMount() {
        const { widgetID, id } = this.props;
        const { refreshInterval } = this.state;

        super.getWidgetConfiguration(widgetID)
            .then((message) => {
                this.setState({
                    providerConfig: message.data.configs.providerConfig,
                }, () => super.subscribe(this.handlePublisherParameters));
                // set an interval to periodically retrieve data
                const refresh = () => {
                    super.getWidgetChannelManager().unsubscribeWidget(id);
                    this.assembleUsageCountQuery();
                };
                refreshIntervalId1 = setInterval(refresh, refreshInterval);
                this.assembleUsageCountQuery();
            })
            .catch((error) => {
                console.error("Error occurred when loading widget '" + widgetID + "'. " + error);
                this.setState({
                    faultyProviderConfig: true,
                });
            });

    }

    /**
     *
     * @param {any} props @inheritDoc
     */
    componentWillUnmount() {
        const { id } = this.props;
        clearInterval(refreshIntervalId1);
        super.getWidgetChannelManager().unsubscribeWidget(id);
    }

    /**
     * Load locale file.
     * @memberof APIMHistogramSummaryWidget
     * @param {String} locale - locale
     * @returns {Promise}
     */
    loadLocale(locale = 'en') {
        return new Promise((resolve, reject) => {
            Axios
                .get(`${window.contextPath}/public/extensions/widgets/APIMHistogramSummary/locales/${locale}.json`)
                .then((response) => {
                    // eslint-disable-next-line global-require, import/no-dynamic-require
                    addLocaleData(require(`react-intl/locale-data/${locale}`));
                    this.setState({ messages: defineMessages(response.data) });
                    resolve();
                })
                .catch(error => reject(error));
        });
    }

    handlePublisherParameters(receivedMsg) {
        let { granularity } = receivedMsg;
        const { id } = this.props;
        granularity += 's';
        const refresh = () => {
            super.getWidgetChannelManager().unsubscribeWidget(id);
            this.assembleUsageCountQuery();
        };
        clearInterval(refreshIntervalId1);
        refreshIntervalId1 = setInterval(refresh, 10000);
        this.setState({ granularity }, this.assembleUsageCountQuery);
    }

    /**
     * Formats the siddhi query
     * @param {string} week - This week/Last week
     * @memberof APIMHistogramSummaryWidget
     * */
    assembleUsageCountQuery() {
        const { id, widgetID: widgetName } = this.props;
        const { granularity, providerConfig } = this.state;
        providerConfig.configs.config.queryData.queryName = 'query';

        const currentTime = new Date().getTime();
        const momentFrom = Moment(currentTime).utc();
        const momentTo = Moment(currentTime).utc();
        let factor;
        let timeFrom;
        let timeTo;
        if (granularity === 'hours') {
            momentFrom.minute(0).second(0).millisecond(0);
            momentTo.minute(0).second(0).millisecond(0);
            factor = 3600000;
            timeFrom = momentFrom.subtract(61, 'hours').toDate().getTime();
            timeTo = momentTo.add(1, 'hours').toDate().getTime();
        } if (granularity === 'minutes') {
            momentFrom.second(0).millisecond(0);
            momentTo.second(0).millisecond(0);
            factor = 60000;
            timeFrom = momentFrom.subtract(61, 'minutes').toDate().getTime();
            timeTo = momentTo.add(1, 'minutes').toDate().getTime();
        } if (granularity === 'seconds') {
            momentFrom.millisecond(0);
            momentTo.millisecond(0);
            factor = 1000;
            timeFrom = momentFrom.subtract(70, 'seconds').toDate().getTime();
            timeTo = momentTo.subtract(10, 'seconds').toDate().getTime();
        }

        providerConfig.configs.config.queryData.queryValues = {
            '{{from}}': timeFrom,
            '{{to}}': timeTo,
            '{{per}}': granularity.toUpperCase(),
        };

        super.getWidgetChannelManager()
            .subscribeWidget(id, widgetName, (message) => {
                this.handleUsageCountReceived(timeFrom, timeTo, factor, granularity, message);
            }, providerConfig);
    }

    /**
     * Formats data received from assembleweekQuery
     * @param {string} week - This week/Last week
     * @param {object} message - data retrieved
     * @memberof APIMHistogramSummaryWidget
     * */
    handleUsageCountReceived(timeFrom, timeTo, factor, granularity, message) {
        const { data } = message;
        console.log(data);
        console.log("timeFrom " + timeFrom);
        console.log("timeTo " +timeTo);
        console.log("granularity " +granularity);
        console.log("factor " +factor);
        const resultMap = new Map();
        let newData = data.map((a) => {
            resultMap.set(a[0], a[1]);
            return { a };
        });
        newData = [];
        for (let i = timeFrom; i <= timeTo; i += factor) {
            if (resultMap.has(i)) {
                newData.push({ x: i, y: resultMap.get(i) });
            // ,label: i +' '+ resultMap.get(i)
            } else {
                newData.push({x: i, y: 0});
            }
        }
        console.log(newData);
        this.setState({ data: newData, inProgress: false, granularity, timeFrom, timeTo });
    }

    setGranularityLevel(windowTime) {
        clearInterval(refreshIntervalId1);
        console.log("setGranularityLevel" + windowTime);
        const { id, widgetID: widgetName } = this.props;
        const { granularity, providerConfig } = this.state;
        providerConfig.configs.config.queryData.queryName = 'query';

        console.log("setGranularityLevel " + granularity);
        const momentFrom = Moment(windowTime).utc();
        const momentTo = Moment(windowTime).utc();
        let timeFrom;
        let timeTo;
        let newGranularity;
        let factor;
        if (granularity === 'hours') {
            timeFrom = momentFrom.toDate().getTime();
            timeTo = momentTo.add(1, 'hours').toDate().getTime();
            newGranularity = 'minutes';
            factor = 60000;
        } else if (granularity === 'minutes') {
            timeFrom = momentFrom.toDate().getTime();
            timeTo = momentTo.add(1, 'minutes').toDate().getTime();
            newGranularity = 'seconds';
            factor = 1000;
        } if (granularity === 'seconds') {
            return;
        }

        providerConfig.configs.config.queryData.queryValues = {
            '{{from}}': timeFrom,
            '{{to}}': timeTo,
            '{{per}}': newGranularity,
        };

        super.getWidgetChannelManager()
            .subscribeWidget(id, widgetName, (message) => {
                this.handleUsageCountReceived(timeFrom, timeTo, factor, newGranularity, message);
            }, providerConfig);
    }

    /**
     * @inheritDoc
     * @returns {ReactElement} Render the APIM Api Created widget
     * @memberof APIMHistogramSummaryWidget
     */
    render() {
        const {
            messages, faultyProviderConf, inProgress, data, timeFrom, timeTo, granularity,
        } = this.state;
        const {
            loadingIcon, paper, paperWrapper, loading,
        } = this.styles;
        const { muiTheme } = this.props;
        const themeName = muiTheme.name;
        const apiCreatedProps = { themeName, data, timeFrom, timeTo, granularity };

        if (inProgress) {
            return (
                <div style={loading}>
                    <CircularProgress style={loadingIcon} />
                </div>
            );
        }
        return (
            <IntlProvider locale={language} messages={messages}>
                <MuiThemeProvider theme={themeName === 'dark' ? darkTheme : lightTheme}>
                    {
                        faultyProviderConf ? (
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
                                            defaultMessage={'Cannot fetch provider configuration for APIM Api '
                                                + 'Created widget'}
                                        />
                                    </Typography>
                                </Paper>
                            </div>
                        ) : (
                            <APIMHistogramSummary
                                {...apiCreatedProps}
                                setGranularityLevel={this.setGranularityLevel}
                                handlePublisherParameters={this.handlePublisherParameters}
                            />
                        )
                    }
                </MuiThemeProvider>
            </IntlProvider>
        );
    }
}

global.dashboard.registerWidget('APIMHistogramSummary', APIMHistogramSummaryWidget);
