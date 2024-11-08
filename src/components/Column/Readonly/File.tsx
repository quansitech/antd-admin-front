import {ColumnReadonlyProps} from "./types";
import {Spin, Upload, UploadFile} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {FormContext} from "../../FormContext";
import {UploadListType} from "antd/es/upload/interface";
import {TableContext} from "../../TableContext";

export default function (props: ColumnReadonlyProps & {
    listType?: UploadListType,
    onPreview?: (file: UploadFile) => void,
}) {

    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const formContext = useContext(FormContext);
    const tableContext = useContext(TableContext);

    useEffect(() => {
        let extraRenderValue = [];
        if (formContext && formContext.extraRenderValues) {
            extraRenderValue = formContext.extraRenderValues[props.schema.dataIndex as string] ?? []
        } else if (tableContext && tableContext.extraRenderValues) {
            extraRenderValue = tableContext.extraRenderValues[props.index]?.[props.schema.dataIndex as string] ?? []
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
        }))

        setLoading(false)
    }, []);


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