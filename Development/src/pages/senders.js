import React from 'react';
import {
    ArrayField,
    BooleanField,
    BooleanInput,
    Button,
    ChipField,
    Edit,
    FunctionField,
    ReferenceField,
    SaveButton,
    ShowButton,
    ShowController,
    ShowView,
    SimpleForm,
    SimpleShowLayout,
    TextField,
    TextInput,
    Title,
    Toolbar,
    UrlField,
} from 'react-admin';
import get from 'lodash/get';
import Cookies from 'universal-cookie';
import {
    AppBar,
    Card,
    CardContent,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tabs,
    Typography,
} from '@material-ui/core';
import dataProvider from '../dataProvider';
import PaginationButton from '../components/PaginationButton';
import FilterField from '../components/FilterField';
import TAIField from '../components/TAIField';
import MapTags from '../components/TagsField';
import JsonIcon from '../components/JsonIcon';
import SenderTransportParamsCardsGrid from '../components/SenderTransportParams';
import ConnectionShowActions from '../components/ConnectionShowActions';
import JSONViewer from '../components/JSONViewer';

const cookies = new Cookies();

export class SendersList extends React.Component {
    constructor(props) {
        super(props);
        this.filter = '';
        this.filterObject = {};
        this.state = {
            data: [],
        };
        this.nextPage = this.nextPage.bind(this);
        this.setFilter = this.setFilter.bind(this);
        this.filterPage = this.filterPage.bind(this);
        this.firstLoad = this.firstLoad.bind(this);
        this.firstLoad();
    }

    async firstLoad() {
        const params = {
            filter: {},
            pagination: { page: 1, perPage: 10 },
            sort: { field: 'id', order: 'DESC' },
        };
        const dataObject = await dataProvider('GET_LIST', 'senders', params);
        this.setState({ data: dataObject });
    }

    async nextPage(label) {
        const dataObject = await dataProvider(label, 'senders');
        this.setState({ data: dataObject });
    }

    setFilter(filterValue, name) {
        if (filterValue) {
            this.filterObject[name] = filterValue;
        } else {
            delete this.filterObject[name];
        }
        this.filterPage();
    }

    async filterPage() {
        const params = {
            filter: this.filterObject,
        };
        const dataObject = await dataProvider('GET_LIST', 'senders', params);
        this.setState({ data: dataObject });
    }

    render() {
        if (this.state.data.data) {
            return (
                <Card>
                    <Title title={'Senders'} />
                    <CardContent>
                        <Button
                            label={'Raw'}
                            href={this.state.data.url}
                            style={{ float: 'right' }}
                            title={'View raw'}
                        >
                            <JsonIcon />
                        </Button>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        style={{
                                            minWidth: '240px',
                                            paddingLeft: '32px',
                                        }}
                                    >
                                        Label{' '}
                                        <FilterField
                                            name="label"
                                            setFilter={this.setFilter}
                                        />
                                    </TableCell>
                                    <TableCell style={{ minWidth: '260px' }}>
                                        Transport{' '}
                                        <FilterField
                                            name="transport"
                                            setFilter={this.setFilter}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.data.data.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell component="th" scope="row">
                                            <ShowButton
                                                style={{
                                                    textTransform: 'none',
                                                }}
                                                basePath="/senders"
                                                record={item}
                                                label={item.label}
                                            />
                                        </TableCell>
                                        <TableCell>{item.transport}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <br />
                        <PaginationButton
                            label="FIRST"
                            nextPage={this.nextPage}
                        />
                        <PaginationButton
                            label="PREV"
                            nextPage={this.nextPage}
                        />
                        <PaginationButton
                            label="NEXT"
                            nextPage={this.nextPage}
                        />
                        <PaginationButton
                            label="LAST"
                            nextPage={this.nextPage}
                        />
                    </CardContent>
                </Card>
            );
        } else {
            return <div />;
        }
    }
}

const SendersTitle = ({ record }) => {
    return (
        <span>
            Sender:{' '}
            {record
                ? record.label
                    ? `${record.label}`
                    : `${record.id}`
                : 'Unknown'}
        </span>
    );
};

const ItemArrayField = ({ className, source, record = {} }) => (
    <div style={{ fontSize: '14px' }}>
        {get(record, source).map((item, i) => (
            <div key={i} className={className}>
                {item}
            </div>
        ))}
    </div>
);

ItemArrayField.defaultProps = {
    addLabel: true,
};

const ChipConditionalLabel = ({ record, source, ...props }) => {
    props.clickable = true;
    return record ? (
        record[source] ? (
            <ChipField {...{ record, source, ...props }} />
        ) : (
            <ChipField {...{ record, source: 'id', ...props }} />
        )
    ) : null;
};

function transportFileDoesNotExist(controllerProps) {
    const str = get(controllerProps.record, '$transportfile');
    if (typeof str !== 'string') return false;
    try {
        const result = JSON.parse(str);
        const type = Object.prototype.toString.call(result);
        return type === '[object Object]' || type === '[object Array]';
    } catch (err) {
        return false;
    }
}

export const SendersShow = props => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <ShowController {...props}>
            {controllerProps => (
                <div>
                    <AppBar position="static" color="default">
                        <Tabs
                            value={tabIndex}
                            indicatorColor="primary"
                            textColor="primary"
                            onChange={handleChange}
                        >
                            <Tab label="Summary" />
                            <Tab label="Active" />
                            <Tab label="Staged" />
                            {!transportFileDoesNotExist(controllerProps) && (
                                <Tab label="Transport File" />
                            )}
                        </Tabs>
                    </AppBar>
                    {tabIndex === 0 && (
                        <ShowSummaryTab
                            {...props}
                            controllerProps={controllerProps}
                        />
                    )}
                    {tabIndex === 1 && (
                        <ShowActiveTab
                            {...props}
                            controllerProps={controllerProps}
                        />
                    )}
                    {tabIndex === 2 && (
                        <ShowStagedTab
                            {...props}
                            controllerProps={controllerProps}
                        />
                    )}
                    {tabIndex === 3 && (
                        <ShowTransportFileTab
                            {...props}
                            controllerProps={controllerProps}
                        />
                    )}
                </div>
            )}
        </ShowController>
    );
};

