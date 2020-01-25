import React from 'react';
import {
    BooleanInput,
    Create,
    ListButton,
    NumberInput,
    SimpleForm,
    TextInput,
    TopToolbar,
} from 'react-admin';
import ObjectInput from '../../components/ObjectInput';
import QueryVersion from '../../components/QueryVersion';
import RawButton from '../../components/RawButton';

const SubscriptionsCreateActions = ({ basePath, data, resource }) => (
    <TopToolbar>
        {data ? <RawButton record={data} resource={resource} /> : null}
        <ListButton basePath={basePath} />
    </TopToolbar>
);

const SubscriptionsCreate = props => (
    <Create actions={<SubscriptionsCreateActions />} {...props}>
        <SimpleForm redirect="show">
            <TextInput source="resource_path" label="Resource Path" />
            <NumberInput
                source="max_update_rate_ms"
                label="Max Update Rate (ms)"
                initialValue={100}
            />
            <ObjectInput source="params" />
            <BooleanInput source="persist" initialValue={true} />
        </SimpleForm>
    </Create>
);

export default SubscriptionsCreate;
