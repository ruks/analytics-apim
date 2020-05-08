import React from 'react';
import Axios from 'axios';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import Link from '@material-ui/core/Link';

const styles = theme => ({
    root: {
        display: 'flex',
        '& > * + *': {
            marginLeft: theme.spacing.unit * 2,
        },
    },
});

// const AppInfoTitle = React.forwardRef(function AppInfoTitle(props, ref) {

class AppInfoTitle extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            claimList: [],
        };
    }

    componentDidMount() {
        const { appName } = this.props;
        Axios.get(`${window.contextPath}/apis/analytics/v1.0/appinfo/${appName}`)
            .then((response) => {
                console.log(response);
                window.data = response;
                this.setState({ loading: false, claimList: response.data.list });
            })
            .catch(() => {
            });
    }

    render() {
        const { classes } = this.props;
        const { loading, claimList } = this.state;
        return loading ? (
            <React.Fragment>
                <div className={classes.root}>
                    <CircularProgress />
                </div>
            </React.Fragment>
        ) : (
            <React.Fragment>
                <Table
                    aria-label='simple table'
                    size='small'
                >
                    <TableBody>
                        {claimList.map(claim => (
                            <TableRow key={claim.name} style={{ height: '35px' }}>
                                <TableCell component='th' scope='row'>
                                    {claim.name}
                                </TableCell>
                                <TableCell align='right'>
                                    {claim.name === 'Email' ? (
                                        <Link href={'mailto:' + claim.value} style={{ color: '#F0FFFF' }}>
                                            {claim.value}
                                        </Link>
                                    ) : claim.value }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </React.Fragment>
        );
    }
}

AppInfoTitle.propTypes = {
    appName: PropTypes.string.isRequired,
    classes: PropTypes.instanceOf(Object).isRequired,
};

export default withStyles(styles)(AppInfoTitle);
