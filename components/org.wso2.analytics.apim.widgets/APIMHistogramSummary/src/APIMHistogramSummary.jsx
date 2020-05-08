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
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import './styles.css';
import { VictoryChart } from 'victory-chart';
import { VictoryBar } from 'victory-bar';
import { VictoryTheme, VictoryContainer, VictoryLabel, VictoryTooltip, VictoryAxis } from 'victory';
import Moment from 'moment';
import Button from '@material-ui/core/Button/Button';
// import ButtonGroup from '@material-ui/core/ButtonGroup';

/**
 * React Component for APIM Api Usage widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the APIM Api Usage Count widget body
 */
export default function APIMHistogramSummary(props) {
    const { themeName, data, setGranularityLevel, handlePublisherParameters, timeFrom, timeTo, granularity } = props;
    const timeFormat = 'DD-MM-YYYY, hh:mm:ss A';
    const btnColor= '#756e71';
    const applyBtnColor = '#ef6c00';
    const customTimeRangeSelectorStyles = {
        customRangeContainer: {
            marginLeft: 1,
            height: 330,
            display: 'flex',
            flexDirection: 'column'
        },
        customRangeButtonContainer: {
            marginLeft: 15,
            center: {
                marginLeft: "auto",
                marginRight: "auto"
            }
        },
        customButtons: {
            fontSize: 10,
            padding: 0.3
        },
        timePicker: {
            flexWrap: 'wrap',
            display: 'flex',
            height: 220,
            padding: 5,
            marginTop: 10,
            marginLeft: 20,
            marginRight: 10,
            borderBottomStyle: 'solid',
            borderBottomWidth: 1,
        },
        footerButtons: {
            padding: 10,
            color: '#000',
            marginRight: 7
        },
        typographyLabel: {
            fontSize: 12,
            align: 'center'
        },
    };

    const styles = {
        root: {
            backgroundColor: themeName === 'light' ? '#fff' : '#0e1e34',
            // height: '100%',
            // cursor: 'pointer',
        },
        heading: {
            margin: 'auto',
            textAlign: 'center',
            fontWeight: 'normal',
            letterSpacing: 1.5,
        },
        headingWrapper: {
            margin: 'auto',
            paddingTop: 30,
        },
        dataWrapper: {
            paddingTop: 10,
            height: 600,
        },
        typeText: {
            textAlign: 'left',
            fontWeight: 'normal',
            margin: 0,
            display: 'inline',
            marginLeft: '3%',
            letterSpacing: 1.5,
            fontSize: 'small',
        },
        moreButton: {
            marginTop: 10,
            marginRight: 20,
        },
        subheading: {
            textAlign: 'center',
            margin: 5,
            fontSize: 14,
            color: '#b5b5b5',
        },
    };
    const customRangeButtons = [
        'second',
        'minute',
        'hour',
    ];
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
        <div
            style={styles.root}
            // className={`overview-wrapper ${themeName}`}
        >
            <div style={styles.headingWrapper}>
                <h3
                    style={styles.heading}
                >
                    <FormattedMessage id='widget.heading' defaultMessage='API USAGE SUMMARY' />
                </h3>
                <p style={styles.subheading}>
                    <FormattedMessage id='widget.subheading' defaultMessage={granularity + ' view'} />
                </p>

                <div style={customTimeRangeSelectorStyles.customRangeButtonContainer}>
                    {customRangeButtons.map((customRangeButton, index) => (
                        <Button
                            key={index}
                            variant='outlined'
                            style={{
                                // ...customButtons,
                                borderTopLeftRadius: index === 0 ? 6 : 0,
                                borderBottomLeftRadius: index === 0 ? 6 : 0,
                                borderTopRightRadius: index === 5 ? 6 : 0,
                                borderBottomRightRadius: index === 5 ? 6 : 0,
                                backgroundColor: customRangeButton + 's' === granularity ? applyBtnColor : btnColor,
                            }}
                            onClick={() => {
                                const prop = { granularity: customRangeButton };
                                handlePublisherParameters(prop);
                            }}
                        >
                            {customRangeButton}
                        </Button>
                    ))}
                </div>
            </div>
            <div style={styles.dataWrapper}>
                <VictoryChart
                    theme={VictoryTheme.material}
                    domainPadding={10}
                >
                    <VictoryBar
                        height={100}
                        width={500}
                        labels={(dat) => {
                            const moment = Moment(dat.x);
                            return moment.format(timeFormat) + ' : ' + dat.y;
                        }}
                        labelComponent={<VictoryTooltip />}
                        style={{ data: { fill: '#c43a31' }, maxHeight: '40%' }}
                        data={data}
                        events={[{
                            target: 'data',
                            eventHandlers: {
                                onClick: (event, values) => {
                                    setGranularityLevel(values.datum.x);
                                },
                            },
                        }]}
                    />
                    <VictoryAxis
                        tickFormat={() => ''}
                        label={() => {
                            const momentFrom = Moment(timeFrom);
                            const momentTo = Moment(timeTo);
                            return momentFrom.format(timeFormat) + ' to '
                                + momentTo.format(timeFormat);
                        }}
                        style={{
                            axis: {stroke: "#756f6a"},
                            axisLabel: {fontSize: 15, padding: 10},
                            grid: {stroke: ({ tick }) => 0},
                            ticks: {stroke: "grey", size: 5},
                            tickLabels: {fontSize: 15, padding: 5}
                        }}
                    />
                    <VictoryAxis
                        dependentAxis
                        style={{
                            axis: {stroke: "#756f6a"},
                            axisLabel: {fontSize: 15, padding: 30 },
                            grid: {stroke: ({ tick }) => 0},
                            ticks: {stroke: "grey", size: 5},
                            tickLabels: {fontSize: 9, padding: 5},
                        }}
                        label={() => 'request per ' + granularity.slice(0, -1)}
                    />
                </VictoryChart>
            </div>
        </div>
    );
}

APIMHistogramSummary.propTypes = {
    themeName: PropTypes.string.isRequired,
    data: PropTypes.instanceOf(Object).isRequired,
    setGranularityLevel: PropTypes.func.isRequired,
};
