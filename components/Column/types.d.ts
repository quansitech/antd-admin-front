import type {FormInstance} from "antd/lib/form";
import {ProSchema} from "@ant-design/pro-components";
import {Rule} from "rc-field-form/lib/interface";
import {Key} from "react";

export type ColumnProps = {
    className: any,
    onChange?: <T = any>(value: T) => void;
    onBlur?: <T = any>(event: T) => void;
    schema?: ProSchema<Entity, ExtraProps, ComponentsType, ValueType>,
    config: {
        onSelect?: (value: any) => void;
        onChange?: <T = any>(value: T) => void;
        value?: any;
        type: ComponentsType;
        recordKey?: React.Key | React.Key[];
        record?: Entity;
        isEditable?: boolean;
        defaultRender: (newItem: ProSchema<Entity, ExtraProps, ComponentsType, ValueType>) => JSX.Element | null;
        options?: any[];
    }
    form: FormInstance,
    fieldProps: any,
    rules?: Rule[],
    dataIndex?: Key,
    value?: any,

    record?: any,
}