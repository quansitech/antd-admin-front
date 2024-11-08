import {ProSchema} from "@ant-design/pro-components";
import {ReactNode} from "react";

export type ColumnReadonlyProps = {
    dom: ReactNode,
    entity: any,
    schema: ProSchema,
    record?: any,
    index: number,
}