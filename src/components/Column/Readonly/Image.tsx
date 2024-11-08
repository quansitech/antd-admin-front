import {ColumnReadonlyProps} from "./types";
import {Image, UploadFile} from "antd";
import {FileType, getBase64} from "../../../lib/upload";
import React, {useState} from "react";
import File from "./File";

export default function (props: ColumnReadonlyProps) {

    const [previewImage, setPreviewImage] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };


    return <>
        <File {...props}
              listType="picture-card"
              onPreview={handlePreview}
        ></File>
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
    </>
}