import {Alert, Button, Spin, Tooltip, Upload, UploadFile, UploadProps} from "antd";
import React, {ReactNode, useEffect, useState} from "react";
import {beforeUpload, customRequest} from "../../lib/upload";
import http from "../../lib/http";
import {ColumnProps} from "./types";
import {UploadListType} from "antd/es/upload/interface";
import {DndContext, DragEndEvent, PointerSensor, useSensor} from '@dnd-kit/core';
import {arrayMove, SortableContext, useSortable, verticalListSortingStrategy,} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {RcFile} from "antd/lib/upload";


interface DraggableUploadListItemProps {
    originNode: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
    file: UploadFile<any>;
}

const DraggableUploadListItem = ({originNode, file}: DraggableUploadListItemProps) => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({
        id: file.uid,
    });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        cursor: 'move',
        height: '100%',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            // prevent preview event when drag end
            className={isDragging ? 'is-dragging' : ''}
            {...attributes}
            {...listeners}
        >
            {/* hide error tooltip when dragging */}
            {file.status === 'error' && isDragging ? originNode.props.children : originNode}
        </div>
    );
};


export default function (props: ColumnProps & {
    fieldProps?: {
        uploadRequest: {
            policyGetUrl: string,
        },
        maxCount?: number,
        loadUrl: string,
    }

    uploadButton?: (fileList: UploadFile[]) => ReactNode,
    listType?: UploadListType,
    onPreview?: (file: UploadFile) => Promise<void>,
    renderUploader?: (attr: {
        dom: JSX.Element,
    }) => ReactNode
}) {

    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState<UploadFile[]>([]);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = URL.createObjectURL(file.originFileObj as RcFile);
        }

        window.open(file.url || (file.preview as string))
    };

    useEffect(() => {
        const value = props.value || props.config.value
        if (value && props.fieldProps.loadUrl) {
            http({
                url: props.fieldProps.loadUrl,
                params: {
                    ids: value
                },
                method: 'get',
            }).then(res => {
                setFileList(res.data.map((item: any) => {
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
            })

        } else {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        props.onChange && props.onChange(fileList.map(file => {
            if (file.status === 'done') {
                file.url = file.response.url || file.response.file_url
            }
            return file
        }))
    }, [fileList]);

    const uploadButton = (
        <Tooltip
            title={fileList.length >= (props.fieldProps?.maxCount || 1) ? '最多只能上传' + (props.fieldProps?.maxCount || 1) + '个文件' : ''}>
            <Button disabled={fileList.length >= (props.fieldProps?.maxCount || 1)}>上传文件</Button>
        </Tooltip>
    );

    const sensor = useSensor(PointerSensor, {
        activationConstraint: {distance: 10},
    });

    const onDragEnd = ({active, over}: DragEndEvent) => {
        if (active.id !== over?.id) {
            setFileList((prev) => {
                const activeIndex = prev.findIndex((i) => i.uid === active.id);
                const overIndex = prev.findIndex((i) => i.uid === over?.id);
                return arrayMove(prev, activeIndex, overIndex);
            });
        }
    };

    const uploader = (<Upload
        action={props.fieldProps.uploadRequest.policyGetUrl}
        listType={props.listType || 'text'}
        fileList={fileList}
        itemRender={(originNode, file) => (
            <DraggableUploadListItem originNode={originNode} file={file}/>
        )}
        onPreview={props.onPreview || handlePreview}
        onChange={({fileList}) => setFileList(fileList)}
        beforeUpload={(f, fl) => beforeUpload(f, fl, fileList)}
        customRequest={customRequest as UploadProps['customRequest']}
    >
        {props.uploadButton ? props.uploadButton(fileList) : uploadButton}
    </Upload>)

    return <>
        {props.fieldProps?.uploadRequest
            ? <>
                <Spin spinning={loading}>
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                        <SortableContext items={fileList.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
                            {props.renderUploader ? props.renderUploader({dom: uploader}) : uploader}
                        </SortableContext>
                    </DndContext>
                    {<div style={{marginBottom: '16px'}}></div>}
                </Spin>
            </>
            : <>
                <Alert message={'缺少 uploadRequest 属性'}
                       type={"error"}/>
            </>
        }
    </>
}