const QueryVersion = () => {
    let url = cookies.get('Query API');
    return url.match(/([^/]+)(?=\/?$)/g)[0];
};

const ShowSummaryTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <TextField label="ID" source="id" />
                <TAIField source="version" />
                <TextField source="label" />
                <TextField source="description" />
                <FunctionField
                    label="Tags"
                    render={record =>
                        Object.keys(record.tags).length > 0
                            ? MapTags(record)
                            : null
                    }
                />
                <hr />
                <TextField source="transport" />
                <UrlField
                    style={{ fontSize: '14px' }}
                    label="Manifest Address"
                    source="manifest_href"
                />
                {controllerProps.record && QueryVersion() >= 'v1.2' && (
                    <ItemArrayField source="interface_bindings" />
                )}
                {controllerProps.record && QueryVersion() >= 'v1.2' && (
                    <BooleanField
                        label="Subscription Active"
                        source="subscription.active"
                    />
                )}
                <hr />
                <ReferenceField
                    label="Flow"
                    source="flow_id"
                    reference="flows"
                    linkType="show"
                >
                    <ChipConditionalLabel source="label" />
                </ReferenceField>
                <ReferenceField
                    label="Device"
                    source="device_id"
                    reference="devices"
                    linkType="show"
                >
                    <ChipConditionalLabel source="label" />
                </ReferenceField>
                {controllerProps.record &&
                    QueryVersion() >= 'v1.2' &&
                    controllerProps.record.subscription.receiver_id && (
                        <ReferenceField
                            label="Receiver"
                            source="subscription.receiver_id"
                            reference="receivers"
                            linkType="show"
                        >
                            <ChipConditionalLabel source="label" />
                        </ReferenceField>
                    )}
                )}
            </SimpleShowLayout>
        </ShowView>
    );
};

const ShowActiveTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <TextField label="ID" source="id" />
                <TextField label="Receiver ID" source="$active.receiver_id" />
                <BooleanField
                    label="Master Enable"
                    source="$active.master_enable"
                />
                <TextField label="Mode" source="$active.activation.mode" />
                <TAIField
                    label="Requested Time"
                    source="$active.activation.requested_time"
                />
                <TAIField
                    label="Activation Time"
                    source="$active.activation.activation_time"
                />
                <TextField label="Transport Type" source="$transporttype" />
                <ArrayField
                    label="Transport Parameters"
                    source="$active.transport_params"
                >
                    <SenderTransportParamsCardsGrid
                        record={controllerProps.record}
                    />
                </ArrayField>
                <JSONViewer endpoint="$active" />
            </SimpleShowLayout>
        </ShowView>
    );
};

const ShowStagedTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <TextField label="ID" source="id" />
                <TextField label="Receiver ID" source="staged.receiver_id" />
                <BooleanField
                    label="Master Enable"
                    source="$staged.master_enable"
                />
                <TextField label="Mode" source="$staged.activation.mode" />
                <TAIField
                    label="Requested Time"
                    source="$staged.activation.requested_time"
                />
                <TAIField
                    label="Activation Time"
                    source="$staged.activation.activation_time"
                />
                <TextField label="Transport Type" source="$transporttype" />
                <ArrayField
                    label="Transport Parameters"
                    source="$staged.transport_params"
                >
                    <SenderTransportParamsCardsGrid
                        record={controllerProps.record}
                    />
                </ArrayField>
                <JSONViewer endpoint="$staged" />
            </SimpleShowLayout>
        </ShowView>
    );
};

const ShowTransportFileTab = ({ controllerProps, ...props }) => {
    return (
        <ShowView
            {...props}
            {...controllerProps}
            title={<SendersTitle />}
            actions={<ConnectionShowActions />}
        >
            <SimpleShowLayout>
                <Typography>
                    <pre style={{ fontFamily: 'inherit' }}>
                        {get(controllerProps.record, '$transportfile')}
                    </pre>
                </Typography>
            </SimpleShowLayout>
        </ShowView>
    );
};

const PostEditToolbar = props => (
    <Toolbar {...props}>
        <SaveButton />
    </Toolbar>
);

export const SendersEdit = props => {
    const [tabIndex, setTabIndex] = React.useState(0);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <div>
            <AppBar position="static" color="default">
                <Tabs
                    value={tabIndex}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={handleChange}
                >
                    <Tab label="Staged" />
                </Tabs>
            </AppBar>
            {tabIndex === 0 && (
                <Edit {...props} title={<SendersTitle />}>
                    <SimpleForm toolbar={<PostEditToolbar />}>
                        <TextField label="ID" source="id" />
                        <TextInput
                            label="Receiver ID"
                            source="$staged.receiver_id"
                        />
                        <BooleanInput
                            label="Master Enable"
                            source="$staged.master_enable"
                        />
                        <TextInput
                            label="Mode"
                            source="$staged.activation.mode"
                        />
                        <TextInput
                            label="Requested Time"
                            source="$staged.activation.requested_time"
                        />
                        <SenderTransportParamsCardsGrid />
                    </SimpleForm>
                </Edit>
            )}
        </div>
    );
};
