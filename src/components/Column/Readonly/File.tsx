import {ColumnReadonlyProps} from "./types";
import {Spin, Upload, UploadFile} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {FormContext} from "../../FormContext";
import {UploadListType} from "antd/es/upload/interface";
import {TableContext} from "../../TableContext";
import {ItemContext} from "../../../lib/FormList";

export default function (props: ColumnReadonlyProps & {
    listType?: UploadListType,
    onPreview?: (file: UploadFile) => void,
}) {

    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const formContext = useContext(FormContext);
    const tableContext = useContext(TableContext);
    const itemContext = useContext(ItemContext);

    useEffect(() => {
        let extraRenderValue = [];
        if (props.fieldProps?.extraRenderValue){
            extraRenderValue = props.fieldProps.extraRenderValue
        }
        if (props.fieldProps?.extraRenderValues){
            let index = -1;
            if (tableContext && tableContext?.dataSource){
                const key = tableContext.getTableProps().rowKey
                index = tableContext.dataSource.findIndex(item => item[key] === props.record[key])
            }
            if (itemContext && itemContext?.index !== undefined){
                index = itemContext.index
            }
            extraRenderValue = props.fieldProps.extraRenderValues[index] ?? []
        }
        setFileList(extraRenderValue.map((item: any) => {
            return {
                uid: item.id,
                status: 'done',
                url: item.url,
                name: item.name,
                hash_id: item.hash_id,
                response: {
                    file_id: item.id,
                    url: item.url,
                }
            }
        }) as UploadFile[])

        setLoading(false)
    }, [props.record]);


    return <>
        <Spin spinning={loading}>
            <Upload
                disabled={true}
                listType={props.listType || 'text'}
                fileList={fileList}
                onPreview={props.onPreview}
            ></Upload>
        </Spin>
    </>
}