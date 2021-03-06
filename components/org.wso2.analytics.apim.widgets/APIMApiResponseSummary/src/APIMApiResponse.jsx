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
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Scrollbars } from 'react-custom-scrollbars';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';

/**
 * React Component for Api Response Summary widget body
 * @param {any} props @inheritDoc
 * @returns {ReactElement} Render the Api Response Summary widget body
 */
export default function APIMApiResponse(props) {
    const {
        themeName, height, width, apiCreatedBy, apiSelected, apiVersion, responseData, apilist, versionlist,
        apiCreatedHandleChange, apiSelectedHandleChange, apiVersionHandleChange, inProgress,
    } = props;
    const styles = {
        headingWrapper: {
            height: '10%',
            margin: 'auto',
            width: '90%',
        },
        formWrapper: {
            width: '90%',
            height: '10%',
            margin: 'auto',
        },
        form: {
            display: 'flex',
            flexWrap: 'wrap',
        },
        formControl: {
            margin: '5%',
            minWidth: 120,
        },
        dataWrapper: {
            height: height * 0.40,
            width: width * 0.95,
            margin: 'auto',
            marginTop: 20,
        },
        toolBar: {
            flex: '0 0 auto',
        },
        tableData: {
            minWidth: 200,
        },
        paperWrapper: {
            height: '75%',
            width: '95%',
            margin: 'auto',
        },
        paper: {
            background: themeName === 'dark' ? '#152638' : '#E8E8E8',
            padding: '4%',
        },
        loadingIcon: {
            margin: 'auto',
            display: 'block',
        },
        loading: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: this.props.height,
        },
        formLabel: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            width: '100%',
            display: 'block',
            overflow: 'hidden',
        },
    };
    return (
        <Scrollbars style={{
            height,
            backgroundColor: themeName === 'dark' ? '#0e1e33' : '#fff',
        }}
        >
            <div style={{
                padding: '5% 5%',
            }}
            >
                <div style={styles.headingWrapper}>
                    <h3 style={{
                        borderBottom: themeName === 'dark' ? '1px solid #fff' : '1px solid #02212f',
                        paddingBottom: '10px',
                        margin: 'auto',
                        marginTop: 0,
                        textAlign: 'left',
                        fontWeight: 'normal',
                        letterSpacing: 1.5,
                    }}
                    >
                        <FormattedMessage id='widget.heading' defaultMessage='API RESPONSE SUMMARY' />
                    </h3>
                </div>
                <div style={styles.formWrapper}>
                    <form style={styles.form}>
                        <FormControl style={styles.formControl}>
                            <Tooltip
                                placement='top'
                                title={<FormattedMessage id='createdBy.label' defaultMessage='API Created By' />}
                            >
                                <InputLabel
                                    shrink
                                    htmlFor='api-createdBy-label-placeholder'
                                    style={styles.formLabel}
                                >
                                    <FormattedMessage id='createdBy.label' defaultMessage='API Created By' />
                                </InputLabel>
                            </Tooltip>
                            <Select
                                value={apiCreatedBy}
                                onChange={apiCreatedHandleChange}
                                input={<Input name='apiCreatedBy' id='api-createdBy-label-placeholder' />}
                                displayEmpty
                                name='apiCreatedBy'
                                style={styles.selectEmpty}
                            >
                                <MenuItem value='All'>
                                    <FormattedMessage id='all.menuItem' defaultMessage='All' />
                                </MenuItem>
                                <MenuItem value='Me'>
                                    <FormattedMessage id='me.menuItem' defaultMessage='Me' />
                                </MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl style={styles.formControl}>
                            <Tooltip
                                placement='top'
                                title={<FormattedMessage id='apiName.label' defaultMessage='API Name' />}
                            >
                                <InputLabel
                                    shrink
                                    htmlFor='apiSelected-label-placeholder'
                                    style={styles.formLabel}
                                >
                                    <FormattedMessage id='apiName.label' defaultMessage='API Name' />
                                </InputLabel>
                            </Tooltip>
                            <Select
                                value={apiSelected}
                                onChange={apiSelectedHandleChange}
                                input={<Input name='apiSelected' id='apiSelected-label-placeholder' />}
                                displayEmpty
                                name='apiSelected'
                                style={styles.selectEmpty}
                            >
                                {
                                    apilist.map(option => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                        <FormControl style={styles.formControl}>
                            <Tooltip
                                placement='top'
                                title={<FormattedMessage id='apiVersion.label' defaultMessage='API Version' />}
                            >
                                <InputLabel
                                    shrink
                                    htmlFor='apiVersion-label-placeholder'
                                    style={styles.formLabel}
                                >
                                    <FormattedMessage id='apiVersion.label' defaultMessage='API Version' />
                                </InputLabel>
                            </Tooltip>
                            <Select
                                value={apiVersion}
                                onChange={apiVersionHandleChange}
                                input={<Input name='apiVersion' id='apiVersion-label-placeholder' />}
                                displayEmpty
                                name='apiVersion'
                                style={styles.selectEmpty}
                            >
                                {
                                    versionlist.map(option => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))
                                }
                            </Select>
                        </FormControl>
                    </form>
                </div>
                { inProgress ? (
                    <div style={styles.loading}>
                        <CircularProgress style={styles.loadingIcon} />
                    </div>
                ) : (
                    <div>
                        { !responseData || responseData.length === 0 ? (
                                <div style={styles.paperWrapper}>
                                    <Paper
                                        elevation={1}
                                        style={styles.paper}
                                    >
                                        <Typography variant='h5' component='h3'>
                                            <FormattedMessage
                                                id='nodata.error.heading'
                                                defaultMessage='No Data Available !' />
                                        </Typography>
                                        <Typography component='p'>
                                            <FormattedMessage
                                                id='nodata.error.body'
                                                defaultMessage='No data available for the selected options.'
                                            />
                                        </Typography>
                                    </Paper>
                                </div>
                            ) : (
                            <div style={styles.dataWrapper}>
                                <Paper style={{
                                    margin: 'auto', backgroundColor: themeName === 'dark' ? '#162638' : '#fff',
                                }}
                                >
                                    <Toolbar>
                                        <div style={styles.toolBar}>
                                            <Typography variant='h6' id='tableTitle'>
                                                <FormattedMessage id='widget.heading' defaultMessage='API RESPONSE SUMMARY' />
                                            </Typography>
                                        </div>
                                    </Toolbar>
                                    <Table style={styles.tableData}>
                                        <TableBody>
                                            <TableRow>
                                                <TableCell component='th' scope='row'>
                                                    <FormattedMessage
                                                        id='table.heading.totalResponse'
                                                        defaultMessage='Total Response Count'
                                                    />
                                                </TableCell>
                                                <TableCell align='right'>{responseData[0]}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component='th' scope='row'>
                                                    <FormattedMessage
                                                        id='table.heading.2xxResponse'
                                                        defaultMessage='2xx Response Count'
                                                    />
                                                </TableCell>
                                                <TableCell align='right'>{responseData[1]}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component='th' scope='row'>
                                                    <FormattedMessage
                                                        id='table.heading.4xxResponse'
                                                        defaultMessage='4xx Response Count'
                                                    />
                                                </TableCell>
                                                <TableCell align='right'>{responseData[2]}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component='th' scope='row'>
                                                    <FormattedMessage
                                                        id='table.heading.5xxResponse'
                                                        defaultMessage='5xx Response Count'
                                                    />
                                                </TableCell>
                                                <TableCell align='right'>{responseData[3]}</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell component='th' scope='row'>
                                                    Other
                                                    <FormattedMessage id='table.heading.other' defaultMessage='Other' />
                                                </TableCell>
                                                <TableCell align='right'>{responseData[4]}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </Paper>
                            </div>
                            )}
                    </div>
                )}
            </div>
        </Scrollbars>
    );
}

APIMApiResponse.propTypes = {
    themeName: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    width: PropTypes.string.isRequired,
    apiCreatedBy: PropTypes.string.isRequired,
    apiSelected: PropTypes.string.isRequired,
    apiVersion: PropTypes.string.isRequired,
    apilist: PropTypes.instanceOf(Object).isRequired,
    versionlist: PropTypes.instanceOf(Object).isRequired,
    responseData: PropTypes.instanceOf(Object).isRequired,
    apiCreatedHandleChange: PropTypes.func.isRequired,
    apiSelectedHandleChange: PropTypes.func.isRequired,
    apiVersionHandleChange: PropTypes.func.isRequired,
};
