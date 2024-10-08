import {ColumnReadonlyProps} from "./types";
import {Spin, Upload, UploadFile} from "antd";
import React, {useEffect, useState} from "react";
import http from "../../../lib/http";

export default function (props: ColumnReadonlyProps & {
    schema: {
        fieldProps?: {
            loadUrl: string,
        }
    },
}) {

    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    useEffect(() => {
        if (props.entity.value && props.schema.fieldProps?.loadUrl) {
            http({
                url: props.schema.fieldProps.loadUrl,
                params: {
                    ids: props.entity.value
                },
                method: 'get',
            }).then(res => {
                setFileList(res.data.map((item: any) => {
                    return {
                        uid: item.id,
                        status: 'done',
                        url: item.url,
                        name: item.name,
                        response: {
                            file_id: item.id,
                        }
                    }
                }))
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, []);


    return <>
        <Spin spinning={loading}>
            <Upload
                disabled={true}
                listType="text"
                fileList={fileList}
            ></Upload>
        </Spin>
    </>
}