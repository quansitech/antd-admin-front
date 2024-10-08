import {ColumnReadonlyProps} from "./types";
import {Image, Spin, Upload, UploadFile} from "antd";
import {FileType, getBase64} from "../../../lib/upload";
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
    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

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
                        name: '',
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
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
            ></Upload>
            {previewImage && (
                <Image
                    wrapperStyle={{display: 'none'}}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                />
            )}
        </Spin>
    </>
}