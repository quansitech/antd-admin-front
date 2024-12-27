import {Col, Image, Row, UploadFile} from "antd";
import React, {useState} from "react";
import {PlusOutlined} from '@ant-design/icons';
import {FileType, getBase64} from "../../lib/upload";
import {ColumnProps} from "./types";
import File from "./File";
import ImgCrop from 'antd-img-crop';
import type {ImagePreviewType} from "rc-image/es/Image"

export default function (props: ColumnProps & {
    fieldProps?: {
        maxCount?: number,
        crop?: {
            ratio: string,
        }
    }
}) {

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const uploadButton = (fileList: UploadFile[]) => (
        fileList.length < (props.fieldProps?.maxCount || 1) ?
            <Row justify={'center'}>
                <Col flex={1}>
                    <PlusOutlined size={18}/>
                    <div style={{marginTop: 8}}>上传</div>
                </Col>
            </Row> : null
    );

    const renderUploader = ({dom}: { dom: JSX.Element }) => {
        if (props.fieldProps?.crop) {
            const aspects = props.fieldProps.crop.ratio.split(/[\/:]/)
            let aspect = Number(aspects)
            if (aspects.length === 2) {
                aspect = parseInt(aspects[0]) / parseInt(aspects[1])
            }

            return <>
                <ImgCrop quality={props.fieldProps.crop?.quality || 0.8} rotationSlider aspect={aspect}>
                    {dom}
                </ImgCrop>
            </>
        } else {
            return dom
        }
    }

    return <>
        <File {...props}
              uploadButton={uploadButton}
              listType={'picture-card'}
              onPreview={handlePreview}
              renderUploader={renderUploader}
        ></File>
        {previewImage && (
            <Image
                wrapperStyle={{display: 'none'}}
                preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) => !visible && setPreviewImage(''),
                } as ImagePreviewType}
                src={previewImage}
            />
        )}
    </>
}